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
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: unknown[]) => {
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: unknown[]) => {
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: unknown) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};
