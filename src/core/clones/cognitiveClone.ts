/**
 * PATCH 221.0 - Cognitive Clone Core
 * System for creating functional copies of Nautilus with replicated AI + limited context
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database, Json } from "@/integrations/supabase/types";

// Database types
type CloneRegistryRow = Database['public']['Tables']['clone_registry']['Row'];
type CloneRegistryInsert = Database['public']['Tables']['clone_registry']['Insert'];
type AiMemoryRow = Database['public']['Tables']['ai_memory']['Row'];
type AiMemoryInsert = Database['public']['Tables']['ai_memory']['Insert'];
type AiConfigurationsRow = Database['public']['Tables']['ai_configurations']['Row'];

export interface CloneConfiguration {
  id: string;
  name: string;
  modules: string[];
  aiContext: {
    memories: Record<string, unknown>[];
    learnings: Record<string, unknown>[];
    preferences: Record<string, unknown>;
  };
  llmConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  contextLimit: number;
  capabilities: string[];
  restrictions: string[];
  createdAt: Date;
  parentInstanceId?: string;
}

export interface CloneSnapshot {
  configurationId: string;
  timestamp: Date;
  modules: Record<string, unknown>[];
  context: {
    memories: Record<string, unknown>[];
    settings: Record<string, unknown>;
    capabilities: string[];
  };
  llmState: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  metadata: {
    version: string;
    environment: string;
    parentInstance: string;
  };
}

export interface CloneDeployment {
  cloneId: string;
  status: "pending" | "deploying" | "active" | "inactive" | "failed";
  endpoint?: string;
  lastSync?: Date;
  syncStatus?: "synced" | "partial" | "out_of_sync";
}

class CognitiveClone {
  private activeClones = new Map<string, CloneConfiguration>();
  private isInitialized = false;

  /**
   * Initialize cognitive clone system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[CognitiveClone] Already initialized");
      return;
    }

    logger.info("[CognitiveClone] Initializing Cognitive Clone Core...");

    try {
      // Load existing clones from registry
      const { data: clones, error } = await supabase
        .from("clone_registry")
        .select("*")
        .eq("status", "active");

      if (error) {
        logger.error("[CognitiveClone] Failed to load clone registry:", error);
      } else if (clones) {
        clones.forEach((clone: CloneRegistryRow) => {
          this.activeClones.set(clone.id, this.deserializeClone(clone));
        });
        logger.info(`[CognitiveClone] Loaded ${clones.length} active clones`);
      }

      this.isInitialized = true;
      logger.info("[CognitiveClone] Cognitive Clone Core initialized");
    } catch (error) {
      logger.error("[CognitiveClone] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Create a snapshot of current configuration
   */
  async createSnapshot(name?: string): Promise<CloneSnapshot> {
    logger.info("[CognitiveClone] Creating configuration snapshot...", { name });

    try {
      // Capture current module state
      const { data: modules } = await supabase
        .from("ai_memory")
        .select("*")
        .limit(50);

      // Capture AI context
      const { data: memories } = await supabase
        .from("ai_memory")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Capture preferences and settings
      const { data: settings } = await supabase
        .from("ai_configurations")
        .select("*")
        .limit(1)
        .maybeSingle();

      const snapshot: CloneSnapshot = {
        configurationId: this.generateId(),
        timestamp: new Date(),
        modules: this.transformModules(modules),
        context: {
          memories: this.transformMemories(memories),
          settings: this.transformSettings(settings),
          capabilities: this.getCurrentCapabilities(),
        },
        llmState: {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: this.getSystemPrompt(),
        },
        metadata: {
          version: "1.0.0",
          environment: import.meta.env.MODE || "production",
          parentInstance: this.getInstanceId(),
        },
      };

      // Save snapshot to database
      await this.saveSnapshot(snapshot);

      logger.info("[CognitiveClone] Snapshot created successfully");
      return snapshot;
    } catch (error) {
      logger.error("[CognitiveClone] Failed to create snapshot:", error);
      throw error;
    }
  }

  /**
   * Clone via remote command (CLI or UI)
   */
  async createClone(
    sourceSnapshot: CloneSnapshot,
    options: {
      name: string;
      contextLimit?: number;
      capabilities?: string[];
      restrictions?: string[];
      deploymentTarget?: "local" | "remote" | "edge";
    }
  ): Promise<CloneConfiguration> {
    logger.info(`[CognitiveClone] Creating clone: ${options.name}`);

    try {
      const cloneConfig: CloneConfiguration = {
        id: this.generateId(),
        name: options.name,
        modules: sourceSnapshot.modules.map(m => String(m.name || '')),
        aiContext: {
          memories: sourceSnapshot.context.memories || [],
          learnings: [],
          preferences: sourceSnapshot.context.settings || {},
        },
        llmConfig: {
          model: sourceSnapshot.llmState.model,
          temperature: sourceSnapshot.llmState.temperature,
          maxTokens: sourceSnapshot.llmState.maxTokens,
          systemPrompt: sourceSnapshot.llmState.systemPrompt,
        },
        contextLimit: options.contextLimit || 1000,
        capabilities: options.capabilities || sourceSnapshot.context.capabilities || [],
        restrictions: options.restrictions || [],
        createdAt: new Date(),
        parentInstanceId: sourceSnapshot.metadata.parentInstance,
      };

      // Register clone
      await this.registerClone(cloneConfig);

      // Persist LLM + context locally
      await this.persistCloneData(cloneConfig);

      this.activeClones.set(cloneConfig.id, cloneConfig);

      logger.info(`[CognitiveClone] Clone created successfully: ${cloneConfig.id}`);
      return cloneConfig;
    } catch (error) {
      logger.error("[CognitiveClone] Failed to create clone:", error);
      throw error;
    }
  }

  /**
   * Persist local LLM + context
   */
  private async persistCloneData(config: CloneConfiguration): Promise<void> {
    logger.info(`[CognitiveClone] Persisting clone data: ${config.id}`);

    try {
      // Store AI context locally (could use IndexedDB in browser)
      const contextData = {
        id: config.id,
        memories: config.aiContext.memories,
        learnings: config.aiContext.learnings,
        preferences: config.aiContext.preferences,
        llmConfig: config.llmConfig,
      };

      // Save to local storage for offline access
      localStorage.setItem(`clone_context_${config.id}`, JSON.stringify(contextData));

      // Also save to Supabase for backup
      const insertData: AiMemoryInsert = {
        memory_type: "clone_context",
        content: contextData as unknown as Json,
      };

      await supabase.from("ai_memory").insert(insertData);

      logger.info("[CognitiveClone] Clone data persisted successfully");
    } catch (error) {
      logger.error("[CognitiveClone] Failed to persist clone data:", error);
      throw error;
    }
  }

  /**
   * Register clone in registry
   */
  private async registerClone(config: CloneConfiguration): Promise<void> {
    try {
      const insertData: CloneRegistryInsert = {
        clone_name: config.name,
        clone_type: "cognitive",
        capabilities: config.capabilities as unknown as Json,
        context_limit: config.contextLimit,
        memory_snapshot: config.aiContext as unknown as Json,
        metadata: {
          llm_config: config.llmConfig,
          restrictions: config.restrictions,
          parent_instance_id: config.parentInstanceId,
        } as unknown as Json,
        status: "active",
      };

      const { error } = await supabase.from("clone_registry").insert(insertData);

      if (error) throw error;

      logger.info(`[CognitiveClone] Clone registered: ${config.id}`);
    } catch (error) {
      logger.error("[CognitiveClone] Failed to register clone:", error);
      throw error;
    }
  }

  /**
   * Save snapshot to database
   */
  private async saveSnapshot(snapshot: CloneSnapshot): Promise<void> {
    try {
      const insertData: AiMemoryInsert = {
        memory_type: "clone_snapshot",
        content: {
          id: snapshot.configurationId,
          timestamp: snapshot.timestamp.toISOString(),
          modules: snapshot.modules,
          context: snapshot.context,
          llm_state: snapshot.llmState,
          metadata: snapshot.metadata,
        } as unknown as Json,
      };

      const { error } = await supabase.from("ai_memory").insert(insertData);

      if (error) throw error;
    } catch (error) {
      logger.error("[CognitiveClone] Failed to save snapshot:", error);
      throw error;
    }
  }

  /**
   * Get clone by ID
   */
  async getClone(cloneId: string): Promise<CloneConfiguration | null> {
    if (this.activeClones.has(cloneId)) {
      return this.activeClones.get(cloneId)!;
    }

    try {
      const { data, error } = await supabase
        .from("clone_registry")
        .select("*")
        .eq("id", cloneId)
        .single();

      if (error) throw error;

      return data ? this.deserializeClone(data) : null;
    } catch (error) {
      logger.error("[CognitiveClone] Failed to get clone:", error);
      return null;
    }
  }

  /**
   * List all clones
   */
  async listClones(filter?: { status?: string }): Promise<CloneConfiguration[]> {
    try {
      let query = supabase.from("clone_registry").select("*");

      if (filter?.status) {
        query = query.eq("status", filter.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((c: CloneRegistryRow) => this.deserializeClone(c));
    } catch (error) {
      logger.error("[CognitiveClone] Failed to list clones:", error);
      return [];
    }
  }

  /**
   * Deactivate a clone
   */
  async deactivateClone(cloneId: string): Promise<void> {
    logger.info(`[CognitiveClone] Deactivating clone: ${cloneId}`);

    try {
      await supabase
        .from("clone_registry")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", cloneId);

      this.activeClones.delete(cloneId);

      logger.info("[CognitiveClone] Clone deactivated successfully");
    } catch (error) {
      logger.error("[CognitiveClone] Failed to deactivate clone:", error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return `clone-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
  }

  private getInstanceId(): string {
    return localStorage.getItem("instance_id") || "main-instance";
  }

  private getCurrentCapabilities(): string[] {
    return [
      "document_processing",
      "ai_inference",
      "decision_making",
      "predictive_analytics",
      "tactical_operations",
    ];
  }

  private getSystemPrompt(): string {
    return "You are Nautilus AI, a maritime operations assistant.";
  }

  private transformModules(data: AiMemoryRow[] | null): Record<string, unknown>[] {
    if (!data) return [];
    return data.map(item => ({
      id: item.id,
      name: item.memory_type,
      content: item.content,
      created_at: item.created_at,
    }));
  }

  private transformMemories(data: AiMemoryRow[] | null): Record<string, unknown>[] {
    if (!data) return [];
    return data.map(item => ({
      id: item.id,
      type: item.memory_type,
      content: item.content,
      importance: item.importance,
    }));
  }

  private transformSettings(data: AiConfigurationsRow | null): Record<string, unknown> {
    if (!data) return {};
    return {
      key: data.config_key,
      value: data.config_value,
    };
  }

  private deserializeClone(data: CloneRegistryRow): CloneConfiguration {
    const metadata = data.metadata as Record<string, unknown> | null;
    const memorySnapshot = data.memory_snapshot as Record<string, unknown> | null;
    
    return {
      id: data.id,
      name: data.clone_name,
      modules: [],
      aiContext: {
        memories: (memorySnapshot?.memories as Record<string, unknown>[]) || [],
        learnings: (memorySnapshot?.learnings as Record<string, unknown>[]) || [],
        preferences: (memorySnapshot?.preferences as Record<string, unknown>) || {},
      },
      llmConfig: (metadata?.llm_config as CloneConfiguration['llmConfig']) || {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: this.getSystemPrompt(),
      },
      contextLimit: data.context_limit || 1000,
      capabilities: (data.capabilities as string[]) || [],
      restrictions: (metadata?.restrictions as string[]) || [],
      createdAt: new Date(data.created_at || Date.now()),
      parentInstanceId: data.parent_id || undefined,
    };
  }

  /**
   * Get system stats
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      activeClonesCount: this.activeClones.size,
      activeCloneIds: Array.from(this.activeClones.keys()),
    };
  }
}

// Export singleton instance
export const cognitiveClone = new CognitiveClone();
