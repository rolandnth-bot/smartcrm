import { useEffect } from 'react';

/**
 * Hook a dokumentum címének beállításához
 * @param {string} title - Az oldal címe
 * @param {boolean} includeAppName - Hozzáadja-e az app nevet (default: true)
 */
export function useDocumentTitle(title, includeAppName = true) {
  useEffect(() => {
    const previousTitle = document.title;
    const appName = 'SmartCRM';
    
    if (includeAppName && title) {
      document.title = `${title} - ${appName}`;
    } else if (title) {
      document.title = title;
    } else {
      document.title = appName;
    }

    // Cleanup: visszaállítja az előző címet (opcionális)
    return () => {
      document.title = previousTitle;
    };
  }, [title, includeAppName]);
}

