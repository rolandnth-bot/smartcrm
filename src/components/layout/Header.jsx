import { memo, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { ChevronLeft, LogOut, Sun, Moon } from '../common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const Header = memo(({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'Vállalatirányítási Rendszer';
    if (path === '/leads') return 'Leadek kezelése';
    if (path === '/marketing') return 'Marketing';
    if (path === '/sales') return 'Értékesítés';
    if (path === '/projects') return 'Projektek';
    if (path === '/apartments') return 'Lakások kezelése';
    if (path === '/bookings') return 'Foglalások kezelése';
    if (path === '/cleaning') return 'Takarítás kezelése';
    if (path === '/finance') return 'Pénzügy';
    if (path === '/accounting') return 'Könyvelés';
    if (path === '/warehouse') return 'Raktárak';
    if (path === '/maintenance') return 'Karbantartás';
    if (path === '/settings') return 'Beállítások';
    if (path === '/email') return 'Email / Levelező';
    if (path === '/apps') return 'Apps';
    if (path === '/dashboard') return 'Dashboard';
    return 'SmartCRM';
  }, [location.pathname]);

  const canGoBack = useMemo(() => location.pathname !== '/', [location.pathname]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <nav className="no-print bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-xl shadow-2xl p-6 mb-6 text-white" aria-label="Fő navigáció">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {canGoBack && (
            <Button
              onClick={handleGoHome}
              variant="ghost"
              size="sm"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
              aria-label="Vissza a főoldalra"
            >
              <ChevronLeft />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">SmartCRM</h1>
            <p className="text-slate-300 text-sm">{pageTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div 
              className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              role="status"
              aria-live="polite"
              aria-label="Offline mód"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></span>
              Offline
            </div>
          )}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
            aria-label={theme === 'dark' ? 'Világos téma bekapcsolása' : 'Sötét téma bekapcsolása'}
            title={theme === 'dark' ? 'Világos téma' : 'Sötét téma'}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
            aria-label="Kijelentkezés"
          >
            <LogOut /> Kilépés
          </Button>
        </div>
      </div>
    </nav>
  );
});

Header.displayName = 'Header';

export default Header;

