/**
 * Magyar Nemzeti Bank (MNB) Exchange Rate API Integration
 * Fetches EUR/HUF exchange rates with caching
 */

const MNB_SOAP_URL = 'https://www.mnb.hu/arfolyamok.asmx';
const CACHE_KEY = 'smartcrm_mnb_rate_cache';
const FALLBACK_RATE = 400;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch EUR/HUF exchange rate from MNB
 * @param {string|null} date - Date in YYYY-MM-DD format (defaults to today)
 * @returns {Promise<number>} Exchange rate (HUF per 1 EUR)
 */
export async function fetchMNBExchangeRate(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Step 1: Check cache
  const cached = getCachedRate(targetDate);
  if (cached !== null) {
    if (import.meta.env.DEV) {
      console.log(`MNB rate from cache for ${targetDate}:`, cached);
    }
    return cached;
  }

  try {
    // Step 2: Fetch from MNB SOAP API
    const rate = await fetchFromMNB(targetDate);

    // Step 3: Cache the result
    cacheRate(targetDate, rate);

    if (import.meta.env.DEV) {
      console.log(`MNB rate fetched for ${targetDate}:`, rate);
    }

    return rate;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('MNB API fetch failed, using fallback:', error);
    }
    return FALLBACK_RATE;
  }
}

/**
 * Fetch exchange rate from MNB SOAP API
 * @private
 */
async function fetchFromMNB(date) {
  // MNB uses YYYY-MM-DD format
  const soapRequest = buildMNBSoapRequest(date);

  const response = await fetch(MNB_SOAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.mnb.hu/webservices/GetExchangeRates'
    },
    body: soapRequest
  });

  if (!response.ok) {
    throw new Error(`MNB API HTTP error: ${response.status}`);
  }

  const xmlText = await response.text();
  const rate = parseMNBResponse(xmlText);

  if (!rate || isNaN(rate)) {
    throw new Error('Invalid rate in MNB response');
  }

  return rate;
}

/**
 * Build SOAP XML request for MNB API
 * @private
 */
function buildMNBSoapRequest(date) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <GetExchangeRates xmlns="http://www.mnb.hu/webservices/">
      <startDate>${date}</startDate>
      <endDate>${date}</endDate>
      <currencyNames>EUR</currencyNames>
    </GetExchangeRates>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Parse SOAP XML response from MNB
 * @private
 */
function parseMNBResponse(xmlText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for SOAP fault
    const fault = xmlDoc.getElementsByTagName('soap:Fault')[0];
    if (fault) {
      throw new Error('SOAP fault in MNB response');
    }

    // Extract rate from XML structure
    // Path: GetExchangeRatesResponse > GetExchangeRatesResult > MNBExchangeRates > Day > Rate
    const rateElement = xmlDoc.getElementsByTagName('Rate')[0];

    if (!rateElement) {
      throw new Error('Rate element not found in MNB response');
    }

    const rateText = rateElement.textContent || rateElement.innerText;

    // MNB returns comma-separated decimal (e.g., "398,50")
    const rate = parseFloat(rateText.replace(',', '.'));

    return rate;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('MNB XML parse error:', error);
    }
    throw new Error(`Failed to parse MNB response: ${error.message}`);
  }
}

/**
 * Get cached exchange rate
 * @private
 */
function getCachedRate(date) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[date];

    if (entry && typeof entry.rate === 'number' && entry.timestamp) {
      const age = Date.now() - entry.timestamp;

      if (age < CACHE_TTL_MS) {
        return entry.rate;
      }
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Cache read error:', e);
    }
  }

  return null;
}

/**
 * Cache exchange rate with timestamp
 * @private
 */
function cacheRate(date, rate) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

    cache[date] = {
      rate,
      timestamp: Date.now()
    };

    // Keep only last 30 days of cache to avoid localStorage bloat
    const dates = Object.keys(cache);
    if (dates.length > 30) {
      const sorted = dates.sort().reverse();
      const toKeep = sorted.slice(0, 30);
      const cleaned = {};
      toKeep.forEach(d => { cleaned[d] = cache[d]; });
      localStorage.setItem(CACHE_KEY, JSON.stringify(cleaned));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Cache write error:', e);
    }
  }
}

/**
 * Clear MNB exchange rate cache
 */
export function clearMNBCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Cache clear error:', e);
    }
  }
}

/**
 * Get current EUR/HUF rate (convenience function)
 */
export async function getCurrentEURHUFRate() {
  return fetchMNBExchangeRate();
}
