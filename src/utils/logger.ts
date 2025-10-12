/**
 * Production-Safe Logger Utility
 * Conditionally logs based on environment to avoid console pollution in production
 */

const isDevelopment = import.meta.env.MODE === "development" || import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: unknown) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }
};
