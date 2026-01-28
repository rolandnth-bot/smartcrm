import { create } from 'zustand';
import useToastStore from './toastStore';

/**
 * Naphoz kötött manuális elemek: feladat, megjegyzés.
 * A naptárra kattintva lehet hozzáadni/szerkeszteni.
 */
const useSalesCalendarStore = create((set, get) => ({
  dayItems: [], // { id, date (ISO), type: 'feladat'|'megjegyzes', title?, text?, createdAt }

  addDayItem: (date, payload) => {
    const { type, title, text } = payload;
    const id = `day-${date}-${Date.now()}`;
    const item = {
      id,
      date,
      type,
      title: type === 'feladat' ? (title || '') : undefined,
      text: type === 'megjegyzes' ? (text || '') : undefined,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ dayItems: [...state.dayItems, item] }));
    get().persistToStorage();
    useToastStore.getState().success(type === 'feladat' ? 'Feladat hozzáadva' : 'Megjegyzés hozzáadva');
    return item;
  },

  removeDayItem: (id) => {
    set((state) => ({ dayItems: state.dayItems.filter((i) => i.id !== id) }));
    get().persistToStorage();
    useToastStore.getState().success('Törölve');
  },

  getDayItems: (date) => {
    return get().dayItems.filter((i) => i.date === date);
  },

  // Persistence: localStorage (optional, wipe on logout)
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem('smartcrm_sales_calendar_day_items');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) set({ dayItems: arr });
      }
    } catch (_) {}
  },

  persistToStorage: () => {
    try {
      localStorage.setItem('smartcrm_sales_calendar_day_items', JSON.stringify(get().dayItems));
    } catch (_) {}
  }
}));

export default useSalesCalendarStore;
