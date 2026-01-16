/**
 * System Health Check Service
 * Monitors database, auth, storage, and edge functions
 */
import { supabase } from "@/integrations/supabase/client";

export interface HealthStatus {
  service: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  message?: string;
  lastChecked: Date;
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "down";
  services: HealthStatus[];
  timestamp: Date;
}

// Check individual services
const checkDatabase = async (): Promise<HealthStatus> => {
  const start = performance.now();
  
  try {
    const { error } = await supabase.from("organizations").select("id").limit(1);
    const latency = performance.now() - start;
    
    if (error) {
      return {
        service: "Database",
        status: "degraded",
        latency,
        message: error.message,
        lastChecked: new Date(),
      };
    }
    
    return {
      service: "Database",
      status: latency < 500 ? "healthy" : "degraded",
      latency,
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: "Database",
      status: "down",
      latency: performance.now() - start,
      message: (error as Error).message,
      lastChecked: new Date(),
    };
  }
};

const checkAuth = async (): Promise<HealthStatus> => {
  const start = performance.now();
  
  try {
    const { error } = await supabase.auth.getSession();
    const latency = performance.now() - start;
    
    if (error) {
      return {
        service: "Authentication",
        status: "degraded",
        latency,
        message: error.message,
        lastChecked: new Date(),
      };
    }
    
    return {
      service: "Authentication",
      status: latency < 500 ? "healthy" : "degraded",
      latency,
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: "Authentication",
      status: "down",
      latency: performance.now() - start,
      message: (error as Error).message,
      lastChecked: new Date(),
    };
  }
};

const checkStorage = async (): Promise<HealthStatus> => {
  const start = performance.now();
  
  try {
    const { error } = await supabase.storage.listBuckets();
    const latency = performance.now() - start;
    
    if (error) {
      return {
        service: "Storage",
        status: "degraded",
        latency,
        message: error.message,
        lastChecked: new Date(),
      };
    }
    
    return {
      service: "Storage",
      status: latency < 1000 ? "healthy" : "degraded",
      latency,
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: "Storage",
      status: "down",
      latency: performance.now() - start,
      message: (error as Error).message,
      lastChecked: new Date(),
    };
  }
};

const checkEdgeFunctions = async (): Promise<HealthStatus> => {
  const start = performance.now();
  
  try {
    const { error } = await supabase.functions.invoke("system-health", {
      body: { check: true },
    });
    const latency = performance.now() - start;
    
    if (error) {
      return {
        service: "Edge Functions",
        status: "degraded",
        latency,
        message: error.message,
        lastChecked: new Date(),
      };
    }
    
    return {
      service: "Edge Functions",
      status: latency < 2000 ? "healthy" : "degraded",
      latency,
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      service: "Edge Functions",
      status: "degraded", // Not down, might just be the specific function
      latency: performance.now() - start,
      message: (error as Error).message,
      lastChecked: new Date(),
    };
  }
};

// Main health check function
export const checkSystemHealth = async (): Promise<SystemHealth> => {
  const [database, auth, storage, edgeFunctions] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    checkStorage(),
    checkEdgeFunctions(),
  ]);
  
  const services = [database, auth, storage, edgeFunctions];
  
  // Calculate overall status
  const downCount = services.filter((s) => s.status === "down").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  
  let overall: "healthy" | "degraded" | "down";
  if (downCount >= 2) {
    overall = "down";
  } else if (downCount > 0 || degradedCount >= 2) {
    overall = "degraded";
  } else {
    overall = "healthy";
  }
  
  return {
    overall,
    services,
    timestamp: new Date(),
  };
};

// Health check hook for React components
export const useHealthCheck = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const refresh = async () => {
    setIsLoading(true);
    try {
      const result = await checkSystemHealth();
      setHealth(result);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { health, isLoading, refresh };
};

// Need to import useState for the hook
import { useState } from "react";

// Auto health check on interval
export const startHealthMonitoring = (intervalMs = 60000) => {
  const check = async () => {
    const health = await checkSystemHealth();
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("[Health Check]", health.overall, health.services.map((s) => `${s.service}: ${s.status}`).join(", "));
    }
    
    // Send to PostHog in production
    if (health.overall !== "healthy" && !import.meta.env.DEV) {
      import("./posthog").then(({ trackEvent }) => {
        trackEvent("system_health_degraded", {
          overall: health.overall,
          services: health.services.map((s) => ({
            service: s.service,
            status: s.status,
            latency: s.latency,
          })),
        });
      });
    }
    
    return health;
  };
  
  // Initial check
  check();
  
  // Set up interval
  const intervalId = setInterval(check, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};
