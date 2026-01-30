/**
 * Settlement Excel/CSV Parser
 * Parses partner settlement files with Airbnb/Booking sections
 */

import { normalizePeriod } from './settlementValidation';

/**
 * Parse settlement file (Excel or CSV)
 * @param {File} file - Excel (.xlsx, .xls) or CSV file
 * @returns {Promise<ParsedSettlement>} Parsed settlement data
 */
export async function parseSettlementFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return parseCSVSettlement(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelSettlement(file);
  } else {
    throw new Error('Nem támogatott fájl formátum. Csak .xlsx, .xls vagy .csv fájlokat fogadunk el.');
  }
}

/**
 * Parse Excel settlement file
 * @private
 */
async function parseExcelSettlement(file) {
  // Dynamically import xlsx library
  const XLSX = await import('xlsx');

  // Read file as array buffer
  const arrayBuffer = await readFileAsArrayBuffer(file);

  // Parse workbook with cell styles for color detection
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellStyles: true,
    cellDates: true,
    cellNF: false
  });

  // Get first worksheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) {
    throw new Error('Excel fájl üres vagy nincs munkafüzet');
  }

  // Extract data using the parsing algorithm
  return parseWorksheet(worksheet, XLSX);
}

/**
 * Parse CSV settlement file
 * @private
 */
async function parseCSVSettlement(file) {
  // For CSV, we need to parse it into a 2D array first
  const text = await readFileAsText(file);
  const rows = text.split('\n').map(row => row.split(','));

  // Convert to worksheet-like structure for compatibility
  const worksheet = createWorksheetFromRows(rows);
  const XLSX = await import('xlsx');

  return parseWorksheet(worksheet, XLSX);
}

/**
 * Parse worksheet data
 * @private
 */
function parseWorksheet(worksheet, XLSX) {
  // Step 1: Extract header info (rows 1-3)
  const headerInfo = extractHeaderInfo(worksheet);

  // Step 2: Detect sections by keywords or row colors
  const sections = detectSections(worksheet);

  // Step 3: Parse Airbnb reservations
  const airbnbData = parseReservationSection(
    worksheet,
    sections.airbnbStart,
    sections.airbnbEnd,
    'airbnb'
  );

  // Step 4: Parse Booking reservations
  const bookingData = parseReservationSection(
    worksheet,
    sections.bookingStart,
    sections.bookingEnd,
    'booking'
  );

  // Step 5: Parse Co-host payout summary
  const summary = parseCoHostSummary(worksheet, sections.summaryStart);

  // Step 6: Combine and return
  return {
    headerInfo,
    airbnbReservations: airbnbData.reservations,
    airbnbTotals: airbnbData.totals,
    airbnbManagementCommission: airbnbData.managementCommission,
    bookingReservations: bookingData.reservations,
    bookingTotals: bookingData.totals,
    bookingManagementCommission: bookingData.managementCommission,
    summary
  };
}

/**
 * Extract header information from specific cells
 * @private
 */
function extractHeaderInfo(worksheet) {
  // Period from D2
  const periodCell = worksheet['D2'];
  const period = periodCell?.v || periodCell?.w || '';

  // Issue date from D3
  const issueDateCell = worksheet['D3'];
  let issueDate = issueDateCell?.v || issueDateCell?.w || '';

  // Convert Excel date number to date string if needed
  if (typeof issueDate === 'number') {
    issueDate = excelDateToJSDate(issueDate).toISOString().split('T')[0];
  } else if (typeof issueDate === 'string') {
    // Try to parse various date formats
    issueDate = normalizeDateString(issueDate);
  }

  // IFA % from B2
  const ifaCell = worksheet['B2'];
  let ifaPercent = 20; // Default

  if (ifaCell?.v) {
    const ifaText = String(ifaCell.v).toLowerCase();
    const match = ifaText.match(/(\d+)%?/);
    if (match) {
      ifaPercent = parseInt(match[1]);
    }
  }

  return {
    period: normalizePeriod(period),
    issueDate,
    ifaPercent
  };
}

/**
 * Detect sections in the worksheet
 * @private
 */
