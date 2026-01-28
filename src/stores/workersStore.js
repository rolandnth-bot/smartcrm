import { create } from 'zustand';
import api, { workersList, workerFromApi } from '../services/api';
import useToastStore from './toastStore';

const useWorkersStore = create((set, get) => ({
  // State
  workers: [],
  isLoading: false,
  error: null,

  // Actions
  setWorkers: (workers) => set({ workers }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  fetchFromApi: async () => {
    if (!api.isConfigured()) {
      // Mock data for development
      set({ 
        workers: [
          { id: 'worker-001', name: 'Tóth Anna', phone: '+36-30-555-6666', email: 'toth.anna@example.hu', hourlyRate: 2500, textileRate: 600, status: 'active' },
          { id: 'worker-002', name: 'Horváth Zsuzsa', phone: '+36-30-666-7777', email: 'horvath.zsuzsa@example.hu', hourlyRate: 2800, textileRate: 650, status: 'active' },
          { id: 'worker-003', name: 'Kiss János', phone: '+36-30-777-8888', email: 'kiss.janos@example.hu', hourlyRate: 3000, textileRate: 700, status: 'active' }
        ],
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await workersList();
      const workersList = Array.isArray(response) ? response : (response?.workers || []);
      const workers = workersList.map(workerFromApi).filter(w => w && w.status === 'active');
      set({ workers });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a dolgozók betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  getStats: () => {
    const { workers } = get();
    return {
      total: workers.length,
      active: workers.filter(w => w.status === 'active').length,
      inactive: workers.filter(w => w.status === 'inactive').length
    };
  }
}));

export default useWorkersStore;
