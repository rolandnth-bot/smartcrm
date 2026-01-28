import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import QuickSearchModal from '../common/QuickSearchModal';
import KeyboardShortcutsModal from '../common/KeyboardShortcutsModal';
import SkipLink from '../common/SkipLink';

const MainLayout = memo(({ onLogout }) => {
  // Globális billentyűparancsok aktiválása
  const { 
    showQuickSearch, 
    setShowQuickSearch,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  } = useKeyboardShortcuts();

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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

