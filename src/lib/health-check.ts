/**
 * PATCH-601: Health Check Validation System
 * Comprehensive system health monitoring and validation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface HealthCheckResult {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  timestamp: Date;
  details?: Record<string, unknown>;
  error?: string;
}

export interface SystemHealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  uptime: number;
  lastChecked: Date;
}

/**
 * Check Supabase connection health
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: "supabase",
        status: "unhealthy",
        responseTime,
        timestamp: new Date(),
        error: error.message,
      };
    }

    return {
      service: "supabase",
      status: responseTime < 1000 ? "healthy" : "degraded",
      responseTime,
      timestamp: new Date(),
      details: { connected: true },
    };
  } catch (error) {
    return {
      service: "supabase",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check API endpoints health
 */
export async function checkAPIHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if Supabase functions are accessible
    const { data, error } = await supabase.rpc("get_system_status");

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: "api",
        status: "degraded",
        responseTime,
        timestamp: new Date(),
        details: { message: "Some endpoints may be unavailable" },
      };
    }

    return {
      service: "api",
      status: "healthy",
      responseTime,
      timestamp: new Date(),
      details: { status: data },
    };
  } catch (error) {
    return {
      service: "api",
      status: "degraded",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check authentication service health
 */
export async function checkAuthHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: "auth",
        status: "unhealthy",
        responseTime,
        timestamp: new Date(),
        error: error.message,
      };
    }

    return {
      service: "auth",
      status: "healthy",
      responseTime,
      timestamp: new Date(),
      details: {
        authenticated: !!session,
        userId: session?.user?.id,
      },
    };
  } catch (error) {
    return {
      service: "auth",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check browser storage health
 */
export async function checkStorageHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const testKey = "__health_check_test__";
    const testValue = Date.now().toString();

    // Test localStorage
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);

    const responseTime = Date.now() - startTime;

    if (retrieved !== testValue) {
      return {
        service: "storage",
        status: "degraded",
        responseTime,
        timestamp: new Date(),
        error: "localStorage read/write inconsistency",
      };
    }

    return {
      service: "storage",
      status: "healthy",
      responseTime,
      timestamp: new Date(),
      details: { localStorage: true },
    };
  } catch (error) {
    return {
      service: "storage",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Storage not available",
    };
  }
}

/**
 * Check network connectivity
 */
export async function checkNetworkHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const online = navigator.onLine;
    const responseTime = Date.now() - startTime;

    if (!online) {
      return {
        service: "network",
        status: "unhealthy",
        responseTime,
        timestamp: new Date(),
        error: "Network offline",
      };
    }

    return {
      service: "network",
      status: "healthy",
      responseTime,
      timestamp: new Date(),
      details: {
        online: true,
        effectiveType: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink,
      },
    };
  } catch (error) {
    return {
      service: "network",
      status: "degraded",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Cannot determine network status",
    };
  }
}

/**
 * Perform comprehensive system health check
 */
export async function performHealthCheck(): Promise<SystemHealthStatus> {
  logger.info("Starting system health check");

  const checks = await Promise.all([
    checkSupabaseHealth(),
    checkAPIHealth(),
    checkAuthHealth(),
    checkStorageHealth(),
    checkNetworkHealth(),
  ]);

  // Determine overall status
  const unhealthyCount = checks.filter((c) => c.status === "unhealthy").length;
  const degradedCount = checks.filter((c) => c.status === "degraded").length;

  let overall: "healthy" | "degraded" | "unhealthy";
  if (unhealthyCount > 2) {
    overall = "unhealthy";
  } else if (unhealthyCount > 0 || degradedCount > 1) {
    overall = "degraded";
  } else {
    overall = "healthy";
  }

  const result: SystemHealthStatus = {
    overall,
    checks,
    uptime: performance.now(),
    lastChecked: new Date(),
  };

  logger.info("Health check completed", { status: overall, checks: checks.length });

  // Log to Supabase if available
  try {
    await supabase.from("system_health").insert({
      status: overall,
      checks: checks,
      uptime: result.uptime,
    });
  } catch (error) {
    logger.warn("Failed to log health check to database", error);
  }

  return result;
}

/**
 * Monitor health continuously
 */
export class HealthMonitor {
  private interval: number | null = null;
  private callbacks: Array<(status: SystemHealthStatus) => void> = [];

  start(intervalMs: number = 60000): void {
    if (this.interval) {
      logger.warn("Health monitor already running");
      return;
    }

    logger.info("Starting health monitor", { intervalMs });

    // Initial check
    this.runCheck();

    // Schedule periodic checks
    this.interval = window.setInterval(() => {
      this.runCheck();
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = null;
      logger.info("Health monitor stopped");
    }
  }

  subscribe(callback: (status: SystemHealthStatus) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private async runCheck(): Promise<void> {
    try {
      const status = await performHealthCheck();
      this.callbacks.forEach((callback) => {
        try {
          callback(status);
        } catch (error) {
          logger.error("Error in health monitor callback", error);
        }
      });
    } catch (error) {
      logger.error("Error performing health check", error);
    }
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();
