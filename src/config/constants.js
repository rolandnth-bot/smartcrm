/**
 * SmartCRM Konstansok
 * Állandó értékek, színek, címkék, stb.
 */

// Státusz színek
export const STATUS_COLORS = {
  // Lead státuszok
  lead: {
    new: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    contacted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    meeting: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    offer: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    negotiation: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
    won: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    lost: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  },
  // Booking státuszok
  booking: {
    confirmed: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  },
  // Cleaning státuszok
  cleaning: {
    planned: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    done: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    paid: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
  },
  // Apartment státuszok
  apartment: {
    active: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
  }
};

// Platform színek és címkék
export const PLATFORM_COLORS = {
  airbnb: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700',
  booking: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  szallas: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
  direct: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
  other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
};

export const PLATFORM_LABELS = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  szallas: 'Szallas.hu',
  direct: 'Direkt',
  other: 'Egyéb'
};

// Rating színek
export const RATING_COLORS = {
  hot: 'text-red-600 dark:text-red-400',
  warm: 'text-orange-500 dark:text-orange-400',
  cold: 'text-blue-500 dark:text-blue-400'
};

// Toast ikonok
export const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

// Button variant színek (inline styles helyett Tailwind classes)
export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
};

// Route paths
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  leads: '/leads',
  marketing: '/marketing',
  sales: '/sales',
  apartments: '/apartments',
  bookings: '/bookings',
  cleaning: '/cleaning',
  finance: '/finance',
  maintenance: '/maintenance',
  settings: '/settings'
};

// LocalStorage keys
export const STORAGE_KEYS = {
  theme: 'smartcrm-theme',
  auth: 'smartcrm-auth',
  preferences: 'smartcrm-preferences'
};

// Regex patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  icalUrl: /^https?:\/\/.*\.ics$/i
};

// Error messages (központi hibaüzenetek)
export const ERROR_MESSAGES = {
  network: 'Hálózati hiba. Ellenőrizze az internetkapcsolatot.',
  timeout: 'A kérés túllépte az időkorlátot. Kérjük, próbálja újra.',
  unauthorized: 'Nincs jogosultsága ehhez a művelethez.',
  notFound: 'A kért erőforrás nem található.',
  serverError: 'Szerver hiba történt. Kérjük, próbálja újra később.',
  validation: 'Érvénytelen adatok. Kérjük, ellenőrizze a mezőket.',
  unknown: 'Ismeretlen hiba történt.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  created: 'Sikeresen létrehozva',
  updated: 'Sikeresen frissítve',
  deleted: 'Sikeresen törölve',
  saved: 'Sikeresen mentve',
  sent: 'Sikeresen elküldve'
};

export default {
  STATUS_COLORS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  RATING_COLORS,
  TOAST_ICONS,
  BUTTON_VARIANTS,
  ROUTES,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};

