/**
 * useAIHubChat - Hook para comunicação com a Edge Function ai-hub-chat
 * Suporta streaming e não-streaming, 16 módulos AI especializados
 */

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  module?: string;
}

export type AIModule = 
  | "command" | "peotram" | "peodp" | "aria" | "bunker" | "safety"
  | "compliance" | "fleet" | "crew" | "weather" | "maintenance"
  | "cargo" | "training" | "voyage" | "charter" | "mlc";

interface UseAIHubChatOptions {
  module?: AIModule;
  stream?: boolean;
  context?: Record<string, unknown>;
}

interface UseAIHubChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setModule: (module: AIModule) => void;
  currentModule: AIModule;
}

export function useAIHubChat(options: UseAIHubChatOptions = {}): UseAIHubChatReturn {
  const { 
    module: initialModule = "command", 
    stream = false, 
    context 
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<AIModule>(initialModule);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      module: currentModule,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Build API messages (last 10 for context window)
      const apiMessages = [...messages.slice(-10), userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/ai-hub-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token || ""}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE",
          },
          body: JSON.stringify({
            module: currentModule,
            messages: apiMessages,
            stream,
            context,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      if (stream && response.body) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        // Add placeholder assistant message
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          module: currentModule,
        };
        setMessages(prev => [...prev, assistantMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: fullContent,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();
        const assistantContent = data.choices?.[0]?.message?.content || "Sem resposta da IA.";

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toISOString(),
          module: currentModule,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      logger.error("[useAIHubChat] Error:", { error: msg, module: currentModule });
      setError(msg);

      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Erro: ${msg}. Tente novamente.`,
          timestamp: new Date().toISOString(),
          module: currentModule,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentModule, stream, context]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setModule = useCallback((mod: AIModule) => {
    setCurrentModule(mod);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setModule,
    currentModule,
  };
}
