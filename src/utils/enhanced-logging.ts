/**
 * Enhanced Logging System for User Actions
 * Provides comprehensive logging and debugging capabilities
 */

import { logger } from "./logger";

export interface LogEntry {
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
  userAgent: string;
  url: string;
}

/**
 * Log user action with comprehensive details
 * @param action - The action being performed
 * @param details - Optional additional details
 */
export const logUserAction = (action: string, details?: Record<string, unknown>): void => {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    action,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  logger.log("🎯 User Action:", logEntry);

  // Persist to localStorage for debugging (keep last 50)
  try {
    const logs = JSON.parse(localStorage.getItem("user-actions") || "[]");
    logs.push(logEntry);
    const recentLogs = logs.slice(-50); // Keep only last 50 logs
    localStorage.setItem("user-actions", JSON.stringify(recentLogs));
  } catch (error) {
    logger.error("Error saving log to localStorage:", error);
  }
};

/**
 * Get all stored user action logs
 * @returns Array of log entries
 */
export const getUserActionLogs = (): LogEntry[] => {
  try {
    return JSON.parse(localStorage.getItem("user-actions") || "[]");
  } catch (error) {
    logger.error("Error reading logs from localStorage:", error);
    return [];
  }
};

/**
 * Clear all stored user action logs
 */
export const clearUserActionLogs = (): void => {
  try {
    localStorage.removeItem("user-actions");
    logger.log("✅ User action logs cleared");
  } catch (error) {
    logger.error("Error clearing logs:", error);
  }
};

/**
 * Export logs as JSON file
 */
export const exportUserActionLogs = (): void => {
  try {
    const logs = getUserActionLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `user-actions-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    logger.log("✅ Logs exported successfully");
  } catch (error) {
    logger.error("Error exporting logs:", error);
  }
};
