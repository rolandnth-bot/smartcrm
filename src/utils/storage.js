/**
 * LocalStorage és SessionStorage utility függvények
 * Biztonságos kezelés, error handling, JSON serialization
 */

import { STORAGE_KEYS } from '../config/constants';
import { createLogger } from './logger';

const logger = createLogger('Storage');

/**
 * LocalStorage wrapper - biztonságos kezelés
 */
export const storage = {
  /**
   * Érték mentése localStorage-ba
   * @param {string} key - Kulcs
   * @param {any} value - Érték (automatikusan JSON.stringify)
   * @returns {boolean} Sikeres volt-e
   */
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.error('Storage set error', error, { key });
      return false;
    }
  },

  /**
   * Érték lekérése localStorage-ból
   * @param {string} key - Kulcs
   * @param {any} defaultValue - Alapértelmezett érték, ha nincs vagy hiba van
   * @returns {any} Érték vagy defaultValue
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      logger.error('Storage get error', error, { key });
      return defaultValue;
    }
  },

  /**
   * Érték törlése localStorage-ból
   * @param {string} key - Kulcs
   * @returns {boolean} Sikeres volt-e
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('Storage remove error', error, { key });
      return false;
    }
  },

  /**
   * Összes érték törlése localStorage-ból
   * @returns {boolean} Sikeres volt-e
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Storage clear error', error);
      return false;
    }
  },

  /**
   * Kulcs létezésének ellenrzése
   * @param {string} key - Kulcs
   * @returns {boolean} Létezik-e
   */
  has: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      logger.error('Storage has error', error, { key });
      return false;
    }
  },

  /**
   * Összes kulcs lekérése
   * @returns {string[]} Kulcsok tömbje
   */
  keys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error('Storage keys error', error);
      return [];
    }
  }
};

/**
 * SessionStorage wrapper - biztonságos kezelés
 */
export const sessionStorage = {
  /**
   * Érték mentése sessionStorage-ba
   * @param {string} key - Kulcs
   * @param {any} value - Érték (automatikusan JSON.stringify)
   * @returns {boolean} Sikeres volt-e
   */
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.error('SessionStorage set error', error, { key });
      return false;
    }
  },

  /**
   * Érték lekérése sessionStorage-ból
   * @param {string} key - Kulcs
   * @param {any} defaultValue - Alapértelmezett érték, ha nincs vagy hiba van
   * @returns {any} Érték vagy defaultValue
   */
  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      logger.error('SessionStorage get error', error, { key });
      return defaultValue;
    }
  },

  /**
   * Érték törlése sessionStorage-ból
   * @param {string} key - Kulcs
   * @returns {boolean} Sikeres volt-e
   */
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('SessionStorage remove error', error, { key });
      return false;
    }
  },

  /**
   * Összes érték törlése sessionStorage-ból
   * @returns {boolean} Sikeres volt-e
   */
  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      logger.error('SessionStorage clear error', error);
      return false;
    }
  },

  /**
   * Kulcs létezésének ellenrzése
   * @param {string} key - Kulcs
   * @returns {boolean} Létezik-e
   */
  has: (key) => {
    try {
      return window.sessionStorage.getItem(key) !== null;
    } catch (error) {
      logger.error('SessionStorage has error', error, { key });
      return false;
    }
  }
};

/**
 * Storage támogatás ellenrzése
 * @returns {boolean} Támogatott-e localStorage/sessionStorage
 */
export function isStorageSupported() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Storage quota ellenrzése (ha támogatott)
 * @returns {Object|null} {quota, usage, available} vagy null
 */
export function getStorageInfo() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null;
  }

  return navigator.storage.estimate().then((estimate) => {
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota - estimate.usage,
      usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    };
  });
}

/**
 * Storage kulcsok helper-ek (STORAGE_KEYS használata)
 */
export const storageHelpers = {
  getTheme: () => storage.get(STORAGE_KEYS.theme, 'system'),
  setTheme: (theme) => storage.set(STORAGE_KEYS.theme, theme),
  
  getAuth: () => storage.get(STORAGE_KEYS.auth, null),
  setAuth: (auth) => storage.set(STORAGE_KEYS.auth, auth),
  clearAuth: () => storage.remove(STORAGE_KEYS.auth),
  
  getPreferences: () => storage.get(STORAGE_KEYS.preferences, {}),
  setPreferences: (preferences) => storage.set(STORAGE_KEYS.preferences, preferences),
  updatePreferences: (updates) => {
    const current = storageHelpers.getPreferences();
    storageHelpers.setPreferences({ ...current, ...updates });
  }
};

export default storage;