function detectSections(worksheet) {
  const range = worksheet['!ref'];
  if (!range) {
    throw new Error('Üres munkafüzet');
  }

  const { e: endCell } = decodeRange(range);
  const maxRow = endCell.r;

  let airbnbStart = null;
  let airbnbEnd = null;
  let bookingStart = null;
  let bookingEnd = null;
  let summaryStart = null;

  // Scan rows for keywords
  for (let R = 0; R <= maxRow; R++) {
    const cellA = worksheet[encodeCellAddress(R, 0)]; // Column A
    const cellValue = (cellA?.v || cellA?.w || '').toString().toLowerCase();

    // Detect Airbnb section header
    if (cellValue.includes('airbnb') && !airbnbStart) {
      airbnbStart = R + 1; // Data starts next row
    }

    // Detect Total row after Airbnb (marks end of Airbnb section)
    if (airbnbStart && !airbnbEnd && cellValue.includes('total')) {
      airbnbEnd = R - 1;

      // Management commission is usually right after Total row
      // Skip to next non-empty section
    }

    // Detect Booking section header
    if (cellValue.includes('booking') && !bookingStart) {
      bookingStart = R + 1;
    }

    // Detect Total row after Booking
    if (bookingStart && !bookingEnd && cellValue.includes('total') && R > airbnbEnd) {
      bookingEnd = R - 1;
    }

    // Detect Co-host payout summary
    if ((cellValue.includes('co-host') || cellValue.includes('payout') ||
         cellValue.includes('total payout')) && !summaryStart) {
      summaryStart = R;
    }
  }

  // Validate that we found the required sections
  if (airbnbStart === null) {
    throw new Error('Airbnb szekció nem található az Excel fájlban');
  }

  if (bookingStart === null) {
    throw new Error('Booking szekció nem található az Excel fájlban');
  }

  return {
    airbnbStart,
    airbnbEnd: airbnbEnd || bookingStart - 2,
    bookingStart,
    bookingEnd: bookingEnd || (summaryStart ? summaryStart - 2 : maxRow),
    summaryStart: summaryStart || maxRow - 10
  };
}

/**
 * Parse reservation section (Airbnb or Booking)
 * @private
 */
function parseReservationSection(worksheet, startRow, endRow, platform) {
  const reservations = [];
  let totals = {};
  let managementCommission = 0;

  for (let R = startRow; R <= endRow; R++) {
    const row = extractRowData(worksheet, R);

    // Skip empty rows
    if (!row.guestName || row.guestName.toString().trim() === '') {
      continue;
    }

    // Check if it's a total row
    const guestNameLower = row.guestName.toString().toLowerCase();
    if (guestNameLower.includes('total') || guestNameLower.includes('összesen')) {
      totals = {
        totalNights: parseNumber(row.nights),
        totalCommission: parseNumber(row.commission),
        totalNetRentFee: parseNumber(row.netRentFee),
        totalCityTax: parseNumber(row.cityTax),
        totalCleaning: parseNumber(row.cleaning),
        totalPayout: parseNumber(row.payout)
      };
      continue;
    }

    // Regular reservation row
    reservations.push({
      guestName: row.guestName,
      bookingNumber: row.bookingNumber || '',
      checkIn: platform === 'airbnb' ? row.checkInOut : null,
      checkOut: platform === 'booking' ? row.checkInOut : null,
      nights: parseNumber(row.nights),
      commission: parseNumber(row.commission),
      netRentFee: parseNumber(row.netRentFee),
      cityTax: parseNumber(row.cityTax),
      cleaning: parseNumber(row.cleaning),
      payout: parseNumber(row.payout)
    });
  }

  // Try to find management commission row (usually right after the section)
  const mgmtRow = endRow + 2; // Skip Total row and next row
  const mgmtCell = worksheet[encodeCellAddress(mgmtRow, 5)]; // Column F
  if (mgmtCell) {
    managementCommission = parseNumber(mgmtCell.v || mgmtCell.w);
  }

  // If not found, calculate it (20% of net rent fee)
  if (!managementCommission && totals.totalNetRentFee) {
    managementCommission = totals.totalNetRentFee * 0.20;
  }

  return {
    reservations,
    totals,
    managementCommission
  };
}

/**
 * Parse co-host payout summary section
 * @private
 */
