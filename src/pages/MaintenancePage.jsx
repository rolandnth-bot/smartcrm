/**
 * Karbantartás (Maintenance)  bejelentések kezelése
 * Dátum, lakás, összeg, leírás, megjegyzés, prioritás. Naptár. Lokális store (localStorage).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import useMaintenanceStore, { MAINTENANCE_PRIORITIES } from '../stores/maintenanceStore';
import useApartmentsStore from '../stores/apartmentsStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MaintenanceCalendar from '../components/maintenance/MaintenanceCalendar';
import { Plus, Trash2, X } from '../components/common/Icons';
import EmptyState from '../components/common/EmptyState';
import { formatCurrencyHUF } from '../utils/numberUtils';
import { formatDate } from '../utils/dateUtils';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';

const MaintenancePage = () => {
  const {
    maintenanceExpenses,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    addMaintenance,
    removeMaintenance,
    updateMaintenance,
    getFiltered,
    getStats
  } = useMaintenanceStore();

  const { apartments, fetchFromApi: fetchApartments } = useApartmentsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    apartmentId: '',
    apartmentName: '',
    amount: '',
    description: '',
    notes: '',
    priority: 'normal'
  });

  const filtered = useMemo(() => getFiltered(), [getFiltered, filter, searchQuery, maintenanceExpenses]);
  const stats = useMemo(() => {
    const now = new Date();
    return {
      all: getStats(),
      thisMonth: getStats(now.getFullYear(), now.getMonth() + 1)
    };
  }, [getStats, maintenanceExpenses]);

  useEffect(() => {
    document.title = 'Karbantartás - SmartCRM';
    fetchApartments();
  }, [fetchApartments]);

  const getApartmentName = useCallback((id) => {
    if (!id) return '';
    const apt = apartments.find((a) => String(a.id) === String(id));
    return apt?.name || `#${id}`;
  }, [apartments]);

  const handleOpenAdd = useCallback(() => {
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      apartmentId: '',
      apartmentName: '',
      amount: '',
      description: '',
      notes: '',
      priority: 'normal'
    });
    setShowAdd(true);
  }, []);

  const handleAddForDate = useCallback((isoDate) => {
    setNewEntry({
      date: isoDate,
      apartmentId: '',
      apartmentName: '',
      amount: '',
      description: '',
      notes: '',
      priority: 'normal'
    });
    setShowAdd(true);
  }, []);

  const handleAdd = useCallback(() => {
    if (!newEntry.description?.trim()) {
      return;
    }
    const amount = parseInt(newEntry.amount, 10);
    if (isNaN(amount) || amount < 0) {
      return;
    }
    const apartmentId = newEntry.apartmentId || null;
    const apartmentName = apartmentId ? getApartmentName(apartmentId) : (newEntry.apartmentName || '');
    setIsSubmitting(true);
    try {
      addMaintenance({
        date: newEntry.date,
        apartmentId,
        apartmentName,
        amount,
        description: newEntry.description.trim(),
        notes: (newEntry.notes || '').trim(),
        priority: newEntry.priority || 'normal'
      });
      setShowAdd(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [newEntry, addMaintenance, getApartmentName]);

  const handleDelete = useCallback((id) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      removeMaintenance(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, removeMaintenance]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => [currentYear, currentYear - 1, currentYear - 2], [currentYear]);

  const getExportData = useCallback(() => {
    const prioLabels = Object.fromEntries(MAINTENANCE_PRIORITIES.map((p) => [p.key, p.label]));
    return filtered.map((item) => ({
      date: formatDate(item.date),
      apartmentName: item.apartmentName || '-',
      amount: item.amount,
      description: item.description || '',
      notes: item.notes || '',
      priority: prioLabels[item.priority || 'normal'] || 'Normál'
    }));
  }, [filtered]);

  const handleExportCSV = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'amount', label: 'Összeg (Ft)' },
      { key: 'description', label: 'Leírás' },
      { key: 'notes', label: 'Megjegyzés' },
      { key: 'priority', label: 'Prioritás' }
    ];
    const data = getExportData();
    exportToCSV(data, columns, `karbantartas_${new Date().toISOString().split('T')[0]}.csv`);
  }, [getExportData]);

  const handleExportExcel = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'amount', label: 'Összeg (Ft)' },
      { key: 'description', label: 'Leírás' },
      { key: 'notes', label: 'Megjegyzés' },
      { key: 'priority', label: 'Prioritás' }
    ];
    const data = getExportData();
    exportToExcel(data, columns, `karbantartas_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [getExportData]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM  Karbantartás');
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200"> Karbantartás</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExportCSV} variant="outline" aria-label="CSV export">
            CSV export
          </Button>
          <Button onClick={handleExportExcel} variant="outline" aria-label="Excel export">
            Excel export
          </Button>
          <Button onClick={handlePrintPDF} variant="outline" aria-label="Nyomtatás / PDF">
            Nyomtatás / PDF
          </Button>
          <Button onClick={handleOpenAdd} variant="primary" aria-label="Új karbantartás bejelentés">
            <Plus /> Bejelentés
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Összes bejelentés</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.all.count}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Összes költség</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrencyHUF(stats.all.totalAmount)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Ebben a hónapban</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.thisMonth.count}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Havi költség</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrencyHUF(stats.thisMonth.totalAmount)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MaintenanceCalendar onAddForDate={handleAddForDate} />
        </div>
        <div className="lg:col-span-2">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Keresés (leírás, lakás, megjegyzés)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg w-64"
            aria-label="Keresés"
          />
          <select
            value={filter.apartmentId || ''}
            onChange={(e) => setFilter({ apartmentId: e.target.value || '' })}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
            aria-label="Lakás szr"
          >
            <option value="">Minden lakás</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={filter.priority || ''}
            onChange={(e) => setFilter({ priority: e.target.value || '' })}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
            aria-label="Prioritás szr"
          >
            <option value="">Minden prioritás</option>
            {MAINTENANCE_PRIORITIES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
          <select
            value={filter.year || ''}
            onChange={(e) => setFilter({ year: e.target.value ? parseInt(e.target.value, 10) : null })}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
            aria-label="Év szr"
          >
            <option value="">Minden év</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filter.month || ''}
            onChange={(e) => setFilter({ month: e.target.value ? parseInt(e.target.value, 10) : null })}
            className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
            aria-label="Hónap szr"
          >
            <option value="">Minden hónap</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('hu-HU', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Nincs karbantartás bejelentés"
            message="Új bejelentés a Bejelentés gombbal."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => {
              const prio = MAINTENANCE_PRIORITIES.find((p) => p.key === (m.priority || 'normal'));
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 border dark:border-gray-600 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${prio?.color || 'bg-gray-400'} bg-opacity-25 text-gray-800 dark:text-gray-200`}>
                        {prio?.label || 'Normál'}
                      </span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{m.description}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(m.date)} · {m.apartmentName ? ` ${m.apartmentName}` : ''}
                    </p>
                    {m.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 italic">{m.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.priority || 'normal'}
                      onChange={(e) => updateMaintenance(m.id, { priority: e.target.value })}
                      className="text-xs px-2 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
                      aria-label="Prioritás módosítása"
                    >
                      {MAINTENANCE_PRIORITIES.map((p) => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                      ))}
                    </select>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrencyHUF(m.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                      aria-label={`Karbantartás törlése: ${m.description}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Új karbantartás bejelentés</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} aria-label="Bezárás">
                <X />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="maint-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dátum</label>
                <input
                  id="maint-date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="maint-apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lakás (opcionális)</label>
                <select
                  id="maint-apartment"
                  value={newEntry.apartmentId}
                  onChange={(e) => setNewEntry((p) => ({ ...p, apartmentId: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                >
                  <option value=""> Nincs </option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="maint-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Összeg (Ft) *</label>
                <input
                  id="maint-amount"
                  type="number"
                  min="0"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="maint-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioritás</label>
                <select
                  id="maint-priority"
                  value={newEntry.priority || 'normal'}
                  onChange={(e) => setNewEntry((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                >
                  {MAINTENANCE_PRIORITIES.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="maint-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leírás *</label>
                <input
                  id="maint-desc"
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Pl. Csaptelep csere, Festés"
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="maint-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés (opcionális)</label>
                <textarea
                  id="maint-notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Megjegyzés"
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} disabled={isSubmitting || !newEntry.description?.trim()} variant="primary" className="flex-1">
                  Mentés
                </Button>
                <Button onClick={() => setShowAdd(false)} variant="outline" className="flex-1">Mégse</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Karbantartás törlése"
        message="Biztosan törölni szeretnéd ezt a bejelentést?"
        confirmText="Törlés"
        cancelText="Mégse"
        variant="danger"
      />
    </div>
  );
};

export default MaintenancePage;
