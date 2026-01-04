/**
 * useAIMemory Hook
 * React hook for AI session memory management
 * PATCH: Phase 3 - Advanced AI
 */

import { useState, useCallback, useEffect } from "react";
import { aiSessionMemory, MemoryEntry } from "@/lib/ai/session-memory-service";
import { useLocation } from "react-router-dom";

interface UseAIMemoryOptions {
  autoStart?: boolean;
  userId?: string;
}

export function useAIMemory(options: UseAIMemoryOptions = {}) {
  const { autoStart = true, userId } = options;
  const location = useLocation();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [contextSummary, setContextSummary] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  // Initialize session based on current route
  useEffect(() => {
    if (!autoStart) return;

    const moduleContext = location.pathname.split("/")[1] || "general";
    
    aiSessionMemory.startSession(moduleContext, userId).then((id) => {
      setSessionId(id);
      setIsReady(true);
      refreshMemories();
    });
  }, [location.pathname, userId, autoStart]);

  const refreshMemories = useCallback(async () => {
    const recentMemories = await aiSessionMemory.recall({ limit: 30 });
    setMemories(recentMemories);
    
    const summary = await aiSessionMemory.getContextSummary();
    setContextSummary(summary);
  }, []);

  /**
   * Remember something from the conversation
   */
  const remember = useCallback(
    async (
      content: string,
      type: MemoryEntry["type"] = "conversation",
      metadata: Record<string, unknown> = {},
      importance: number = 0.5
    ) => {
      const entry = await aiSessionMemory.remember(content, type, metadata, importance);
      await refreshMemories();
      return entry;
    },
    [refreshMemories]
  );

  /**
   * Store a fact that the AI should remember
   */
  const storeFact = useCallback(
    async (fact: string, metadata: Record<string, unknown> = {}) => {
      return remember(fact, "fact", metadata, 0.8);
    },
    [remember]
  );

  /**
   * Store a user preference
   */
  const storePreference = useCallback(
    async (key: string, value: unknown) => {
      await aiSessionMemory.setPreference(key, value);
      await refreshMemories();
    },
    [refreshMemories]
  );

  /**
   * Store context about current discussion
   */
  const storeContext = useCallback(
    async (context: string, metadata: Record<string, unknown> = {}) => {
      return remember(context, "context", metadata, 0.6);
    },
    [remember]
  );

  /**
   * Track an entity being discussed
   */
  const trackEntity = useCallback(
    async (entityType: string, entityId: string) => {
      await aiSessionMemory.trackEntity(entityType, entityId);
    },
    []
  );

  /**
   * Forget a specific memory
   */
  const forget = useCallback(
    async (memoryId: string) => {
      await aiSessionMemory.forget(memoryId);
      await refreshMemories();
    },
    [refreshMemories]
  );

  /**
   * Clear all session data
   */
  const clearSession = useCallback(async () => {
    await aiSessionMemory.clearSession();
    setSessionId(null);
    setMemories([]);
    setContextSummary("");
    setIsReady(false);
  }, []);

  /**
   * Get formatted context for AI prompts
   */
  const getPromptContext = useCallback(async (): Promise<string> => {
    const context = await aiSessionMemory.getSessionContext();
    const summary = await aiSessionMemory.getContextSummary();

    let promptContext = "";
    
    if (context?.activeEntities.length) {
      promptContext += `Entidades em discussão: ${context.activeEntities.join(", ")}\n`;
    }
    
    if (summary) {
      promptContext += `\n${summary}`;
    }

    return promptContext;
  }, []);

  return {
    sessionId,
    isReady,
    memories,
    contextSummary,
    remember,
    storeFact,
    storePreference,
    storeContext,
    trackEntity,
    forget,
    clearSession,
    getPromptContext,
    refreshMemories,
  };
}
