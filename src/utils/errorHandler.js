/**
 * Error handling utility függvények
 * Központi hibaüzenetek és hibakezelés
 */

import { ERROR_MESSAGES } from '../config/constants';
import useToastStore from '../stores/toastStore';
import { createLogger } from './logger';

const logger = createLogger('ErrorHandler');

/**
 * API hiba feldolgozása és felhasználóbarát üzenet generálása
 * @param {Error} error - A hiba objektum
 * @param {Object} options - Opciók
 * @param {boolean} options.showToast - Toast üzenet megjelenítése (default: true)
 * @param {string} options.defaultMessage - Alapértelmezett üzenet
 * @param {Function} options.onError - Callback hiba esetén
 * @returns {string} Felhasználóbarát hibaüzenet
 */
export function handleApiError(error, options = {}) {
  const {
    showToast = true,
    defaultMessage = ERROR_MESSAGES.unknown,
    onError = null
  } = options;

  let userMessage = defaultMessage;
  let errorDetails = null;

  // Hiba típus alapján üzenet generálása
  if (error?.status) {
    switch (error.status) {
      case 0:
        userMessage = ERROR_MESSAGES.network;
        break;
      case 400:
        userMessage = error?.data?.error || error?.message || ERROR_MESSAGES.validation;
        break;
      case 401:
        userMessage = ERROR_MESSAGES.unauthorized;
        break;
      case 404:
        userMessage = ERROR_MESSAGES.notFound;
        break;
      case 408:
        userMessage = ERROR_MESSAGES.timeout;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        userMessage = ERROR_MESSAGES.serverError;
        break;
      default:
        userMessage = error?.data?.error || error?.message || defaultMessage;
    }
  } else if (error?.isTimeout) {
    userMessage = ERROR_MESSAGES.timeout;
  } else if (error?.isNetworkError) {
    userMessage = ERROR_MESSAGES.network;
  } else if (error?.message) {
    userMessage = error.message;
  }

  // Error logging
  logger.error('API Error', error, {
    status: error?.status,
    message: userMessage,
    url: error?.url,
    method: error?.method
  });

  // Toast üzenet megjelenítése
  if (showToast) {
    useToastStore.getState().error(userMessage);
  }

  // Callback hívása, ha van
  if (onError && typeof onError === 'function') {
    onError(error, userMessage);
  }

  return userMessage;
}

/**
 * Validációs hiba feldolgozása
 * @param {Object} validation - Validációs eredmény objektum
 * @param {boolean} showToast - Toast üzenet megjelenítése (default: true)
 * @returns {string|null} Első hibaüzenet vagy null
 */
export function handleValidationError(validation, showToast = true) {
  if (!validation || validation.isValid) {
    return null;
  }

  const firstError = Object.values(validation.errors)[0];
  
  if (firstError && showToast) {
    useToastStore.getState().error(firstError);
  }

  return firstError || null;
}

/**
 * Form hiba kezelése
 * @param {Error} error - A hiba objektum
 * @param {Object} options - Opciók
 * @returns {string} Hibaüzenet
 */
export function handleFormError(error, options = {}) {
  const {
    showToast = true,
    field = null,
    defaultMessage = ERROR_MESSAGES.validation
  } = options;

  let message = defaultMessage;

  if (error?.message) {
    message = error.message;
  } else if (field && error?.errors?.[field]) {
    message = error.errors[field];
  }

  if (showToast) {
    useToastStore.getState().error(message);
  }

  return message;
}

/**
 * Network hiba ellenőrzése
 * @param {Error} error - A hiba objektum
 * @returns {boolean} True, ha network hiba
 */
export function isNetworkError(error) {
  return (
    error?.isNetworkError ||
    error?.status === 0 ||
    (error instanceof TypeError && error.message.includes('fetch'))
  );
}

/**
 * Timeout hiba ellenőrzése
 * @param {Error} error - A hiba objektum
 * @returns {boolean} True, ha timeout hiba
 */
export function isTimeoutError(error) {
  return error?.isTimeout || error?.status === 408 || error?.name === 'AbortError';
}

/**
 * Retry-álható hiba ellenőrzése
 * @param {Error} error - A hiba objektum
 * @returns {boolean} True, ha retry-álható
 */
export function isRetryableError(error) {
  // Network hibák retry-álhatók
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  // 5xx hibák retry-álhatók (kivéve 501, 505)
  if (error?.status >= 500 && error?.status < 600) {
    return error.status !== 501 && error.status !== 505;
  }

  // 429 (rate limit) retry-álható
  if (error?.status === 429) {
    return true;
  }

  return false;
}

/**
 * Hiba kategóriába sorolása
 * @param {Error} error - A hiba objektum
 * @returns {string} Hiba kategória ('network', 'timeout', 'validation', 'auth', 'server', 'unknown')
 */
export function categorizeError(error) {
  if (isNetworkError(error)) return 'network';
  if (isTimeoutError(error)) return 'timeout';
  if (error?.status === 400 || error?.status === 422) return 'validation';
  if (error?.status === 401 || error?.status === 403) return 'auth';
  if (error?.status >= 500) return 'server';
  return 'unknown';
}

