/**
 * Production-Safe Logger Utility
 * Conditionally logs based on environment to avoid console pollution in production
 */

const isDevelopment = import.meta.env.MODE === "development" || import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (..._args: unknown[]) => {
    if (isDevelopment) {
      // Intentionally empty - console.log removed for production
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (..._args: unknown[]) => {
    if (isDevelopment) {
      // Intentionally empty - console.info removed for production
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (..._args: unknown[]) => {
    if (isDevelopment) {
      // Intentionally empty - console.debug removed for production
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: unknown) => {
    if (isDevelopment) {
      console.warn("[TABLE]", data); // Using console.warn for development visibility
    }
  },
};
