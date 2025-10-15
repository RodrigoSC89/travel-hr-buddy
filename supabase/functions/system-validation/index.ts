/**
 * System Validation Edge Function
 * Server-side validation endpoint for system health checks
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationResult {
  category: string;
  name: string;
  status: "success" | "warning" | "error";
  message: string;
  duration?: number;
}

interface SystemValidationReport {
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: ValidationResult[] = [];
    const timestamp = new Date().toISOString();

    // Validate Database Connection
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      
      const dbDuration = Date.now() - dbStart;
      
      if (error) {
        results.push({
          category: "Database",
          name: "Connection Test",
          status: "error",
          message: `Database connection failed: ${error.message}`,
          duration: dbDuration,
        });
      } else {
        const status = dbDuration > 2000 ? "warning" : "success";
        results.push({
          category: "Database",
          name: "Connection Test",
          status,
          message: status === "warning" 
            ? `Database responding slowly (${dbDuration}ms)`
            : `Database connected (${dbDuration}ms)`,
          duration: dbDuration,
        });
      }
    } catch (error) {
      results.push({
        category: "Database",
        name: "Connection Test",
        status: "error",
        message: `Database check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - dbStart,
      });
    }

    // Validate Authentication System
    const authStart = Date.now();
    try {
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      const authDuration = Date.now() - authStart;
      
      if (error) {
        results.push({
          category: "Authentication",
          name: "System Check",
          status: "error",
          message: `Auth system error: ${error.message}`,
          duration: authDuration,
        });
      } else {
        results.push({
          category: "Authentication",
          name: "System Check",
          status: "success",
          message: "Auth system operational",
          duration: authDuration,
        });
      }
    } catch (error) {
      results.push({
        category: "Authentication",
        name: "System Check",
        status: "error",
        message: `Auth check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - authStart,
      });
    }

    // Validate Storage
    const storageStart = Date.now();
    try {
      const { data, error } = await supabase.storage.listBuckets();
      const storageDuration = Date.now() - storageStart;
      
      if (error) {
        results.push({
          category: "Storage",
          name: "Bucket Access",
          status: "error",
          message: `Storage access failed: ${error.message}`,
          duration: storageDuration,
        });
      } else {
        results.push({
          category: "Storage",
          name: "Bucket Access",
          status: "success",
          message: `Storage operational (${data?.length || 0} buckets)`,
          duration: storageDuration,
        });
      }
    } catch (error) {
      results.push({
        category: "Storage",
        name: "Bucket Access",
        status: "error",
        message: `Storage check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        duration: Date.now() - storageStart,
      });
    }

    // Environment Configuration Check
    const envStart = Date.now();
    const requiredEnvVars = [
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_ANON_KEY",
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));
    const envDuration = Date.now() - envStart;
    
    if (missingEnvVars.length > 0) {
      results.push({
        category: "Environment",
        name: "Configuration Check",
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
        duration: envDuration,
      });
    } else {
      results.push({
        category: "Environment",
        name: "Configuration Check",
        status: "success",
        message: "All required environment variables configured",
        duration: envDuration,
      });
    }

    // Edge Function Self-Test
    results.push({
      category: "Edge Functions",
      name: "Self Test",
      status: "success",
      message: "Edge function is operational",
      duration: 0,
    });

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

    const report: SystemValidationReport = {
      timestamp,
      overallStatus,
      healthScore,
      results,
      summary: {
        total,
        passed,
        warnings,
        errors,
      },
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("System validation error:", error);
    
    return new Response(
      JSON.stringify({
        error: "System validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
