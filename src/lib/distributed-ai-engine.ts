
/**
 * PATCH 167.0: Distributed AI Engine
 * Distributed AI engine with vessel-specific contexts and global synchronization
 * 
 * Each vessel runs local AI with fallback to central AI
 * Global sync occurs every 12 hours to share learnings
 * 
 * @module distributed-ai-engine
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { runOpenAI, AIEngineRequest, AIEngineResponse } from "@/ai/engine";

export interface VesselAIContext {
  vessel_id: string;
  context_id: string;
  local_data: Record<string, any>;
  global_data: Record<string, any>;
  last_sync: string;
  model_version: string;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIDecision {
  vessel_id: string;
  decision_type: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  confidence: number;
  reasoning: string;
  timestamp: string;
  model_used: "local" | "global" | "fallback";
}

/**
 * Distributed AI Engine Class
 * Manages vessel-specific AI contexts with global coordination
 */
export class DistributedAIEngine {
  private static readonly SYNC_INTERVAL_HOURS = 12;
  private static readonly CONTEXT_CACHE = new Map<string, VesselAIContext>();
  private static lastGlobalSync: Date | null = null;

  /**
   * Get or create AI context for a vessel
   */
  static async getVesselContext(vesselId: string): Promise<VesselAIContext | null> {
    try {
      // Check cache first
      if (this.CONTEXT_CACHE.has(vesselId)) {
        return this.CONTEXT_CACHE.get(vesselId) || null;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from("vessel_ai_contexts")
        .select("*")
        .eq("vessel_id", vesselId)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error("Error fetching vessel context:", error);
        return null;
      }

      if (data) {
        this.CONTEXT_CACHE.set(vesselId, data);
        return data;
      }

      // Create new context if doesn't exist
      return await this.createVesselContext(vesselId);
    } catch (error) {
      logger.error("Error in getVesselContext:", error);
      return null;
    }
  }

  /**
   * Create a new AI context for a vessel
   */
  static async createVesselContext(vesselId: string): Promise<VesselAIContext | null> {
    try {
      const context: Partial<VesselAIContext> = {
        vessel_id: vesselId,
        context_id: `ctx_${vesselId}_${Date.now()}`,
        local_data: {},
        global_data: {},
        last_sync: new Date().toISOString(),
        model_version: "1.0.0",
        interaction_count: 0
      };

      const { data, error } = await supabase
        .from("vessel_ai_contexts")
        .insert(context)
        .select()
        .single();

      if (error) {
        logger.error("Error creating vessel context:", error);
        return null;
      }

      this.CONTEXT_CACHE.set(vesselId, data);
      logger.info(`Created AI context for vessel ${vesselId}`);
      return data;
    } catch (error) {
      logger.error("Error in createVesselContext:", error);
      return null;
    }
  }

