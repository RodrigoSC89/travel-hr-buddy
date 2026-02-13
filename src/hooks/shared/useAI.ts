/**
 * Unified AI Hooks - PATCH 865
 * Consolidação de hooks de IA para evitar duplicação
 * Migrated to edge-function-helper
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiteMode } from "@/components/performance/LiteMode";
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

// =====================================
// Types
// =====================================

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  confidence?: number;
  sources?: string[];
  tokens?: number;
  model?: string;
}

export interface AIMemoryEntry {
  id: string;
  type: "context" | "preference" | "interaction" | "insight";
  content: unknown;
  importance: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AIDecision {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "executed";
  actionPayload?: unknown;
}

// =====================================
// useAIChat - Chat with streaming
// =====================================

export function useAIChat(options?: {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLiteMode } = useLiteMode();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: AIMessage = {
      role: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        getEdgeFunctionUrl('chat'),
        {
          method: "POST",
          headers: getEdgeFunctionHeaders(),
          body: JSON.stringify({
            messages: [
              ...(options?.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: "user", content }
            ],
            model: options?.model || "google/gemini-2.5-flash",
            stream: !isLiteMode,
            max_tokens: options?.maxTokens || 2048
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit excedido. Tente novamente em alguns segundos.");
        }
        if (response.status === 402) {
          throw new Error("Créditos insuficientes. Entre em contato com o suporte.");
        }
        throw new Error("Erro ao processar solicitação");
      }

      // Handle streaming or non-streaming response
      if (!isLiteMode && response.body) {
        let assistantContent = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantContent += delta;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return prev.map((m, i) => 
                        i === prev.length - 1 ? { ...m, content: assistantContent } : m
                      );
                    }
                    return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
                  });
                }
              } catch { /* expected: partial SSE JSON chunk */ }
            }
          }
        }
      } else {
        const data = await response.json();
        const assistantMessage: AIMessage = {
          role: "assistant",
          content: data.choices?.[0]?.message?.content || data.content || "Sem resposta",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro na IA",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, options, isLiteMode, toast]);

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearMessages,
    setMessages
  };
}

// =====================================
// useAIMemory - Context persistence
// =====================================

export function useAIMemory(namespace: string = "default") {
  const [memory, setMemory] = useState<AIMemoryEntry[]>([]);
  const storageKey = `nauti-ai-memory-${namespace}`;

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter expired entries
        const valid = parsed.filter((entry: AIMemoryEntry) => 
          !entry.expiresAt || new Date(entry.expiresAt) > new Date()
        );
        setMemory(valid);
      }
    } catch { /* storage unavailable */ }
  }, [storageKey]);

  const saveMemory = useCallback((entries: AIMemoryEntry[]) => {
    setMemory(entries);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(entries));
    } catch { /* storage unavailable */ }
  }, [storageKey]);

  const addEntry = useCallback((entry: Omit<AIMemoryEntry, "id" | "createdAt">) => {
    const newEntry: AIMemoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    saveMemory([...memory, newEntry]);
    return newEntry;
  }, [memory, saveMemory]);

  const removeEntry = useCallback((id: string) => {
    saveMemory(memory.filter(e => e.id !== id));
  }, [memory, saveMemory]);

  const getRelevantContext = useCallback((query: string, limit: number = 5) => {
    // Simple relevance scoring based on content matching
    return memory
      .map(entry => ({
        ...entry,
        score: typeof entry.content === "string" 
          ? query.toLowerCase().split(" ").filter(w => 
              (entry.content as string).toLowerCase().includes(w)
            ).length * entry.importance
          : entry.importance
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [memory]);

  const clearMemory = useCallback(() => {
    setMemory([]);
    try {
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey); // cleanup legacy
    } catch { /* storage unavailable */ }
  }, [storageKey]);

  return {
    memory,
    addEntry,
    removeEntry,
    getRelevantContext,
    clearMemory
  };
}

// =====================================
// useAIDecisions - Autonomous decisions
// =====================================

export function useAIDecisions() {
  const [decisions, setDecisions] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDecisions = useCallback(async (status?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDecisions(data || []);
    } catch (error) {
      logger.error("[AIDecisions] Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveDecision = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ status: "approved", executed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      await fetchDecisions();
    } catch (error) {
      logger.error("[AIDecisions] Approve error:", error);
    }
  }, [fetchDecisions]);

  const rejectDecision = useCallback(async (id: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from("ai_decisions")
        .update({ status: "rejected", rejected_reason: reason })
        .eq("id", id);

      if (error) throw error;
      await fetchDecisions();
    } catch (error) {
      logger.error("[AIDecisions] Reject error:", error);
    }
  }, [fetchDecisions]);

  const provideFeedback = useCallback(async (id: string, wasCorrect: boolean, notes?: string) => {
    try {
      const { error } = await supabase
        .from("ai_decisions")
        .update({
          feedback_was_correct: wasCorrect,
          feedback_notes: notes,
          feedback_provided_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      await fetchDecisions();
    } catch (error) {
      logger.error("[AIDecisions] Feedback error:", error);
    }
  }, [fetchDecisions]);

  return {
    decisions,
    isLoading,
    fetchDecisions,
    approveDecision,
    rejectDecision,
    provideFeedback
  };
}

// =====================================
// useAIInsights - Analytics insights
// =====================================

export function useAIInsights(organizationId?: string) {
  const [insights, setInsights] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      logger.error("[AIInsights] Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  const dismissInsight = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_insights")
        .update({ status: "dismissed" })
        .eq("id", id);

      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      logger.error("[AIInsights] Dismiss error:", error);
    }
  }, [fetchInsights]);

  const actOnInsight = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_insights")
        .update({ status: "acted_upon" })
        .eq("id", id);

      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      logger.error("[AIInsights] Act error:", error);
    }
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    fetchInsights,
    dismissInsight,
    actOnInsight
  };
}

// =====================================
// useAITelemetry - Performance metrics
// =====================================

export function useAITelemetry() {
  const logInteraction = useCallback(async (data: {
    userInput: string;
    aiResponse?: string;
    moduleName?: string;
    responseTimeMs?: number;
    tokensInput?: number;
    tokensOutput?: number;
    confidenceScore?: number;
  }) => {
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: data.userInput,
        ai_response: data.aiResponse,
        module_name: data.moduleName,
        response_time_ms: data.responseTimeMs,
        tokens_input: data.tokensInput,
        tokens_output: data.tokensOutput,
        confidence_score: data.confidenceScore,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error("[AITelemetry] Log error:", error);
    }
  }, []);

  return { logInteraction };
}
