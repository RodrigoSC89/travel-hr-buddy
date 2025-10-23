/**
 * Monitoring System Initializer
 * Starts all monitoring and autonomy systems
 */

import { systemWatchdog } from "./SystemWatchdog";
import { metricsDaemon } from "./MetricsDaemon";
import { logsEngine } from "./LogsEngine";
import { autonomyEngine } from "@/lib/autonomy/AutonomyEngine";

let isInitialized = false;

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
  if (isInitialized) {
    console.log("🔧 Monitoring: Already initialized");
    return;
  }

  console.log("🚀 Initializing Nautilus Monitoring Stack...");

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

    logsEngine.info("system", "Sistema de monitoramento totalmente operacional", {
      components: ["LogsEngine", "SystemWatchdog", "MetricsDaemon", "AutonomyEngine"]
    });

    console.log("✅ Nautilus Monitoring Stack: ONLINE");

  } catch (error) {
    console.error("❌ Failed to initialize monitoring:", error);
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

  console.log("🛑 Stopping Nautilus Monitoring Stack...");

  try {
    autonomyEngine.stop();
    metricsDaemon.stop();
    systemWatchdog.stop();
    logsEngine.stop();

    isInitialized = false;

    console.log("✅ Nautilus Monitoring Stack: OFFLINE");
  } catch (error) {
    console.error("❌ Failed to stop monitoring:", error);
  }
}

/**
 * Check if monitoring is initialized
 */
export function isMonitoringInitialized(): boolean {
  return isInitialized;
}
