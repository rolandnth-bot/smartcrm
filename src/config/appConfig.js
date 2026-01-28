/**
 * SmartCRM Alkalmazás Konfiguráció
 * Központi konfigurációs értékek
 */

export const APP_CONFIG = {
  // Alkalmazás információk
  name: 'SmartCRM',
  version: '1.4.0',
  description: 'Vállalatirányítási Rendszer ingatlan kezeléshez, foglalások kezeléséhez és ügyfélkapcsolat-kezeléshez',
  
  // Toast/Notification beállítások
  toast: {
    maxVisible: 3, // Maximum látható toast egyszerre
    defaultDuration: 5000, // Alapértelmezett időtartam (ms)
    successDuration: 3000,
    errorDuration: 6000,
    warningDuration: 5000,
    infoDuration: 4000
  },
  
  // API beállítások
  api: {
    defaultTimeout: 30000, // 30 másodperc
    defaultRetries: 0, // Alapértelmezett retry szám (0 = nincs retry)
    retryDelay: 1000, // Retry késleltetés (ms)
    maxRetries: 3 // Maximum retry szám
  },
  
  // Debounce/Throttle beállítások
  debounce: {
    search: 300, // Keresés debounce (ms)
    input: 500, // Input mezők debounce (ms)
    scroll: 100 // Scroll események throttle (ms)
  },
  
  // Pagination beállítások
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // Fájl feltöltés beállítások
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      csv: ['text/csv', 'application/vnd.ms-excel'],
      json: ['application/json']
    }
  },
  
  // Dátum/idő beállítások
  dateTime: {
    locale: 'hu-HU',
    timezone: 'Europe/Budapest',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'YYYY-MM-DD HH:mm'
  },
  
  // Validáció beállítások
  validation: {
    minPasswordLength: 6,
    maxPasswordLength: 100,
    minNameLength: 2,
    maxNameLength: 100,
    maxEmailLength: 255,
    maxPhoneLength: 20,
    maxNotesLength: 1000
  },
  
  // Performance beállítások
  performance: {
    enableMonitoring: import.meta.env.DEV, // Csak development módban
    logRenderTime: import.meta.env.DEV,
    warnSlowRenders: true,
    slowRenderThreshold: 100 // ms
  },
  
  // Feature flags (funkció kapcsolók)
  features: {
    pwa: true,
    offlineMode: true,
    serviceWorker: import.meta.env.PROD, // Csak production build-ben
    analytics: false, // Jelenleg nincs analytics
    errorTracking: false // Jelenleg nincs error tracking (pl. Sentry)
  }
};

/**
 * Environment-specifikus konfiguráció
 */
export const ENV_CONFIG = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  }
};

/**
 * Helper függvények
 */
export const getToastDuration = (type) => {
  return APP_CONFIG.toast[`${type}Duration`] || APP_CONFIG.toast.defaultDuration;
};

export const isFeatureEnabled = (feature) => {
  return APP_CONFIG.features[feature] === true;
};

export default APP_CONFIG;

