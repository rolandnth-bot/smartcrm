import { useState, useEffect, useCallback, useMemo } from 'react';
import useMarketingStore, {
  campaignChannels,
  campaignStatuses
} from '../stores/marketingStore';
import useLeadsStore, { leadSources } from '../stores/leadsStore';
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

// Státusz színek (komponensen kívül, hogy ne jöjjön létre minden render során)
const statusColors = {
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  paused: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
  completed: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
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

  const { leads } = useLeadsStore();
  const { canEdit: canEditMarketing } = usePermissions();

  useEffect(() => {
    document.title = 'Marketing - SmartCRM';
    fetchFromApi();
  }, [fetchFromApi]);

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

  // Leadek forrás szerint (marketing statisztika)
  const leadsBySource = useMemo(() => leadSources.map((src) => ({
    ...src,
    count: leads.filter((l) => (l.source || '').toLowerCase() === src.key).length
  })), [leads]);

  // Szűrt és rendezett leadek forrás szerint (csak azok, amelyeknek van leadje)
  const filteredLeadsBySource = useMemo(() => 
    sortBy(
      leadsBySource.filter((s) => s.count > 0),
      (s) => s.count,
      'desc'
    ),
    [leadsBySource]
  );

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
      
      // Real-time validáció a name mezőhöz
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
    printToPDF('SmartCRM – Marketing');
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Kampányok lista */}
        <div className="md:col-span-2">
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
                          {c.endDate ? ` – ${c.endDate}` : ''}
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
                <div className="text-4xl mb-2" aria-hidden="true">📊</div>
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

        {/* Marketing statisztikák – Leadek forrás szerint */}
        <Card>
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Leadek forrás szerint</h3>
          {filteredLeadsBySource.length > 0 ? (
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
              Nincs még lead forrás adat. <br />
              <span className="text-xs dark:text-gray-400">A Leadek oldalon a források automatikusan megjelennek.</span>
            </div>
          )}
        </Card>

        {/* Tartalom naptár */}
        <div className="md:col-span-2">
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
              placeholder="Opcionális megjegyzések…"
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

      {/* Törlés megerősítés - csak ha van edit jogosultság */}
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
