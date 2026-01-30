/**
 * Retry utility függvény API hívásokhoz
 * @param {Function} fn - A függvény, amit újra kell próbálni
 * @param {Object} options - Retry opciók
 * @param {number} options.maxRetries - Maximum próbálkozások száma (default: 3)
 * @param {number} options.delay - Késleltetés milliszekundumban (default: 1000)
 * @param {Function} options.shouldRetry - Függvény, ami meghatározza, hogy újra kell-e próbálni (default: minden hiba esetén)
 * @returns {Promise} A függvény eredménye
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = (error) => {
      // Ne próbáljuk újra 4xx hibákat (kivéve 408 timeout és 429 rate limit)
      if (error?.status >= 400 && error?.status < 500) {
        return error?.status === 408 || error?.status === 429;
      }
      // Próbáljuk újra 5xx hibákat és network hibákat
      return true;
    }
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Ha nem kell újra próbálni, vagy elértük a max próbálkozásokat
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Várunk a következ próbálkozás eltt (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

