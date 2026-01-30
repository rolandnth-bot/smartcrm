import { useState, useEffect, useCallback, useMemo } from 'react';
import useMarketingStore, {
  campaignChannels,
  campaignStatuses
} from '../stores/marketingStore';
import useLeadsStore, { leadSources, leadStatuses } from '../stores/leadsStore';
import useToastStore from '../stores/toastStore';
import { usePermissions } from '../contexts/PermissionContext';
import { validateForm } from '../utils/validation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonListItem, SkeletonCard } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';
import { Plus, Edit2, Trash2 } from '../components/common/Icons';
import { filterBy, sortBy } from '../utils/arrayUtils';
import ContentCalendar from '../components/marketing/ContentCalendar';
import { excelFillToLeadColor } from '../utils/excelRowColorUtils';

// Státusz színek (komponensen kívül, hogy ne jöjjön létre minden render során)
const statusColors = {
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  paused: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  completed: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
};

// Lead státusz színek  Új érdekld sárga; Késbb amber; Nem aktuális szürke
const leadStatusColors = {
  uj_erdeklodo: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  new: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  kapcsolatfelvetel: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  contacted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  felmeres_tervezve: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
  felmeres_megtortent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
  ajanlat_kuldve: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
  targyalas: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300',
  szerzodes_kuldve: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300',
  alairva: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  aktiv_partner: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  elutasitva: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
  lost: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
  kesobb: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300',
  nem_aktualis: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  offer: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
  negotiation: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300',
  won: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
};

