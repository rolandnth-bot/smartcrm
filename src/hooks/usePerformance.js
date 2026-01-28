import { useEffect, useRef } from 'react';

/**
 * Hook a komponens render teljesítményének méréséhez (csak development módban)
 * @param {string} componentName - A komponens neve (opcionális)
 */
export function usePerformance(componentName = 'Component') {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderCount.current += 1;
      const renderTime = performance.now() - startTime.current;
      
      if (renderCount.current === 1) {
        console.log(`[Performance] ${componentName} - Első render: ${renderTime.toFixed(2)}ms`);
      } else {
        console.warn(`[Performance] ${componentName} - Re-render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      }
      
      startTime.current = performance.now();
    }
  });

  return {
    renderCount: renderCount.current
  };
}