  /**
   * Run AI inference with local context + global fallback
   */
  static async runInference(
    vesselId: string,
    request: {
      prompt: string;
      context?: Record<string, any>;
      decision_type?: string;
    }
  ): Promise<AIDecision | null> {
    try {
      // Get vessel context
      const vesselContext = await this.getVesselContext(vesselId);
      if (!vesselContext) {
        logger.warn(`No context found for vessel ${vesselId}, using fallback`);
      }

      // Prepare AI request with vessel-specific context
      const aiRequest: AIEngineRequest = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(vesselId, vesselContext)
          },
          {
            role: "user",
            content: request.prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1000
      };

      // Try local AI first (using OpenAI as central for now)
      let response: AIEngineResponse;
      let modelUsed: "local" | "global" | "fallback" = "local";

      try {
        response = await runOpenAI(aiRequest);
      } catch (error) {
        logger.warn("Local AI failed, falling back to central AI:", error);
        modelUsed = "fallback";
        response = await this.centralAIFallback(aiRequest);
      }

      // Parse AI response and extract confidence
      const decision: AIDecision = {
        vessel_id: vesselId,
        decision_type: request.decision_type || "general",
        input_data: {
          prompt: request.prompt,
          context: request.context || {}
        },
        output_data: {
          response: response.content,
          model: response.model
        },
        confidence: this.extractConfidence(response.content),
        reasoning: response.content,
        timestamp: new Date().toISOString(),
        model_used: modelUsed
      };

      // Store decision for learning
      await this.storeDecision(decision);

      // Update context interaction count
      if (vesselContext) {
        await this.incrementInteractionCount(vesselId);
      }

      return decision;
    } catch (error) {
      logger.error("Error in runInference:", error);
      return null;
    }
  }

  /**
   * Build system prompt with vessel-specific context
   */
  private static buildSystemPrompt(vesselId: string, context: VesselAIContext | null): string {
    const basePrompt = `You are an AI assistant for vessel ${vesselId} in the Nautilus Fleet Management System.`;
    
    const contextPrompt = context ? `

Current vessel context:
- Context ID: ${context.context_id}
- Model Version: ${context.model_version}
- Interactions: ${context.interaction_count}
- Last Sync: ${context.last_sync}

Local Knowledge:
${JSON.stringify(context.local_data, null, 2)}

Global Fleet Knowledge:
${JSON.stringify(context.global_data, null, 2)}
` : "\n\nNo specific vessel context available. Providing general guidance.";

    const behaviorPrompt = `

Expected Behavior:
- Prioritize vessel-specific safety and operational efficiency
- Consider real-time conditions and vessel capabilities
- Provide confidence levels with all recommendations
- Coordinate with other vessels when relevant
- Flag critical situations requiring human intervention
- Use maritime terminology and standards`;

    return basePrompt + contextPrompt + behaviorPrompt;
  }

  /**
   * Central AI fallback when local AI fails
   */
  private static async centralAIFallback(request: AIEngineRequest): Promise<AIEngineResponse> {
    try {
      // Modify system prompt to indicate fallback mode
      const fallbackRequest = {
        ...request,
        messages: [
          {
            role: "system" as const,
            content: "You are a central AI providing fallback support. Provide general guidance based on available information."
          },
          ...request.messages.slice(1)
        ]
      };

      return await runOpenAI(fallbackRequest);
    } catch (error) {
      logger.error("Central AI fallback failed:", error);
      // Return mock response as last resort
      return {
        content: "AI services temporarily unavailable. Please use manual procedures or contact fleet operations.",
        model: "fallback-mock",
        timestamp: new Date()
      };
    }
  }

  /**
   * Extract confidence score from AI response
   */
  private static extractConfidence(response: string): number {
    // Simple heuristic: look for confidence indicators in response
    const confidenceMatch = response.match(/confidence[:\s]+(\d+)%/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]) / 100;
    }

    // Look for certainty words
    const certainWords = ["certain", "confident", "sure", "definitely"];
    const uncertainWords = ["uncertain", "maybe", "possibly", "might"];
    
    const lowerResponse = response.toLowerCase();
    const certainCount = certainWords.filter(word => lowerResponse.includes(word)).length;
    const uncertainCount = uncertainWords.filter(word => lowerResponse.includes(word)).length;

    // Calculate confidence based on word counts
    const baseConfidence = 0.7;
    const adjustment = (certainCount - uncertainCount) * 0.1;
    return Math.max(0, Math.min(1, baseConfidence + adjustment));
  }

  /**
   * Store AI decision for learning and audit
   */
  private static async storeDecision(decision: AIDecision): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_decisions")
        .insert({
          vessel_id: decision.vessel_id,
          decision_type: decision.decision_type,
          input_data: decision.input_data,
          output_data: decision.output_data,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          model_used: decision.model_used,
          created_at: decision.timestamp
        });

      if (error) {
        logger.error("Error storing AI decision:", error);
      }
    } catch (error) {
      logger.error("Error in storeDecision:", error);
    }
  }

  /**
   * Increment interaction count for a vessel context
   */
  private static async incrementInteractionCount(vesselId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_vessel_context_interactions", {
        p_vessel_id: vesselId
      });

      if (error) {
        // If RPC doesn't exist, update directly
        const context = this.CONTEXT_CACHE.get(vesselId);
        if (context) {
          await supabase
            .from("vessel_ai_contexts")
            .update({
              interaction_count: (context.interaction_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq("vessel_id", vesselId);
        }
      }
    } catch (error) {
      logger.error("Error incrementing interaction count:", error);
    }
  }

  /**
   * Synchronize AI contexts across all vessels
   * Should be called every 12 hours
   */
  static async syncAIContexts(): Promise<{ synced: number; errors: number }> {
    try {
      logger.info("Starting global AI context synchronization...");

      // Check if sync is needed
      if (this.lastGlobalSync) {
        const hoursSinceSync = (Date.now() - this.lastGlobalSync.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSync < this.SYNC_INTERVAL_HOURS) {
          logger.info(`Sync not needed yet. Last sync was ${hoursSinceSync.toFixed(1)} hours ago.`);
          return { synced: 0, errors: 0 };
        }
      }

      // Fetch all vessel contexts
      const { data: contexts, error } = await supabase
        .from("vessel_ai_contexts")
        .select("*");

      if (error) {
        logger.error("Error fetching contexts for sync:", error);
        return { synced: 0, errors: 1 };
      }

      if (!contexts || contexts.length === 0) {
        logger.info("No contexts to sync");
        return { synced: 0, errors: 0 };
      }

      // Aggregate global knowledge from all vessels
      const globalData = this.aggregateGlobalKnowledge(contexts);

      // Update each vessel with global data
      let synced = 0;
      let errors = 0;

      for (const context of contexts) {
        try {
          const { error: updateError } = await supabase
            .from("vessel_ai_contexts")
            .update({
              global_data: globalData,
              last_sync: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("vessel_id", context.vessel_id);

          if (updateError) {
            logger.error(`Error updating context for vessel ${context.vessel_id}:`, updateError);
            errors++;
          } else {
            // Update cache
            this.CONTEXT_CACHE.set(context.vessel_id, {
              ...context,
              global_data: globalData,
              last_sync: new Date().toISOString()
            });
            synced++;
          }
        } catch (error) {
          logger.error(`Error syncing vessel ${context.vessel_id}:`, error);
          errors++;
        }
      }

      this.lastGlobalSync = new Date();
      logger.info(`AI context sync completed: ${synced} synced, ${errors} errors`);

      return { synced, errors };
    } catch (error) {
      logger.error("Error in syncAIContexts:", error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Aggregate knowledge from all vessels into global dataset
   */
  private static aggregateGlobalKnowledge(contexts: VesselAIContext[]): Record<string, any> {
    const globalData: Record<string, any> = {
      fleet_size: contexts.length,
      total_interactions: contexts.reduce((sum, ctx) => sum + (ctx.interaction_count || 0), 0),
      last_updated: new Date().toISOString(),
      shared_insights: []
    };

    // Aggregate common patterns and insights
    for (const context of contexts) {
      if (context.local_data && typeof context.local_data === "object") {
        // Extract insights that should be shared fleet-wide
        if (context.local_data.maintenance_patterns) {
          globalData.shared_insights.push({
            vessel_id: context.vessel_id,
            type: "maintenance",
            data: context.local_data.maintenance_patterns
          });
        }

        if (context.local_data.weather_observations) {
          globalData.shared_insights.push({
            vessel_id: context.vessel_id,
            type: "weather",
            data: context.local_data.weather_observations
          });
        }
      }
    }

    return globalData;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    this.CONTEXT_CACHE.clear();
    logger.info("AI context cache cleared");
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): {
    lastSync: Date | null;
    nextSync: Date | null;
    cacheSize: number;
    } {
    const nextSync = this.lastGlobalSync
      ? new Date(this.lastGlobalSync.getTime() + this.SYNC_INTERVAL_HOURS * 60 * 60 * 1000)
      : null;

    return {
      lastSync: this.lastGlobalSync,
      nextSync,
      cacheSize: this.CONTEXT_CACHE.size
    };
  }
}

// Auto-start sync scheduler if in production
if (typeof window !== "undefined" && import.meta.env.PROD) {
  // Sync every 12 hours
  setInterval(() => {
    DistributedAIEngine.syncAIContexts().catch(error => {
      logger.error("Auto-sync failed:", error);
    });
  }, DistributedAIEngine["SYNC_INTERVAL_HOURS"] * 60 * 60 * 1000);
}
