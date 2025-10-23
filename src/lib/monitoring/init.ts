/**
 * Monitoring System Initializer - PATCH 65.0
 * Starts all monitoring and autonomy systems
 */

import { systemWatchdog } from "./SystemWatchdog";
import { metricsDaemon } from "./MetricsDaemon";
import { logsEngine } from "./LogsEngine";
import { autonomyEngine } from "@/lib/autonomy/AutonomyEngine";
import { Logger } from "@/lib/utils/logger";

let isInitialized = false;

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
  if (isInitialized) {
    Logger.info("Monitoring: Already initialized", undefined, "MonitoringInit");
    return;
  }

  Logger.info("Initializing Nautilus Monitoring Stack...", undefined, "MonitoringInit");

  try {
    // Start logs engine
    logsEngine.info("system", "Logs Engine inicializado");

    // Start system watchdog
    systemWatchdog.start();
    
    // Start metrics daemon
    metricsDaemon.start();
    
    // Start autonomy engine
    autonomyEngine.start();

    isInitialized = true;

    Logger.info("Sistema de monitoramento totalmente operacional", {
      components: ["LogsEngine", "SystemWatchdog", "MetricsDaemon", "AutonomyEngine"]
    }, "MonitoringInit");

  } catch (error) {
    Logger.error("Failed to initialize monitoring", error, "MonitoringInit");
    logsEngine.error("system", "Falha ao inicializar monitoramento", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Stop all monitoring systems
 */
export function stopMonitoring() {
  if (!isInitialized) return;

  Logger.info("Stopping Nautilus Monitoring Stack...", undefined, "MonitoringInit");

  try {
    autonomyEngine.stop();
    metricsDaemon.stop();
    systemWatchdog.stop();
    logsEngine.stop();

    isInitialized = false;

    Logger.info("Nautilus Monitoring Stack: OFFLINE", undefined, "MonitoringInit");
  } catch (error) {
    Logger.error("Failed to stop monitoring", error, "MonitoringInit");
  }
}

/**
 * Check if monitoring is initialized
 */
export function isMonitoringInitialized(): boolean {
  return isInitialized;
}
