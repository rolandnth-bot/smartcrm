import { create } from 'zustand';
import api, {
  leadsList,
  leadsCreate,
  leadsUpdate,
  leadsDelete,
  leadFromApi,
  leadToApi
} from '../services/api';
import useToastStore from './toastStore';
import { todayISO } from '../utils/dateUtils';
import { contains } from '../utils/stringUtils';

// Lead státuszok (értékesítési folyamat szerint)
export const leadStatuses = [
  { key: 'uj_erdeklodo', label: 'Új érdeklődő', color: 'orange', order: 1 },
  { key: 'kapcsolatfelvetel', label: 'Kapcsolatfelvétel', color: 'yellow', order: 2 },
  { key: 'felmeres_tervezve', label: 'Felmérés tervezve', color: 'blue', order: 3 },
  { key: 'felmeres_megtortent', label: 'Felmérés megtörtént', color: 'blue', order: 4 },
  { key: 'ajanlat_kuldve', label: 'Ajánlat kiküldve', color: 'purple', order: 5 },
  { key: 'targyalas', label: 'Tárgyalás', color: 'cyan', order: 6 },
  { key: 'szerzodes_kuldve', label: 'Szerzdés elküldve', color: 'indigo', order: 7 },
  { key: 'alairva', label: 'Aláírva', color: 'green', order: 8 },
  { key: 'aktiv_partner', label: 'Aktív partner', color: 'green', order: 9 },
  { key: 'elutasitva', label: 'Elutasítva', color: 'red', order: 10 },
  { key: 'kesobb', label: 'Késbb', color: 'gray', order: 11 },
  { key: 'nem_aktualis', label: 'Nem aktuális', color: 'gray', order: 12 }
];

// Kompatibilitás a régi státuszokkal
export const legacyStatusMap = {
  'new': 'uj_erdeklodo',
  'contacted': 'kapcsolatfelvetel',
  'meeting': 'felmeres_tervezve',
  'offer': 'ajanlat_kuldve',
  'negotiation': 'targyalas',
  'won': 'alairva',
  'lost': 'elutasitva'
};

// Lead források
export const leadSources = [
  { key: 'website', label: 'Weboldal' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'referral', label: 'Ajánlás' },
  { key: 'airbnb', label: 'Airbnb' },
  { key: 'booking', label: 'Booking' },
  { key: 'phone', label: 'Telefon' },
  { key: 'email', label: 'Email' },
  { key: 'other', label: 'Egyéb' }
];

// Lead értékelések
export const leadRatings = [
  { key: 'hot', label: 'Forró - Sürgs', color: 'red' },
  { key: 'warm', label: 'Meleg - Érdekld', color: 'orange' },
  { key: 'cold', label: 'Hideg - Késbbi', color: 'blue' }
];

