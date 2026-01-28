import { memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import QuickSearchModal from '../common/QuickSearchModal';
import KeyboardShortcutsModal from '../common/KeyboardShortcutsModal';
import SkipLink from '../common/SkipLink';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout = memo(({ onLogout }) => {
  // Globális billentyűparancsok aktiválása
  const { 
    showQuickSearch, 
    setShowQuickSearch,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  } = useKeyboardShortcuts();

  const location = useLocation();
  const { backgroundColor } = useTheme();

  // Háttérszín beállítása - türkisz/kékes/zöldes csak Dashboard-on
  const getBackgroundClass = () => {
    if (location.pathname === '/') {
      return 'bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-cyan-950 dark:via-teal-950 dark:to-emerald-950';
    }
    return 'bg-gray-100 dark:bg-gray-900';
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

