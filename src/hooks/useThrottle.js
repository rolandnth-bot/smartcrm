import { useRef, useCallback } from 'react';

/**
 * React hook throttle callback-hez
 * @param {Function} callback - A callback függvény
 * @param {number} limit - Idkorlát milliszekundumban
 * @param {Array} deps - Dependency array
 * @returns {Function} Throttled callback
 */
export function useThrottle(callback, limit = 300, deps = []) {
  const inThrottleRef = useRef(false);
  const lastRunRef = useRef(Date.now());

  return useCallback(
    (...args) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (!inThrottleRef.current || timeSinceLastRun >= limit) {
        callback(...args);
        lastRunRef.current = now;
        inThrottleRef.current = true;

        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, limit, ...deps]
  );
}

