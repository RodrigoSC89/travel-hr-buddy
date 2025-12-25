/**
 * useAutoHealing Hook
 * React hook for interacting with the auto-healing system
 */

import { useState, useEffect, useCallback } from "react";
import {
  healthMonitor,
  autoHealer,
  type SystemDiagnostic,
  type SystemIssue,
  type AppliedFix,
  type HealingEvent,
  type ModuleHealth,
} from "@/lib/auto-healing";

interface AutoHealingState {
  diagnostic: SystemDiagnostic | null;
  issues: SystemIssue[];
  fixes: AppliedFix[];
  isHealthy: boolean;
  isMonitoring: boolean;
}

interface AutoHealingActions {
  refreshDiagnostic: () => Promise<void>;
  reportIssue: (params: {
    type: SystemIssue["type"];
    module: string;
    description: string;
  }) => void;
  getModuleHealth: (moduleId: string) => ModuleHealth | undefined;
  enableAutoFix: (enabled: boolean) => void;
}

export function useAutoHealing(): AutoHealingState & AutoHealingActions {
  const [state, setState] = useState<AutoHealingState>({
    diagnostic: null,
    issues: [],
    fixes: [],
    isHealthy: true,
    isMonitoring: false,
  });

  // Subscribe to health monitor updates
  useEffect(() => {
    const unsubscribe = healthMonitor.subscribe((diagnostic) => {
      setState((prev) => ({
        ...prev,
        diagnostic,
        issues: diagnostic.activeIssues,
        isHealthy: diagnostic.overallHealth === "healthy",
        isMonitoring: true,
      }));
    });

    // Subscribe to healer events for fixes
    const unsubscribeHealer = autoHealer.onEvent((event: HealingEvent) => {
      if (event.type === "fix_applied") {
        setState((prev) => ({
          ...prev,
          fixes: [...prev.fixes.slice(-19), event.data as AppliedFix],
        }));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeHealer();
    };
  }, []);

  const refreshDiagnostic = useCallback(async () => {
    const diagnostic = await healthMonitor.performHealthCheck();
    setState((prev) => ({
      ...prev,
      diagnostic,
      issues: diagnostic.activeIssues,
      isHealthy: diagnostic.overallHealth === "healthy",
    }));
  }, []);

  const reportIssue = useCallback(
    (params: { type: SystemIssue["type"]; module: string; description: string }) => {
      const issue = healthMonitor.reportIssue(params);
      setState((prev) => ({
        ...prev,
        issues: [...prev.issues, issue],
        isHealthy: false,
      }));
    },
    []
  );

  const getModuleHealth = useCallback((moduleId: string) => {
    return healthMonitor.getModule(moduleId);
  }, []);

  const enableAutoFix = useCallback((enabled: boolean) => {
    autoHealer.updateConfig({ autoFixEnabled: enabled });
  }, []);

  return {
    ...state,
    refreshDiagnostic,
    reportIssue,
    getModuleHealth,
    enableAutoFix,
  };
}

/**
 * Hook for monitoring a specific module's health
 */
export function useModuleHealth(moduleId: string) {
  const [health, setHealth] = useState<ModuleHealth | null>(null);

  useEffect(() => {
    // Initial check
    const module = healthMonitor.getModule(moduleId);
    if (module) setHealth(module);

    // Subscribe to updates
    const unsubscribe = healthMonitor.subscribe((diagnostic) => {
      const updatedModule = diagnostic.modules.find((m) => m.id === moduleId);
      if (updatedModule) {
        setHealth(updatedModule);
      }
    });

    return unsubscribe;
  }, [moduleId]);

  return health;
}

/**
 * Hook for healing events
 */
export function useHealingEvents(
  onEvent?: (event: HealingEvent) => void
): HealingEvent[] {
  const [events, setEvents] = useState<HealingEvent[]>([]);

  useEffect(() => {
    const unsubscribe = autoHealer.onEvent((event) => {
      setEvents((prev) => [...prev.slice(-49), event]);
      onEvent?.(event);
    });

    return unsubscribe;
  }, [onEvent]);

  return events;
}
