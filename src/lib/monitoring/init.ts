/**
 * Monitoring System Initializer - PATCH 65.0 (Optimized)
 * Lightweight initialization to prevent memory leaks
 */

import { Logger } from "@/lib/utils/logger";

let isInitialized = false;

/**
 * Initialize monitoring (lightweight version)
 * Heavy monitoring systems are disabled by default to prevent crashes
 */
export function initializeMonitoring() {
  if (isInitialized) {
    return;
  }

  // Only enable heavy monitoring if explicitly requested
  const enableHeavyMonitoring = import.meta.env.VITE_ENABLE_HEAVY_MONITORING === "true";
  
  if (enableHeavyMonitoring) {
    Logger.info("Starting heavy monitoring (enabled via env)", undefined, "MonitoringInit");
    
    try {
      // Dynamically import heavy modules only if needed
      import("./SystemWatchdog").then(({ systemWatchdog }) => {
        systemWatchdog.start();
      });
    } catch (error) {
      Logger.error("Failed to start monitoring", error, "MonitoringInit");
    }
  } else {
    Logger.info("Lightweight monitoring mode (heavy systems disabled)", undefined, "MonitoringInit");
  }

  isInitialized = true;
}

/**
 * Stop all monitoring systems
 */
export function stopMonitoring() {
  if (!isInitialized) return;
  
  // Stop systems if they were started
  import("./SystemWatchdog").then(({ systemWatchdog }) => {
    systemWatchdog.stop();
  }).catch(() => {});
  
  isInitialized = false;
}

/**
 * Check if monitoring is initialized
 */
export function isMonitoringInitialized(): boolean {
  return isInitialized;
}
