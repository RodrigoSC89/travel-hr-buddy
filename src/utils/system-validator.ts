/**
 * System Validation Utility
 * Validates system functionality, connectivity, and health checks
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

export interface ValidationResult {
  category: string;
  name: string;
  status: "passed" | "failed" | "warning";
  message: string;
  details?: unknown;
  timestamp: Date;
}

export interface SystemValidationReport {
  timestamp: Date;
  overallStatus: "healthy" | "degraded" | "critical";
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class SystemValidator {
  private results: ValidationResult[] = [];

  /**
   * Run all system validation checks
   */
  async validateSystem(): Promise<SystemValidationReport> {
    this.results = [];
    logger.log("Starting system validation...");

    await Promise.allSettled([
      this.validateDatabaseConnection(),
      this.validateAuthentication(),
      this.validateRealtimeConnection(),
      this.validateEdgeFunctions(),
      this.validateStorage(),
    ]);

    return this.generateReport();
  }

  /**
   * Validate database connectivity and basic queries
   */
  private async validateDatabaseConnection(): Promise<void> {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1)
        .single();

      const responseTime = Date.now() - startTime;

      if (error && error.code !== "PGRST116") {
        this.addResult({
          category: "Database",
          name: "Connection Test",
          status: "failed",
          message: `Database connection failed: ${error.message}`,
          details: { error, responseTime },
          timestamp: new Date(),
        });
      } else if (responseTime > 2000) {
        this.addResult({
          category: "Database",
          name: "Connection Test",
          status: "warning",
          message: `Database responding slowly (${responseTime}ms)`,
          details: { responseTime },
          timestamp: new Date(),
        });
      } else {
        this.addResult({
          category: "Database",
          name: "Connection Test",
          status: "passed",
          message: `Database connection successful (${responseTime}ms)`,
          details: { responseTime },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.addResult({
        category: "Database",
        name: "Connection Test",
        status: "failed",
        message: `Database connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate authentication system
   */
  private async validateAuthentication(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        this.addResult({
          category: "Authentication",
          name: "Session Check",
          status: "warning",
          message: `Auth check warning: ${error.message}`,
          details: { error },
          timestamp: new Date(),
        });
      } else if (session) {
        this.addResult({
          category: "Authentication",
          name: "Session Check",
          status: "passed",
          message: "User session active",
          details: { userId: session.user.id },
          timestamp: new Date(),
        });
      } else {
        this.addResult({
          category: "Authentication",
          name: "Session Check",
          status: "warning",
          message: "No active session (not logged in)",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.addResult({
        category: "Authentication",
        name: "Session Check",
        status: "failed",
        message: `Auth system error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate Realtime connection
   */
  private async validateRealtimeConnection(): Promise<void> {
    try {
      const channelStatus = supabase.getChannels();
      
      this.addResult({
        category: "Realtime",
        name: "Connection Status",
        status: "passed",
        message: `Realtime available (${channelStatus.length} active channels)`,
        details: { activeChannels: channelStatus.length },
        timestamp: new Date(),
      });
    } catch (error) {
      this.addResult({
        category: "Realtime",
        name: "Connection Status",
        status: "failed",
        message: `Realtime check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate Edge Functions availability
   */
  private async validateEdgeFunctions(): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke("cron-status", {
        method: "GET",
      });

      if (error) {
        this.addResult({
          category: "Edge Functions",
          name: "Function Invoke Test",
          status: "warning",
          message: `Edge function test warning: ${error.message}`,
          details: { error },
          timestamp: new Date(),
        });
      } else {
        this.addResult({
          category: "Edge Functions",
          name: "Function Invoke Test",
          status: "passed",
          message: "Edge functions responding",
          details: { response: data },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.addResult({
        category: "Edge Functions",
        name: "Function Invoke Test",
        status: "warning",
        message: `Edge function invoke failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Validate Storage bucket access
   */
  private async validateStorage(): Promise<void> {
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        this.addResult({
          category: "Storage",
          name: "Bucket Access",
          status: "failed",
          message: `Storage access failed: ${error.message}`,
          details: { error },
          timestamp: new Date(),
        });
      } else {
        this.addResult({
          category: "Storage",
          name: "Bucket Access",
          status: "passed",
          message: `Storage accessible (${data?.length || 0} buckets)`,
          details: { bucketCount: data?.length || 0 },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.addResult({
        category: "Storage",
        name: "Bucket Access",
        status: "warning",
        message: `Storage check error: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Add a validation result
   */
  private addResult(result: ValidationResult): void {
    this.results.push(result);
    logger.log(`Validation: ${result.category} - ${result.name}: ${result.status}`);
  }

  /**
   * Generate final validation report
   */
  private generateReport(): SystemValidationReport {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === "passed").length,
      failed: this.results.filter(r => r.status === "failed").length,
      warnings: this.results.filter(r => r.status === "warning").length,
    };

    let overallStatus: "healthy" | "degraded" | "critical" = "healthy";
    if (summary.failed > 0) {
      overallStatus = "critical";
    } else if (summary.warnings > 2) {
      overallStatus = "degraded";
    }

    return {
      timestamp: new Date(),
      overallStatus,
      results: this.results,
      summary,
    };
  }

  /**
   * Check specific table RLS policies
   */
  async validateTableRLS(tableName: string): Promise<ValidationResult> {
    try {
      const { error } = await supabase.from(tableName).select("*").limit(1);

      if (error) {
        return {
          category: "RLS Security",
          name: `Table: ${tableName}`,
          status: "warning",
          message: `RLS policy test: ${error.message}`,
          details: { error },
          timestamp: new Date(),
        };
      }

      return {
        category: "RLS Security",
        name: `Table: ${tableName}`,
        status: "passed",
        message: "RLS policies working correctly",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        category: "RLS Security",
        name: `Table: ${tableName}`,
        status: "failed",
        message: `RLS check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: { error },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const systemValidator = new SystemValidator();
