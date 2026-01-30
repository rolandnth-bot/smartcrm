/**
 * Pénzügy (Finance)  Bevételek, Elszámolások
 * Foglalások alapján payout/jutalék, karbantartási költségek.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import useBookingsStore from '../stores/bookingsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useMaintenanceStore from '../stores/maintenanceStore';
import useSalesStore from '../stores/salesStore';
import { usePermissions } from '../contexts/PermissionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Plus, Edit2 } from '../components/common/Icons';
import { formatCurrencyHUF, formatPercent, formatNumber } from '../utils/numberUtils';
import { formatDate, todayISO, getFirstDayOfMonth, getLastDayOfMonth } from '../utils/dateUtils';
import { PLATFORM_LABELS } from '../config/constants';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';
import SettlementImportModal from '../components/finance/SettlementImportModal';

const FINANCE_FILTERS = [
  { key: 'today', label: 'Ma' },
  { key: 'week', label: 'Hét' },
  { key: 'month', label: 'Hónap' },
  { key: 'custom', label: 'Egyéni' }
];

const FinancePage = () => {
  const { bookings, fetchFromApi: fetchBookings } = useBookingsStore();
  const { apartments, fetchFromApi: fetchApartments } = useApartmentsStore();
  const { maintenanceExpenses } = useMaintenanceStore();
  const {
    salesTargets,
    selectedYear,
    showSalesTargetEdit,
    editingTarget,
    isLoading: salesLoading,
    setSelectedYear,
    setShowSalesTargetEdit,
    setEditingTarget,
    updateSalesTarget,
    generateYearTargets,
    getTotalStats
  } = useSalesStore();
  const { canEdit: canEditSales } = usePermissions();

  const [financeFilter, setFinanceFilter] = useState('month');
  const [financeApartmentFilter, setFinanceApartmentFilter] = useState('');
  const [financeSubTab, setFinanceSubTab] = useState('osszesito'); // 'osszesito' | 'forgalom' | 'szamlazas'
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [financeMonth, setFinanceMonth] = useState(new Date().getMonth());
  const [forgalomIrany, setForgalomIrany] = useState('osszes'); // 'osszes', 'bevetel', 'kiadas'
  const [osszesitoYear, setOsszesitoYear] = useState(2026);
  const [settlementApartment, setSettlementApartment] = useState('');
  const [showSettlementImport, setShowSettlementImport] = useState(false);
  const [importedSettlements, setImportedSettlements] = useState([]);

  // Összesítő szűrők
  const [osszesitoDateRange, setOsszesitoDateRange] = useState({
    start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const [osszesitoKategoria, setOsszesitoKategoria] = useState('osszes');
  const [osszesitoPartner, setOsszesitoPartner] = useState('osszes');
  const [osszesitoRendezettseg, setOsszesitoRendezettseg] = useState('osszes');
  const [osszesitoIrany, setOsszesitoIrany] = useState('osszes');
  const [bankBalanceFilter, setBankBalanceFilter] = useState('osszes'); // 'osszes', 'pozitiv', 'negativ', 'nulla'
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  // Extra tételek localStorage-ból betöltése
  const loadSettlementExtraItems = useCallback(() => {
    try {
      const stored = localStorage.getItem('smartcrm_settlement_extra_items');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Hiba az extra tételek betöltésekor:', e);
    }
    return [];
  }, []);

  const saveSettlementExtraItems = useCallback((items) => {
    try {
      localStorage.setItem('smartcrm_settlement_extra_items', JSON.stringify(items));
    } catch (e) {
      console.error('Hiba az extra tételek mentésekor:', e);
    }
  }, []);

  const [settlementExtraItems, setSettlementExtraItems] = useState(loadSettlementExtraItems); // {id, apartmentId, month, year, name, amount, isDiscount}
  const [showAddSettlementItem, setShowAddSettlementItem] = useState(false);
  const [editingSettlementItem, setEditingSettlementItem] = useState(null);
  const [newSettlementItem, setNewSettlementItem] = useState({
    name: '',
    amount: '',
    isDiscount: false
  });
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [localTargets, setLocalTargets] = useState(salesTargets);
  const [unitPlanPeriod, setUnitPlanPeriod] = useState('year'); // 'year', 'month', 'week', 'day'

  // Extra tételek mentése localStorage-ba változáskor
  useEffect(() => {
    saveSettlementExtraItems(settlementExtraItems);
  }, [settlementExtraItems, saveSettlementExtraItems]);

  useEffect(() => {
    document.title = 'Pénzügy - SmartCRM';
    fetchBookings();
    fetchApartments();
  }, [fetchBookings, fetchApartments]);

  useEffect(() => {
    setLocalTargets(salesTargets);
  }, [salesTargets]);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfMonth = new Date(financeYear, financeMonth, 1);
    const endOfMonth = new Date(financeYear, financeMonth + 1, 0);

    return bookings.filter((b) => {
      if (financeApartmentFilter && String(b.apartmentId) !== String(financeApartmentFilter)) {
        return false;
      }
      const bDate = new Date(b.dateFrom || b.checkIn);
      bDate.setHours(0, 0, 0, 0);
      if (financeFilter === 'today') {
        return bDate.getTime() === today.getTime();
      }
      if (financeFilter === 'week') {
        return bDate >= startOfWeek && bDate <= endOfWeek;
      }
      if (financeFilter === 'month') {
        return bDate >= startOfMonth && bDate <= endOfMonth;
      }
      if (financeFilter === 'custom' && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        return bDate >= start && bDate <= end;
      }
      return true;
    });
  }, [bookings, financeFilter, financeApartmentFilter, financeYear, financeMonth, customRange]);

  const payoutSum = useMemo(
    () => filteredBookings.reduce((acc, b) => acc + (Number(b.payoutFt) || Number(b.netRevenue) || 0), 0),
    [filteredBookings]
  );

  const maintenanceForPeriod = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfMonth = new Date(financeYear, financeMonth, 1);
    const endOfMonth = new Date(financeYear, financeMonth + 1, 0);

    let filtered = maintenanceExpenses;
    if (financeFilter === 'today') {
      filtered = maintenanceExpenses.filter((m) => {
        const d = new Date(m.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
    } else if (financeFilter === 'week') {
      filtered = maintenanceExpenses.filter((m) => {
        const d = new Date(m.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else if (financeFilter === 'month') {
      filtered = maintenanceExpenses.filter((m) => {
        const d = new Date(m.date);
        return d >= startOfMonth && d <= endOfMonth;
      });
    } else if (financeFilter === 'custom' && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      filtered = maintenanceExpenses.filter((m) => {
        const d = new Date(m.date);
        return d >= start && d <= end;
      });
    }
    const total = filtered.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    return { list: filtered, total };
  }, [maintenanceExpenses, financeFilter, financeYear, financeMonth, customRange]);

  const months = useMemo(
    () => ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
    []
  );
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  }, []);

  // Elszámolások: foglalások a kiválasztott hónapban (mindegyik lakás)  lakás nélkül is látszik
  const settlementPeriodBookings = useMemo(() => {
    const startOfMonth = new Date(financeYear, financeMonth, 1);
    const endOfMonth = new Date(financeYear, financeMonth + 1, 0);
    return bookings.filter((b) => {
      const dateFrom = new Date(b.dateFrom || b.checkIn);
      const dateTo = new Date(b.dateTo || b.checkOut);
      if (b.platform === 'booking') {
        return dateTo >= startOfMonth && dateTo <= endOfMonth;
      }
      return dateFrom >= startOfMonth && dateFrom <= endOfMonth;
    });
  }, [bookings, financeYear, financeMonth]);

  const settlementPeriodPayout = useMemo(
    () => settlementPeriodBookings.reduce((sum, b) => sum + (Number(b.payoutFt) || Number(b.netRevenue) || 0), 0),
    [settlementPeriodBookings]
  );

  const getApartmentName = useCallback(
    (apartmentId) => {
      const apt = apartments.find((a) => String(a.id) === String(apartmentId));
      return apt?.name || `Lakás #${apartmentId}`;
    },
    [apartments]
  );

  const handleExportCSV = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'guestName', label: 'Vendég' },
      { key: 'platform', label: 'Platform' },
      { key: 'payoutFt', label: 'Bevétel (Ft)' },
      { key: 'notes', label: 'Megjegyzés' }
    ];
    const data = filteredBookings.map((b) => {
      const apt = apartments.find((a) => a.id === b.apartmentId || a.id === parseInt(b.apartmentId));
      return {
        date: formatDate(b.dateFrom || b.checkIn),
        apartmentName: apt?.name || `Lakás #${b.apartmentId}`,
        guestName: b.guestName || '-',
        platform: PLATFORM_LABELS[b.platform] || b.platform,
        payoutFt: b.payoutFt != null ? b.payoutFt : (b.netRevenue || 0),
        notes: b.notes || ''
      };
    });
    exportToCSV(data, columns, `penzugy_${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredBookings, apartments]);

  const handleExportExcel = useCallback(() => {
    const columns = [
      { key: 'date', label: 'Dátum' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'guestName', label: 'Vendég' },
      { key: 'platform', label: 'Platform' },
      { key: 'payoutFt', label: 'Bevétel (Ft)' },
      { key: 'notes', label: 'Megjegyzés' }
    ];
    const data = filteredBookings.map((b) => {
      const apt = apartments.find((a) => a.id === b.apartmentId || a.id === parseInt(b.apartmentId));
      return {
        date: formatDate(b.dateFrom || b.checkIn),
        apartmentName: apt?.name || `Lakás #${b.apartmentId}`,
        guestName: b.guestName || '-',
        platform: PLATFORM_LABELS[b.platform] || b.platform,
        payoutFt: b.payoutFt != null ? b.payoutFt : (b.netRevenue || 0),
        notes: b.notes || ''
      };
    });
    exportToExcel(data, columns, `penzugy_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredBookings, apartments]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM  Pénzügy');
  }, []);

  // Értékesítési célok kezelése
  const availableYears = useMemo(() => [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036], []);

  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
    const newTargets = generateYearTargets(year);
    setLocalTargets(newTargets);
  }, [setSelectedYear, generateYearTargets]);

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

  // Lakás egység terv/tény számítások (értékesítési célok alapján)
  const unitPlanFact = useMemo(() => {
    const now = new Date();
    let dateFrom, dateTo;
    
    switch (unitPlanPeriod) {
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1);
        dateTo = new Date(now.getFullYear(), 11, 31);
        break;
      case 'month':
        dateFrom = getFirstDayOfMonth(now);
        dateTo = getLastDayOfMonth(now);
        break;
      case 'week':
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        monday.setHours(0, 0, 0, 0);
        dateFrom = monday;
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        dateTo = sunday;
        break;
      case 'day':
        dateFrom = new Date(now);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(now);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default:
        dateFrom = new Date(now.getFullYear(), 0, 1);
        dateTo = new Date(now.getFullYear(), 11, 31);
    }

    // Terv (értékesítési célokból - planUnits)
    const salesStats = getTotalStats();
    let planUnits = 0;
    
    if (unitPlanPeriod === 'year') {
      planUnits = salesStats.totalPlanUnits;
    } else if (unitPlanPeriod === 'month') {
      const currentMonth = now.getMonth();
      const monthTarget = salesTargets[currentMonth];
      planUnits = monthTarget?.planUnits || 0;
    } else if (unitPlanPeriod === 'week') {
      planUnits = salesStats.totalPlanUnits / 52;
    } else {
      planUnits = salesStats.totalPlanUnits / 365;
    }

    // Tény (értékesítési célokból - actualUnits)
    let factUnits = 0;
    
    if (unitPlanPeriod === 'year') {
      factUnits = salesStats.totalActualUnits;
    } else if (unitPlanPeriod === 'month') {
      const currentMonth = now.getMonth();
      const monthTarget = salesTargets[currentMonth];
      factUnits = monthTarget?.actualUnits || 0;
    } else if (unitPlanPeriod === 'week') {
      factUnits = salesStats.totalActualUnits / 52;
    } else {
      factUnits = salesStats.totalActualUnits / 365;
    }

    const hasData = factUnits > 0 || planUnits > 0;
    const completionRate = planUnits > 0 ? (factUnits / planUnits) * 100 : 0;

    return {
      plan: Math.round(planUnits),
      fact: Math.round(factUnits),
      hasData,
      completionRate,
      period: unitPlanPeriod
    };
  }, [unitPlanPeriod, salesTargets, getTotalStats]);

  const handleImportSuccess = useCallback((settlementData) => {
    setImportedSettlements((prev) => [...prev, settlementData]);
    setShowSettlementImport(false);
    // Opcionálisan válthatunk az importált lakásra
    if (settlementData.apartmentId) {
      setSettlementApartment(settlementData.apartmentId);
      setFinanceMonth(settlementData.month);
      setFinanceYear(settlementData.year);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200"> Pénzügy</h2>
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
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Button
          variant={financeSubTab === 'osszesito' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFinanceSubTab('osszesito')}
        >
          Összesítő
        </Button>
        <Button
          variant={financeSubTab === 'forgalom' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFinanceSubTab('forgalom')}
        >
          Forgalom
        </Button>
        <Button
          variant={financeSubTab === 'szamlazas' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFinanceSubTab('szamlazas')}
        >
          Számlázás
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <select
          value={financeApartmentFilter}
          onChange={(e) => setFinanceApartmentFilter(e.target.value)}
          className="px-2.5 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
          aria-label="Lakás szr"
        >
          <option value="">Összes lakás</option>
          {apartments.map((apt) => (
            <option key={apt.id} value={apt.id}>{apt.name}</option>
          ))}
        </select>
        {FINANCE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFinanceFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              financeFilter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {financeFilter === 'month' && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {months.map((m, idx) => (
            <button
              key={m}
              type="button"
              onClick={() => setFinanceMonth(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                financeMonth === idx ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {m}
            </button>
          ))}
          <select
            value={financeYear}
            onChange={(e) => setFinanceYear(parseInt(e.target.value, 10))}
            className="px-2.5 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-xs"
            aria-label="Év"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {financeFilter === 'custom' && (
        <div className="flex gap-1.5 mb-4 items-center">
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
            className="px-2.5 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
            aria-label="Kezd dátum"
          />
          <span className="text-gray-500 text-sm"></span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
            className="px-2.5 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
            aria-label="Záró dátum"
          />
        </div>
      )}

      {financeSubTab === 'osszesito' && (
        <>
          {/* Szűrősáv */}
          <Card className="p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              {/* Időszak */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Időszak:</label>
                <input
                  type="date"
                  value={osszesitoDateRange.start}
                  onChange={(e) => setOsszesitoDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={osszesitoDateRange.end}
                  onChange={(e) => setOsszesitoDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                />
              </div>

              {/* Kategória */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategória:</label>
                <select
                  value={osszesitoKategoria}
                  onChange={(e) => setOsszesitoKategoria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm min-w-[180px]"
                >
                  <option value="osszes">✓ Összes</option>
                  <optgroup label="Kiadás kategóriák">
                    <option value="berleti_dij">Bérleti díj</option>
                    <option value="egyeb_kiadas">Egyéb</option>
                    <option value="ertekesites_szoftver">Értékesítés-Szoftver</option>
                    <option value="housekeeping_kiadas">Housekeeping</option>
                    <option value="marketing">Marketing</option>
                    <option value="munkaber">Munkabér</option>
                    <option value="szamvitel">Számvitel</option>
                  </optgroup>
                  <optgroup label="Bevétel kategóriák">
                    <option value="egyeb_bevetel">Egyéb</option>
                    <option value="housekeeping_bevetel">Housekeeping</option>
                    <option value="management_dij">Management díj</option>
                    <option value="onboarding">Onboarding</option>
                  </optgroup>
                </select>
              </div>

              {/* Partner */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Partner:</label>
                <select
                  value={osszesitoPartner}
                  onChange={(e) => setOsszesitoPartner(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm min-w-[150px]"
                >
                  <option value="osszes">✓ Összes</option>
                  <option value="partner1">Partner 1</option>
                  <option value="partner2">Partner 2</option>
                </select>
              </div>

              {/* Rendezettség */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rendezettség:</label>
                <select
                  value={osszesitoRendezettseg}
                  onChange={(e) => setOsszesitoRendezettseg(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm min-w-[150px]"
                >
                  <option value="osszes">✓ Összes</option>
                  <option value="rendezett">Rendezett</option>
                  <option value="rendezetlen">Rendezetlen</option>
                </select>
              </div>

              {/* Irány */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Irány:</label>
                <select
                  value={osszesitoIrany}
                  onChange={(e) => setOsszesitoIrany(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm min-w-[130px]"
                >
                  <option value="osszes">✓ Összes</option>
                  <option value="bevetel">Bevétel</option>
                  <option value="kiadas">Kiadás</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Éves összesítő és Bankszámlák egymás mellett (50-50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Éves összesítő táblázat */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Éves összesítő</h3>
                <select
                  value={osszesitoYear}
                  onChange={(e) => setOsszesitoYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Hónap</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Bevétel</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Kiadás</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Eredmény</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Január</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">0 Ft</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">771,510 Ft</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-red-600 dark:text-red-400 font-semibold">-771,510 Ft</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Február</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">0 Ft</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">28,538 Ft</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-red-600 dark:text-red-400 font-semibold">-28,538 Ft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Bankszámlák */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Bankszámlák</h3>
                <div className="flex gap-2">
                  <select
                    value={bankBalanceFilter}
                    onChange={(e) => setBankBalanceFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
                  >
                    <option value="osszes">✓ Összes</option>
                    <option value="pozitiv">Csak pozitív</option>
                    <option value="negativ">Csak negatív</option>
                    <option value="nulla">Csak nullás</option>
                  </select>
                  <button
                    onClick={() => setShowAddBankAccount(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                  >
                    + Új számla
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Számla</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Egyenleg</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Wise 9482</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Revolut</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">OTP 5370</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                    </tr>
                    <tr className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">Összesen</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-800 dark:text-gray-200">6,016,984 Ft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Bevételek és Kiadások egymás mellett */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bevételek */}
            {(osszesitoIrany === 'osszes' || osszesitoIrany === 'bevetel') && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Bevételek</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {osszesitoDateRange.start} - {osszesitoDateRange.end}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Nincs bevétel ebben az időszakban
                  </p>
                </div>
              </Card>
            )}

            {/* Kiadások */}
            {(osszesitoIrany === 'osszes' || osszesitoIrany === 'kiadas') && (
              <Card className="p-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Kiadások</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Kategória</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Összeg</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Bérleti díj</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Egyéb</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Értékesítés-Szoftver</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Housekeeping</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Marketing</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Munkabér</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">Számvitel</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-700 dark:text-gray-300">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {financeSubTab === 'forgalom' && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <select
              value={settlementApartment}
              onChange={(e) => setSettlementApartment(e.target.value)}
              className="px-2.5 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
              aria-label="Lakás választása"
            >
              <option value="">Válassz lakást...</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>{apt.name}</option>
              ))}
            </select>
            <Button
              onClick={() => setShowSettlementImport(true)}
              variant="primary"
              size="sm"
              className="ml-2"
            >
              📊 Import
            </Button>
            {months.map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => setFinanceMonth(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  financeMonth === idx ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
            <select
              value={financeYear}
              onChange={(e) => setFinanceYear(parseInt(e.target.value, 10))}
              className="px-2.5 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-xs"
              aria-label="Év"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Importált elszámolás megjelenítése */}
          {settlementApartment && (() => {
            const importedSettlement = importedSettlements.find((s) =>
              String(s.apartmentId) === String(settlementApartment) &&
              s.month === financeMonth &&
              s.year === financeYear
            );

            if (importedSettlement) {
              const apt = apartments.find((a) => String(a.id) === String(settlementApartment));

              return (
                <div className="space-y-4">
                  <Card className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <h3 className="text-xl font-bold">{apt?.name || 'Lakás'} - Importált elszámolás</h3>
                    <p className="text-purple-100">
                      {months[financeMonth]} {financeYear} - {importedSettlement.platform} - {importedSettlement.currency}
                    </p>
                  </Card>

                  {/* Foglalások táblázat */}
                  <Card className="p-4">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span>📊</span> Foglalások ({importedSettlement.bookings.length} db)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className={`${
                            importedSettlement.platform === 'airbnb' ? 'bg-green-100 dark:bg-green-900/30' :
                            importedSettlement.platform === 'booking' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold">Vendég</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold">Fő</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold">Check In</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold">Check Out</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-semibold">Jutalék</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-semibold">Nettó bérleti díj</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-semibold">IFA</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-semibold">Takarítás</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-semibold">Kifizetés</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedSettlement.bookings.map((booking, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300">{booking.guestName}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-700 dark:text-gray-300">{booking.guestNumber}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-700 dark:text-gray-300">{booking.checkIn}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-700 dark:text-gray-300">{booking.checkOut}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrencyHUF(booking.commission)}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrencyHUF(booking.netRentFee)}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrencyHUF(booking.cityTax)}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrencyHUF(booking.cleaning)}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-bold text-gray-700 dark:text-gray-300">{formatCurrencyHUF(booking.payout)}</td>
                            </tr>
                          ))}
                          {/* Összesítő sor */}
                          <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                            <td colSpan="4" className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">Összesen</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrencyHUF(importedSettlement.totals.totalCommission)}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrencyHUF(importedSettlement.totals.totalNetRentFee)}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrencyHUF(importedSettlement.totals.totalCityTax)}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrencyHUF(importedSettlement.totals.totalCleaning)}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrencyHUF(importedSettlement.totals.totalPayout)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Co-host Payout szakasz */}
                  <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-orange-800 dark:text-orange-200">
                      <span>💰</span> Co-host Payout
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span>Takarítás összesen:</span>
                        <span className="font-bold">{formatCurrencyHUF(importedSettlement.totals.totalCleaning)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span>Fogyóeszközök & egyéb:</span>
                        <span className="font-bold">{formatCurrencyHUF(0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg font-bold">
                        <span>Co-host Payout összesen:</span>
                        <span className="text-orange-700 dark:text-orange-400">{formatCurrencyHUF(importedSettlement.totals.totalCleaning)}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Management & Partner payout */}
                  <Card className="p-4 border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-800 dark:text-green-200">
                      <span>💼</span> Elszámolás
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span>Összes kifizetés:</span>
                        <span className="font-bold">{formatCurrencyHUF(importedSettlement.totals.totalPayout)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <span>Management jutalék (20%):</span>
                        <span className="font-bold text-pink-700 dark:text-pink-400">{formatCurrencyHUF(importedSettlement.totals.managementCommission)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span>Takarítás levonva:</span>
                        <span className="font-bold">-{formatCurrencyHUF(importedSettlement.totals.totalCleaning)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-200 dark:bg-green-800 rounded-lg font-bold text-lg border-2 border-green-400 dark:border-green-600">
                        <span className="text-green-900 dark:text-green-100">Partner kifizetés:</span>
                        <span className="text-green-700 dark:text-green-300">{formatCurrencyHUF(importedSettlement.totals.partnerPayout)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            }
            return null;
          })()}

          {!settlementApartment && (
            <Card className="p-4">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span></span> Foglalások a kiválasztott idszakban ({months[financeMonth]} {financeYear})
              </h4>
              {settlementPeriodBookings.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">Nincs foglalás ebben a hónapban</p>
              ) : (
                <div className="space-y-2">
                  {settlementPeriodBookings.map((b) => (
                    <div key={b.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${
                          b.platform === 'airbnb' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' :
                          b.platform === 'booking' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {PLATFORM_LABELS[b.platform] || b.platform}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getApartmentName(b.apartmentId)}
                        </span>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDate(b.dateFrom || b.checkIn)}  {formatDate(b.dateTo || b.checkOut)}</span>
                          {b.guestName && <span className="ml-2">{b.guestName}</span>}
                        </div>
                      </div>
                      <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0 ml-2">
                        {formatCurrencyHUF(b.payoutFt || b.netRevenue || 0)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t dark:border-gray-600 font-bold">
                    <span>Összesen:</span>
                    <span className="text-amber-700 dark:text-amber-400">{formatCurrencyHUF(settlementPeriodPayout)}</span>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Válassz ki egy lakást a részletes elszámolás (díjbekér) megtekintéséhez
              </p>
            </Card>
          )}

          {settlementApartment ? (() => {
            const apt = apartments.find((a) => String(a.id) === String(settlementApartment));
            const startOfMonth = new Date(financeYear, financeMonth, 1);
            const endOfMonth = new Date(financeYear, financeMonth + 1, 0);

            // Foglalások szrése: Booking.com = távozó, egyéb = érkez
            const aptBookings = bookings.filter((b) => {
              if (String(b.apartmentId) !== String(settlementApartment)) return false;
              const dateFrom = new Date(b.dateFrom || b.checkIn);
              const dateTo = new Date(b.dateTo || b.checkOut);
              if (b.platform === 'booking') {
                return dateTo >= startOfMonth && dateTo <= endOfMonth;
              }
              return dateFrom >= startOfMonth && dateFrom <= endOfMonth;
            });

            // Karbantartások az adott hónapban
            const aptMaintenance = maintenanceForPeriod.list.filter((m) =>
              String(m.apartmentId) === String(settlementApartment)
            );

            // Számítások
            const totalPayout = aptBookings.reduce((sum, b) => sum + (Number(b.payoutFt) || Number(b.netRevenue) || 0), 0);
            const cleaningFeeEur = Number(apt?.cleaningFeeEur || 0);
            const cleaningFeeTotal = aptBookings.length * cleaningFeeEur * 400; // EUR -> HUF (400-as árfolyam)
            const managementFeePercent = apt?.managementFee || 25;
            const managementAmount = aptBookings.reduce((sum, b) => {
              const revenue = Number(b.payoutFt) || Number(b.netRevenue) || 0;
              return sum + (revenue * managementFeePercent / 100);
            }, 0);
            const monthlyFee = Number(apt?.monthlyFeeEur || 0) * 400; // EUR -> HUF (400-as árfolyam)
            const maintenanceTotal = aptMaintenance.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

            // Extra tételek
            const extraItems = settlementExtraItems.filter((item) =>
              String(item.apartmentId) === String(settlementApartment) &&
              item.month === financeMonth &&
              item.year === financeYear
            );
            const extraItemsTotal = extraItems.reduce((sum, item) =>
              sum + (item.isDiscount ? -Number(item.amount) : Number(item.amount)), 0
            );

            // Összesített elszámolás (partner felé utalandó)
            const ourRevenue = cleaningFeeTotal + managementAmount + monthlyFee + maintenanceTotal + extraItemsTotal;

            return (
              <div className="space-y-4">
                <Card className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <h3 className="text-xl font-bold">{apt?.name || 'Lakás'}</h3>
                  <p className="text-purple-100">
                    {months[financeMonth]} {financeYear}
                  </p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span></span> Foglalások ({aptBookings.length} db)
                  </h4>
                  {aptBookings.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 py-4 text-center">Nincs foglalás ebben a hónapban</p>
                  ) : (
                    <div className="space-y-2">
                      {aptBookings.map((b) => (
                        <div key={b.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              b.platform === 'airbnb' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' :
                              b.platform === 'booking' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {PLATFORM_LABELS[b.platform] || b.platform}
                            </span>
                            <div>
                              <span className="font-medium">{formatDate(b.dateFrom || b.checkIn)}  {formatDate(b.dateTo || b.checkOut)}</span>
                              {b.guestName && <span className="text-gray-500 dark:text-gray-400 ml-2">{b.guestName}</span>}
                            </div>
                          </div>
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            {formatCurrencyHUF(b.payoutFt || b.netRevenue || 0)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t dark:border-gray-600 font-bold">
                        <span>Összesen Payout:</span>
                        <span className="text-amber-700 dark:text-amber-400">{formatCurrencyHUF(totalPayout)}</span>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-4 border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-800 dark:text-green-200">
                    <span></span> Díjbekér
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span>Havi díj:</span>
                      <span className="font-bold">{formatCurrencyHUF(monthlyFee)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span>Takarítási díjak ({aptBookings.length} foglalás):</span>
                      <span className="font-bold">{formatCurrencyHUF(cleaningFeeTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span>Jutalék ({managementFeePercent}%):</span>
                      <span className="font-bold">{formatCurrencyHUF(managementAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span>Karbantartás / Eszközpótlás:</span>
                      <span className="font-bold">{formatCurrencyHUF(maintenanceTotal)}</span>
                    </div>

                    {extraItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center p-2 rounded-lg ${item.isDiscount ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}
                      >
                        <span className={item.isDiscount ? 'text-red-700 dark:text-red-300' : ''}>
                          {item.name}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${item.isDiscount ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {item.isDiscount ? '-' : '+'}{formatCurrencyHUF(item.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSettlementItem(item);
                              setNewSettlementItem({ name: item.name, amount: String(item.amount), isDiscount: item.isDiscount });
                              setShowAddSettlementItem(true);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs"
                            aria-label={`Szerkesztés: ${item.name}`}
                          >
                            
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettlementExtraItems((prev) => prev.filter((i) => i.id !== item.id));
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-xs text-red-600"
                            aria-label={`Törlés: ${item.name}`}
                          >
                            
                          </button>
                        </div>
                      </div>
                    ))}

                    {showAddSettlementItem && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 space-y-2">
                        <input
                          type="text"
                          value={newSettlementItem.name}
                          onChange={(e) => setNewSettlementItem((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Tétel neve"
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={newSettlementItem.amount}
                            onChange={(e) => setNewSettlementItem((p) => ({ ...p, amount: e.target.value }))}
                            placeholder="Összeg (Ft)"
                            className="flex-1 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                          />
                          <label className="flex items-center gap-2 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newSettlementItem.isDiscount}
                              onChange={(e) => setNewSettlementItem((p) => ({ ...p, isDiscount: e.target.checked }))}
                              className="rounded"
                            />
                            <span>Kedvezmény</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (editingSettlementItem) {
                                setSettlementExtraItems((prev) =>
                                  prev.map((i) =>
                                    i.id === editingSettlementItem.id
                                      ? { ...i, name: newSettlementItem.name, amount: Number(newSettlementItem.amount), isDiscount: newSettlementItem.isDiscount }
                                      : i
                                  )
                                );
                                setEditingSettlementItem(null);
                              } else {
                                setSettlementExtraItems((prev) => [
                                  ...prev,
                                  {
                                    id: `extra-${Date.now()}`,
                                    apartmentId: settlementApartment,
                                    month: financeMonth,
                                    year: financeYear,
                                    name: newSettlementItem.name,
                                    amount: Number(newSettlementItem.amount),
                                    isDiscount: newSettlementItem.isDiscount
                                  }
                                ]);
                              }
                              setShowAddSettlementItem(false);
                              setNewSettlementItem({ name: '', amount: '', isDiscount: false });
                            }}
                            variant="primary"
                            size="sm"
                            disabled={!newSettlementItem.name || !newSettlementItem.amount}
                          >
                            {editingSettlementItem ? 'Mentés' : 'Hozzáadás'}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAddSettlementItem(false);
                              setEditingSettlementItem(null);
                              setNewSettlementItem({ name: '', amount: '', isDiscount: false });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Mégse
                          </Button>
                        </div>
                      </div>
                    )}

                    {!showAddSettlementItem && (
                      <Button
                        onClick={() => setShowAddSettlementItem(true)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Plus /> Extra tétel hozzáadása
                      </Button>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t dark:border-gray-600 font-bold text-lg">
                      <span>Összesen (partner felé utalandó):</span>
                      <span className="text-green-700 dark:text-green-400">{formatCurrencyHUF(ourRevenue)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })() : null}
        </>
      )}

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
                    <label htmlFor={`finance-target-${index}-planUnits`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tervezett egység</label>
                    <input
                      id={`finance-target-${index}-planUnits`}
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
                    <label htmlFor={`finance-target-${index}-planAvgPrice`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Átlagár (Ft)</label>
                    <input
                      id={`finance-target-${index}-planAvgPrice`}
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
                    <label htmlFor={`finance-target-${index}-actualUnits`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tényleges egység</label>
                    <input
                      id={`finance-target-${index}-actualUnits`}
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
                    <label htmlFor={`finance-target-${index}-actualRevenue`} className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Tényleges bevétel (Ft)</label>
                    <input
                      id={`finance-target-${index}-actualRevenue`}
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

      {financeSubTab === 'szamlazas' && (
        <Card className="p-6">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Számlázás</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Számlázás modul - hamarosan
          </p>
        </Card>
      )}

      {/* Settlement Import Modal */}
      <SettlementImportModal
        isOpen={showSettlementImport}
        onClose={() => setShowSettlementImport(false)}
        onImportSuccess={handleImportSuccess}
        apartments={apartments}
      />
    </div>
  );
};

export default FinancePage;
