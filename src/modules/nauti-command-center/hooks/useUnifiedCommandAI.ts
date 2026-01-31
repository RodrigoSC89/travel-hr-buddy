/**
 * Hook unificado para IA do Command Center
 * Usa Lovable AI Gateway para chat, análise e insights
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "pending" | "streaming" | "complete" | "error";
}

export interface AIInsight {
  id: string;
  type: "opportunity" | "risk" | "optimization" | "prediction";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  actions?: string[];
}

const AI_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nauti-command`;

export function useUnifiedCommandAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [aiStatus, setAiStatus] = useState<"ready" | "busy" | "error">("ready");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat with streaming
  const sendMessage = useCallback(async (
    content: string,
    context?: Record<string, unknown>,
    onStream?: (chunk: string) => void
  ): Promise<string | null> => {
    if (!content.trim() || isLoading) return null;

    setIsLoading(true);
    setAiStatus("busy");

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      status: "complete"
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: AIMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "pending"
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    try {
      const messagesToSend = messages
        .filter(m => m.status === "complete")
        .map(m => ({ role: m.role, content: m.content }));
      
      messagesToSend.push({ role: "user", content });

      const response = await fetch(AI_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "chat",
          messages: messagesToSend,
          context
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições atingido. Aguarde um momento.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("Créditos insuficientes para IA.");
          throw new Error("Payment required");
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, status: "streaming" } : m
      ));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onStream?.(content);
              
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: fullResponse } : m
              ));
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, status: "complete" } : m
      ));

      setAiStatus("ready");
      return fullResponse;

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }
      
      logger.error("AI error:", error);
      setAiStatus("error");
      
      setMessages(prev => prev.map(m =>
        m.id === assistantId 
          ? { ...m, content: "Desculpe, ocorreu um erro. Tente novamente.", status: "error" }
          : m
      ));

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  // Generate insights
  const generateInsights = useCallback(async (
    data: Record<string, unknown>
  ): Promise<AIInsight[]> => {
    try {
      const response = await fetch(AI_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "insights",
          data
        })
      });

      if (!response.ok) throw new Error("Failed to generate insights");

      const result = await response.json();
      return result.insights || [];
    } catch (error) {
      logger.error("Error generating insights:", error);
      return [];
    }
  }, []);

  // Analyze data
  const analyzeData = useCallback(async (
    analysisType: "trend" | "anomaly" | "prediction",
    data: unknown[]
  ): Promise<string> => {
    try {
      const response = await fetch(AI_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "analysis",
          analysisType,
          data
        })
      });

      if (!response.ok) throw new Error("Failed to analyze data");

      const result = await response.json();
      return result.analysis || "";
    } catch (error) {
      logger.error("Error analyzing data:", error);
      throw error;
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setAiStatus("ready");
    }
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    aiStatus,
    sendMessage,
    generateInsights,
    analyzeData,
    clearMessages,
    cancelRequest
  };
}
