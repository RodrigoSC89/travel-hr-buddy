
/**
 * PATCH 536 - Collective Memory Hub
 * 
 * Synchronizes knowledge across system instances, enables versioning,
 * and allows rollbacks to previous knowledge states.
 * 
 * @module ai/collectiveMemoryHub
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface KnowledgeEntry {
  id: string;
  key: string;
  value: any;
  version: number;
  source: string;
  confidence: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  instance_id: string;
  last_sync: string;
  entries_synced: number;
  status: "synced" | "syncing" | "error";
}

export interface RollbackResult {
  success: boolean;
  rolled_back_to_version: number;
  entries_affected: number;
  timestamp: string;
}

class CollectiveMemoryHub {
  private instanceId: string;
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private syncInterval: number | null = null;

  constructor() {
    this.instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize the collective memory hub
   */
  async initialize(): Promise<void> {
    logger.info("Initializing CollectiveMemory", { instanceId: this.instanceId });
    await this.loadKnowledgeFromDB();
    this.startSync();
  }

  /**
   * Store knowledge entry
   */
  async store(
    key: string,
    value: any,
    source: string = "system",
    tags: string[] = []
  ): Promise<KnowledgeEntry> {
    // Get current version
    const existing = this.knowledge.get(key);
    const version = existing ? existing.version + 1 : 1;

    const entry: KnowledgeEntry = {
      id: `knowledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      version,
      source,
      confidence: 0.8, // Default confidence
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store locally
    this.knowledge.set(key, entry);

    // Store in database
    await this.syncEntryToDB(entry);

    logger.debug("Knowledge entry stored", { key, version });
    return entry;
  }

  /**
   * Retrieve knowledge entry
   */
  async retrieve(key: string): Promise<KnowledgeEntry | null> {
    // Check local cache first
    if (this.knowledge.has(key)) {
      return this.knowledge.get(key) || null;
    }

    // Fetch from database
    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      const { data, error } = await supabaseQuery
        .from("collective_knowledge")
        .select("*")
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        const entry: KnowledgeEntry = {
          id: data.id,
          key: data.key,
          value: data.value,
          version: data.version,
          source: data.source,
          confidence: data.confidence,
          tags: data.tags || [],
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        this.knowledge.set(key, entry);
        return entry;
      }
    } catch (error) {
      logger.warn("Failed to retrieve knowledge from DB", { key, error });
    }

    return null;
  }

  /**
   * Sync entry to database
   */
  private async syncEntryToDB(entry: KnowledgeEntry): Promise<void> {
    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      await supabaseQuery.from("collective_knowledge").insert({
        id: entry.id,
        key: entry.key,
        value: entry.value,
        version: entry.version,
        source: entry.source,
        confidence: entry.confidence,
        tags: entry.tags,
        instance_id: this.instanceId
      });
    } catch (error) {
      logger.error("Failed to sync entry to DB", { entryId: entry.id, error });
    }
  }

  /**
   * Load all knowledge from database
   */
  private async loadKnowledgeFromDB(): Promise<void> {
    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      const { data, error } = await supabaseQuery
        .from("collective_knowledge")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Keep only latest version of each key
        const latestEntries = new Map<string, any>();
        data.forEach((row: any) => {
          if (!latestEntries.has(row.key) || row.version > latestEntries.get(row.key).version) {
            latestEntries.set(row.key, row);
          }
        });

        // Store in memory
        latestEntries.forEach((row, key) => {
          this.knowledge.set(key, {
            id: row.id,
            key: row.key,
            value: row.value,
            version: row.version,
            source: row.source,
            confidence: row.confidence,
            tags: row.tags || [],
            created_at: row.created_at,
            updated_at: row.updated_at
          });
        });

        logger.info("Knowledge loaded from DB", { entriesCount: this.knowledge.size });
      }
    } catch (error) {
      logger.error("Failed to load knowledge from DB", { error });
    }
  }

  /**
   * Start automatic synchronization
   */
  private startSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;

    this.syncInterval = window.setInterval(async () => {
      await this.syncWithInstances();
    }, intervalMs);

    logger.info("CollectiveMemory sync started", { intervalMs });
  }

  /**
   * Synchronize with other instances
   */
  private async syncWithInstances(): Promise<SyncStatus> {
    const startTime = Date.now();
    let entriesSynced = 0;

    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      const { data, error } = await supabaseQuery
        .from("collective_knowledge")
        .select("*")
        .neq("instance_id", this.instanceId)
        .gte("updated_at", new Date(Date.now() - 60000).toISOString())
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data) {
        data.forEach((row: any) => {
          const existing = this.knowledge.get(row.key);
          // Update if newer version
          if (!existing || row.version > existing.version) {
            this.knowledge.set(row.key, {
              id: row.id,
              key: row.key,
              value: row.value,
              version: row.version,
              source: row.source,
              confidence: row.confidence,
              tags: row.tags || [],
              created_at: row.created_at,
              updated_at: row.updated_at
            });
            entriesSynced++;
          }
        });
      }

      const status: SyncStatus = {
        instance_id: this.instanceId,
        last_sync: new Date().toISOString(),
        entries_synced: entriesSynced,
        status: "synced"
      };

      if (entriesSynced > 0) {
        logger.debug("CollectiveMemory sync completed", { entriesSynced });
      }

      return status;
    } catch (error) {
      logger.error("CollectiveMemory sync error", { error });
      return {
        instance_id: this.instanceId,
        last_sync: new Date().toISOString(),
        entries_synced: 0,
        status: "error"
      };
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollback(key: string, targetVersion: number): Promise<RollbackResult> {
    logger.info("Rolling back knowledge", { key, targetVersion });

    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      const { data, error } = await supabaseQuery
        .from("collective_knowledge")
        .select("*")
        .eq("key", key)
        .eq("version", targetVersion)
        .single();

      if (error) throw error;

      if (data) {
        // Create new entry with incremented version (rollback is a new version)
        const currentVersion = this.knowledge.get(key)?.version || 0;
        const newEntry: KnowledgeEntry = {
          id: `knowledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          key: data.key,
          value: data.value,
          version: currentVersion + 1,
          source: `rollback-to-v${targetVersion}`,
          confidence: data.confidence,
          tags: [...(data.tags || []), "rollback"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.knowledge.set(key, newEntry);
        await this.syncEntryToDB(newEntry);

        return {
          success: true,
          rolled_back_to_version: targetVersion,
          entries_affected: 1,
          timestamp: new Date().toISOString()
        };
      }

      throw new Error("Target version not found");
    } catch (error) {
      logger.error("Rollback failed", { key, targetVersion, error });
      return {
        success: false,
        rolled_back_to_version: targetVersion,
        entries_affected: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get version history for a key
   */
  async getHistory(key: string, limit: number = 20): Promise<KnowledgeEntry[]> {
    try {
      // collective_knowledge table is optional
      const supabaseQuery: any = supabase;
      const { data, error } = await supabaseQuery
        .from("collective_knowledge")
        .select("*")
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        key: row.key,
        value: row.value,
        version: row.version,
        source: row.source,
        confidence: row.confidence,
        tags: row.tags || [],
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      logger.warn("Failed to fetch knowledge history", { key, error });
      return [];
    }
  }

  /**
   * Shutdown and stop sync
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    logger.info("CollectiveMemory shutdown complete");
  }

  /**
   * Get current instance ID
   */
  getInstanceId(): string {
    return this.instanceId;
  }

  /**
   * Get all knowledge entries
   */
  getAllEntries(): KnowledgeEntry[] {
    return Array.from(this.knowledge.values());
  }
}

export const collectiveMemoryHub = new CollectiveMemoryHub();
