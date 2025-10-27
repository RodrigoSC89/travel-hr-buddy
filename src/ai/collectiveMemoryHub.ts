// @ts-nocheck
/**
 * PATCH 233 - Collective Memory Hub
 * 
 * Synchronizes knowledge across system instances, enables versioning,
 * and allows rollbacks to previous knowledge states.
 * 
 * @module ai/collectiveMemoryHub
 */

import { supabase } from "@/integrations/supabase/client";

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
  status: 'synced' | 'syncing' | 'error';
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
    console.log('[CollectiveMemory] Initializing with instance ID:', this.instanceId);
    await this.loadKnowledgeFromDB();
    this.startSync();
  }

  /**
   * Store knowledge entry
   */
  async store(
    key: string,
    value: any,
    source: string = 'system',
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

    console.log('[CollectiveMemory] Stored:', key, 'v' + version);
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
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .eq('key', key)
        .order('version', { ascending: false })
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
      console.error('[CollectiveMemory] Failed to retrieve:', error);
    }

    return null;
  }

  /**
   * Sync entry to database
   */
  private async syncEntryToDB(entry: KnowledgeEntry): Promise<void> {
    try {
      await supabase.from('collective_knowledge').insert({
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
      console.error('[CollectiveMemory] Failed to sync entry:', error);
    }
  }

  /**
   * Load all knowledge from database
   */
  private async loadKnowledgeFromDB(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Keep only latest version of each key
        const latestEntries = new Map<string, any>();
        data.forEach(row => {
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

        console.log('[CollectiveMemory] Loaded', this.knowledge.size, 'entries from DB');
      }
    } catch (error) {
      console.error('[CollectiveMemory] Failed to load from DB:', error);
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

    console.log('[CollectiveMemory] Started sync (interval:', intervalMs, 'ms)');
  }

  /**
   * Synchronize with other instances
   */
  private async syncWithInstances(): Promise<SyncStatus> {
    const startTime = Date.now();
    let entriesSynced = 0;

    try {
      // Fetch recent updates from other instances
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .neq('instance_id', this.instanceId)
        .gte('updated_at', new Date(Date.now() - 60000).toISOString())
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        data.forEach(row => {
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
        status: 'synced'
      };

      if (entriesSynced > 0) {
        console.log('[CollectiveMemory] Synced', entriesSynced, 'entries');
      }

      return status;
    } catch (error) {
      console.error('[CollectiveMemory] Sync error:', error);
      return {
        instance_id: this.instanceId,
        last_sync: new Date().toISOString(),
        entries_synced: 0,
        status: 'error'
      };
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollback(key: string, targetVersion: number): Promise<RollbackResult> {
    console.log('[CollectiveMemory] Rolling back', key, 'to version', targetVersion);

    try {
      // Fetch the target version from DB
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .eq('key', key)
        .eq('version', targetVersion)
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
          tags: [...(data.tags || []), 'rollback'],
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

      throw new Error('Target version not found');
    } catch (error) {
      console.error('[CollectiveMemory] Rollback failed:', error);
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
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .eq('key', key)
        .order('version', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(row => ({
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
      console.error('[CollectiveMemory] Failed to fetch history:', error);
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
    console.log('[CollectiveMemory] Shutdown complete');
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
