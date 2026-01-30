import { create } from 'zustand';
import api, { icalSync, icalStatus } from '../services/api';
import useToastStore from './toastStore';

const useIcalSyncStore = create((set, get) => ({
  // State
  syncStatus: {}, // { [apartmentId]: { status: 'idle' | 'syncing' | 'success' | 'error', progress: 0-100, lastSync: Date, error: string } }
  feedStatus: {}, // { [apartmentId]: { feeds: [{ id, status, lastSync, eventsCount, error }] } }

  // Actions
  setSyncStatus: (apartmentId, status) => {
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        [apartmentId]: {
          ...state.syncStatus[apartmentId],
          ...status,
          lastSync: status.status === 'success' ? new Date() : state.syncStatus[apartmentId]?.lastSync
        }
      }
    }));
  },

  clearSyncStatus: (apartmentId) => {
    set((state) => {
      const newStatus = { ...state.syncStatus };
      delete newStatus[apartmentId];
      return { syncStatus: newStatus };
    });
  },

  setFeedStatus: (apartmentId, feeds) => {
    set((state) => ({
      feedStatus: {
        ...state.feedStatus,
        [apartmentId]: { feeds }
      }
    }));
  },

  // Sync egy lakás iCal feed-jeit
  syncApartment: async (apartmentId, feedId = null) => {
    const currentStatus = get().syncStatus[apartmentId];
    if (currentStatus?.status === 'syncing') {
      useToastStore.getState().warning('Szinkronizálás már folyamatban van');
      return;
    }

    // Optimistic UI update: azonnal frissítjük a státuszt
    const optimisticStatus = {
      status: 'syncing',
      progress: 0,
      startedAt: new Date(),
      feedId: feedId || null
    };

    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        [apartmentId]: optimisticStatus
      }
    }));

    // Progress szimuláció (optimistic UI) - változó deklaráció a try blokk eltt
    let progressInterval = null;
    if (!api.isConfigured()) {
      // Mock mode: progress szimuláció
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              [apartmentId]: {
                ...state.syncStatus[apartmentId],
                progress
              }
            }
          }));
        }
      }, 200);
    }

    try {
      if (api.isConfigured()) {
        // API hívás
        const response = await icalSync(apartmentId, feedId);
        
        // Progress 100% és success státusz
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            [apartmentId]: {
              ...state.syncStatus[apartmentId],
              status: 'success',
              progress: 100,
              lastSync: new Date(),
              result: response,
              completedAt: new Date()
            }
          }
        }));

        const created = response?.created || 0;
        const updated = response?.updated || 0;
        const cancelled = response?.cancelled || 0;
        const errors = response?.errors || [];

        if (errors.length > 0) {
          useToastStore.getState().warning(
            `Szinkronizálás befejezve: ${created} létrehozva, ${updated} frissítve, ${cancelled} törölve. ${errors.length} hiba.`
          );
        } else {
          useToastStore.getState().success(
            `Szinkronizálás sikeres: ${created} létrehozva, ${updated} frissítve, ${cancelled} törölve.`
          );
        }

        // Optimistic UI: frissítjük a foglalásokat (ha van bookings store)
        // Megjegyzés: A bookings store frissítése opcionális, hogy elkerüljük a circular dependency-t
        // A frontend komponensek automatikusan frissülnek, amikor újra rendereldnek

        // Auto-clear success status after 3 seconds
        setTimeout(() => {
          get().clearSyncStatus(apartmentId);
        }, 3000);
      } else {
        // Mock mode: szimulált sync
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        // Progress 100%
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            [apartmentId]: {
              ...state.syncStatus[apartmentId],
              progress: 100
            }
          }
        }));

        await new Promise((resolve) => setTimeout(resolve, 500));
        
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            [apartmentId]: {
              ...state.syncStatus[apartmentId],
              status: 'success',
              lastSync: new Date(),
              result: { created: 0, updated: 0, cancelled: 0, errors: [] },
              completedAt: new Date()
            }
          }
        }));

        useToastStore.getState().success('iCal szinkronizálás sikeres (mock mode)');
        
        setTimeout(() => {
          get().clearSyncStatus(apartmentId);
        }, 3000);
      }
    } catch (e) {
      // Clear progress interval if exists
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      const errorMsg = e?.message || 'Hiba az iCal szinkronizálás során.';
      
      set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          [apartmentId]: {
            ...state.syncStatus[apartmentId],
            status: 'error',
            progress: 0,
            error: errorMsg,
            lastSync: state.syncStatus[apartmentId]?.lastSync,
            completedAt: new Date()
          }
        }
      }));

      useToastStore.getState().error(errorMsg);
      
      setTimeout(() => {
        get().clearSyncStatus(apartmentId);
      }, 5000);
    }
  },

  // Lekérdezi egy lakás iCal feed státuszát
  fetchFeedStatus: async (apartmentId) => {
    if (!api.isConfigured()) return;

    try {
      const response = await icalStatus(apartmentId);
      get().setFeedStatus(apartmentId, response?.feeds || []);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('[IcalSyncStore] Error fetching feed status:', e);
      }
    }
  },

  // Get sync status for apartment
  getSyncStatus: (apartmentId) => {
    return get().syncStatus[apartmentId] || { status: 'idle' };
  },

  // Get feed status for apartment
  getFeedStatus: (apartmentId) => {
    return get().feedStatus[apartmentId] || { feeds: [] };
  }
}));

export default useIcalSyncStore;

