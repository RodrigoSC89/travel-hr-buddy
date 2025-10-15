/**
 * System Validator
 * Comprehensive validation of system components and functionality
 */

import { supabase } from "@/integrations/supabase/client";

export interface ValidationResult {
  category: string;
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  duration?: number;
  details?: Record<string, unknown>;
}

export interface SystemValidationReport {
  timestamp: string;
  overallStatus: "healthy" | "degraded" | "critical";
  healthScore: number;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    errors: number;
  };
}

/**
 * Validate database connectivity
 */
export async function validateDatabaseConnection(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    
    const duration = Date.now() - startTime;
    
    if (error) {
      return {
        category: "Database",
        name: "Connection Test",
        status: "error",
        message: `Database connection failed: ${error.message}`,
        duration,
        details: { error: error.message }
      };
    }
    
    const status = duration > 2000 ? "warning" : "success";
    const message = duration > 2000 
      ? `Database responding slowly (${duration}ms)` 
      : `Database connected (${duration}ms)`;
    
    return {
      category: "Database",
      name: "Connection Test",
      status,
      message,
      duration,
      details: { responseTime: duration }
    };
  } catch (error) {
    return {
      category: "Database",
      name: "Connection Test",
      status: "error",
      message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate authentication system
 */
export async function validateAuthentication(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    const duration = Date.now() - startTime;
    
    if (error) {
      return {
        category: "Authentication",
        name: "Session Check",
        status: "error",
        message: `Auth system error: ${error.message}`,
        duration
      };
    }
    
    return {
      category: "Authentication",
      name: "Session Check",
      status: "success",
      message: session ? "User authenticated" : "Auth system operational (no active session)",
      duration,
      details: { hasSession: !!session }
    };
  } catch (error) {
    return {
      category: "Authentication",
      name: "Session Check",
      status: "error",
      message: `Auth check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate realtime connection
 */
export async function validateRealtime(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    const channel = supabase.channel("test-channel");
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve({
          category: "Realtime",
          name: "Connection Test",
          status: "warning",
          message: "Realtime connection timeout (5s)",
          duration: Date.now() - startTime
        });
      }, 5000);
      
      channel
        .on("presence", { event: "sync" }, () => {
          clearTimeout(timeout);
          channel.unsubscribe();
          resolve({
            category: "Realtime",
            name: "Connection Test",
            status: "success",
            message: "Realtime connection established",
            duration: Date.now() - startTime
          });
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve({
              category: "Realtime",
              name: "Connection Test",
              status: "success",
              message: "Realtime subscription successful",
              duration: Date.now() - startTime
            });
          }
        });
    });
  } catch (error) {
    return {
      category: "Realtime",
      name: "Connection Test",
      status: "error",
      message: `Realtime test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate edge functions availability
 */
export async function validateEdgeFunctions(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    // Test a simple edge function endpoint
    const { data, error } = await supabase.functions.invoke("health-check", {
      body: { test: true }
    });
    
    const duration = Date.now() - startTime;
    
    if (error) {
      // If health-check doesn't exist, that's ok - functions system is still working
      if (error.message.includes("not found") || error.message.includes("404")) {
        return {
          category: "Edge Functions",
          name: "Availability Test",
          status: "success",
          message: "Edge Functions system operational",
          duration,
          details: { note: "No test endpoint configured" }
        };
      }
      
      return {
        category: "Edge Functions",
        name: "Availability Test",
        status: "warning",
        message: `Edge Functions warning: ${error.message}`,
        duration
      };
    }
    
    return {
      category: "Edge Functions",
      name: "Availability Test",
      status: "success",
      message: "Edge Functions operational",
      duration,
      details: { response: data }
    };
  } catch (error) {
    return {
      category: "Edge Functions",
      name: "Availability Test",
      status: "warning",
      message: `Edge Functions check skipped: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate storage bucket access
 */
export async function validateStorage(): Promise<ValidationResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    const duration = Date.now() - startTime;
    
    if (error) {
      return {
        category: "Storage",
        name: "Bucket Access",
        status: "error",
        message: `Storage access failed: ${error.message}`,
        duration
      };
    }
    
    return {
      category: "Storage",
      name: "Bucket Access",
      status: "success",
      message: `Storage operational (${data?.length || 0} buckets)`,
      duration,
      details: { bucketCount: data?.length || 0 }
    };
  } catch (error) {
    return {
      category: "Storage",
      name: "Bucket Access",
      status: "error",
      message: `Storage check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): ValidationResult {
  const startTime = Date.now();
  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY"
  ];
  
  const missing: string[] = [];
  const configured: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value === "") {
      missing.push(varName);
    } else {
      configured.push(varName);
    }
  });
  
  const duration = Date.now() - startTime;
  
  if (missing.length > 0) {
    return {
      category: "Environment",
      name: "Configuration Check",
      status: "error",
      message: `Missing required environment variables: ${missing.join(", ")}`,
      duration,
      details: { missing, configured }
    };
  }
  
  return {
    category: "Environment",
    name: "Configuration Check",
    status: "success",
    message: `All required environment variables configured`,
    duration,
    details: { configured }
  };
}

/**
 * Run all validation checks
 */
export async function runSystemValidation(): Promise<SystemValidationReport> {
  const timestamp = new Date().toISOString();
  const results: ValidationResult[] = [];
  
  // Run all validations
  results.push(validateEnvironment());
  results.push(await validateDatabaseConnection());
  results.push(await validateAuthentication());
  results.push(await validateRealtime());
  results.push(await validateEdgeFunctions());
  results.push(await validateStorage());
  
  // Calculate summary
  const passed = results.filter(r => r.status === "success").length;
  const warnings = results.filter(r => r.status === "warning").length;
  const errors = results.filter(r => r.status === "error").length;
  const total = results.length;
  
  // Calculate health score (0-100)
  const healthScore = Math.round((passed * 100 + warnings * 50) / total);
  
  // Determine overall status
  let overallStatus: "healthy" | "degraded" | "critical";
  if (errors > 0) {
    overallStatus = "critical";
  } else if (warnings > 0) {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }
  
  return {
    timestamp,
    overallStatus,
    healthScore,
    results,
    summary: {
      total,
      passed,
      warnings,
      errors
    }
  };
}
