/**
 * AI Session Memory Service
 * Persistent memory for AI conversations with session tracking
 * PATCH: Phase 3 - Advanced AI
 */

import { openDB, IDBPDatabase } from "idb";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface MemoryEntry {
  id: string;
  sessionId: string;
  type: "conversation" | "context" | "preference" | "fact" | "action";
  content: string;
  metadata: Record<string, unknown>;
  importance: number; // 0-1 scale
  embedding?: number[]; // For semantic search (future)
  createdAt: Date;
  expiresAt?: Date;
}

interface SessionContext {
  id: string;
  userId?: string;
  moduleContext: string;
  activeEntities: string[]; // e.g., ["vessel:123", "crew:456"]
  preferences: Record<string, unknown>;
  conversationSummary?: string;
  lastInteraction: Date;
  createdAt: Date;
}

interface AIMemoryDB {
  memories: {
    key: string;
    value: MemoryEntry;
    indexes: {
      "by-session": string;
      "by-type": string;
      "by-importance": number;
    };
  };
  sessions: {
    key: string;
    value: SessionContext;
    indexes: { "by-user": string };
  };
}

const MAX_MEMORY_ENTRIES = 500;
const SESSION_EXPIRY_HOURS = 24;

class AISessionMemoryService {
  private db: IDBPDatabase<AIMemoryDB> | null = null;
  private currentSessionId: string | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<AIMemoryDB>("nautilus-ai-memory", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const memoriesStore = db.createObjectStore("memories", { keyPath: "id" });
          memoriesStore.createIndex("by-session", "sessionId");
          memoriesStore.createIndex("by-type", "type");
          memoriesStore.createIndex("by-importance", "importance");
        }
        if (oldVersion < 2) {
          const sessionsStore = db.createObjectStore("sessions", { keyPath: "id" });
          sessionsStore.createIndex("by-user", "userId");
        }
      },
    });

    logger.info("[AIMemory] Service initialized");
  }

  /**
   * Start or resume a session
   */
  async startSession(moduleContext: string, userId?: string): Promise<string> {
    await this.initialize();

    // Try to find existing active session for this user/module
    const existingSession = await this.findActiveSession(userId, moduleContext);
    if (existingSession) {
      this.currentSessionId = existingSession.id;
      await this.updateSessionActivity(existingSession.id);
      logger.info(`[AIMemory] Resumed session: ${existingSession.id}`);
      return existingSession.id;
    }

    // Create new session
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: SessionContext = {
      id: sessionId,
      userId,
      moduleContext,
      activeEntities: [],
      preferences: {},
      lastInteraction: new Date(),
      createdAt: new Date(),
    };

    await this.db!.put("sessions", session);
    this.currentSessionId = sessionId;

    logger.info(`[AIMemory] Created new session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Store a memory entry
   */
  async remember(
    content: string,
    type: MemoryEntry["type"] = "conversation",
    metadata: Record<string, unknown> = {},
    importance: number = 0.5
  ): Promise<MemoryEntry> {
    await this.initialize();
    if (!this.currentSessionId) {
      throw new Error("No active session. Call startSession first.");
    }

    const entry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.currentSessionId,
      type,
      content,
      metadata,
      importance: Math.max(0, Math.min(1, importance)),
      createdAt: new Date(),
    };

    await this.db!.put("memories", entry);

    // Sync important memories to Supabase
    if (importance >= 0.7) {
      this.syncToSupabase(entry).catch(console.error);
    }

    // Cleanup old entries if needed
    await this.pruneMemories();

    return entry;
  }

  /**
   * Recall memories for current session
   */
  async recall(options: {
    type?: MemoryEntry["type"];
    minImportance?: number;
    limit?: number;
    includeExpired?: boolean;
  } = {}): Promise<MemoryEntry[]> {
    await this.initialize();
    if (!this.currentSessionId || !this.db) return [];

    const { type, minImportance = 0, limit = 50, includeExpired = false } = options;

    const tx = this.db.transaction("memories", "readonly");
    const index = tx.store.index("by-session");
    let memories = await index.getAll(this.currentSessionId);

    // Filter
    memories = memories.filter((m) => {
      if (type && m.type !== type) return false;
      if (m.importance < minImportance) return false;
      if (!includeExpired && m.expiresAt && new Date(m.expiresAt) < new Date()) return false;
      return true;
    });

    // Sort by importance and recency
    memories.sort((a, b) => {
      const importanceDiff = b.importance - a.importance;
      if (Math.abs(importanceDiff) > 0.1) return importanceDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return memories.slice(0, limit);
  }

  /**
   * Get context summary for AI prompts
   */
  async getContextSummary(): Promise<string> {
    const memories = await this.recall({ minImportance: 0.5, limit: 20 });
    if (memories.length === 0) return "";

    const facts = memories.filter((m) => m.type === "fact").map((m) => m.content);
    const preferences = memories.filter((m) => m.type === "preference").map((m) => m.content);
    const recentContext = memories.filter((m) => m.type === "context").slice(0, 5);

    let summary = "";
    
    if (facts.length > 0) {
      summary += `Fatos conhecidos: ${facts.join("; ")}\n`;
    }
    if (preferences.length > 0) {
      summary += `Preferências do usuário: ${preferences.join("; ")}\n`;
    }
    if (recentContext.length > 0) {
      summary += `Contexto recente: ${recentContext.map((m) => m.content).join("; ")}\n`;
    }

    return summary.trim();
  }

  /**
   * Track an entity being discussed
   */
  async trackEntity(entityType: string, entityId: string): Promise<void> {
    if (!this.currentSessionId || !this.db) return;

    const session = await this.db.get("sessions", this.currentSessionId);
    if (!session) return;

    const entityKey = `${entityType}:${entityId}`;
    if (!session.activeEntities.includes(entityKey)) {
      session.activeEntities.push(entityKey);
      if (session.activeEntities.length > 10) {
        session.activeEntities = session.activeEntities.slice(-10);
      }
      await this.db.put("sessions", session);
    }
  }

  /**
   * Get current session context
   */
  async getSessionContext(): Promise<SessionContext | null> {
    if (!this.currentSessionId || !this.db) return null;
    return this.db.get("sessions", this.currentSessionId) || null;
  }

  /**
   * Update a preference
   */
  async setPreference(key: string, value: unknown): Promise<void> {
    if (!this.currentSessionId || !this.db) return;

    const session = await this.db.get("sessions", this.currentSessionId);
    if (!session) return;

    session.preferences[key] = value;
    await this.db.put("sessions", session);

    // Also store as memory for persistence
    await this.remember(`Preferência: ${key} = ${JSON.stringify(value)}`, "preference", { key, value }, 0.8);
  }

  /**
   * Forget specific memories
   */
  async forget(memoryId: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete("memories", memoryId);
    logger.info(`[AIMemory] Forgot memory: ${memoryId}`);
  }

  /**
   * Clear session memories
   */
  async clearSession(): Promise<void> {
    if (!this.currentSessionId || !this.db) return;

    const tx = this.db.transaction("memories", "readwrite");
    const index = tx.store.index("by-session");
    let cursor = await index.openCursor(this.currentSessionId);

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await this.db.delete("sessions", this.currentSessionId);
    this.currentSessionId = null;

    logger.info("[AIMemory] Session cleared");
  }

  private async findActiveSession(
    userId: string | undefined,
    moduleContext: string
  ): Promise<SessionContext | null> {
    if (!this.db) return null;

    const tx = this.db.transaction("sessions", "readonly");
    const allSessions = await tx.store.getAll();

    const cutoff = new Date(Date.now() - SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    return (
      allSessions.find(
        (s) =>
          s.userId === userId &&
          s.moduleContext === moduleContext &&
          new Date(s.lastInteraction) > cutoff
      ) || null
    );
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    if (!this.db) return;

    const session = await this.db.get("sessions", sessionId);
    if (session) {
      session.lastInteraction = new Date();
      await this.db.put("sessions", session);
    }
  }

  private async syncToSupabase(entry: MemoryEntry): Promise<void> {
    try {
      await supabase.from("ai_memory").insert({
        memory_type: entry.type,
        content: { text: entry.content, ...entry.metadata },
        importance: entry.importance,
      });
    } catch (error) {
      console.warn("[AIMemory] Failed to sync to Supabase:", error);
    }
  }

  private async pruneMemories(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction("memories", "readwrite");
    const index = tx.store.index("by-importance");
    const count = await tx.store.count();

    if (count > MAX_MEMORY_ENTRIES) {
      // Delete low-importance entries
      let cursor = await index.openCursor(IDBKeyRange.upperBound(0.3));
      let deleted = 0;
      const toDelete = count - MAX_MEMORY_ENTRIES + 50; // Delete extra buffer

      while (cursor && deleted < toDelete) {
        await cursor.delete();
        deleted++;
        cursor = await cursor.continue();
      }

      logger.info(`[AIMemory] Pruned ${deleted} low-importance memories`);
    }
  }
}

export const aiSessionMemory = new AISessionMemoryService();
