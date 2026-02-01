/**
 * AI Copilot Client - Streaming client for global AI copilot
 * PATCH: Real-time AI assistance across all modules
 */

import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";

export type CopilotMode = "copilot" | "analyst" | "commander" | "auditor";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface CopilotContext {
  currentRoute?: string;
  currentModule?: string;
  systemMetrics?: Record<string, unknown>;
  userPreferences?: Record<string, unknown>;
}

export interface StreamCopilotOptions {
  messages: CopilotMessage[];
  context?: CopilotContext;
  mode?: CopilotMode;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

/**
 * Stream AI Copilot responses with real-time token delivery
 */
export async function streamCopilot({
  messages,
  context,
  mode = "copilot",
  onDelta,
  onDone,
  onError
}: StreamCopilotOptions): Promise<void> {
  try {
    const response = await fetch(getEdgeFunctionUrl('ai-copilot-stream'), {
      method: "POST",
      headers: getEdgeFunctionHeaders(),
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        context,
        mode
      }),
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Stream failed: ${response.status}`);
    }

    const reader = response.body.getReader();
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

    // Flush remaining buffer
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
    const err = error instanceof Error ? error : new Error("Unknown streaming error");
    onError?.(err);
  }
}

/**
 * Non-streaming copilot query for quick responses
 */
export async function queryCopilot(
  prompt: string,
  context?: CopilotContext,
  mode: CopilotMode = "copilot"
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("nauti-ai", {
    body: {
      module: context?.currentModule || "general",
      action: "chat",
      prompt,
      context
    }
  });

  if (error) throw error;
  return data?.response || "Unable to process request.";
}

/**
 * Get proactive insights based on current context
 */
export async function getProactiveInsights(context: CopilotContext): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("nauti-ai", {
    body: {
      module: context.currentModule || "command",
      action: "analyze",
      context: {
        route: context.currentRoute,
        metrics: context.systemMetrics,
        timestamp: new Date().toISOString()
      }
    }
  });

  if (error) return [];
  
  // Parse insights from response
  const response = data?.response || "";
  const insights = response
    .split(/\n[-•*]/)
    .filter((line: string) => line.trim().length > 10)
    .slice(0, 5);
  
  return insights;
}
