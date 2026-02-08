/**
 * 🤖 Call Agent - Frontend interface to ai-agent-chat Edge Function
 * Routes agent calls through Supabase Edge Functions (secure, no API keys in browser).
 * Supports both streaming (SSE) and non-streaming modes.
 */
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { AGENT_CONTEXTS } from "./agentContexts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CallAgentOptions {
  /** Additional context to inject into the system prompt */
  context?: string;
  /** Conversation history */
  conversationHistory?: Message[];
  /** Enable streaming (default: false for callAgent, use streamAgent for streaming) */
  stream?: boolean;
}

const AGENT_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent-chat`;

/**
 * Call an agent and get a complete response (non-streaming).
 */
export async function callAgent(
  agentId: string,
  userMessage: string,
  options: CallAgentOptions = {}
): Promise<string> {
  const agentContext = AGENT_CONTEXTS[agentId];
  if (!agentContext) {
    throw new Error(
      `Unknown agent ID: ${agentId}. Available: ${Object.keys(AGENT_CONTEXTS).join(", ")}`
    );
  }

  const { context, conversationHistory = [] } = options;

  logger.info(`[callAgent] Calling ${agentContext.name} (${agentId})`);

  const { data, error } = await supabase.functions.invoke("ai-agent-chat", {
    body: {
      agentId,
      message: userMessage,
      messages: conversationHistory.length > 0
        ? [...conversationHistory, { role: "user", content: userMessage }]
        : undefined,
      context,
      stream: false,
    },
  });

  if (error) {
    console.error(`[callAgent] Error from ${agentContext.name}:`, error);
    throw new Error(`Failed to get response from ${agentContext.name}: ${error.message}`);
  }

  if (!data?.reply) {
    throw new Error(`Empty response from ${agentContext.name}`);
  }

  logger.info(`[callAgent] ${agentContext.name} responded (${data.responseTimeMs}ms)`);
  return data.reply;
}

/**
 * Stream an agent response token-by-token via SSE.
 * Uses fetch directly for streaming support (supabase.functions.invoke doesn't support streaming).
 */
export async function streamAgent(
  agentId: string,
  userMessage: string,
  options: CallAgentOptions & {
    onDelta: (text: string) => void;
    onDone: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  const agentContext = AGENT_CONTEXTS[agentId];
  if (!agentContext) {
    throw new Error(`Unknown agent ID: ${agentId}`);
  }

  const { context, conversationHistory = [], onDelta, onDone, onError } = options;

  logger.info(`[streamAgent] Streaming ${agentContext.name} (${agentId})`);

  try {
    const resp = await fetch(AGENT_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        agentId,
        message: userMessage,
        messages: conversationHistory.length > 0
          ? [...conversationHistory, { role: "user", content: userMessage }]
          : undefined,
        context,
        stream: true,
      }),
    });

    // Handle error status codes
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Unknown error" }));
      const errorMsg = errorData.error || `HTTP ${resp.status}`;
      throw new Error(errorMsg);
    }

    if (!resp.body) {
      throw new Error("No response body for streaming");
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
          // Incomplete JSON split across chunks, put back
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
        } catch {
          /* ignore partial leftovers */
        }
      }
    }

    onDone();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[streamAgent] Error from ${agentContext.name}:`, error);
    onError?.(error);
  }
}
