/**
 * Dátum formázási és kezelési segédfüggvények
 */

/**
 * Dátum formázása magyar formátumban (YYYY.MM.DD)
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {string} Formázott dátum string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

/**
 * Dátum formázása magyar formátumban hosszabb verzióban (YYYY. MMMM DD.)
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {string} Formázott dátum string
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const monthNames = [
    'január', 'február', 'március', 'április', 'május', 'június',
    'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
  ];
  
  const year = d.getFullYear();
  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  
  return `${year}. ${month} ${day}.`;
};

/**
 * Dátum formázása relatív idben (pl. "2 napja", "tegnap", "ma")
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {string} Relatív dátum string
 */
export const formatDateRelative = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffTime = now - d;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'ma';
  if (diffDays === 1) return 'tegnap';
  if (diffDays === -1) return 'holnap';
  if (diffDays > 0 && diffDays < 7) return `${diffDays} napja`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} nap múlva`;
  
  return formatDate(d);
};

/**
 * Dátum tartomány formázása (pl. "2024.01.15 - 2024.01.20")
 * @param {Date|string} startDate - Kezd dátum
 * @param {Date|string} endDate - Vég dátum
 * @returns {string} Formázott dátum tartomány
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (!start || !end) return '';
  
  return `${start} - ${end}`;
};

/**
 * Dátum ellenrzése, hogy érvényes-e
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {boolean} True, ha érvényes dátum
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(d.getTime());
};

/**
 * Két dátum közötti napok száma
 * @param {Date|string} startDate - Kezd dátum
 * @param {Date|string} endDate - Vég dátum
 * @returns {number} Napok száma
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Hónap neve magyarul
 * @param {number} monthIndex - Hónap indexe (0-11)
 * @returns {string} Hónap neve
 */
export const getMonthName = (monthIndex) => {
  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];
  
  return monthNames[monthIndex] || '';
};

/**
 * Dátum ISO string formátumban (YYYY-MM-DD)
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {string} ISO formátumú dátum string
 */
export const toISODateString = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString().split('T')[0];
};

/**
 * Ma dátum ISO string formátumban
 * @returns {string} Ma dátuma ISO formátumban
 */
export const todayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Dátum hozzáadása napokkal
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @param {number} days - Hozzáadandó napok száma
 * @returns {Date} Új dátum objektum
 */
export const addDays = (date, days) => {
  if (!date) return new Date();
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date();
  
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Dátum hozzáadása hónapokkal
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @param {number} months - Hozzáadandó hónapok száma
 * @returns {Date} Új dátum objektum
 */
export const addMonths = (date, months) => {
  if (!date) return new Date();
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date();
  
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Hónap els napja
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {Date} Hónap els napja
 */
export const getFirstDayOfMonth = (date) => {
  if (!date) return new Date();
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date();
  
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Hónap utolsó napja
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {Date} Hónap utolsó napja
 */
export const getLastDayOfMonth = (date) => {
  if (!date) return new Date();
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date();
  
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Relatív id formázása (pl. "5 perce", "2 órája", "3 napja")
 * @param {Date|string} date - Dátum objektum vagy ISO string
 * @returns {string} Relatív id string
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'épp most';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} perce`;
  } else if (diffHours < 24) {
    return `${diffHours} órája`;
  } else if (diffDays < 7) {
    return `${diffDays} napja`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hete`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} hónapja`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} éve`;
  }
};