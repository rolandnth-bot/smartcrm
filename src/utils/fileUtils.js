/**
 * Fájl kezelési utility függvények
 * Fájl validáció, olvasás, formázás, stb.
 */

import { APP_CONFIG } from '../config/appConfig';
import { createLogger } from './logger';
import useToastStore from '../stores/toastStore';

const logger = createLogger('FileUtils');

/**
 * Fájl méret formázása (bytes → KB, MB, GB)
 * @param {number} bytes - Fájl méret byte-ban
 * @param {number} decimals - Tizedesjegyek száma (default: 2)
 * @returns {string} Formázott méret
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Fájl típus ellenőrzése
 * @param {File} file - A fájl
 * @param {string[]} allowedTypes - Engedélyezett MIME típusok vagy kiterjesztések
 * @returns {boolean} Érvényes-e
 */
export function validateFileType(file, allowedTypes = []) {
  if (!file || !allowedTypes.length) return true;

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const fileMimeType = file.type;

  return allowedTypes.some((type) => {
    // MIME type ellenőrzés
    if (type.includes('/')) {
      return fileMimeType === type || fileMimeType.startsWith(type.split('/')[0] + '/');
    }
    // Extension ellenőrzés
    if (type.startsWith('.')) {
      return fileExtension === type.toLowerCase();
    }
    // Extension ellenőrzés (pont nélkül)
    return fileExtension === '.' + type.toLowerCase();
  });
}

/**
 * Fájl méret ellenőrzése
 * @param {File} file - A fájl
 * @param {number} maxSize - Maximum méret byte-ban (default: APP_CONFIG.upload.maxFileSize)
 * @returns {boolean} Érvényes-e
 */
export function validateFileSize(file, maxSize = null) {
  if (!file) return false;

  const max = maxSize || APP_CONFIG.upload.maxFileSize;
  return file.size <= max;
}

/**
 * Fájl validálása (típus + méret)
 * @param {File} file - A fájl
 * @param {Object} options - Opciók
 * @param {string[]} options.allowedTypes - Engedélyezett típusok
 * @param {number} options.maxSize - Maximum méret
 * @param {boolean} options.showToast - Toast üzenet megjelenítése
 * @returns {Object} { isValid, error }
 */
export function validateFile(file, options = {}) {
  const {
    allowedTypes = [],
    maxSize = null,
    showToast = true
  } = options;

  if (!file) {
    const error = 'Nincs kiválasztott fájl';
    if (showToast) {
      useToastStore.getState().error(error);
    }
    return { isValid: false, error };
  }

  // Típus ellenőrzés
  if (allowedTypes.length > 0 && !validateFileType(file, allowedTypes)) {
    const error = `A fájl típusa nem támogatott. Engedélyezett típusok: ${allowedTypes.join(', ')}`;
    if (showToast) {
      useToastStore.getState().error(error);
    }
    return { isValid: false, error };
  }

  // Méret ellenőrzés
  const max = maxSize || APP_CONFIG.upload.maxFileSize;
  if (!validateFileSize(file, max)) {
    const error = `A fájl mérete túl nagy. Maximum méret: ${formatFileSize(max)}`;
    if (showToast) {
      useToastStore.getState().error(error);
    }
    return { isValid: false, error };
  }

  return { isValid: true, error: null };
}

/**
 * Fájl olvasása FileReader-rel
 * @param {File} file - A fájl
 * @param {string} readAs - Olvasási mód ('text', 'dataURL', 'arrayBuffer', 'binaryString')
 * @returns {Promise<string|ArrayBuffer>} A fájl tartalma
 */
export function readFile(file, readAs = 'text') {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Nincs kiválasztott fájl'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      logger.error('File read error', error);
      reject(new Error('Hiba a fájl olvasása során'));
    };

    switch (readAs) {
      case 'text':
        reader.readAsText(file);
        break;
      case 'dataURL':
        reader.readAsDataURL(file);
        break;
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file);
        break;
      case 'binaryString':
        reader.readAsBinaryString(file);
        break;
      default:
        reader.readAsText(file);
    }
  });
}

/**
 * Fájl letöltése blob-ból
 * @param {Blob|string} data - A blob vagy data URL
 * @param {string} filename - Fájl név
 * @param {string} mimeType - MIME típus (default: 'application/octet-stream')
 */
export function downloadFile(data, filename, mimeType = 'application/octet-stream') {
  try {
    let blob;
    
    if (typeof data === 'string') {
      // Data URL esetén
      if (data.startsWith('data:')) {
        const response = fetch(data);
        response.then((res) => res.blob()).then((b) => {
          const url = URL.createObjectURL(b);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        });
        return;
      } else {
        // Plain text esetén
        blob = new Blob([data], { type: mimeType });
      }
    } else {
      blob = data;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('File download error', error);
    useToastStore.getState().error('Hiba a fájl letöltése során');
  }
}

/**
 * Fájl kiterjesztés lekérése
 * @param {string} filename - Fájl név
 * @returns {string} Kiterjesztés (ponttal vagy anélkül)
 */
export function getFileExtension(filename, withDot = false) {
  if (!filename) return '';
  
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  
  const ext = parts[parts.length - 1].toLowerCase();
  return withDot ? '.' + ext : ext;
}

/**
 * Fájl MIME típus meghatározása kiterjesztés alapján
 * @param {string} filename - Fájl név
 * @returns {string} MIME típus
 */
export function getMimeType(filename) {
  const ext = getFileExtension(filename, false);
  
  const mimeTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    
    // Text
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    
    // Other
    ics: 'text/calendar',
    ical: 'text/calendar'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Fájl előnézet URL létrehozása (kép esetén)
 * @param {File} file - A fájl
 * @returns {Promise<string>} Preview URL vagy null
 */
export async function createFilePreview(file) {
  if (!file) return null;

  // Csak képek esetén
  if (!file.type.startsWith('image/')) {
    return null;
  }

  try {
    return await readFile(file, 'dataURL');
  } catch (error) {
    logger.error('File preview creation error', error);
    return null;
  }
}

