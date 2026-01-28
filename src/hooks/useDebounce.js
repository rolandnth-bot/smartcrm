import { useEffect, useState, useRef } from 'react';

/**
 * React hook debounce értékhez
 * @param {any} value - Az érték, amit debounce-olni kell
 * @param {number} delay - Késleltetés milliszekundumban
 * @returns {any} Debounced érték
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook debounce callback-hez
 * @param {Function} callback - A callback függvény
 * @param {number} delay - Késleltetés milliszekundumban
 * @param {Array} deps - Dependency array (opcionális)
 * @returns {Function} Debounced callback
 */
export function useDebouncedCallback(callback, delay = 300, deps = []) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Frissítjük a callback referenciát, ha változik
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useRef((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }).current;
}

