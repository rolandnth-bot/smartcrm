/**
 * Strukturált logger utility
 * Development módban logol, production módban nem
 */

const isDev = import.meta.env.DEV;

/**
 * Log szintek
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Logger osztály
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Debug log (csak development módban)
   */
  debug(message, ...args) {
    if (isDev) {
      console.debug(`[${this.context}]`, message, ...args);
    }
  }

  /**
   * Info log (csak development módban)
   */
  info(message, ...args) {
    if (isDev) {
      console.info(`[${this.context}]`, message, ...args);
    }
  }

  /**
   * Warning log (mindig logol)
   */
  warn(message, ...args) {
    console.warn(`[${this.context}]`, message, ...args);
  }

  /**
   * Error log (mindig logol)
   */
  error(message, error = null, ...args) {
    console.error(`[${this.context}]`, message, error, ...args);
    
    // Error tracking integráció lehetősége (pl. Sentry)
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * API request log
   */
  apiRequest(method, url, data = null) {
    if (isDev) {
      console.group(`[${this.context}] API Request`);
      console.log('Method:', method);
      console.log('URL:', url);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  }

  /**
   * API response log
   */
  apiResponse(method, url, response, duration = null) {
    if (isDev) {
      console.group(`[${this.context}] API Response`);
      console.log('Method:', method);
      console.log('URL:', url);
      console.log('Response:', response);
      if (duration !== null) console.log('Duration:', `${duration}ms`);
      console.groupEnd();
    }
  }

  /**
   * Performance log
   */
  performance(label, duration, ...args) {
    if (isDev) {
      const color = duration > 1000 ? 'red' : duration > 500 ? 'orange' : 'green';
      console.log(
        `%c[${this.context}] ${label}: ${duration}ms`,
        `color: ${color}`,
        ...args
      );
    }
  }
}

/**
 * Logger factory
 * @param {string} context - Logger kontextus (pl. 'API', 'Store', 'Component')
 * @returns {Logger}
 */
export function createLogger(context) {
  return new Logger(context);
}

/**
 * Default logger
 */
export const logger = createLogger('App');

/**
 * Log formatter (strukturált log objektumokhoz)
 */
export function formatLog(level, message, data = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: data.context || 'App',
    ...data
  };
}

