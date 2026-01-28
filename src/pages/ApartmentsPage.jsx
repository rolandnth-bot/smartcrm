import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import useApartmentsStore from '../stores/apartmentsStore';
import useSalesStore from '../stores/salesStore';
import useToastStore from '../stores/toastStore';
import { usePermissions } from '../contexts/PermissionContext';
import { validateForm } from '../utils/validation';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp, RefreshCw } from '../components/common/Icons';
import { SkeletonListItem, SkeletonStatsCard } from '../components/common/Skeleton';
import { exportToCSV, exportToExcel, printToPDF } from '../utils/exportUtils';
import { todayISO, formatTimeAgo, getFirstDayOfMonth, getLastDayOfMonth } from '../utils/dateUtils';
import { formatNumber } from '../utils/numberUtils';
import EmptyState, { EmptyStateWithFilter } from '../components/common/EmptyState';
import { AIRBNB_AMENITIES, BOOKING_FELSZERELTSEG } from '../config/amenities';

// Common item types (konstans, komponensen kívül)
const COMMON_ITEM_TYPES = ['Ágynemű', 'Törölköző', 'Konyharuha', 'Párna', 'Takaró', 'Függöny', 'Szőnyeg', 'Törölközőszett', 'Fürdőruha', 'Egyéb'];

