// @ts-nocheck
/**
 * AI Logger - Tracks all AI interactions across the system
 * Logs prompts, responses, performance metrics, and user context
 */

import { supabase } from "@/integrations/supabase/client";

export interface AILogEntry {
  user_id?: string;
  service: "copilot" | "vault_ai" | "dp_intelligence" | "forecast_engine" | "other";
  prompt: string;
  response?: string;
  response_time_ms?: number;
  model?: string;
  tokens_used?: number;
  status: "success" | "error" | "timeout";
  error_message?: string;
  metadata?: Record<string, any>;
}

class AILogger {
  /**
   * Log an AI interaction
   */
  async log(entry: AILogEntry): Promise<void> {
    try {
      // Anonymize user_id if needed
      const anonymizedUserId = entry.user_id ? this.anonymizeUserId(entry.user_id) : null;

      const logData = {
        user_id_hash: anonymizedUserId,
        service: entry.service,
        prompt_hash: this.hashSensitiveData(entry.prompt),
        prompt_length: entry.prompt.length,
        response_length: entry.response?.length || 0,
        response_time_ms: entry.response_time_ms,
        model: entry.model,
        tokens_used: entry.tokens_used,
        status: entry.status,
        error_message: entry.error_message,
        metadata: entry.metadata || {},
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("ai_logs")
        .insert(logData);

      if (error) {
        console.error("Failed to log AI interaction:", error);
      }
    } catch (error) {
      console.error("Error in AILogger.log:", error);
    }
  }

  /**
   * Log AI interaction with timing wrapper
   */
  async logWithTiming<T>(
    service: AILogEntry["service"],
    prompt: string,
    aiCall: () => Promise<T>,
    model?: string
  ): Promise<T> {
    const startTime = Date.now();
    let status: "success" | "error" | "timeout" = "success";
    let errorMessage: string | undefined;
    let response: T;

    try {
      response = await aiCall();
      return response;
    } catch (error: any) {
      status = "error";
      errorMessage = error.message || "Unknown error";
      throw error;
    } finally {
      const responseTime = Date.now() - startTime;

      await this.log({
        service,
        prompt,
        response: response ? JSON.stringify(response).slice(0, 1000) : undefined,
        response_time_ms: responseTime,
        model,
        status,
        error_message: errorMessage,
      });
    }
  }

  /**
   * Anonymize user ID (hash with salt)
   */
  private anonymizeUserId(userId: string): string {
    // Simple hash for anonymization
    // In production, use a proper hashing algorithm
    return btoa(userId).slice(0, 16);
  }

  /**
   * Hash sensitive data to prevent storing full prompts
   */
  private hashSensitiveData(data: string): string {
    // Return first 100 chars + hash of rest
    if (data.length <= 100) return data;
    return data.slice(0, 100) + "...[" + btoa(data.slice(100)).slice(0, 20) + "]";
  }

  /**
   * Get AI logs with filters
   */
  async getLogs(filters: {
    service?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}) {
    try {
      let query = supabase
        .from("ai_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.service) {
        query = query.eq("service", filters.service);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching AI logs:", error);
      return [];
    }
  }

  /**
   * Get AI performance metrics
   */
  async getMetrics(service?: string) {
    try {
      let query = supabase
        .from("ai_logs")
        .select("response_time_ms, status, tokens_used");

      if (service) {
        query = query.eq("service", service);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          avgResponseTime: 0,
          successRate: 0,
          totalCalls: 0,
          avgTokens: 0,
        };
      }

      const totalCalls = data.length;
      const successCalls = data.filter(log => log.status === "success").length;
      const avgResponseTime = data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalCalls;
      const avgTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0) / totalCalls;

      return {
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round((successCalls / totalCalls) * 100),
        totalCalls,
        avgTokens: Math.round(avgTokens),
      };
    } catch (error) {
      console.error("Error fetching AI metrics:", error);
      return {
        avgResponseTime: 0,
        successRate: 0,
        totalCalls: 0,
        avgTokens: 0,
      };
    }
  }
}

// Export singleton instance
export const aiLogger = new AILogger();
