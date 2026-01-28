import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseQueryParams, buildQueryString, addQueryParams, removeQueryParams } from '../utils/urlUtils';

/**
 * Hook a query paraméterek kezeléséhez
 * @param {Object} options - Opciók
 * @param {boolean} options.parseNumbers - Számok parse-olása (default: false)
 * @param {boolean} options.parseBooleans - Boolean értékek parse-olása (default: false)
 * @returns {Object} { params, setParam, setParams, removeParam, removeParams, clear, getParam, hasParam }
 */
export function useQueryParams(options = {}) {
  const {
    parseNumbers = false,
    parseBooleans = false
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useState(() => {
    const parsed = parseQueryParams(location.search);
    
    // Opcionális típus konverziók
    if (parseNumbers || parseBooleans) {
      const converted = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          converted[key] = value.map((v) => convertValue(v, parseNumbers, parseBooleans));
        } else {
          converted[key] = convertValue(value, parseNumbers, parseBooleans);
        }
      });
      return converted;
    }
    
    return parsed;
  });

  // Query paraméterek frissítése location változáskor
  useEffect(() => {
    const parsed = parseQueryParams(location.search);
    
    if (parseNumbers || parseBooleans) {
      const converted = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          converted[key] = value.map((v) => convertValue(v, parseNumbers, parseBooleans));
        } else {
          converted[key] = convertValue(value, parseNumbers, parseBooleans);
        }
      });
      setParams(converted);
    } else {
      setParams(parsed);
    }
  }, [location.search, parseNumbers, parseBooleans]);

  // Érték konverzió helper
  const convertValue = (value, parseNums, parseBools) => {
    if (parseNums && !isNaN(value) && value !== '') {
      const num = Number(value);
      if (!isNaN(num)) return num;
    }
    if (parseBools) {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return value;
  };

  // Egy paraméter beállítása
  const setParam = useCallback((key, value, options = {}) => {
    const {
      replace = false // replace: true = replaceState, false = pushState
    } = options;

    const newParams = { ...params, [key]: value };
    const queryString = buildQueryString(newParams);
    const newPath = `${location.pathname}${queryString}`;

    navigate(newPath, { replace });
  }, [params, location.pathname, navigate]);

  // Több paraméter beállítása egyszerre
  const setMultipleParams = useCallback((newParams, options = {}) => {
    const {
      replace = false,
      merge = true // merge: true = összefésülés, false = lecserélés
    } = options;

    const updatedParams = merge ? { ...params, ...newParams } : newParams;
    const queryString = buildQueryString(updatedParams);
    const newPath = `${location.pathname}${queryString}`;

    navigate(newPath, { replace });
  }, [params, location.pathname, navigate]);

  // Egy paraméter eltávolítása
  const removeParam = useCallback((key, options = {}) => {
    const { replace = false } = options;
    const newParams = { ...params };
    delete newParams[key];
    const queryString = buildQueryString(newParams);
    const newPath = `${location.pathname}${queryString}`;

    navigate(newPath, { replace });
  }, [params, location.pathname, navigate]);

  // Több paraméter eltávolítása
  const removeParams = useCallback((keys, options = {}) => {
    const { replace = false } = options;
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const newParams = { ...params };
    keysArray.forEach((key) => delete newParams[key]);
    const queryString = buildQueryString(newParams);
    const newPath = `${location.pathname}${queryString}`;

    navigate(newPath, { replace });
  }, [params, location.pathname, navigate]);

  // Összes paraméter törlése
  const clear = useCallback((options = {}) => {
    const { replace = false } = options;
    navigate(location.pathname, { replace });
  }, [location.pathname, navigate]);

  // Egy paraméter lekérése
  const getParam = useCallback((key, defaultValue = null) => {
    return params[key] ?? defaultValue;
  }, [params]);

  // Paraméter létezésének ellenőrzése
  const hasParam = useCallback((key) => {
    return key in params && params[key] !== null && params[key] !== undefined;
  }, [params]);

  return {
    params,
    setParam,
    setParams: setMultipleParams,
    removeParam,
    removeParams,
    clear,
    getParam,
    hasParam
  };
}

