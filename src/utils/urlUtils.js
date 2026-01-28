/**
 * URL kezelési utility függvények
 * URL parsing, query paraméterek, validáció, stb.
 */

import { createLogger } from './logger';

const logger = createLogger('URLUtils');

/**
 * URL validálása
 * @param {string} url - Az ellenőrizendő URL
 * @returns {boolean} Érvényes-e
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    // Relative URL ellenőrzés
    try {
      new URL(url, window.location.origin);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * URL parse-olása objektummá
 * @param {string} url - A parse-olandó URL
 * @returns {Object|null} { protocol, host, pathname, search, hash, params }
 */
export function parseURL(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url, window.location.origin);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
      params
    };
  } catch (error) {
    logger.error('URL parse error', error);
    return null;
  }
}

/**
 * Query paraméterek parse-olása string-ből
 * @param {string} search - Query string (pl. '?foo=bar&baz=qux')
 * @returns {Object} Paraméterek objektuma
 */
export function parseQueryParams(search) {
  if (!search) return {};

  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    const result = {};

    for (const [key, value] of params.entries()) {
      // Többszörös értékek kezelése (tömbként)
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  } catch (error) {
    logger.error('Query params parse error', error);
    return {};
  }
}

/**
 * Query paraméterek stringgé alakítása
 * @param {Object} params - Paraméterek objektuma
 * @param {Object} options - Opciók
 * @param {boolean} options.encode - URL encoding (default: true)
 * @param {boolean} options.includeEmpty - Üres értékeket is beleértve (default: false)
 * @returns {string} Query string (pl. '?foo=bar&baz=qux')
 */
export function buildQueryString(params, options = {}) {
  const {
    encode = true,
    includeEmpty = false
  } = options;

  if (!params || typeof params !== 'object') return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      if (includeEmpty) {
        searchParams.append(key, '');
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== null && v !== undefined) {
          searchParams.append(key, String(v));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * URL létrehozása path és paraméterekből
 * @param {string} path - Path (pl. '/users' vagy 'users')
 * @param {Object} params - Query paraméterek
 * @param {string} baseURL - Base URL (default: window.location.origin)
 * @returns {string} Teljes URL
 */
export function buildURL(path, params = {}, baseURL = null) {
  const base = baseURL || window.location.origin;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = buildQueryString(params);

  try {
    const url = new URL(cleanPath + queryString, base);
    return url.toString();
  } catch (error) {
    logger.error('URL build error', error);
    return `${base}${cleanPath}${queryString}`;
  }
}

/**
 * Query paraméter hozzáadása/módosítása URL-hez
 * @param {string} url - Az eredeti URL
 * @param {Object} params - Hozzáadandó/módosítandó paraméterek
 * @returns {string} Új URL
 */
export function addQueryParams(url, params) {
  if (!url || !params) return url;

  try {
    const urlObj = new URL(url, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        urlObj.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        urlObj.searchParams.delete(key);
        value.forEach((v) => urlObj.searchParams.append(key, String(v)));
      } else {
        urlObj.searchParams.set(key, String(value));
      }
    });
    return urlObj.toString();
  } catch (error) {
    logger.error('Add query params error', error);
    return url;
  }
}

/**
 * Query paraméter eltávolítása URL-ből
 * @param {string} url - Az eredeti URL
 * @param {string|string[]} keys - Eltávolítandó paraméter kulcsok
 * @returns {string} Új URL
 */
export function removeQueryParams(url, keys) {
  if (!url || !keys) return url;

  try {
    const urlObj = new URL(url, window.location.origin);
    const keysArray = Array.isArray(keys) ? keys : [keys];

    keysArray.forEach((key) => {
      urlObj.searchParams.delete(key);
    });

    return urlObj.toString();
  } catch (error) {
    logger.error('Remove query params error', error);
    return url;
  }
}

/**
 * Relative URL létrehozása
 * @param {string} path - Path
 * @param {Object} params - Query paraméterek
 * @returns {string} Relative URL
 */
export function buildRelativeURL(path, params = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryString = buildQueryString(params);
  return `${cleanPath}${queryString}`;
}

/**
 * URL normalizálása (trailing slash, stb.)
 * @param {string} url - Az eredeti URL
 * @param {Object} options - Opciók
 * @param {boolean} options.removeTrailingSlash - Trailing slash eltávolítása (default: false)
 * @param {boolean} options.addTrailingSlash - Trailing slash hozzáadása (default: false)
 * @returns {string} Normalizált URL
 */
export function normalizeURL(url, options = {}) {
  if (!url) return url;

  const {
    removeTrailingSlash = false,
    addTrailingSlash = false
  } = options;

  let normalized = url;

  // Trailing slash kezelés
  if (removeTrailingSlash && normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  } else if (addTrailingSlash && !normalized.endsWith('/')) {
    normalized = normalized + '/';
  }

  return normalized;
}

/**
 * URL domain részének kinyerése
 * @param {string} url - Az URL
 * @returns {string} Domain (pl. 'example.com')
 */
export function getDomain(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * URL path részének kinyerése
 * @param {string} url - Az URL
 * @returns {string} Path (pl. '/users/123')
 */
export function getPath(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.pathname;
  } catch {
    return url.split('?')[0].split('#')[0];
  }
}

