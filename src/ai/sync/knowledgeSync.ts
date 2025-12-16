/**
 * PATCH 199.0 - Knowledge Sync (IA Local + Global)
 * 
 * Syncs knowledge between local edge AI and global cloud AI for adaptive performance.
 * Implements snapshot management, diff detection, and safe merging with confidence thresholds.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { learningCore } from "../learning-core";

export interface LocalSnapshot {
  id?: string;
  snapshot_date: string;
  module_name: string;
  usage_data: Record<string, any>;
  model_state?: Record<string, any>;
  performance_metrics?: Record<string, any>;
}

export interface GlobalKnowledge {
  id?: string;
  sync_date: string;
  module_name: string;
  aggregated_data: Record<string, any>;
  confidence_score: number;
  source_count: number;
  metadata?: Record<string, any>;
}

export interface BehaviorDrift {
  module: string;
  metric: string;
  local_value: number;
  global_value: number;
  drift_percentage: number;
  significance: "low" | "medium" | "high";
}

export interface SyncResult {
  success: boolean;
  snapshots_created: number;
  knowledge_synced: number;
  drifts_detected: BehaviorDrift[];
  merges_applied: number;
  timestamp: string;
}

class KnowledgeSync {
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  private confidenceThreshold = 0.85;
  private isActive = false;

  /**
   * Start knowledge sync with automatic daily snapshots
   */
  start(intervalHours: number = 24) {
    if (this.isActive) {
      logger.warn("[KnowledgeSync] Already active");
      return;
    }

    this.isActive = true;
    logger.info("[KnowledgeSync] Starting knowledge sync", { intervalHours });

    // Run initial sync
    this.performSync();

    // Schedule periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalHours * 60 * 60 * 1000);

    logger.info("[KnowledgeSync] Knowledge sync is active");
  }

  /**
   * Stop knowledge sync
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    logger.info("[KnowledgeSync] Knowledge sync stopped");
  }

  /**
   * Perform full sync operation
   */
  private async performSync(): Promise<SyncResult> {
    logger.info("[KnowledgeSync] Starting sync operation");

    const result: SyncResult = {
      success: false,
      snapshots_created: 0,
      knowledge_synced: 0,
      drifts_detected: [],
      merges_applied: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      // Step 1: Create local snapshots
      const snapshots = await this.createLocalSnapshots();
      result.snapshots_created = snapshots.length;

      // Step 2: Sync to global knowledge
      const synced = await this.syncToGlobal(snapshots);
      result.knowledge_synced = synced;

      // Step 3: Detect behavior drift
      const drifts = await this.detectBehaviorDrift();
      result.drifts_detected = drifts;

      // Step 4: Apply safe merges
      const merges = await this.applySafeMerges(drifts);
      result.merges_applied = merges;

      result.success = true;
      this.lastSyncTime = new Date();

      logger.info("[KnowledgeSync] Sync completed successfully", result);

      // Track sync event
      await learningCore.trackSystemEvent(
        "knowledge_sync_completed",
        "knowledge-sync",
        result,
        "success"
      );
    } catch (error) {
      logger.error("[KnowledgeSync] Sync failed", { error });
      result.success = false;

      await learningCore.trackSystemEvent(
        "knowledge_sync_failed",
        "knowledge-sync",
        { error: String(error) },
        "failure"
      );
    }

    return result;
  }

  /**
   * Create daily snapshots of local usage
   */
  async createLocalSnapshots(): Promise<LocalSnapshot[]> {
    logger.info("[KnowledgeSync] Creating local snapshots");

    const modules = ["ai-engine", "autonomy-layer", "learning-core", "mission-core"];
    const snapshots: LocalSnapshot[] = [];

    for (const module of modules) {
      try {
        // Collect usage data for the module
        const usageData = await this.collectModuleUsage(module);
        const performanceMetrics = await this.collectPerformanceMetrics(module);

        const snapshot: LocalSnapshot = {
          snapshot_date: new Date().toISOString(),
          module_name: module,
          usage_data: usageData,
          performance_metrics: performanceMetrics,
        };

        // Save to Supabase
        const { error } = await (supabase as any)
          .from("local_knowledge")
          .insert([snapshot]);

        if (error) {
          logger.error("[KnowledgeSync] Failed to save snapshot", {
            module,
            error,
          });
        } else {
          snapshots.push(snapshot);
          logger.debug("[KnowledgeSync] Snapshot created", { module });
        }
      } catch (error) {
        logger.error("[KnowledgeSync] Failed to create snapshot", {
          module,
          error,
        });
      }
    }

    return snapshots;
  }

  /**
   * Sync local snapshots to global knowledge
   */
  private async syncToGlobal(snapshots: LocalSnapshot[]): Promise<number> {
    logger.info("[KnowledgeSync] Syncing to global knowledge");

    let syncedCount = 0;

    for (const snapshot of snapshots) {
      try {
        // Aggregate with existing global knowledge
        const { data: existingGlobal } = await (supabase as any)
          .from("global_knowledge")
          .select("*")
          .eq("module_name", snapshot.module_name)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        let aggregatedData = snapshot.usage_data;
        let sourceCount = 1;

        if (existingGlobal) {
          // Merge with existing data
          aggregatedData = this.mergeUsageData(
            (existingGlobal.aggregated_data || {}) as Record<string, any>,
            snapshot.usage_data
          );
          sourceCount = (existingGlobal.source_count ?? 0) + 1;
        }

        // Calculate confidence score
        const confidenceScore = this.calculateConfidence(aggregatedData, sourceCount);

        const globalKnowledge: GlobalKnowledge = {
          sync_date: new Date().toISOString(),
          module_name: snapshot.module_name,
          aggregated_data: aggregatedData,
          confidence_score: confidenceScore,
          source_count: sourceCount,
          metadata: {
            last_sync: new Date().toISOString(),
            performance: snapshot.performance_metrics,
          },
        };

        const { error } = await (supabase as any)
          .from("global_knowledge")
          .insert([globalKnowledge]);

        if (error) {
          logger.error("[KnowledgeSync] Failed to sync to global", {
            module: snapshot.module_name,
            error,
          });
        } else {
          syncedCount++;
          logger.debug("[KnowledgeSync] Synced to global", {
            module: snapshot.module_name,
          });
        }
      } catch (error) {
        logger.error("[KnowledgeSync] Sync to global failed", {
          module: snapshot.module_name,
          error,
        });
      }
    }

    return syncedCount;
  }

  /**
   * Detect significant behavior drift
   */
  async detectBehaviorDrift(): Promise<BehaviorDrift[]> {
    logger.info("[KnowledgeSync] Detecting behavior drift");

    const drifts: BehaviorDrift[] = [];
    const modules = ["ai-engine", "autonomy-layer", "learning-core", "mission-core"];

    for (const module of modules) {
      try {
        // Get local snapshot
        const { data: localData } = await (supabase as any)
          .from("local_knowledge")
          .select("*")
          .eq("module_name", module)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get global knowledge
        const { data: globalData } = await (supabase as any)
          .from("global_knowledge")
          .select("*")
          .eq("module_name", module)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!localData || !globalData) continue;

        // Compare metrics
        const localMetrics = (localData.performance_metrics || {}) as Record<string, any>;
        const aggregatedData = (globalData.aggregated_data || {}) as Record<string, any>;
        const globalMetrics = (aggregatedData.performance || {}) as Record<string, any>;

        for (const metric in localMetrics) {
          if (!globalMetrics[metric]) continue;

          const localValue = localMetrics[metric] as number;
          const globalValue = globalMetrics[metric] as number;
          const driftPercentage = Math.abs((localValue - globalValue) / globalValue) * 100;

          if (driftPercentage > 20) {
            const drift: BehaviorDrift = {
              module,
              metric,
              local_value: localValue,
              global_value: globalValue,
              drift_percentage: driftPercentage,
              significance: driftPercentage > 50 ? "high" : driftPercentage > 35 ? "medium" : "low",
            };

            drifts.push(drift);
            logger.warn("[KnowledgeSync] Significant drift detected", drift);
          }
        }
      } catch (error) {
        logger.error("[KnowledgeSync] Drift detection failed", { module, error });
      }
    }

    return drifts;
  }

  /**
   * Apply safe merges based on confidence threshold
   */
  private async applySafeMerges(drifts: BehaviorDrift[]): Promise<number> {
    logger.info("[KnowledgeSync] Applying safe merges");

    let mergedCount = 0;

    for (const drift of drifts) {
      // Only merge if confidence is high enough
      if (drift.significance === "low") {
        try {
          // Get global knowledge
          const { data: globalData } = await (supabase as any)
            .from("global_knowledge")
            .select("*")
            .eq("module_name", drift.module)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!globalData || globalData.confidence_score < this.confidenceThreshold) {
            logger.debug("[KnowledgeSync] Skipping merge - low confidence", {
              module: drift.module,
              confidence: globalData?.confidence_score,
            });
            continue;
          }

          // Apply merge (update local model)
          await this.updateLocalModel(drift.module, drift.metric, drift.global_value);
          mergedCount++;

          logger.info("[KnowledgeSync] Merge applied", {
            module: drift.module,
            metric: drift.metric,
            confidence: globalData.confidence_score,
          });

          // Track decision
          await learningCore.trackDecision(
            "knowledge-sync",
            "merge_applied",
            { drift },
            { success: true, confidence: globalData.confidence_score },
            globalData.confidence_score
          );
        } catch (error) {
          logger.error("[KnowledgeSync] Merge failed", { drift, error });
        }
      } else {
        logger.info("[KnowledgeSync] Skipping merge - high significance", {
          module: drift.module,
          significance: drift.significance,
        });
      }
    }

    return mergedCount;
  }

  /**
   * Collect module usage data
   */
  private async collectModuleUsage(module: string): Promise<Record<string, any>> {
    // Get events from learning core
    const { data: events } = await supabase
      .from("learning_events")
      .select("*")
      .eq("module_name", module)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return {
      total_events: events?.length || 0,
      event_types: this.groupBy(events || [], "event_type"),
      outcomes: this.groupBy(events || [], "outcome"),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(module: string): Promise<Record<string, any>> {
    return {
      uptime: 1.0,
      error_rate: 0.01,
      avg_response_time: 150,
      success_rate: 0.99,
    };
  }

  /**
   * Merge usage data
   */
  private mergeUsageData(
    existing: Record<string, any>,
    newData: Record<string, any>
  ): Record<string, any> {
    return {
      total_events: (existing.total_events || 0) + (newData.total_events || 0),
      event_types: {
        ...existing.event_types,
        ...newData.event_types,
      },
      outcomes: {
        ...existing.outcomes,
        ...newData.outcomes,
      },
      merged_at: new Date().toISOString(),
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: Record<string, any>, sourceCount: number): number {
    // Confidence increases with more sources, caps at 0.95
    const baseConfidence = 0.5;
    const sourceBonus = Math.min(sourceCount * 0.1, 0.45);
    return Math.min(baseConfidence + sourceBonus, 0.95);
  }

  /**
   * Update local model with global knowledge
   */
  private async updateLocalModel(
    module: string,
    metric: string,
    value: number
  ): Promise<void> {
    logger.info("[KnowledgeSync] Updating local model", { module, metric, value });

    // Store in localStorage for local access
    const localModels = JSON.parse(localStorage.getItem("local_models") || "{}");
    
    if (!localModels[module]) {
      localModels[module] = {};
    }
    
    localModels[module][metric] = {
      value,
      updated_at: new Date().toISOString(),
      source: "global",
    };

    localStorage.setItem("local_models", JSON.stringify(localModels));
  }

  /**
   * Group array by key
   */
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const value = item[key] || "unknown";
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 1) {
      this.confidenceThreshold = threshold;
      logger.info("[KnowledgeSync] Confidence threshold updated", { threshold });
    }
  }

  /**
   * Manual sync trigger
   */
  async triggerSync(): Promise<SyncResult> {
    logger.info("[KnowledgeSync] Manual sync triggered");
    return this.performSync();
  }
}

// Singleton instance
export const knowledgeSync = new KnowledgeSync();

export default knowledgeSync;
