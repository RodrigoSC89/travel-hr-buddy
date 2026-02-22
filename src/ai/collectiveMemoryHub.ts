/**
 * PATCH 536 - Collective Memory Hub
 * 
 * Synchronizes knowledge across system instances, enables versioning,
 * and allows rollbacks to previous knowledge states.
 * 
 * @module ai/collectiveMemoryHub
 */

import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { logger } from "@/lib/logger";

export interface KnowledgeEntry {
  id: string;
  key: string;
  value: unknown;
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

interface KnowledgeRow {
  id: string;
  key: string;
  value: unknown;
  version: number;
  source: string;
  confidence: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  instance_id?: string;
}

class CollectiveMemoryHub {
  private instanceId: string;
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private syncInterval: number | null = null;

  constructor() {
    this.instanceId = `instance-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
  }

  async initialize(): Promise<void> {
    logger.info("Initializing CollectiveMemory", { instanceId: this.instanceId });
    await this.loadKnowledgeFromDB();
    this.startSync();
  }

  async store(
    key: string,
    value: unknown,
    source: string = "system",
    tags: string[] = []
  ): Promise<KnowledgeEntry> {
    const existing = this.knowledge.get(key);
    const version = existing ? existing.version + 1 : 1;

    const entry: KnowledgeEntry = {
      id: `knowledge-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      key,
      value,
      version,
      source,
      confidence: 0.8,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.knowledge.set(key, entry);
    await this.syncEntryToDB(entry);

    logger.debug("Knowledge entry stored", { key, version });
    return entry;
  }

  async retrieve(key: string): Promise<KnowledgeEntry | null> {
    if (this.knowledge.has(key)) {
      return this.knowledge.get(key) || null;
    }

    try {
      const { data, error } = await fromUntyped("collective_knowledge")
        .select("*")
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        const row = data as KnowledgeRow;
        const entry = this.mapRowToEntry(row);
        this.knowledge.set(key, entry);
        return entry;
      }
    } catch (error) {
      logger.warn("Failed to retrieve knowledge from DB", { key, error });
    }

    return null;
  }

  private async syncEntryToDB(entry: KnowledgeEntry): Promise<void> {
    try {
      await fromUntyped("collective_knowledge").insert({
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

  private async loadKnowledgeFromDB(): Promise<void> {
    try {
      const { data, error } = await fromUntyped("collective_knowledge")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const rows = data as KnowledgeRow[];
        const latestEntries = new Map<string, KnowledgeRow>();
        rows.forEach((row) => {
          if (!latestEntries.has(row.key) || row.version > (latestEntries.get(row.key)?.version ?? 0)) {
            latestEntries.set(row.key, row);
          }
        });

        latestEntries.forEach((row, key) => {
          this.knowledge.set(key, this.mapRowToEntry(row));
        });

        logger.info("Knowledge loaded from DB", { entriesCount: this.knowledge.size });
      }
    } catch (error) {
      logger.error("Failed to load knowledge from DB", { error });
    }
  }

  private startSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;

    this.syncInterval = window.setInterval(async () => {
      await this.syncWithInstances();
    }, intervalMs);

    logger.info("CollectiveMemory sync started", { intervalMs });
  }

  private async syncWithInstances(): Promise<SyncStatus> {
    let entriesSynced = 0;

    try {
      const { data, error } = await fromUntyped("collective_knowledge")
        .select("*")
        .neq("instance_id", this.instanceId)
        .gte("updated_at", new Date(Date.now() - 60000).toISOString())
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const rows = data as KnowledgeRow[];
        rows.forEach((row) => {
          const existing = this.knowledge.get(row.key);
          if (!existing || row.version > existing.version) {
            this.knowledge.set(row.key, this.mapRowToEntry(row));
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

  async rollback(key: string, targetVersion: number): Promise<RollbackResult> {
    logger.info("Rolling back knowledge", { key, targetVersion });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- collective_knowledge is an optional dynamic table
      const { data, error } = await (supabase.from as Function)("collective_knowledge")
        .select("*")
        .eq("key", key)
        .eq("version", targetVersion)
        .single();

      if (error) throw error;

      if (data) {
        const row = data as KnowledgeRow;
        const currentVersion = this.knowledge.get(key)?.version || 0;
        const newEntry: KnowledgeEntry = {
          id: `knowledge-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
          key: row.key,
          value: row.value,
          version: currentVersion + 1,
          source: `rollback-to-v${targetVersion}`,
          confidence: row.confidence,
          tags: [...(row.tags || []), "rollback"],
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

  async getHistory(key: string, limit: number = 20): Promise<KnowledgeEntry[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- collective_knowledge is an optional dynamic table
      const { data, error } = await (supabase.from as Function)("collective_knowledge")
        .select("*")
        .eq("key", key)
        .order("version", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as KnowledgeRow[] || []).map((row) => this.mapRowToEntry(row));
    } catch (error) {
      logger.warn("Failed to fetch knowledge history", { key, error });
      return [];
    }
  }

  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    logger.info("CollectiveMemory shutdown complete");
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  getAllEntries(): KnowledgeEntry[] {
    return Array.from(this.knowledge.values());
  }

  private mapRowToEntry(row: KnowledgeRow): KnowledgeEntry {
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      version: row.version,
      source: row.source,
      confidence: row.confidence,
      tags: row.tags || [],
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export const collectiveMemoryHub = new CollectiveMemoryHub();
