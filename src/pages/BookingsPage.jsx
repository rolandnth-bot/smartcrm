import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingsStore from '../stores/bookingsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useIcalSyncStore from '../stores/icalSyncStore';
import useToastStore from '../stores/toastStore';
import { usePermissions } from '../contexts/PermissionContext';
import { validateForm, validateDate, validateDateRange, validateRequired, validateInteger, validateEmail, checkOverlappingBookings } from '../utils/validation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Calendar from '../components/common/Calendar';
import IcalSettingsModal from '../components/common/IcalSettingsModal';
import { Plus, Edit2, Trash2, X, ChevronUp, ChevronDown } from '../components/common/Icons';
import { SkeletonListItem, SkeletonStatsCard } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel, printToPDF, exportToJSON } from '../utils/exportUtils';
import api from '../services/api';
import { todayISO, formatDate, formatTimeAgo, toISODateString } from '../utils/dateUtils';
import { formatCurrencyHUF, formatCurrencyEUR } from '../utils/numberUtils';
import EmptyState, { EmptyStateWithFilter } from '../components/common/EmptyState';
import Tooltip from '../components/common/Tooltip';
import { sendTemplatedEmail, isEmailConfigured } from '../services/emailService';
import BookingsToolbar from '../components/bookings/BookingsToolbar';
import OccupancyChart from '../components/bookings/OccupancyChart';

// Platform színek és címkék (komponensen kívül, hogy ne jöjjön létre minden render során)
const platformColors = {
  airbnb: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700',
  booking: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  szallas: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  direct: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
};

const platformLabels = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  szallas: 'Szallas.hu',
  direct: 'Direkt',
  other: 'Egyéb'
};

