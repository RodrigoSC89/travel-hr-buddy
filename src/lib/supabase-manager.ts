import { supabase } from "@/integrations/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Enhanced Supabase Manager with retry logic and error handling
 */
export class SupabaseManager {
  private client: SupabaseClient;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second base delay

  constructor() {
    this.client = supabase;
  }

  /**
   * Execute a Supabase operation with automatic retry on failure
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      const result = await operation();
      // Reset retry count on success
      this.retryCount = 0;
      return result;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.warn(
          `Supabase operation failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`,
          error
        );
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Get the Supabase client
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Check connection health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      
      return !error || error.code === "PGRST116"; // No rows is ok
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const supabaseManager = new SupabaseManager();
