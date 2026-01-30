/**
 * n8n API Service
 * n8n workflow automation platform API integráció
 */

const STORAGE_KEY = 'smartcrm_n8n_config';

/**
 * n8n konfiguráció betöltése localStorage-ból
 */
export function loadN8nConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading n8n config:', error);
  }
  return {
    url: '',
    apiKey: '',
    apiVersion: 'v1',
    enabled: false
  };
}

/**
 * n8n konfiguráció mentése localStorage-ba
 */
export function saveN8nConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving n8n config:', error);
    return false;
  }
}

/**
 * n8n API kapcsolat tesztelése
 * @param {string} url - n8n instance URL (pl. http://localhost:5678 vagy https://n8n.example.com)
 * @param {string} apiKey - n8n API Key
 * @param {string} apiVersion - API verzió (default: v1)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function testN8nConnection(url, apiKey, apiVersion = 'v1') {
  if (!url || !apiKey) {
    return {
      success: false,
      message: 'n8n URL és API Key megadása kötelez'
    };
  }

  // URL normalizálás (trailing slash eltávolítása)
  const baseUrl = url.trim().replace(/\/$/, '');
  
  // API endpoint (n8n /api/v1/me vagy /api/v1/workflows endpoint)
  const testUrl = `${baseUrl}/api/${apiVersion}/me`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 másodperc timeout

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: 'Érvénytelen API Key. Ellenrizd az API kulcsot az n8n beállításokban.'
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `n8n API hiba (${response.status}): ${errorText || response.statusText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'n8n kapcsolat sikeres!',
      data: data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Idtúllépés: Az n8n szerver nem válaszol. Ellenrizd az URL-t és a hálózati kapcsolatot.'
      };
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Hálózati hiba: Nem lehet elérni az n8n szervert. Ellenrizd az URL-t és a hálózati kapcsolatot.'
      };
    }

    return {
      success: false,
      message: `Kapcsolati hiba: ${error.message || 'Ismeretlen hiba'}`
    };
  }
}

/**
 * n8n workflow indítása
 * @param {string} workflowId - Workflow ID
 * @param {object} data - Adatok a workflow-nak
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function triggerN8nWorkflow(workflowId, data = {}) {
  const config = loadN8nConfig();
  
  if (!config.enabled || !config.url || !config.apiKey) {
    return {
      success: false,
      message: 'n8n nincs beállítva vagy nincs engedélyezve'
    };
  }

  const baseUrl = config.url.trim().replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api/${config.apiVersion || 'v1'}/workflows/${workflowId}/execute`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 másodperc timeout

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': config.apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `n8n workflow hiba (${response.status}): ${errorText || response.statusText}`
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'Workflow sikeresen indítva',
      data: result
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Idtúllépés: A workflow indítása túl sokáig tartott.'
      };
    }

    return {
      success: false,
      message: `Workflow hiba: ${error.message || 'Ismeretlen hiba'}`
    };
  }
}

/**
 * n8n workflow-ok listázása
 * @returns {Promise<{success: boolean, workflows?: Array, message?: string}>}
 */
export async function listN8nWorkflows() {
  const config = loadN8nConfig();
  
  if (!config.enabled || !config.url || !config.apiKey) {
    return {
      success: false,
      message: 'n8n nincs beállítva vagy nincs engedélyezve'
    };
  }

  const baseUrl = config.url.trim().replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api/${config.apiVersion || 'v1'}/workflows?active=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': config.apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        message: `n8n API hiba (${response.status})`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      workflows: Array.isArray(data) ? data : (data.data || [])
    };
  } catch (error) {
    return {
      success: false,
      message: `Hiba: ${error.message || 'Ismeretlen hiba'}`
    };
  }
}