function parseCoHostSummary(worksheet, startRow) {
  const summary = {
    totalPayout: 0,
    totalCleaning: 0,
    supplies: 0,
    otherExpenses: 0,
    bankName: '',
    accountNumber: '',
    occupancyPercent: 0,
    dailyBasePrice: 0,
    profitGross: 0
  };

  // Scan next 15 rows for summary data
  for (let R = startRow; R < startRow + 15; R++) {
    const cellA = worksheet[encodeCellAddress(R, 0)];
    const cellB = worksheet[encodeCellAddress(R, 1)];
    const cellC = worksheet[encodeCellAddress(R, 2)];

    const label = (cellA?.v || cellA?.w || '').toString().toLowerCase();
    const valueB = cellB?.v || cellB?.w;
    const valueC = cellC?.v || cellC?.w;

    if (label.includes('total payout') || label.includes('összpayout')) {
      summary.totalPayout = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('cleaning') || label.includes('takarítás')) {
      summary.totalCleaning = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('supplies') || label.includes('fogyóeszköz')) {
      summary.supplies = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('other expense') || label.includes('egyéb költség')) {
      summary.otherExpenses = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('bank name') || label.includes('bank neve')) {
      summary.bankName = String(valueB || '');
    } else if (label.includes('account') || label.includes('számla')) {
      summary.accountNumber = String(valueB || '');
    } else if (label.includes('occupancy') || label.includes('kihasználtság')) {
      summary.occupancyPercent = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('daily') && label.includes('price')) {
      summary.dailyBasePrice = parseNumber(valueB) || parseNumber(valueC);
    } else if (label.includes('profit')) {
      summary.profitGross = parseNumber(valueB) || parseNumber(valueC);
    }
  }

  return summary;
}

/**
 * Extract row data (columns A-I)
 * @private
 */
function extractRowData(worksheet, rowIndex) {
  return {
    guestName: worksheet[encodeCellAddress(rowIndex, 0)]?.v || '',       // Column A
    bookingNumber: worksheet[encodeCellAddress(rowIndex, 1)]?.v || '',   // Column B
    checkInOut: worksheet[encodeCellAddress(rowIndex, 2)]?.v || '',      // Column C
    nights: worksheet[encodeCellAddress(rowIndex, 3)]?.v || 0,           // Column D
    commission: worksheet[encodeCellAddress(rowIndex, 4)]?.v || 0,       // Column E
    netRentFee: worksheet[encodeCellAddress(rowIndex, 5)]?.v || 0,       // Column F
    cityTax: worksheet[encodeCellAddress(rowIndex, 6)]?.v || 0,          // Column G
    cleaning: worksheet[encodeCellAddress(rowIndex, 7)]?.v || 0,         // Column H
    payout: worksheet[encodeCellAddress(rowIndex, 8)]?.v || 0            // Column I
  };
}

// ==========================
// HELPER FUNCTIONS
// ==========================

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Convert string to number (handle comma as decimal separator)
  const str = String(value).replace(/,/g, '.');
  const num = parseFloat(str);

  return isNaN(num) ? 0 : num;
}

function encodeCellAddress(row, col) {
  const colLetter = String.fromCharCode(65 + col); // A=65, B=66, ...
  return `${colLetter}${row + 1}`; // Excel rows are 1-indexed
}

function decodeRange(range) {
  const [start, end] = range.split(':');
  return {
    s: { r: 0, c: 0 },
    e: { r: parseInt(end.match(/\d+/)[0]) - 1, c: end.charCodeAt(0) - 65 }
  };
}

function excelDateToJSDate(excelDate) {
  // Excel dates are days since 1900-01-01 (with a bug for 1900 leap year)
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + excelDate * 86400000);
}

function normalizeDateString(dateStr) {
  // Try parsing various formats
  const formats = [
    /(\d{4})\.(\d{2})\.(\d{2})\.?/,  // 2025.01.15.
    /(\d{4})-(\d{2})-(\d{2})/,       // 2025-01-15
    /(\d{2})\/(\d{2})\/(\d{4})/,     // 01/15/2025
    /(\d{2})\.(\d{2})\.(\d{4})\.?/   // 15.01.2025.
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0] || format === formats[1]) {
        // YYYY.MM.DD or YYYY-MM-DD
        return `${match[1]}-${match[2]}-${match[3]}`;
      } else if (format === formats[2]) {
        // MM/DD/YYYY
        return `${match[3]}-${match[1]}-${match[2]}`;
      } else if (format === formats[3]) {
        // DD.MM.YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
    }
  }

  return dateStr;
}

function createWorksheetFromRows(rows) {
  const worksheet = {};

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellAddress = encodeCellAddress(rowIndex, colIndex);
      worksheet[cellAddress] = { v: cell, w: cell };
    });
  });

  const maxRow = rows.length - 1;
  const maxCol = Math.max(...rows.map(r => r.length)) - 1;
  worksheet['!ref'] = `A1:${encodeCellAddress(maxRow, maxCol)}`;

  return worksheet;
}
