import { create } from 'zustand';
import api, {
  bookingsList,
  bookingsCreate,
  bookingsUpdate,
  bookingsDelete,
  bookingFromApi,
  bookingToApi
} from '../services/api';
import useToastStore from './toastStore';
import { filterBy, sumBy } from '../utils/arrayUtils';
import { contains } from '../utils/stringUtils';
import { todayISO } from '../utils/dateUtils';
import {
  loadBookingsFromStorage,
  saveBookingsToStorage,
  seedDefaultBookings
} from '../config/defaultBookings';

const useBookingsStore = create((set, get) => ({
  // State
  bookings: [],
  isLoading: false,
  error: null,
  filter: 'all', // 'all', 'today', 'week', 'month'
  apartmentFilter: '',
  searchQuery: '', // Szöveges keresés
  showAddBooking: false,
  showEditBooking: false,
  selectedBooking: null,

  // Actions
  setBookings: (bookings) => set({ bookings }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setApartmentFilter: (apartmentId) => set({ apartmentFilter: apartmentId }),

  setShowAddBooking: (show) => set({ showAddBooking: show }),

  setShowEditBooking: (show) => set({ showEditBooking: show }),

  setSelectedBooking: (booking) => set({ selectedBooking: booking }),

  fetchFromApi: async () => {
    if (!api.isConfigured()) {
      const stored = loadBookingsFromStorage();
      if (stored && stored.length > 0) {
        set({ bookings: stored });
        return;
      }
      const seeded = seedDefaultBookings();
      set({ bookings: seeded });
      saveBookingsToStorage(seeded);
      useToastStore.getState().success('3 alapértelmezett teszt foglalás betöltve.');
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const raw = await bookingsList({});
      const list = Array.isArray(raw) ? raw.map(bookingFromApi) : [];
      set({ bookings: list });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a foglalások betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  // CRUD operations
  addBooking: async (booking) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = bookingToApi(booking);
        await bookingsCreate(body);
        await get().fetchFromApi();
        useToastStore.getState().success('Foglalás sikeresen létrehozva');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a foglalás létrehozásakor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    const checkIn = new Date(booking.dateFrom || booking.checkIn);
    const checkOut = new Date(booking.dateTo || booking.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const newBooking = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      nights: nights || 1,
      ...booking,
      dateFrom: booking.dateFrom || booking.checkIn,
      dateTo: booking.dateTo || booking.checkOut
    };
    set((state) => {
      const next = [...state.bookings, newBooking];
      saveBookingsToStorage(next);
      return { bookings: next };
    });
    useToastStore.getState().success('Foglalás sikeresen létrehozva');
    return newBooking;
  },

  updateBooking: async (id, updates) => {
    if (updates.dateFrom || updates.dateTo || updates.checkIn || updates.checkOut) {
      const booking = get().bookings.find((b) => b.id === id);
      const checkIn = new Date(updates.dateFrom || updates.checkIn || booking?.dateFrom || booking?.checkIn);
      const checkOut = new Date(updates.dateTo || updates.checkOut || booking?.dateTo || booking?.checkOut);
      updates.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
    }
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const existing = get().bookings.find((b) => b.id === id);
        const payload = { ...existing, ...updates };
        const body = bookingToApi(payload, true);
        await bookingsUpdate(id, body);
        await get().fetchFromApi();
        useToastStore.getState().success('Foglalás sikeresen frissítve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a foglalás mentésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => {
      const next = state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      );
      saveBookingsToStorage(next);
      return { bookings: next };
    });
    useToastStore.getState().success('Foglalás sikeresen frissítve');
  },

  deleteBooking: async (id) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        await bookingsDelete(id);
        await get().fetchFromApi();
        useToastStore.getState().success('Foglalás sikeresen törölve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a foglalás törlésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => {
      const next = state.bookings.filter((b) => b.id !== id);
      saveBookingsToStorage(next);
      return { bookings: next };
    });
    useToastStore.getState().success('Foglalás sikeresen törölve');
  },

  seedTestBookings: async () => {
    const items = seedDefaultBookings();
    const existing = get().bookings;
    const existingIds = new Set(existing.map((b) => String(b.id)));

    if (!api.isConfigured()) {
      const toAdd = items.filter((b) => !existingIds.has(String(b.id)));
      if (toAdd.length === 0) {
        useToastStore.getState().info('A 3 teszt foglalás már mind megvan.');
        return;
      }
      const next = [...existing, ...toAdd];
      set({ bookings: next });
      saveBookingsToStorage(next);
      useToastStore.getState().success(`${toAdd.length} teszt foglalás hozzáadva.`);
      return;
    }

    if (existing.length > 0) {
      useToastStore.getState().info('Csak üres listánál adható hozzá a 3 teszt foglalás (API mód).');
      return;
    }
    set({ isLoading: true, error: null });
    try {
      for (const b of items) {
        const body = {
          dateFrom: b.dateFrom,
          dateTo: b.dateTo,
          apartmentId: b.apartmentId,
          apartmentName: b.apartmentName,
          guestName: b.guestName,
          platform: b.platform,
          guestCount: b.guestCount || 1,
          payoutFt: b.payoutFt,
          notes: b.notes
        };
        await get().addBooking(body);
      }
      await get().fetchFromApi();
      useToastStore.getState().success('3 teszt foglalás hozzáadva.');
    } catch (e) {
      useToastStore.getState().error(e?.message || 'Hiba a teszt foglalások hozzáadásakor.');
    } finally {
      set({ isLoading: false });
    }
  },

  // Filtered bookings
  getFilteredBookings: () => {
    const { bookings, filter, apartmentFilter, searchQuery } = get();
    let filtered = bookings;

    // Apartment filter
    if (apartmentFilter) {
      const aptId = String(apartmentFilter);
      filtered = filtered.filter(
        (b) =>
          String(b.apartmentId) === aptId || b.apartmentId === apartmentFilter || b.apartmentId === parseInt(apartmentFilter, 10)
      );
    }

    // Date filter
    if (filter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);

      filtered = filtered.filter((booking) => {
        const checkIn = new Date(booking.dateFrom || booking.checkIn);
        const checkOut = new Date(booking.dateTo || booking.checkOut);

        if (filter === 'today') {
          return checkIn <= today && checkOut >= today;
        }
        if (filter === 'week') {
          return checkIn <= weekFromNow && checkOut >= today;
        }
        if (filter === 'month') {
          return checkIn <= monthFromNow && checkOut >= today;
        }
        return true;
      });
    }

    // Szöveges keresés (vendég név, lakás név, platform, megjegyzés alapján)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim();
      filtered = filtered.filter((booking) => {
        return contains(booking.guestName || '', query) ||
               contains(booking.apartmentName || '', query) ||
               contains(booking.platform || '', query) ||
               contains(booking.notes || '', query);
      });
    }

    return filtered;
  },

  // Get booking by ID
  getBookingById: (id) => {
    return get().bookings.find((b) => b.id === id);
  },

  // Ma érkező foglalások (check-in ma)
  getTodayBookings: () => {
    const bookings = get().bookings;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter((b) => {
      const checkIn = new Date(b.dateFrom || b.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    });
  },

  // Statistics
  getStats: () => {
    const bookings = get().bookings;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const todayBookings = bookings.filter((b) => {
      const checkIn = new Date(b.dateFrom || b.checkIn);
      return checkIn.toDateString() === today.toDateString();
    });

    const thisMonthBookings = bookings.filter((b) => {
      const checkIn = new Date(b.dateFrom || b.checkIn);
      return checkIn >= thisMonth && checkIn < nextMonth;
    });

    return {
      total: bookings.length,
      today: todayBookings.length,
      thisMonth: thisMonthBookings.length,
      totalRevenue: sumBy(bookings, (b) => b.payoutFt || b.netRevenue || 0),
      thisMonthRevenue: sumBy(thisMonthBookings, (b) => b.payoutFt || b.netRevenue || 0)
    };
  },

  // Preview import functions (validálás előnézet)
  previewBookingsFromJSON: (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const bookingsArray = Array.isArray(data) ? data : [];
      
      const valid = [];
      const invalid = [];
      
      bookingsArray.forEach((item, index) => {
        const errors = [];
        
        // Kötelező mezők ellenőrzése
        if (!item.apartmentId && !item.apartment_id) {
          errors.push('Lakás ID hiányzik');
        }
        if (!item.guestName && !item.guest_name) {
          errors.push('Vendég név hiányzik');
        }
        
        // Dátum validálás
        const dateFrom = item.dateFrom || item.checkIn || item.check_in;
        const dateTo = item.dateTo || item.checkOut || item.check_out;
        if (!dateFrom) {
          errors.push('Érkezés dátum hiányzik');
        } else {
          const checkIn = new Date(dateFrom);
          if (isNaN(checkIn.getTime())) {
            errors.push('Érvénytelen érkezés dátum');
          }
        }
        if (!dateTo) {
          errors.push('Távozás dátum hiányzik');
        } else {
          const checkOut = new Date(dateTo);
          if (isNaN(checkOut.getTime())) {
            errors.push('Érvénytelen távozás dátum');
          }
        }
        
        // Dátum tartomány validálás
        if (dateFrom && dateTo) {
          const checkIn = new Date(dateFrom);
          const checkOut = new Date(dateTo);
          if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut <= checkIn) {
            errors.push('Távozás dátum nem lehet korábbi vagy egyenlő az érkezés dátumával');
          }
        }
        
        // Email validálás (ha van)
        if (item.guestEmail || item.guest_email) {
          const email = item.guestEmail || item.guest_email;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push('Érvénytelen email cím');
          }
        }
        
        const booking = {
          rowIndex: index + 1,
          apartmentId: item.apartmentId || item.apartment_id || '',
          apartmentName: item.apartmentName || item.apartment_name || '',
          guestName: item.guestName || item.guest_name || '',
          guestEmail: item.guestEmail || item.guest_email || '',
          dateFrom: dateFrom || '',
          dateTo: dateTo || '',
          platform: item.platform || 'airbnb',
          guestCount: Number(item.guestCount || item.guest_count || 1),
          payoutFt: Number(item.payoutFt || item.netRevenue || item.net_revenue || 0),
          notes: item.notes || ''
        };
        
        if (errors.length > 0) {
          invalid.push({ ...booking, errors });
        } else {
          valid.push(booking);
        }
      });
      
      return { valid, invalid };
    } catch (error) {
      return { valid: [], invalid: [{ rowIndex: 0, errors: [error.message] }] };
    }
  },

  previewBookingsFromCSV: (csvText) => {
    try {
      const lines = csvText.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        return { valid: [], invalid: [{ rowIndex: 0, errors: ['CSV fájl üres vagy csak fejlécet tartalmaz'] }] };
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const valid = [];
      const invalid = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const errors = [];
        const booking = {
          rowIndex: i,
          apartmentId: '',
          apartmentName: '',
          guestName: '',
          guestEmail: '',
          dateFrom: '',
          dateTo: '',
          platform: 'airbnb',
          guestCount: 1,
          payoutFt: 0,
          notes: ''
        };

        headers.forEach((header, index) => {
          if (values[index]) {
            switch (header) {
              case 'apartment_id':
              case 'apartmentid':
                booking.apartmentId = values[index];
                break;
              case 'apartment_name':
              case 'apartmentname':
                booking.apartmentName = values[index];
                break;
              case 'guest_name':
              case 'guestname':
                booking.guestName = values[index];
                break;
              case 'guest_email':
              case 'guestemail':
                booking.guestEmail = values[index];
                break;
              case 'check_in':
              case 'checkin':
              case 'date_from':
              case 'datefrom':
                booking.dateFrom = values[index];
                break;
              case 'check_out':
              case 'checkout':
              case 'date_to':
              case 'dateto':
                booking.dateTo = values[index];
                break;
              case 'platform':
                booking.platform = values[index];
                break;
              case 'guest_count':
              case 'guestcount':
                booking.guestCount = Number(values[index]) || 1;
                break;
              case 'payout':
              case 'net_revenue':
              case 'netrevenue':
              case 'payout_ft':
                booking.payoutFt = Number(values[index]) || 0;
                break;
              case 'notes':
                booking.notes = values[index];
                break;
            }
          }
        });

        // Validálás
        if (!booking.apartmentId) {
          errors.push('Lakás ID hiányzik');
        }
        if (!booking.guestName) {
          errors.push('Vendég név hiányzik');
        }
        if (!booking.dateFrom) {
          errors.push('Érkezés dátum hiányzik');
        } else {
          const checkIn = new Date(booking.dateFrom);
          if (isNaN(checkIn.getTime())) {
            errors.push('Érvénytelen érkezés dátum');
          }
        }
        if (!booking.dateTo) {
          errors.push('Távozás dátum hiányzik');
        } else {
          const checkOut = new Date(booking.dateTo);
          if (isNaN(checkOut.getTime())) {
            errors.push('Érvénytelen távozás dátum');
          }
        }
        if (booking.dateFrom && booking.dateTo) {
          const checkIn = new Date(booking.dateFrom);
          const checkOut = new Date(booking.dateTo);
          if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut <= checkIn) {
            errors.push('Távozás dátum nem lehet korábbi vagy egyenlő az érkezés dátumával');
          }
        }
        if (booking.guestEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(booking.guestEmail)) {
            errors.push('Érvénytelen email cím');
          }
        }

        if (errors.length > 0) {
          invalid.push({ ...booking, errors });
        } else {
          valid.push(booking);
        }
      }

      return { valid, invalid };
    } catch (error) {
      return { valid: [], invalid: [{ rowIndex: 0, errors: [error.message] }] };
    }
  },

  // Import functions
  importBookingsFromJSON: (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const bookingsArray = Array.isArray(data) ? data : [];
      
      const importedBookings = bookingsArray.map((item) => {
        const checkIn = new Date(item.dateFrom || item.checkIn || item.check_in);
        const checkOut = new Date(item.dateTo || item.checkOut || item.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        
        return {
          id: Date.now() + Math.random(),
          apartmentId: item.apartmentId || item.apartment_id || '',
          apartmentName: item.apartmentName || item.apartment_name || '',
          platform: item.platform || 'airbnb',
          guestName: item.guestName || item.guest_name || '',
          guestEmail: item.guestEmail || item.guest_email || '',
          guestCount: Number(item.guestCount || item.guest_count || 1),
          dateFrom: item.dateFrom || item.checkIn || item.check_in || todayISO(),
          dateTo: item.dateTo || item.checkOut || item.check_out || todayISO(),
          checkIn: item.checkIn || item.check_in || item.dateFrom || todayISO(),
          checkOut: item.checkOut || item.check_out || item.dateTo || todayISO(),
          nights: nights || 1,
          payoutFt: Number(item.payoutFt || item.netRevenue || item.net_revenue || 0),
          netRevenue: Number(item.netRevenue || item.net_revenue || item.payoutFt || 0),
          status: item.status || 'confirmed',
          notes: item.notes || '',
          createdAt: item.createdAt || item.created_at || todayISO()
        };
      });

      set((state) => ({
        bookings: [...state.bookings, ...importedBookings]
      }));

      return { success: true, count: importedBookings.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  importBookingsFromCSV: (csvText) => {
    try {
      const lines = csvText.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        return { success: false, error: 'CSV fájl üres vagy csak fejlécet tartalmaz' };
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const bookingsArray = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const booking = {
          id: Date.now() + Math.random() + i,
          createdAt: todayISO(),
          status: 'confirmed',
          platform: 'airbnb',
          guestCount: 1,
          nights: 1
        };

        headers.forEach((header, index) => {
          if (values[index]) {
            switch (header) {
              case 'apartment_id':
              case 'apartmentid':
                booking.apartmentId = values[index];
                break;
              case 'apartment_name':
              case 'apartmentname':
                booking.apartmentName = values[index];
                break;
              case 'guest_name':
              case 'guestname':
                booking.guestName = values[index];
                break;
              case 'guest_email':
              case 'guestemail':
                booking.guestEmail = values[index];
                break;
              case 'check_in':
              case 'checkin':
              case 'date_from':
              case 'datefrom':
                booking.dateFrom = values[index];
                booking.checkIn = values[index];
                break;
              case 'check_out':
              case 'checkout':
              case 'date_to':
              case 'dateto':
                booking.dateTo = values[index];
                booking.checkOut = values[index];
                break;
              case 'platform':
                booking.platform = values[index];
                break;
              case 'guest_count':
              case 'guestcount':
                booking.guestCount = Number(values[index]) || 1;
                break;
              case 'payout':
              case 'net_revenue':
              case 'netrevenue':
              case 'payout_ft':
                booking.payoutFt = Number(values[index]) || 0;
                booking.netRevenue = Number(values[index]) || 0;
                break;
              case 'notes':
                booking.notes = values[index];
                break;
              case 'status':
                booking.status = values[index];
                break;
            }
          }
        });

        // Számoljuk ki az éjszakák számát
        if (booking.dateFrom && booking.dateTo) {
          try {
            const checkIn = new Date(booking.dateFrom);
            const checkOut = new Date(booking.dateTo);
            booking.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
          } catch (e) {
            booking.nights = 1;
          }
        }

        if (booking.guestName || booking.apartmentId) {
          bookingsArray.push(booking);
        }
      }

      set((state) => ({
        bookings: [...state.bookings, ...bookingsArray]
      }));

      return { success: true, count: bookingsArray.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}));

export default useBookingsStore;