const COMMON_SIZES = ['90x200', '140x200', '160x200', '180x200', '200x200', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Egyéb'];
const COMMON_BRANDS = ['IKEA', 'Zara Home', 'Jysk', 'H&M Home', 'Westwing', 'Dunelm', 'Egyéb'];
const QUANTITY_BASE = Array.from({ length: 51 }, (_, i) => i); // 0–50

// Inventory szerkesztő komponens
const InventoryEditor = memo(({ inventory = [], onChange }) => {
  const [items, setItems] = useState(inventory.length > 0 ? inventory : [{ itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }]);

  useEffect(() => {
    setItems(inventory.length > 0 ? inventory : [{ itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }]);
  }, [inventory]);

  const sizeOptions = useMemo(() => {
    const fromItems = items.map((i) => i.itemSize).filter(Boolean);
    const extra = fromItems.filter((s) => !COMMON_SIZES.includes(s));
    return [...COMMON_SIZES, ...[...new Set(extra)]];
  }, [items]);

  const brandOptions = useMemo(() => {
    const fromItems = items.map((i) => i.brand).filter(Boolean);
    const extra = fromItems.filter((b) => !COMMON_BRANDS.includes(b));
    return [...COMMON_BRANDS, ...[...new Set(extra)]];
  }, [items]);

  const quantityOptions = useMemo(() => {
    const fromItems = items.map((i) => Number(i.quantity)).filter((n) => !isNaN(n) && n > 50);
    const extra = [...new Set(fromItems)].sort((a, b) => a - b);
    return [...QUANTITY_BASE, ...extra];
  }, [items]);

  const handleItemChange = useCallback((index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      const filtered = updated.filter((item) => item.itemType.trim() !== '');
      onChange(filtered);
      return updated;
    });
  }, [onChange]);

  const addItem = useCallback(() => {
    setItems((prevItems) => [...prevItems, { itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((_, i) => i !== index);
      const final = updated.length > 0 ? updated : [{ itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }];
      const filtered = final.filter((item) => item.itemType.trim() !== '');
      onChange(filtered);
      return final;
    });
  }, [onChange]);

  return (
    <div className="border-t dark:border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Készlet (Inventory)</h4>
        <Button onClick={addItem} variant="outline" size="sm" aria-label="Új tétel hozzáadása">
          <Plus /> Hozzáadás
        </Button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="border dark:border-gray-600 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Tétel típusa *</label>
                  <select
                    value={item.itemType}
                    onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Válassz típust...</option>
                    {COMMON_ITEM_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Méret</label>
                  <select
                    value={item.itemSize}
                    onChange={(e) => handleItemChange(index, 'itemSize', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Válassz méretet...</option>
                    {sizeOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mennyiség</label>
                  <select
                    value={String(item.quantity)}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {quantityOptions.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Márka</label>
                  <select
                    value={item.brand}
                    onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Válassz márkát...</option>
                    {brandOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                aria-label="Tétel eltávolítása"
              >
                <Trash2 />
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Megjegyzés</label>
              <textarea
                value={item.notes}
                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                placeholder="Egyéb információk..."
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

InventoryEditor.displayName = 'InventoryEditor';

// Airbnb Beállítások, Booking beállítások, Booking felszereltségek – iCal + felszereltségek
const AirbnbBookingAmenitiesSections = ({ apartment = {}, onChange, idPrefix = 'edit-apartment' }) => {
  const amenities = apartment.amenities || [];
  const [airbnbSearch, setAirbnbSearch] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(new Set(['Legnépszerűbb szolgáltatások', 'Étkezések', 'Beszélt nyelvek']));

  const toggleAmenity = useCallback((item) => {
    const next = amenities.includes(item)
      ? amenities.filter((a) => a !== item)
      : [...amenities, item];
    onChange('amenities', next);
  }, [amenities, onChange]);

  const airbnbFiltered = useMemo(() => {
    if (!airbnbSearch.trim()) return AIRBNB_AMENITIES;
    const q = airbnbSearch.toLowerCase();
    return AIRBNB_AMENITIES.filter((a) => a.toLowerCase().includes(q));
  }, [airbnbSearch]);

  const toggleBookingCategory = useCallback((cat) => {
    setExpandedBooking((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6 border-t dark:border-gray-700 pt-4">
      {/* Airbnb Beállítások */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Airbnb Beállítások</h4>
        <div className="space-y-3">
          <div>
            <label htmlFor={`${idPrefix}-ical-airbnb`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Airbnb iCal URL</label>
            <input
              id={`${idPrefix}-ical-airbnb`}
              type="url"
              value={apartment.icalAirbnb || ''}
              onChange={(e) => onChange('icalAirbnb', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              aria-label="Airbnb iCal URL"
            />
          </div>
          <div>
            <input
              type="text"
              value={airbnbSearch}
              onChange={(e) => setAirbnbSearch(e.target.value)}
              placeholder="Keresés Airbnb felszereltség között..."
              className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border dark:border-gray-600 rounded-lg">
              {airbnbFiltered.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={amenities.includes(item)}
                    onChange={() => toggleAmenity(item)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking beállítások */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Booking beállítások</h4>
        <div>
          <label htmlFor={`${idPrefix}-ical-booking`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Booking.com iCal URL</label>
          <input
            id={`${idPrefix}-ical-booking`}
            type="url"
            value={apartment.icalBooking || ''}
            onChange={(e) => onChange('icalBooking', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
            aria-label="Booking.com iCal URL"
          />
        </div>
      </div>

      {/* Egyéb iCal (Szallas, Saját) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Egyéb iCal</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${idPrefix}-ical-szallas`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Szallas.hu iCal URL</label>
            <input
              id={`${idPrefix}-ical-szallas`}
              type="url"
              value={apartment.icalSzallas || ''}
              onChange={(e) => onChange('icalSzallas', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              aria-label="Szallas.hu iCal URL"
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-ical-own`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Saját iCal URL</label>
            <input
              id={`${idPrefix}-ical-own`}
              type="url"
              value={apartment.icalOwn || ''}
              onChange={(e) => onChange('icalOwn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              aria-label="Saját iCal URL"
            />
          </div>
        </div>
      </div>

      {/* Booking felszereltségek */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Booking felszereltségek</h4>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {Object.entries(BOOKING_FELSZERELTSEG).map(([category, data]) => (
            <div key={category} className="border dark:border-gray-600 rounded-lg">
              <button
                type="button"
                onClick={() => toggleBookingCategory(category)}
                className={`w-full px-3 py-2 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg ${expandedBooking.has(category) ? 'rounded-b-none' : ''}`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                {expandedBooking.has(category) ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedBooking.has(category) && (
                <div className={`px-3 pb-2 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t dark:border-gray-600 ${data.color || ''}`}>
                  {data.items.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={amenities.includes(item)}
                        onChange={() => toggleAmenity(item)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {amenities.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            <strong>Kiválasztva ({amenities.length}):</strong>{' '}
            <span className="text-gray-600 dark:text-gray-400">{amenities.slice(0, 5).join(', ')}{amenities.length > 5 ? '...' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ApartmentsPage = () => {
  const {
    apartments,
    filter,
    searchQuery,
    isLoading,
    error,
    showAddApartment,
    showEditApartment,
    selectedApartment,
    setFilter,
    setSearchQuery,
    setShowAddApartment,
    setShowEditApartment,
    setSelectedApartment,
    setError,
    fetchFromApi,
    addApartment,
    updateApartment,
    deleteApartment,
    getFilteredApartments,
    getStats
  } = useApartmentsStore();

  const { salesTargets, getTotalStats } = useSalesStore();
  const [unitPlanPeriod, setUnitPlanPeriod] = useState('year'); // 'year', 'month', 'week', 'day' - alapértelmezett: Éves

  const { canEdit: canEditApartments } = usePermissions();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApartments, setSelectedApartments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });

  const [newApartment, setNewApartment] = useState({
    name: '',
    address: '',
    city: '',
    zipCode: '',
    clientId: '',
    clientName: '',
    gateCode: '',
    timeFrame: 2,
    cleaningFeeEur: 25,
    monthlyFeeEur: 30,
    managementFee: 25,
    tourismTaxType: 'percent',
    tourismTaxPercent: 4,
    tourismTaxFixed: 0,
    status: 'active',
    notes: '',
    amenities: [],
    icalAirbnb: '',
    icalBooking: '',
    icalSzallas: '',
    icalOwn: ''
  });

  const filteredApartments = useMemo(() => {
    const filtered = getFilteredApartments();
    // Rendezés alkalmazása
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.field] || '';
      let bValue = b[sortConfig.field] || '';
      
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
  }, [getFilteredApartments, filter, searchQuery, apartments, sortConfig]);

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  const stats = useMemo(() => getStats(), [getStats, apartments]);
  
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
  
  // Skeleton elemek (konstans, memoizálva)
  const skeletonListItems = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  useEffect(() => {
    document.title = 'Lakások kezelése - SmartCRM';
    fetchFromApi();
  }, [fetchFromApi]);

  const handleAddApartment = useCallback(async () => {
    if (isSubmitting) return;

    // Validáció
    const validation = validateForm(newApartment, {
      name: ['required', { type: 'length', min: 2, max: 100 }],
      address: ['required', { type: 'length', min: 5, max: 200 }]
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }
    setIsSubmitting(true);
    try {
      await addApartment(newApartment);
      setNewApartment({
        name: '', address: '', city: '', zipCode: '', clientId: '', clientName: '', gateCode: '',
        timeFrame: 2, cleaningFeeEur: 25, monthlyFeeEur: 30, managementFee: 25,
        tourismTaxType: 'percent', tourismTaxPercent: 4, tourismTaxFixed: 0, status: 'active', notes: '',
        amenities: [], inventory: [],
        icalAirbnb: '', icalBooking: '', icalSzallas: '', icalOwn: ''
      });
      setShowAddApartment(false);
    } catch (e) {
      // Hibaüzenet már kezelve a store-ban, de ha nincs, akkor általános üzenet
      if (!error) {
        useToastStore.getState().error('Hiba a lakás hozzáadásakor. Kérjük, próbálja újra.');
      }
      if (import.meta.env.DEV) {
        console.error('Hiba a lakás hozzáadásakor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [newApartment, addApartment, isSubmitting, setShowAddApartment]);

  const handleEditApartment = useCallback(async () => {
    if (!selectedApartment || isSubmitting) return;

    // Validáció
    const validation = validateForm(selectedApartment, {
      name: ['required', { type: 'length', min: 2, max: 100 }],
      address: ['required', { type: 'length', min: 5, max: 200 }]
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      useToastStore.getState().error(firstError);
      return;
    }
    setIsSubmitting(true);
    try {
      await updateApartment(selectedApartment.id, selectedApartment);
      setShowEditApartment(false);
      setSelectedApartment(null);
    } catch (e) {
      // Hibaüzenet már kezelve a store-ban, de ha nincs, akkor általános üzenet
      if (!error) {
        useToastStore.getState().error('Hiba a lakás módosításakor. Kérjük, próbálja újra.');
      }
      if (import.meta.env.DEV) {
        console.error('Hiba a lakás módosításakor:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedApartment, updateApartment, isSubmitting, setShowEditApartment, setSelectedApartment]);

  const handleDeleteApartment = useCallback((id) => {
    const apartment = apartments.find((a) => a.id === id);
    setDeleteConfirm({
      id,
      message: `Biztosan törölni szeretnéd a lakást${apartment?.name ? ` (${apartment.name})` : ''}?`
    });
  }, [apartments]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteApartment(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (e) {
      // Hibaüzenet már kezelve a store-ban, de ha nincs, akkor általános üzenet
      if (!error) {
        useToastStore.getState().error('Hiba a lakás törlésekor. Kérjük, próbálja újra.');
      }
      if (import.meta.env.DEV) {
        console.error('Hiba a lakás törlésekor:', e);
      }
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteApartment, error]);

  const handleOpenAddApartment = useCallback(() => {
    setShowAddApartment(true);
  }, [setShowAddApartment]);

  const handleCloseAddApartment = useCallback(() => {
    setShowAddApartment(false);
  }, [setShowAddApartment]);

  const handleCloseEditApartment = useCallback(() => {
    setShowEditApartment(false);
    setSelectedApartment(null);
  }, [setShowEditApartment, setSelectedApartment]);

  const handleClearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleFilterAll = useCallback(() => {
    setFilter('all');
  }, [setFilter]);

  const handleFilterActive = useCallback(() => {
    setFilter('active');
  }, [setFilter]);

  const handleFilterInactive = useCallback(() => {
    setFilter('inactive');
  }, [setFilter]);

  const handleFilterPending = useCallback(() => {
    setFilter('pending');
  }, [setFilter]);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleNewApartmentChange = useCallback((field, value) => {
    setNewApartment((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectedApartmentChange = useCallback((field, value) => {
    if (!selectedApartment) return;
    setSelectedApartment({ ...selectedApartment, [field]: value });
  }, [selectedApartment, setSelectedApartment]);

  const handleEditApartmentClick = useCallback((apartment) => {
    setSelectedApartment(apartment);
    setShowEditApartment(true);
  }, [setSelectedApartment, setShowEditApartment]);

  const handleDeleteApartmentClick = useCallback((id) => {
    handleDeleteApartment(id);
  }, [handleDeleteApartment]);

  const statusColors = useMemo(() => ({
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
  }), []);

  const statusLabels = useMemo(() => ({
    active: 'Aktív',
    inactive: 'Inaktív',
    pending: 'Függőben'
  }), []);

  const apartmentExportColumns = useMemo(() => [
    { key: 'name', label: 'Név' },
    { key: 'address', label: 'Cím' },
    { key: 'city', label: 'Város' },
    { key: 'zipCode', label: 'Irányítószám' },
    { key: 'clientName', label: 'Ügyfél' },
    { key: 'statusLabel', label: 'Státusz' },
    { key: 'cleaningFeeEur', label: 'Takarti díj (EUR)' },
    { key: 'monthlyFeeEur', label: 'Havi díj (EUR)' },
    { key: 'managementFee', label: 'Kezelési díj (%)' },
    { key: 'notes', label: 'Megjegyzés' }
  ], []);

  const getExportData = useCallback(() => {
    return filteredApartments.map((a) => ({
      ...a,
      statusLabel: statusLabels[a.status] || a.status
    }));
  }, [filteredApartments, statusLabels]);

  const handleExportCSV = useCallback(() => {
    const rows = getExportData();
    exportToCSV(rows, apartmentExportColumns, `lakasok_${todayISO()}.csv`);
  }, [getExportData, apartmentExportColumns]);

  const handleExportExcel = useCallback(() => {
    const rows = getExportData();
    exportToExcel(rows, apartmentExportColumns, `lakasok_${todayISO()}.xlsx`);
  }, [getExportData, apartmentExportColumns]);

  const handlePrintPDF = useCallback(() => {
    printToPDF('SmartCRM – Lakások');
  }, []);

  const handleToggleApartmentSelection = useCallback((apartmentId) => {
    setSelectedApartments((prev) => {
      if (prev.includes(apartmentId)) {
        return prev.filter((id) => id !== apartmentId);
      }
      return [...prev, apartmentId];
    });
  }, []);

  const handleSelectAllApartments = useCallback(() => {
    setSelectedApartments((prev) => {
      const allIds = filteredApartments.map((a) => a.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }, [filteredApartments]);

  const handleBulkStatusChange = useCallback(async (status) => {
    if (!status || selectedApartments.length === 0) return;
    setIsSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      for (const apartmentId of selectedApartments) {
        try {
          await updateApartment(apartmentId, { status });
          successCount++;
        } catch (e) {
          errorCount++;
          if (import.meta.env.DEV) {
            console.error(`Hiba a lakás státusz frissítésekor (${apartmentId}):`, e);
          }
        }
      }
      if (errorCount === 0) {
        useToastStore.getState().success(`${successCount} lakás státusza sikeresen frissítve.`);
        setSelectedApartments([]);
      } else {
        useToastStore.getState().warning(`${successCount} lakás frissítve, ${errorCount} hiba történt.`);
      }
    } catch (e) {
      useToastStore.getState().error('Hiba a bulk státusz változtatás során.');
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk státusz változtatás során:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedApartments, updateApartment]);

  const handleBulkDelete = useCallback(() => {
    if (selectedApartments.length === 0) return;
    setBulkDeleteConfirm(true);
  }, [selectedApartments.length]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedApartments.length === 0) return;
    
    setIsSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      for (const apartmentId of selectedApartments) {
        try {
          await deleteApartment(apartmentId);
          successCount++;
        } catch (e) {
          errorCount++;
          if (import.meta.env.DEV) {
            console.error(`Hiba a lakás törlésekor (${apartmentId}):`, e);
          }
        }
      }
      if (errorCount === 0) {
        useToastStore.getState().success(`${successCount} lakás sikeresen törölve.`);
        setSelectedApartments([]);
      } else {
        useToastStore.getState().warning(`${successCount} lakás törölve, ${errorCount} hiba történt.`);
      }
      await fetchFromApi();
      setBulkDeleteConfirm(false);
    } catch (e) {
      useToastStore.getState().error('Hiba a bulk törlés során.');
      if (import.meta.env.DEV) {
        console.error('Hiba a bulk törlés során:', e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedApartments, deleteApartment, fetchFromApi]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Lakások kezelése</h2>
        <div className="no-print flex gap-2 flex-wrap">
          <Button
            onClick={() => {
              fetchFromApi();
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
          {canEditApartments('apartments') && (
            <Button onClick={handleOpenAddApartment} variant="success">
              <Plus /> Új lakás
            </Button>
          )}
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

      {isLoading && apartments.length === 0 ? (
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
            <div className="text-sm text-gray-600 dark:text-gray-400">Összes lakás</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Aktív</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inaktív</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Függőben</div>
          </div>
        </Card>
      </div>

      {/* Lakás egység terv/tény */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Lakás egység terv/tény</h3>
            <div className="flex gap-2">
              <Button
                variant={unitPlanPeriod === 'year' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUnitPlanPeriod('year')}
              >
                Éves
              </Button>
              <Button
                variant={unitPlanPeriod === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUnitPlanPeriod('month')}
              >
                Havi
              </Button>
              <Button
                variant={unitPlanPeriod === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUnitPlanPeriod('week')}
              >
                Heti
              </Button>
              <Button
                variant={unitPlanPeriod === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUnitPlanPeriod('day')}
              >
                Napi
              </Button>
            </div>
          </div>
          {/* 2 kis kártya: Egység Terv, Egység Tény */}
          <div className="grid grid-cols-2 gap-3">
            {/* Egység Terv */}
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-semibold">Egység Terv</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-500">
                {formatNumber(unitPlanFact.plan)}
              </div>
            </div>
            {/* Egység Tény */}
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-semibold">Egység Tény</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-500">
                {formatNumber(unitPlanFact.fact)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              unitPlanFact.hasData ? 'bg-green-500' : 'bg-red-500'
            }`} aria-label={unitPlanFact.hasData ? 'Adatok megvannak' : 'Nincs adat'} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {unitPlanFact.hasData 
                ? `Teljesítés: ${unitPlanFact.completionRate.toFixed(1)}%`
                : 'Nincs adat'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <Card>
        <div className="space-y-3">
          {/* Kereső mező */}
          <div>
            <label htmlFor="apartment-search" className="sr-only">Keresés lakások között</label>
            <input
              id="apartment-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés név, cím, város, ügyfél vagy megjegyzés alapján..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Keresés lakások között"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Lakások szűrése">
            <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterAll}
            aria-pressed={filter === 'all'}
            aria-label={`Szűrés: Összes lakás (${stats.total})`}
          >
            Összes ({stats.total})
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterActive}
            aria-pressed={filter === 'active'}
            aria-label={`Szűrés: Aktív lakások (${stats.active})`}
          >
            Aktív ({stats.active})
          </Button>
          <Button
            variant={filter === 'inactive' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterInactive}
            aria-pressed={filter === 'inactive'}
            aria-label={`Szűrés: Inaktív lakások (${stats.inactive})`}
          >
            Inaktív ({stats.inactive})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleFilterPending}
            aria-pressed={filter === 'pending'}
            aria-label={`Szűrés: Függőben lévő lakások (${stats.pending})`}
          >
            Függőben ({stats.pending})
          </Button>
          </div>
        </div>
      </Card>

      {/* Lakások lista */}
      {filteredApartments.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Lakások ({filteredApartments.length})</h3>
            {canEditApartments('apartments') && (
              <Button
                onClick={handleSelectAllApartments}
                variant="ghost"
                size="sm"
                aria-label={selectedApartments.length === filteredApartments.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
              >
                {selectedApartments.length === filteredApartments.length ? 'Kijelölés törlése' : 'Összes kijelölése'}
              </Button>
            )}
          </div>
          {selectedApartments.length > 0 && canEditApartments('apartments') && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">
                  {selectedApartments.length} lakás kiválasztva
                </span>
                <div className="flex gap-2">
                  <label htmlFor="bulk-status-select" className="sr-only">
                    Státusz változtatása kiválasztott lakásokra
                  </label>
                  <select
                    id="bulk-status-select"
                    onChange={(e) => handleBulkStatusChange(e.target.value)}
                    className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                    disabled={isSubmitting}
                    aria-label="Státusz változtatása kiválasztott lakásokra"
                  >
                    <option value="" disabled>Státusz változtatása...</option>
                    <option value="active">Aktív</option>
                    <option value="inactive">Inaktív</option>
                    <option value="pending">Függőben</option>
                  </select>
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
                    onClick={() => setSelectedApartments([])}
                    variant="ghost"
                    size="sm"
                  >
                    Kijelölés törlése
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {/* Rendezés */}
          <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rendezés:</span>
            <button
              type="button"
              onClick={() => handleSort('name')}
              className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'name' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              aria-label={`Név szerint ${sortConfig.field === 'name' && sortConfig.direction === 'asc' ? 'növekvő' : 'csökkenő'}`}
            >
              Név {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
            </button>
            <button
              type="button"
              onClick={() => handleSort('city')}
              className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'city' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              aria-label={`Város szerint ${sortConfig.field === 'city' && sortConfig.direction === 'asc' ? 'növekvő' : 'csökkenő'}`}
            >
              Város {sortConfig.field === 'city' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
            </button>
            <button
              type="button"
              onClick={() => handleSort('status')}
              className={`px-3 py-1 text-xs rounded border transition ${sortConfig.field === 'status' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              aria-label={`Státusz szerint ${sortConfig.field === 'status' && sortConfig.direction === 'asc' ? 'növekvő' : 'csökkenő'}`}
            >
              Státusz {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp /> : <ChevronDown />)}
            </button>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {canEditApartments('apartments') && <th className="px-3 py-2 w-10" scope="col" />}
                    <th className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200" scope="col">Név</th>
                    <th className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200" scope="col">Státusz</th>
                    <th className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200" scope="col">Cím / Város</th>
                    <th className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200" scope="col">Megbízó</th>
                    {canEditApartments('apartments') && <th className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-200" scope="col">Műveletek</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredApartments.map((apartment) => (
                    <tr key={apartment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {canEditApartments('apartments') && (
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedApartments.includes(apartment.id)}
                            onChange={() => handleToggleApartmentSelection(apartment.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                            aria-label={`Lakás kijelölése: ${apartment.name}`}
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{apartment.name}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[apartment.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          {statusLabels[apartment.status] || apartment.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {[apartment.address, apartment.city].filter(Boolean).join(', ') || '–'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{apartment.clientName || '–'}</td>
                      {canEditApartments('apartments') && (
                        <td className="px-3 py-2 text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => handleEditApartmentClick(apartment)} aria-label={`Szerkesztés: ${apartment.name}`}>
                              <Edit2 /> Szerkesztés
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteApartmentClick(apartment.id)} aria-label={`Törlés: ${apartment.name}`}>
                              <Trash2 /> Törlés
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        ) : (
          <Card>
            {filter !== 'all' || searchQuery ? (
              <EmptyStateWithFilter
                title="Nincsenek lakások"
                description="A kiválasztott szűrőkkel nem található lakás. Próbáld meg módosítani a szűrőket vagy keresési feltételeket."
                onClearFilter={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
              />
            ) : (
              <EmptyState
                icon={Plus}
                title="Még nincsenek lakások"
                description="Kezdj el lakásokat hozzáadni a kezeléshez."
                actionLabel="Új lakás hozzáadása"
                onAction={canEditApartments('apartments') ? handleOpenAddApartment : undefined}
              />
            )}
          </Card>
        )}
        </>
      )}

      {/* Új lakás modal - csak ha van edit jogosultság */}
      {canEditApartments('apartments') && (
        <Modal
          isOpen={showAddApartment}
          onClose={() => setShowAddApartment(false)}
          title="Új lakás hozzáadása"
          size="lg"
        >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddApartment();
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              handleAddApartment();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              handleCloseAddApartment();
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-apartment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Név *</label>
              <input
                id="new-apartment-name"
                type="text"
                value={newApartment.name}
                onChange={(e) => handleNewApartmentChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lakás neve"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cím *</label>
              <input
                id="new-apartment-address"
                type="text"
                value={newApartment.address}
                onChange={(e) => handleNewApartmentChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Teljes cím"
                required
                aria-required="true"
                autoComplete="street-address"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Város</label>
              <input
                id="new-apartment-city"
                type="text"
                value={newApartment.city}
                onChange={(e) => handleNewApartmentChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Város"
                autoComplete="address-level2"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Irányítószám</label>
              <input
                id="new-apartment-zipCode"
                type="text"
                value={newApartment.zipCode}
                onChange={(e) => handleNewApartmentChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234"
                autoComplete="postal-code"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-gateCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kapukód</label>
              <input
                id="new-apartment-gateCode"
                type="text"
                value={newApartment.gateCode}
                onChange={(e) => handleNewApartmentChange('gateCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kapukód"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-partner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner</label>
              <input
                id="new-apartment-partner"
                type="text"
                value={newApartment.clientName || ''}
                onChange={(e) => handleNewApartmentChange('clientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Partner neve vagy azonosítója"
                aria-label="Partner"
              />
            </div>
            <div>
              <label htmlFor="new-apartment-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Státusz</label>
              <select
                id="new-apartment-status"
                value={newApartment.status}
                onChange={(e) => handleNewApartmentChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Aktív</option>
                <option value="inactive">Inaktív</option>
                <option value="pending">Függőben</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="new-apartment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
            <textarea
              id="new-apartment-notes"
              value={newApartment.notes}
              onChange={(e) => handleNewApartmentChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="További információk..."
              aria-label="Lakás megjegyzése"
            />
          </div>
          <AirbnbBookingAmenitiesSections
            apartment={newApartment}
            onChange={(field, value) => handleNewApartmentChange(field, value)}
            idPrefix="new-apartment"
          />
          <InventoryEditor
            inventory={newApartment.inventory || []}
            onChange={(inventory) => handleNewApartmentChange('inventory', inventory)}
          />
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
            <Button type="button" onClick={handleCloseAddApartment} variant="secondary">
              Mégse
            </Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Szerkesztés modal - csak ha van edit jogosultság */}
      {canEditApartments('apartments') && (
        <Modal
          isOpen={showEditApartment}
          onClose={handleCloseEditApartment}
          title="Lakás szerkesztése"
          size="lg"
        >
        {selectedApartment && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditApartment();
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleEditApartment();
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-apartment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Név *</label>
                <input
                  id="edit-apartment-name"
                  type="text"
                  value={selectedApartment.name || ''}
                  onChange={(e) => handleSelectedApartmentChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cím *</label>
                <input
                  id="edit-apartment-address"
                  type="text"
                  value={selectedApartment.address || ''}
                  onChange={(e) => handleSelectedApartmentChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                  autoComplete="street-address"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Város</label>
                <input
                  id="edit-apartment-city"
                  type="text"
                  value={selectedApartment.city || ''}
                  onChange={(e) => handleSelectedApartmentChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Irányítószám</label>
                <input
                  id="edit-apartment-zipCode"
                  type="text"
                  value={selectedApartment.zipCode || ''}
                  onChange={(e) => handleSelectedApartmentChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-gateCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kapukód</label>
                <input
                  id="edit-apartment-gateCode"
                  type="text"
                  value={selectedApartment.gateCode || ''}
                  onChange={(e) => handleSelectedApartmentChange('gateCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-partner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner</label>
                <input
                  id="edit-apartment-partner"
                  type="text"
                  value={selectedApartment.clientName || ''}
                  onChange={(e) => handleSelectedApartmentChange('clientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Partner neve vagy azonosítója"
                  aria-label="Partner"
                />
              </div>
              <div>
                <label htmlFor="edit-apartment-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Státusz</label>
                <select
                  id="edit-apartment-status"
                  value={selectedApartment.status || 'active'}
                  onChange={(e) => handleSelectedApartmentChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktív</option>
                  <option value="inactive">Inaktív</option>
                  <option value="pending">Függőben</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="edit-apartment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Megjegyzés</label>
              <textarea
                id="edit-apartment-notes"
                value={selectedApartment.notes || ''}
                onChange={(e) => handleSelectedApartmentChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                aria-label="Lakás megjegyzése"
              />
            </div>
            <AirbnbBookingAmenitiesSections
              apartment={selectedApartment}
              onChange={(field, value) => handleSelectedApartmentChange(field, value)}
              idPrefix="edit-apartment"
            />
            <InventoryEditor
              inventory={selectedApartment.inventory || []}
              onChange={(inventory) => handleSelectedApartmentChange('inventory', inventory)}
            />
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
                onClick={() => handleDeleteApartmentClick(selectedApartment.id)}
                variant="danger"
              >
                Törlés
              </Button>
              <Button
                type="button"
                onClick={handleCloseEditApartment}
                variant="secondary"
              >
                Mégse
              </Button>
            </div>
          </form>
        )}
      </Modal>
      )}

      {/* Törlés megerősítés - csak ha van edit jogosultság */}
      {canEditApartments('apartments') && (
        <>
          <ConfirmDialog
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Lakás törlése"
            message={deleteConfirm?.message || 'Biztosan törölni szeretnéd ezt a lakást?'}
            confirmText="Igen, törlés"
            cancelText="Mégse"
            variant="danger"
          />
          <ConfirmDialog
            isOpen={bulkDeleteConfirm}
            onClose={() => setBulkDeleteConfirm(false)}
            onConfirm={confirmBulkDelete}
            title="Lakások törlése"
            message={`Biztosan törölni szeretnéd a ${selectedApartments.length} kiválasztott lakást?`}
            variant="danger"
          />
        </>
      )}

    </div>
  );
};

export default ApartmentsPage;

