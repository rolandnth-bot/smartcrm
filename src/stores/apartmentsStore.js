import { create } from 'zustand';
import api, {
  apartmentsList,
  apartmentsCreate,
  apartmentsUpdate,
  apartmentsDelete,
  apartmentFromApi,
  apartmentToApi
} from '../services/api';
import useToastStore from './toastStore';
import { filterBy } from '../utils/arrayUtils';
import { contains } from '../utils/stringUtils';
import {
  loadApartmentsFromStorage,
  saveApartmentsToStorage,
  seedApartmentsFromDefaults
} from '../config/defaultApartments';

const useApartmentsStore = create((set, get) => ({
  // State
  apartments: [],
  isLoading: false,
  error: null,
  filter: 'all', // 'all', 'active', 'inactive', 'pending'
  searchQuery: '', // Szöveges keresés
  selectedApartment: null,
  showAddApartment: false,
  showEditApartment: false,

  // Actions
  setApartments: (apartments) => set({ apartments }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedApartment: (apartment) => set({ selectedApartment: apartment }),

  setShowAddApartment: (show) => set({ showAddApartment: show }),

  setShowEditApartment: (show) => set({ showEditApartment: show }),

  fetchFromApi: async () => {
    if (!api.isConfigured()) {
      const stored = loadApartmentsFromStorage();
      if (stored && stored.length > 0) {
        set({ apartments: stored });
        return;
      }
      const seeded = seedApartmentsFromDefaults();
      set({ apartments: seeded });
      saveApartmentsToStorage(seeded);
      useToastStore.getState().success(`${seeded.length} alapértelmezett lakás betöltve.`);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const raw = await apartmentsList({ status: 'all' });
      const list = Array.isArray(raw) ? raw.map(apartmentFromApi) : [];
      set({ apartments: list });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a lakások betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  // CRUD operations
  addApartment: async (apartment) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = apartmentToApi({ ...apartment, status: 'active' });
        await apartmentsCreate(body);
        await get().fetchFromApi();
        useToastStore.getState().success('Lakás sikeresen létrehozva');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lakás létrehozásakor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    const newApartment = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...apartment
    };
    set((state) => {
      const next = [...state.apartments, newApartment];
      saveApartmentsToStorage(next);
      return { apartments: next };
    });
    useToastStore.getState().success('Lakás sikeresen létrehozva');
    return newApartment;
  },

  updateApartment: async (id, updates) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = apartmentToApi(updates);
        await apartmentsUpdate(id, body);
        await get().fetchFromApi();
        useToastStore.getState().success('Lakás sikeresen frissítve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lakás mentésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => {
      const next = state.apartments.map((apt) =>
        apt.id === id ? { ...apt, ...updates, updatedAt: new Date().toISOString() } : apt
      );
      saveApartmentsToStorage(next);
      return { apartments: next };
    });
    useToastStore.getState().success('Lakás sikeresen frissítve');
  },

  deleteApartment: async (id) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        await apartmentsDelete(id);
        await get().fetchFromApi();
        useToastStore.getState().success('Lakás sikeresen törölve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lakás törlésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => {
      const next = state.apartments.filter((apt) => apt.id !== id);
      saveApartmentsToStorage(next);
      return { apartments: next };
    });
    useToastStore.getState().success('Lakás sikeresen törölve');
  },

  // Filtered apartments
  getFilteredApartments: () => {
    const { apartments, filter, searchQuery } = get();
    let filtered = apartments;
    
    // Státusz szűrés
    if (filter !== 'all') {
      filtered = filterBy(filtered, { status: filter });
    }
    
    // Szöveges keresés (név, cím, város, ügyfél alapján)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter((apt) => {
        return contains(apt.name || '', query) ||
               contains(apt.address || '', query) ||
               contains(apt.city || '', query) ||
               contains(apt.clientName || '', query) ||
               contains(apt.notes || '', query);
      });
    }
    
    return filtered;
  },

  // Get apartment by ID
  getApartmentById: (id) => {
    return get().apartments.find((apt) => apt.id === id);
  },

  // Statistics
  getStats: () => {
    const apartments = get().apartments;
    return {
      total: apartments.length,
      active: filterBy(apartments, { status: 'active' }).length,
      inactive: filterBy(apartments, { status: 'inactive' }).length,
      pending: filterBy(apartments, { status: 'pending' }).length
    };
  }
}));

export default useApartmentsStore;

