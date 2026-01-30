import { create } from 'zustand';
import useToastStore from './toastStore';
import { filterBy, sortBy, sumBy } from '../utils/arrayUtils';
import { contains } from '../utils/stringUtils';

const STORAGE_KEY = 'smartcrm_settlements';

// localStorage helpers
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Failed to load settlements from localStorage:', e);
    }
    return [];
  }
}

function saveToStorage(settlements) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Failed to save settlements to localStorage:', e);
    }
  }
}

const useSettlementsStore = create((set, get) => ({
  // State
  settlements: loadFromStorage(),
  isLoading: false,
  error: null,
  filter: {
    partnerId: '',
    apartmentId: '',
    period: '',
    status: '',
    year: null,
    month: null
  },
  searchQuery: '',
  showAddSettlement: false,
  showEditSettlement: false,
  selectedSettlement: null,

  // Actions: State setters
  setSettlements: (settlements) => set({ settlements }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilter: (filterUpdate) => {
    set((state) => ({
      filter: typeof filterUpdate === 'function'
        ? filterUpdate(state.filter)
        : { ...state.filter, ...filterUpdate }
    }));
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowAddSettlement: (show) => set({ showAddSettlement: show }),
  setShowEditSettlement: (show) => set({ showEditSettlement: show }),
  setSelectedSettlement: (settlement) => set({ selectedSettlement: settlement }),

  // CRUD: Create
  addSettlement: (settlement) => {
    const newSettlement = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...settlement,
      status: settlement.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set((state) => {
      const next = [newSettlement, ...state.settlements];
      saveToStorage(next);
      return { settlements: next };
    });

    useToastStore.getState().success('Elszámolás sikeresen hozzáadva');
    return newSettlement;
  },

  // CRUD: Update
  updateSettlement: (id, updates) => {
    set((state) => {
      const next = state.settlements.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      );
      saveToStorage(next);
      return { settlements: next };
    });

    useToastStore.getState().success('Elszámolás frissítve');
  },

  // CRUD: Delete
  removeSettlement: (id) => {
    set((state) => {
      const next = state.settlements.filter((s) => s.id !== id);
      saveToStorage(next);
      return { settlements: next };
    });

    useToastStore.getState().success('Elszámolás törölve');
  },

  // Status changes
  confirmSettlement: (id) => {
    get().updateSettlement(id, { status: 'confirmed' });
    useToastStore.getState().success('Elszámolás visszaigazolva');
  },

  markAsPaid: (id) => {
    get().updateSettlement(id, { status: 'paid' });
    useToastStore.getState().success('Elszámolás kifilezettre állítva');
  },

  // Computed: Filtered list
  getFiltered: () => {
    const { settlements, filter, searchQuery } = get();
    let filtered = [...settlements];

    // Apply filters
    if (filter.partnerId) {
      filtered = filtered.filter((s) => s.partnerId === filter.partnerId);
    }

    if (filter.apartmentId) {
      filtered = filtered.filter((s) => s.apartmentId === filter.apartmentId);
    }

    if (filter.period) {
      filtered = filtered.filter((s) => s.period === filter.period);
    }

    if (filter.status) {
      filtered = filtered.filter((s) => s.status === filter.status);
    }

    if (filter.year) {
      filtered = filtered.filter((s) => {
        const [year] = s.period.split('-');
        return parseInt(year) === filter.year;
      });
    }

    if (filter.month) {
      filtered = filtered.filter((s) => {
        const [, month] = s.period.split('-');
        return parseInt(month) === filter.month;
      });
    }

    // Apply search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter((s) =>
        contains(s.partnerName || '', query) ||
        contains(s.apartmentName || '', query) ||
        contains(s.period || '', query) ||
        contains(s.sourceFileName || '', query)
      );
    }

    // Sort by period descending (newest first)
    return sortBy(filtered, (s) => s.period, 'desc');
  },

  // Computed: Get single settlement by ID
  getSettlementById: (id) => {
    return get().settlements.find((s) => s.id === id);
  },

  // Computed: Statistics
  getStats: (partnerId = null, year = null, month = null) => {
    let filtered = get().settlements;

    if (partnerId) {
      filtered = filtered.filter((s) => s.partnerId === partnerId);
    }

    if (year) {
      filtered = filtered.filter((s) => {
        const [y] = s.period.split('-');
        return parseInt(y) === year;
      });
    }

    if (month) {
      filtered = filtered.filter((s) => {
        const [, m] = s.period.split('-');
        return parseInt(m) === month;
      });
    }

    return {
      count: filtered.length,
      totalPayout: sumBy(filtered, (s) => s.summary?.totalPayout || 0),
      totalManagement: sumBy(filtered, (s) => s.summary?.totalManagementCommission || 0),
      totalCoHostPayout: sumBy(filtered, (s) => s.summary?.coHostPayout || 0),
      draftCount: filtered.filter((s) => s.status === 'draft').length,
      confirmedCount: filtered.filter((s) => s.status === 'confirmed').length,
      paidCount: filtered.filter((s) => s.status === 'paid').length
    };
  },

  // Computed: Get settlements by partner
  getByPartner: (partnerId) => {
    return get().settlements.filter((s) => s.partnerId === partnerId);
  },

  // Computed: Get settlements by apartment
  getByApartment: (apartmentId) => {
    return get().settlements.filter((s) => s.apartmentId === apartmentId);
  },

  // Computed: Get settlements by period
  getByPeriod: (period) => {
    return get().settlements.filter((s) => s.period === period);
  },

  // Future API migration skeleton
  fetchFromApi: async () => {
    // if (!api.isConfigured()) {
    //   const stored = loadFromStorage();
    //   set({ settlements: stored, isLoading: false });
    //   return;
    // }

    // set({ isLoading: true, error: null });
    // try {
    //   const data = await api.get('/settlements');
    //   const settlements = data.map(settlementFromApi);
    //   set({ settlements, isLoading: false });
    //   saveToStorage(settlements);
    // } catch (error) {
    //   const errorMsg = error?.message || 'Hiba az elszámolások betöltésekor';
    //   set({ error: errorMsg, isLoading: false });
    //   useToastStore.getState().error(errorMsg);
    // }

    // For now, just load from localStorage
    const stored = loadFromStorage();
    set({ settlements: stored, isLoading: false });
  }
}));

export default useSettlementsStore;
