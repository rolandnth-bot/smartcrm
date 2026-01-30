import { useState, useCallback, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { parseCSV, parseExcel, parseSettlementExcel } from '../../utils/importUtils';
import useToastStore from '../../stores/toastStore';
import useBookingsStore from '../../stores/bookingsStore';

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
  const [step, setStep] = useState('upload'); // 'upload' | 'sheet' | 'mapping' | 'preview' | 'confirm'
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

        // AUTOMATIKUS OSZLOP FELISMERÉS
        const { mapping, confidence: detectedConfidence } = autoDetectColumns(extractedHeaders);
        setColumnMapping(mapping);
        setColumnConfidence(detectedConfidence);

        setStep('mapping');

        const highConfidence = Object.values(detectedConfidence).filter(c => c === 'high').length;
        const totalMapped = Object.keys(mapping).length;

        let successMessage = `${totalMapped} oszlop automatikusan felismerve! (${highConfidence} magas megbízhatósággal)`;
        if (metadata.period) {
          successMessage += ` | Időszak: ${metadata.period}`;
        }

        useToastStore.getState().success(successMessage);
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
    setIsProcessing(true);

    try {
      // Process data and calculate totals
      const processedBookings = parsedData.map((row, index) => {
        const guestName = row[headers[columnMapping.guestName]] || '';
        const guestNumber = columnMapping.guestNumber !== undefined ? Number(row[headers[columnMapping.guestNumber]]) || 1 : 1;
        const checkIn = row[headers[columnMapping.checkIn]] || '';
        const checkOut = columnMapping.checkOut !== undefined ? row[headers[columnMapping.checkOut]] || '' : '';
        const netRentFee = columnMapping.netRentFee !== undefined ? Number(row[headers[columnMapping.netRentFee]]) || 0 : 0;
        const cityTax = columnMapping.cityTax !== undefined ? Number(row[headers[columnMapping.cityTax]]) || (netRentFee * 0.04) : (netRentFee * 0.04);
        const cleaning = columnMapping.cleaning !== undefined ? Number(row[headers[columnMapping.cleaning]]) || 0 : 38; // Default 38 EUR
        const commission = columnMapping.commission !== undefined ? Number(row[headers[columnMapping.commission]]) || 0 : 0;
        const payout = columnMapping.payout !== undefined ? Number(row[headers[columnMapping.payout]]) || 0 : netRentFee - cityTax - cleaning;

        // PLATFORM FROM ROW DATA (set by parseSettlementExcel)
        const platform = row.platform || selectedPlatform || 'other';

        return {
          id: `imported-${Date.now()}-${index}`,
          guestName,
          guestNumber,
          checkIn,
          checkOut,
          netRentFee,
          cityTax,
          cleaning,
          commission,
          payout,
          platform,
          apartmentId: selectedApartment,
          month: selectedMonth,
          year: selectedYear,
          currency,
          exchangeRate
        };
      });

      // Calculate totals BY PLATFORM
      const airbnbBookings = processedBookings.filter(b => b.platform === 'airbnb');
      const bookingBookings = processedBookings.filter(b => b.platform === 'booking');

      const totalNetRentFee = processedBookings.reduce((sum, b) => sum + b.netRentFee, 0);
      const totalCityTax = processedBookings.reduce((sum, b) => sum + b.cityTax, 0);
      const totalCleaning = processedBookings.reduce((sum, b) => sum + b.cleaning, 0);
      const totalPayout = processedBookings.reduce((sum, b) => sum + b.payout, 0);
      const totalCommission = processedBookings.reduce((sum, b) => sum + b.commission, 0);

      // SMARTPROPERTIES BEVÉTEL KALKULÁCIÓ
      const airbnbNetRentFee = airbnbBookings.reduce((sum, b) => sum + b.netRentFee, 0);
      const bookingNetRentFee = bookingBookings.reduce((sum, b) => sum + b.netRentFee, 0);

      const managementAirbnb20 = airbnbNetRentFee * 0.20;
      const managementBooking20 = bookingNetRentFee * 0.20;
      const supplies = 0; // TODO: add supplies field later

      const smartPropertiesRevenue = managementAirbnb20 + managementBooking20 + totalCleaning + supplies;
      const smartPropertiesRevenueHUF = smartPropertiesRevenue * exchangeRate;

      // Partner kifizetés (Co-host Payout)
      const managementCommission = managementAirbnb20 + managementBooking20;
      const partnerPayout = totalPayout - managementCommission - totalCleaning;

      // Detect if mixed platforms
      const uniquePlatforms = [...new Set(processedBookings.map(b => b.platform))];
      const detectedPlatform = uniquePlatforms.length === 1 ? uniquePlatforms[0] : 'mixed';

      const settlementData = {
        id: `settlement-${Date.now()}`,
        apartmentId: selectedApartment,
        platform: detectedPlatform,
        month: selectedMonth,
        year: selectedYear,
        currency,
        exchangeRate,
        bookings: processedBookings,
        totals: {
          totalCommission,
          totalNetRentFee,
          totalCityTax,
          totalCleaning,
          totalPayout,
          managementAirbnb20,
          managementBooking20,
          managementCommission,
          supplies,
          smartPropertiesRevenue,
          smartPropertiesRevenueHUF,
          partnerPayout
        },
        importedAt: new Date().toISOString()
      };

      // ADD BOOKINGS TO BOOKINGS STORE
      const { addBooking } = useBookingsStore.getState();
      for (const booking of processedBookings) {
        // Calculate check-out date from check-in + nights
        const checkInDate = new Date(booking.checkIn);
        const nights = booking.checkOut ? Math.ceil((new Date(booking.checkOut) - checkInDate) / (1000 * 60 * 60 * 24)) : 1;
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + nights);

        const bookingData = {
          dateFrom: booking.checkIn,
          dateTo: checkOutDate.toISOString().split('T')[0],
          checkIn: booking.checkIn,
          checkOut: checkOutDate.toISOString().split('T')[0],
          guestName: booking.guestName,
          guestCount: booking.guestNumber,
          platform: booking.platform,
          apartmentId: booking.apartmentId,
          nights,
          payoutEur: booking.payout,
          payoutFt: booking.payout * exchangeRate,
          status: 'confirmed',
          notes: `Importálva: ${settlementData.month}/${settlementData.year}`
        };

        await addBooking(bookingData);
      }

      // Call success callback
      onImportSuccess(settlementData);
      useToastStore.getState().success(
        `${processedBookings.length} foglalás sikeresen importálva és létrehozva! Platform(ok): ${uniquePlatforms.join(', ')}`
      );
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      useToastStore.getState().error(`Import hiba: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [parsedData, headers, columnMapping, selectedApartment, selectedPlatform, selectedMonth, selectedYear, currency, exchangeRate, onImportSuccess, handleClose]);

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
