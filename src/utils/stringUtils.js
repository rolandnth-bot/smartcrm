/**
 * Szöveg formázási és kezelési segédfüggvények
 */

/**
 * Szöveg rövidítése meghatározott hosszra
 * @param {string} str - Szöveg
 * @param {number} maxLength - Maximális hossz
 * @param {string} suffix - Utótag (default: '...')
 * @returns {string} Rövidített szöveg
 */
export const truncate = (str, maxLength, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Szöveg els betjének nagybetssé alakítása
 * @param {string} str - Szöveg
 * @returns {string} Formázott szöveg
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Szöveg minden szavának els betjének nagybetssé alakítása
 * @param {string} str - Szöveg
 * @returns {string} Formázott szöveg
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Szöveg camelCase formátumra alakítása
 * @param {string} str - Szöveg
 * @returns {string} CamelCase szöveg
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Szöveg kebab-case formátumra alakítása
 * @param {string} str - Szöveg
 * @returns {string} Kebab-case szöveg
 */
export const toKebabCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Szöveg snake_case formátumra alakítása
 * @param {string} str - Szöveg
 * @returns {string} Snake_case szöveg
 */
export const toSnakeCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Szöveg slug formátumra alakítása (URL-barát)
 * @param {string} str - Szöveg
 * @returns {string} Slug szöveg
 */
export const toSlug = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Speciális karakterek eltávolítása
    .replace(/[\s_-]+/g, '-') // Szóközök, aláhúzások kötjelekké
    .replace(/^-+|-+$/g, ''); // Elz és utolsó kötjelek eltávolítása
};

/**
 * Szöveg HTML entitások eltávolítása
 * @param {string} str - Szöveg
 * @returns {string} Tisztított szöveg
 */
export const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = str;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Szöveg whitespace karakterek eltávolítása
 * @param {string} str - Szöveg
 * @returns {string} Tisztított szöveg
 */
export const stripWhitespace = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Szöveg ellenrzése, hogy üres-e
 * @param {string} str - Szöveg
 * @returns {boolean} True, ha üres vagy csak whitespace
 */
export const isEmpty = (str) => {
  if (str === null || str === undefined) return true;
  if (typeof str !== 'string') return true;
  return str.trim().length === 0;
};

/**
 * Szöveg ellenrzése, hogy tartalmaz-e egy részletet
 * @param {string} str - Szöveg
 * @param {string} search - Keresett részlet
 * @param {boolean} caseSensitive - Kis- és nagybet érzékeny (default: false)
 * @returns {boolean} True, ha tartalmazza
 */
export const contains = (str, search, caseSensitive = false) => {
  if (!str || typeof str !== 'string') return false;
  if (!search || typeof search !== 'string') return false;
  
  if (caseSensitive) {
    return str.includes(search);
  }
  return str.toLowerCase().includes(search.toLowerCase());
};

/**
 * Szöveg kezdete ellenrzése
 * @param {string} str - Szöveg
 * @param {string} prefix - Eltag
 * @param {boolean} caseSensitive - Kis- és nagybet érzékeny (default: false)
 * @returns {boolean} True, ha ezzel kezddik
 */
export const startsWith = (str, prefix, caseSensitive = false) => {
  if (!str || typeof str !== 'string') return false;
  if (!prefix || typeof prefix !== 'string') return false;
  
  if (caseSensitive) {
    return str.startsWith(prefix);
  }
  return str.toLowerCase().startsWith(prefix.toLowerCase());
};

/**
 * Szöveg vége ellenrzése
 * @param {string} str - Szöveg
 * @param {string} suffix - Utótag
 * @param {boolean} caseSensitive - Kis- és nagybet érzékeny (default: false)
 * @returns {boolean} True, ha ezzel végzdik
 */
export const endsWith = (str, suffix, caseSensitive = false) => {
  if (!str || typeof str !== 'string') return false;
  if (!suffix || typeof suffix !== 'string') return false;
  
  if (caseSensitive) {
    return str.endsWith(suffix);
  }
  return str.toLowerCase().endsWith(suffix.toLowerCase());
};

/**
 * Szöveg szavak számának meghatározása
 * @param {string} str - Szöveg
 * @returns {number} Szavak száma
 */
export const wordCount = (str) => {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Szöveg karakterek számának meghatározása (whitespace nélkül)
 * @param {string} str - Szöveg
 * @returns {number} Karakterek száma
 */
export const charCount = (str, excludeWhitespace = false) => {
  if (!str || typeof str !== 'string') return 0;
  if (excludeWhitespace) {
    return str.replace(/\s/g, '').length;
  }
  return str.length;
};

