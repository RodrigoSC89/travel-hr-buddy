/**
 * useAuditAgentChat - Streaming AI chat hook for audit agents
 * Uses Lovable AI Gateway via audit-agent-chat edge function
 */
import { useState, useCallback, useRef } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
}

const CHAT_URL = `https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/audit-agent-chat`;

export function useAuditAgentChat(agentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Build history from existing messages
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE`,
        },
        body: JSON.stringify({
          message: input,
          agentId,
          history,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const assistantId = `agent-${Date.now()}`;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  {
                    id: assistantId,
                    role: "assistant",
                    content: assistantContent,
                    timestamp: new Date(),
                    agentId,
                  },
                ];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return prev;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      
      // Fallback response if AI fails
      const fallbackMsg: ChatMessage = {
        id: `agent-fallback-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${err instanceof Error ? err.message : "Erro ao conectar com a IA"}. Tente novamente em instantes.`,
        timestamp: new Date(),
        agentId,
      };
      setMessages(prev => {
        // Remove incomplete assistant message if exists
        const filtered = prev.filter(m => !(m.role === "assistant" && m.content === ""));
        return [...filtered, fallbackMsg];
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [agentId, isStreaming, messages]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setInitialMessage = useCallback((content: string) => {
    setMessages([{
      id: `welcome-${agentId}`,
      role: "assistant",
      content,
      timestamp: new Date(),
      agentId,
    }]);
  }, [agentId]);

  return {
    messages,
    isStreaming,
    sendMessage,
    cancelStream,
    clearMessages,
    setInitialMessage,
  };
}
