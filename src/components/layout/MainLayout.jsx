import { memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import QuickSearchModal from '../common/QuickSearchModal';
import KeyboardShortcutsModal from '../common/KeyboardShortcutsModal';
import SkipLink from '../common/SkipLink';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout = memo(({ onLogout }) => {
  // Globális billentyparancsok aktiválása
  const { 
    showQuickSearch, 
    setShowQuickSearch,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  } = useKeyboardShortcuts();

  const location = useLocation();
  const { backgroundColor } = useTheme();

  // Világos, tiszta megjelenés (mint a 2. screenshot)  fehér/világosszürke háttér
  const getBackgroundClass = () => {
    if (location.pathname === '/') {
      return 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:from-cyan-950 dark:via-teal-950 dark:to-emerald-950';
    }
    return 'bg-white dark:bg-gray-900';
  };

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${getBackgroundClass()}`}>
        <SkipLink />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Header onLogout={onLogout} />
          <main id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
      <QuickSearchModal
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
      />
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;

