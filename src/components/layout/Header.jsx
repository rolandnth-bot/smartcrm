import { memo, useMemo, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { LogOut, Sun, Moon } from '../common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import AIRoliWidget from '../common/AIRoliWidget';
import SmartChatWidget from '../common/SmartChatWidget';

const Header = memo(({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, backgroundColor, setBackgroundColor } = useTheme();
  const isOnline = useOnlineStatus();
  const [showColorPicker, setShowColorPicker] = useState(false);

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
    if (path === '/email') return 'Email / Levelez';
    if (path === '/apps') return 'Apps';
    if (path === '/documents') return 'Dokumentumok';
    if (path === '/ai-assistant') return 'AI Asszisztens';
    if (path === '/smart-chat') return 'SmartChat';
    if (path === '/dashboard') return 'Dashboard';
    return 'SmartCRM';
  }, [location.pathname]);

  const handleSmartCRMClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const backgroundColors = [
    { name: 'Alapértelmezett', value: 'default', class: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800' },
    { name: 'Kék', value: '#e0f2fe', class: 'bg-blue-50 dark:bg-blue-950' },
    { name: 'Zöld', value: '#f0fdf4', class: 'bg-green-50 dark:bg-green-950' },
    { name: 'Lila', value: '#faf5ff', class: 'bg-purple-50 dark:bg-purple-950' },
    { name: 'Rózsaszín', value: '#fdf2f8', class: 'bg-pink-50 dark:bg-pink-950' },
    { name: 'Narancs', value: '#fff7ed', class: 'bg-orange-50 dark:bg-orange-950' }
  ];

  return (
    <nav className="no-print bg-gradient-to-r from-cyan-200 via-blue-200 to-emerald-200 dark:from-cyan-300 dark:via-blue-300 dark:to-emerald-300 rounded-xl shadow-2xl p-6 mb-6 text-gray-800 dark:text-gray-900" aria-label="F navigáció">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSmartCRMClick}
              className="text-gray-800 dark:text-gray-900 hover:text-gray-600 dark:hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Vissza a foldalra"
            >
              <h1 className="text-3xl font-bold mb-0">SmartCRM</h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-700">Vállalatirányítási rendszer</p>
            </button>
            <AIRoliWidget />
            {pageTitle !== 'Vállalatirányítási Rendszer' && (
              <div className="ml-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-900">{pageTitle}</p>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-1"></div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div 
              className="px-3 py-1.5 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-lg flex items-center gap-2"
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
            className="bg-white bg-opacity-50 hover:bg-opacity-70 text-gray-800 dark:text-gray-900 border-0"
            aria-label={theme === 'dark' ? 'Világos téma bekapcsolása' : 'Sötét téma bekapcsolása'}
            title={theme === 'dark' ? 'Világos téma' : 'Sötét téma'}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          {/* SmartChat Widget */}
          <SmartChatWidget />
          <Button
            onClick={onLogout}
            variant="ghost"
            className="bg-white bg-opacity-50 hover:bg-opacity-70 text-gray-800 dark:text-gray-900 border-0"
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

