/**
 * Hook for module integration
 * Provides easy access to cross-module communication
 */

import { useEffect, useState, useCallback } from "react";
import { moduleIntegration, IntegrationEvent, ModuleAction } from "@/services/module-integration";

export function useModuleIntegration(moduleName: string) {
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to events targeting this module
    const unsubscribe = moduleIntegration.subscribe("*", (event) => {
      if (!event.target || event.target === moduleName) {
        setEvents(prev => [...prev.slice(-99), event]);
      }
    });

    // Check module status
    moduleIntegration.checkModuleStatus(moduleName).then(status => {
      setIsConnected(status.online);
    });

    return unsubscribe;
  }, [moduleName]);

  const emit = useCallback((type: string, data: any, target?: string) => {
    moduleIntegration.emit({
      type,
      source: moduleName,
      target,
      data,
      timestamp: new Date()
    });
  }, [moduleName]);

  const execute = useCallback(async (action: string, payload?: Record<string, any>) => {
    return moduleIntegration.executeAction({
      module: moduleName,
      action,
      payload
    });
  }, [moduleName]);

  const getData = useCallback(async (targetModule: string, query?: Record<string, any>) => {
    return moduleIntegration.getModuleData(targetModule, query);
  }, []);

  const refresh = useCallback(() => {
    emit("refresh", { module: moduleName });
  }, [emit, moduleName]);

  return {
    events,
    isConnected,
    emit,
    execute,
    getData,
    refresh,
    clearEvents: () => setEvents([])
  };
}

export default useModuleIntegration;
