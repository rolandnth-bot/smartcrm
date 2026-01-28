import { useState, useEffect, useCallback, useMemo } from 'react';
import useCleaningsStore from '../stores/cleaningsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useBookingsStore from '../stores/bookingsStore';
import useToastStore from '../stores/toastStore';
import { usePermissions } from '../contexts/PermissionContext';
import { validateForm, validateDate } from '../utils/validation';
import { usersList, workersList, cleaningsGenerateFromBookings, workerFromApi, settingsGet } from '../services/api';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, X, ChevronUp, ChevronDown, RefreshCw } from '../components/common/Icons';
import { SkeletonListItem, SkeletonStatsCard } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';
import { contains } from '../utils/stringUtils';
import EmptyState, { EmptyStateWithFilter } from '../components/common/EmptyState';
import Tooltip from '../components/common/Tooltip';

const DEFAULT_CLEANING_AMOUNT = 15000;

// Státusz színek és címkék (komponensen kívül)
const statusColors = {
  planned: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  done: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  paid: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
};

const statusLabels = {
  planned: 'Tervezett',
  done: 'Elkészült',
  paid: 'Kifizetve'
};

const CleaningPage = () => {
  const {
    cleanings,
    filter,
    searchQuery,
    isLoading,
    error,
    showAddCleaning,
    showEditCleaning,
    selectedCleaning,
    summary,
    setFilter,
    setSearchQuery,
    setShowAddCleaning,
    setShowEditCleaning,
    setSelectedCleaning,
    setError,
    fetchFromApi,
    fetchSummary,
    addCleaning,
    updateCleaning,
    deleteCleaning,
    getFilteredCleanings,
    getStats
  } = useCleaningsStore();

  const { apartments, fetchFromApi: fetchApartments } = useApartmentsStore();
  const { bookings, fetchFromApi: fetchBookings } = useBookingsStore();
  const { canEdit: canEditCleaning } = usePermissions();

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    apartmentId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    defaultAmount: 15000,
    skipExisting: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCleanings, setSelectedCleanings] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [defaultTextileRate, setDefaultTextileRate] = useState(600); // Alapértelmezett textil díj

  const [newCleaning, setNewCleaning] = useState({
    apartmentId: '',
    bookingId: null,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'HUF',
    status: 'planned',
    assigneeUserId: null,
    notes: '',
    cleaningHours: '',
    hasTextile: false,
    textileEarnings: '',
    expenses: '',
    expenseNote: '',
    checkinTime: '15:00',
    checkoutTime: '11:00'
  });

  const filteredFromStore = useMemo(() => getFilteredCleanings(), [getFilteredCleanings, filter, searchQuery, cleanings]);

  const cleaningsFromBookings = useMemo(() => {
    const list = [];
    const yr = filter.year;
    const mo = filter.month;
    const aptId = filter.apartmentId;
    const st = filter.status;
    const assignee = filter.assigneeUserId;
    if (st && st !== 'planned') return list;
    if (assignee) return list;
    const q = (searchQuery || '').trim();

    bookings.forEach((b) => {
      const dateTo = b.dateTo || b.checkOut;
      if (!dateTo) return;
      const d = new Date(dateTo);
      if (yr && d.getFullYear() !== yr) return;
      if (mo && d.getMonth() + 1 !== mo) return;
      if (aptId && String(b.apartmentId) !== String(aptId)) return;

      const apartmentName = b.apartmentName || apartments.find((a) => String(a.id) === String(b.apartmentId))?.name || `#${b.apartmentId}`;
      const guestName = b.guestName || 'Vendég';
      if (q && !contains(apartmentName, q) && !contains(guestName, q)) return;

      list.push({
        id: `booking-cleaning-${b.id}`,
        apartmentId: b.apartmentId,
        apartmentName,
        bookingId: b.id,
        date: dateTo,
        amount: DEFAULT_CLEANING_AMOUNT,
        currency: 'HUF',
        status: 'planned',
        checkinTime: (b.checkInTime != null && b.checkInTime !== '') ? b.checkInTime : '15:00',
        checkoutTime: (b.checkOutTime != null && b.checkOutTime !== '') ? b.checkOutTime : '11:00',
        booking: { guestName, checkIn: b.dateFrom || b.checkIn, checkOut: dateTo },
        _virtual: true
      });
    });
    return list;
  }, [bookings, apartments, filter.year, filter.month, filter.apartmentId, filter.status, filter.assigneeUserId, searchQuery]);

  const mergedCleanings = useMemo(() => {
    const withBooking = new Set(filteredFromStore.map((c) => c.bookingId).filter(Boolean));
    const virtual = cleaningsFromBookings.filter((v) => !withBooking.has(v.bookingId));
    const merged = [...filteredFromStore, ...virtual];
    const sorted = [...merged].sort((a, b) => {
      let aValue = a[sortConfig.field] || '';
      let bValue = b[sortConfig.field] || '';

      if (sortConfig.field === 'date') {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      }
      if (['amount', 'cleaningHours', 'textileEarnings', 'expenses'].includes(sortConfig.field)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (typeof bValue === 'string' ? bValue : '').toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredFromStore, cleaningsFromBookings, sortConfig]);

  const filteredCleanings = mergedCleanings;

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const stats = useMemo(() => {
    const list = mergedCleanings;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const thisMonthCleanings = list.filter((c) => {
      const date = new Date(c.date);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    });
    const byStatus = {
      planned: list.filter((c) => c.status === 'planned').length,
      done: list.filter((c) => c.status === 'done').length,
      paid: list.filter((c) => c.status === 'paid').length
    };
    return {
      total: list.length,
      thisMonth: thisMonthCleanings.length,
      byStatus,
      totalAmount: list.reduce((s, c) => s + (Number(c.amount) || 0), 0),
      thisMonthAmount: thisMonthCleanings.reduce((s, c) => s + (Number(c.amount) || 0), 0),
      paidAmount: list.filter((c) => c.status === 'paid').reduce((s, c) => s + (Number(c.amount) || 0), 0)
    };
  }, [mergedCleanings]);

  // Skeleton elemek (konstans, memoizálva)
  const skeletonListItems = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  // Betöltjük az alkalmazás beállításokat (alapértelmezett textil díj)
  useEffect(() => {
    const loadSettings = async () => {
      if (api.isConfigured()) {
        try {
          const response = await settingsGet();
          const settings = response?.settings || response || {};
          const textileRate = parseInt(settings.default_textile_rate || settings.defaultTextileRate || 600);
          setDefaultTextileRate(textileRate);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error loading settings:', error);
          }
        }
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    document.title = 'Takarítás kezelése - SmartCRM';
    fetchFromApi();
    fetchSummary();
    fetchApartments();
    fetchBookings();
    
    // Users betöltése (takarító hozzárendeléshez)
    if (api.isConfigured()) {
      setIsLoadingUsers(true);
      // Először próbáljuk a workers API-t, ha nincs, akkor usersList-et használunk
      Promise.all([
        workersList().catch(() => null),
        usersList({ role: 'worker' }).catch(() => null)
      ]).then(([workersData, usersData]) => {
        if (workersData) {
          const workers = Array.isArray(workersData) ? workersData : (workersData?.workers || []);
          setUsers(workers.map(workerFromApi).filter(w => w && w.status === 'active'));
        } else if (usersData) {
          const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
          setUsers(usersList);
        }
      })
        .catch((e) => {
          if (import.meta.env.DEV) {
            console.error('Error loading workers/users:', e);
          }
        })
        .finally(() => {
          setIsLoadingUsers(false);
        });
    }
  }, [fetchFromApi, fetchSummary, fetchApartments, fetchBookings]);

  // Év és hónap lista
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - 2 + i), [currentYear]);
  const months = useMemo(() => [
    { value: 1, label: 'Január' },
    { value: 2, label: 'Február' },
    { value: 3, label: 'Március' },
    { value: 4, label: 'Április' },
    { value: 5, label: 'Május' },
    { value: 6, label: 'Június' },
    { value: 7, label: 'Július' },
    { value: 8, label: 'Augusztus' },
    { value: 9, label: 'Szeptember' },
    { value: 10, label: 'Október' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ], []);

  const handleOpenAddCleaning = useCallback(() => {
    setNewCleaning({
      apartmentId: '',
      bookingId: null,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      currency: 'HUF',
      status: 'planned',
      assigneeUserId: null,
      notes: '',
      cleaningHours: '',
      hasTextile: false,
      textileEarnings: '',
      expenses: '',
      expenseNote: '',
      checkinTime: '15:00',
      checkoutTime: '11:00'
    });
    setFieldErrors({});
    setShowAddCleaning(true);
  }, [setShowAddCleaning]);

  const handleCloseAddCleaning = useCallback(() => {
    setShowAddCleaning(false);
  }, [setShowAddCleaning]);

  const handleCloseEditCleaning = useCallback(() => {
    setShowEditCleaning(false);
    setSelectedCleaning(null);
  }, [setShowEditCleaning, setSelectedCleaning]);

  const handleClearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleNewCleaningChange = useCallback((field, value) => {
    // Ha a hasTextile checkbox-ot kapcsoljuk be, automatikusan beállítjuk az alapértelmezett textil díjat
    if (field === 'hasTextile' && value === true) {
      setNewCleaning((prev) => ({ 
        ...prev, 
        [field]: value,
        textileEarnings: prev.textileEarnings || defaultTextileRate.toString()
      }));
    } else if (field === 'hasTextile' && value === false) {
      // Ha kikapcsoljuk, töröljük a textil díjat
      setNewCleaning((prev) => ({ 
        ...prev, 
        [field]: value,
        textileEarnings: ''
      }));
    } else {
      setNewCleaning((prev) => ({ ...prev, [field]: value }));
    }
    
    // Real-time validáció
    if (field === 'apartmentId' || field === 'date') {
      const tempForm = { ...newCleaning, [field]: value };
      const validation = validateForm(tempForm, {
        apartmentId: ['required'],
        date: ['required', 'date']
      });
      
      if (validation.isValid) {
        setFieldErrors((prev) => ({ ...prev, [field]: null }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [field]: validation.errors[field] || null }));
      }
    }
  }, [newCleaning, defaultTextileRate]);

  const handleSelectedCleaningChange = useCallback((field, value) => {
    setSelectedCleaning((prev) => {
      if (!prev) return null;
      
      // Ha a hasTextile checkbox-ot kapcsoljuk be, automatikusan beállítjuk az alapértelmezett textil díjat
      let updated;
      if (field === 'hasTextile' && value === true) {
        updated = { 
          ...prev, 
          [field]: value,
          textileEarnings: prev.textileEarnings || defaultTextileRate
        };
      } else if (field === 'hasTextile' && value === false) {
        // Ha kikapcsoljuk, töröljük a textil díjat
        updated = { 
          ...prev, 
          [field]: value,
          textileEarnings: 0
        };
      } else {
        updated = { ...prev, [field]: value };
      }
      
      // Real-time validáció
      if (field === 'apartmentId' || field === 'date') {
        const validation = validateForm(updated, {
          apartmentId: ['required'],
          date: ['required', 'date']
        });
        
        if (validation.isValid) {
          setFieldErrors((prev) => ({ ...prev, [`edit_${field}`]: null }));
        } else {
          setFieldErrors((prev) => ({ ...prev, [`edit_${field}`]: validation.errors[field] || null }));
        }
      }
      
      return updated;
    });
  }, [defaultTextileRate]);

  const handleFilterChange = useCallback((field, value) => {
    setFilter({ ...filter, [field]: value });
  }, [filter, setFilter]);

  const handleYearChange = useCallback((year) => {
    handleFilterChange('year', parseInt(year));
  }, [handleFilterChange]);

  const handleMonthChange = useCallback((month) => {
    handleFilterChange('month', parseInt(month));
  }, [handleFilterChange]);

  const handleStatusFilterChange = useCallback((status) => {
    handleFilterChange('status', status || '');
  }, [handleFilterChange]);

  const handleApartmentFilterChange = useCallback((apartmentId) => {
    handleFilterChange('apartmentId', apartmentId || '');
  }, [handleFilterChange]);

  const handleEditCleaningClick = useCallback((cleaning) => {
    setSelectedCleaning(cleaning);
    setFieldErrors({});
    setShowEditCleaning(true);
  }, [setSelectedCleaning, setShowEditCleaning]);

  const handleDeleteCleaningClick = useCallback((cleaning) => {
    setDeleteConfirm(cleaning);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCleaning(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (e) {
      // Error already handled in store
    }
  }, [deleteConfirm, deleteCleaning]);

  const handleAddCleaning = useCallback(async () => {
    if (isSubmitting) return;

    // Validáció
    const validation = validateForm(newCleaning, {
      apartmentId: ['required'],
      date: ['required', 'date']
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    const amount = 0;
    
    // Dátum validáció (nem lehet a jövőben túl messze)
    const selectedDate = new Date(newCleaning.date);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (selectedDate > maxDate) {
      useToastStore.getState().error('A dátum nem lehet több mint 1 évvel a jövőben!');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...newCleaning,
        amount,
        cleaningHours: newCleaning.cleaningHours ? Number(newCleaning.cleaningHours) : null,
        hasTextile: !!newCleaning.hasTextile,
        textileEarnings: newCleaning.hasTextile && newCleaning.textileEarnings ? Number(newCleaning.textileEarnings) : 0,
        expenses: newCleaning.expenses ? Number(newCleaning.expenses) : 0,
        expenseNote: newCleaning.expenseNote || null,
        checkinTime: newCleaning.checkinTime || '15:00',
        checkoutTime: newCleaning.checkoutTime || '11:00'
      };
      await addCleaning(payload);
      setShowAddCleaning(false);
      setNewCleaning({
        apartmentId: '',
        bookingId: null,
        date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: 'HUF',
        status: 'planned',
        assigneeUserId: null,
        notes: '',
        cleaningHours: '',
        hasTextile: false,
        textileEarnings: '',
        expenses: '',
        expenseNote: '',
        checkinTime: '15:00',
        checkoutTime: '11:00'
      });
    } catch (e) {
      // Error already handled in store
    } finally {
      setIsSubmitting(false);
    }
  }, [newCleaning, addCleaning, setShowAddCleaning, isSubmitting]);

  const handleUpdateCleaning = useCallback(async () => {
    if (!selectedCleaning || isSubmitting) return;

    // Validáció
    const validation = validateForm(selectedCleaning, {
      apartmentId: ['required'],
      date: ['required', 'date']
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    const amount = Number(selectedCleaning.amount) || 0;
    
    // Dátum validáció (nem lehet a jövőben túl messze)
    const selectedDate = new Date(selectedCleaning.date);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (selectedDate > maxDate) {
      useToastStore.getState().error('A dátum nem lehet több mint 1 évvel a jövőben!');
      return;
    }
    setIsSubmitting(true);
    try {
      const updates = {
        ...selectedCleaning,
        amount,
        cleaningHours: selectedCleaning.cleaningHours ? Number(selectedCleaning.cleaningHours) : null,
        hasTextile: !!selectedCleaning.hasTextile,
        textileEarnings: selectedCleaning.hasTextile && selectedCleaning.textileEarnings ? Number(selectedCleaning.textileEarnings) : 0,
        expenses: selectedCleaning.expenses ? Number(selectedCleaning.expenses) : 0,
        expenseNote: selectedCleaning.expenseNote || null,
        checkinTime: selectedCleaning.checkinTime || '15:00',
        checkoutTime: selectedCleaning.checkoutTime || '11:00'
      };
      await updateCleaning(selectedCleaning.id, updates);
      setShowEditCleaning(false);
      setSelectedCleaning(null);
    } catch (e) {
      // Error already handled in store
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCleaning, updateCleaning, setShowEditCleaning, setSelectedCleaning, isSubmitting]);

  const getApartmentName = useCallback((apartmentId) => {
    const apt = apartments.find((a) => a.id === apartmentId || a.id === parseInt(apartmentId));
    return apt?.name || `Lakás #${apartmentId}`;
  }, [apartments]);

  const getExportData = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'checkinTime', label: 'Érkezés tervezett ideje' },
      { key: 'checkoutTime', label: 'Távozás tervezett ideje' },
      { key: 'status', label: 'Státusz' },
      { key: 'assigneeName', label: 'Hozzárendelt' },
      { key: 'cleaningHours', label: 'Óra' },
      { key: 'textileEarnings', label: 'Textil díj' },
      { key: 'expenses', label: 'Kiadás' },
      { key: 'expenseNote', label: 'Kiadás megjegyzés' },
      { key: 'notes', label: 'Megjegyzés' }
    ];
    const data = filteredCleanings.map((c) => ({
      date: c.date,
      apartmentName: c.apartmentName || getApartmentName(c.apartmentId),
      checkinTime: c.checkinTime ?? '15:00',
      checkoutTime: c.checkoutTime ?? '11:00',
      status: statusLabels[c.status] || c.status,
      assigneeName: c.assigneeName || '-',
      cleaningHours: c.cleaningHours ?? '',
      textileEarnings: c.textileEarnings ?? '',
      expenses: c.expenses ?? '',
      expenseNote: c.expenseNote || '',
      notes: c.notes || ''
    }));
    return { columns, data };
  }, [filteredCleanings, getApartmentName]);

  const handleExportCSV = useCallback(() => {
    const { columns, data } = getExportData();
    exportToCSV(data, columns, 'takaritasok.csv');
  }, [getExportData]);

  const handleExportExcel = useCallback(() => {
    const { columns, data } = getExportData();
    exportToExcel(data, columns, 'takaritasok.xlsx');
  }, [getExportData]);

  const handlePrintPDF = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'checkinTime', label: 'Érkezés tervezett ideje' },
      { key: 'checkoutTime', label: 'Távozás tervezett ideje' },
      { key: 'status', label: 'Státusz' }
    ];
    const data = filteredCleanings.map((c) => ({
      date: c.date,
      apartmentName: c.apartmentName || getApartmentName(c.apartmentId),
      checkinTime: c.checkinTime ?? '15:00',
      checkoutTime: c.checkoutTime ?? '11:00',
      status: statusLabels[c.status] || c.status
    }));
    printToPDF(data, columns, 'Takarítások');
  }, [filteredCleanings, getApartmentName]);

  const handleGenerateFromBookings = useCallback(async () => {
    // Validáció
    if (!generateParams.apartmentId) {
      useToastStore.getState().warning('Kérjük, válasszon lakást!');
      return;
    }
    if (!generateParams.defaultAmount || generateParams.defaultAmount <= 0) {
      useToastStore.getState().warning('Kérjük, adjon meg egy érvényes alapértelmezett összeget!');
      return;
    }
    
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await cleaningsGenerateFromBookings(generateParams);
      useToastStore.getState().success(
        `Sikeresen generálva: ${result.created || 0} takarítás, kihagyva: ${result.skipped || 0}`
      );
      setShowGenerateModal(false);
      // Reset generate params
      setGenerateParams({
        apartmentId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        defaultAmount: 15000,
        skipExisting: true
      });
      await fetchFromApi();
      await fetchSummary();
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a takarítások generálásakor.';
      useToastStore.getState().error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  }, [generateParams, fetchFromApi, fetchSummary, isGenerating]);

  const handleBulkStatusChange = useCallback(async (newStatus) => {
    if (selectedCleanings.length === 0) {
      useToastStore.getState().warning('Kérjük, válasszon ki legalább egy takarítást!');
      return;
    }
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedCleanings.map((id) => updateCleaning(id, { status: newStatus }))
      );
      useToastStore.getState().success(`${selectedCleanings.length} takarítás státusza frissítve.`);
      setSelectedCleanings([]);
      await fetchFromApi();
      await fetchSummary();
    } catch (e) {
      useToastStore.getState().error('Hiba a státusz váltás során.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCleanings, updateCleaning, fetchFromApi, fetchSummary]);

  const handleToggleCleaningSelection = useCallback((cleaningId) => {
    setSelectedCleanings((prev) =>
      prev.includes(cleaningId)
        ? prev.filter((id) => id !== cleaningId)
        : [...prev, cleaningId]
    );
  }, []);

  const realCleanings = useMemo(() => filteredCleanings.filter((c) => !c._virtual), [filteredCleanings]);

  const handleSelectAllCleanings = useCallback(() => {
    const selectable = realCleanings.map((c) => c.id);
    const allSelected = selectable.length > 0 && selectable.every((id) => selectedCleanings.includes(id));
    if (allSelected) {
      setSelectedCleanings([]);
    } else {
      setSelectedCleanings(selectable);
    }
  }, [selectedCleanings, realCleanings]);

  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const handleBulkDelete = useCallback(() => {
    if (selectedCleanings.length === 0) return;
    setBulkDeleteConfirm(true);
  }, [selectedCleanings.length]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedCleanings.length === 0) return;

    setIsSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      for (const cleaningId of selectedCleanings) {
        try {
          await deleteCleaning(cleaningId);
          successCount++;
        } catch (e) {
          errorCount++;
          if (import.meta.env.DEV) {
            console.error(`Hiba a takarítás törlésekor (${cleaningId}):`, e);
          }
        }
      }
      if (errorCount === 0) {
        useToastStore.getState().success(`${successCount} takarítás sikeresen törölve.`);
        setSelectedCleanings([]);
      } else {
        useToastStore.getState().warning(`${successCount} takarítás törölve, ${errorCount} hiba történt.`);
      }
      await fetchFromApi();
      await fetchSummary();
      setBulkDeleteConfirm(false);
    } catch (e) {
      useToastStore.getState().error('Hiba a bulk törlés során.');
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk törlés során:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCleanings, deleteCleaning, fetchFromApi, fetchSummary]);

  // Refresh when filter changes
  useEffect(() => {
    fetchFromApi();
    fetchSummary();
  }, [filter.year, filter.month, filter.apartmentId, filter.status, fetchFromApi, fetchSummary]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">🧹 Takarítás kezelése</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => {
              fetchFromApi();
              fetchSummary();
            }}
            variant="outline"
            disabled={isLoading}
            loading={isLoading}
            aria-label="Adatok frissítése"
            title="Adatok frissítése"
          >
            <RefreshCw /> Frissítés
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            CSV export
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            Excel export
          </Button>
          <Button onClick={handlePrintPDF} variant="outline">
            Nyomtatás / PDF
          </Button>
          {canEditCleaning('cleaning') && (
            <>
              <Button onClick={() => setShowGenerateModal(true)} variant="outline">
                ⚡ Generálás
              </Button>
              <Button onClick={handleOpenAddCleaning}>
                <Plus className="w-4 h-4 mr-2" />
                Új takarítás
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex justify-between items-center" role="alert" aria-live="polite">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={handleClearError} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Statisztikák */}
      {isLoading && !cleanings.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Összes takarítás</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ebben a hónapban</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.thisMonth}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kifizetve</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.byStatus.paid}</div>
          </Card>
        </div>
      )}

      {/* Szűrők */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Kereső mező */}
          <div>
            <label htmlFor="cleaning-search" className="sr-only">Keresés takarítások között</label>
            <input
              id="cleaning-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés lakás név, takarító név vagy megjegyzés alapján..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Keresés takarítások között"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="filter-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Év
              </label>
            <select
              id="filter-year"
              value={filter.year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hónap
            </label>
            <select
              id="filter-month"
              value={filter.month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="filter-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lakás
            </label>
            <select
              id="filter-apartment"
              value={filter.apartmentId}
              onChange={(e) => handleApartmentFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Összes lakás</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Státusz
            </label>
            <select
              id="filter-status"
              value={filter.status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Összes</option>
              <option value="planned">Tervezett</option>
              <option value="done">Elkészült</option>
              <option value="paid">Kifizetve</option>
            </select>
          </div>
          </div>
        </div>
      </Card>

      {/* Takarítások lista */}
      {isLoading && !cleanings.length ? (
        <div className="space-y-2" aria-live="polite" aria-busy="true">
          {skeletonListItems.map((i) => (
            <SkeletonListItem key={i} />
          ))}
        </div>
      ) : filteredCleanings.length === 0 ? (
        <Card>
          {filter.apartmentId || filter.status || filter.assigneeUserId || searchQuery ? (
            <EmptyStateWithFilter
              title="Nincsenek takarítások"
              description="A kiválasztott szűrőkkel nem található takarítás. Próbáld meg módosítani a szűrőket vagy keresési feltételeket."
              onClearFilter={() => {
                setFilter({
                  apartmentId: '',
                  year: new Date().getFullYear(),
                  month: new Date().getMonth() + 1,
                  status: '',
                  assigneeUserId: ''
                });
                setSearchQuery('');
              }}
            />
          ) : (
            <EmptyState
              icon={Plus}
              title="Még nincsenek takarítások"
              description="Kezdj el takarításokat hozzáadni a takarítási ütemezéshez."
              actionLabel="Új takarítás hozzáadása"
              onAction={canEditCleaning('cleaning') ? handleOpenAddCleaning : undefined}
            />
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Takarítások ({filteredCleanings.length})</h3>
            {canEditCleaning('cleaning') && realCleanings.length > 0 && (
              <Button
                onClick={handleSelectAllCleanings}
                variant="ghost"
                size="sm"
                aria-label={selectedCleanings.length === realCleanings.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
              >
                {selectedCleanings.length === realCleanings.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
              </Button>
            )}
          </div>
          {selectedCleanings.length > 0 && canEditCleaning('cleaning') && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {selectedCleanings.length} takarítás kiválasztva
                </span>
                <div className="flex gap-2">
                  <label htmlFor="bulk-status-select" className="sr-only">
                    Státusz változtatása kiválasztott takarításokra
                  </label>
                  <select
                    id="bulk-status-select"
                    onChange={(e) => handleBulkStatusChange(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    defaultValue=""
                  >
                    <option value="">Státusz változtatás...</option>
                    <option value="planned">Tervezett</option>
                    <option value="done">Elkészült</option>
                    <option value="paid">Kifizetve</option>
                  </select>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <Trash2 /> Törlés
                  </Button>
                  <Button
                    onClick={() => setSelectedCleanings([])}
                    variant="ghost"
                    size="sm"
                  >
                    Kijelölés törlése
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {filteredCleanings.length > 0 && (
            <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rendezés:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSort('date')}
                  className={`px-3 py-1 text-xs rounded border transition ${
                    sortConfig.field === 'date'
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`Rendezés dátum szerint ${sortConfig.field === 'date' && sortConfig.direction === 'asc' ? 'növekvő' : 'csökkenő'}`}
                >
                  Dátum {sortConfig.field === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className={`px-3 py-1 text-xs rounded border transition ${
                    sortConfig.field === 'status'
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`Rendezés státusz szerint ${sortConfig.field === 'status' && sortConfig.direction === 'asc' ? 'növekvő' : 'csökkenő'}`}
                >
                  Státusz {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                </button>
              </div>
            </div>
          )}
          {filteredCleanings.map((cleaning) => {
            const isVirtual = !!cleaning._virtual;
            return (
            <Card key={cleaning.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  {!isVirtual && (
                    <input
                      type="checkbox"
                      checked={selectedCleanings.includes(cleaning.id)}
                      onChange={() => handleToggleCleaningSelection(cleaning.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                      aria-label={`Takarítás kijelölése: ${cleaning.apartmentName || getApartmentName(cleaning.apartmentId)}`}
                    />
                  )}
                  {isVirtual && <div className="w-4 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {cleaning.apartmentName || getApartmentName(cleaning.apartmentId)}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[cleaning.status] || statusColors.planned}`}>
                        {statusLabels[cleaning.status] || cleaning.status}
                      </span>
                      {isVirtual && (
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                          Foglalásból
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>📅 Dátum: {new Date(cleaning.date).toLocaleDateString('hu-HU')}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🕐 Érkezés: {cleaning.checkinTime ?? '15:00'} – Távozás: {cleaning.checkoutTime ?? '11:00'}
                      </div>
                      {(cleaning.cleaningHours != null && cleaning.cleaningHours > 0) && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">⏱ Óra: {cleaning.cleaningHours} h</div>
                      )}
                      {cleaning.hasTextile && (cleaning.textileEarnings || 0) > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">👕 Textil: {Number(cleaning.textileEarnings).toLocaleString('hu-HU')} Ft</div>
                      )}
                      {(cleaning.expenses || 0) > 0 && (
                        <div className="text-sm text-amber-600 dark:text-amber-400">📦 Kiadás: {Number(cleaning.expenses).toLocaleString('hu-HU')} Ft{cleaning.expenseNote ? ` (${cleaning.expenseNote})` : ''}</div>
                      )}
                      {cleaning.assigneeName && (
                        <div>👤 Hozzárendelt: {cleaning.assigneeName}</div>
                      )}
                      {cleaning.booking && (
                        <div>🏠 Foglalás: {cleaning.booking.guestName} ({cleaning.booking.checkIn} {cleaning.checkinTime ?? '15:00'} – {cleaning.booking.checkOut} {cleaning.checkoutTime ?? '11:00'})</div>
                      )}
                      {cleaning.notes && (
                        <div>📝 {cleaning.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
                {canEditCleaning('cleaning') && !isVirtual && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEditCleaningClick(cleaning)}
                      variant="ghost"
                      size="sm"
                      aria-label={`Takarítás szerkesztése: ${cleaning.apartmentName || getApartmentName(cleaning.apartmentId)}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCleaningClick(cleaning)}
                      variant="ghost"
                      size="sm"
                      aria-label={`Takarítás törlése: ${cleaning.apartmentName || getApartmentName(cleaning.apartmentId)}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ); })}
        </div>
      )}

      {/* Új takarítás modal - csak ha van edit jogosultság */}
      {canEditCleaning('cleaning') && (
        <Modal
          isOpen={showAddCleaning}
          onClose={handleCloseAddCleaning}
          title="Új takarítás"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCleaning();
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleAddCleaning();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCloseAddCleaning();
              }
            }}
            className="space-y-4"
          >
          <div>
            <label htmlFor="new-cleaning-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lakás <span className="text-red-500">*</span>
            </label>
            <select
              id="new-cleaning-apartment"
              value={newCleaning.apartmentId}
              onChange={(e) => handleNewCleaningChange('apartmentId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                fieldErrors.apartmentId ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              }`}
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.apartmentId}
              aria-describedby={fieldErrors.apartmentId ? 'apartment-error' : undefined}
            >
              <option value="">Válasszon lakást</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name}
                </option>
              ))}
            </select>
            {fieldErrors.apartmentId && (
              <p id="apartment-error" className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.apartmentId}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="new-cleaning-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dátum <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="new-cleaning-date"
              value={newCleaning.date}
              onChange={(e) => handleNewCleaningChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                fieldErrors.date ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              }`}
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.date}
              aria-describedby={fieldErrors.date ? 'date-error' : undefined}
            />
            {fieldErrors.date && (
              <p id="date-error" className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.date}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-cleaning-checkin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Érkezés tervezett ideje</label>
              <input
                id="new-cleaning-checkin"
                type="time"
                value={newCleaning.checkinTime || '15:00'}
                onChange={(e) => handleNewCleaningChange('checkinTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Érkezés tervezett ideje"
              />
            </div>
            <div>
              <label htmlFor="new-cleaning-checkout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Távozás tervezett ideje</label>
              <input
                id="new-cleaning-checkout"
                type="time"
                value={newCleaning.checkoutTime || '11:00'}
                onChange={(e) => handleNewCleaningChange('checkoutTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Távozás tervezett ideje"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-cleaning-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Státusz
            </label>
            <select
              id="new-cleaning-status"
              value={newCleaning.status}
              onChange={(e) => handleNewCleaningChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="planned">Tervezett</option>
              <option value="done">Elkészült</option>
              <option value="paid">Kifizetve</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-cleaning-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Takarító hozzárendelése
            </label>
            <select
              id="new-cleaning-assignee"
              value={newCleaning.assigneeUserId || ''}
              onChange={(e) => handleNewCleaningChange('assigneeUserId', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Nincs hozzárendelve</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-cleaning-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Megjegyzés
            </label>
            <textarea
              id="new-cleaning-notes"
              value={newCleaning.notes}
              onChange={(e) => handleNewCleaningChange('notes', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Takarítás megjegyzése"
            />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Részletes adatok</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-cleaning-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Óra</label>
                <input
                  id="new-cleaning-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={newCleaning.cleaningHours}
                  onChange={(e) => handleNewCleaningChange('cleaningHours', e.target.value)}
                  placeholder="pl. 2.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Takarítási óra"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  id="new-cleaning-textile"
                  type="checkbox"
                  checked={!!newCleaning.hasTextile}
                  onChange={(e) => handleNewCleaningChange('hasTextile', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                  aria-label="Textil"
                />
                <label htmlFor="new-cleaning-textile" className="text-sm font-medium text-gray-700 dark:text-gray-300">Textil</label>
              </div>
              {newCleaning.hasTextile && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="new-cleaning-textile-earnings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Textil díj (Ft)</label>
                    <Tooltip content={`Alapértelmezett textil díj: ${defaultTextileRate} Ft. Az érték automatikusan beállításra kerül, de módosítható.`} position="top">
                      <span className="text-xs text-gray-400 dark:text-gray-500 cursor-help" aria-label="Segítség">ℹ️</span>
                    </Tooltip>
                  </div>
                  <input
                    id="new-cleaning-textile-earnings"
                    type="number"
                    min="0"
                    value={newCleaning.textileEarnings}
                    onChange={(e) => handleNewCleaningChange('textileEarnings', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Textil díj"
                  />
                </div>
              )}
              <div>
                <label htmlFor="new-cleaning-expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kiadás (Ft)</label>
                <input
                  id="new-cleaning-expenses"
                  type="number"
                  min="0"
                  value={newCleaning.expenses}
                  onChange={(e) => handleNewCleaningChange('expenses', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Kiadás"
                />
              </div>
              <div>
                <label htmlFor="new-cleaning-expense-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kiadás megjegyzés</label>
                <input
                  id="new-cleaning-expense-note"
                  type="text"
                  value={newCleaning.expenseNote || ''}
                  onChange={(e) => handleNewCleaningChange('expenseNote', e.target.value)}
                  placeholder="pl. tisztítószerek"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Kiadás megjegyzés"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={handleCloseAddCleaning} variant="outline">
              Mégse
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Mentés
            </Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Szerkesztés modal - csak ha van edit jogosultság */}
      {canEditCleaning('cleaning') && (
        <Modal
          isOpen={showEditCleaning}
          onClose={handleCloseEditCleaning}
          title="Takarítás szerkesztése"
        >
        {selectedCleaning && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCleaning();
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleUpdateCleaning();
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="edit-cleaning-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lakás <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-cleaning-apartment"
                value={selectedCleaning.apartmentId}
                onChange={(e) => handleSelectedCleaningChange('apartmentId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  fieldErrors.edit_apartmentId ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.edit_apartmentId}
                aria-describedby={fieldErrors.edit_apartmentId ? 'edit-apartment-error' : undefined}
              >
                {apartments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.name}
                  </option>
                ))}
              </select>
              {fieldErrors.edit_apartmentId && (
                <p id="edit-apartment-error" className="text-xs text-red-600 mt-1" role="alert">
                  {fieldErrors.edit_apartmentId}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="edit-cleaning-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dátum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="edit-cleaning-date"
                value={selectedCleaning.date}
                onChange={(e) => handleSelectedCleaningChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  fieldErrors.edit_date ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.edit_date}
                aria-describedby={fieldErrors.edit_date ? 'edit-date-error' : undefined}
              />
              {fieldErrors.edit_date && (
                <p id="edit-date-error" className="text-xs text-red-600 mt-1" role="alert">
                  {fieldErrors.edit_date}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-cleaning-checkin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Érkezés tervezett ideje</label>
                <input
                  id="edit-cleaning-checkin"
                  type="time"
                  value={selectedCleaning.checkinTime || '15:00'}
                  onChange={(e) => handleSelectedCleaningChange('checkinTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Érkezés tervezett ideje"
                />
              </div>
              <div>
                <label htmlFor="edit-cleaning-checkout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Távozás tervezett ideje</label>
                <input
                  id="edit-cleaning-checkout"
                  type="time"
                  value={selectedCleaning.checkoutTime || '11:00'}
                  onChange={(e) => handleSelectedCleaningChange('checkoutTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Távozás tervezett ideje"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-cleaning-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Státusz
              </label>
              <select
                id="edit-cleaning-status"
                value={selectedCleaning.status}
                onChange={(e) => handleSelectedCleaningChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="planned">Tervezett</option>
                <option value="done">Elkészült</option>
                <option value="paid">Kifizetve</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-cleaning-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Takarító hozzárendelése
              </label>
              <select
                id="edit-cleaning-assignee"
                value={selectedCleaning.assigneeUserId || ''}
                onChange={(e) => handleSelectedCleaningChange('assigneeUserId', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Nincs hozzárendelve</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-cleaning-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Megjegyzés
              </label>
              <textarea
                id="edit-cleaning-notes"
                value={selectedCleaning.notes || ''}
                onChange={(e) => handleSelectedCleaningChange('notes', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Takarítás megjegyzése"
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Részletes adatok</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-cleaning-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Óra</label>
                  <input
                    id="edit-cleaning-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={selectedCleaning.cleaningHours ?? ''}
                    onChange={(e) => handleSelectedCleaningChange('cleaningHours', e.target.value || null)}
                    placeholder="pl. 2.5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Takarítási óra"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    id="edit-cleaning-textile"
                    type="checkbox"
                    checked={!!selectedCleaning.hasTextile}
                    onChange={(e) => handleSelectedCleaningChange('hasTextile', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                    aria-label="Textil"
                  />
                  <label htmlFor="edit-cleaning-textile" className="text-sm font-medium text-gray-700 dark:text-gray-300">Textil</label>
                </div>
                {selectedCleaning.hasTextile && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label htmlFor="edit-cleaning-textile-earnings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Textil díj (Ft)</label>
                      <Tooltip content={`Alapértelmezett textil díj: ${defaultTextileRate} Ft. Az érték automatikusan beállításra kerül, de módosítható.`} position="top">
                        <span className="text-xs text-gray-400 dark:text-gray-500 cursor-help" aria-label="Segítség">ℹ️</span>
                      </Tooltip>
                    </div>
                    <input
                      id="edit-cleaning-textile-earnings"
                      type="number"
                      min="0"
                      value={selectedCleaning.textileEarnings ?? ''}
                      onChange={(e) => handleSelectedCleaningChange('textileEarnings', e.target.value || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Textil díj"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="edit-cleaning-expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kiadás (Ft)</label>
                  <input
                    id="edit-cleaning-expenses"
                    type="number"
                    min="0"
                    value={selectedCleaning.expenses ?? ''}
                    onChange={(e) => handleSelectedCleaningChange('expenses', e.target.value || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Kiadás"
                  />
                </div>
                <div>
                  <label htmlFor="edit-cleaning-expense-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kiadás megjegyzés</label>
                  <input
                    id="edit-cleaning-expense-note"
                    type="text"
                    value={selectedCleaning.expenseNote || ''}
                    onChange={(e) => handleSelectedCleaningChange('expenseNote', e.target.value)}
                    placeholder="pl. tisztítószerek"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Kiadás megjegyzés"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseEditCleaning} variant="outline">
                Mégse
              </Button>
              <Button onClick={handleUpdateCleaning} loading={isSubmitting} disabled={isSubmitting}>
                Mentés
              </Button>
            </div>
          </form>
        )}
      </Modal>
      )}

      {/* Törlés megerősítés - csak ha van edit jogosultság */}
      {canEditCleaning('cleaning') && (
        <>
          <ConfirmDialog
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Takarítás törlése"
            message={`Biztosan törölni szeretné ezt a takarítást?`}
          />
          <ConfirmDialog
            isOpen={bulkDeleteConfirm}
            onClose={() => setBulkDeleteConfirm(false)}
            onConfirm={confirmBulkDelete}
            title="Takarítások törlése"
            message={`Biztosan törölni szeretnéd a ${selectedCleanings.length} kiválasztott takarítást?`}
            variant="danger"
          />
        </>
      )}

      {/* Generálás modal - csak ha van edit jogosultság */}
      {canEditCleaning('cleaning') && (
        <Modal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title="Takarítások generálása foglalásokból"
        >
        <div className="space-y-4">
          <div>
            <label htmlFor="generate-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lakás <span className="text-red-500">*</span>
            </label>
            <select
              id="generate-apartment"
              value={generateParams.apartmentId}
              onChange={(e) => setGenerateParams({ ...generateParams, apartmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Válasszon lakást</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="generate-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Év
              </label>
              <select
                id="generate-year"
                value={generateParams.year}
                onChange={(e) => setGenerateParams({ ...generateParams, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="generate-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hónap
              </label>
              <select
                id="generate-month"
                value={generateParams.month}
                onChange={(e) => setGenerateParams({ ...generateParams, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="generate-skip-existing"
              checked={generateParams.skipExisting}
              onChange={(e) => setGenerateParams({ ...generateParams, skipExisting: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
            />
            <label htmlFor="generate-skip-existing" className="text-sm text-gray-700 dark:text-gray-300">
              Meglévő takarítások kihagyása
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setShowGenerateModal(false)} variant="outline">
              Mégse
            </Button>
            <Button onClick={handleGenerateFromBookings} disabled={isGenerating}>
              {isGenerating ? 'Generálás...' : 'Generálás'}
            </Button>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
};

export default CleaningPage;

