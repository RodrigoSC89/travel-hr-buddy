/**
 * Supabase Service Integration
 * Test Supabase connection and authentication
 */

import { supabase } from "@/integrations/supabase/client";

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Test Supabase connectivity and authentication
 */
export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const startTime = Date.now();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      message: "Supabase credentials not configured",
      error: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY",
    };
  }

  try {
    // Test 1: Check if we can get session (should not crash)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        message: "Supabase session error",
        responseTime: Date.now() - startTime,
        error: sessionError.message,
      };
    }

    // Test 2: Try a simple database query (health check)
    const { error: dbError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const responseTime = Date.now() - startTime;

    // PGRST116 means no rows, which is fine for a health check
    if (dbError && dbError.code !== "PGRST116") {
      // Check for common errors
      let errorMessage = dbError.message;
      if (dbError.message.includes("JWT")) {
        errorMessage = "Invalid or expired Supabase key";
      } else if (dbError.message.includes("not found")) {
        errorMessage = "Supabase URL or table not found";
      }
      
      return {
        success: false,
        message: "Supabase database connection failed",
        responseTime,
        error: errorMessage,
      };
    }

    return {
      success: true,
      message: "Supabase connection successful",
      responseTime,
      data: {
        url: supabaseUrl,
        session: sessionData?.session ? "Active session" : "No active session",
        database: "Connected",
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to Supabase",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
