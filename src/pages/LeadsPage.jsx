import { useState, useEffect, useCallback, useMemo } from 'react';
import useLeadsStore, { leadStatuses, leadSources, leadRatings } from '../stores/leadsStore';
import useToastStore from '../stores/toastStore';
import { usePermissions } from '../contexts/PermissionContext';
import { validateForm, validateEmail, validatePhone } from '../utils/validation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, X, ChevronUp, ChevronDown, RefreshCw } from '../components/common/Icons';
import { exportToCSV, exportToExcel, exportToJSON, printToPDF } from '../utils/exportUtils';
import { todayISO, formatTimeAgo } from '../utils/dateUtils';
import { formatPercent } from '../utils/numberUtils';
import { SkeletonListItem } from '../components/common/Skeleton';
import EmptyState, { EmptyStateWithFilter } from '../components/common/EmptyState';
import Tooltip from '../components/common/Tooltip';
import { sendTemplatedEmail, isEmailConfigured } from '../services/emailService';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import FormField from '../components/common/FormField';
import { excelFillToLeadColor } from '../utils/excelRowColorUtils';
import './LeadsPage.css';

// Státusz színek  Új érdekld sárga jelvény és pipeline csempe; Késbb amber; Nem aktuális szürke
const statusColors = {
  new: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  uj_erdeklodo: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  contacted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  kapcsolatfelvetel: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  meeting: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  felmeres_tervezve: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  felmeres_megtortent: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  offer: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  ajanlat_kuldve: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  negotiation: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
  targyalas: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
  won: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  szerzodes_kuldve: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
  alairva: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  aktiv_partner: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  lost: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  elutasitva: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  kesobb: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  nem_aktualis: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
};

const statusLabels = {
  new: 'Új',
  uj_erdeklodo: 'Új érdekld',
  contacted: 'Kapcsolatfelvétel',
  kapcsolatfelvetel: 'Kapcsolatfelvétel',
  meeting: 'Találkozó egyeztetve',
  felmeres_tervezve: 'Felmérés tervezve',
  felmeres_megtortent: 'Felmérés megtörtént',
  offer: 'Ajánlat kiküldve',
  ajanlat_kuldve: 'Ajánlat kiküldve',
  negotiation: 'Tárgyalás',
  targyalas: 'Tárgyalás',
  won: 'Megnyert',
  szerzodes_kuldve: 'Szerzdés elküldve',
  alairva: 'Aláírva',
  aktiv_partner: 'Aktív partner',
  lost: 'Elvesztett',
  elutasitva: 'Elutasítva',
  kesobb: 'Késbb',
  nem_aktualis: 'Nem aktuális'
};

const ratingColors = {
  hot: 'text-red-600 dark:text-red-400',
  warm: 'text-orange-500 dark:text-orange-400',
  cold: 'text-blue-500 dark:text-blue-400'
};

// Státusz szín mapping a redesign-hoz
const statusColorMap = {
  new: '#3b82f6',
  uj_erdeklodo: '#3b82f6',
  contacted: '#8b5cf6',
  kapcsolatfelvetel: '#8b5cf6',
  felmeres_tervezve: '#f59e0b',
  felmeres_megtortent: '#f59e0b',
  meeting: '#f59e0b',
  offer: '#06b6d4',
  ajanlat_kuldve: '#06b6d4',
  negotiation: '#10b981',
  targyalas: '#10b981',
  szerzodes_kuldve: '#10b981',
  won: '#22c55e',
  alairva: '#22c55e',
  aktiv_partner: '#22c55e',
  lost: '#64748b',
  elutasitva: '#64748b',
  kesobb: '#eab308',
  nem_aktualis: '#64748b'
};

// Státusz csoportosítás
const activeStatuses = ['uj_erdeklodo', 'new', 'kapcsolatfelvetel', 'contacted', 'felmeres_tervezve', 'felmeres_megtortent', 'meeting', 'ajanlat_kuldve', 'offer', 'targyalas', 'negotiation', 'szerzodes_kuldve'];
const closedStatuses = ['alairva', 'aktiv_partner', 'won', 'lost', 'elutasitva'];
const waitingStatuses = ['kesobb', 'nem_aktualis'];

// Helper függvény az inicialok generálásához
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Státusz badge színek a redesign-hoz
const getStatusBadgeClass = (status) => {
  if (status === 'kesobb') return 'status-later';
  if (status === 'nem_aktualis') return 'status-not-actual';
  if (['new', 'uj_erdeklodo'].includes(status)) return 'status-new';
  return '';
};

// Státusz badge inline style a színhez
const getStatusBadgeStyle = (status) => {
  const color = statusColorMap[status] || '#64748b';
  return {
    background: `${color}20`,
    color: color,
    border: `1px solid ${color}40`
  };
};

