import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

/**
 * Globális billentyűparancsok hook
 * 
 * Támogatott parancsok:
 * - Ctrl/Cmd + K: Gyors keresés
 * - Ctrl/Cmd + /: Billentyűparancsok megjelenítése
 * - Escape: Modal bezárása (ha van nyitva)
 * - Ctrl/Cmd + 1-7: Navigáció az oldalakhoz
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // Csak ha be van jelentkezve
    if (!isAuthenticated) return;

    // Ne akadályozzuk meg, ha input/textarea/select mezőben van a fókusz
    const target = e.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Kivéve, ha Ctrl/Cmd + K (gyors keresés)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSearch(true);
        return;
      }
      return;
    }

    // Ctrl/Cmd + K: Gyors keresés
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setShowQuickSearch(true);
      return;
    }

    // Ctrl/Cmd + /: Billentyűparancsok megjelenítése
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      setShowKeyboardShortcuts(true);
      return;
    }

    // Ctrl/Cmd + 1-7: Navigáció
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
      e.preventDefault();
      const routes = {
        '1': '/',
        '2': '/leads',
        '3': '/marketing',
        '4': '/sales',
        '5': '/apartments',
        '6': '/bookings',
        '7': '/cleaning'
      };
      const route = routes[e.key];
      if (route && location.pathname !== route) {
        navigate(route);
      }
    }

    // Ctrl/Cmd + ,: Beállítások
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault();
      if (location.pathname !== '/settings') {
        navigate('/settings');
      }
    }
  }, [navigate, location.pathname, isAuthenticated]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { 
    showQuickSearch, 
    setShowQuickSearch,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  };
};

export default useKeyboardShortcuts;

