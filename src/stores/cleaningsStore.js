import { create } from 'zustand';
import api, {
  cleaningsList,
  cleaningsCreate,
  cleaningsUpdate,
  cleaningsDelete,
  cleaningsSummary,
  cleaningFromApi,
  cleaningToApi
} from '../services/api';
import useToastStore from './toastStore';
import { filterBy, sumBy } from '../utils/arrayUtils';
import { contains } from '../utils/stringUtils';

const useCleaningsStore = create((set, get) => ({
  // State
  cleanings: [],
  isLoading: false,
  error: null,
  filter: {
    apartmentId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: '',
    assigneeUserId: ''
  },
  searchQuery: '', // Szöveges keresés
  showAddCleaning: false,
  showEditCleaning: false,
  selectedCleaning: null,
  summary: null,

  // Actions
  setCleanings: (cleanings) => set({ cleanings }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setShowAddCleaning: (show) => set({ showAddCleaning: show }),

  setShowEditCleaning: (show) => set({ showEditCleaning: show }),

  setSelectedCleaning: (cleaning) => set({ selectedCleaning: cleaning }),

  fetchFromApi: async (params = {}) => {
    if (!api.isConfigured()) return;
    set({ isLoading: true, error: null });
    try {
      const filter = get().filter;
      const queryParams = {
        year: params.year ?? filter.year,
        month: params.month ?? filter.month,
        ...(filter.apartmentId ? { apartmentId: filter.apartmentId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.assigneeUserId ? { assigneeUserId: filter.assigneeUserId } : {}),
        ...params
      };
      const raw = await cleaningsList(queryParams);
      const list = Array.isArray(raw) ? raw.map(cleaningFromApi) : [];
      set({ cleanings: list });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a takarítások betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSummary: async (params = {}) => {
    if (!api.isConfigured()) return;
    try {
      const filter = get().filter;
      const queryParams = {
        year: params.year ?? filter.year,
        month: params.month ?? filter.month,
        ...(filter.apartmentId ? { apartmentId: filter.apartmentId } : {}),
        ...params
      };
      const res = await cleaningsSummary(queryParams);
      set({ summary: res?.summary ?? res });
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Error fetching cleaning summary:', e);
      }
    }
  },

  // CRUD operations
  addCleaning: async (cleaning) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = cleaningToApi(cleaning);
        await cleaningsCreate(body);
        await get().fetchFromApi();
        await get().fetchSummary();
        useToastStore.getState().success('Takarítás sikeresen létrehozva');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a takarítás létrehozásakor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    const newCleaning = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...cleaning
    };
    set((state) => ({
      cleanings: [...state.cleanings, newCleaning]
    }));
    useToastStore.getState().success('Takarítás sikeresen létrehozva');
    return newCleaning;
  },

  updateCleaning: async (id, updates) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const existing = get().cleanings.find((c) => c.id === id);
        const payload = { ...existing, ...updates };
        const body = cleaningToApi(payload);
        await cleaningsUpdate(id, body);
        await get().fetchFromApi();
        await get().fetchSummary();
        useToastStore.getState().success('Takarítás sikeresen frissítve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a takarítás mentésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      cleanings: state.cleanings.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    }));
    useToastStore.getState().success('Takarítás sikeresen frissítve');
  },

  deleteCleaning: async (id) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        await cleaningsDelete(id);
        await get().fetchFromApi();
        await get().fetchSummary();
        useToastStore.getState().success('Takarítás sikeresen törölve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a takarítás törlésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      cleanings: state.cleanings.filter((c) => c.id !== id)
    }));
    useToastStore.getState().success('Takarítás sikeresen törölve');
  },

  // Filtered cleanings
  getFilteredCleanings: () => {
    const { cleanings, filter, searchQuery } = get();
    let filtered = cleanings;

    // Apartment filter
    if (filter.apartmentId) {
      filtered = filtered.filter(
        (c) => c.apartmentId === filter.apartmentId || c.apartmentId === parseInt(filter.apartmentId)
      );
    }

    // Status filter
    if (filter.status) {
      filtered = filtered.filter((c) => c.status === filter.status);
    }

    // Assignee filter
    if (filter.assigneeUserId) {
      filtered = filtered.filter((c) => c.assigneeUserId === filter.assigneeUserId);
    }

    // Date filter (year/month)
    if (filter.year && filter.month) {
      filtered = filtered.filter((c) => {
        const date = new Date(c.date);
        return date.getFullYear() === filter.year && date.getMonth() + 1 === filter.month;
      });
    }

    // Szöveges keresés (lakás név, takarító név, megjegyzés alapján)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter((cleaning) => {
        return contains(cleaning.apartmentName || '', query) ||
               contains(cleaning.assigneeName || '', query) ||
               contains(cleaning.notes || '', query);
      });
    }

    return filtered;
  },

  // Get cleaning by ID
  getCleaningById: (id) => {
    return get().cleanings.find((c) => c.id === id);
  },

  // Statistics
  getStats: () => {
    const cleanings = get().cleanings;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const thisMonthCleanings = cleanings.filter((c) => {
      const date = new Date(c.date);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    });

    const byStatus = {
      planned: filterBy(cleanings, { status: 'planned' }),
      done: filterBy(cleanings, { status: 'done' }),
      paid: filterBy(cleanings, { status: 'paid' })
    };

    return {
      total: cleanings.length,
      thisMonth: thisMonthCleanings.length,
      byStatus: {
        planned: byStatus.planned.length,
        done: byStatus.done.length,
        paid: byStatus.paid.length
      },
      totalAmount: sumBy(cleanings, 'amount'),
      thisMonthAmount: sumBy(thisMonthCleanings, 'amount'),
      paidAmount: sumBy(byStatus.paid, 'amount')
    };
  }
}));

export default useCleaningsStore;

