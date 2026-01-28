/**
 * Debounce és throttle utility függvények
 */

/**
 * Debounce függvény - késlelteti a függvény végrehajtását, amíg nem telik el egy adott idő
 * @param {Function} func - A függvény, amit debounce-olni kell
 * @param {number} wait - Várakozási idő milliszekundumban
 * @param {boolean} immediate - Ha true, azonnal végrehajtja az első hívást
 * @returns {Function} Debounced függvény
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle függvény - korlátozza a függvény végrehajtásának gyakoriságát
 * @param {Function} func - A függvény, amit throttle-olni kell
 * @param {number} limit - Időkorlát milliszekundumban
 * @returns {Function} Throttled függvény
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}