const LeadsPage = () => {
  const {
    leads,
    isLoading,
    error,
    filter,
    searchQuery,
    showAddLead,
    showLeadImport,
    editingLead,
    setFilter,
    setSearchQuery,
    setShowAddLead,
    setShowLeadImport,
    setEditingLead,
    fetchFromApi,
    addLead,
    updateLead,
    deleteLead,
    setLeadStatus,
    getFilteredLeads,
    getLeadsByStatus,
    importLeadsFromJSON,
    importLeadsFromCSV,
    importLeadsFromExcel
  } = useLeadsStore();

  useEffect(() => {
    document.title = 'Leadek kezelése - SmartCRM';
    fetchFromApi();
  }, [fetchFromApi]);

  const { canEdit: canEditLeads } = usePermissions();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [fieldErrors, setFieldErrors] = useState({});

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    status: 'new',
    rating: 'warm',
    notes: '',
    apartmentInterest: '',
    budget: '',
    assignedTo: ''
  });

  const filteredLeads = useMemo(() => {
    const filtered = getFilteredLeads();
    // Rendezés alkalmazása
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.field] || '';
      let bValue = b[sortConfig.field] || '';
      
      // Dátum rendezés
      if (sortConfig.field === 'createdAt') {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
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
  }, [getFilteredLeads, filter, searchQuery, leads, sortConfig]);

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Nem mentett változások ellenrzése
  const hasUnsavedChanges = useMemo(() => {
    // Ellenrizzük, hogy van-e kitöltött új lead form vagy szerkesztett lead
    const hasNewLeadData = showAddLead && (
      newLead.name.trim() !== '' ||
      newLead.email.trim() !== '' ||
      newLead.phone.trim() !== '' ||
      newLead.notes.trim() !== ''
    );
    const hasEditingLead = editingLead !== null;
    return hasNewLeadData || hasEditingLead;
  }, [showAddLead, newLead, editingLead]);

  // Unsaved changes warning
  useUnsavedChanges(hasUnsavedChanges, 'Nem mentett lead változások vannak. Biztosan elhagyja az oldalt?');

  // Pipeline statisztikák
  const pipelineStats = useMemo(() => {
    const stats = {};
    leadStatuses.forEach((status) => {
      stats[status.key] = leads.filter((l) => l.status === status.key).length;
    });
    return stats;
  }, [leads]);

  // Konverziós arányok
  const conversionStats = useMemo(() => {
    const total = leads.length;
    const won = pipelineStats.won || 0;
    const lost = pipelineStats.lost || 0;
    const closed = won + lost;
    const active = total - closed;
    
    return {
      total,
      active,
      won,
      lost,
      closed,
      winRate: closed > 0 ? (won / closed) * 100 : 0,
      conversionRate: total > 0 ? (won / total) * 100 : 0
    };
  }, [leads, pipelineStats]);

  // Skeleton elemek (konstans, memoizálva)
  const skeletonListItems = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  const handleAddLead = useCallback(async () => {
    if (isSubmitting) return;

    // Validáció
    const validation = validateForm(newLead, {
      name: ['required', { type: 'length', min: 2, max: 100 }],
      email: [{ type: 'length', min: 0, max: 0 }], // Opcionális, de ha van, akkor valid legyen
      phone: [{ type: 'length', min: 0, max: 0 }] // Opcionális, de ha van, akkor valid legyen
    });

    // Email validáció (ha van megadva)
    if (newLead.email && !validateEmail(newLead.email)) {
      setFieldErrors({ email: 'Érvényes email cím szükséges' });
      useToastStore.getState().error('Érvényes email cím szükséges');
      return;
    }

    // Telefon validáció (ha van megadva)
    if (newLead.phone && !validatePhone(newLead.phone)) {
      setFieldErrors({ phone: 'Érvényes telefonszám szükséges' });
      useToastStore.getState().error('Érvényes telefonszám szükséges');
      return;
    }

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    setFieldErrors({});

    setIsSubmitting(true);
    try {
      await addLead(newLead);
      
      // Email küldése, ha van email cím és be van állítva az email service
      if (newLead.email && isEmailConfigured()) {
        try {
          await sendTemplatedEmail('lead-welcome', {
            name: newLead.name,
            email: newLead.email
          }, {
            to: newLead.email,
            subject: 'Üdvözöljük a SmartCRM-ben!'
          });
          if (import.meta.env.DEV) {
            console.debug('[LeadsPage] Welcome email sent to:', newLead.email);
          }
        } catch (emailError) {
          // Email hiba nem akadályozza meg a lead létrehozását
          if (import.meta.env.DEV) {
            console.warn('[LeadsPage] Failed to send welcome email:', emailError);
          }
        }
      }
      
      setNewLead({
        name: '',
        email: '',
        phone: '',
        source: 'website',
        status: 'new',
        rating: 'warm',
        notes: '',
        apartmentInterest: '',
        budget: '',
        assignedTo: ''
      });
      setFieldErrors({});
      setShowAddLead(false);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a lead hozzáadásakor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [newLead, isSubmitting, addLead, setShowAddLead]);

  const handleUpdateLead = useCallback(async () => {
    if (!editingLead || isSubmitting) return;

    // Validáció
    const validation = validateForm(editingLead, {
      name: ['required', { type: 'length', min: 2, max: 100 }],
      email: [{ type: 'length', min: 0, max: 0 }], // Opcionális, de ha van, akkor valid legyen
      phone: [{ type: 'length', min: 0, max: 0 }] // Opcionális, de ha van, akkor valid legyen
    });

    // Email validáció (ha van megadva)
    if (editingLead.email && !validateEmail(editingLead.email)) {
      useToastStore.getState().error('Érvényes email cím szükséges');
      return;
    }

    // Telefon validáció (ha van megadva)
    if (editingLead.phone && !validatePhone(editingLead.phone)) {
      useToastStore.getState().error('Érvényes telefonszám szükséges');
      return;
    }

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLead(editingLead.id, editingLead);
      setEditingLead(null);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a lead frissítésekor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingLead, updateLead, isSubmitting, setEditingLead]);

  const handleDeleteLead = useCallback((id) => {
    const lead = leads.find((l) => l.id === id);
    setDeleteConfirm({
      id,
      message: `Biztosan törölni szeretnéd a leadet${lead?.name ? ` (${lead.name})` : ''}?`
    });
  }, [leads]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteLead(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a lead törlésekor:', e);
      }
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteLead]);

  const handleBulkStatusChange = useCallback(async (newStatus) => {
    if (selectedLeads.length === 0 || !newStatus) return;
    
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedLeads.map((id) => setLeadStatus(id, newStatus))
      );
      useToastStore.getState().success(`${selectedLeads.length} lead státusza frissítve.`);
      setSelectedLeads([]);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk státusz változtatáskor:', e);
      }
      useToastStore.getState().error('Hiba a státusz változtatáskor.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLeads, setLeadStatus]);

  const handleBulkDelete = useCallback(() => {
    if (selectedLeads.length === 0) return;
    setBulkDeleteConfirm(true);
  }, [selectedLeads.length]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedLeads.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedLeads.map((id) => deleteLead(id))
      );
      useToastStore.getState().success(`${selectedLeads.length} lead törölve.`);
      setSelectedLeads([]);
      setBulkDeleteConfirm(false);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk törléskor:', e);
      }
      useToastStore.getState().error('Hiba a törléskor.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedLeads, deleteLead]);

  const handleToggleLeadSelection = useCallback((leadId) => {
    setSelectedLeads((prev) => {
      if (prev.includes(leadId)) {
        return prev.filter((id) => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  }, []);

  const handleSelectAllLeads = useCallback(() => {
    if (selectedLeads.length === filteredLeads.length) {
      // Ha minden lead ki van jelölve, töröljük a kijelölést
      setSelectedLeads([]);
    } else {
      // Ha nem minden lead van kijelölve, jelöljük ki az összeset
      const allLeadIds = filteredLeads.map((lead) => lead.id);
      setSelectedLeads(allLeadIds);
    }
  }, [selectedLeads.length, filteredLeads]);

  const handleFileImport = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Excel fájl kezelése  ExcelJS-sel sor háttérszín (fill) olvasása
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      try {
        const ExcelJS = (await import('exceljs')).default;
        const buffer = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => reject(new Error('Fájl olvasása sikertelen'));
          r.readAsArrayBuffer(file);
        });
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);
        const ws = wb.worksheets[0] || wb.getWorksheet(1);
        if (!ws) {
          useToastStore.getState().error('Excel fájl üres vagy nem tartalmaz munkalapot.');
          return;
        }
        const headerRow = ws.getRow(1);
        const headers = [];
        let col = 1;
        while (col <= 200) {
          const v = headerRow.getCell(col).value;
          if (v == null || v === '') break;
          headers.push(String(v).trim());
          col++;
        }
        const colCount = headers.length;
        if (colCount === 0) {
          useToastStore.getState().error('Excel fájl üres vagy csak fejlécet tartalmaz.');
          return;
        }
        headers.push('szín');
        const jsonData = [headers];
        ws.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const values = [];
          for (let c = 1; c <= colCount; c++) {
            const cell = row.getCell(c);
            let v = cell.value;
            if (v instanceof Date) v = v.toISOString().split('T')[0];
            else if (v != null) v = String(v).trim();
            else v = '';
            values.push(v);
          }
          const fill = row.getCell(1).style?.fill;
          const szin = excelFillToLeadColor(fill);
          values.push(szin ?? '');
          jsonData.push(values);
        });
        const result = importLeadsFromExcel(jsonData);
        if (result.success) {
          const msg = result.skipped > 0
            ? `Sikeres import: ${result.count} lead hozzáadva, ${result.skipped} kihagyva (egyezés)`
            : `Sikeres import: ${result.count} lead hozzáadva`;
          useToastStore.getState().success(msg);
        } else {
          useToastStore.getState().error(`Hiba az import során: ${result.error}`);
        }
        setShowLeadImport(false);
      } catch (error) {
        useToastStore.getState().error(`Hiba az Excel fájl feldolgozása során: ${error.message}`);
      }
      return;
    }

    // CSV és JSON fájl kezelése
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const result = importLeadsFromJSON(content);
        if (result.success) {
          const msg = result.skipped > 0 
            ? `Sikeres import: ${result.count} lead hozzáadva, ${result.skipped} kihagyva (egyezés)`
            : `Sikeres import: ${result.count} lead hozzáadva`;
          useToastStore.getState().success(msg);
        } else {
          useToastStore.getState().error(`Hiba az import során: ${result.error}`);
        }
      } else if (file.name.endsWith('.csv')) {
        const result = importLeadsFromCSV(content);
        if (result.success) {
          const msg = result.skipped > 0 
            ? `Sikeres import: ${result.count} lead hozzáadva, ${result.skipped} kihagyva (egyezés)`
            : `Sikeres import: ${result.count} lead hozzáadva`;
          useToastStore.getState().success(msg);
        } else {
          useToastStore.getState().error(`Hiba az import során: ${result.error}`);
        }
      }
      setShowLeadImport(false);
    };
    reader.readAsText(file);
  }, [importLeadsFromJSON, importLeadsFromCSV, importLeadsFromExcel, setShowLeadImport]);

  const downloadCSVTemplate = useCallback(() => {
    const sampleCSV = 'name,email,phone,source,notes\nTeszt Elek,teszt@example.com,+36201234567,Weboldal,Érdekldés 2 szobás lakásról';
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_sablon.csv';
    a.click();
  }, []);

  const handleFilterAll = useCallback(() => {
    setFilter('all');
  }, [setFilter]);

  const handleFilterByStatus = useCallback((statusKey) => {
    setFilter(statusKey);
  }, [setFilter]);

  const handleOpenLeadImport = useCallback(() => {
    setShowLeadImport(true);
  }, [setShowLeadImport]);

  const handleCloseLeadImport = useCallback(() => {
    setShowLeadImport(false);
  }, [setShowLeadImport]);

  const handleCloseAddLead = useCallback(() => {
    setShowAddLead(false);
  }, [setShowAddLead]);

  const handleCloseEditLead = useCallback(() => {
    setEditingLead(null);
  }, [setEditingLead]);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleOpenAddLead = useCallback(() => {
    setNewLead({
      name: '',
      email: '',
      phone: '',
      source: 'website',
      status: 'new',
      rating: 'warm',
      notes: '',
      apartmentInterest: '',
      budget: '',
      assignedTo: ''
    });
    setFieldErrors({});
    setShowAddLead(true);
  }, [setShowAddLead]);

  const handleEditLead = useCallback((lead) => {
    setEditingLead(lead);
  }, [setEditingLead]);

  const handleNewLeadChange = useCallback((field, value) => {
    setNewLead((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingLeadChange = useCallback((field, value) => {
    setEditingLead((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  const leadExportColumns = useMemo(() => [
    { key: 'name', label: 'Név' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon' },
    { key: 'source', label: 'Forrás' },
    { key: 'status', label: 'Státusz' },
    { key: 'rating', label: 'Értékelés' },
    { key: 'notes', label: 'Megjegyzés' },
    { key: 'createdAt', label: 'Létrehozva' }
  ], []);

  const getExportData = useCallback(() => {
    return selectedLeads.length > 0 
      ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
      : filteredLeads;
  }, [filteredLeads, selectedLeads]);

  const handleExportCSV = useCallback(() => {
    const dataToExport = getExportData();
    const filename = selectedLeads.length > 0
      ? `leadek_kivalasztott_${todayISO()}.csv`
      : `leadek_${todayISO()}.csv`;
    exportToCSV(dataToExport, leadExportColumns, filename);
    if (selectedLeads.length > 0) {
      useToastStore.getState().success(`${selectedLeads.length} kiválasztott lead exportálva CSV formátumban.`);
    }
  }, [getExportData, selectedLeads, leadExportColumns]);

  const handleExportExcel = useCallback(() => {
    const dataToExport = getExportData();
    const filename = selectedLeads.length > 0
      ? `leadek_kivalasztott_${todayISO()}.xlsx`
      : `leadek_${todayISO()}.xlsx`;
    exportToExcel(dataToExport, leadExportColumns, filename);
    if (selectedLeads.length > 0) {
      useToastStore.getState().success(`${selectedLeads.length} kiválasztott lead exportálva Excel formátumban.`);
    }
  }, [getExportData, selectedLeads, leadExportColumns]);

  const handleExportJSON = useCallback(() => {
    const dataToExport = selectedLeads.length > 0 
      ? filteredLeads.filter((lead) => selectedLeads.includes(lead.id))
      : filteredLeads;
    const filename = selectedLeads.length > 0
      ? `leadek_kivalasztott_${todayISO()}.json`
      : `leadek_${todayISO()}.json`;
    exportToJSON(dataToExport, filename);
    if (selectedLeads.length > 0) {
      useToastStore.getState().success(`${selectedLeads.length} kiválasztott lead exportálva JSON formátumban.`);
    }
  }, [filteredLeads, selectedLeads]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM  Leadek');
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 leads-page">
      <div className="leads-toolbar">
        <h2 className="leads-title dark:text-slate-100">Leadek kezelése</h2>
        {isLoading && (
          <div className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite" aria-busy="true">Betöltés...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 px-3 py-1 rounded" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <div className="toolbar-actions no-print">
          <button
            className="toolbar-btn secondary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            onClick={fetchFromApi}
            disabled={isLoading}
            aria-label="Adatok frissítése"
            title="Adatok frissítése"
          >
            <RefreshCw /> Frissítés
          </button>
          <button
            className="toolbar-btn primary dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={handleOpenLeadImport}
          >
            <Plus /> Import
          </button>
          <button
            className="toolbar-btn secondary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
          <button
            className="toolbar-btn secondary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            onClick={handleExportExcel}
          >
            Export Excel
          </button>
          {canEditLeads('leads') && (
            <button
              className="toolbar-btn primary dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleOpenAddLead}
            >
              <Plus /> Új lead
            </button>
          )}
        </div>
      </div>

      {/* Konverziós arányok - redesign */}
      <div className="mb-4 flex justify-end">
        <div className="stats-badge dark:bg-slate-800">
          <div className="stat-item">
            <div className="stat-value dark:text-slate-100">{conversionStats.total}</div>
            <div className="stat-label dark:text-slate-400">Összes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value dark:text-slate-100">{conversionStats.active}</div>
            <div className="stat-label dark:text-slate-400">Aktív</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value ${conversionStats.winRate >= 50 ? 'highlight' : 'warning'} dark:text-green-400`}>
              {conversionStats.winRate.toFixed(1)}%
            </div>
            <div className="stat-label dark:text-slate-400">Win rate</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value ${conversionStats.conversionRate >= 20 ? 'highlight' : 'warning'} dark:text-green-400`}>
              {conversionStats.conversionRate.toFixed(1)}%
            </div>
            <div className="stat-label dark:text-slate-400">Konverzió</div>
          </div>
        </div>
      </div>

      {/* Bal: Sales Pipeline (1/3) | Jobb: Leadek (2/3) */}
      <div className="leads-page-content">
        {/* Bal: Pipeline  vertikális lista sorokkal */}
        <div className="sales-pipeline">
          {/* Keres */}
          <div className="pipeline-search">
            <label htmlFor="lead-search" className="sr-only">Keresés lead-ek között</label>
            <input
              id="lead-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés név, email, telefon..."
              aria-label="Keresés lead-ek között"
            />
          </div>

          {/* Összesen */}
          <button
            type="button"
            className={`pipeline-total ${filter === 'all' ? 'active' : ''}`}
            onClick={handleFilterAll}
            aria-pressed={filter === 'all'}
          >
            <span className="total-label"> Összesen</span>
            <span className="total-count">{leads.length}</span>
          </button>

          {/* Aktív szakaszok */}
          <div className="pipeline-group">
            <div className="group-label">AKTÍV</div>
            {leadStatuses
              .filter(s => activeStatuses.includes(s.key))
              .map((status) => {
                const count = getLeadsByStatus(status.key).length;
                const isActive = filter === status.key;
                const color = statusColorMap[status.key] || '#3b82f6';
                return (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() => handleFilterByStatus(status.key)}
                    className={`pipeline-row ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span className="row-indicator" style={{ background: color }} />
                    <span className="row-label">{status.label}</span>
                    <span className="row-count">{count}</span>
                  </button>
                );
              })}
          </div>

          {/* Lezárt */}
          <div className="pipeline-group">
            <div className="group-label">LEZÁRT</div>
            {leadStatuses
              .filter(s => closedStatuses.includes(s.key))
              .map((status) => {
                const count = getLeadsByStatus(status.key).length;
                const isActive = filter === status.key;
                const color = statusColorMap[status.key] || '#64748b';
                return (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() => handleFilterByStatus(status.key)}
                    className={`pipeline-row ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span className="row-indicator" style={{ background: color }} />
                    <span className="row-label">{status.label}</span>
                    <span className="row-count">{count}</span>
                  </button>
                );
              })}
          </div>

          {/* Várakozik */}
          <div className="pipeline-group">
            <div className="group-label">VÁRAKOZIK</div>
            {leadStatuses
              .filter(s => waitingStatuses.includes(s.key))
              .map((status) => {
                const count = getLeadsByStatus(status.key).length;
                const isActive = filter === status.key;
                const color = statusColorMap[status.key] || '#eab308';
                return (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() => handleFilterByStatus(status.key)}
                    className={`pipeline-row ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span className="row-indicator" style={{ background: color }} />
                    <span className="row-label">{status.label}</span>
                    <span className="row-count">{count}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Jobb: Leadek lista (2/3) */}
        <div className="leads-list-container">
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-16rem)]" id="leads-list-column">
          {isLoading && filteredLeads.length === 0 ? (
            <div className="mt-2" aria-live="polite" aria-busy="true">
              <Skeleton variant="title" className="mb-3" width="200px" />
              <div className="space-y-2">
                {skeletonListItems.map((i) => (
                  <SkeletonListItem key={i} />
                ))}
              </div>
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Leadek ({filteredLeads.length})</h3>
                {canEditLeads('leads') && (
                  <Button
                    onClick={handleSelectAllLeads}
                    variant="ghost"
                    size="sm"
                    aria-label={selectedLeads.length === filteredLeads.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
                  >
                    {selectedLeads.length === filteredLeads.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
                  </Button>
                )}
              </div>
              {selectedLeads.length > 0 && canEditLeads('leads') && (
                <Card className="mb-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {selectedLeads.length} lead kiválasztva
                    </span>
                    <div className="flex gap-2">
                      <label htmlFor="bulk-status-select" className="sr-only">Státusz változtatása kiválasztott leadekre</label>
                      <select
                        id="bulk-status-select"
                        onChange={(e) => handleBulkStatusChange(e.target.value)}
                        className="text-xs border rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        defaultValue=""
                        disabled={isSubmitting}
                        aria-label="Státusz változtatása kiválasztott leadekre"
                      >
                        <option value="" disabled>Státusz változtatása...</option>
                        {leadStatuses.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                      <Button onClick={handleBulkDelete} variant="danger" size="sm" disabled={isSubmitting} loading={isSubmitting}>Törlés</Button>
                      <Button onClick={() => setSelectedLeads([])} variant="ghost" size="sm">Kijelölés törlése</Button>
                      <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={isSubmitting} title="Kiválasztott leadek exportálása CSV">Export CSV</Button>
                      <Button onClick={handleExportJSON} variant="outline" size="sm" disabled={isSubmitting} title="Kiválasztott leadek exportálása JSON">Export JSON</Button>
                    </div>
                  </div>
                </Card>
              )}
              {filteredLeads.length > 0 && (
                <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rendezés:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSort('name')}
                      className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'name' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      aria-label={`Rendezés név szerint ${sortConfig.field === 'name' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                    >
                      Név {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                    </button>
                    <button
                      onClick={() => handleSort('status')}
                      className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'status' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      aria-label={`Rendezés státusz szerint ${sortConfig.field === 'status' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                    >
                      Státusz {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                    </button>
                    <button
                      onClick={() => handleSort('createdAt')}
                      className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'createdAt' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      aria-label={`Rendezés dátum szerint ${sortConfig.field === 'createdAt' && sortConfig.direction === 'asc' ? 'növekv' : 'csökken'}`}
                    >
                      Dátum {sortConfig.field === 'createdAt' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeads.includes(lead.id);
                  const excelColorClass = lead.leadColor 
                    ? `excel-${lead.leadColor}` 
                    : '';
                  return (
                    <div 
                      key={lead.id} 
                      className={`lead-card dark:bg-slate-800 bg-slate-50 ${isSelected ? 'selected' : ''} ${excelColorClass}`}
                      onClick={() => canEditLeads('leads') && handleToggleLeadSelection(lead.id)}
                    >
                      {canEditLeads('leads') && (
                        <div className="lead-checkbox">
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => handleToggleLeadSelection(lead.id)} 
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Lead kijelölése: ${lead.name}`} 
                          />
                        </div>
                      )}
                      
                      <div className="lead-avatar">
                        {getInitials(lead.name)}
                      </div>
                      
                      <div className="lead-content">
                        <div className="lead-header">
                          <h4 className="lead-name dark:text-slate-100">{lead.name}</h4>
                          <span 
                            className={`lead-status ${getStatusBadgeClass(lead.status)}`}
                            style={getStatusBadgeStyle(lead.status)}
                          >
                            {statusLabels[lead.status] || lead.status}
                          </span>
                        </div>
                        
                        <div className="lead-contact">
                          {lead.email && <span className="lead-email dark:text-slate-400">{lead.email}</span>}
                          {lead.phone && <span className="lead-phone dark:text-slate-400">{lead.phone}</span>}
                        </div>
                        
                        {lead.notes && (
                          <div className="lead-note dark:text-slate-500">
                            {lead.notes}
                          </div>
                        )}
                        
                        <div className="lead-meta">
                          <span className="lead-source dark:text-slate-500">
                            {leadSources.find((s) => s.key === lead.source)?.label || lead.source}
                          </span>
                          {lead.createdAt && (
                            <span className="lead-date dark:text-slate-500">
                              {formatTimeAgo(lead.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="lead-actions" onClick={(e) => e.stopPropagation()}>
                        <label htmlFor={`lead-status-${lead.id}`} className="sr-only">Státusz változtatása</label>
                        <select 
                          id={`lead-status-${lead.id}`} 
                          value={lead.status} 
                          onChange={(e) => setLeadStatus(lead.id, e.target.value)} 
                          className="status-dropdown dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                          disabled={!canEditLeads('leads')}
                          aria-label={`Státusz változtatása: ${lead.name}`}
                        >
                          {leadStatuses.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                        {canEditLeads('leads') && (
                          <>
                            <button 
                              className="action-btn dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                              onClick={() => handleEditLead(lead)} 
                              aria-label={`Lead szerkesztése: ${lead.name}`}
                            >
                              <Edit2 />
                            </button>
                            <button 
                              className="action-btn dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                              onClick={() => handleDeleteLead(lead.id)} 
                              aria-label={`Lead törlése: ${lead.name}`}
                            >
                              <Trash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card>
              {filter !== 'all' || searchQuery ? (
                <EmptyStateWithFilter
                  title="Nincsenek leadek"
                  description="A kiválasztott szrkkel nem található lead. Próbáld meg módosítani a szrket vagy keresési feltételeket."
                  onClearFilter={() => { setFilter('all'); setSearchQuery(''); }}
                />
              ) : (
                <EmptyState icon={Plus} title="Még nincsenek leadek" description="Kezdj el leadeket hozzáadni az üzleti lehetségek követéséhez." actionLabel="Új lead hozzáadása" onAction={canEditLeads('leads') ? () => setShowAddLead(true) : undefined} />
              )}
            </Card>
          )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={showLeadImport}
        onClose={handleCloseLeadImport}
        title="Lead import"
        size="md"
      >
            <div className="space-y-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                <div className="font-medium text-sm dark:text-gray-200 mb-1">Excel fájl</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Oszlopok: name, email, phone, source, notes. Szín: Excel sor háttérszíne vagy »szín« oszlop (zöld=meleg, piros=Késbb, szürke=Nem aktuális, fekete=elveszett)  a kártyák ez alapján színezdnek.</div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="w-full text-sm dark:text-gray-200 dark:file:text-gray-200"
                  aria-label="Excel fájl kiválasztása lead importhoz"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                <div className="font-medium text-sm dark:text-gray-200 mb-1">CSV fájl</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Oszlopok: name, email, phone, source, notes</div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  className="w-full text-sm dark:text-gray-200 dark:file:text-gray-200"
                  aria-label="CSV fájl kiválasztása lead importhoz"
                />
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                <div className="font-medium text-sm dark:text-gray-200 mb-1">JSON fájl</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tömbben objektumok: {'{name, email, phone, source, notes}'}</div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  aria-label="JSON fájl kiválasztása lead importhoz"
                  className="w-full text-sm dark:text-gray-200 dark:file:text-gray-200"
                />
              </div>

              <Button
                onClick={downloadCSVTemplate}
                variant="secondary"
                className="w-full"
              >
                Sablon letöltése (CSV)
              </Button>
            </div>
      </Modal>

      {/* Add Lead Form - csak ha van edit jogosultság */}
      {showAddLead && canEditLeads('leads') && (
        <div className="mt-4 bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Új lead hozzáadása</h3>
            <Button onClick={handleCloseAddLead} variant="ghost" size="sm" aria-label="Bezárás">
              <X />
            </Button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddLead();
            }}
            onKeyDown={(e) => {
              // Ctrl/Cmd + S: Mentés
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleAddLead();
              }
              // Escape: Bezárás
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCloseAddLead();
              }
            }}
          >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField
              label="Név"
              htmlFor="new-lead-name"
              required
              error={fieldErrors.name}
            >
              <input
                id="new-lead-name"
                type="text"
                value={newLead.name}
                onChange={(e) => {
                  handleNewLeadChange('name', e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: null }));
                  }
                }}
                className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.name ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300'
                }`}
                placeholder="Teljes név"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'new-lead-name-error' : undefined}
                autoComplete="name"
              />
            </FormField>
            <FormField
              label="Email"
              htmlFor="new-lead-email"
              error={fieldErrors.email}
            >
              <input
                id="new-lead-email"
                type="email"
                value={newLead.email}
                onChange={(e) => {
                  handleNewLeadChange('email', e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: null }));
                  }
                }}
                className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.email ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'new-lead-email-error' : undefined}
                autoComplete="email"
              />
            </FormField>
            <FormField
              label="Telefon"
              htmlFor="new-lead-phone"
              error={fieldErrors.phone}
            >
              <input
                id="new-lead-phone"
                type="tel"
                value={newLead.phone}
                onChange={(e) => {
                  handleNewLeadChange('phone', e.target.value);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: null }));
                  }
                }}
                className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300'
                }`}
                placeholder="+36 20 123 4567"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'new-lead-phone-error' : undefined}
                autoComplete="tel"
              />
            </FormField>
            <div>
              <label htmlFor="new-lead-source" className="block text-xs text-emerald-700 dark:text-emerald-300 mb-1">Forrás</label>
              <select
                id="new-lead-source"
                value={newLead.source}
                onChange={(e) => handleNewLeadChange('source', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {leadSources.map((source) => (
                  <option key={source.key} value={source.key}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-lead-status" className="block text-xs text-emerald-700 dark:text-emerald-300 mb-1">Státusz</label>
              <select
                id="new-lead-status"
                value={newLead.status}
                onChange={(e) => handleNewLeadChange('status', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {leadStatuses.map((status) => (
                  <option key={status.key} value={status.key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-lead-rating" className="block text-xs text-emerald-700 dark:text-emerald-300 mb-1">Értékelés</label>
              <select
                id="new-lead-rating"
                value={newLead.rating}
                onChange={(e) => handleNewLeadChange('rating', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {leadRatings.map((rating) => (
                  <option key={rating.key} value={rating.key}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label htmlFor="new-lead-notes" className="block text-xs text-emerald-700 dark:text-emerald-300 mb-1">Megjegyzés</label>
              <textarea
                id="new-lead-notes"
                value={newLead.notes}
                onChange={(e) => handleNewLeadChange('notes', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                placeholder="Részletek az érdekldésrl..."
                aria-label="Lead megjegyzése"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="submit"
              variant="success"
              className="flex-1"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Mentés
            </Button>
            <Button
              type="button"
              onClick={handleCloseAddLead}
              variant="secondary"
            >
              Mégse
            </Button>
          </div>
          </form>
        </div>
      )}

      {/* Edit Lead Modal - csak ha van edit jogosultság */}
      {canEditLeads('leads') && (
        <Modal
          isOpen={!!editingLead}
          onClose={handleCloseEditLead}
          title="Lead szerkesztése"
          size="md"
        >
      {editingLead && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateLead();
            }}
            onKeyDown={(e) => {
              // Ctrl/Cmd + S: Mentés
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleUpdateLead();
              }
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-lead-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Név *</label>
                <input
                  id="edit-lead-name"
                  type="text"
                  value={editingLead.name || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="edit-lead-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    id="edit-lead-email"
                    type="email"
                    value={editingLead.email || ''}
                    onChange={(e) => handleEditingLeadChange('email', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="email"
                  />
              </div>
              <div>
                <label htmlFor="edit-lead-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input
                  id="edit-lead-phone"
                  type="tel"
                  value={editingLead.phone || ''}
                  onChange={(e) => handleEditingLeadChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="edit-lead-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forrás</label>
                <select
                  id="edit-lead-source"
                  value={editingLead.source || 'website'}
                  onChange={(e) => handleEditingLeadChange('source', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {leadSources.map((source) => (
                    <option key={source.key} value={source.key}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-lead-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Státusz</label>
                <select
                  id="edit-lead-status"
                  value={editingLead.status || 'new'}
                  onChange={(e) => handleEditingLeadChange('status', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {leadStatuses.map((status) => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-lead-rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Értékelés</label>
                <select
                  id="edit-lead-rating"
                  value={editingLead.rating || 'warm'}
                  onChange={(e) => handleEditingLeadChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {leadRatings.map((rating) => (
                    <option key={rating.key} value={rating.key}>
                      {rating.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-lead-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
                <textarea
                  id="edit-lead-notes"
                  value={editingLead.notes || ''}
                  onChange={(e) => handleEditingLeadChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  aria-label="Lead megjegyzése"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
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
                onClick={() => handleDeleteLead(editingLead.id)}
                variant="danger"
              >
                Törlés
              </Button>
              <Button
                type="button"
                onClick={handleCloseEditLead}
                variant="secondary"
              >
                Mégse
              </Button>
            </div>
          </form>
      )}
      </Modal>
      )}

      {/* Törlés megersítés - csak ha van edit jogosultság */}
      {canEditLeads('leads') && (
        <>
          <ConfirmDialog
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Lead törlése"
            message={deleteConfirm?.message || 'Biztosan törölni szeretnéd ezt a leadet?'}
            confirmText="Igen, törlés"
            cancelText="Mégse"
            variant="danger"
          />
          <ConfirmDialog
            isOpen={bulkDeleteConfirm}
            onClose={() => setBulkDeleteConfirm(false)}
            onConfirm={confirmBulkDelete}
            title="Leadek törlése"
            message={`Biztosan törölni szeretnéd a ${selectedLeads.length} kiválasztott leadet?`}
            variant="danger"
          />
        </>
      )}
    </div>
  );
};

export default LeadsPage;

