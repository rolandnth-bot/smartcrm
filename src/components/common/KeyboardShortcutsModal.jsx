import { useEffect, useMemo, memo } from 'react';
import Modal from './Modal';

const KeyboardShortcutsModal = memo(({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Platform-specifikus billentyű címkék
  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }, []);

  const shortcuts = useMemo(() => {
    const ctrlKey = isMac ? 'Cmd' : 'Ctrl';
    return [
      { keys: [ctrlKey, 'K'], description: 'Gyors keresés megnyitása' },
      { keys: [ctrlKey, '/'], description: 'Billentyűparancsok megjelenítése' },
      { keys: [ctrlKey, '1'], description: 'Dashboard' },
      { keys: [ctrlKey, '2'], description: 'Leadek' },
      { keys: [ctrlKey, '3'], description: 'Marketing' },
      { keys: [ctrlKey, '4'], description: 'Értékesítés' },
      { keys: [ctrlKey, '5'], description: 'Lakások' },
      { keys: [ctrlKey, '6'], description: 'Foglalások' },
      { keys: [ctrlKey, '7'], description: 'Takarítás' },
      { keys: [ctrlKey, ','], description: 'Beállítások' },
      { keys: ['Esc'], description: 'Modal bezárása' }
    ];
  }, [isMac]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Billentyűparancsok" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Használja ezeket a billentyűparancsokat a gyorsabb navigációhoz és műveletekhez.
        </p>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-gray-400">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Megjegyzés:</strong> {isMac 
              ? 'Mac gépeken a billentyűparancsok automatikusan a Cmd billentyűt használják.'
              : 'Windows/Linux gépeken használja a Ctrl billentyűt.'}
          </p>
        </div>
      </div>
    </Modal>
  );
});

KeyboardShortcutsModal.displayName = 'KeyboardShortcutsModal';

export default KeyboardShortcutsModal;
