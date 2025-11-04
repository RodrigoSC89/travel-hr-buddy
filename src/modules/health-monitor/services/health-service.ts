// @ts-nocheck
// PATCH 623: Health Monitoring Service
import { supabase } from "@/integrations/supabase/client";
import type { HealthCheckResult, ServiceStatus } from "../types";

/**
 * Check Database Health
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connectivity
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        service: "database",
        status: "down",
        responseTime,
        timestamp: new Date(),
        error: error.message
      };
    }
    
    // Determine status based on response time
    const status: ServiceStatus = 
      responseTime < 100 ? "healthy" : 
        responseTime < 500 ? "degraded" : 
          "down";
    
    return {
      service: "database",
      status,
      responseTime,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      service: "database",
      status: "down",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Check Storage/Supabase Health
 */
export async function checkStorageHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Try to list buckets as a health check
    const { data, error } = await supabase.storage.listBuckets();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        service: "storage",
        status: "down",
        responseTime,
        timestamp: new Date(),
        error: error.message
      };
    }
    
    const status: ServiceStatus = 
      responseTime < 200 ? "healthy" : 
        responseTime < 1000 ? "degraded" : 
          "down";
    
    return {
      service: "storage",
      status,
      responseTime,
      timestamp: new Date(),
      metadata: {
        bucketsCount: data?.length || 0
      }
    };
  } catch (error) {
    return {
      service: "storage",
      status: "down",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Check System Resources (Browser)
 */
export async function checkSystemResources(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check memory usage if available (Chrome/Edge specific API)
    interface PerformanceMemory {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    }
    
    const perfWithMemory = performance as Performance & { memory?: PerformanceMemory };
    const memory = perfWithMemory.memory;
    
    const memoryUsage = memory 
      ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 
      : 0;
    
    const status: ServiceStatus = 
      memoryUsage < 70 ? "healthy" : 
        memoryUsage < 90 ? "degraded" : 
          "down";
    
    return {
      service: "system",
      status,
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      metadata: {
        memoryUsage: `${memoryUsage.toFixed(1)}%`,
        jsHeapSize: memory?.usedJSHeapSize,
        jsHeapLimit: memory?.jsHeapSizeLimit
      }
    };
  } catch (error) {
    return {
      service: "system",
      status: "healthy", // Default to healthy if we can't check
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      metadata: {
        note: "Memory API not available in this browser"
      }
    };
  }
}

/**
 * Check API Connectivity (Generic)
 */
export async function checkAPIConnectivity(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if we can reach the API by checking auth session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        service: "api",
        status: "degraded",
        responseTime,
        timestamp: new Date(),
        error: error.message
      };
    }
    
    const status: ServiceStatus = 
      responseTime < 100 ? "healthy" : 
        responseTime < 500 ? "degraded" : 
          "down";
    
    return {
      service: "api",
      status,
      responseTime,
      timestamp: new Date(),
      metadata: {
        authenticated: !!session
      }
    };
  } catch (error) {
    return {
      service: "api",
      status: "down",
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Run all health checks
 */
export async function runAllHealthChecks(): Promise<HealthCheckResult[]> {
  const checks = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkSystemResources(),
    checkAPIConnectivity()
  ]);
  
  return checks;
}

/**
 * Get overall system status
 */
export function getOverallStatus(results: HealthCheckResult[]): ServiceStatus {
  const hasDown = results.some(r => r.status === "down");
  const hasDegraded = results.some(r => r.status === "degraded");
  
  if (hasDown) return "down";
  if (hasDegraded) return "degraded";
  return "healthy";
}

/**
 * Log health check to database
 */
export async function logHealthCheck(result: HealthCheckResult, tenantId?: string): Promise<void> {
  try {
    // Get current user's tenant_id if not provided
    let tenant_id = tenantId;
    
    if (!tenant_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();
        
        tenant_id = profile?.tenant_id;
      }
    }
    
    await supabase
      .from("system_health_logs")
      .insert({
        service_name: result.service,
        status: result.status,
        response_time_ms: result.responseTime,
        error_message: result.error,
        metadata: result.metadata,
        checked_at: result.timestamp.toISOString(),
        tenant_id: tenant_id || null
      });
  } catch (error) {
    console.error("Failed to log health check:", error);
    // Don't throw - logging failures shouldn't break health checks
  }
}