const useLeadsStore = create((set, get) => ({
  // State
  leads: [],
  isLoading: false,
  error: null,
  legacyStatusMap: legacyStatusMap, // Hozzáadjuk a state-hez, hogy elérhet legyen
  filter: 'all', // 'all' vagy státusz key
  searchQuery: '', // Szöveges keresés
  showAddLead: false,
  showLeadImport: false,
  editingLead: null,

  // Actions
  setLeads: (leads) => set({ leads }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  fetchFromApi: async () => {
    if (!api.isConfigured()) return;
    set({ isLoading: true, error: null });
    try {
      const raw = await leadsList({});
      const list = Array.isArray(raw) ? raw.map(leadFromApi) : [];
      set({ leads: list });
    } catch (e) {
      const errorMsg = e?.message || 'Hiba a lead-ek betöltésekor.';
      set({ error: errorMsg });
      useToastStore.getState().error(errorMsg);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addLead: async (lead) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = leadToApi({ ...lead, status: 'new', rating: 'warm' });
        await leadsCreate(body);
        await get().fetchFromApi();
        useToastStore.getState().success('Lead sikeresen létrehozva');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lead létrehozásakor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    const newLead = {
      id: Date.now(),
      createdAt: todayISO(),
      status: 'new',
      rating: 'warm',
      ...lead
    };
    set((state) => ({
      leads: [...state.leads, newLead]
    }));
    useToastStore.getState().success('Lead sikeresen létrehozva');
    return newLead;
  },

  updateLead: async (id, updates) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        const body = leadToApi(updates);
        await leadsUpdate(id, body);
        await get().fetchFromApi();
        useToastStore.getState().success('Lead sikeresen frissítve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lead mentésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      )
    }));
    useToastStore.getState().success('Lead sikeresen frissítve');
  },

  deleteLead: async (id) => {
    if (api.isConfigured()) {
      set({ isLoading: true, error: null });
      try {
        await leadsDelete(id);
        await get().fetchFromApi();
        useToastStore.getState().success('Lead sikeresen törölve');
      } catch (e) {
        const errorMsg = e?.message || 'Hiba a lead törlésekor.';
        set({ error: errorMsg, isLoading: false });
        useToastStore.getState().error(errorMsg);
        throw e;
      } finally {
        set({ isLoading: false });
      }
      return;
    }
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id)
    }));
    useToastStore.getState().success('Lead sikeresen törölve');
  },

  setLeadStatus: (id, status) => {
    get().updateLead(id, { status });
  },

  setFilter: (filter) => set({ filter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setShowAddLead: (show) => set({ showAddLead: show }),

  setShowLeadImport: (show) => set({ showLeadImport: show }),

  setEditingLead: (lead) => set({ editingLead: lead }),

  // Computed values
  getFilteredLeads: () => {
    const { leads, filter, searchQuery, legacyStatusMap } = get();
    let filtered = leads;
    
    // Státusz szrés (kompatibilitás régi és új státuszokkal)
    if (filter !== 'all') {
      const mappedFilter = legacyStatusMap[filter] || filter;
      filtered = filtered.filter((lead) => {
        const leadStatus = legacyStatusMap[lead.status] || lead.status;
        return leadStatus === mappedFilter || lead.status === filter;
      });
    }
    
    // Szöveges keresés (név, email, telefon alapján)
    if (searchQuery && searchQuery.trim()) {
      filtered = filtered.filter((lead) => {
        return contains(lead.name || '', searchQuery) ||
               contains(lead.email || '', searchQuery) ||
               contains(lead.phone?.toString() || '', searchQuery) ||
               contains(lead.notes || '', searchQuery);
      });
    }
    
    return filtered;
  },

  getLeadsByStatus: (status) => {
    try {
      const state = get();
      if (!state) {
        return [];
      }
      const { leads, legacyStatusMap } = state;
      if (!status || !leads || !Array.isArray(leads)) {
        return [];
      }
      if (!legacyStatusMap) {
        // Ha nincs legacyStatusMap, akkor közvetlenül használjuk a státuszt
        return leads.filter((lead) => {
          if (!lead || !lead.status) {
            return false;
          }
          return lead.status === status;
        });
      }
      // Ha régi státusz, akkor konvertáljuk az újra
      const mappedStatus = legacyStatusMap[status] || status;
      return leads.filter((lead) => {
        if (!lead || !lead.status) {
          return false;
        }
        const leadStatus = legacyStatusMap[lead.status] || lead.status;
        return leadStatus === mappedStatus || lead.status === status;
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Hiba a getLeadsByStatus függvényben:', error);
      }
      return [];
    }
  },

  // Import functions
  importLeadsFromJSON: (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const leadsArray = Array.isArray(data) ? data : [];
      
      const state = get();
      const existingLeads = state.leads || [];
      
      // Egyezés ellenrzés: email vagy név alapján
      const isDuplicate = (newLead) => {
        const newEmail = (newLead.email || '').toLowerCase().trim();
        const newName = (newLead.name || '').toLowerCase().trim();
        
        return existingLeads.some((existing) => {
          const existingEmail = (existing.email || '').toLowerCase().trim();
          const existingName = (existing.name || '').toLowerCase().trim();
          
          // Email egyezés (ha mindkett van)
          if (newEmail && existingEmail && newEmail === existingEmail) {
            return true;
          }
          // Név egyezés (ha mindkett van és nincs email)
          if (newName && existingName && newName === existingName && !newEmail && !existingEmail) {
            return true;
          }
          return false;
        });
      };
      
      const importedLeads = [];
      const skippedLeads = [];
      
      leadsArray.forEach((item, index) => {
        const newLead = {
          id: Date.now() + Math.random() + index,
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          source: item.source || 'website',
          status: item.status || 'uj_erdeklodo',
          rating: item.rating || 'warm',
          notes: item.notes || '',
          apartmentInterest: item.apartmentInterest || '',
          budget: item.budget || '',
          assignedTo: item.assignedTo || '',
          createdAt: todayISO(),
          importedData: {}
        };
        
        // Egyezés ellenrzés
        if (isDuplicate(newLead)) {
          skippedLeads.push(newLead);
          return; // Kihagyjuk
        }
        
        // Minden egyéb mezt tárolunk az importedData-ban
        Object.keys(item).forEach(key => {
          if (!['name', 'email', 'phone', 'source', 'status', 'rating', 'notes', 'apartmentInterest', 'budget', 'assignedTo'].includes(key.toLowerCase())) {
            const normalizedKey = key.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '');
            newLead.importedData[normalizedKey] = item[key];
            newLead.importedData[`_${normalizedKey}_original`] = key;
          }
        });
        
        importedLeads.push(newLead);
      });

      if (importedLeads.length > 0) {
        set((state) => ({
          leads: [...state.leads, ...importedLeads]
        }));
      }

      return { 
        success: true, 
        count: importedLeads.length,
        skipped: skippedLeads.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  importLeadsFromExcel: (excelData) => {
    try {
      // Excel fájl feldolgozása (xlsx library-t használunk)
      // A függvény egy 2D tömböt vár: [[header1, header2, ...], [row1col1, row1col2, ...], ...]
      if (!Array.isArray(excelData) || excelData.length < 2) {
        return { success: false, error: 'Excel fájl üres vagy csak fejlécet tartalmaz' };
      }

      const headers = excelData[0].map((h) => String(h || '').trim().toLowerCase());
      const leadsArray = [];

      for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        if (!row || row.length === 0) continue;

        const values = row.map((v) => {
          // Dátum értékek kezelése
          if (v instanceof Date) {
            return v.toISOString().split('T')[0];
          }
          return String(v || '').trim();
        });
        const lead = {
          id: Date.now() + Math.random() + i,
          createdAt: todayISO(),
          status: 'uj_erdeklodo',
          rating: 'warm',
          importedData: {}
        };

        // Minden oszlop kezelése - dinamikusan
        headers.forEach((header, index) => {
          const headerLower = header.toLowerCase();
          const value = values[index];
          
          if (value) {
            // Standard mezk
            if (headerLower === 'name' || headerLower === 'név') {
              lead.name = value;
            } else if (headerLower === 'email') {
              lead.email = value;
            } else if (headerLower === 'phone' || headerLower === 'telefonszám' || headerLower === 'telefon') {
              lead.phone = value;
            } else if (headerLower === 'source' || headerLower === 'forrás' || headerLower === 'hirdetés') {
              lead.source = value;
            } else if (headerLower === 'notes' || headerLower === 'megjegyzés' || headerLower === 'megjegyzes') {
              lead.notes = value;
            } else if (headerLower === 'status' || headerLower === 'státusz' || headerLower === 'statusz') {
              lead.status = value;
            } else if (headerLower === 'rating') {
              lead.rating = value;
            } else if (headerLower === 'szín' || headerLower === 'color' || headerLower === 'lead_szín' || headerLower === 'lead_color') {
              // Szín: zöld=meleg; pirosKésbb (amber); szürkeNem aktuális; fekete=elveszett
              const colorValue = String(value).toLowerCase().trim();
              if (colorValue === 'zöld' || colorValue === 'green' || colorValue === 'meleg' || colorValue === 'warm') {
                lead.leadColor = 'green';
              } else if (colorValue === 'piros' || colorValue === 'red') {
                lead.status = 'kesobb';
                lead.leadColor = 'orange';
              } else if (colorValue === 'szürke' || colorValue === 'grey' || colorValue === 'gray' || colorValue === 'nem aktuális' || colorValue === 'nem_aktualis') {
                lead.status = 'nem_aktualis';
                lead.leadColor = 'gray';
              } else if (colorValue === 'fekete' || colorValue === 'black' || colorValue === 'elveszett' || colorValue === 'lost') {
                lead.leadColor = 'black';
              }
            } else {
              // Egyéb oszlopok - dinamikusan tároljuk az eredeti oszlopnévvel
              if (!lead.importedData) {
                lead.importedData = {};
              }
              // Oszlopnév normalizálása (kisbet, ékezetek nélkül, szóköz helyett aláhúzás)
              const normalizedKey = headerLower
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
              lead.importedData[normalizedKey] = value;
              // Eredeti oszlopnév is tárolva
              lead.importedData[`_${normalizedKey}_original`] = header;
            }
          }
        });
        
        // Excel specifikus mezk  ugyanaz a normalizálás mint CSV, hogy az Ingatlan információk rlappal egyezzen
        if (lead.importedData) {
          // Van jelenleg kiadó ingatlanod  igen_van / hamarosan_lesz / nem
          if (lead.importedData.van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz) {
            const val = String(lead.importedData.van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz).toLowerCase().replace(/[,_]/g, ' ');
            if (val.includes('igen') && val.includes('van')) {
              lead.hasProperty = 'igen_van';
            } else if (val.includes('hamarosan')) {
              lead.hasProperty = 'hamarosan_lesz';
            } else if (val.includes('nem')) {
              lead.hasProperty = 'nem';
            } else {
              lead.hasProperty = lead.importedData.van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz;
            }
          }
          // Jelenleg milyen formában adod ki  airbnb_rövidtáv / hosszútáv / nincs_kiadva_még
          if (lead.importedData.jelenleg_milyen_formaban_adod_ki) {
            const val = String(lead.importedData.jelenleg_milyen_formaban_adod_ki).toLowerCase().replace(/[/_\s]/g, ' ');
            if (val.includes('airbnb') && (val.includes('rövid') || val.includes('rovid') || val.includes('rovidtav'))) {
              lead.currentRentalType = 'airbnb_rövidtáv';
            } else if (val.includes('hossz') || val.includes('hosszu')) {
              lead.currentRentalType = 'hosszútáv';
            } else if (val.includes('nincs')) {
              lead.currentRentalType = 'nincs_kiadva_még';
            } else {
              lead.currentRentalType = lead.importedData.jelenleg_milyen_formaban_adod_ki;
            }
          }
          // Van most aktív üzemeltetd  igen / nincs
          if (lead.importedData.van_most_aktiv_uzemeltetod) {
            const val = String(lead.importedData.van_most_aktiv_uzemeltetod).toLowerCase();
            lead.hasOperator = val.includes('igen') ? 'igen' : 'nincs';
          }
          // Miért szeretnél üzemeltett váltani  szöveg, változatlan
          if (lead.importedData.miert_szeretnel_uzemeltetot_valtani) {
            lead.whyChangeOperator = lead.importedData.miert_szeretnel_uzemeltetot_valtani;
          }
          // Melyik városban található az ingatlan  változatlan
          if (lead.importedData.melyik_varosban_talalhato_az_ingatlan) {
            lead.city = lead.importedData.melyik_varosban_talalhato_az_ingatlan;
          }
          // Jelentkezett dátum  YYYY-MM-DD
          if (lead.importedData.jelentkezett) {
            try {
              const raw = lead.importedData.jelentkezett;
              const date = raw instanceof Date ? raw : new Date(raw);
              if (!isNaN(date.getTime())) {
                lead.applicationDate = date.toISOString().split('T')[0];
              } else {
                lead.applicationDate = raw;
              }
            } catch (e) {
              lead.applicationDate = lead.importedData.jelentkezett;
            }
          }
        }

        if (lead.name) {
          leadsArray.push(lead);
        }
      }

      if (leadsArray.length === 0) {
        return { success: false, error: 'Nem található érvényes lead az Excel fájlban' };
      }

      // Egyezés ellenrzés: email vagy név alapján
      const state = get();
      const existingLeads = state.leads || [];
      
      const isDuplicate = (newLead) => {
        const newEmail = (newLead.email || '').toLowerCase().trim();
        const newName = (newLead.name || '').toLowerCase().trim();
        
        return existingLeads.some((existing) => {
          const existingEmail = (existing.email || '').toLowerCase().trim();
          const existingName = (existing.name || '').toLowerCase().trim();
          
          // Email egyezés (ha mindkett van)
          if (newEmail && existingEmail && newEmail === existingEmail) {
            return true;
          }
          // Név egyezés (ha mindkett van és nincs email)
          if (newName && existingName && newName === existingName && !newEmail && !existingEmail) {
            return true;
          }
          return false;
        });
      };
      
      const importedLeads = [];
      const skippedLeads = [];
      
      leadsArray.forEach((lead) => {
        if (isDuplicate(lead)) {
          skippedLeads.push(lead);
        } else {
          importedLeads.push(lead);
        }
      });

      if (importedLeads.length > 0) {
        set((state) => ({
          leads: [...state.leads, ...importedLeads]
        }));
      }

      return { 
        success: true, 
        count: importedLeads.length,
        skipped: skippedLeads.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  importLeadsFromCSV: (csvText) => {
    try {
      const lines = csvText.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        return { success: false, error: 'CSV fájl üres vagy csak fejlécet tartalmaz' };
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const leadsArray = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const lead = {
          id: Date.now() + Math.random() + i,
          createdAt: todayISO(),
          status: 'uj_erdeklodo',
          rating: 'warm',
          importedData: {}
        };

        headers.forEach((header, index) => {
          const headerLower = header.toLowerCase();
          const value = values[index];
          
          if (value) {
            // Standard mezk
            if (headerLower === 'name' || headerLower === 'név') {
              lead.name = value;
            } else if (headerLower === 'email') {
              lead.email = value;
            } else if (headerLower === 'phone' || headerLower === 'telefonszám' || headerLower === 'telefon') {
              lead.phone = value;
            } else if (headerLower === 'source' || headerLower === 'forrás' || headerLower === 'hirdetés') {
              lead.source = value;
            } else if (headerLower === 'notes' || headerLower === 'megjegyzés' || headerLower === 'megjegyzes') {
              lead.notes = value;
            } else if (headerLower === 'status' || headerLower === 'státusz' || headerLower === 'statusz') {
              lead.status = value;
            } else if (headerLower === 'rating') {
              lead.rating = value;
            } else if (headerLower === 'szín' || headerLower === 'color' || headerLower === 'lead_szín' || headerLower === 'lead_color') {
              const colorValue = String(value).toLowerCase().trim();
              if (colorValue === 'zöld' || colorValue === 'green' || colorValue === 'meleg' || colorValue === 'warm') {
                lead.leadColor = 'green';
              } else if (colorValue === 'piros' || colorValue === 'red') {
                lead.status = 'kesobb';
                lead.leadColor = 'orange';
              } else if (colorValue === 'szürke' || colorValue === 'grey' || colorValue === 'gray' || colorValue === 'nem aktuális' || colorValue === 'nem_aktualis') {
                lead.status = 'nem_aktualis';
                lead.leadColor = 'gray';
              } else if (colorValue === 'fekete' || colorValue === 'black' || colorValue === 'elveszett' || colorValue === 'lost') {
                lead.leadColor = 'black';
              }
            } else {
              // Egyéb oszlopok - dinamikusan tároljuk
              const normalizedKey = headerLower
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
              lead.importedData[normalizedKey] = value;
              lead.importedData[`_${normalizedKey}_original`] = header;
            }
          }
        });
        
        // Excel specifikus mezk kezelése
        if (lead.importedData) {
          // Van jelenleg kiadó ingatlanod
          if (lead.importedData.van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz) {
            const val = lead.importedData.van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz.toLowerCase();
            if (val.includes('igen') && val.includes('van')) {
              lead.hasProperty = 'igen_van';
            } else if (val.includes('hamarosan')) {
              lead.hasProperty = 'hamarosan_lesz';
            } else if (val.includes('nem')) {
              lead.hasProperty = 'nem';
            }
          }
          // Jelenleg milyen formában adod ki
          if (lead.importedData.jelenleg_milyen_formaban_adod_ki) {
            const val = lead.importedData.jelenleg_milyen_formaban_adod_ki.toLowerCase();
            if (val.includes('airbnb') && (val.includes('rövid') || val.includes('rovid'))) {
              lead.currentRentalType = 'airbnb_rövidtáv';
            } else if (val.includes('hossz') || val.includes('hosszu')) {
              lead.currentRentalType = 'hosszútáv';
            } else if (val.includes('nincs')) {
              lead.currentRentalType = 'nincs_kiadva_még';
            }
          }
          // Van most aktív üzemeltetd
          if (lead.importedData.van_most_aktiv_uzemeltetod) {
            const val = lead.importedData.van_most_aktiv_uzemeltetod.toLowerCase();
            lead.hasOperator = val.includes('igen') ? 'igen' : 'nincs';
          }
          // Miért szeretnél üzemeltett váltani
          if (lead.importedData.miert_szeretnel_uzemeltetot_valtani) {
            lead.whyChangeOperator = lead.importedData.miert_szeretnel_uzemeltetot_valtani;
          }
          // Melyik városban található az ingatlan
          if (lead.importedData.melyik_varosban_talalhato_az_ingatlan) {
            lead.city = lead.importedData.melyik_varosban_talalhato_az_ingatlan;
          }
          // Jelentkezett dátum
          if (lead.importedData.jelentkezett) {
            try {
              const date = new Date(lead.importedData.jelentkezett);
              if (!isNaN(date.getTime())) {
                lead.applicationDate = date.toISOString().split('T')[0];
              }
            } catch (e) {
              // Dátum parse hiba esetén az eredeti értéket megtartjuk
            }
          }
        }

        if (lead.name) {
          leadsArray.push(lead);
        }
      }

      if (leadsArray.length === 0) {
        return { success: false, error: 'CSV fájl üres vagy csak fejlécet tartalmaz' };
      }

      // Egyezés ellenrzés: email vagy név alapján
      const state = get();
      const existingLeads = state.leads || [];
      
      const isDuplicate = (newLead) => {
        const newEmail = (newLead.email || '').toLowerCase().trim();
        const newName = (newLead.name || '').toLowerCase().trim();
        
        return existingLeads.some((existing) => {
          const existingEmail = (existing.email || '').toLowerCase().trim();
          const existingName = (existing.name || '').toLowerCase().trim();
          
          // Email egyezés (ha mindkett van)
          if (newEmail && existingEmail && newEmail === existingEmail) {
            return true;
          }
          // Név egyezés (ha mindkett van és nincs email)
          if (newName && existingName && newName === existingName && !newEmail && !existingEmail) {
            return true;
          }
          return false;
        });
      };
      
      const importedLeads = [];
      const skippedLeads = [];
      
      leadsArray.forEach((lead) => {
        if (isDuplicate(lead)) {
          skippedLeads.push(lead);
        } else {
          importedLeads.push(lead);
        }
      });

      if (importedLeads.length > 0) {
        set((state) => ({
          leads: [...state.leads, ...importedLeads]
        }));
      }

      return { 
        success: true, 
        count: importedLeads.length,
        skipped: skippedLeads.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}));

export default useLeadsStore;

