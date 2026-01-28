/**
 * Karbantartás (maintenance) store
 * Karbantartási bejelentések: dátum, lakás, összeg, leírás, megjegyzés, prioritás.
 * Lokális state + localStorage persist (API nincs).
 */

import { create } from 'zustand';
import useToastStore from './toastStore';
import { sumBy } from '../utils/arrayUtils';
import { contains } from '../utils/stringUtils';

export const MAINTENANCE_PRIORITIES = [
  { key: 'surgos', label: 'Sürgős', color: 'bg-red-500', dot: 'bg-red-500' },
  { key: 'normal', label: 'Normál', color: 'bg-amber-500', dot: 'bg-amber-500' },
  { key: 'alacsony', label: 'Alacsony', color: 'bg-gray-500', dot: 'bg-gray-500' }
];

const STORAGE_KEY = 'smartcrm_maintenance';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map((m) => ({
      ...m,
      priority: m.priority && ['surgos', 'normal', 'alacsony'].includes(m.priority) ? m.priority : 'normal'
    }));
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('maintenanceStore: localStorage save failed', e);
    }
  }
}

const useMaintenanceStore = create((set, get) => ({
  maintenanceExpenses: loadFromStorage(),

  filter: {
    apartmentId: '',
    year: null,
    month: null,
    priority: ''
  },
  searchQuery: '',

  setFilter: (filter) => set((state) => ({
    filter: typeof filter === 'function' ? filter(state.filter) : { ...state.filter, ...filter }
  })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addMaintenance: (entry) => {
    const items = get().maintenanceExpenses;
    const apartment = entry.apartmentName || '';
    const newItem = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: entry.date,
      apartmentId: entry.apartmentId || null,
      apartmentName: apartment,
      amount: Number(entry.amount) || 0,
      description: entry.description || '',
      notes: entry.notes || '',
      priority: entry.priority && ['surgos', 'normal', 'alacsony'].includes(entry.priority) ? entry.priority : 'normal',
      createdAt: new Date().toISOString()
    };
    const next = [newItem, ...items];
    set({ maintenanceExpenses: next });
    saveToStorage(next);
    useToastStore.getState().success('Karbantartás bejelentés sikeresen rögzítve');
    return newItem;
  },

  updateMaintenance: (id, updates) => {
    const items = get().maintenanceExpenses;
    const next = items.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    set({ maintenanceExpenses: next });
    saveToStorage(next);
    useToastStore.getState().success('Karbantartás frissítve');
  },

  removeMaintenance: (id) => {
    const items = get().maintenanceExpenses.filter((m) => m.id !== id);
    set({ maintenanceExpenses: items });
    saveToStorage(items);
    useToastStore.getState().success('Karbantartás bejelentés törölve');
  },

  getFiltered: () => {
    const { maintenanceExpenses, filter, searchQuery } = get();
    let list = [...maintenanceExpenses];

    if (filter.apartmentId) {
      list = list.filter(
        (m) => String(m.apartmentId) === String(filter.apartmentId)
      );
    }
    if (filter.year) {
      list = list.filter((m) => {
        const y = new Date(m.date).getFullYear();
        return y === filter.year;
      });
    }
    if (filter.month) {
      list = list.filter((m) => {
        const mo = new Date(m.date).getMonth() + 1;
        return mo === filter.month;
      });
    }
    if (filter.priority) {
      list = list.filter((m) => (m.priority || 'normal') === filter.priority);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter(
        (m) =>
          contains(m.description || '', q) ||
          contains(m.notes || '', q) ||
          contains(m.apartmentName || '', q)
      );
    }

    const order = { surgos: 0, normal: 1, alacsony: 2 };
    return list.sort((a, b) => {
      const pa = order[a.priority || 'normal'] ?? 1;
      const pb = order[b.priority || 'normal'] ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(b.date) - new Date(a.date);
    });
  },

  getStats: (year, month) => {
    const items = get().maintenanceExpenses;
    let filtered = items;
    if (year) {
      filtered = filtered.filter((m) => new Date(m.date).getFullYear() === year);
    }
    if (month) {
      filtered = filtered.filter((m) => new Date(m.date).getMonth() + 1 === month);
    }
    return {
      count: filtered.length,
      totalAmount: sumBy(filtered, 'amount')
    };
  }
}));

export default useMaintenanceStore;
