/**
 * Auto-Healing System
 * Self-correcting, adaptive, and evolving system architecture
 */

export * from "./types";
export { healthMonitor } from "./HealthMonitor";
export { autoHealer } from "./AutoHealer";

import { healthMonitor } from "./HealthMonitor";
import { autoHealer } from "./AutoHealer";
import { Logger } from "@/lib/utils/logger";

/**
 * Initialize the auto-healing system
 */
export function initAutoHealingSystem(options?: {
  checkInterval?: number;
  autoFixEnabled?: boolean;
}): void {
  const isEnabled = import.meta.env.VITE_ENABLE_AUTO_HEALING !== "false";

  if (!isEnabled) {
    Logger.info("Auto-Healing system disabled by configuration", undefined, "AutoHealing");
    return;
  }

  // Register core modules
  healthMonitor.registerModule("router", "React Router", "route");
  healthMonitor.registerModule("auth", "Authentication", "service", ["database-connection"]);
  healthMonitor.registerModule("supabase", "Supabase Client", "integration");
  healthMonitor.registerModule("ai-core", "AI Core", "service", ["supabase"]);
  healthMonitor.registerModule("agents", "Autonomous Agents", "service", ["ai-core"]);

  // Start health monitoring
  healthMonitor.start(options?.checkInterval || 30000);

  // Configure and start auto-healer
  if (options?.autoFixEnabled !== false) {
    autoHealer.updateConfig({
      autoFixEnabled: true,
      checkInterval: 10000,
    });
    autoHealer.start();
  }

  // Listen for escalated issues and show toast
  autoHealer.onEvent((event) => {
    if (event.type === "escalated") {
      // Dispatch event for UI to handle
      window.dispatchEvent(
        new CustomEvent("toast:show", {
          detail: {
            type: "error",
            title: "Problema Detectado",
            description: (event.data as unknown as Record<string, unknown>).description as string || "O sistema detectou um problema que requer atenção.",
          },
        })
      );
    } else if (event.type === "fix_applied" && (event.data as unknown as Record<string, unknown>).success) {
      window.dispatchEvent(
        new CustomEvent("toast:show", {
          detail: {
            type: "success",
            title: "Problema Corrigido",
            description: (event.data as unknown as Record<string, unknown>).description as string || "O sistema corrigiu automaticamente um problema.",
          },
        })
      );
    }
  });

  // Global error handler integration
  window.addEventListener("error", (event) => {
    healthMonitor.reportIssue({
      type: "component_crash",
      module: "global",
      description: event.message || "Uncaught error",
      error: event.error,
      severity: "high",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    healthMonitor.reportIssue({
      type: "api_failure",
      module: "global",
      description: "Unhandled promise rejection",
      error: event.reason,
      severity: "medium",
    });
  });

  Logger.info("Auto-Healing system initialized", undefined, "AutoHealing");
}

/**
 * Shutdown the auto-healing system
 */
export function shutdownAutoHealingSystem(): void {
  healthMonitor.stop();
  autoHealer.stop();
  Logger.info("Auto-Healing system shutdown", undefined, "AutoHealing");
}
