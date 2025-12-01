/**
 * Nautilus Command AI Client
 * Streaming chat interface for AI command center
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const COMMAND_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nautilus-command`;

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface SystemContext {
  activeModules?: string[];
  recentLogs?: any[];
  systemHealth?: number;
  alerts?: any[];
}

export async function streamCommandChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  context?: SystemContext;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const resp = await fetch(COMMAND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        "x-user-id": user?.id || "anonymous",
      },
      body: JSON.stringify({ messages, context }),
    });

    if (!resp.ok) {
      throw new Error(`Failed to start stream: ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error("No response body");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
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
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    logger.error("Error in command chat", error as Error, { 
      messagesCount: messages.length,
      hasContext: !!context 
    });
    if (onError) {
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}
