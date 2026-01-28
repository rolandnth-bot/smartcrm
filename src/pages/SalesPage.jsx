import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLeadsStore, { leadStatuses } from '../stores/leadsStore';
import useSalesStore from '../stores/salesStore';
import useApartmentsStore from '../stores/apartmentsStore';
import { usePermissions } from '../contexts/PermissionContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LeadDetailModal from '../components/sales/LeadDetailModal';
import SalesCalendar from '../components/sales/SalesCalendar';
import SalesScriptPanel from '../components/sales/SalesScriptPanel';
import SalesWizardScriptPanel from '../components/sales/SalesWizardScriptPanel';
import { Plus, Edit2 } from '../components/common/Icons';
import { Skeleton, SkeletonCard, SkeletonTableRow } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';
import { formatCurrencyHUF, formatPercent, formatNumber } from '../utils/numberUtils';
import { todayISO } from '../utils/dateUtils';
import useToastStore from '../stores/toastStore';
import { excelFillToLeadColor } from '../utils/excelRowColorUtils';

// Státusz színek – Új érdeklődő sárga; Később amber; Nem aktuális szürke
const statusColors = {
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

const SalesPage = () => {
  const navigate = useNavigate();
  const { 
    leads, 
    getLeadsByStatus, 
    isLoading: leadsLoading, 
    fetchFromApi: fetchLeads,
    filter,
    searchQuery,
    showLeadImport,
    setFilter,
    setSearchQuery,
    setShowLeadImport,
    getFilteredLeads,
    importLeadsFromJSON,
    importLeadsFromCSV,
    importLeadsFromExcel,
    addLead,
    updateLead
  } = useLeadsStore();
  const { apartments, selectedApartment, showEditApartment, setSelectedApartment, setShowEditApartment, fetchFromApi, updateApartment } = useApartmentsStore();
  const {
    salesTargets,
    selectedYear,
    showSalesTargetEdit,
    editingTarget,
    isLoading,
    setSelectedYear,
    setShowSalesTargetEdit,
    setEditingTarget,
    updateSalesTarget,
    generateYearTargets,
    getTotalStats
  } = useSalesStore();

  const { canEdit: canEditSales } = usePermissions();
  const [localTargets, setLocalTargets] = useState(salesTargets);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [addLeadPresetDate, setAddLeadPresetDate] = useState(null);
  const [showSalesWizard, setShowSalesWizard] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showStatusLeadsModal, setShowStatusLeadsModal] = useState(false);

  const handleAddLeadForDay = useCallback((date) => {
    setAddLeadPresetDate(date);
    setSelectedLead(null);
    setShowLeadDetail(true);
  }, []);

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

    // Excel fájl kezelése – ExcelJS-sel sor háttérszín (fill) olvasása
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
    const sampleCSV = 'name,email,phone,source,notes\nTeszt Elek,teszt@example.com,+36201234567,Weboldal,Érdeklődés 2 szobás lakásról';
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_sablon.csv';
    a.click();
  }, []);

  // Mai teendők számítása
  const todayTasks = useMemo(() => {
    const today = todayISO();
    const todayCalls = leads.filter(lead => {
      // Leadek, amelyekkel ma kell hívni (pl. új érdeklődők, followup dátum ma van)
      return lead.status === 'uj_erdeklodo' || 
             (lead.followupDate && lead.followupDate === today) ||
             (lead.surveyDate && lead.surveyDate === today);
    });
    
    const todayAppointments = leads.filter(lead => {
      // Leadek, amelyeknek ma van időpontja (felmérés, találkozó)
      return (lead.surveyDate && lead.surveyDate === today && lead.surveyType === 'személyes') ||
             (lead.appointmentDate && lead.appointmentDate === today);
    });
    
    const followups = leads.filter(lead => {
      // Leadek, amelyekkel followup kell (followupDate jövőbeli vagy ma)
      return lead.followupDate && lead.followupDate >= today;
    });

    return {
      calls: todayCalls.length,
      appointments: todayAppointments.length,
      followups: followups.length
    };
  }, [leads]);

  useEffect(() => {
    document.title = 'Értékesítés - SmartCRM';
    setLocalTargets(salesTargets);
    if (apartments.length === 0) {
      fetchFromApi();
    }
    fetchLeads();
  }, [salesTargets, apartments.length, fetchFromApi, fetchLeads]);

  // Sales pipeline statisztikák
  const pipelineStats = useMemo(() => ({
    uj_erdeklodo: getLeadsByStatus('uj_erdeklodo').length + getLeadsByStatus('new').length,
    kapcsolatfelvetel: getLeadsByStatus('kapcsolatfelvetel').length + getLeadsByStatus('contacted').length,
    felmeres_tervezve: getLeadsByStatus('felmeres_tervezve').length,
    felmeres_megtortent: getLeadsByStatus('felmeres_megtortent').length,
    ajanlat_kuldve: getLeadsByStatus('ajanlat_kuldve').length + getLeadsByStatus('offer').length + getLeadsByStatus('proposal').length,
    targyalas: getLeadsByStatus('targyalas').length + getLeadsByStatus('negotiation').length,
    szerzodes_kuldve: getLeadsByStatus('szerzodes_kuldve').length,
    alairva: getLeadsByStatus('alairva').length + getLeadsByStatus('won').length,
    aktiv_partner: getLeadsByStatus('aktiv_partner').length,
    elutasitva: getLeadsByStatus('elutasitva').length + getLeadsByStatus('lost').length,
    kesobb: getLeadsByStatus('kesobb').length,
    nem_aktualis: getLeadsByStatus('nem_aktualis').length,
    // Kompatibilitás
    new: getLeadsByStatus('new').length,
    contacted: getLeadsByStatus('contacted').length,
    offer: getLeadsByStatus('offer').length || getLeadsByStatus('proposal').length,
    negotiation: getLeadsByStatus('negotiation').length,
    won: getLeadsByStatus('won').length,
    lost: getLeadsByStatus('lost').length
  }), [getLeadsByStatus, leads]);

  // Konverziós arányok számítása
  const conversionStats = useMemo(() => {
    const total = leads.length;
    const won = pipelineStats.alairva + pipelineStats.aktiv_partner + pipelineStats.won;
    const lost = pipelineStats.elutasitva + pipelineStats.kesobb + pipelineStats.nem_aktualis + pipelineStats.lost;
    const closed = won + lost;
    const active = total - closed;
    
    return {
      total,
      active,
      won,
      lost,
      closed,
      winRate: closed > 0 ? (won / closed) * 100 : 0,
      conversionRate: total > 0 ? (won / total) * 100 : 0,
      lossRate: closed > 0 ? (lost / closed) * 100 : 0
    };
  }, [leads, pipelineStats]);

  const totalStats = useMemo(() => getTotalStats(), [getTotalStats]);

  // Skeleton elemek (konstans, memoizálva)
  const skeletonTableRows = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // Év változtatás
  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
    const newTargets = generateYearTargets(year);
    setLocalTargets(newTargets);
  }, [setSelectedYear, generateYearTargets]);

  // Évek listája (konstans, memoizálva)
  const availableYears = useMemo(() => [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036], []);

  const salesExportColumns = useMemo(() => [
    { key: 'month', label: 'Hónap' },
    { key: 'planUnits', label: 'Tervezett egység' },
    { key: 'planAvgPrice', label: 'Átlagár (Ft)' },
    { key: 'planRevenue', label: 'Tervezett bevétel (Ft)' },
    { key: 'actualUnits', label: 'Tényleges egység' },
    { key: 'actualRevenue', label: 'Tényleges bevétel (Ft)' },
    { key: 'completionRate', label: 'Teljesítés (%)' }
  ], []);

  const getExportData = useCallback(() => {
    return localTargets.map((t) => ({
      ...t,
      completionRate: t.planUnits > 0 ? ((t.actualUnits / t.planUnits) * 100).toFixed(1) : 0
    }));
  }, [localTargets]);

  const handleExportCSV = useCallback(() => {
    const rows = getExportData();
    exportToCSV(rows, salesExportColumns, `ertekesitesi_celok_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
  }, [getExportData, salesExportColumns, selectedYear]);

  const handleExportExcel = useCallback(() => {
    const rows = getExportData();
    exportToExcel(rows, salesExportColumns, `ertekesitesi_celok_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [getExportData, salesExportColumns, selectedYear]);

  const handlePrintPDF = useCallback(() => {
    printToPDF(`SmartCRM – Értékesítés ${selectedYear}`);
  }, [selectedYear]);

  const handleOpenSalesTargetEdit = useCallback(() => {
    setShowSalesTargetEdit(true);
  }, [setShowSalesTargetEdit]);

  const handleSaveSalesTargets = useCallback(async () => {
    try {
      for (const target of localTargets) {
        await updateSalesTarget(target.id || target.month, target);
      }
      setShowSalesTargetEdit(false);
      setEditingTarget(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Hiba a célok mentésekor:', error);
      }
    }
  }, [localTargets, updateSalesTarget, setShowSalesTargetEdit, setEditingTarget]);

  const handleCancelSalesTargetEdit = useCallback(() => {
    setLocalTargets(salesTargets);
    setShowSalesTargetEdit(false);
    setEditingTarget(null);
  }, [salesTargets, setShowSalesTargetEdit, setEditingTarget]);

  if (isLoading || leadsLoading) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy="true">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Skeleton variant="title" className="mb-4" width="200px" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Skeleton variant="title" className="mb-4" width="250px" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th scope="col" className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Hónap</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tervezett egység</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Átlagár (Ft)</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tervezett bevétel (Ft)</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tényleges egység</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tényleges bevétel (Ft)</th>
                  <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Teljesítés</th>
                </tr>
              </thead>
              <tbody>
                {skeletonTableRows.map((i) => (
                  <SkeletonTableRow key={i} columns={7} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Felső sáv - Mai teendők */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-2xl">📞</span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mai hívások</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.calls}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mai időpontok</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.appointments}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <span className="text-2xl">📝</span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followup</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.followups}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Munkanaptár – lead időpontokkal szinkronban, szerkeszthető napra kattintva */}
      <SalesCalendar
        onLeadClick={(lead) => {
          setSelectedLead(lead);
          setShowLeadDetail(true);
        }}
        onAddLead={handleAddLeadForDay}
      />

      {/* Fő tartalom: Script panel + Lead lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bal oldal - Telefonos Script Panel */}
        <div className="lg:col-span-1">
          <SalesScriptPanel />
        </div>

        {/* Jobb oldal - Lead lista / Kanban nézet */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-gray-200">Lead lista</h2>
              <div className="no-print flex gap-2">
                <Button onClick={handleOpenLeadImport} variant="primary">
                  <Plus /> Import
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  CSV export
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  Excel export
                </Button>
                <Link
                  to="/leads"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-bold transition rounded-lg"
                >
                  <Plus /> Lead kezelés
                </Link>
              </div>
            </div>

            {/* Bal: Sales Pipeline (fele méret, balra) | Jobb: Lead lista – ugyanaz a táblázat, Excel színek */}
            <div className="flex flex-row gap-6 items-start mt-4">
              {/* Bal: Pipeline – fele méretű csempék, balra igazítva (mint Leadek oldal) */}
              <div className="flex-shrink-0 w-[280px]">
                <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                  <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2 text-sm">Sales Pipeline</h3>
                  <div className="mb-2">
                    <label htmlFor="sales-lead-search" className="sr-only">Keresés lead-ek között</label>
                    <input
                      id="sales-lead-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Keresés név, email, telefon vagy megjegyzés alapján..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      aria-label="Keresés lead-ek között"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-w-[260px]">
                    <button
                      type="button"
                      onClick={handleFilterAll}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-md aspect-square w-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-orange-900 ${
                        filter === 'all'
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-orange-900 shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:shadow'
                      }`}
                      aria-pressed={filter === 'all'}
                      aria-label={`Összes lead (${leads.length}) – kattintás a szűréshez`}
                    >
                      <span className="text-[9px] font-medium leading-tight text-center line-clamp-2 mb-0.5">Összes</span>
                      <span className="text-xs font-bold">{leads.length}</span>
                    </button>
                    {leadStatuses.map((status) => {
                      const count = getLeadsByStatus(status.key).length;
                      const isActive = filter === status.key;
                      const colorClass = statusColors[status.key] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
                      return (
                        <button
                          key={status.key}
                          type="button"
                          onClick={() => handleFilterByStatus(status.key)}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-md aspect-square w-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-orange-900 ${colorClass} ${
                            isActive ? 'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-orange-900 shadow-md' : 'hover:shadow'
                          }`}
                          aria-pressed={isActive}
                          aria-label={`${status.label} (${count}) – kattintás a szűréshez`}
                        >
                          <span className="text-[9px] font-medium leading-tight text-center line-clamp-2 mb-0.5">
                            {status.label}
                          </span>
                          <span className="text-xs font-bold">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Jobb: Lead lista – ugyanaz a táblázat, Excel szín sync */}
              <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-20rem)]" id="sales-leads-list-column">
                {filteredLeads.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">Leadek ({filteredLeads.length})</h3>
                    </div>
                    {filteredLeads.map((lead) => {
                  const handleLeadClick = () => {
                    setSelectedLead(lead);
                    setShowLeadDetail(true);
                  };
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
                  const badgeLabel = lead.leadColor === 'green' ? '🟢 Meleg lead' : lead.leadColor === 'orange' ? '🟠 Később' : lead.leadColor === 'gray' ? '⬜ Nem aktuális' : lead.leadColor === 'red' ? '🔴 Nem vette fel' : '⚫ Elveszett';
                  return (
                    <div
                      key={lead.id}
                      onClick={handleLeadClick}
                      className={`p-3 ${cardBgClass} rounded-lg ${cardBorderClass} cursor-pointer hover:shadow-lg transition-all ${cardTextClass}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLeadClick();
                        }
                      }}
                      aria-label={`Lead: ${lead.name}, Adatlap megnyitása`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${nameCls}`}>{lead.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[lead.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          {leadStatuses.find((s) => s.key === lead.status)?.label || lead.status}
                        </span>
                      </div>
                      {lead.leadColor && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${badgeCls}`}>
                          {badgeLabel}
                        </span>
                      )}
                      {lead.email && <div className={`text-xs mt-1 ${detailCls}`}>{lead.email}</div>}
                      {lead.phone && <div className={`text-xs ${detailCls}`}>{lead.phone}</div>}
                    </div>
                  );
                })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-500 dark:text-gray-400">
                      {filter !== 'all' || searchQuery ? (
                        <p className="text-sm">A kiválasztott szűrőkkel nem található lead. Módosítsd a szűrőket vagy a keresést.</p>
                      ) : (
                        <p className="text-sm">Még nincsenek leadek. Használd az Importot vagy a Lead kezelés linket az új lead hozzáadásához.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Összesített statisztikák és célok (alul) – teljes szélesség a gridben */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Összesített statisztikák */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Összesített statisztikák</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tervezett egységek:</span>
              <span className="font-bold dark:text-gray-200">{totalStats.totalPlanUnits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tényleges egységek:</span>
              <span className="font-bold dark:text-gray-200">{totalStats.totalActualUnits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tervezett bevétel:</span>
              <span className="font-bold dark:text-gray-200">{totalStats.totalPlanRevenue.toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tényleges bevétel:</span>
              <span className="font-bold dark:text-gray-200">{formatCurrencyHUF(totalStats.totalActualRevenue)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Teljesítési arány:</span>
              <span className={`font-bold ${totalStats.completionRate >= 100 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatPercent(totalStats.completionRate, 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Konverziós arányok */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-green-800 dark:text-green-300 mb-3">Konverziós arányok</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Összes lead:</div>
              <div className="font-bold text-lg dark:text-gray-200">{conversionStats.total}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Aktív lead:</div>
              <div className="font-bold text-lg dark:text-gray-200">{conversionStats.active}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Win rate:</div>
              <div className={`font-bold text-lg ${conversionStats.winRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatPercent(conversionStats.winRate, 1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                ({conversionStats.won} / {conversionStats.closed})
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Konverziós arány:</div>
              <div className={`font-bold text-lg ${conversionStats.conversionRate >= 20 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatPercent(conversionStats.conversionRate, 1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                ({conversionStats.won} / {conversionStats.total})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Értékesítési célok */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-gray-200">Értékesítési célok</h2>
          <div className="flex gap-2 items-center">
            <label htmlFor="sales-year-select" className="sr-only">
              Év kiválasztása
            </label>
            <select
              id="sales-year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 text-sm"
              aria-label="Év kiválasztása"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {canEditSales('sales') && (
              <Button onClick={handleOpenSalesTargetEdit} variant="primary" aria-label="Értékesítési célok szerkesztése">
                <Edit2 /> Szerkesztés
              </Button>
            )}
          </div>
        </div>

        {/* Növekedési stratégia üzenet */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-blue-50 dark:bg-blue-900 p-3 rounded">
          <span aria-hidden="true">📈</span> Stratégia: Évente +50 egység/hónap | {selectedYear}: +{(selectedYear - 2026) * 50} egység a 2026-os bázishoz képest
        </div>

        {/* Célok táblázat */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Értékesítési célok táblázata {selectedYear} évre</caption>
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th scope="col" className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Hónap</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tervezett egység</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Átlagár (Ft)</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tervezett bevétel (Ft)</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tényleges egység</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Tényleges bevétel (Ft)</th>
                <th scope="col" className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">Teljesítés</th>
              </tr>
            </thead>
            <tbody>
              {localTargets.map((target, index) => {
                const completionRate = target.planUnits > 0 ? (target.actualUnits / target.planUnits) * 100 : 0;
                return (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <th scope="row" className="px-4 py-2 font-medium dark:text-gray-200">{target.month}</th>
                    <td className="px-4 py-2 text-right dark:text-gray-200">{formatNumber(target.planUnits)}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-200">{formatCurrencyHUF(target.planAvgPrice)}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-200">{formatCurrencyHUF(target.planRevenue)}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-200">{formatNumber(target.actualUnits)}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-200">{formatCurrencyHUF(target.actualRevenue)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-bold ${completionRate >= 100 ? 'text-green-600 dark:text-green-400' : completionRate >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatPercent(completionRate, 1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cél szerkesztés modal - csak ha van edit jogosultság */}
      {canEditSales('sales') && (
      <Modal
        isOpen={showSalesTargetEdit}
        onClose={() => {
          setShowSalesTargetEdit(false);
          setEditingTarget(null);
        }}
        title={`Értékesítési célok szerkesztése - ${selectedYear}`}
        size="lg"
      >
        <div className="space-y-4">
          {localTargets.map((target, index) => (
            <div key={index} className="p-4 border dark:border-gray-700 rounded-lg">
              <h4 className="font-bold dark:text-gray-200 mb-3">{target.month}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`sales-target-${index}-planUnits`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tervezett egység</label>
                  <input
                    id={`sales-target-${index}-planUnits`}
                    type="number"
                    value={target.planUnits}
                    onChange={(e) => {
                      const newTargets = [...localTargets];
                      newTargets[index] = {
                        ...newTargets[index],
                        planUnits: parseInt(e.target.value) || 0,
                        planRevenue: (parseInt(e.target.value) || 0) * newTargets[index].planAvgPrice
                      };
                      setLocalTargets(newTargets);
                    }}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`sales-target-${index}-planAvgPrice`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Átlagár (Ft)</label>
                  <input
                    id={`sales-target-${index}-planAvgPrice`}
                    type="number"
                    value={target.planAvgPrice}
                    onChange={(e) => {
                      const newTargets = [...localTargets];
                      newTargets[index] = {
                        ...newTargets[index],
                        planAvgPrice: parseInt(e.target.value) || 0,
                        planRevenue: newTargets[index].planUnits * (parseInt(e.target.value) || 0)
                      };
                      setLocalTargets(newTargets);
                    }}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`sales-target-${index}-actualUnits`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tényleges egység</label>
                  <input
                    id={`sales-target-${index}-actualUnits`}
                    type="number"
                    value={target.actualUnits}
                    onChange={(e) => {
                      const newTargets = [...localTargets];
                      newTargets[index].actualUnits = parseInt(e.target.value) || 0;
                      setLocalTargets(newTargets);
                    }}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`sales-target-${index}-actualRevenue`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tényleges bevétel (Ft)</label>
                  <input
                    id={`sales-target-${index}-actualRevenue`}
                    type="number"
                    value={target.actualRevenue}
                    onChange={(e) => {
                      const newTargets = [...localTargets];
                      newTargets[index].actualRevenue = parseInt(e.target.value) || 0;
                      setLocalTargets(newTargets);
                    }}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tervezett bevétel: {target.planRevenue.toLocaleString()} Ft
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSaveSalesTargets}
            variant="primary"
            className="flex-1"
          >
            Mentés
          </Button>
          <Button
            onClick={handleCancelSalesTargetEdit}
            variant="secondary"
          >
            Mégse
          </Button>
        </div>
      </Modal>
      )}

      {/* Státusz alapú lead lista modal */}
      {selectedStatus && (
        <Modal
          isOpen={showStatusLeadsModal}
          onClose={() => {
            setShowStatusLeadsModal(false);
            setSelectedStatus(null);
          }}
          title={`${leadStatuses.find(s => s.key === selectedStatus)?.label || selectedStatus} - Leadek`}
          size="lg"
        >
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {getLeadsByStatus(selectedStatus).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nincsenek leadek ebben a státuszban.
              </p>
            ) : (
              getLeadsByStatus(selectedStatus).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowStatusLeadsModal(false);
                    setSelectedStatus(null);
                    setShowLeadDetail(true);
                  }}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLead(lead);
                      setShowStatusLeadsModal(false);
                      setSelectedStatus(null);
                      setShowLeadDetail(true);
                    }
                  }}
                  aria-label={`Lead: ${lead.name}, Adatlap megnyitása`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{lead.name}</div>
                      {lead.email && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lead.email}</div>
                      )}
                      {lead.phone && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">{lead.phone}</div>
                      )}
                    </div>
                    <span className={`${statusColors[lead.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} px-2 py-1 rounded text-xs font-medium`}>
                      {leadStatuses.find(s => s.key === lead.status)?.label || lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Lead Adatlap Modal */}
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
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Oszlopok: name, email, phone, source, notes. Szín: Excel sor háttérszíne vagy »szín« oszlop (zöld=meleg, piros=Később, szürke=Nem aktuális, fekete=elveszett) – a kártyák ez alapján színeződnek.</div>
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

      <LeadDetailModal
        isOpen={showLeadDetail}
        onClose={() => {
          setShowLeadDetail(false);
          setSelectedLead(null);
          setAddLeadPresetDate(null);
        }}
        lead={selectedLead}
        defaultApplicationDate={!selectedLead ? addLeadPresetDate ?? undefined : undefined}
        onSave={async (formData) => {
          if (selectedLead) {
            await updateLead(selectedLead.id, formData);
          } else {
            await addLead(formData);
          }
          setShowLeadDetail(false);
          setSelectedLead(null);
          setAddLeadPresetDate(null);
        }}
        onStartWizard={(lead) => {
          if (lead) {
            setShowLeadDetail(false);
            setSelectedLead(lead);
            setAddLeadPresetDate(null);
            setShowSalesWizard(true);
          }
        }}
      />

      {/* Értékesítési Wizard – Script panel a kiválasztott leaddel */}
      <Modal
        isOpen={showSalesWizard && !!selectedLead}
        onClose={() => setShowSalesWizard(false)}
        title={`Értékesítési folyamat – ${selectedLead?.name || 'Lead'}`}
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <SalesWizardScriptPanel
            currentStep={1}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            hideHeader
          />
        </div>
        <div className="flex gap-2 justify-end pt-4 mt-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => {
              setShowSalesWizard(false);
              setShowLeadDetail(true);
            }}
          >
            Lead adatlap
          </Button>
          <Button variant="primary" onClick={() => setShowSalesWizard(false)}>
            Bezárás
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default SalesPage;

