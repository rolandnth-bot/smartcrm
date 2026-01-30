import { create } from 'zustand';
import api, {
  campaignsList,
  campaignsCreate,
  campaignsUpdate,
  campaignsDelete,
  campaignFromApi,
  campaignToApi
} from '../services/api';
import useToastStore from './toastStore';

export const campaignChannels = [
  { key: 'website', label: 'Weboldal' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'email', label: 'Email' },
  { key: 'other', label: 'Egyéb' }
];

export const campaignStatuses = [
  { key: 'draft', label: 'Piszkozat', color: 'gray' },
  { key: 'active', label: 'Aktív', color: 'green' },
  { key: 'paused', label: 'Szüneteltetve', color: 'yellow' },
  { key: 'completed', label: 'Lezárva', color: 'blue' }
];

const useMarketingStore = create((set, get) => ({
  campaigns: [],
  contentItems: [], // Tartalom naptár elemek
  isLoading: false,
  error: null,
  showCampaignModal: false,
  editingCampaign: null,
  showContentModal: false,
  editingContent: null,

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setShowCampaignModal: (show) => set({ showCampaignModal: show }),
  setEditingCampaign: (campaign) => set({ editingCampaign: campaign }),
  setShowContentModal: (show) => set({ showContentModal: show }),
  setEditingContent: (content) => set({ editingContent: content }),

  fetchFromApi: async () => {
    if (!api.isConfigured()) return;
    set({ isLoading: true, error: null });
    try {
      const raw = await campaignsList({});
      const list = Array.isArray(raw) ? raw.map(campaignFromApi) : [];
      set({ campaigns: list });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a kampányok betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  addCampaign: async (campaign) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = campaignToApi({ ...campaign, status: 'draft', budget: 0 });
        await campaignsCreate(body);
        await get().fetchFromApi();
        useToastStore.getState().success('Kampány sikeresen létrehozva');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a kampány létrehozásakor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    const newCampaign = {
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      budget: 0,
      ...campaign
    };
    set((state) => ({
      campaigns: [...state.campaigns, newCampaign]
    }));
    useToastStore.getState().success('Kampány sikeresen létrehozva');
    return newCampaign;
  },

  updateCampaign: async (id, updates) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = campaignToApi(updates);
        await campaignsUpdate(id, body);
        await get().fetchFromApi();
        useToastStore.getState().success('Kampány sikeresen frissítve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a kampány mentésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c
      )
    }));
    useToastStore.getState().success('Kampány sikeresen frissítve');
  },

  deleteCampaign: async (id) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        await campaignsDelete(id);
        await get().fetchFromApi();
        useToastStore.getState().success('Kampány sikeresen törölve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a kampány törlésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id)
    }));
    useToastStore.getState().success('Kampány sikeresen törölve');
  },

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  getStats: () => {
    const campaigns = get().campaigns;
    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === 'active').length,
      draft: campaigns.filter((c) => c.status === 'draft').length,
      completed: campaigns.filter((c) => c.status === 'completed').length,
      totalBudget: campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0)
    };
  },

  // Tartalom naptár mveletek
  addContentItem: async (content) => {
    const newContent = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...content
    };
    set((state) => ({
      contentItems: [...state.contentItems, newContent]
    }));
    useToastStore.getState().success('Tartalom sikeresen hozzáadva');
    return newContent;
  },

  updateContentItem: async (id, updates) => {
    set((state) => ({
      contentItems: state.contentItems.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    }));
    useToastStore.getState().success('Tartalom sikeresen frissítve');
  },

  deleteContentItem: async (id) => {
    set((state) => ({
      contentItems: state.contentItems.filter((c) => c.id !== id)
    }));
    useToastStore.getState().success('Tartalom sikeresen törölve');
  },

  getContentByDate: (date) => {
    const contentItems = get().contentItems;
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return contentItems.filter((c) => c.scheduledDate === dateStr);
  }
}));

export default useMarketingStore;

