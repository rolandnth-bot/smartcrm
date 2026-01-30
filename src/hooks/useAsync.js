import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook aszinkron mveletek kezeléséhez (API hívások, stb.)
 * @param {Function} asyncFunction - Az aszinkron függvény
 * @param {Array} deps - Dependency array (opcionális)
 * @param {Object} options - Opciók
 * @param {boolean} options.immediate - Azonnal végrehajtja-e (default: true)
 * @param {any} options.initialData - Kezdeti adat
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useAsync(asyncFunction, deps = [], options = {}) {
  const {
    immediate = true,
    initialData = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Cleanup: mounted flag
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
      
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setData(initialData);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction, initialData]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Immediate execution
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...deps]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

/**
 * Hook API hívásokhoz (useAsync wrapper)
 * @param {Function} apiCall - API hívás függvény
 * @param {Array} deps - Dependency array
 * @param {Object} options - Opciók
 * @returns {Object} { data, loading, error, refetch, reset }
 */
export function useApi(apiCall, deps = [], options = {}) {
  const asyncResult = useAsync(apiCall, deps, options);

  return {
    ...asyncResult,
    refetch: asyncResult.execute
  };
}

