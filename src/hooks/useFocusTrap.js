import { useEffect, useRef } from 'react';

/**
 * Hook a focus trap kezeléséhez (pl. modal-okban)
 * @param {boolean} isActive - Aktív-e a focus trap
 * @param {React.RefObject} containerRef - Container ref
 */
export function useFocusTrap(isActive, containerRef) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Mentjük az elz focus-t
    previousFocusRef.current = document.activeElement;

    // Fókuszálható elemek lekérése
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      return Array.from(
        containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        // Csak látható elemek
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Els elem fókuszálása
    if (firstElement) {
      firstElement.focus();
    }

    // Tab kezelés
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab (visszafelé)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (elre)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Escape kezelés (opcionális, ha van onClose callback)
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Visszaállítjuk az elz focus-t
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      
      // Visszaállítjuk az elz focus-t
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef]);
}

