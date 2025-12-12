/**
 * PATCH 548 - Distributed AI Service
 * Modularized service for distributed AI operations
 */

import type { VesselAIContext } from "@/types/ai-core";
import { logger } from "@/lib/logger";

export class DistributedAIService {
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

      // For now, create a local context (database integration to be added)
      return await this.createVesselContext(vesselId);
    } catch (error) {
      logger.error("[DistributedAI] Error in getVesselContext", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Create a new AI context for a vessel
   */
  static async createVesselContext(vesselId: string): Promise<VesselAIContext | null> {
    try {
      const context: VesselAIContext = {
        vessel_id: vesselId,
        context_id: `ctx_${vesselId}_${Date.now()}`,
        local_data: {},
        global_data: {},
        last_sync: new Date().toISOString(),
        model_version: "1.0.0",
        interaction_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      this.CONTEXT_CACHE.set(vesselId, context);
      logger.info("[DistributedAI] Context created for vessel", { vesselId, contextId: context.context_id });
      return context;
    } catch (error) {
      logger.error("[DistributedAI] Error in createVesselContext", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Update vessel context with new data
   */
  static async updateVesselContext(
    vesselId: string,
    updates: Partial<VesselAIContext>
  ): Promise<VesselAIContext | null> {
    try {
      const existing = this.CONTEXT_CACHE.get(vesselId);
      if (!existing) {
        logger.warn("[DistributedAI] Context not found for update", { vesselId });
        return null;
      }

      const updated: VesselAIContext = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      });

      this.CONTEXT_CACHE.set(vesselId, updated);
      logger.info("[DistributedAI] Context updated for vessel", { vesselId, updates: Object.keys(updates) });
      return updated;
    } catch (error) {
      logger.error("[DistributedAI] Error in updateVesselContext", error as Error, { vesselId });
      return null;
    }
  }

  /**
   * Clear context cache
   */
  static clearCache(): void {
    this.CONTEXT_CACHE.clear();
    logger.info("[DistributedAI] Context cache cleared", { cacheSize: this.CONTEXT_CACHE.size });
  }

  /**
   * Check if global sync is needed
   */
  static needsGlobalSync(): boolean {
    if (!this.lastGlobalSync) return true;
    
    const hoursSinceSync = 
      (Date.now() - this.lastGlobalSync.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceSync >= this.SYNC_INTERVAL_HOURS;
  }

  /**
   * Perform global sync
   */
  static async performGlobalSync(): Promise<boolean> {
    try {
      logger.info("[DistributedAI] Starting global sync", { contextsInCache: this.CONTEXT_CACHE.size });
      
      // Implementation for global sync would go here
      this.lastGlobalSync = new Date();
      
      logger.info("[DistributedAI] Global sync completed", { syncTime: this.lastGlobalSync.toISOString() });
      return true;
    } catch (error) {
      logger.error("[DistributedAI] Error in global sync", error as Error);
      return false;
    }
  }
}