const MarketingPage = () => {
  const {
    campaigns,
    isLoading,
    error,
    showCampaignModal,
    editingCampaign,
    setShowCampaignModal,
    setEditingCampaign,
    fetchFromApi,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getStats
  } = useMarketingStore();

  const { 
    leads, 
    filter,
    searchQuery,
    showLeadImport,
    setFilter,
    setSearchQuery,
    setShowLeadImport,
    getFilteredLeads,
    getLeadsByStatus,
    importLeadsFromJSON,
    importLeadsFromCSV,
    importLeadsFromExcel,
    fetchFromApi: fetchLeads
  } = useLeadsStore();
  const { canEdit: canEditMarketing } = usePermissions();

  useEffect(() => {
    document.title = 'Marketing - SmartCRM';
    fetchFromApi();
    fetchLeads();
  }, [fetchFromApi, fetchLeads]);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    channel: 'website',
    status: 'draft',
    startDate: '',
    endDate: '',
    budget: '',
    notes: ''
  });

  const stats = useMemo(() => getStats(), [getStats, campaigns]);

  // Skeleton elemek (konstans, memoizálva)
  const skeletonCards = useMemo(() => Array.from({ length: 3 }, (_, i) => i), []);

  const statusLabels = useMemo(() => Object.fromEntries(campaignStatuses.map((s) => [s.key, s.label])), []);
  const channelLabels = useMemo(() => Object.fromEntries(campaignChannels.map((c) => [c.key, c.label])), []);

  // Leadek forrás szerint (marketing statisztika) - JAVÍTVA: biztosítjuk hogy a leads tömb betöltdik
  const leadsBySource = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    return leadSources.map((src) => ({
      ...src,
      count: leads.filter((l) => {
        const leadSource = (l.source || '').toLowerCase().trim();
        const sourceKey = src.key.toLowerCase().trim();
        return leadSource === sourceKey;
      }).length
    }));
  }, [leads]);

  // Szrt és rendezett leadek forrás szerint (csak azok, amelyeknek van leadje)
  const filteredLeadsBySource = useMemo(() => {
    if (!leadsBySource || leadsBySource.length === 0) return [];
    return sortBy(
      leadsBySource.filter((s) => s.count > 0),
      (s) => s.count,
      'desc'
    );
  }, [leadsBySource]);

  const openNew = useCallback(() => {
    setForm({
      name: '',
      channel: 'website',
      status: 'draft',
      startDate: '',
      endDate: '',
      budget: '',
      notes: ''
    });
    setFieldErrors({});
    setEditingCampaign(null);
    setShowCampaignModal(true);
  }, [setEditingCampaign, setShowCampaignModal]);

  const openEdit = useCallback((c) => {
    setForm({
      name: c.name || '',
      channel: c.channel || 'website',
      status: c.status || 'draft',
      startDate: c.startDate || '',
      endDate: c.endDate || '',
      budget: c.budget ?? '',
      notes: c.notes || ''
    });
    setFieldErrors({});
    setEditingCampaign(c);
    setShowCampaignModal(true);
  }, [setEditingCampaign, setShowCampaignModal]);

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Real-time validáció a name mezhöz
      if (field === 'name') {
        const validation = validateForm({ name: value }, {
          name: ['required', { type: 'length', min: 2, max: 100 }]
        });
        
        if (validation.isValid) {
          setFieldErrors((prev) => ({ ...prev, name: null }));
        } else {
          setFieldErrors((prev) => ({ ...prev, name: validation.errors.name || null }));
        }
      }
      
      return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    // Validáció
    const validation = validateForm(form, {
      name: ['required', { type: 'length', min: 2, max: 100 }]
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }
    const payload = {
      name: form.name.trim(),
      channel: form.channel,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      budget: form.budget ? Number(form.budget) : 0,
      notes: form.notes.trim() || undefined
    };
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, payload);
      } else {
        await addCampaign(payload);
      }
      setShowCampaignModal(false);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a kampány mentésekor:', e);
      }
    }
  }, [form, editingCampaign, addCampaign, updateCampaign, setShowCampaignModal]);

  const handleDelete = useCallback((id) => {
    const campaign = campaigns.find((c) => c.id === id);
    setDeleteConfirm({
      id,
      message: `Biztosan törölni szeretnéd a kampányt${campaign?.name ? ` (${campaign.name})` : ''}?`
    });
  }, [campaigns]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCampaign(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a kampány törlésekor:', e);
      }
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteCampaign]);

  const handleCloseCampaignModal = useCallback(() => {
    setShowCampaignModal(false);
    setEditingCampaign(null);
  }, [setShowCampaignModal, setEditingCampaign]);

  const campaignExportColumns = useMemo(() => [
    { key: 'name', label: 'Név' },
    { key: 'channelLabel', label: 'Csatorna' },
    { key: 'statusLabel', label: 'Státusz' },
    { key: 'startDate', label: 'Kezdés' },
    { key: 'endDate', label: 'Befejezés' },
    { key: 'budget', label: 'Költségvetés (Ft)' },
    { key: 'notes', label: 'Megjegyzés' }
  ], []);

  const getExportData = useCallback(() => {
    const rows = campaigns.map((c) => ({
      ...c,
      channelLabel: channelLabels[c.channel] || c.channel,
      statusLabel: statusLabels[c.status] || c.status
    }));
    return rows;
  }, [campaigns, channelLabels, statusLabels]);

  const handleExportCSV = useCallback(() => {
    const rows = getExportData();
    exportToCSV(rows, campaignExportColumns, `kampanyok_${new Date().toISOString().split('T')[0]}.csv`);
  }, [getExportData, campaignExportColumns]);

  const handleExportExcel = useCallback(() => {
    const rows = getExportData();
    exportToExcel(rows, campaignExportColumns, `kampanyok_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [getExportData, campaignExportColumns]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM  Marketing');
  }, []);

  // Leadkészlet funkciók
  const filteredLeads = useMemo(() => getFilteredLeads(), [getFilteredLeads, filter, searchQuery, leads]);

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

  const leadExportColumns = useMemo(() => [
    { key: 'name', label: 'Név' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefon' },
    { key: 'source', label: 'Forrás' },
    { key: 'status', label: 'Státusz' },
    { key: 'notes', label: 'Megjegyzés' },
    { key: 'createdAt', label: 'Létrehozva' }
  ], []);

  const handleExportLeadsCSV = useCallback(() => {
    exportToCSV(filteredLeads, leadExportColumns, `leadek_marketing_${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredLeads, leadExportColumns]);

  const handleExportLeadsExcel = useCallback(() => {
    exportToExcel(filteredLeads, leadExportColumns, `leadek_marketing_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredLeads, leadExportColumns]);

  const marketingChannels = useMemo(() => [
    { id: 'website', name: 'Weboldal', status: 'active' },
    { id: 'instagram', name: 'Instagram', status: 'pending' },
    { id: 'facebook', name: 'Facebook', status: 'pending' },
    { id: 'tiktok', name: 'TikTok', status: 'pending' }
  ], []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        {isLoading && (
          <div className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite" aria-busy="true">Betöltés...</div>
        )}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 px-3 py-1 rounded" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-gray-200">Marketing</h2>
        <div className="no-print flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            CSV export
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            Excel export
          </Button>
          <Button onClick={handlePrintPDF} variant="outline">
            Nyomtatás / PDF
          </Button>
          {canEditMarketing('marketing') && (
            <Button onClick={openNew} variant="primary">
              <Plus /> Új kampány
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Marketing csatornák */}
        <Card>
          <h3 className="font-bold text-pink-800 dark:text-pink-300 mb-3">Marketing csatornák</h3>
          <div className="space-y-2">
            {marketingChannels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
              >
                <span className="font-medium dark:text-gray-200">{ch.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ch.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {ch.status === 'active' ? 'Aktív' : 'Hamarosan'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Kampány statisztikák */}
        <Card>
          <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-3">Kampány összesítő</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Összes kampány</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Aktív</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.completed}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Lezárva</div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {stats.totalBudget.toLocaleString()} Ft
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Összes költségvetés</div>
            </div>
          </div>
        </Card>

        {/* Sales Pipeline - sorok, kattintható */}
        <Card>
          <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-3">Sales Pipeline</h3>
          <div className="space-y-2">
            <button
              onClick={handleFilterAll}
              className={`w-full flex justify-between items-center p-2 rounded-lg border transition-all ${
                filter === 'all'
                  ? 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="font-medium dark:text-gray-200">Összes lead</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{leads.length}</span>
            </button>
            {leadStatuses.slice(0, 5).map((status) => {
              const count = getLeadsByStatus(status.key).length;
              const isActive = filter === status.key;
              return (
                <button
                  key={status.key}
                  onClick={() => handleFilterByStatus(status.key)}
                  className={`w-full flex justify-between items-center p-2 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm dark:text-gray-200">{status.label}</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{count}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Kampányok lista */}
        <div className="md:col-span-3">
          <Card title="Kampányok">
            {isLoading && campaigns.length === 0 ? (
              <div className="space-y-2" aria-live="polite" aria-busy="true">
                {skeletonCards.map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium dark:text-gray-200">{c.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${statusColors[c.status] || statusColors.draft}`}
                      >
                        {statusLabels[c.status] || c.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {channelLabels[c.channel] || c.channel}
                      </span>
                      {c.startDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {c.startDate}
                          {c.endDate ? `  ${c.endDate}` : ''}
                        </span>
                      )}
                      {c.budget > 0 && (
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          {Number(c.budget).toLocaleString()} Ft
                        </span>
                      )}
                    </div>
                    {canEditMarketing('marketing') && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)} aria-label={`Kampány szerkesztése: ${c.name}`}>
                          <Edit2 />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)} aria-label={`Kampány törlése: ${c.name}`}>
                          <Trash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500" role="status" aria-live="polite">
                <div className="text-4xl mb-2" aria-hidden="true"></div>
                <p className="dark:text-gray-400">Még nincsenek kampányok.</p>
                {canEditMarketing('marketing') && (
                  <Button onClick={openNew} variant="primary" className="mt-4">
                    <Plus /> Új kampány
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Marketing statisztikák  Leadek forrás szerint */}
        <div className="md:col-span-3">
          <Card>
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Leadek forrás szerint</h3>
          {leads && leads.length > 0 ? (
            filteredLeadsBySource.length > 0 ? (
              <div className="space-y-2">
                {filteredLeadsBySource.map((s) => (
                    <div
                      key={s.key}
                      className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700"
                    >
                      <span className="dark:text-gray-200">{s.label}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{s.count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                Nincs lead a forrásokhoz rendelve. <br />
                <span className="text-xs dark:text-gray-400">Összes lead: {leads.length}</span>
              </div>
            )
          ) : (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
              Nincs még lead adat. <br />
              <span className="text-xs dark:text-gray-400">Használd az Importot vagy a Leadkészlet szekciót az új lead hozzáadásához.</span>
            </div>
          )}
          </Card>
        </div>

        {/* Lead lista */}
        <div className="md:col-span-3">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Leadek ({filteredLeads.length})</h3>
              <div className="no-print flex gap-2">
                <input
                  id="marketing-lead-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés..."
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  aria-label="Keresés lead-ek között"
                />
                <Button onClick={handleOpenLeadImport} variant="primary">
                  <Plus /> Import
                </Button>
                <Button onClick={handleExportLeadsCSV} variant="outline">
                  CSV export
                </Button>
                <Button onClick={handleExportLeadsExcel} variant="outline">
                  Excel export
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]" id="marketing-leads-list-column">
                {filteredLeads.length > 0 ? (
                  <div className="space-y-2">
                    {filteredLeads.map((lead) => {
                      let cardBgClass = 'bg-gray-50 dark:bg-gray-800';
                      let cardBorderClass = 'border-gray-300 dark:border-gray-700';
                      let cardTextClass = '';
                      if (lead.leadColor === 'green') {
                        cardBgClass = 'bg-green-50 dark:bg-green-900';
                        cardBorderClass = 'border-green-400 dark:border-green-600 border-2';
                        cardTextClass = 'text-green-900 dark:text-green-100';
                      } else if (lead.leadColor === 'orange') {
                        cardBgClass = 'bg-amber-50 dark:bg-amber-900';
                        cardBorderClass = 'border-amber-400 dark:border-amber-600 border-2';
                        cardTextClass = 'text-amber-900 dark:text-amber-100';
                      } else if (lead.leadColor === 'gray') {
                        cardBgClass = 'bg-gray-100 dark:bg-gray-700';
                        cardBorderClass = 'border-gray-400 dark:border-gray-500 border-2';
                        cardTextClass = 'text-gray-800 dark:text-gray-200';
                      } else if (lead.leadColor === 'black') {
                        cardBgClass = 'bg-gray-900 dark:bg-black';
                        cardBorderClass = 'border-gray-700 dark:border-gray-500 border-2';
                        cardTextClass = 'text-white dark:text-gray-200';
                      } else if (lead.leadColor === 'red') {
                        cardBgClass = 'bg-red-50 dark:bg-red-900';
                        cardBorderClass = 'border-red-400 dark:border-red-600 border-2';
                        cardTextClass = 'text-red-900 dark:text-red-100';
                      }
                      const nameCls = lead.leadColor === 'black' ? 'text-white' : lead.leadColor === 'green' ? 'text-green-900 dark:text-green-100' : lead.leadColor === 'orange' ? 'text-amber-900 dark:text-amber-100' : lead.leadColor === 'gray' ? 'text-gray-800 dark:text-gray-200' : lead.leadColor === 'red' ? 'text-red-900 dark:text-red-100' : 'dark:text-gray-200';
                      const detailCls = lead.leadColor === 'black' ? 'text-gray-200' : lead.leadColor === 'green' ? 'text-green-800 dark:text-green-200' : lead.leadColor === 'orange' ? 'text-amber-800 dark:text-amber-200' : lead.leadColor === 'gray' ? 'text-gray-700 dark:text-gray-300' : lead.leadColor === 'red' ? 'text-red-800 dark:text-red-200' : 'text-gray-500 dark:text-gray-400';
                      const badgeCls = lead.leadColor === 'green' ? 'bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100' : lead.leadColor === 'orange' ? 'bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100' : lead.leadColor === 'gray' ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100' : lead.leadColor === 'red' ? 'bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100' : 'bg-gray-700 dark:bg-gray-800 text-white';
                      const badgeLabel = lead.leadColor === 'green' ? ' Meleg lead' : lead.leadColor === 'orange' ? ' Késbb' : lead.leadColor === 'gray' ? ' Nem aktuális' : lead.leadColor === 'red' ? ' Nem vette fel' : ' Elveszett';
                      return (
                        <div
                          key={lead.id}
                          className={`p-3 ${cardBgClass} rounded-lg ${cardBorderClass} flex gap-2 items-start transition-all duration-200 hover:shadow-lg ${cardTextClass}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${nameCls}`}>{lead.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${leadStatusColors[lead.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {leadStatuses.find((s) => s.key === lead.status)?.label || lead.status}
                              </span>
                              {lead.leadColor && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeCls}`}>
                                  {badgeLabel}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm ${detailCls}`}>
                              {lead.email && <span className="mr-3">{lead.email}</span>}
                              {lead.phone && <span>{lead.phone}</span>}
                            </div>
                            {lead.notes && <div className={`text-xs mt-1 ${detailCls}`}>{lead.notes}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-500 dark:text-gray-400">
                    {filter !== 'all' || searchQuery ? (
                      <p className="text-sm">A kiválasztott szrkkel nem található lead. Módosítsd a szrket vagy a keresést.</p>
                    ) : (
                      <p className="text-sm">Még nincsenek leadek. Használd az Importot az új lead hozzáadásához.</p>
                    )}
                  </div>
                )}
              </div>
          </Card>
        </div>

        {/* Tartalom naptár */}
        <div className="md:col-span-3">
          <Card>
            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Tartalom naptár</h3>
            <ContentCalendar />
          </Card>
        </div>
      </div>

      {/* Kampány modal - csak ha van edit jogosultság */}
      {canEditMarketing('marketing') && (
        <Modal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setEditingCampaign(null);
          }}
          title={editingCampaign ? 'Kampány szerkesztése' : 'Új kampány'}
          size="md"
        >
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Név *</label>
            <input
              id="campaign-name"
              type="text"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.name ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Kampány neve"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'campaign-name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="campaign-name-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="campaign-channel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Csatorna</label>
              <select
                id="campaign-channel"
                value={form.channel}
                onChange={(e) => handleFormChange('channel', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {campaignChannels.map((ch) => (
                  <option key={ch.key} value={ch.key}>
                    {ch.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="campaign-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Státusz</label>
              <select
                id="campaign-status"
                value={form.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {campaignStatuses.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="campaign-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kezdés</label>
              <input
                id="campaign-startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => handleFormChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="campaign-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Befejezés</label>
              <input
                id="campaign-endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => handleFormChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="campaign-budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Költségvetés (Ft)</label>
            <input
              id="campaign-budget"
              type="number"
              value={form.budget}
              onChange={(e) => handleFormChange('budget', e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="campaign-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
            <textarea
              id="campaign-notes"
              value={form.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Opcionális megjegyzések"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} variant="primary" className="flex-1">
              Mentés
            </Button>
            <Button
              onClick={handleCloseCampaignModal}
              variant="secondary"
            >
              Mégse
            </Button>
          </div>
        </div>
      </Modal>
      )}

      {/* Lead Import Modal */}
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

      {/* Törlés megersítés - csak ha van edit jogosultság */}
      {canEditMarketing('marketing') && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Kampány törlése"
          message={deleteConfirm?.message || 'Biztosan törölni szeretnéd ezt a kampányt?'}
          confirmText="Igen, törlés"
          cancelText="Mégse"
          variant="danger"
        />
      )}
    </div>
  );
};

export default MarketingPage;
