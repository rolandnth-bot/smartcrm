import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLeadsStore, { leadStatuses, leadSources } from '../stores/leadsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import { usePermissions } from '../contexts/PermissionContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LeadDetailModal from '../components/sales/LeadDetailModal';
import SalesCalendar from '../components/sales/SalesCalendar';
import SalesScriptPanel from '../components/sales/SalesScriptPanel';
import SalesWizardScriptPanel from '../components/sales/SalesWizardScriptPanel';
import { Plus } from '../components/common/Icons';
import { Skeleton, SkeletonCard } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { todayISO } from '../utils/dateUtils';
import useToastStore from '../stores/toastStore';
import { excelFillToLeadColor } from '../utils/excelRowColorUtils';
import './SalesPage.css';

// Státusz színek  Új érdekld sárga; Késbb amber; Nem aktuális szürke
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

// Helper függvény az inicialok generálásához
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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
  const { apartments, isLoading, selectedApartment, showEditApartment, setSelectedApartment, setShowEditApartment, fetchFromApi, updateApartment } = useApartmentsStore();
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [addLeadPresetDate, setAddLeadPresetDate] = useState(null);
  const [showSalesWizard, setShowSalesWizard] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showStatusLeadsModal, setShowStatusLeadsModal] = useState(false);
  const [activeLead, setActiveLead] = useState(null);

  const handleAddLeadForDay = useCallback((date) => {
    setAddLeadPresetDate(date);
    setSelectedLead(null);
    setShowLeadDetail(true);
  }, []);

  const filteredLeads = useMemo(() => getFilteredLeads(), [getFilteredLeads, filter, searchQuery, leads]);

  // Aktív lead (kiválasztott vagy els aktív lead)
  useEffect(() => {
    if (!activeLead && filteredLeads.length > 0) {
      // Válasszuk ki az els aktív leadet (új érdekld vagy kapcsolatfelvétel)
      const firstActive = filteredLeads.find(l => 
        ['uj_erdeklodo', 'new', 'kapcsolatfelvetel', 'contacted'].includes(l.status)
      ) || filteredLeads[0];
      setActiveLead(firstActive);
    }
  }, [filteredLeads, activeLead]);

  // Következ leadek (aktív lead kivételével)
  const nextLeads = useMemo(() => {
    return filteredLeads
      .filter(l => !activeLead || l.id !== activeLead.id)
      .slice(0, 6);
  }, [filteredLeads, activeLead]);

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

  const handleExportCSV = useCallback(() => {
    exportToCSV(filteredLeads, leadExportColumns, `leadek_export_${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredLeads, leadExportColumns]);

  const handleExportExcel = useCallback(() => {
    exportToExcel(filteredLeads, leadExportColumns, `leadek_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredLeads, leadExportColumns]);

  // Mai teendk számítása
  const todayTasks = useMemo(() => {
    const today = todayISO();
    const todayCalls = leads.filter(lead => {
      // Leadek, amelyekkel ma kell hívni (pl. új érdekldk, followup dátum ma van)
      return lead.status === 'uj_erdeklodo' || 
             (lead.followupDate && lead.followupDate === today) ||
             (lead.surveyDate && lead.surveyDate === today);
    });
    
    const todayAppointments = leads.filter(lead => {
      // Leadek, amelyeknek ma van idpontja (felmérés, találkozó)
      return (lead.surveyDate && lead.surveyDate === today && lead.surveyType === 'személyes') ||
             (lead.appointmentDate && lead.appointmentDate === today);
    });
    
    const followups = leads.filter(lead => {
      // Leadek, amelyekkel followup kell (followupDate jövbeli vagy ma)
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
    if (apartments.length === 0) {
      fetchFromApi();
    }
    fetchLeads();
  }, [apartments.length, fetchFromApi, fetchLeads]);

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


  if (isLoading || leadsLoading) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy="true">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Skeleton variant="title" className="mb-4" width="200px" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Skeleton variant="title" className="mb-4" width="250px" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sales-page">
      {/* Fels sáv - Mai teendk */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-2xl"></span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mai hívások</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.calls}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <span className="text-2xl"></span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mai idpontok</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.appointments}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <span className="text-2xl"></span>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followup</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{todayTasks.followups}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Munkanaptár  lead idpontokkal szinkronban, szerkeszthet napra kattintva */}
      <SalesCalendar
        onLeadClick={(lead) => {
          setSelectedLead(lead);
          setShowLeadDetail(true);
        }}
        onAddLead={handleAddLeadForDay}
      />

      {/* Sales Script és Lead lista egymás mellett */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Sales Script Panel - bal oldal */}
        <div className="h-full">
          <SalesScriptPanel selectedLead={selectedLead} />
        </div>

        {/* Lead lista - jobb oldal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
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
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-bold transition"
              >
                <Plus /> Lead kezelés
              </Link>
            </div>
          </div>

          {/* Sales Pipeline szekció - lista formátum */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-700 shadow-sm">
              <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-4 text-base flex items-center gap-2">
                <span className="text-xl">📊</span>
                Sales Pipeline
              </h3>
              <div className="mb-4">
                <label htmlFor="sales-lead-search" className="sr-only">Keresés lead-ek között</label>
                <input
                  id="sales-lead-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés név, email, telefon vagy megjegyzés alapján..."
                  className="w-full px-4 py-2.5 text-sm border-2 border-orange-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  aria-label="Keresés lead-ek között"
                />
              </div>

              {/* Pipeline státuszok - függőleges lista */}
              <div className="space-y-1.5">
                {/* Összes */}
                <button
                  type="button"
                  onClick={handleFilterAll}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 border-l-4 ${
                    filter === 'all'
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white border-orange-500 shadow-md font-semibold'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 hover:border-gray-400'
                  }`}
                  aria-pressed={filter === 'all'}
                  aria-label={`Összes lead (${leads.length}) – kattintás a szűréshez`}
                >
                  <span className="text-sm font-medium">Összes</span>
                  <span className="text-sm font-bold bg-gray-300 dark:bg-gray-500 px-2.5 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                </button>

                {/* Státuszok */}
                {leadStatuses.map((status) => {
                  const count = getLeadsByStatus(status.key).length;
                  const isActive = filter === status.key;

                  // Bal oldali border színek státusz alapján
                  let borderColor = 'border-gray-300 dark:border-gray-600';
                  let badgeBg = 'bg-gray-200 dark:bg-gray-600';

                  if (status.key.includes('uj_erdeklodo') || status.key === 'new' || status.key.includes('kapcsolatfelvetel') || status.key === 'contacted') {
                    borderColor = isActive ? 'border-yellow-500' : 'border-yellow-400 dark:border-yellow-600';
                    badgeBg = 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
                  } else if (status.key.includes('felmeres')) {
                    borderColor = isActive ? 'border-blue-500' : 'border-blue-400 dark:border-blue-600';
                    badgeBg = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
                  } else if (status.key.includes('ajanlat') || status.key === 'offer') {
                    borderColor = isActive ? 'border-purple-500' : 'border-purple-400 dark:border-purple-600';
                    badgeBg = 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200';
                  } else if (status.key.includes('targyalas') || status.key === 'negotiation') {
                    borderColor = isActive ? 'border-cyan-500' : 'border-cyan-400 dark:border-cyan-600';
                    badgeBg = 'bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200';
                  } else if (status.key.includes('szerzodes')) {
                    borderColor = isActive ? 'border-indigo-500' : 'border-indigo-400 dark:border-indigo-600';
                    badgeBg = 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200';
                  } else if (status.key.includes('alairva') || status.key === 'won' || status.key.includes('aktiv')) {
                    borderColor = isActive ? 'border-green-500' : 'border-green-400 dark:border-green-600';
                    badgeBg = 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
                  } else if (status.key.includes('elutasitva') || status.key === 'lost') {
                    borderColor = isActive ? 'border-red-500' : 'border-red-400 dark:border-red-600';
                    badgeBg = 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
                  } else if (status.key.includes('kesobb')) {
                    borderColor = isActive ? 'border-amber-500' : 'border-amber-400 dark:border-amber-600';
                    badgeBg = 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200';
                  } else if (status.key.includes('nem_aktualis')) {
                    borderColor = isActive ? 'border-gray-500' : 'border-gray-400 dark:border-gray-600';
                    badgeBg = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
                  }

                  return (
                    <button
                      key={status.key}
                      type="button"
                      onClick={() => handleFilterByStatus(status.key)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 border-l-4 ${borderColor} ${
                        isActive
                          ? 'bg-white dark:bg-gray-600 shadow-md font-semibold scale-[1.02]'
                          : 'bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                      }`}
                      aria-pressed={isActive}
                      aria-label={`${status.label} (${count}) – kattintás a szűréshez`}
                    >
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {status.label}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lead listaScrollable terület */}
          <div className="flex-1 overflow-y-auto" id="sales-leads-list-column">
            {filteredLeads.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Leadek ({filteredLeads.length})</h3>
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
                  const badgeLabel = lead.leadColor === 'green' ? ' Meleg lead' : lead.leadColor === 'orange' ? ' Késbb' : lead.leadColor === 'gray' ? ' Nem aktuális' : lead.leadColor === 'red' ? ' Nem vette fel' : ' Elveszett';
                  return (
                    <div
                      key={lead.id}
                      onClick={handleLeadClick}
                      className={`p-4 ${cardBgClass} rounded-xl ${cardBorderClass} cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02] ${cardTextClass}`}
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
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-base font-semibold ${nameCls}`}>{lead.name}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          {leadStatuses.find((s) => s.key === lead.status)?.label || lead.status}
                        </span>
                      </div>
                      {lead.leadColor && (
                        <span className={`inline-block mt-1 mb-2 px-3 py-1 rounded-full text-xs font-bold ${badgeCls}`}>
                          {badgeLabel}
                        </span>
                      )}
                      {lead.email && <div className={`text-sm mt-1.5 ${detailCls}`}>📧 {lead.email}</div>}
                      {lead.phone && <div className={`text-sm mt-1 ${detailCls}`}>📱 {lead.phone}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="w-20 h-20 mb-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
                {filter !== 'all' || searchQuery ? (
                  <>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Nincs találat</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A kiválasztott szrkkel nem található lead. Módosítsd a szrket vagy a keresést.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Még nincsenek leadek</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Használd az Importot vagy a Lead kezelés linket az új lead hozzáadásához.</p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleOpenLeadImport} variant="primary" size="sm">
                        <Plus /> Import
                      </Button>
                      <Link
                        to="/leads"
                        className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 flex items-center gap-1 text-sm font-semibold transition"
                      >
                        <Plus /> Lead kezelés
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* Értékesítési Wizard  Script panel a kiválasztott leaddel */}
      <Modal
        isOpen={showSalesWizard && !!selectedLead}
        onClose={() => setShowSalesWizard(false)}
        title={`Értékesítési folyamat  ${selectedLead?.name || 'Lead'}`}
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

