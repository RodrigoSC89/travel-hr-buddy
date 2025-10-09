import { useState, useEffect, useCallback } from "react";
import { integrationManager } from "@/lib/integration-manager";

/**
 * Hook to manage external service integrations
 */
export const useServiceIntegrations = () => {
  const [services, setServices] = useState(
    Array.from(integrationManager.getAllServices().entries()).map(([key, value]) => ({
      key,
      ...value,
    }))
  );
  const [isChecking, setIsChecking] = useState(false);

  const refreshServices = useCallback(() => {
    setServices(
      Array.from(integrationManager.getAllServices().entries()).map(([key, value]) => ({
        key,
        ...value,
      }))
    );
  }, []);

  const checkServiceHealth = useCallback(async (serviceName: string) => {
    setIsChecking(true);
    try {
      const result = await integrationManager.connectService(serviceName);
      refreshServices();
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    } finally {
      setIsChecking(false);
    }
  }, [refreshServices]);

  const checkAllServices = useCallback(async () => {
    setIsChecking(true);
    try {
      const serviceNames = Array.from(integrationManager.getAllServices().keys());
      await Promise.all(
        serviceNames.map((name) => integrationManager.connectService(name))
      );
      refreshServices();
    } catch (error) {
    } finally {
      setIsChecking(false);
    }
  }, [refreshServices]);

  const isServiceAvailable = useCallback((serviceName: string) => {
    return integrationManager.isServiceAvailable(serviceName);
  }, []);

  useEffect(() => {
    // Initial health check
    checkAllServices();

    // Start periodic health checks
    integrationManager.startHealthChecks(300000); // 5 minutes

    return () => {
      integrationManager.stopHealthChecks();
    };
  }, [checkAllServices]);

  return {
    services,
    isChecking,
    checkServiceHealth,
    checkAllServices,
    isServiceAvailable,
    refreshServices,
  };
};
