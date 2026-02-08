/**
 * 🤖 useAgent - React hook for interacting with maritime AI agents
 * Supports both streaming and non-streaming modes.
 * Uses the ai-agent-chat Edge Function via Lovable AI Gateway.
 */
import { useState, useCallback, useRef } from "react";
import { callAgent, streamAgent, type Message } from "@/lib/ai/callAgent";
import { AGENT_CONTEXTS, type AgentContext } from "@/lib/ai/agentContexts";
import { toast } from "sonner";

interface UseAgentOptions {
  /** Enable streaming mode (default: true) */
  streaming?: boolean;
  /** Additional context to inject into agent system prompt */
  context?: string;
}

interface UseAgentReturn {
  /** Send a message to the agent */
  sendMessage: (message: string) => Promise<string>;
  /** Reset conversation history */
  resetConversation: () => void;
  /** Full conversation history */
  conversationHistory: Message[];
  /** Whether the agent is currently responding */
  isLoading: boolean;
  /** Last error message, if any */
  error: string | null;
  /** The agent's metadata (name, icon, color, etc.) */
  agent: AgentContext | undefined;
  /** The current partial streaming response */
  streamingContent: string;
}

export function useAgent(agentId: string, options: UseAgentOptions = {}): UseAgentReturn {
  const { streaming = true, context } = options;

  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef(false);

  const agent = AGENT_CONTEXTS[agentId];

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setStreamingContent("");
      abortRef.current = false;

      try {
        if (streaming) {
          // Streaming mode
          let fullResponse = "";

          await streamAgent(agentId, message, {
            context,
            conversationHistory,
            onDelta: (chunk) => {
              if (abortRef.current) return;
              fullResponse += chunk;
              setStreamingContent(fullResponse);
            },
            onDone: () => {
              // Will be handled below
            },
            onError: (err) => {
              throw err;
            },
          });

          // Update conversation history
          setConversationHistory((prev) => [
            ...prev,
            { role: "user", content: message },
            { role: "assistant", content: fullResponse },
          ]);

          setStreamingContent("");
          return fullResponse;
        } else {
          // Non-streaming mode
          const response = await callAgent(agentId, message, {
            context,
            conversationHistory,
          });

          setConversationHistory((prev) => [
            ...prev,
            { role: "user", content: message },
            { role: "assistant", content: response },
          ]);

          return response;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);

        // Show user-friendly toast for common errors
        if (errorMessage.includes("Rate limit")) {
          toast.error("Limite de requisições excedido. Aguarde alguns segundos.");
        } else if (errorMessage.includes("402") || errorMessage.includes("Créditos")) {
          toast.error("Créditos de IA esgotados. Recarregue seu plano.");
        } else {
          toast.error(`Erro do agente: ${errorMessage}`);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, streaming, context, conversationHistory]
  );

  const resetConversation = useCallback(() => {
    abortRef.current = true;
    setConversationHistory([]);
    setStreamingContent("");
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    sendMessage,
    resetConversation,
    conversationHistory,
    isLoading,
    error,
    agent,
    streamingContent,
  };
}
