import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { storageHelpers } from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Először ellenőrizzük a localStorage-t
    const savedTheme = storageHelpers.getTheme();
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Ha nincs mentett téma, akkor a system preference-t használjuk
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [backgroundColor, setBackgroundColor] = useState(() => {
    const saved = localStorage.getItem('smartcrm_bg_color');
    return saved || 'default';
  });

  // Theme változtatás kezelése
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      storageHelpers.setTheme(newTheme);
      return newTheme;
    });
  }, []);

  // Háttérszín változtatás
  const setBackgroundColorValue = useCallback((color) => {
    setBackgroundColor(color);
    localStorage.setItem('smartcrm_bg_color', color);
    // CSS változó beállítása
    document.documentElement.style.setProperty('--bg-color', color === 'default' ? '' : color);
  }, []);

  // Theme beállítása a HTML elemre
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // System preference változás figyelése
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Csak akkor változtatunk, ha nincs mentett téma
      const savedTheme = storageHelpers.getTheme();
      if (savedTheme !== 'dark' && savedTheme !== 'light') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo(() => ({ 
    theme, 
    toggleTheme, 
    backgroundColor, 
    setBackgroundColor: setBackgroundColorValue 
  }), [theme, toggleTheme, backgroundColor, setBackgroundColorValue]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;

