/**
 * useNautilusBrain - Hook for AI-powered chat with Nautilus Brain
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface SystemContext {
  vessels?: { total: number; active: number; maintenance: number };
  alerts?: { count: number; critical: number };
  maintenance?: { pending: number; upcoming: number };
}

interface UseNautilusBrainReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

export function useNautilusBrain(context?: SystemContext): UseNautilusBrainReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/nautilus-brain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE"}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            context,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Aguarde um momento.");
          throw new Error("Rate limited");
        }
        if (response.status === 402) {
          toast.error("Créditos de IA insuficientes.");
          throw new Error("Payment required");
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (const raw of buffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {}
        }
      }
    } catch (error) {
      console.error("Nautilus Brain error:", error);
      if (!assistantContent) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.", 
          timestamp: new Date() 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, context]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
}
