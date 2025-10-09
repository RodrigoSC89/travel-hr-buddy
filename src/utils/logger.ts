/**
 * Production-Safe Logger Utility
 * Conditionally logs based on environment to avoid console pollution in production
 */

const isDevelopment = import.meta.env.MODE === "development" || import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: any[]) => {
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: any[]) => {
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};