const BookingsPage = () => {
  const navigate = useNavigate();
  const {
    bookings,
    filter,
    apartmentFilter,
    searchQuery,
    isLoading,
    error,
    showAddBooking,
    showEditBooking,
    selectedBooking,
    setFilter,
    setApartmentFilter,
    setSearchQuery,
    setShowAddBooking,
    setShowEditBooking,
    setSelectedBooking,
    setError,
    fetchFromApi,
    addBooking,
    updateBooking,
    deleteBooking,
    getFilteredBookings,
    getStats,
    seedTestBookings,
    importBookingsFromJSON,
    importBookingsFromCSV,
    previewBookingsFromJSON,
    previewBookingsFromCSV
  } = useBookingsStore();

  const { apartments, fetchFromApi: fetchApartments } = useApartmentsStore();
  const { syncApartment, getSyncStatus } = useIcalSyncStore();

  const { canEdit: canEditBookings } = usePermissions();
  const [icalSettingsApartment, setIcalSettingsApartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'dateFrom', direction: 'desc' });
  // Centralized import state
  const [importState, setImportState] = useState({
    isOpen: false,
    isDragOver: false,
    step: 'upload', // 'upload' | 'mapping' | 'preview' | 'result'
    file: null,
    fileName: null,
    fileType: null, // 'csv' | 'json'
    csvHeaders: [],
    csvSampleRows: [],
    columnMapping: {},
    preview: null, // { valid: [], invalid: [], fileType, fileName }
    errors: [],
    results: null, // { created, skipped, total }
    progress: 0,
    showOnlyInvalid: false
  });

  const [newBooking, setNewBooking] = useState({
    dateFrom: todayISO(),
    dateTo: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    apartmentId: '',
    guestName: '',
    guestEmail: '',
    guestCount: 1,
    platform: 'airbnb',
    payoutEur: '',
    payoutFt: '',
    accommodationFt: '',
    cleaningFt: '',
    ifaFt: '',
    otherFt: '',
    notes: ''
  });

  const filteredBookings = useMemo(() => {
    const filtered = getFilteredBookings();
    // Rendezés alkalmazása
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.field] || '';
      let bValue = b[sortConfig.field] || '';
      
      // Dátum rendezés
      if (sortConfig.field === 'dateFrom' || sortConfig.field === 'dateTo' || sortConfig.field === 'checkIn' || sortConfig.field === 'checkOut') {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      }
      
      // Szám rendezés
      if (sortConfig.field === 'nights' || sortConfig.field === 'guestCount' || sortConfig.field === 'totalAmount' || sortConfig.field === 'netRevenue') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      // Szöveg rendezés (case-insensitive)
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [getFilteredBookings, filter, apartmentFilter, searchQuery, bookings, sortConfig]);

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  const stats = useMemo(() => getStats(), [getStats, bookings]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Skeleton elemek (konstans, memoizálva)
  const skeletonListItems = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  useEffect(() => {
    document.title = 'Foglalások kezelése - SmartCRM';
    fetchFromApi();
    fetchApartments(); // lakásnevekhez
  }, [fetchFromApi, fetchApartments]);

  const handleViewModeList = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleViewModeCalendar = useCallback(() => {
    setViewMode('calendar');
  }, []);

  const handleOpenAddBooking = useCallback(() => {
    setShowAddBooking(true);
  }, [setShowAddBooking]);

  const handleCloseAddBooking = useCallback(() => {
    setShowAddBooking(false);
  }, [setShowAddBooking]);

  const handleCloseEditBooking = useCallback(() => {
    setShowEditBooking(false);
    setSelectedBooking(null);
  }, [setShowEditBooking, setSelectedBooking]);

  const handleClearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleFilterAll = useCallback(() => {
    setFilter('all');
  }, [setFilter]);

  const handleFilterToday = useCallback(() => {
    setFilter('today');
  }, [setFilter]);

  const handleFilterWeek = useCallback(() => {
    setFilter('week');
  }, [setFilter]);

  const handleFilterMonth = useCallback(() => {
    setFilter('month');
  }, [setFilter]);

  const handleNewBookingChange = useCallback((field, value) => {
    setNewBooking((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectedBookingChange = useCallback((field, value) => {
    if (!selectedBooking) return;
    const updates = { [field]: value };
    if (field === 'dateFrom') updates.checkIn = value;
    else if (field === 'dateTo') updates.checkOut = value;
    setSelectedBooking({ ...selectedBooking, ...updates });
  }, [selectedBooking, setSelectedBooking]);

  const handleApartmentFilterChange = useCallback((value) => {
    setApartmentFilter(value);
  }, [setApartmentFilter]);

  const handleEditBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowEditBooking(true);
  }, [setSelectedBooking, setShowEditBooking]);

  const handleAddBooking = useCallback(async () => {
    if (!newBooking.dateFrom || !newBooking.dateTo || !newBooking.apartmentId) {
      useToastStore.getState().warning('Kérjük, töltse ki az összes kötelez mezt!');
      return;
    }
    if (new Date(newBooking.dateTo) < new Date(newBooking.dateFrom)) {
      useToastStore.getState().error('A távozás dátuma nem lehet korábbi, mint az érkezés dátuma!');
      return;
    }
    // Email validáció (ha van megadva)
    if (newBooking.guestEmail && !validateEmail(newBooking.guestEmail)) {
      useToastStore.getState().error('Érvényes email cím szükséges');
      return;
    }
    // Átfed foglalások ellenrzése
    const overlapCheck = checkOverlappingBookings(
      newBooking.dateFrom,
      newBooking.dateTo,
      newBooking.apartmentId,
      bookings
    );
    if (overlapCheck.hasOverlap) {
      const overlappingNames = overlapCheck.overlappingBookings
        .map((b) => b.guestName || 'Vendég')
        .join(', ');
      useToastStore.getState().error(
        `Átfed foglalás! A kiválasztott idszakban már van foglalás ugyanazon a lakáson (${overlappingNames}).`
      );
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addBooking(newBooking);
      
      // Email küldése, ha van vendég email (és email service be van állítva)
      if (newBooking.guestEmail && isEmailConfigured()) {
        try {
          await sendTemplatedEmail('booking-confirmation', {
            guestName: newBooking.guestName || 'Vendég',
            checkIn: formatDate(newBooking.dateFrom),
            checkOut: formatDate(newBooking.dateTo)
          }, {
            to: newBooking.guestEmail,
            subject: 'Foglalás megersítése'
          });
          useToastStore.getState().success('Megersít email elküldve a vendégnek.');
        } catch (emailError) {
          if (import.meta.env.DEV) {
            console.error('Hiba a megersít email küldésekor:', emailError);
          }
          useToastStore.getState().error('Hiba a megersít email küldésekor.');
        }
      }
      
      setNewBooking({
        dateFrom: todayISO(),
        dateTo: '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        apartmentId: '',
        guestName: '',
        guestEmail: '',
        guestCount: 1,
        platform: 'airbnb',
        payoutEur: '',
        payoutFt: '',
        accommodationFt: '',
        cleaningFt: '',
        ifaFt: '',
        otherFt: '',
        notes: ''
      });
      setShowAddBooking(false);
    } catch (e) {
      // Hibaüzenet már kezelve a store-ban, de ha nincs, akkor általános üzenet
      if (!error) {
        useToastStore.getState().error('Hiba a foglalás hozzáadásakor. Kérjük, próbálja újra.');
      }
      if (import.meta.env.DEV) {
        console.error('Hiba a foglalás hozzáadásakor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [newBooking, addBooking, isSubmitting, setShowAddBooking, bookings]);

  const handleEditBooking = useCallback(async () => {
    if (!selectedBooking || isSubmitting) return;

    // Validáció
    const validation = validateForm(selectedBooking, {
      dateFrom: ['required', 'date'],
      dateTo: ['required', 'date'],
      apartmentId: ['required'],
      guestCount: ['required', 'integer', { type: 'min', value: 1 }]
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    // Dátum tartomány validáció
    const dateFrom = selectedBooking.dateFrom || selectedBooking.checkIn;
    const dateTo = selectedBooking.dateTo || selectedBooking.checkOut;
    if (!validateDateRange(dateFrom, dateTo)) {
      useToastStore.getState().error('A távozás dátuma nem lehet korábbi, mint az érkezés dátuma!');
      return;
    }
    // Email validáció (ha van megadva)
    if (selectedBooking.guestEmail && !validateEmail(selectedBooking.guestEmail)) {
      useToastStore.getState().error('Érvényes email cím szükséges');
      return;
    }
    // Átfed foglalások ellenrzése (kizárva a jelenleg szerkesztett foglalást)
    const overlapCheck = checkOverlappingBookings(
      dateFrom,
      dateTo,
      selectedBooking.apartmentId,
      bookings,
      selectedBooking.id
    );
    if (overlapCheck.hasOverlap) {
      const overlappingNames = overlapCheck.overlappingBookings
        .map((b) => b.guestName || 'Vendég')
        .join(', ');
      useToastStore.getState().error(
        `Átfed foglalás! A kiválasztott idszakban már van foglalás ugyanazon a lakáson (${overlappingNames}).`
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await updateBooking(selectedBooking.id, selectedBooking);
      setShowEditBooking(false);
      setSelectedBooking(null);
    } catch (e) {
      // Hibaüzenet már kezelve a store-ban, de ha nincs, akkor általános üzenet
      if (!error) {
        useToastStore.getState().error('Hiba a foglalás módosításakor. Kérjük, próbálja újra.');
      }
      if (import.meta.env.DEV) {
        console.error('Hiba a foglalás módosításakor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBooking, isSubmitting, updateBooking, setShowEditBooking, setSelectedBooking, error, bookings]);

  const handleDeleteBooking = useCallback((id) => {
    const booking = bookings.find((b) => b.id === id);
    setDeleteConfirm({
      id,
      message: `Biztosan törölni szeretnéd a foglalást${booking?.guestName ? ` (${booking.guestName})` : ''}?`
    });
  }, [bookings]);

  const handleToggleBookingSelection = useCallback((bookingId) => {
    setSelectedBookings((prev) => {
      if (prev.includes(bookingId)) {
        return prev.filter((id) => id !== bookingId);
      }
      return [...prev, bookingId];
    });
  }, []);

  const handleSelectAllBookings = useCallback(() => {
    setSelectedBookings((prev) => {
      const allIds = filteredBookings.map((b) => b.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }, [filteredBookings]);

  const handleBulkDelete = useCallback(() => {
    if (selectedBookings.length === 0) return;
    setBulkDeleteConfirm(true);
  }, [selectedBookings.length]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedBookings.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedBookings.map((id) => deleteBooking(id))
      );
      useToastStore.getState().success(`${selectedBookings.length} foglalás törölve.`);
      setSelectedBookings([]);
      setBulkDeleteConfirm(false);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk törléskor:', e);
      }
      useToastStore.getState().error('Hiba a törléskor.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBookings, deleteBooking]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteBooking(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (_) {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteBooking]);

  const getApartmentName = useCallback((apartmentId) => {
    const apt = apartments.find((a) => a.id === apartmentId || a.id === parseInt(apartmentId));
    return apt?.name || `Lakás #${apartmentId}`;
  }, [apartments]);

  const bookingExportColumns = useMemo(() => [
    { key: 'guestName', label: 'Vendég' },
    { key: 'apartmentName', label: 'Lakás' },
    { key: 'dateFrom', label: 'Érkezés' },
    { key: 'dateTo', label: 'Távozás' },
    { key: 'nights', label: 'Éjszakák' },
    { key: 'platform', label: 'Platform' },
    { key: 'payoutEur', label: 'Bevétel (EUR)' },
    { key: 'payoutFt', label: 'Bevétel (Ft)' },
    { key: 'notes', label: 'Megjegyzés' }
  ], []);

  const getExportData = useCallback(() => {
    const bookingsToExport = selectedBookings.length > 0
      ? filteredBookings.filter((b) => selectedBookings.includes(b.id))
      : filteredBookings;
    return bookingsToExport.map((b) => ({
      ...b,
      apartmentName: getApartmentName(b.apartmentId),
      dateFrom: (b.dateFrom || b.checkIn) ? new Date(b.dateFrom || b.checkIn).toLocaleDateString('hu-HU') : '',
      dateTo: (b.dateTo || b.checkOut) ? new Date(b.dateTo || b.checkOut).toLocaleDateString('hu-HU') : '',
      payoutFt: b.payoutFt != null ? b.payoutFt : ''
    }));
  }, [filteredBookings, selectedBookings, getApartmentName]);

  const handleExportCSV = useCallback(() => {
    const rows = getExportData();
    const filename = selectedBookings.length > 0
      ? `foglalasok_kivalasztott_${new Date().toISOString().split('T')[0]}.csv`
      : `foglalasok_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(rows, bookingExportColumns, filename);
    if (selectedBookings.length > 0) {
      useToastStore.getState().success(`${selectedBookings.length} kiválasztott foglalás exportálva CSV formátumban.`);
    }
  }, [getExportData, selectedBookings, bookingExportColumns]);

  const handleExportExcel = useCallback(() => {
    const rows = getExportData();
    const filename = selectedBookings.length > 0
      ? `foglalasok_kivalasztott_${new Date().toISOString().split('T')[0]}.xlsx`
      : `foglalasok_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(rows, bookingExportColumns, filename);
    if (selectedBookings.length > 0) {
      useToastStore.getState().success(`${selectedBookings.length} kiválasztott foglalás exportálva Excel formátumban.`);
    }
  }, [getExportData, selectedBookings, bookingExportColumns]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM  Foglalások');
  }, []);

  const handleOpenBookingImport = useCallback(() => {
    setImportState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const handleToolbarImport = useCallback((type) => {
    if (type === 'ical') {
      navigate('/apartments');
      return;
    }
    handleOpenBookingImport();
  }, [handleOpenBookingImport, navigate]);

  const handleToolbarExport = useCallback((type) => {
    if (type === 'csv') {
      handleExportCSV();
    } else if (type === 'excel') {
      handleExportExcel();
    } else if (type === 'pdf') {
      handlePrintPDF();
    } else if (type === 'ical') {
      navigate('/apartments');
    }
  }, [handleExportCSV, handleExportExcel, handlePrintPDF, navigate]);

  const handleCloseBookingImport = useCallback(() => {
    setImportState({
      isOpen: false,
      isDragOver: false,
      step: 'upload',
      file: null,
      fileName: null,
      fileType: null,
      csvHeaders: [],
      csvSampleRows: [],
      columnMapping: {},
      preview: null,
      errors: [],
      results: null,
      progress: 0,
      showOnlyInvalid: false
    });
  }, []);

  const handleFilePreview = useCallback((file) => {
    if (!file) return;

    const fileType = file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.json') ? 'json' : null;
    if (!fileType) {
      useToastStore.getState().error('Csak CSV vagy JSON fájlok támogatottak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let preview;
      if (fileType === 'csv') {
        preview = previewBookingsFromCSV(content);
        // CSV esetén mapping lépésre lépünk
        const lines = content.split('\n').filter((line) => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map((h) => h.trim());
          const sampleRows = lines.slice(1, 6).map((line, idx) => ({
            rowIndex: idx + 1,
            values: line.split(',').map((v) => v.trim())
          }));
          setImportState((prev) => ({
            ...prev,
            file,
            fileName: file.name,
            fileType,
            csvHeaders: headers,
            csvSampleRows: sampleRows,
            step: 'mapping'
          }));
          return;
        }
      } else {
        preview = previewBookingsFromJSON(content);
      }
      setImportState((prev) => ({
        ...prev,
        file,
        fileName: file.name,
        fileType,
        preview: { ...preview, fileType, fileName: file.name },
        step: 'preview'
      }));
    };
    reader.onerror = () => {
      useToastStore.getState().error('Hiba a fájl olvasása során.');
    };
    reader.readAsText(file);
  }, [previewBookingsFromCSV, previewBookingsFromJSON]);

  const handleFileImport = useCallback(async () => {
    if (!importState.preview || importState.preview.valid.length === 0) {
      useToastStore.getState().error('Nincs érvényes foglalás az importáláshoz.');
      return;
    }

    setIsSubmitting(true);
    setImportState((prev) => ({ ...prev, progress: 0 }));
    
    try {
      // Csak az érvényes sorokat importáljuk
      const validBookings = importState.preview.valid;
      const total = validBookings.length;
      
      // Progress bar szimuláció nagy fájloknál
      const progressInterval = setInterval(() => {
        setImportState((prev) => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      let result;
      
      if (importState.preview.fileType === 'csv') {
        // CSV esetén újra kell parse-olni csak az érvényes sorokat
        // Egyszersített megoldás: JSON formátumban importáljuk az érvényes sorokat
        const jsonData = JSON.stringify(validBookings);
        result = await importBookingsFromJSON(jsonData);
      } else {
        const jsonData = JSON.stringify(validBookings);
        result = await importBookingsFromJSON(jsonData);
      }

      clearInterval(progressInterval);
      setImportState((prev) => ({ ...prev, progress: 100 }));

      if (result.success) {
        setImportState((prev) => ({
          ...prev,
          results: {
            created: result.count,
            skipped: prev.preview.invalid.length,
            total: prev.preview.valid.length + prev.preview.invalid.length
          },
          step: 'result'
        }));
        await fetchFromApi();
      } else {
        useToastStore.getState().error(`Hiba az importálás során: ${result.error}`);
        setIsSubmitting(false);
        setImportState((prev) => ({ ...prev, progress: 0 }));
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a foglalások importálásakor:', e);
      }
      useToastStore.getState().error('Hiba a foglalások importálásakor. Kérjük, próbálja újra.');
      setIsSubmitting(false);
      setImportState((prev) => ({ ...prev, progress: 0 }));
    }
  }, [importState.preview, importBookingsFromCSV, importBookingsFromJSON, fetchFromApi]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setImportState((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setImportState((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setImportState((prev) => ({ ...prev, isDragOver: false }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilePreview(files[0]);
    }
  }, [handleFilePreview]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold dark:text-gray-200">Foglalások kezelése</h2>
        <div className="no-print">
          <BookingsToolbar
            view={viewMode}
            setView={setViewMode}
            onImport={handleToolbarImport}
            onExport={handleToolbarExport}
            onNewBooking={handleOpenAddBooking}
            canEdit={canEditBookings('bookings')}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200" role="alert" aria-live="polite">
          <span>{error}</span>
          <Button onClick={handleClearError} variant="ghost" size="sm" aria-label="Hibaüzenet bezárása">
            <X />
          </Button>
        </div>
      )}

      {isLoading && bookings.length === 0 ? (
        <div aria-live="polite" aria-busy="true">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </div>
          <div className="space-y-2">
            {skeletonListItems.map((i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
      {/* Statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Összes foglalás</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ma érkez</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ebben a hónapban</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrencyHUF(stats.thisMonthRevenue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Havi bevétel</div>
          </div>
        </Card>
      </div>

      {/* Foglalónaptár - felül, iCal beállításokkal */}
      <Card>
        <Calendar
          onApartmentClick={(apt) => setIcalSettingsApartment(apt)}
          onBookingClick={(booking) => handleEditBookingClick(booking)}
        />
      </Card>

      {/* Foglaltságjelz diagram */}
      <OccupancyChart bookings={bookings} apartments={apartments} />

      {/* Szrk */}
      <Card>
        <div className="space-y-3">
          {/* Keres mez */}
          <div>
            <label htmlFor="booking-search" className="sr-only">Keresés foglalások között</label>
            <input
              id="booking-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés vendég név, lakás, platform vagy megjegyzés alapján..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Keresés foglalások között"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Foglalások szrése">
            <select
              value={apartmentFilter}
              onChange={(e) => handleApartmentFilterChange(e.target.value)}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Lakás szerinti szrés"
            >
              <option value="">Összes lakás</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name}
                </option>
              ))}
            </select>
            <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterAll}
            aria-pressed={filter === 'all'}
            aria-label="Szrés: Minden foglalás"
          >
            Mind
          </Button>
          <Button
            variant={filter === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterToday}
            aria-pressed={filter === 'today'}
            aria-label="Szrés: Ma érkez foglalások"
          >
            Ma
          </Button>
          <Button
            variant={filter === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterWeek}
            aria-pressed={filter === 'week'}
            aria-label="Szrés: Heti foglalások"
          >
            Hét
          </Button>
          <Button
            variant={filter === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterMonth}
            aria-pressed={filter === 'month'}
            aria-label="Szrés: Havi foglalások"
          >
            Hónap
          </Button>
          </div>
        </div>
      </Card>

      {/* Foglalások lista nézet */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Foglalások ({filteredBookings.length})</h3>
            {canEditBookings('bookings') && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectAllBookings}
                  variant="ghost"
                  size="sm"
                  aria-label={selectedBookings.length === filteredBookings.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
                >
                  {selectedBookings.length === filteredBookings.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
                </Button>
              </div>
            )}
          </div>
          {selectedBookings.length > 0 && canEditBookings('bookings') && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {selectedBookings.length} foglalás kiválasztva
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkDelete}
                    variant="danger"
                    size="sm"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Törlés
                  </Button>
                  <Button
                    onClick={() => setSelectedBookings([])}
                    variant="ghost"
                    size="sm"
                  >
                    Kijelölés törlése
                  </Button>
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    title="Kiválasztott foglalások exportálása CSV formátumban"
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {filteredBookings.length > 0 && (
            <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rendezés:
              </span>
              <div className="flex gap-2 flex-wrap">
                <Tooltip content={`Rendezés érkezési dátum szerint ${sortConfig.field === 'dateFrom' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}>
                  <button
                    onClick={() => handleSort('dateFrom')}
                    className={`px-3 py-1 text-xs rounded border transition ${
                      sortConfig.field === 'dateFrom'
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rendezés érkezési dátum szerint ${sortConfig.field === 'dateFrom' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                  >
                    Érkezés {sortConfig.field === 'dateFrom' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                  </button>
                </Tooltip>
                <Tooltip content={`Rendezés vendég név szerint ${sortConfig.field === 'guestName' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}>
                  <button
                    onClick={() => handleSort('guestName')}
                    className={`px-3 py-1 text-xs rounded border transition ${
                      sortConfig.field === 'guestName'
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rendezés vendég név szerint ${sortConfig.field === 'guestName' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                  >
                    Vendég {sortConfig.field === 'guestName' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                  </button>
                </Tooltip>
                <Tooltip content={`Rendezés platform szerint ${sortConfig.field === 'platform' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}>
                  <button
                    onClick={() => handleSort('platform')}
                    className={`px-3 py-1 text-xs rounded border transition ${
                      sortConfig.field === 'platform'
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rendezés platform szerint ${sortConfig.field === 'platform' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                  >
                    Platform {sortConfig.field === 'platform' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                  </button>
                </Tooltip>
                <Tooltip content={`Rendezés összeg szerint ${sortConfig.field === 'totalAmount' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}>
                  <button
                    onClick={() => handleSort('totalAmount')}
                    className={`px-3 py-1 text-xs rounded border transition ${
                      sortConfig.field === 'totalAmount'
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Rendezés összeg szerint ${sortConfig.field === 'totalAmount' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                  >
                    Összeg {sortConfig.field === 'totalAmount' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-xl transition-shadow">
              <div className="flex gap-2 items-start">
                {canEditBookings('bookings') && (
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleToggleBookingSelection(booking.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    aria-label={`Foglalás kijelölése: ${booking.guestName || booking.apartmentName}`}
                  />
                )}
                <div className="flex-1 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded text-sm font-bold border ${platformColors[booking.platform] || platformColors.other}`}>
                        {platformLabels[booking.platform] || booking.platform}
                      </span>
                      <span className="font-bold text-lg">{booking.guestName || 'Vendég'}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.guestCount} vendég
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lakás:</span>{' '}
                        <span className="font-medium dark:text-gray-200">{getApartmentName(booking.apartmentId)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Érkezés:</span>{' '}
                        <span className="font-medium">
                          {new Date(booking.dateFrom || booking.checkIn).toLocaleDateString('hu-HU')} {booking.checkInTime ?? '15:00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Távozás:</span>{' '}
                        <span className="font-medium dark:text-gray-200">
                          {new Date(booking.dateTo || booking.checkOut).toLocaleDateString('hu-HU')} {booking.checkOutTime ?? '11:00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Éjszakák:</span>{' '}
                        <span className="font-medium dark:text-gray-200">{booking.nights || 1}</span>
                      </div>
                    </div>
                    {(booking.payoutEur || booking.payoutFt) && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Bevétel:</span>{' '}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {booking.payoutEur ? formatCurrencyEUR(booking.payoutEur) : ''}
                          {booking.payoutFt ? ` / ${formatCurrencyHUF(booking.payoutFt)}` : ''}
                        </span>
                      </div>
                    )}
                    {booking.notes && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-2">{booking.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                  {canEditBookings('bookings') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBookingClick(booking)}
                        aria-label={`Foglalás szerkesztése: ${booking.guestName || booking.apartmentId}`}
                      >
                        <Edit2 />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        aria-label={`Foglalás törlése: ${booking.guestName || booking.apartmentId}`}
                      >
                        <Trash2 />
                      </Button>
                    </>
                  )}
                </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-400" role="status" aria-live="polite">
            {filter !== 'all' || apartmentFilter || searchQuery ? (
              <EmptyStateWithFilter
                title="Nincsenek foglalások"
                description="A kiválasztott szrkkel nem található foglalás. Próbáld meg módosítani a szrket vagy keresési feltételeket."
                onClearFilter={() => {
                  setFilter('all');
                  setApartmentFilter('');
                  setSearchQuery('');
                }}
              />
            ) : (
              <EmptyState
                icon={Plus}
                title="Még nincsenek foglalások"
                description="Kezdj el foglalásokat hozzáadni a vendégek kezeléséhez."
                actionLabel="Új foglalás hozzáadása"
                onAction={canEditBookings('bookings') ? handleOpenAddBooking : undefined}
              />
            )}
          </div>
        </Card>
      )}
        </>
      )}

      {/* Új foglalás modal - csak ha van edit jogosultság */}
      {canEditBookings('bookings') && (
        <Modal
          isOpen={showAddBooking}
          onClose={handleCloseAddBooking}
          title="Új foglalás hozzáadása"
          size="md"
        >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddBooking();
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              handleAddBooking();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              handleCloseAddBooking();
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-booking-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lakás *</label>
              <select
                id="new-booking-apartment"
                value={newBooking.apartmentId}
                onChange={(e) => handleNewBookingChange('apartmentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                aria-required="true"
              >
                <option value="">Válassz lakást</option>
                {apartments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-booking-platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
              <select
                id="new-booking-platform"
                value={newBooking.platform}
                onChange={(e) => handleNewBookingChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="szallas">Szallas.hu</option>
                <option value="direct">Direkt</option>
                <option value="other">Egyéb</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-booking-dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Érkezés *</label>
              <input
                id="new-booking-dateFrom"
                type="date"
                value={newBooking.dateFrom}
                onChange={(e) => handleNewBookingChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                aria-required="true"
              />
              <input
                type="time"
                value={newBooking.checkInTime || '15:00'}
                onChange={(e) => handleNewBookingChange('checkInTime', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Érkezés ideje"
              />
            </div>
            <div>
              <label htmlFor="new-booking-dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Távozás *</label>
              <input
                id="new-booking-dateTo"
                type="date"
                value={newBooking.dateTo}
                onChange={(e) => handleNewBookingChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                aria-required="true"
              />
              <input
                type="time"
                value={newBooking.checkOutTime || '11:00'}
                onChange={(e) => handleNewBookingChange('checkOutTime', e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Távozás ideje"
              />
            </div>
            <div>
              <label htmlFor="new-booking-guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendég neve</label>
              <input
                id="new-booking-guestName"
                type="text"
                value={newBooking.guestName}
                onChange={(e) => handleNewBookingChange('guestName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Vendég neve"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="new-booking-guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendég email</label>
              <input
                id="new-booking-guestEmail"
                type="email"
                value={newBooking.guestEmail}
                onChange={(e) => handleNewBookingChange('guestEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="vendeg@example.com"
                autoComplete="email"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isEmailConfigured() ? 'Megersít email küldése automatikus' : 'Email service nincs beállítva'}
              </p>
            </div>
            <div>
              <label htmlFor="new-booking-guestCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendégek száma</label>
              <input
                id="new-booking-guestCount"
                type="number"
                value={newBooking.guestCount}
                onChange={(e) => handleNewBookingChange('guestCount', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="new-booking-payoutEur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bevétel (EUR)</label>
              <input
                id="new-booking-payoutEur"
                type="number"
                value={newBooking.payoutEur}
                onChange={(e) => handleNewBookingChange('payoutEur', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="new-booking-payoutFt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bevétel (Ft)</label>
              <input
                id="new-booking-payoutFt"
                type="number"
                value={newBooking.payoutFt}
                onChange={(e) => handleNewBookingChange('payoutFt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div className="col-span-2 border-t dark:border-gray-600 pt-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bevétel bontás (opcionális)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="new-booking-accommodationFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Szállásdíj (Ft)</label>
                  <input
                    id="new-booking-accommodationFt"
                    type="number"
                    value={newBooking.accommodationFt}
                    onChange={(e) => handleNewBookingChange('accommodationFt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="new-booking-cleaningFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Takarítás (Ft)</label>
                  <input
                    id="new-booking-cleaningFt"
                    type="number"
                    value={newBooking.cleaningFt}
                    onChange={(e) => handleNewBookingChange('cleaningFt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="new-booking-ifaFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ifa (Ft)</label>
                  <input
                    id="new-booking-ifaFt"
                    type="number"
                    value={newBooking.ifaFt}
                    onChange={(e) => handleNewBookingChange('ifaFt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="new-booking-otherFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Egyéb (Ft)</label>
                  <input
                    id="new-booking-otherFt"
                    type="number"
                    value={newBooking.otherFt}
                    onChange={(e) => handleNewBookingChange('otherFt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="new-booking-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
            <textarea
              id="new-booking-notes"
              value={newBooking.notes}
              onChange={(e) => handleNewBookingChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="További információk..."
              aria-label="Foglalás megjegyzése"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit"
              variant="success" 
              className="flex-1"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Mentés
            </Button>
            <Button type="button" onClick={handleCloseAddBooking} variant="secondary">
              Mégse
            </Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Szerkesztés modal - csak ha van edit jogosultság */}
      {canEditBookings('bookings') && (
      <Modal
        isOpen={showEditBooking}
        onClose={() => {
          setShowEditBooking(false);
          setSelectedBooking(null);
        }}
        title="Foglalás szerkesztése"
        size="md"
      >
        {selectedBooking && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditBooking();
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleEditBooking();
              }
            }}
            className="space-y-4"
          >
            {/* Platform színes fejléc  ugyanaz, mint naptárban kattintáskor */}
            <div
              className={`p-4 rounded-lg text-white ${
                selectedBooking.platform === 'airbnb' ? 'bg-pink-500' :
                selectedBooking.platform === 'booking' ? 'bg-blue-500' :
                selectedBooking.platform === 'szallas' ? 'bg-red-500' :
                selectedBooking.platform === 'direct' ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              <p className="text-xs opacity-90 mb-1">Vendég · Lakás</p>
              <p className="font-bold text-lg">{selectedBooking.guestName || 'Vendég'}</p>
              <p className="opacity-90">{getApartmentName(selectedBooking.apartmentId)}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-booking-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lakás *</label>
                <select
                  id="edit-booking-apartment"
                  value={selectedBooking.apartmentId || ''}
                  onChange={(e) => handleSelectedBookingChange('apartmentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                >
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-booking-platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                <select
                  id="edit-booking-platform"
                  value={selectedBooking.platform || 'airbnb'}
                  onChange={(e) => handleSelectedBookingChange('platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="airbnb">Airbnb</option>
                  <option value="booking">Booking.com</option>
                  <option value="szallas">Szallas.hu</option>
                  <option value="direct">Direkt</option>
                  <option value="other">Egyéb</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-booking-dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Érkezés *</label>
                <input
                  id="edit-booking-dateFrom"
                  type="date"
                  value={toISODateString(selectedBooking.dateFrom || selectedBooking.checkIn) || ''}
                  onChange={(e) => handleSelectedBookingChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                />
                <input
                  type="time"
                  value={selectedBooking.checkInTime ?? '15:00'}
                  onChange={(e) => handleSelectedBookingChange('checkInTime', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                  aria-label="Érkezés ideje"
                />
              </div>
              <div>
                <label htmlFor="edit-booking-dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Távozás *</label>
                <input
                  id="edit-booking-dateTo"
                  type="date"
                  value={toISODateString(selectedBooking.dateTo || selectedBooking.checkOut) || ''}
                  onChange={(e) => handleSelectedBookingChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                />
                <input
                  type="time"
                  value={selectedBooking.checkOutTime ?? '11:00'}
                  onChange={(e) => handleSelectedBookingChange('checkOutTime', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                  aria-label="Távozás ideje"
                />
              </div>
              <div>
                <label htmlFor="edit-booking-guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendég neve</label>
                <input
                  id="edit-booking-guestName"
                  type="text"
                  value={selectedBooking.guestName || ''}
                  onChange={(e) => handleSelectedBookingChange('guestName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="edit-booking-guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendég email</label>
                <input
                  id="edit-booking-guestEmail"
                  type="email"
                  value={selectedBooking.guestEmail || ''}
                  onChange={(e) => handleSelectedBookingChange('guestEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="vendeg@example.com"
                  autoComplete="email"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isEmailConfigured() ? 'Megersít email küldése automatikus' : 'Email service nincs beállítva'}
                </p>
              </div>
              <div>
                <label htmlFor="edit-booking-guestCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendégek száma</label>
                <input
                  id="edit-booking-guestCount"
                  type="number"
                  value={selectedBooking.guestCount || 1}
                  onChange={(e) => handleSelectedBookingChange('guestCount', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="edit-booking-payoutFt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bevétel (Ft)</label>
                <input
                  id="edit-booking-payoutFt"
                  type="number"
                  value={selectedBooking.payoutFt ?? ''}
                  onChange={(e) => handleSelectedBookingChange('payoutFt', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="edit-booking-payoutEur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bevétel (EUR)</label>
                <input
                  id="edit-booking-payoutEur"
                  type="number"
                  value={selectedBooking.payoutEur ?? ''}
                  onChange={(e) => handleSelectedBookingChange('payoutEur', e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <hr className="border-gray-200 dark:border-gray-600" aria-hidden="true" />
            <div className="border-t dark:border-gray-600 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="opacity-70" aria-hidden="true"><Edit2 /></span>
                Bevétel bontás <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(szerkeszthet)</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="edit-booking-accommodationFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Szállásdíj (Ft)</label>
                  <input
                    id="edit-booking-accommodationFt"
                    type="number"
                    value={selectedBooking.accommodationFt ?? ''}
                    onChange={(e) => handleSelectedBookingChange('accommodationFt', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="edit-booking-cleaningFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Takarítás (Ft)</label>
                  <input
                    id="edit-booking-cleaningFt"
                    type="number"
                    value={selectedBooking.cleaningFt ?? ''}
                    onChange={(e) => handleSelectedBookingChange('cleaningFt', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="edit-booking-ifaFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ifa (Ft)</label>
                  <input
                    id="edit-booking-ifaFt"
                    type="number"
                    value={selectedBooking.ifaFt ?? ''}
                    onChange={(e) => handleSelectedBookingChange('ifaFt', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="edit-booking-otherFt" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Egyéb (Ft)</label>
                  <input
                    id="edit-booking-otherFt"
                    type="number"
                    value={selectedBooking.otherFt ?? ''}
                    onChange={(e) => handleSelectedBookingChange('otherFt', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-t dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">Bevétel (összesen)</div>
                <div className="font-bold text-green-600 dark:text-green-400">
                  {(() => {
                    const sum = [selectedBooking.accommodationFt, selectedBooking.cleaningFt, selectedBooking.ifaFt, selectedBooking.otherFt]
                      .filter((v) => v != null && v !== '')
                      .reduce((s, v) => s + (Number(v) || 0), 0);
                    const total = sum > 0 ? sum : (selectedBooking.payoutFt != null ? Number(selectedBooking.payoutFt) : 0);
                    if (total > 0) return formatCurrencyHUF(total);
                    if (selectedBooking.payoutEur != null && selectedBooking.payoutEur !== '') return `${selectedBooking.payoutEur} EUR`;
                    return '';
                  })()}
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="edit-booking-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
                <textarea
                  id="edit-booking-notes"
                  value={selectedBooking.notes || ''}
                  onChange={(e) => handleSelectedBookingChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  aria-label="Foglalás megjegyzése"
                />
              </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit"
                variant="primary" 
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Mentés
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteBooking(selectedBooking.id)}
                variant="danger"
              >
                Törlés
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowEditBooking(false);
                  setSelectedBooking(null);
                }}
                variant="secondary"
              >
                Mégse
              </Button>
            </div>
          </form>
        )}
      </Modal>
      )}

      {/* iCal beállítások modal  foglalások naptárból, lakás nevére kattintva */}
      <IcalSettingsModal
        apartment={icalSettingsApartment}
        isOpen={!!icalSettingsApartment}
        onClose={() => setIcalSettingsApartment(null)}
      />

      {/* Import modal - csak ha van edit jogosultság */}
      {canEditBookings('bookings') && (
        <Modal
          isOpen={importState.isOpen}
          onClose={handleCloseBookingImport}
          title="Foglalások importálása"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Importálj foglalásokat CSV vagy JSON fájlból. Húzd ide a fájlt, vagy kattints a kiválasztás gombra.
            </p>
            
            {/* Drag & Drop terület */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                importState.isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="space-y-2">
                <div className="text-4xl"></div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {importState.isDragOver ? 'Engedd el a fájlt itt' : 'Húzd ide a fájlt vagy kattints a kiválasztás gombra'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV vagy JSON fájlok támogatottak
                </p>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Fájl kiválasztása
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFilePreview(file);
                        }
                      }}
                      className="hidden"
                      aria-label="Fájl kiválasztása foglalás importhoz"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="import-csv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vagy válassz CSV fájlt
                </label>
                <input
                  id="import-csv"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFilePreview(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="CSV fájl kiválasztása foglalás importhoz"
                />
              </div>

              <div>
                <label htmlFor="import-json" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vagy válassz JSON fájlt
                </label>
                <input
                  id="import-json"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFilePreview(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="JSON fájl kiválasztása foglalás importhoz"
                />
              </div>
            </div>

            {/* Oszlop mapping UI (CSV esetén) */}
            {importState.step === 'mapping' && importState.csvHeaders.length > 0 && (
              <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Oszlop mapping</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                     = Automatikusan felismert
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A rendszer automatikusan felismerte az oszlopokat. Ellenrizd és módosítsd szükség esetén.
                  </p>
                </div>

                {/* Mapping táblázat */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Mez</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">CSV oszlop</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Státusz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { key: 'apartmentId', label: 'Lakás ID' },
                        { key: 'apartmentName', label: 'Lakás név' },
                        { key: 'guestName', label: 'Vendég név' },
                        { key: 'guestEmail', label: 'Vendég email' },
                        { key: 'dateFrom', label: 'Érkezés dátum' },
                        { key: 'dateTo', label: 'Távozás dátum' },
                        { key: 'platform', label: 'Platform' },
                        { key: 'guestCount', label: 'Vendégek száma' },
                        { key: 'payoutFt', label: 'Bevétel (Ft)' },
                        { key: 'notes', label: 'Megjegyzés' }
                      ].map((field) => {
                        const mappedIndex = importState.columnMapping[field.key];
                        const isAutoDetected = mappedIndex !== undefined;
                        return (
                          <tr key={field.key} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{field.label}</td>
                            <td className="px-3 py-2">
                              <select
                                value={mappedIndex !== undefined ? mappedIndex : ''}
                                onChange={(e) => {
                                  const newMapping = { ...importState.columnMapping };
                                  if (e.target.value === '') {
                                    delete newMapping[field.key];
                                  } else {
                                    newMapping[field.key] = parseInt(e.target.value);
                                  }
                                  setImportState((prev) => ({ ...prev, columnMapping: newMapping }));
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">-- Nincs kiválasztva --</option>
                                {importState.csvHeaders.map((header, idx) => (
                                  <option key={idx} value={idx}>
                                    {header} (oszlop {idx + 1})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              {isAutoDetected && (
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                  <span></span> Auto-detect
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Minta adat preview (els 3-5 sor) */}
                {importState.csvSampleRows.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Minta adatok (els {importState.csvSampleRows.length} sor)
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">Sor</th>
                            {importState.csvHeaders.map((header, idx) => (
                              <th key={idx} className="px-2 py-1 text-left text-gray-700 dark:text-gray-300">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {importState.csvSampleRows.map((row) => (
                            <tr key={row.rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-2 py-1 text-gray-600 dark:text-gray-400 font-medium">{row.rowIndex}</td>
                              {row.values.map((value, idx) => {
                                const isMapped = Object.values(importState.columnMapping).includes(idx);
                                return (
                                  <td
                                    key={idx}
                                    className={`px-2 py-1 text-gray-800 dark:text-gray-200 ${
                                      isMapped ? 'bg-green-50 dark:bg-green-900' : ''
                                    }`}
                                  >
                                    {value || <span className="text-gray-400">-</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Zöld háttér = Mapelt oszlop
                    </p>
                  </div>
                )}

                {/* Továbblépés gombok */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={async () => {
                      // CSV újraparse-olása a mapping alapján
                      // Jelenleg a previewBookingsFromCSV automatikusan felismeri az oszlopokat
                      // A teljes implementációhoz újra kellene parse-olni a fájlt a mapping alapján
                      // Most csak továbblépünk az elnézethez
                      setImportState((prev) => ({ ...prev, step: 'preview' }));
                    }}
                    variant="primary"
                    className="flex-1"
                  >
                    Tovább az elnézethez
                  </Button>
                  <Button
                    onClick={handleCloseBookingImport}
                    variant="secondary"
                  >
                    Mégse
                  </Button>
                </div>
              </div>
            )}

            {/* Elnézet táblázat */}
            {importState.step === 'preview' && importState.preview && (
              <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Elnézet</h3>
                  <div className="flex gap-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                       Érvényes: {importState.preview.valid.length}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                       Hibás: {importState.preview.invalid.length}
                    </span>
                  </div>
                </div>

                {/* Szr gombok */}
                {importState.preview.invalid.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant={importState.showOnlyInvalid ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setImportState((prev) => ({ ...prev, showOnlyInvalid: !prev.showOnlyInvalid }))}
                      aria-pressed={importState.showOnlyInvalid}
                    >
                      {importState.showOnlyInvalid ? 'Összes sor' : 'Csak hibásak'}
                    </Button>
                  </div>
                )}

                {/* Hibás sorok táblázata */}
                {importState.preview.invalid.length > 0 && (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Sor</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Vendég</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Lakás</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Dátumok</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Hibák</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importState.preview.invalid.map((row, idx) => (
                          <tr
                            key={idx}
                            className="bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-700"
                          >
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.rowIndex}</td>
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.guestName || '-'}</td>
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.apartmentId || row.apartmentName || '-'}</td>
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                              {row.dateFrom ? formatDate(row.dateFrom) : '-'} - {row.dateTo ? formatDate(row.dateTo) : '-'}
                            </td>
                            <td className="px-3 py-2">
                              <Tooltip content={row.errors.join(', ')}>
                                <span className="text-red-600 dark:text-red-400 text-xs cursor-help">
                                  {row.errors.length} hiba
                                </span>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {importState.preview.valid.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2"> {importState.preview.valid.length} érvényes foglalás készen áll az importálásra.</p>
                  </div>
                )}

                {/* Progress bar */}
                {isSubmitting && importState.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Importálás folyamatban...</span>
                      <span>{importState.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importState.progress}%` }}
                        role="progressbar"
                        aria-valuenow={importState.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Importálás elrehaladása"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleFileImport}
                    variant="primary"
                    className="flex-1"
                    loading={isSubmitting}
                    disabled={isSubmitting || importState.preview.valid.length === 0}
                  >
                    Importálás ({importState.preview.valid.length} foglalás)
                  </Button>
                  <Button
                    onClick={() => {
                      setImportState((prev) => ({
                        ...prev,
                        preview: null,
                        step: 'upload',
                        showOnlyInvalid: false
                      }));
                    }}
                    variant="secondary"
                    disabled={isSubmitting}
                  >
                    Mégse
                  </Button>
                </div>
              </div>
            )}


            {importState.step === 'upload' && (
              <div className="pt-4 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>CSV formátum:</strong> apartment_id, guest_name, check_in, check_out, platform, guest_count, payout, notes<br />
                  <strong>JSON formátum:</strong> Array of booking objects with fields: apartmentId, guestName, dateFrom, dateTo, platform, guestCount, payoutFt, notes
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Törlés megersítés - csak ha van edit jogosultság */}
      {canEditBookings('bookings') && (
        <>
          <ConfirmDialog
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Foglalás törlése"
            message={deleteConfirm?.message || 'Biztosan törölni szeretnéd ezt a foglalást?'}
            confirmText="Igen, törlés"
            cancelText="Mégse"
            variant="danger"
          />
          <ConfirmDialog
            isOpen={bulkDeleteConfirm}
            onClose={() => setBulkDeleteConfirm(false)}
            onConfirm={confirmBulkDelete}
            title="Foglalások törlése"
            message={`Biztosan törölni szeretnéd a ${selectedBookings.length} kiválasztott foglalást?`}
            variant="danger"
          />
        </>
      )}
    </div>
  );
};

export default BookingsPage;

