import { useState, useCallback, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { parseCSV, parseExcel, parseSettlementExcel } from '../../utils/importUtils';
import useToastStore from '../../stores/toastStore';
import useBookingsStore from '../../stores/bookingsStore';
import useSettlementsStore from '../../stores/settlementsStore';

// Oszlop nevek és leírások
const COLUMN_MAP = {
  guestName: { label: 'Guest Name', description: 'Vendég neve' },
  guestNumber: { label: 'Guest Number', description: 'Vendégek száma' },
  checkIn: { label: 'Check In', description: 'Bejelentkezés (YYYY-MM-DD vagy MM.DD.)' },
  checkOut: { label: 'Check Out / Nights', description: 'Kijelentkezés vagy Éjszakák' },
  commission: { label: 'Platform Commission', description: 'Platform jutalék' },
  netRentFee: { label: 'Net Rent Fee', description: 'Nettó bérleti díj' },
  cityTax: { label: 'City Tax', description: 'IFA (4%)' },
  cleaning: { label: 'Cleaning', description: 'Takarítási díj' },
  payout: { label: 'Payout', description: 'Végső kifizetés' }
};

// Automatikus oszlop felismerés kulcsszavak alapján
const AUTO_DETECT_PATTERNS = {
  guestName: ['guest name', 'vendég', 'név', 'name'],
  guestNumber: ['guest number', 'vendégek', 'fő', 'guests', 'number'],
  checkIn: ['check in', 'check-in', 'érkezés', 'arrival', 'checkin'],
  checkOut: ['check out', 'check-out', 'nights', 'éjszakák', 'távozás', 'departure', 'checkout'],
  commission: ['commission', 'jutalék', 'fee'],
  netRentFee: ['net rent', 'nettó', 'rent fee', 'bérleti'],
  cityTax: ['city tax', 'ifa', 'adó', 'tax'],
  cleaning: ['cleaning', 'takarítás', 'clean'],
  payout: ['payout', 'kifizetés', 'payment', 'paid']
};

/**
 * Összesítés számítása (bookings, totals, partner payout, SmartProperties revenue)
 * @param {Array} bookings - Parsed bookings from Excel
 * @param {Array} headers - Column headers
 * @param {Object} mapping - Column mapping
 * @param {Object} metadata - Metadata (period, date of issue)
 * @returns {Object} Summary data
 */
function calculateSummary(bookings, headers, mapping, metadata) {
  // Group by platform
  const airbnbBookings = bookings.filter(b => b.platform === 'airbnb');
  const bookingBookings = bookings.filter(b => b.platform === 'booking');

  // Helper to extract value from booking
  const getValue = (booking, field) => {
    const header = headers[mapping[field]];
    if (!header || !booking[header]) return 0;
    const value = booking[header];
    return typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '.')) || 0;
  };

  // Process each booking
  const processedBookings = bookings.map(booking => {
    const guestName = booking[headers[mapping.guestName]] || '';
    const checkIn = booking[headers[mapping.checkIn]] || '';
    const nights = getValue(booking, 'checkOut') || 1;
    const netRentFee = getValue(booking, 'netRentFee');
    const cityTax = getValue(booking, 'cityTax') || (netRentFee * 0.04);
    const cleaning = getValue(booking, 'cleaning') || 38;
    const payout = getValue(booking, 'payout') || (netRentFee + cityTax);

    return {
      platform: booking.platform,
      guestName,
      checkIn,
      nights,
      netRentFee,
      cityTax,
      cleaning,
      payout
    };
  });

  // Calculate AIRBNB totals
  const airbnbProcessed = processedBookings.filter(b => b.platform === 'airbnb');
  const airbnbNetRent = airbnbProcessed.reduce((sum, b) => sum + b.netRentFee, 0);
  const airbnbCityTax = airbnbProcessed.reduce((sum, b) => sum + b.cityTax, 0);
  const airbnbCleaning = airbnbProcessed.reduce((sum, b) => sum + b.cleaning, 0);
  const airbnbPayout = airbnbProcessed.reduce((sum, b) => sum + b.payout, 0);

  // Calculate BOOKING totals
  const bookingProcessed = processedBookings.filter(b => b.platform === 'booking');
  const bookingNetRent = bookingProcessed.reduce((sum, b) => sum + b.netRentFee, 0);
  const bookingCityTax = bookingProcessed.reduce((sum, b) => sum + b.cityTax, 0);
  const bookingCleaning = bookingProcessed.reduce((sum, b) => sum + b.cleaning, 0);
  const bookingPayout = bookingProcessed.reduce((sum, b) => sum + b.payout, 0);

  // TOTAL payout
  const totalPayout = airbnbPayout + bookingPayout;

  // SMARTPROPERTIES BEVÉTEL
  const managementAirbnb = airbnbNetRent * 0.20;
  const managementBooking = bookingNetRent * 0.20;
  const totalManagement = managementAirbnb + managementBooking;
  const totalCleaningFee = airbnbCleaning + bookingCleaning;
  const supplies = 30; // Default supplies (can be edited later)
  const smartPropertiesRevenue = totalManagement + totalCleaningFee + supplies;
  const smartPropertiesRevenueHUF = smartPropertiesRevenue * 410; // Default 410 HUF/EUR

  // PARTNER PAYOUT (Co-host)
  const coHostPayout = totalPayout;
  const coHostPayoutHUF = coHostPayout * 410;

  return {
    metadata,
    airbnbBookings: airbnbProcessed,
    bookingBookings: bookingProcessed,
    airbnbTotals: {
      netRent: airbnbNetRent,
      cityTax: airbnbCityTax,
      cleaning: airbnbCleaning,
      payout: airbnbPayout
    },
    bookingTotals: {
      netRent: bookingNetRent,
      cityTax: bookingCityTax,
      cleaning: bookingCleaning,
      payout: bookingPayout
    },
    financialSummary: {
      airbnbNetRent,
      bookingNetRent,
      totalCityTax: airbnbCityTax + bookingCityTax,
      totalCleaning: totalCleaningFee,
      totalPayout
    },
    coHostPayout: {
      totalEUR: coHostPayout,
      totalHUF: coHostPayoutHUF
    },
    smartPropertiesRevenue: {
      managementAirbnb,
      managementBooking,
      cleaningFee: totalCleaningFee,
      supplies,
      totalEUR: smartPropertiesRevenue,
      totalHUF: smartPropertiesRevenueHUF
    }
  };
}

