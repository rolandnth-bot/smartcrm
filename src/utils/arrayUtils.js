/**
 * Array kezelési utility függvények
 * Tömb mveletek, szrés, csoportosítás, stb.
 */

import { createLogger } from './logger';

const logger = createLogger('ArrayUtils');

/**
 * Tömb egyedi elemekkel (duplikátumok eltávolítása)
 * @param {Array} array - A tömb
 * @param {Function} keyFn - Opcionális kulcs függvény (objektumok esetén)
 * @returns {Array} Egyedi elemekkel rendelkez tömb
 */
export function unique(array, keyFn = null) {
  if (!Array.isArray(array)) return [];

  if (keyFn) {
    const seen = new Set();
    return array.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return [...new Set(array)];
}

/**
 * Tömb csoportosítása kulcs alapján
 * @param {Array} array - A tömb
 * @param {Function|string} keyFn - Kulcs függvény vagy mez név
 * @returns {Object} Csoportosított objektum { key: [items] }
 */
export function groupBy(array, keyFn) {
  if (!Array.isArray(array)) return {};

  const getKey = typeof keyFn === 'string' 
    ? (item) => item[keyFn]
    : keyFn;

  return array.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Tömb rendezése több mez alapján, vagy (keyFn, order) egyszer formával
 * @param {Array} array - A tömb
 * @param {Array|Function} sortKeysOrKeyFn - [{ key, order }] vagy keyFn
 * @param {string} [order] - 'asc'|'desc' (ha keyFn formátum)
 * @returns {Array} Rendezett tömb
 */
export function sortBy(array, sortKeysOrKeyFn, order) {
  if (!Array.isArray(array)) return [];

  const getValue = (item, key) => {
    if (typeof key === 'function') return key(item);
    if (typeof key === 'string') {
      return key.split('.').reduce((obj, k) => obj?.[k], item);
    }
    return item[key];
  };

  const sortKeys = typeof sortKeysOrKeyFn === 'function' && (order === 'asc' || order === 'desc')
    ? [{ key: sortKeysOrKeyFn, order }]
    : Array.isArray(sortKeysOrKeyFn)
      ? sortKeysOrKeyFn
      : [];

  if (sortKeys.length === 0) return [...array];

  return [...array].sort((a, b) => {
    for (const { key, order: o = 'asc' } of sortKeys) {
      const aVal = getValue(a, key);
      const bVal = getValue(b, key);

      if (aVal === bVal) continue;

      const comparison = aVal < bVal ? -1 : 1;
      const result = o === 'desc' ? -comparison : comparison;

      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Tömb szétválasztása feltétel alapján
 * @param {Array} array - A tömb
 * @param {Function} predicate - Feltétel függvény
 * @returns {Array} [matching, nonMatching]
 */
export function partition(array, predicate) {
  if (!Array.isArray(array)) return [[], []];

  return array.reduce(
    (acc, item) => {
      acc[predicate(item) ? 0 : 1].push(item);
      return acc;
    },
    [[], []]
  );
}

/**
 * Tömb flattelése (mélységig)
 * @param {Array} array - A tömb
 * @param {number} depth - Mélység (default: Infinity)
 * @returns {Array} Flattened tömb
 */
export function flatten(array, depth = Infinity) {
  if (!Array.isArray(array)) return [];

  return array.flat(depth);
}

/**
 * Tömb chunk-okra bontása
 * @param {Array} array - A tömb
 * @param {number} size - Chunk méret
 * @returns {Array} Chunk-ok tömbje
 */
export function chunk(array, size) {
  if (!Array.isArray(array) || size <= 0) return [];

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Tömb elemeinek számolása feltétel alapján
 * @param {Array} array - A tömb
 * @param {Function} predicate - Feltétel függvény
 * @returns {number} Megfelel elemek száma
 */
export function countBy(array, predicate) {
  if (!Array.isArray(array)) return 0;

  return array.filter(predicate).length;
}

/**
 * Tömb elemeinek összegzése
 * @param {Array} array - A tömb
 * @param {Function|string} keyFn - Kulcs függvény vagy mez név
 * @returns {number} Összeg
 */
export function sumBy(array, keyFn) {
  if (!Array.isArray(array)) return 0;

  const getValue = typeof keyFn === 'string'
    ? (item) => item[keyFn] || 0
    : keyFn || ((item) => item);

  return array.reduce((sum, item) => {
    const value = getValue(item);
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Tömb elemeinek átlaga
 * @param {Array} array - A tömb
 * @param {Function|string} keyFn - Kulcs függvény vagy mez név
 * @returns {number} Átlag
 */
export function averageBy(array, keyFn) {
  if (!Array.isArray(array) || array.length === 0) return 0;

  const sum = sumBy(array, keyFn);
  return sum / array.length;
}

/**
 * Tömb elemeinek maximuma
 * @param {Array} array - A tömb
 * @param {Function|string} keyFn - Kulcs függvény vagy mez név
 * @returns {number|null} Maximum érték vagy null
 */
export function maxBy(array, keyFn) {
  if (!Array.isArray(array) || array.length === 0) return null;

  const getValue = typeof keyFn === 'string'
    ? (item) => item[keyFn]
    : keyFn || ((item) => item);

  return array.reduce((max, item) => {
    const value = getValue(item);
    return value > max ? value : max;
  }, getValue(array[0]));
}

/**
 * Tömb elemeinek minimuma
 * @param {Array} array - A tömb
 * @param {Function|string} keyFn - Kulcs függvény vagy mez név
 * @returns {number|null} Minimum érték vagy null
 */
export function minBy(array, keyFn) {
  if (!Array.isArray(array) || array.length === 0) return null;

  const getValue = typeof keyFn === 'string'
    ? (item) => item[keyFn]
    : keyFn || ((item) => item);

  return array.reduce((min, item) => {
    const value = getValue(item);
    return value < min ? value : min;
  }, getValue(array[0]));
}

/**
 * Tömb elemeinek véletlenszer kiválasztása
 * @param {Array} array - A tömb
 * @param {number} count - Kiválasztandó elemek száma (default: 1)
 * @returns {Array} Véletlenszeren kiválasztott elemek
 */
export function sample(array, count = 1) {
  if (!Array.isArray(array) || array.length === 0) return [];

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Tömb elemeinek keverése (shuffle)
 * @param {Array} array - A tömb
 * @returns {Array} Kevert tömb
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Tömb elemeinek eltávolítása
 * @param {Array} array - A tömb
 * @param {Function|*} predicate - Feltétel függvény vagy érték
 * @returns {Array} Új tömb eltávolított elemekkel
 */
export function remove(array, predicate) {
  if (!Array.isArray(array)) return [];

  const isFunction = typeof predicate === 'function';
  return array.filter((item, index) => {
    if (isFunction) {
      return !predicate(item, index);
    }
    return item !== predicate;
  });
}

/**
 * Tömb elemeinek beszúrása adott pozícióba
 * @param {Array} array - A tömb
 * @param {number} index - Pozíció
 * @param {*} items - Beszúrandó elemek
 * @returns {Array} Új tömb beszúrt elemekkel
 */
export function insertAt(array, index, ...items) {
  if (!Array.isArray(array)) return [];

  const newArray = [...array];
  newArray.splice(index, 0, ...items);
  return newArray;
}

/**
 * Tömb elemeinek cseréje adott pozícióban
 * @param {Array} array - A tömb
 * @param {number} index - Pozíció
 * @param {*} item - Új elem
 * @returns {Array} Új tömb cserélt elemmel
 */
export function replaceAt(array, index, item) {
  if (!Array.isArray(array)) return [];

  const newArray = [...array];
  newArray[index] = item;
  return newArray;
}

/**
 * Tömb szrése kulcs alapján
 * @param {Array} array - A tömb
 * @param {Function|string|Object} predicate - Feltétel függvény, mez név, vagy objektum
 * @returns {Array} Szrt tömb
 */
export function filterBy(array, predicate) {
  if (!Array.isArray(array)) return [];

  if (typeof predicate === 'function') {
    return array.filter(predicate);
  }

  if (typeof predicate === 'string') {
    return array.filter((item) => item[predicate]);
  }

  if (typeof predicate === 'object' && predicate !== null) {
    return array.filter((item) => {
      return Object.entries(predicate).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  return array;
}
