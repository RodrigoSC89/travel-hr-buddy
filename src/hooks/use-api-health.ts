import { useState, useEffect } from "react";
import { apiHealthMonitor } from "@/utils/api-health-monitor";

interface APIHealthStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastCheck: Date;
  responseTime?: number;
  errorCount: number;
  successCount: number;
}

/**
 * React hook to monitor API health status
 */
export const useAPIHealth = (apiName?: string) => {
  const [healthStatus, setHealthStatus] = useState<Map<string, APIHealthStatus>>(new Map());
  const [specificStatus, setSpecificStatus] = useState<APIHealthStatus | undefined>();

  useEffect(() => {
    // Subscribe to health status updates
    const unsubscribe = apiHealthMonitor.subscribe((status) => {
      setHealthStatus(status);
      
      if (apiName) {
        setSpecificStatus(status.get(apiName));
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [apiName]);

  const canMakeRequest = (api: string) => {
    return apiHealthMonitor.canMakeRequest(api);
  };

  const resetCircuitBreaker = (api: string) => {
    apiHealthMonitor.resetCircuitBreaker(api);
  };

  return {
    healthStatus,
    specificStatus: apiName ? specificStatus : undefined,
    canMakeRequest,
    resetCircuitBreaker,
    isHealthy: specificStatus?.status === "healthy",
    isDegraded: specificStatus?.status === "degraded",
    isDown: specificStatus?.status === "down",
  };
};
