/**
 * Szám formázási és kezelési segédfüggvények
 */

/**
 * Pénzösszeg formázása EUR formátumban
 * @param {number|string} amount - Összeg
 * @param {boolean} showSymbol - Mutassa-e az EUR szimbólumot (default: true)
 * @returns {string} Formázott összeg string
 */
export const formatCurrencyEUR = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || amount === '') return showSymbol ? '0 ' : '0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return showSymbol ? '0 ' : '0';
  
  const formatted = new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
  
  return showSymbol ? `${formatted} ` : formatted;
};

/**
 * Pénzösszeg formázása HUF formátumban
 * @param {number|string} amount - Összeg
 * @param {boolean} showSymbol - Mutassa-e a Ft szimbólumot (default: true)
 * @returns {string} Formázott összeg string
 */
export const formatCurrencyHUF = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || amount === '') return showSymbol ? '0 Ft' : '0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return showSymbol ? '0 Ft' : '0';
  
  const formatted = new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
  
  return showSymbol ? `${formatted} Ft` : formatted;
};

/**
 * Szám formázása magyar formátumban (ezer elválasztó)
 * @param {number|string} number - Szám
 * @param {number} decimals - Tizedesjegyek száma (default: 0)
 * @returns {string} Formázott szám string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || number === '') return '0';
  
  const num = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('hu-HU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Százalék formázása
 * @param {number|string} value - Százalék érték (0-100)
 * @param {number} decimals - Tizedesjegyek száma (default: 1)
 * @returns {string} Formázott százalék string
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(decimals)}%`;
};

/**
 * Szám ellenrzése, hogy érvényes-e
 * @param {number|string} value - Érték
 * @returns {boolean} True, ha érvényes szám
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && isFinite(num);
};

/**
 * Szám konvertálása biztonságosan
 * @param {number|string} value - Érték
 * @param {number} defaultValue - Alapértelmezett érték (default: 0)
 * @returns {number} Konvertált szám
 */
export const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

/**
 * Szám korlátozása egy tartományra
 * @param {number|string} value - Érték
 * @param {number} min - Minimum érték
 * @param {number} max - Maximum érték
 * @returns {number} Korlátozott szám
 */
export const clamp = (value, min, max) => {
  const num = toNumber(value, min);
  return Math.max(min, Math.min(max, num));
};

/**
 * Kerekítés meghatározott tizedesjegyekre
 * @param {number|string} value - Érték
 * @param {number} decimals - Tizedesjegyek száma (default: 2)
 * @returns {number} Kerekített szám
 */
export const round = (value, decimals = 2) => {
  const num = toNumber(value, 0);
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Pénzösszeg formázása (EUR vagy HUF alapján)
 * @param {number|string} amount - Összeg
 * @param {string} currency - Pénznem ('EUR' vagy 'HUF', default: 'EUR')
 * @param {boolean} showSymbol - Mutassa-e a szimbólumot (default: true)
 * @returns {string} Formázott összeg string
 */
export const formatCurrency = (amount, currency = 'EUR', showSymbol = true) => {
  if (currency === 'HUF' || currency === 'Ft') {
    return formatCurrencyHUF(amount, showSymbol);
  }
  return formatCurrencyEUR(amount, showSymbol);
};

/**
 * Százalék számítása (rész/összeg * 100)
 * @param {number|string} part - Rész
 * @param {number|string} total - Összeg
 * @param {number} decimals - Tizedesjegyek száma (default: 1)
 * @returns {number} Százalék érték
 */
export const calculatePercent = (part, total, decimals = 1) => {
  const partNum = toNumber(part, 0);
  const totalNum = toNumber(total, 0);
  if (totalNum === 0) return 0;
  const percent = (partNum / totalNum) * 100;
  return round(percent, decimals);
};

/**
 * Átlag számítása
 * @param {number[]} values - Értékek tömbje
 * @param {number} decimals - Tizedesjegyek száma (default: 2)
 * @returns {number} Átlag érték
 */
export const calculateAverage = (values, decimals = 2) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + toNumber(val, 0), 0);
  return round(sum / values.length, decimals);
};

/**
 * Összeg számítása
 * @param {number[]} values - Értékek tömbje
 * @returns {number} Összeg
 */
export const calculateSum = (values) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((acc, val) => acc + toNumber(val, 0), 0);
};

/**
 * Minimum érték meghatározása
 * @param {number[]} values - Értékek tömbje
 * @returns {number} Minimum érték
 */
export const calculateMin = (values) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return Math.min(...values.map(val => toNumber(val, 0)));
};

/**
 * Maximum érték meghatározása
 * @param {number[]} values - Értékek tömbje
 * @returns {number} Maximum érték
 */
export const calculateMax = (values) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return Math.max(...values.map(val => toNumber(val, 0)));
};/**
 * Pénznem konverzió (EUR  HUF)
 * @param {number|string} amount - Összeg
 * @param {string} fromCurrency - Forrás pénznem ('EUR' vagy 'HUF')
 * @param {string} toCurrency - Cél pénznem ('EUR' vagy 'HUF')
 * @param {number} exchangeRate - Árfolyam (default: 400)
 * @returns {number} Konvertált összeg
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRate = 400) => {
  const num = toNumber(amount, 0);
  
  if (fromCurrency === toCurrency) return num;
  
  if (fromCurrency === 'EUR' && toCurrency === 'HUF') {
    return round(num * exchangeRate, 0);
  }
  
  if (fromCurrency === 'HUF' && toCurrency === 'EUR') {
    return round(num / exchangeRate, 2);
  }
  
  return num;
};

/**
 * Szám kompakt formázása (pl. 1000  1K, 1000000  1M)
 * @param {number|string} value - Érték
 * @param {number} decimals - Tizedesjegyek száma (default: 1)
 * @returns {string} Kompakt formázott szám
 */
export const formatCompact = (value, decimals = 1) => {
  const num = toNumber(value, 0);
  
  if (num >= 1000000) {
    return `${round(num / 1000000, decimals)}M`;
  }
  if (num >= 1000) {
    return `${round(num / 1000, decimals)}K`;
  }
  
  return String(num);
};