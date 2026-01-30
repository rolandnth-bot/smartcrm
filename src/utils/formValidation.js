/**
 * Form validation utility - automatikus piros keret kötelez mezkhöz
 */

/**
 * Visszaadja a mez CSS osztályait validációs hibával
 * @param {boolean} hasError - Van-e hiba a mezben
 * @param {string} baseClasses - Alap CSS osztályok
 * @returns {string} CSS osztályok string
 */
export function getFieldClasses(hasError, baseClasses = '') {
  const errorClasses = hasError 
    ? 'border-red-500 dark:border-red-500' 
    : 'border-gray-300 dark:border-gray-600';
  return `${baseClasses} ${errorClasses}`.trim();
}

/**
 * Visszaadja a mez CSS osztályait validációs hibával (input/textarea/select)
 * @param {boolean} hasError - Van-e hiba a mezben
 * @param {string} defaultClasses - Alap CSS osztályok
 * @returns {string} CSS osztályok string
 */
export function getInputClasses(hasError, defaultClasses = 'w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent') {
  return getFieldClasses(hasError, defaultClasses);
}
