/**
 * Clipboard utility függvények
 * Biztonságos clipboard kezelés, error handling, fallback támogatás
 */

import useToastStore from '../stores/toastStore';
import { createLogger } from './logger';

const logger = createLogger('Clipboard');

/**
 * Szöveg másolása a vágólapra
 * @param {string} text - A másolandó szöveg
 * @param {Object} options - Opciók
 * @param {boolean} options.showToast - Toast üzenet megjelenítése (default: true)
 * @param {string} options.successMessage - Sikeres üzenet (default: 'Másolva a vágólapra')
 * @returns {Promise<boolean>} Sikeres volt-e
 */
export async function copyToClipboard(text, options = {}) {
  const {
    showToast = true,
    successMessage = 'Másolva a vágólapra'
  } = options;

  if (!text) {
    logger.warn('Empty text provided to copyToClipboard');
    return false;
  }

  try {
    // Modern Clipboard API használata
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      
      if (showToast) {
        useToastStore.getState().success(successMessage);
      }
      
      logger.debug('Text copied to clipboard', { textLength: text.length });
      return true;
    }

    // Fallback: régi módszer (execCommand)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (showToast) {
          useToastStore.getState().success(successMessage);
        }
        logger.debug('Text copied to clipboard (fallback)', { textLength: text.length });
        return true;
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (error) {
    logger.error('Failed to copy to clipboard', error);
    
    if (showToast) {
      useToastStore.getState().error('Nem sikerült a vágólapra másolni. Kérjük, másolja ki manuálisan.');
    }
    
    return false;
  }
}

/**
 * Vágólap tartalmának beolvasása
 * @returns {Promise<string|null>} A vágólap tartalma vagy null
 */
export async function readFromClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text;
    }
    
    // Fallback: nem támogatott
    logger.warn('Clipboard read not supported');
    return null;
  } catch (error) {
    logger.error('Failed to read from clipboard', error);
    return null;
  }
}

/**
 * Clipboard API támogatás ellenrzése
 * @returns {boolean} Támogatott-e
 */
export function isClipboardSupported() {
  return !!(
    (navigator.clipboard && navigator.clipboard.writeText) ||
    document.execCommand
  );
}

/**
 * Clipboard írási jogosultság ellenrzése (Permission API)
 * @returns {Promise<string>} 'granted', 'denied', vagy 'prompt'
 */
export async function checkClipboardPermission() {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'prompt'; // Nem támogatott, de próbálhatjuk
  }

  try {
    const result = await navigator.permissions.query({ name: 'clipboard-write' });
    return result.state;
  } catch (error) {
    logger.warn('Clipboard permission check failed', error);
    return 'prompt';
  }
}

