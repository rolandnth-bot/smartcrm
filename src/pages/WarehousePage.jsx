/**
 * Raktárak (Warehouse)  Mosoda, Dolgozói készlet, Lakások készlete
 * Központi készletkezelés
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import useApartmentsStore from '../stores/apartmentsStore';
import useWorkersStore from '../stores/workersStore';
import { laundryList } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Plus, Edit2, Package, Users, Home, Trash2 } from '../components/common/Icons';
import useToastStore from '../stores/toastStore';
import EmptyState from '../components/common/EmptyState';
import { SkeletonListItem } from '../components/common/Skeleton';

// Textilkészlet szerkeszt komponens - részletes struktúra
const TextileInventoryEditor = ({ inventory = [], onChange }) => {
  // Ágynem típusok
  const [bedding, setBedding] = useState({
    paplan: { quantity: 0, brand: 'IKEA' },
    parna: { quantity: 0, brand: 'IKEA' },
    lepedo: { quantity: 0, size: '140x200', brand: 'IKEA' },
    agynemusett: { quantity: 0, brand: 'IKEA' }
  });

  // Törölközk
  const [towels, setTowels] = useState({
    nagyTorolkozo: 0,
    kozepesTorolkozo: 0,
    keztorlo: 0,
    kadkilepo: 0,
    konyharuha: 0
  });

  // Egyéb készletek
  const [otherItems, setOtherItems] = useState([]);

  // Betöltés inventory-ból - csak egyszer, amikor a komponens betöltdik
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (isInitialized) return; // Már inicializálva van
    
    if (Array.isArray(inventory) && inventory.length > 0) {
      const beddingData = { paplan: { quantity: 0, brand: 'IKEA' }, parna: { quantity: 0, brand: 'IKEA' }, lepedo: { quantity: 0, size: '140x200', brand: 'IKEA' }, agynemusett: { quantity: 0, brand: 'IKEA' } };
      const towelsData = { nagyTorolkozo: 0, kozepesTorolkozo: 0, keztorlo: 0, kadkilepo: 0, konyharuha: 0 };
      const other = [];

      inventory.forEach(item => {
        const type = item.itemType || '';
        const lowerType = type.toLowerCase();
        
        if (lowerType.includes('paplan')) {
          beddingData.paplan = { quantity: item.quantity || 0, brand: item.brand || 'IKEA' };
        } else if (lowerType.includes('párna')) {
          beddingData.parna = { quantity: item.quantity || 0, brand: item.brand || 'IKEA' };
        } else if (lowerType.includes('leped') || lowerType.includes('lepedo')) {
          beddingData.lepedo = { quantity: item.quantity || 0, size: item.itemSize || '140x200', brand: item.brand || 'IKEA' };
        } else if (lowerType.includes('szett') || (lowerType.includes('ágy') && lowerType.includes('szett'))) {
          beddingData.agynemusett = { quantity: item.quantity || 0, brand: item.brand || 'IKEA' };
        } else if (lowerType.includes('nagy') && lowerType.includes('törölköz')) {
          towelsData.nagyTorolkozo = item.quantity || 0;
        } else if (lowerType.includes('közepes') && lowerType.includes('törölköz')) {
          towelsData.kozepesTorolkozo = item.quantity || 0;
        } else if (lowerType.includes('kéztörl') || lowerType.includes('keztorlo')) {
          towelsData.keztorlo = item.quantity || 0;
        } else if (lowerType.includes('kádkilép') || lowerType.includes('kadkilepo')) {
          towelsData.kadkilepo = item.quantity || 0;
        } else if (lowerType.includes('konyharuha')) {
          towelsData.konyharuha = item.quantity || 0;
        } else {
          other.push(item);
        }
      });

      setBedding(beddingData);
      setTowels(towelsData);
      setOtherItems(other.length > 0 ? other : [{ itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }]);
    }
    setIsInitialized(true);
  }, [inventory]);

  // Változások mentése - csak akkor, ha már inicializálva van
  useEffect(() => {
    if (!isInitialized) return; // Ne hívjuk meg az onChange-t inicializálás eltt
    
    const allItems = [];
    
    // Ágynem
    if (bedding.paplan.quantity > 0) {
      allItems.push({ itemType: 'Paplan', itemSize: '', quantity: bedding.paplan.quantity, brand: bedding.paplan.brand, notes: '' });
    }
    if (bedding.parna.quantity > 0) {
      allItems.push({ itemType: 'Párna', itemSize: '', quantity: bedding.parna.quantity, brand: bedding.parna.brand, notes: '' });
    }
    if (bedding.lepedo.quantity > 0) {
      allItems.push({ itemType: 'Leped', itemSize: bedding.lepedo.size, quantity: bedding.lepedo.quantity, brand: bedding.lepedo.brand, notes: '' });
    }
    if (bedding.agynemusett.quantity > 0) {
      allItems.push({ itemType: 'Ágynem szett', itemSize: '', quantity: bedding.agynemusett.quantity, brand: bedding.agynemusett.brand, notes: '' });
    }

    // Törölközk
    if (towels.nagyTorolkozo > 0) {
      allItems.push({ itemType: 'Nagy törölköz', itemSize: '', quantity: towels.nagyTorolkozo, brand: '', notes: '' });
    }
    if (towels.kozepesTorolkozo > 0) {
      allItems.push({ itemType: 'Közepes törölköz', itemSize: '', quantity: towels.kozepesTorolkozo, brand: '', notes: '' });
    }
    if (towels.keztorlo > 0) {
      allItems.push({ itemType: 'Kéztörl', itemSize: '', quantity: towels.keztorlo, brand: '', notes: '' });
    }
    if (towels.kadkilepo > 0) {
      allItems.push({ itemType: 'Kádkilép', itemSize: '', quantity: towels.kadkilepo, brand: '', notes: '' });
    }
    if (towels.konyharuha > 0) {
      allItems.push({ itemType: 'Konyharuha', itemSize: '', quantity: towels.konyharuha, brand: '', notes: '' });
    }

    // Egyéb készletek
    const filteredOther = otherItems.filter(item => item.itemType && item.itemType.trim() !== '');
    allItems.push(...filteredOther);

    onChange(allItems);
  }, [bedding, towels, otherItems, onChange, isInitialized]);

  const addOtherItem = useCallback(() => {
    setOtherItems(prev => [...prev, { itemType: '', itemSize: '', quantity: 0, brand: '', notes: '' }]);
  }, []);

  const removeOtherItem = useCallback((index) => {
    setOtherItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateOtherItem = useCallback((index, field, value) => {
    setOtherItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Ágynem szekció */}
      <div className="border-b dark:border-gray-700 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"> Ágynem</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Paplan (db)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={bedding.paplan.quantity}
                onChange={(e) => setBedding(prev => ({ ...prev, paplan: { ...prev.paplan, quantity: parseInt(e.target.value) || 0 } }))}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={bedding.paplan.brand}
                onChange={(e) => setBedding(prev => ({ ...prev, paplan: { ...prev.paplan, brand: e.target.value } }))}
                placeholder="IKEA"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Párna (db)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={bedding.parna.quantity}
                onChange={(e) => setBedding(prev => ({ ...prev, parna: { ...prev.parna, quantity: parseInt(e.target.value) || 0 } }))}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={bedding.parna.brand}
                onChange={(e) => setBedding(prev => ({ ...prev, parna: { ...prev.parna, brand: e.target.value } }))}
                placeholder="IKEA"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Leped (db)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={bedding.lepedo.quantity}
                onChange={(e) => setBedding(prev => ({ ...prev, lepedo: { ...prev.lepedo, quantity: parseInt(e.target.value) || 0 } }))}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={bedding.lepedo.size}
                onChange={(e) => setBedding(prev => ({ ...prev, lepedo: { ...prev.lepedo, size: e.target.value } }))}
                placeholder="140x200"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={bedding.lepedo.brand}
                onChange={(e) => setBedding(prev => ({ ...prev, lepedo: { ...prev.lepedo, brand: e.target.value } }))}
                placeholder="IKEA"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ágynem szett (db)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={bedding.agynemusett.quantity}
                onChange={(e) => setBedding(prev => ({ ...prev, agynemusett: { ...prev.agynemusett, quantity: parseInt(e.target.value) || 0 } }))}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={bedding.agynemusett.brand}
                onChange={(e) => setBedding(prev => ({ ...prev, agynemusett: { ...prev.agynemusett, brand: e.target.value } }))}
                placeholder="IKEA"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Törölközk szekció */}
      <div className="border-b dark:border-gray-700 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Törölközk</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Nagy törölköz</label>
            <input
              type="number"
              min="0"
              value={towels.nagyTorolkozo}
              onChange={(e) => setTowels(prev => ({ ...prev, nagyTorolkozo: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Közepes törölköz</label>
            <input
              type="number"
              min="0"
              value={towels.kozepesTorolkozo}
              onChange={(e) => setTowels(prev => ({ ...prev, kozepesTorolkozo: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Kéztörl</label>
            <input
              type="number"
              min="0"
              value={towels.keztorlo}
              onChange={(e) => setTowels(prev => ({ ...prev, keztorlo: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Kádkilép</label>
            <input
              type="number"
              min="0"
              value={towels.kadkilepo}
              onChange={(e) => setTowels(prev => ({ ...prev, kadkilepo: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Konyharuha</label>
            <input
              type="number"
              min="0"
              value={towels.konyharuha}
              onChange={(e) => setTowels(prev => ({ ...prev, konyharuha: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Egyéb készletek szekció */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Egyéb készletek</h4>
          <Button onClick={addOtherItem} variant="outline" size="sm" aria-label="Új tétel hozzáadása">
            <Plus /> Hozzáadás
          </Button>
        </div>
        <div className="space-y-3">
          {otherItems.map((item, index) => (
            <div key={index} className="border dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Tétel neve</label>
                    <input
                      type="text"
                      value={item.itemType}
                      onChange={(e) => updateOtherItem(index, 'itemType', e.target.value)}
                      placeholder="Tétel neve..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Méret</label>
                    <input
                      type="text"
                      value={item.itemSize}
                      onChange={(e) => updateOtherItem(index, 'itemSize', e.target.value)}
                      placeholder="pl. 160x200"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mennyiség</label>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateOtherItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Márka</label>
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => updateOtherItem(index, 'brand', e.target.value)}
                      placeholder="pl. IKEA"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeOtherItem(index)}
                  className="ml-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  aria-label="Tétel eltávolítása"
                >
                  <Trash2 />
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Megjegyzés</label>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateOtherItem(index, 'notes', e.target.value)}
                  placeholder="Egyéb információk..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WarehousePage = () => {
  const { canView, canEdit } = usePermissions();
  const { apartments, fetchFromApi: fetchApartments, updateApartment } = useApartmentsStore();
  const { workers, fetchFromApi: fetchWorkers } = useWorkersStore();
  
  const [activeTab, setActiveTab] = useState('apartments'); // 'apartments', 'laundry', 'workers'
  const [laundryOrders, setLaundryOrders] = useState([]);
  const [isLoadingLaundry, setIsLoadingLaundry] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isSavingInventory, setIsSavingInventory] = useState(false);

  useEffect(() => {
    document.title = 'Raktárak - SmartCRM';
    fetchApartments();
    fetchWorkers();
    fetchLaundryOrders();
  }, [fetchApartments, fetchWorkers]);

  const fetchLaundryOrders = async () => {
    setIsLoadingLaundry(true);
    try {
      const orders = await laundryList();
      setLaundryOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error loading laundry orders:', error);
      setLaundryOrders([]);
    } finally {
      setIsLoadingLaundry(false);
    }
  };

  const tabs = [
    { key: 'apartments', label: 'Lakások készlete', icon: <Home />, count: apartments.length },
    { key: 'laundry', label: 'Mosoda', icon: <Package />, count: laundryOrders.length },
    { key: 'workers', label: 'Dolgozói készlet', icon: <Users />, count: workers.length }
  ];

  // Készlet mentése
  const handleSaveInventory = useCallback(async () => {
    if (!editingInventory || isSavingInventory) return;
    
    setIsSavingInventory(true);
    try {
      if (editingInventory.type === 'apartment') {
        // Lakás készlet frissítése
        const apartment = apartments.find(a => a.id === editingInventory.apartmentId);
        if (apartment) {
          await updateApartment(apartment.id, {
            ...apartment,
            inventory: inventoryItems
          });
          useToastStore.getState().success('Készlet sikeresen frissítve!');
          setShowInventoryModal(false);
          setEditingInventory(null);
          setInventoryItems([]);
          fetchApartments(); // Frissítjük a listát
        }
      } else if (editingInventory.type === 'worker') {
        // Dolgozói készlet - jelenleg csak toast (késbb implementálható)
        useToastStore.getState().info('Dolgozói készlet kezelése fejlesztés alatt');
        setShowInventoryModal(false);
        setEditingInventory(null);
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      useToastStore.getState().error('Hiba a készlet mentésekor');
    } finally {
      setIsSavingInventory(false);
    }
  }, [editingInventory, inventoryItems, apartments, updateApartment, fetchApartments, isSavingInventory]);

  // Modal megnyitásakor beállítjuk a készletet
  useEffect(() => {
    if (editingInventory && showInventoryModal) {
      setInventoryItems(editingInventory.items || []);
    }
  }, [editingInventory, showInventoryModal]);

  // Lakások készlete összesítve
  const apartmentsInventory = useMemo(() => {
    const inventoryMap = new Map();
    apartments.forEach(apt => {
      if (Array.isArray(apt.inventory)) {
        apt.inventory.forEach(item => {
          const key = `${item.itemType || ''}_${item.itemSize || ''}`;
          if (!inventoryMap.has(key)) {
            inventoryMap.set(key, {
              itemType: item.itemType,
              itemSize: item.itemSize,
              brand: item.brand,
              totalQuantity: 0,
              apartments: []
            });
          }
          const entry = inventoryMap.get(key);
          entry.totalQuantity += item.quantity || 0;
          entry.apartments.push({
            apartmentId: apt.id,
            apartmentName: apt.name,
            quantity: item.quantity || 0
          });
        });
      }
    });
    return Array.from(inventoryMap.values());
  }, [apartments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Raktárak</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Központi készletkezelés: Lakások, Mosoda, Dolgozók
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Raktár fülök">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* Lakások készlete */}
        {activeTab === 'apartments' && (
          <div className="space-y-4">
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Lakások készlete - Összesített nézet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Összes lakás készletének áttekintése
                </p>
              </div>

              {apartmentsInventory.length === 0 ? (
                <EmptyState
                  title="Nincs készlet"
                  description="Még nincs rögzített készlet a lakásokban."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Típus</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Méret</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Márka</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Összes mennyiség</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Lakások</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apartmentsInventory.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">{item.itemType || '-'}</td>
                          <td className="py-3 px-4">{item.itemSize || '-'}</td>
                          <td className="py-3 px-4">{item.brand || '-'}</td>
                          <td className="py-3 px-4 text-right font-semibold">{item.totalQuantity}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2">
                              {item.apartments.map((apt, aptIdx) => (
                                <span key={aptIdx} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                  {apt.apartmentName}: {apt.quantity}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Lakások részletes nézet */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Lakások részletes készlete
                </h3>
              </div>

              {apartments.length === 0 ? (
                <EmptyState
                  title="Nincsenek lakások"
                  description="Még nincsenek regisztrált lakások."
                />
              ) : (
                <div className="space-y-4">
                  {apartments.map((apt) => (
                    <div key={apt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{apt.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{apt.address}</p>
                        </div>
                        {canEdit('warehouse') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const aptInventory = Array.isArray(apt.inventory) ? apt.inventory : [];
                              setEditingInventory({ 
                                type: 'apartment', 
                                apartmentId: apt.id, 
                                apartmentName: apt.name, 
                                items: aptInventory 
                              });
                              setInventoryItems(aptInventory);
                              setShowInventoryModal(true);
                            }}
                          >
                            <Edit2 /> Szerkesztés
                          </Button>
                        )}
                      </div>

                      {Array.isArray(apt.inventory) && apt.inventory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {apt.inventory.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              <div className="font-medium text-sm">{item.itemType || 'Névtelen'}</div>
                              {item.itemSize && <div className="text-xs text-gray-600 dark:text-gray-400">Méret: {item.itemSize}</div>}
                              <div className="text-sm font-semibold mt-1">Mennyiség: {item.quantity || 0}</div>
                              {item.brand && <div className="text-xs text-gray-500 dark:text-gray-500">Márka: {item.brand}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nincs rögzített készlet</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Mosoda */}
        {activeTab === 'laundry' && (
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mosoda rendelések</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mosoda rendelések és készlet kezelése
              </p>
            </div>

            {isLoadingLaundry ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <SkeletonListItem key={i} />)}
              </div>
            ) : laundryOrders.length === 0 ? (
              <EmptyState
                title="Nincsenek mosoda rendelések"
                description="Még nincsenek rögzített mosoda rendelések."
              />
            ) : (
              <div className="space-y-3">
                {laundryOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {order.apartmentName || `Lakás #${order.apartmentId}`}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Dátum: {order.orderDate || '-'}
                        </div>
                        {order.bagCount && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Zsákok: {order.bagCount}
                          </div>
                        )}
                        {order.weightKg && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Súly: {order.weightKg} kg
                          </div>
                        )}
                        {order.cost > 0 && (
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                            Költség: {order.cost.toLocaleString('hu-HU')} Ft
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {order.status === 'completed' ? 'Befejezve' :
                           order.status === 'pending' ? 'Folyamatban' : order.status || 'Ismeretlen'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Dolgozói készlet */}
        {activeTab === 'workers' && (
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Dolgozói készlet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dolgozók által kezelt készlet
              </p>
            </div>

            {workers.length === 0 ? (
              <EmptyState
                title="Nincsenek dolgozók"
                description="Még nincsenek regisztrált dolgozók."
              />
            ) : (
              <div className="space-y-4">
                {workers.map((worker) => (
                  <div key={worker.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{worker.name}</h4>
                        {worker.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{worker.phone}</p>
                        )}
                        {worker.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{worker.email}</p>
                        )}
                      </div>
                      {canEdit('warehouse') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingInventory({ 
                              type: 'worker', 
                              workerId: worker.id, 
                              workerName: worker.name, 
                              items: [] 
                            });
                            setInventoryItems([]);
                            setShowInventoryModal(true);
                          }}
                        >
                          <Edit2 /> Készlet kezelés
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Kattints a "Készlet kezelés" gombra a készlet szerkesztéséhez
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Készlet szerkeszt modal */}
      {showInventoryModal && editingInventory && (
        <Modal
          isOpen={showInventoryModal}
          onClose={() => {
            setShowInventoryModal(false);
            setEditingInventory(null);
            setInventoryItems([]);
          }}
          title={editingInventory.type === 'apartment' 
            ? `Készlet szerkesztése - ${editingInventory.apartmentName}`
            : `Készlet kezelés - ${editingInventory.workerName}`
          }
          size="lg"
        >
          <div className="space-y-4">
            <TextileInventoryEditor
              inventory={inventoryItems}
              onChange={setInventoryItems}
            />
            <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveInventory}
                loading={isSavingInventory}
                disabled={isSavingInventory}
              >
                Mentés
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingInventory(null);
                  setInventoryItems([]);
                }}
              >
                Mégse
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WarehousePage;
