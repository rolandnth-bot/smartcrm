/**
 * Parse CSV file
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
          reject(new Error('A CSV fájl üres'));
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          data.push(row);
        }

        resolve(data);
      } catch (error) {
        reject(new Error(`CSV parse hiba: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Hiba a fájl olvasásakor'));
    };

    reader.readAsText(file);
  });
};

/**
 * Parse Excel file
 */
export const parseExcel = async (file) => {
  try {
    // Import xlsx library dynamically
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            reject(new Error('Az Excel fájl üres'));
            return;
          }

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Excel parse hiba: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Hiba a fájl olvasásakor'));
      };

      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    throw new Error('Az xlsx könyvtár betöltése sikertelen');
  }
};

/**
 * Parse Settlement Excel file with intelligent structure detection
 * Handles special structure with metadata, platform sections (Airbnb/Booking), and totals
 * @param {File} file - Excel file to parse
 * @param {string} sheetName - Optional sheet name to parse. If not provided, returns sheet list.
 */
export const parseSettlementExcel = async (file, sheetName = null) => {
  try {
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // If no sheet name provided, return list of sheets
          if (!sheetName) {
            resolve({
              sheets: workbook.SheetNames,
              selectedSheet: null
            });
            return;
          }

          // Get selected sheet
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            reject(new Error(`Sheet "${sheetName}" nem található`));
            return;
          }

          // Convert to RAW array format (including all rows)
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (rawData.length === 0) {
            reject(new Error('Az Excel fájl üres'));
            return;
          }

          // METADATA EXTRACTION
          let metadata = {
            period: null,
            dateOfIssue: null,
            month: null,
            year: null
          };

          // Find Period and Date of Issue in first few rows
          for (let i = 0; i < Math.min(5, rawData.length); i++) {
            const row = rawData[i];
            for (let j = 0; j < row.length; j++) {
              const cell = String(row[j]).trim();
              if (cell.toLowerCase().includes('period') && row[j + 1]) {
                metadata.period = String(row[j + 1]).trim();
                // Extract month and year from period (e.g., "2025 április")
                const periodMatch = metadata.period.match(/(\d{4})\s+(\w+)/);
                if (periodMatch) {
                  metadata.year = parseInt(periodMatch[1]);
                  const monthHu = periodMatch[2].toLowerCase();
                  const monthMap = {
                    'január': 0, 'február': 1, 'március': 2, 'április': 3,
                    'május': 4, 'június': 5, 'július': 6, 'augusztus': 7,
                    'szeptember': 8, 'október': 9, 'november': 10, 'december': 11
                  };
                  metadata.month = monthMap[monthHu] !== undefined ? monthMap[monthHu] : null;
                }
              }
              if (cell.toLowerCase().includes('date') && cell.toLowerCase().includes('issue') && row[j + 1]) {
                metadata.dateOfIssue = String(row[j + 1]).trim();
              }
            }
          }

          // PLATFORM SECTIONS DETECTION
          const sections = []; // [{platform: 'airbnb', headerRowIndex: 6, dataStartRow: 7, dataEndRow: 10}, ...]

          for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            for (let j = 0; j < row.length; j++) {
              const cell = String(row[j]).trim().toLowerCase();

              // Detect platform markers
              if (cell === 'airbnb' || cell === 'booking') {
                // Next row should be the header
                const headerRowIndex = i + 1;

                // Find where data starts (after header)
                const dataStartRow = headerRowIndex + 1;

                // Find where data ends (look for "Total" or next platform or end)
                let dataEndRow = dataStartRow;
                for (let k = dataStartRow; k < rawData.length; k++) {
                  const firstCell = String(rawData[k][0]).trim().toLowerCase();
                  if (firstCell === 'total' || firstCell === 'airbnb' || firstCell === 'booking' || firstCell === '') {
                    dataEndRow = k;
                    break;
                  }
                  dataEndRow = k + 1;
                }

                sections.push({
                  platform: cell,
                  headerRowIndex,
                  dataStartRow,
                  dataEndRow
                });
              }
            }
          }

          if (sections.length === 0) {
            reject(new Error('Nem található platform szekció (Airbnb vagy Booking)'));
            return;
          }

          // PROCESS EACH SECTION
          const allBookings = [];

          sections.forEach(section => {
            if (section.headerRowIndex >= rawData.length) return;

            // Get headers from header row
            const headers = rawData[section.headerRowIndex].map(h => String(h).trim());

            // Process data rows
            for (let i = section.dataStartRow; i < section.dataEndRow && i < rawData.length; i++) {
              const row = rawData[i];
              const firstCell = String(row[0]).trim().toLowerCase();

              // Skip Total rows and empty rows
              if (firstCell === 'total' || firstCell === '' || !row[0]) continue;

              // Create booking object
              const booking = { platform: section.platform };
              headers.forEach((header, index) => {
                if (header && row[index] !== undefined && row[index] !== '') {
                  booking[header] = row[index];
                }
              });

              allBookings.push(booking);
            }
          });

          if (allBookings.length === 0) {
            reject(new Error('Nem található foglalás adat'));
            return;
          }

          // Return structured data
          resolve({
            metadata,
            bookings: allBookings,
            headers: rawData[sections[0].headerRowIndex] // Use first section's headers
          });
        } catch (error) {
          reject(new Error(`Settlement Excel parse hiba: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Hiba a fájl olvasásakor'));
      };

      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    throw new Error('Az xlsx könyvtár betöltése sikertelen');
  }
};
