/**
 * Objektum kezelési utility függvények
 * Objektum manipuláció, merge, pick, omit, stb.
 */

import { createLogger } from './logger';

const logger = createLogger('ObjectUtils');

/**
 * Objektum mély másolása (deep clone)
 * @param {Object} obj - Az objektum
 * @returns {Object} Mély másolat
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * Objektumok mély egyesítése (deep merge)
 * @param {Object} target - Cél objektum
 * @param {...Object} sources - Forrás objektumok
 * @returns {Object} Egyesített objektum
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Ellenőrzi, hogy egy érték objektum-e
 * @param {*} item - Az ellenőrizendő érték
 * @returns {boolean} True, ha objektum
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Kiválasztott kulcsokkal rendelkező objektum létrehozása
 * @param {Object} obj - Forrás objektum
 * @param {Array<string>} keys - Kiválasztandó kulcsok
 * @returns {Object} Új objektum csak a kiválasztott kulcsokkal
 */
export function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(keys)) return {};
  
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Kiválasztott kulcsok nélküli objektum létrehozása
 * @param {Object} obj - Forrás objektum
 * @param {Array<string>} keys - Kihagyandó kulcsok
 * @returns {Object} Új objektum a kiválasztott kulcsok nélkül
 */
export function omit(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(keys)) return { ...obj };
  
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Objektum kulcsainak átnevezése
 * @param {Object} obj - Forrás objektum
 * @param {Object} keyMap - Kulcs leképezés { régiKulcs: újKulcs }
 * @returns {Object} Új objektum átnevezett kulcsokkal
 */
export function renameKeys(obj, keyMap) {
  if (!obj || typeof obj !== 'object') return {};
  if (!keyMap || typeof keyMap !== 'object') return { ...obj };
  
  return Object.keys(obj).reduce((result, key) => {
    const newKey = keyMap[key] || key;
    result[newKey] = obj[key];
    return result;
  }, {});
}

/**
 * Objektum összes értékének null/undefined ellenőrzése
 * @param {Object} obj - Az objektum
 * @returns {boolean} True, ha minden érték null vagy undefined
 */
export function isEmpty(obj) {
  if (!obj || typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0;
}

/**
 * Objektum összes értékének null/undefined ellenőrzése (mély ellenőrzés)
 * @param {Object} obj - Az objektum
 * @returns {boolean} True, ha minden érték null, undefined vagy üres
 */
export function isDeepEmpty(obj) {
  if (!obj || typeof obj !== 'object') return true;
  
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !isDeepEmpty(value)) {
        return false;
      }
      if (typeof value !== 'object') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Objektum összehasonlítása (mély összehasonlítás)
 * @param {Object} obj1 - Első objektum
 * @param {Object} obj2 - Második objektum
 * @returns {boolean} True, ha egyenlőek
 */
export function isEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!isEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Objektum szűrése predikátum alapján
 * @param {Object} obj - Az objektum
 * @param {Function} predicate - Szűrő függvény (key, value) => boolean
 * @returns {Object} Szűrt objektum
 */
export function filterObject(obj, predicate) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof predicate !== 'function') return { ...obj };
  
  return Object.keys(obj).reduce((result, key) => {
    if (predicate(key, obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Objektum értékeinek map-elése
 * @param {Object} obj - Az objektum
 * @param {Function} mapper - Map függvény (value, key) => újÉrték
 * @returns {Object} Új objektum map-elt értékekkel
 */
export function mapValues(obj, mapper) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof mapper !== 'function') return { ...obj };
  
  return Object.keys(obj).reduce((result, key) => {
    result[key] = mapper(obj[key], key);
    return result;
  }, {});
}

/**
 * Objektum kulcsainak map-elése
 * @param {Object} obj - Az objektum
 * @param {Function} mapper - Map függvény (key, value) => újKulcs
 * @returns {Object} Új objektum map-elt kulcsokkal
 */
export function mapKeys(obj, mapper) {
  if (!obj || typeof obj !== 'object') return {};
  if (typeof mapper !== 'function') return { ...obj };
  
  return Object.keys(obj).reduce((result, key) => {
    const newKey = mapper(key, obj[key]);
    result[newKey] = obj[key];
    return result;
  }, {});
}

/**
 * Objektum átalakítása tömbbé [key, value] párokkal
 * @param {Object} obj - Az objektum
 * @returns {Array<[string, *]>} Tömb [key, value] párokkal
 */
export function toPairs(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj);
}

/**
 * Tömb [key, value] párokból objektum létrehozása
 * @param {Array<[string, *]>} pairs - [key, value] párok tömbje
 * @returns {Object} Objektum
 */
export function fromPairs(pairs) {
  if (!Array.isArray(pairs)) return {};
  return pairs.reduce((result, [key, value]) => {
    if (key != null) {
      result[key] = value;
    }
    return result;
  }, {});
}

/**
 * Objektum invertálása (kulcsok és értékek felcserélése)
 * @param {Object} obj - Az objektum
 * @returns {Object} Invertált objektum
 */
export function invert(obj) {
  if (!obj || typeof obj !== 'object') return {};
  
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    if (value != null && typeof value !== 'object') {
      result[String(value)] = key;
    }
    return result;
  }, {});
}

/**
 * Objektum mélységének meghatározása
 * @param {Object} obj - Az objektum
 * @returns {number} Mélység (0 ha nincs beágyazott objektum)
 */
export function getDepth(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  
  let depth = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const childDepth = getDepth(obj[key]);
      depth = Math.max(depth, childDepth + 1);
    }
  }
  return depth;
}

/**
 * Objektum kulcsának elérése ponttal elválasztott útvonal alapján
 * @param {Object} obj - Az objektum
 * @param {string} path - Útvonal (pl. 'user.profile.name')
 * @param {*} defaultValue - Alapértelmezett érték, ha nem található
 * @returns {*} Az érték vagy defaultValue
 */
export function get(obj, path, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue;
  if (!path || typeof path !== 'string') return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Objektum értékének beállítása ponttal elválasztott útvonal alapján
 * @param {Object} obj - Az objektum
 * @param {string} path - Útvonal (pl. 'user.profile.name')
 * @param {*} value - Beállítandó érték
 * @returns {Object} Módosított objektum
 */
export function set(obj, path, value) {
  if (!obj || typeof obj !== 'object') return obj;
  if (!path || typeof path !== 'string') return obj;
  
  const keys = path.split('.');
  const result = deepClone(obj);
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Objektum összes kulcsának és értékének stringgé alakítása (debugging)
 * @param {Object} obj - Az objektum
 * @param {number} maxDepth - Maximális mélység (default: 3)
 * @returns {string} String reprezentáció
 */
export function stringify(obj, maxDepth = 3) {
  if (maxDepth <= 0) return '...';
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj !== 'object') return String(obj);
  
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  
  const pairs = keys.slice(0, 10).map(key => {
    const value = obj[key];
    const valueStr = typeof value === 'object' 
      ? stringify(value, maxDepth - 1)
      : String(value);
    return `${key}: ${valueStr}`;
  });
  
  const suffix = keys.length > 10 ? ` ... (+${keys.length - 10} more)` : '';
  return `{ ${pairs.join(', ')}${suffix} }`;
}