/**
 * Automatikus oszlop felismerés fejléc alapján
 * @param {Array<string>} headers - Oszlop fejlécek
 * @returns {Object} - {mapping, confidence} ahol mapping = {guestName: 0, ...}, confidence = {guestName: 'high', ...}
 */
function autoDetectColumns(headers) {
  const mapping = {};
  const confidence = {};

  // __EMPTY oszlopok kiszűrése
  const validHeaders = headers.map((h, idx) => ({ name: h, index: idx }))
    .filter(h => !h.name.startsWith('__EMPTY'));

  // 1. NÉV ALAPÚ FELISMERÉS (case-insensitive)
  Object.keys(AUTO_DETECT_PATTERNS).forEach(field => {
    const patterns = AUTO_DETECT_PATTERNS[field];

    for (let i = 0; i < validHeaders.length; i++) {
      const header = validHeaders[i].name.toLowerCase();

      // Teljes egyezés vagy részstring match
      const matchFound = patterns.some(pattern =>
        header.includes(pattern.toLowerCase())
      );

      if (matchFound) {
        mapping[field] = validHeaders[i].index;
        confidence[field] = 'high';
        break;
      }
    }
  });

  // 2. POZÍCIÓ ALAPÚ FELISMERÉS (ha nincs név alapú match)
  // A, B, C, D, E, F, G, H, I oszlopok = 0, 1, 2, 3, 4, 5, 6, 7, 8
  const positionMapping = [
    'guestName',      // A oszlop (0)
    'guestNumber',    // B oszlop (1)
    'checkIn',        // C oszlop (2)
    'checkOut',       // D oszlop (3)
    'commission',     // E oszlop (4)
    'netRentFee',     // F oszlop (5)
    'cityTax',        // G oszlop (6)
    'cleaning',       // H oszlop (7)
    'payout'          // I oszlop (8)
  ];

  positionMapping.forEach((field, index) => {
    if (mapping[field] === undefined && index < validHeaders.length) {
      mapping[field] = validHeaders[index].index;
      confidence[field] = 'medium';
    }
  });

  return { mapping, confidence };
}

