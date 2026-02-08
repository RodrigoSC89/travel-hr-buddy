/**
 * PATCH 233: Collective Memory Hub
 * 
 * Shared memory system between AI instances with versioning,
 * replication, and rollback capabilities.
 * Fixed: Removed (supabase as any), aligned with collective_knowledge + clone_sync_log schema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export interface KnowledgeEntry {
  id: string;
  category: string;
  key: string;
  value: unknown;
  version: number;
  hash: string;
  sourceInstanceId: string;
  confidence: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRequest {
  sourceInstanceId: string;
  targetInstanceId: string;
  categories: string[];
  sinceVersion?: number;
}

export interface SyncResult {
  syncedCount: number;
  updatedCount: number;
  conflictCount: number;
  conflicts: KnowledgeConflict[];
}

export interface KnowledgeConflict {
  key: string;
  localEntry: KnowledgeEntry;
  remoteEntry: KnowledgeEntry;
  resolution: "local" | "remote" | "merge" | "manual";
}

export interface RollbackRequest {
  instanceId: string;
  targetVersion: number;
  categories?: string[];
}

/**
 * Collective Memory Hub - manages shared knowledge between AI instances
 */
export class CollectiveMemoryHub {
  private instanceId: string;

  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  /**
   * Store new knowledge entry
   */
  async store(
    category: string,
    key: string,
    value: unknown,
    options: {
      confidence?: number;
      tags?: string[];
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<KnowledgeEntry> {
    const version = 1;
    const hash = await this.computeHash(category, key, value, version);

    const entry: KnowledgeEntry = {
      id: "",
      category,
      key,
      value,
      version,
      hash,
      sourceInstanceId: this.instanceId,
      confidence: options.confidence ?? 1.0,
      tags: options.tags ?? [],
      metadata: options.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("collective_knowledge")
        .insert([{
          category: entry.category,
          key: entry.key,
          value: entry.value as Json,
          version: entry.version,
          source_instance_id: entry.sourceInstanceId,
          confidence: entry.confidence,
          metadata: { hash: entry.hash, tags: entry.tags } as Json,
        }])
        .select()
        .single();

      if (error) throw error;

      return this.mapFromDatabase(data);
    } catch (error) {
      logger.error("Failed to store knowledge", error);
      throw error;
    }
  }

  /**
   * Retrieve knowledge by category and key
   */
  async get(category: string, key: string): Promise<KnowledgeEntry | null> {
    try {
      const { data, error } = await supabase
        .from("collective_knowledge")
        .select("*")
        .eq("category", category)
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      logger.error("Failed to retrieve knowledge", error);
      return null;
    }
  }

  /**
   * Query knowledge by category with optional filters
   */
  async query(
    category: string,
    options: {
      tags?: string[];
      minConfidence?: number;
      limit?: number;
    } = {}
  ): Promise<KnowledgeEntry[]> {
    try {
      let query = supabase
        .from("collective_knowledge")
        .select("*")
        .eq("category", category);

      if (options.minConfidence) {
        query = query.gte("confidence", options.minConfidence);
      }

      const { data, error } = await query
        .order("version", { ascending: false })
        .limit(options.limit ?? 100);

      if (error) throw error;

      return (data || []).map((d) => this.mapFromDatabase(d));
    } catch (error) {
      logger.error("Failed to query knowledge", error);
      return [];
    }
  }

  /**
   * Synchronize knowledge between instances
   */
  async sync(request: SyncRequest): Promise<SyncResult> {
    const result: SyncResult = {
      syncedCount: 0,
      updatedCount: 0,
      conflictCount: 0,
      conflicts: [],
    };

    try {
      const sourceKnowledge = await this.fetchFromInstance(
        request.sourceInstanceId,
        request.categories,
        request.sinceVersion
      );

      for (const remoteEntry of sourceKnowledge) {
        const localEntry = await this.get(remoteEntry.category, remoteEntry.key);

        if (!localEntry) {
          await this.replicateEntry(remoteEntry);
          result.syncedCount++;
        } else {
          const conflict = this.detectConflict(localEntry, remoteEntry);

          if (conflict) {
            result.conflictCount++;
            result.conflicts.push(conflict);
            await this.resolveConflict(conflict);
          } else if (remoteEntry.version > localEntry.version) {
            await this.replicateEntry(remoteEntry);
            result.updatedCount++;
          }
        }
      }

      await this.logSync(request, result);
      return result;
    } catch (error) {
      logger.error("Sync failed", error);
      throw error;
    }
  }

  /**
   * Rollback knowledge to a previous version
   */
  async rollback(request: RollbackRequest): Promise<{
    rolledBackCount: number;
    affectedCategories: string[];
  }> {
    try {
      let query = supabase
        .from("collective_knowledge")
        .select("*")
        .eq("source_instance_id", request.instanceId)
        .lte("version", request.targetVersion);

      if (request.categories) {
        query = query.in("category", request.categories);
      }

      const { data: targetEntries, error } = await query;

      if (error) throw error;

      const affectedCategories = new Set<string>();
      let rolledBackCount = 0;

      for (const entry of targetEntries || []) {
        await this.replicateEntry(this.mapFromDatabase(entry));
        affectedCategories.add(entry.category);
        rolledBackCount++;
      }

      return {
        rolledBackCount,
        affectedCategories: Array.from(affectedCategories),
      };
    } catch (error) {
      logger.error("Rollback failed", error);
      throw error;
    }
  }

  /**
   * Get version history for a specific knowledge entry
   */
  async getHistory(
    category: string,
    key: string,
    limit: number = 10
  ): Promise<KnowledgeEntry[]> {
    try {
      const { data, error } = await supabase
        .from("collective_knowledge")
        .select("*")
        .eq("category", category)
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((d) => this.mapFromDatabase(d));
    } catch (error) {
      logger.error("Failed to fetch history", error);
      return [];
    }
  }

  /**
   * Compute hash for knowledge versioning using Web Crypto API
   */
  private async computeHash(category: string, key: string, value: unknown, version: number): Promise<string> {
    const content = JSON.stringify({ category, key, value, version });
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Fetch knowledge from another instance
   */
  private async fetchFromInstance(
    instanceId: string,
    categories: string[],
    sinceVersion?: number
  ): Promise<KnowledgeEntry[]> {
    try {
      let query = supabase
        .from("collective_knowledge")
        .select("*")
        .eq("source_instance_id", instanceId)
        .in("category", categories);

      if (sinceVersion) {
        query = query.gt("version", sinceVersion);
      }

      const { data, error } = await query.order("version", { ascending: true });

      if (error) throw error;

      return (data || []).map((d) => this.mapFromDatabase(d));
    } catch (error) {
      logger.error("Failed to fetch from instance", error);
      return [];
    }
  }

  /**
   * Replicate entry to local storage
   */
  private async replicateEntry(entry: KnowledgeEntry): Promise<void> {
    try {
      await supabase.from("collective_knowledge").upsert([{
        category: entry.category,
        key: entry.key,
        value: entry.value as Json,
        version: entry.version,
        source_instance_id: entry.sourceInstanceId,
        confidence: entry.confidence,
        metadata: { hash: entry.hash, tags: entry.tags } as Json,
        is_replicated: true,
      }]);
    } catch (error) {
      logger.error("Failed to replicate entry", error);
      throw error;
    }
  }

  /**
   * Detect conflict between local and remote entries
   */
  private detectConflict(
    local: KnowledgeEntry,
    remote: KnowledgeEntry
  ): KnowledgeConflict | null {
    if (local.version === remote.version && local.hash !== remote.hash) {
      return {
        key: local.key,
        localEntry: local,
        remoteEntry: remote,
        resolution: this.autoResolve(local, remote),
      };
    }
    return null;
  }

  /**
   * Auto-resolve conflicts based on confidence and metadata
   */
  private autoResolve(
    local: KnowledgeEntry,
    remote: KnowledgeEntry
  ): "local" | "remote" | "merge" | "manual" {
    if (local.confidence > remote.confidence + 0.1) return "local";
    if (remote.confidence > local.confidence + 0.1) return "remote";

    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    if (localTime > remoteTime) return "local";
    if (remoteTime > localTime) return "remote";

    return "manual";
  }

  /**
   * Resolve conflict automatically
   */
  private async resolveConflict(conflict: KnowledgeConflict): Promise<void> {
    const winner =
      conflict.resolution === "local"
        ? conflict.localEntry
        : conflict.resolution === "remote"
          ? conflict.remoteEntry
          : null;

    if (winner) {
      await this.replicateEntry(winner);
    }

    if (conflict.resolution === "manual") {
      logger.warn("Manual conflict resolution required", { conflict });
    }
  }

  /**
   * Log sync operation using clone_sync_log table
   */
  private async logSync(request: SyncRequest, result: SyncResult): Promise<void> {
    try {
      await supabase.from("clone_sync_log").insert({
        source_instance_id: request.sourceInstanceId,
        target_instance_id: request.targetInstanceId,
        sync_type: "pull",
        status: "completed",
        rows_synced: result.syncedCount + result.updatedCount,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Failed to log sync", error);
    }
  }

  /**
   * Map database record to KnowledgeEntry
   */
  private mapFromDatabase(data: Record<string, unknown>): KnowledgeEntry {
    const metadata = (data.metadata || {}) as Record<string, unknown>;
    return {
      id: String(data.id || ""),
      category: String(data.category || ""),
      key: String(data.key || ""),
      value: data.value,
      version: Number(data.version || 0),
      hash: String(metadata.hash || ""),
      sourceInstanceId: String(data.source_instance_id || ""),
      confidence: Number(data.confidence || 0),
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      metadata,
      createdAt: String(data.created_at || ""),
      updatedAt: String(data.updated_at || ""),
    };
  }
}

// Factory function to create instance-specific hubs
export function createCollectiveMemoryHub(instanceId: string): CollectiveMemoryHub {
  return new CollectiveMemoryHub(instanceId);
}
