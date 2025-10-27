/**
 * PATCH 233: Collective Memory Hub
 * 
 * Shared memory system between AI instances with versioning,
 * replication, and rollback capabilities.
 */

import { supabase } from '@/integrations/supabase/client';
import { createHash } from 'crypto';

export interface KnowledgeEntry {
  id: string;
  category: string;
  key: string;
  value: any;
  version: number;
  hash: string;
  sourceInstanceId: string;
  confidence: number;
  tags: string[];
  metadata: Record<string, any>;
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
  resolution: 'local' | 'remote' | 'merge' | 'manual';
}

export interface RollbackRequest {
  instanceId: string;
  targetVersion: number;
  categories?: string[];
}

export class CollectiveMemoryHub {
  private instanceId: string;

  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  /**
   * Store knowledge with automatic versioning and hashing
   */
  async store(
    category: string,
    key: string,
    value: any,
    options: {
      confidence?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<KnowledgeEntry> {
    const existingEntry = await this.get(category, key);
    const version = existingEntry ? existingEntry.version + 1 : 1;

    const entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      category,
      key,
      value,
      version,
      hash: this.computeHash(category, key, value, version),
      sourceInstanceId: this.instanceId,
      confidence: options.confidence ?? 1.0,
      tags: options.tags ?? [],
      metadata: options.metadata ?? {},
    };

    try {
      const { data, error } = await supabase
        .from('collective_knowledge')
        .insert({
          category: entry.category,
          key: entry.key,
          value: entry.value,
          version: entry.version,
          hash: entry.hash,
          source_instance_id: entry.sourceInstanceId,
          confidence: entry.confidence,
          tags: entry.tags,
          metadata: entry.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Failed to store knowledge:', error);
      throw error;
    }
  }

  /**
   * Retrieve knowledge by category and key
   */
  async get(category: string, key: string): Promise<KnowledgeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('collective_knowledge')
        .select('*')
        .eq('category', category)
        .eq('key', key)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error('Failed to retrieve knowledge:', error);
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
        .from('collective_knowledge')
        .select('*')
        .eq('category', category);

      if (options.minConfidence) {
        query = query.gte('confidence', options.minConfidence);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags);
      }

      query = query
        .order('version', { ascending: false })
        .limit(options.limit ?? 100);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(d => this.mapFromDatabase(d));
    } catch (error) {
      console.error('Failed to query knowledge:', error);
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
      // Fetch knowledge from source instance
      const sourceKnowledge = await this.fetchFromInstance(
        request.sourceInstanceId,
        request.categories,
        request.sinceVersion
      );

      for (const remoteEntry of sourceKnowledge) {
        const localEntry = await this.get(remoteEntry.category, remoteEntry.key);

        if (!localEntry) {
          // New entry - just insert
          await this.replicateEntry(remoteEntry);
          result.syncedCount++;
        } else {
          // Existing entry - check for conflicts
          const conflict = this.detectConflict(localEntry, remoteEntry);

          if (conflict) {
            result.conflictCount++;
            result.conflicts.push(conflict);

            // Automatic resolution based on confidence and version
            await this.resolveConflict(conflict);
          } else if (remoteEntry.version > localEntry.version) {
            // Remote is newer - update
            await this.replicateEntry(remoteEntry);
            result.updatedCount++;
          }
        }
      }

      // Log sync operation
      await this.logSync(request, result);

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
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
      // Find entries to rollback
      let query = supabase
        .from('collective_knowledge')
        .select('*')
        .eq('source_instance_id', request.instanceId)
        .lte('version', request.targetVersion);

      if (request.categories) {
        query = query.in('category', request.categories);
      }

      const { data: targetEntries, error } = await query;

      if (error) throw error;

      const affectedCategories = new Set<string>();
      let rolledBackCount = 0;

      for (const entry of targetEntries || []) {
        // Restore this version as the current one
        await this.replicateEntry(this.mapFromDatabase(entry));
        affectedCategories.add(entry.category);
        rolledBackCount++;
      }

      return {
        rolledBackCount,
        affectedCategories: Array.from(affectedCategories),
      };
    } catch (error) {
      console.error('Rollback failed:', error);
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
        .from('collective_knowledge')
        .select('*')
        .eq('category', category)
        .eq('key', key)
        .order('version', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(d => this.mapFromDatabase(d));
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }

  /**
   * Compute hash for knowledge versioning
   */
  private computeHash(category: string, key: string, value: any, version: number): string {
    const content = JSON.stringify({ category, key, value, version });
    return createHash('sha256').update(content).digest('hex');
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
        .from('collective_knowledge')
        .select('*')
        .eq('source_instance_id', instanceId)
        .in('category', categories);

      if (sinceVersion) {
        query = query.gt('version', sinceVersion);
      }

      const { data, error } = await query.order('version', { ascending: true });

      if (error) throw error;

      return (data || []).map(d => this.mapFromDatabase(d));
    } catch (error) {
      console.error('Failed to fetch from instance:', error);
      return [];
    }
  }

  /**
   * Replicate entry to local storage
   */
  private async replicateEntry(entry: KnowledgeEntry): Promise<void> {
    try {
      await supabase.from('collective_knowledge').upsert({
        category: entry.category,
        key: entry.key,
        value: entry.value,
        version: entry.version,
        hash: entry.hash,
        source_instance_id: entry.sourceInstanceId,
        confidence: entry.confidence,
        tags: entry.tags,
        metadata: entry.metadata,
      });
    } catch (error) {
      console.error('Failed to replicate entry:', error);
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
    // Same version but different hash = conflict
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
  ): 'local' | 'remote' | 'merge' | 'manual' {
    // Prefer higher confidence
    if (local.confidence > remote.confidence + 0.1) return 'local';
    if (remote.confidence > local.confidence + 0.1) return 'remote';

    // Prefer more recent
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    if (localTime > remoteTime) return 'local';
    if (remoteTime > localTime) return 'remote';

    // Default to manual resolution
    return 'manual';
  }

  /**
   * Resolve conflict automatically
   */
  private async resolveConflict(conflict: KnowledgeConflict): Promise<void> {
    const winner =
      conflict.resolution === 'local'
        ? conflict.localEntry
        : conflict.resolution === 'remote'
        ? conflict.remoteEntry
        : null;

    if (winner) {
      await this.replicateEntry(winner);
    }

    // Log conflict for manual review if needed
    if (conflict.resolution === 'manual') {
      console.warn('Manual conflict resolution required:', conflict);
    }
  }

  /**
   * Log sync operation
   */
  private async logSync(request: SyncRequest, result: SyncResult): Promise<void> {
    try {
      await supabase.from('clone_sync_log').insert({
        source_instance_id: request.sourceInstanceId,
        target_instance_id: request.targetInstanceId,
        direction: 'pull',
        data_categories: request.categories,
        status: result.conflictCount > 0 ? 'completed' : 'completed',
        progress: 100,
        items_synced: result.syncedCount + result.updatedCount,
        total_items: result.syncedCount + result.updatedCount + result.conflictCount,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log sync:', error);
    }
  }

  /**
   * Map database record to KnowledgeEntry
   */
  private mapFromDatabase(data: any): KnowledgeEntry {
    return {
      id: data.id,
      category: data.category,
      key: data.key,
      value: data.value,
      version: data.version,
      hash: data.hash,
      sourceInstanceId: data.source_instance_id,
      confidence: data.confidence,
      tags: data.tags || [],
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Factory function to create instance-specific hubs
export function createCollectiveMemoryHub(instanceId: string): CollectiveMemoryHub {
  return new CollectiveMemoryHub(instanceId);
}