const SettlementImportModal = ({ isOpen, onClose, onImportSuccess, apartments }) => {
  const [step, setStep] = useState('upload'); // 'upload' | 'sheet' | 'summary'
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState(null); // 'csv' | 'excel' | 'json'
  const [isDragOver, setIsDragOver] = useState(false);
  const [availableSheets, setAvailableSheets] = useState([]); // Excel sheet names
  const [selectedSheet, setSelectedSheet] = useState(''); // Selected sheet name
  const [parsedData, setParsedData] = useState([]); // Parsed rows from file
  const [headers, setHeaders] = useState([]); // Column headers
  const [columnMapping, setColumnMapping] = useState({}); // {guestName: 0, checkIn: 2, ...}
  const [columnConfidence, setColumnConfidence] = useState({}); // {guestName: 'high', checkIn: 'medium', ...}
  const [selectedApartment, setSelectedApartment] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('airbnb'); // 'airbnb' | 'booking'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState(410);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryData, setSummaryData] = useState(null); // Calculated summary for display

  const fileInputRef = useRef(null);

  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setFileName('');
    setFileType(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({});
    setColumnConfidence({});
    setSelectedApartment('');
    setSelectedPlatform('airbnb');
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear());
    setCurrency('EUR');
    setExchangeRate(410);
    setIsProcessing(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    setFileName(selectedFile.name);
    setFile(selectedFile);

    // Detect file type
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    let detectedType = null;

    if (extension === 'csv') {
      detectedType = 'csv';
    } else if (extension === 'xlsx' || extension === 'xls') {
      detectedType = 'excel';
    } else if (extension === 'json') {
      detectedType = 'json';
    }

    setFileType(detectedType);
    setIsProcessing(true);

    try {
      if (detectedType === 'excel') {
        // STEP 1: Get sheet list
        const sheetList = await parseSettlementExcel(selectedFile);
        setAvailableSheets(sheetList.sheets);

        if (sheetList.sheets.length === 1) {
          // Auto-select if only one sheet
          setSelectedSheet(sheetList.sheets[0]);
          // Continue to parsing
          await handleSheetSelect(selectedFile, sheetList.sheets[0]);
        } else {
          // Multiple sheets - show sheet selection
          setStep('sheet');
          useToastStore.getState().success(`${sheetList.sheets.length} sheet talált. Válassz egyet!`);
        }
      } else {
        // CSV or JSON - process directly
        let data = [];
        let extractedHeaders = [];

        if (detectedType === 'csv') {
          data = await parseCSV(selectedFile);
          const firstRow = data[0];
          extractedHeaders = Object.keys(firstRow);
        } else if (detectedType === 'json') {
          const text = await selectedFile.text();
          data = JSON.parse(text);
          const firstRow = data[0];
          extractedHeaders = Object.keys(firstRow);
        }

        if (data && data.length > 0) {
          setHeaders(extractedHeaders);
          setParsedData(data);

          // AUTOMATIKUS OSZLOP FELISMERÉS
          const { mapping, confidence: detectedConfidence } = autoDetectColumns(extractedHeaders);
          setColumnMapping(mapping);
          setColumnConfidence(detectedConfidence);

          setStep('mapping');

          const highConfidence = Object.values(detectedConfidence).filter(c => c === 'high').length;
          const totalMapped = Object.keys(mapping).length;

          useToastStore.getState().success(
            `${totalMapped} oszlop automatikusan felismerve! (${highConfidence} magas megbízhatósággal)`
          );
        } else {
          useToastStore.getState().error('A fájl üres vagy nincs adat benne.');
        }
      }
    } catch (error) {
      console.error('File parsing error:', error);
      useToastStore.getState().error(`Fájl feldolgozási hiba: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSheetSelect = useCallback(async (selectedFile, sheetName) => {
    setIsProcessing(true);
    try {
      // STEP 2: Parse selected sheet
      const parsed = await parseSettlementExcel(selectedFile, sheetName);
      const data = parsed.bookings;
      const extractedHeaders = parsed.headers.map(h => String(h).trim()).filter(h => h && !h.startsWith('__EMPTY'));
      const metadata = parsed.metadata;

      // PARSE YEAR/MONTH FROM SHEET NAME (e.g., "2026 Január" → year=2026, month=0)
      const sheetMatch = sheetName.match(/(\d{4})\s+(\w+)/);
      if (sheetMatch) {
        const year = parseInt(sheetMatch[1]);
        const monthHu = sheetMatch[2].toLowerCase();
        const monthMap = {
          'január': 0, 'február': 1, 'március': 2, 'április': 3,
          'május': 4, 'június': 5, 'július': 6, 'augusztus': 7,
          'szeptember': 8, 'október': 9, 'november': 10, 'december': 11
        };
        if (monthMap[monthHu] !== undefined) {
          setSelectedMonth(String(monthMap[monthHu]));
          setSelectedYear(year);
        }
      }

      // AUTO-FILL METADATA IF AVAILABLE (fallback)
      if (!sheetMatch && metadata.month !== null && metadata.month !== undefined) {
        setSelectedMonth(String(metadata.month));
      }
      if (!sheetMatch && metadata.year) {
        setSelectedYear(metadata.year);
      }

      if (data && data.length > 0) {
        setHeaders(extractedHeaders);
        setParsedData(data);

        // AUTOMATIKUS OSZLOP FELISMERÉS (háttérben, nem kérdezzük a felhasználót)
        const { mapping, confidence: detectedConfidence } = autoDetectColumns(extractedHeaders);
        setColumnMapping(mapping);
        setColumnConfidence(detectedConfidence);

        // AUTOMATIKUS ÖSSZESÍTÉS SZÁMÍTÁSA
        const summary = calculateSummary(data, extractedHeaders, mapping, metadata);
        setSummaryData(summary);

        // UGRÁS AZ ÖSSZESÍTŐ NÉZETRE (mapping lépés kihagyása!)
        setStep('summary');

        useToastStore.getState().success(
          `${data.length} foglalás feldolgozva | ${summary.airbnbBookings.length} Airbnb + ${summary.bookingBookings.length} Booking`
        );
      } else {
        useToastStore.getState().error('A fájl üres vagy nincs adat benne.');
      }
    } catch (error) {
      console.error('Sheet parsing error:', error);
      useToastStore.getState().error(`Sheet feldolgozási hiba: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleMappingNext = useCallback(() => {
    // Validate that all required columns are mapped
    const requiredFields = ['guestName', 'checkIn', 'netRentFee'];
    const missingFields = requiredFields.filter(field => columnMapping[field] === undefined);

    if (missingFields.length > 0) {
      useToastStore.getState().error(`Hiányzó oszlopok: ${missingFields.map(f => COLUMN_MAP[f].label).join(', ')}`);
      return;
    }

    if (!selectedApartment) {
      useToastStore.getState().error('Kérjük, válasszon lakást!');
      return;
    }

    if (!selectedMonth) {
      useToastStore.getState().error('Kérjük, válasszon hónapot!');
      return;
    }

    setStep('preview');
  }, [columnMapping, selectedApartment, selectedMonth]);

  const handleConfirmImport = useCallback(async () => {
    if (!selectedApartment) {
      useToastStore.getState().error('Kérjük, válassz lakást!');
      return;
    }

    if (!summaryData) {
      useToastStore.getState().error('Nincs feldolgozott adat!');
      return;
    }

    setIsProcessing(true);

    try {
      // Combine all bookings from summary
      const allBookings = [...summaryData.airbnbBookings, ...summaryData.bookingBookings];

      // Apartment details
      const apartment = apartments?.find(a => a.id === selectedApartment);
      const apartmentName = apartment?.name || 'Ismeretlen lakás';
      const partnerName = apartment?.owner || 'Partner';

      // Period string (YYYY-MM format)
      const period = `${selectedYear}-${String(parseInt(selectedMonth) + 1).padStart(2, '0')}`;

      // Settlement data structure for store
      const settlementData = {
        id: `settlement-${Date.now()}`,
        apartmentId: selectedApartment,
        apartmentName,
        partnerName,
        period,
        year: selectedYear,
        month: selectedMonth,
        currency,
        exchangeRate,
        platform: allBookings.length > 0 ? (summaryData.airbnbBookings.length > 0 && summaryData.bookingBookings.length > 0 ? 'mixed' : (summaryData.airbnbBookings.length > 0 ? 'airbnb' : 'booking')) : 'other',
        airbnbReservations: summaryData.airbnbBookings,
        bookingReservations: summaryData.bookingBookings,
        summary: {
          totalPayout: summaryData.financialSummary.totalPayout,
          totalCityTax: summaryData.financialSummary.totalCityTax,
          totalCleaning: summaryData.financialSummary.totalCleaning,
          totalManagementCommission: summaryData.smartPropertiesRevenue.managementAirbnb + summaryData.smartPropertiesRevenue.managementBooking,
          coHostPayout: summaryData.coHostPayout.totalEUR,
          smartPropertiesRevenue: summaryData.smartPropertiesRevenue.totalEUR,
          smartPropertiesRevenueHUF: summaryData.smartPropertiesRevenue.totalHUF
        },
        status: 'draft',
        sourceFileName: fileName,
        importedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Save to settlements store
      const { addSettlement } = useSettlementsStore.getState();
      addSettlement(settlementData);

      // ADD BOOKINGS TO BOOKINGS STORE
      const { addBooking } = useBookingsStore.getState();
      for (const booking of allBookings) {
        // Parse check-in date
        let checkInDate;
        try {
          // Try parsing MM.DD. format (e.g., "01.01.")
          const parts = booking.checkIn.split('.');
          if (parts.length >= 2) {
            const month = parseInt(parts[0]);
            const day = parseInt(parts[1]);
            checkInDate = new Date(selectedYear, month - 1, day);
          } else {
            checkInDate = new Date(booking.checkIn);
          }
        } catch (e) {
          checkInDate = new Date();
        }

        const nights = booking.nights || 1;
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + nights);

        const bookingData = {
          dateFrom: checkInDate.toISOString().split('T')[0],
          dateTo: checkOutDate.toISOString().split('T')[0],
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          guestName: booking.guestName,
          guestCount: 1,
          platform: booking.platform,
          apartmentId: selectedApartment,
          nights,
          payoutEur: booking.payout,
          payoutFt: booking.payout * exchangeRate,
          status: 'confirmed',
          notes: `Importálva: ${period} | Elszámolás ID: ${settlementData.id}`
        };

        await addBooking(bookingData);
      }

      // Call success callback
      if (onImportSuccess) {
        onImportSuccess(settlementData);
      }

      useToastStore.getState().success(
        `Elszámolás sikeresen mentve! ${allBookings.length} foglalás létrehozva (${summaryData.airbnbBookings.length} Airbnb + ${summaryData.bookingBookings.length} Booking)`
      );
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      useToastStore.getState().error(`Import hiba: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [summaryData, selectedApartment, selectedMonth, selectedYear, currency, exchangeRate, apartments, fileName, onImportSuccess, handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Elszámolás importálása"
      size="xl"
    >
      <div className="space-y-6">
        {/* Step Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="space-y-4">
                <div className="text-6xl">📄</div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Húzd ide a fájlt vagy kattints a tallózáshoz
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Támogatott formátumok: Excel (.xlsx, .xls), CSV, JSON
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".xlsx,.xls,.csv,.json"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                >
                  Fájl tallózása
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="text-center text-gray-600 dark:text-gray-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Fájl feldolgozása...</p>
              </div>
            )}
          </div>
        )}

        {/* Step Sheet Selection */}
        {step === 'sheet' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Fájl: {fileName}</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">{availableSheets.length} sheet talált</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Válassz sheet-et <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
              >
                <option value="">Válassz sheet-et...</option>
                {availableSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep('upload')} variant="outline">
                Vissza
              </Button>
              <Button
                onClick={() => {
                  if (!selectedSheet) {
                    useToastStore.getState().error('Kérjük, válassz sheet-et!');
                    return;
                  }
                  handleSheetSelect(file, selectedSheet);
                }}
                variant="primary"
                className="flex-1"
                disabled={!selectedSheet}
              >
                Tovább
              </Button>
            </div>
          </div>
        )}

        {/* Step Summary - ÖSSZESÍTŐ NÉZET */}
        {step === 'summary' && summaryData && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">ELSZÁMOLÁS ÖSSZESÍTŐ</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-semibold">Lakás:</span> {apartments?.find(a => a.id === selectedApartment)?.name || 'Válassz lakást'}
                </div>
                <div>
                  <span className="font-semibold">Időszak:</span> {selectedYear} {['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'][selectedMonth] || '?'}
                </div>
              </div>
            </div>

            {/* Lakás választó (ha még nincs kiválasztva) */}
            {!selectedApartment && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Válassz lakást <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedApartment}
                  onChange={(e) => setSelectedApartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                >
                  <option value="">Válassz lakást...</option>
                  {apartments?.map(apt => (
                    <option key={apt.id} value={apt.id}>{apt.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* FOGLALÁSOK TÁBLÁZAT */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                📊 FOGLALÁSOK
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Platform</th>
                      <th className="px-3 py-2 text-left font-semibold">Vendég</th>
                      <th className="px-3 py-2 text-left font-semibold">Check-in</th>
                      <th className="px-3 py-2 text-right font-semibold">Éjszakák</th>
                      <th className="px-3 py-2 text-right font-semibold">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Airbnb bookings */}
                    {summaryData.airbnbBookings.map((booking, idx) => (
                      <tr key={`airbnb-${idx}`} className="bg-pink-50 dark:bg-pink-900/20 border-b border-pink-100 dark:border-pink-800">
                        <td className="px-3 py-2">
                          <span className="inline-block bg-pink-500 text-white text-xs px-2 py-0.5 rounded font-semibold">Airbnb</span>
                        </td>
                        <td className="px-3 py-2">{booking.guestName}</td>
                        <td className="px-3 py-2">{booking.checkIn}</td>
                        <td className="px-3 py-2 text-right">{booking.nights}</td>
                        <td className="px-3 py-2 text-right font-semibold">€{booking.payout.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Booking.com bookings */}
                    {summaryData.bookingBookings.map((booking, idx) => (
                      <tr key={`booking-${idx}`} className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <td className="px-3 py-2">
                          <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold">Booking</span>
                        </td>
                        <td className="px-3 py-2">{booking.guestName}</td>
                        <td className="px-3 py-2">{booking.checkIn}</td>
                        <td className="px-3 py-2 text-right">{booking.nights}</td>
                        <td className="px-3 py-2 text-right font-semibold">€{booking.payout.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PÉNZÜGYI ÖSSZESÍTÉS */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                💰 PÉNZÜGYI ÖSSZESÍTÉS
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Airbnb Net Rent</span>
                  <span className="font-semibold">€{summaryData.financialSummary.airbnbNetRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Booking Net Rent</span>
                  <span className="font-semibold">€{summaryData.financialSummary.bookingNetRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">City Tax (IFA)</span>
                  <span className="font-semibold">€{summaryData.financialSummary.totalCityTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Cleaning összesen</span>
                  <span className="font-semibold">€{summaryData.financialSummary.totalCleaning.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-blue-500 col-span-2 pt-2">
                  <span className="font-bold text-lg">Total Payout</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">€{summaryData.financialSummary.totalPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* PARTNER KIFIZETÉS (Co-host) */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-300 dark:border-orange-700 p-4">
              <h4 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                👤 PARTNER KIFIZETÉS (Co-host)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between py-2">
                  <span className="font-medium text-orange-900 dark:text-orange-200">Total Payout</span>
                  <span className="font-bold text-orange-900 dark:text-orange-200">€{summaryData.coHostPayout.totalEUR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium text-orange-900 dark:text-orange-200">Forintban</span>
                  <span className="font-bold text-orange-900 dark:text-orange-200">{Math.round(summaryData.coHostPayout.totalHUF).toLocaleString()} Ft</span>
                </div>
              </div>
            </div>

            {/* SMARTPROPERTIES BEVÉTEL */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-400 dark:border-green-600 p-4">
              <h4 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                ★ SMARTPROPERTIES BEVÉTEL
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                  <span className="font-medium text-green-900 dark:text-green-200">Management Airbnb 20%</span>
                  <span className="font-semibold text-green-900 dark:text-green-200">€{summaryData.smartPropertiesRevenue.managementAirbnb.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                  <span className="font-medium text-green-900 dark:text-green-200">Management Booking 20%</span>
                  <span className="font-semibold text-green-900 dark:text-green-200">€{summaryData.smartPropertiesRevenue.managementBooking.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                  <span className="font-medium text-green-900 dark:text-green-200">Cleaning díj</span>
                  <span className="font-semibold text-green-900 dark:text-green-200">€{summaryData.smartPropertiesRevenue.cleaningFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                  <span className="font-medium text-green-900 dark:text-green-200">Supplies</span>
                  <span className="font-semibold text-green-900 dark:text-green-200">€{summaryData.smartPropertiesRevenue.supplies.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-green-500 pt-3">
                  <span className="font-bold text-lg text-green-900 dark:text-green-200">ÖSSZESEN</span>
                  <span className="font-bold text-lg text-green-700 dark:text-green-400">€{summaryData.smartPropertiesRevenue.totalEUR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 bg-green-100 dark:bg-green-800/30 rounded px-3">
                  <span className="font-bold text-green-900 dark:text-green-200">Forintban (410 Ft/€)</span>
                  <span className="font-bold text-lg text-green-700 dark:text-green-400">{Math.round(summaryData.smartPropertiesRevenue.totalHUF).toLocaleString()} Ft</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4 border-t-2 border-gray-300 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              <Button onClick={() => setStep('sheet')} variant="outline">
                Vissza
              </Button>
              <Button
                onClick={handleConfirmImport}
                variant="primary"
                className="flex-1"
                disabled={!selectedApartment || isProcessing}
              >
                {isProcessing ? 'Mentés...' : 'Mentés'}
              </Button>
              <Button variant="outline" disabled={!selectedApartment}>
                PDF Export
              </Button>
              <Button variant="outline" disabled={!selectedApartment}>
                Email partnernek
              </Button>
              <Button onClick={handleClose} variant="ghost">
                Mégse
              </Button>
            </div>
          </div>
        )}

        {/* Step Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Fájl: {fileName}</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">{parsedData.length} sor importálva</p>
            </div>

            {/* Sheet info display */}
            {selectedSheet && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <span className="font-semibold">Sheet:</span> {selectedSheet} |
                  <span className="font-semibold ml-2">Hónap:</span> {['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'][selectedMonth] || '?'} |
                  <span className="font-semibold ml-2">Év:</span> {selectedYear}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Lakás <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedApartment}
                  onChange={(e) => setSelectedApartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                >
                  <option value="">Válassz lakást...</option>
                  {apartments?.map(apt => (
                    <option key={apt.id} value={apt.id}>{apt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pénznem
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                >
                  <option value="EUR">EUR</option>
                  <option value="HUF">HUF</option>
                </select>
              </div>

              {currency === 'EUR' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Átváltási árfolyam (1 EUR = ? HUF)
                  </label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Oszlop hozzárendelés</h4>
              <div className="space-y-3">
                {Object.keys(COLUMN_MAP).map((field) => (
                  <div key={field} className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <span>
                          {COLUMN_MAP[field].label}
                          {(['guestName', 'checkIn', 'netRentFee'].includes(field)) && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                        {columnConfidence[field] === 'high' && (
                          <span className="text-green-600 dark:text-green-400" title="Automatikusan felismert (magas bizonyosság)">✓</span>
                        )}
                        {columnConfidence[field] === 'medium' && (
                          <span className="text-yellow-600 dark:text-yellow-400" title="Pozíció alapján felismert (közepes bizonyosság)">!</span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{COLUMN_MAP[field].description}</p>
                    </div>
                    <select
                      value={columnMapping[field] !== undefined ? columnMapping[field] : ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        setColumnMapping(prev => ({ ...prev, [field]: value }));
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                    >
                      <option value="">-- Nincs hozzárendelve --</option>
                      {headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep('upload')} variant="outline">
                Vissza
              </Button>
              <Button onClick={handleMappingNext} variant="primary" className="flex-1">
                Tovább az előnézethez
              </Button>
            </div>
          </div>
        )}

        {/* Step Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Előnézet</h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                {parsedData.length} foglalás importálásra kész
              </p>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left">Vendég</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left">Check-in</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">Net Rent</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">City Tax</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">Cleaning</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((row, index) => {
                    const guestName = row[headers[columnMapping.guestName]] || '-';
                    const checkIn = row[headers[columnMapping.checkIn]] || '-';
                    const netRentFee = columnMapping.netRentFee !== undefined ? Number(row[headers[columnMapping.netRentFee]]) || 0 : 0;
                    const cityTax = columnMapping.cityTax !== undefined ? Number(row[headers[columnMapping.cityTax]]) || (netRentFee * 0.04) : (netRentFee * 0.04);
                    const cleaning = columnMapping.cleaning !== undefined ? Number(row[headers[columnMapping.cleaning]]) || 0 : 38;
                    const payout = columnMapping.payout !== undefined ? Number(row[headers[columnMapping.payout]]) || 0 : netRentFee - cityTax - cleaning;

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">{guestName}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">{checkIn}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">{netRentFee.toFixed(2)}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">{cityTax.toFixed(2)}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right">{cleaning.toFixed(2)}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-right font-semibold">{payout.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {parsedData.length > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                ...és még {parsedData.length - 10} sor
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep('mapping')} variant="outline">
                Vissza
              </Button>
              <Button
                onClick={handleConfirmImport}
                variant="primary"
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Importálás...' : 'Import megerősítése'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SettlementImportModal;
