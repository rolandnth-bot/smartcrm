import { useState, useCallback } from 'react';
import { copyToClipboard, readFromClipboard, isClipboardSupported, checkClipboardPermission } from '../utils/clipboard';
import useToastStore from '../stores/toastStore';

/**
 * Hook a clipboard kezeléséhez
 * @param {Object} options - Opciók
 * @param {boolean} options.showToast - Toast üzenet megjelenítése (default: true)
 * @param {string} options.successMessage - Sikeres üzenet
 * @returns {Object} { copy, read, isSupported, permission, copied }
 */
export function useClipboard(options = {}) {
  const [copied, setCopied] = useState(false);
  const [isSupported, setIsSupported] = useState(() => isClipboardSupported());
  const [permission, setPermission] = useState('prompt');

  // Permission ellenrzés
  const checkPermission = useCallback(async () => {
    const perm = await checkClipboardPermission();
    setPermission(perm);
    return perm;
  }, []);

  // Másolás
  const copy = useCallback(async (text, customOptions = {}) => {
    if (!text) {
      useToastStore.getState().error('Nincs másolandó szöveg');
      return false;
    }

    const mergedOptions = { ...options, ...customOptions };
    const success = await copyToClipboard(text, mergedOptions);

    if (success) {
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }

    return success;
  }, [options]);

  // Olvasás
  const read = useCallback(async () => {
    const text = await readFromClipboard();
    return text;
  }, []);

  return {
    copy,
    read,
    isSupported,
    permission,
    checkPermission,
    copied
  };
}

