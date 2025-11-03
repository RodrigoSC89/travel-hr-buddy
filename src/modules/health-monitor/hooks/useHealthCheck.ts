// PATCH 623: Health Monitor Hook
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  runAllHealthChecks, 
  getOverallStatus, 
  logHealthCheck 
} from "../services/health-service";
import type { HealthCheckResult, SystemHealth, ServiceStatus } from "../types";
import { toast } from "sonner";

export function useHealthCheck(options?: { 
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  showToasts?: boolean;
}) {
  const { 
    autoRefresh = false, 
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    showToasts = true
  } = options || {};
  
  const [lastOverallStatus, setLastOverallStatus] = useState<ServiceStatus>("healthy");

  // Query for health checks
  const { 
    data: healthResults, 
    isLoading: isChecking, 
    error,
    refetch: runHealthCheck 
  } = useQuery({
    queryKey: ["health-check"],
    queryFn: runAllHealthChecks,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000, // 30 seconds
  });

  // Mutation for logging health checks
  const logMutation = useMutation({
    mutationFn: logHealthCheck,
    onError: (error) => {
      console.error("Failed to log health check:", error);
      // Don't show toast for logging failures to avoid spamming user
    }
  });

  // Calculate overall system health
  const systemHealth: SystemHealth | null = healthResults ? {
    overall: getOverallStatus(healthResults),
    services: healthResults,
    lastCheck: new Date()
  } : null;

  // Monitor status changes and show toasts
  useEffect(() => {
    if (systemHealth && showToasts) {
      const currentStatus = systemHealth.overall;
      
      // Only toast if status changed
      if (currentStatus !== lastOverallStatus) {
        if (currentStatus === "down") {
          toast.error("System Health Critical", {
            description: "Multiple services are experiencing issues"
          });
        } else if (currentStatus === "degraded") {
          toast.warning("System Performance Degraded", {
            description: "Some services are running slowly"
          });
        } else if (lastOverallStatus !== "healthy") {
          // Recovered
          toast.success("System Health Restored", {
            description: "All services are operating normally"
          });
        }
        
        setLastOverallStatus(currentStatus);
      }
    }
  }, [systemHealth, lastOverallStatus, showToasts]);

  // Log health checks when they complete
  useEffect(() => {
    if (healthResults && healthResults.length > 0) {
      // Log each result asynchronously (don't await)
      healthResults.forEach(result => {
        logMutation.mutate(result);
      });
    }
  }, [healthResults]);

  const getServiceByName = useCallback((name: string): HealthCheckResult | undefined => {
    return healthResults?.find(r => r.service === name);
  }, [healthResults]);

  return {
    systemHealth,
    services: healthResults || [],
    isChecking,
    error,
    runHealthCheck,
    getServiceByName
  };
}
