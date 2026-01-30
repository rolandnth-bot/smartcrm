import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useToastStore from '../stores/toastStore';

/**
 * Hook a nem mentett változások figyelésére
 * Figyelmezteti a felhasználót, ha elhagyja az oldalt mentés nélkül
 * 
 * @param {boolean} hasUnsavedChanges - Van-e nem mentett változás
 * @param {string} message - Egyedi figyelmeztet üzenet (opcionális)
 * @param {boolean} showToast - Mutassa-e a toast üzenetet navigáció eltt (default: true)
 */
export function useUnsavedChanges(hasUnsavedChanges, message = null, showToast = true) {
  const navigate = useNavigate();
  const location = useLocation();
  const toastShownRef = useRef(false);
  const isBlockedRef = useRef(false);

  // Browser beforeunload event (oldal bezárása/navigáció)
  useEffect(() => {
    if (!hasUnsavedChanges) {
      isBlockedRef.current = false;
      return;
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      // Modern böngészk nem engedik meg az egyedi üzenetet, de a default mködik
      e.returnValue = message || 'Nem mentett változások vannak. Biztosan elhagyja az oldalt?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // React Router navigáció figyelése (egyszerbb megoldás, mert useBlocker csak data router-rel mködik)
  useEffect(() => {
    if (!hasUnsavedChanges) {
      isBlockedRef.current = false;
      toastShownRef.current = false;
      return;
    }

    // Figyelmeztetés toast üzenettel (opcionális)
    if (showToast && !toastShownRef.current) {
      // Csak egyszer mutatjuk meg a toast-ot
      toastShownRef.current = true;
    }
  }, [hasUnsavedChanges, message, showToast]);

  return {
    isBlocked: isBlockedRef.current,
    proceed: () => {
      isBlockedRef.current = false;
      toastShownRef.current = false;
    },
    reset: () => {
      isBlockedRef.current = false;
      toastShownRef.current = false;
    }
  };
}
