/**
 * useCopilot - React hook for AI Copilot integration
 * PATCH: Global AI assistance with streaming and context awareness
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  streamCopilot, 
  queryCopilot, 
  getProactiveInsights,
  type CopilotMessage, 
  type CopilotContext, 
  type CopilotMode 
} from "@/lib/ai/copilot-client";
import { toast } from "sonner";

interface UseCopilotOptions {
  mode?: CopilotMode;
  autoContext?: boolean;
  persistMessages?: boolean;
}

const STORAGE_KEY = "nautilus_copilot_messages";

export function useCopilot(options: UseCopilotOptions = {}) {
  const { mode = "copilot", autoContext = true, persistMessages = false } = options;
  const location = useLocation();
  
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    if (persistMessages) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveInsights, setProactiveInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build context from current location
  const getContext = useCallback((): CopilotContext => {
    const route = location.pathname;
    const module = detectModule(route);
    
    return {
      currentRoute: route,
      currentModule: module,
      systemMetrics: {},
      userPreferences: {}
    };
  }, [location.pathname]);

  // Persist messages
  useEffect(() => {
    if (persistMessages && messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages, persistMessages]);

  // Fetch proactive insights on route change
  useEffect(() => {
    if (!autoContext) return;
    
    const fetchInsights = async () => {
      const context = getContext();
      const insights = await getProactiveInsights(context);
      setProactiveInsights(insights);
    };

    fetchInsights();
  }, [location.pathname, autoContext, getContext]);

  // Send streaming message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    const userMessage: CopilotMessage = { 
      role: "user", 
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

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
        return [...prev, { role: "assistant" as const, content: assistantContent, timestamp: new Date() }];
      });
    };

    try {
      await streamCopilot({
        messages: [...messages, userMessage],
        context: autoContext ? getContext() : undefined,
        mode,
        onDelta: updateAssistant,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          setError(err.message);
          setIsStreaming(false);
          if (err.message.includes("Rate limit")) {
            toast.error("Limite de requisições atingido", {
              description: "Aguarde alguns segundos e tente novamente."
            });
          } else if (err.message.includes("Payment")) {
            toast.error("Créditos insuficientes", {
              description: "Adicione créditos para continuar usando a IA."
            });
          } else {
            toast.error("Erro no Copilot", { description: err.message });
          }
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [messages, isStreaming, mode, autoContext, getContext]);

  // Quick query without streaming
  const quickQuery = useCallback(async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await queryCopilot(
        prompt, 
        autoContext ? getContext() : undefined,
        mode
      );
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Query failed";
      setError(message);
      toast.error("Erro na consulta", { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mode, autoContext, getContext]);

  // Clear conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
    if (persistMessages) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [persistMessages]);

  // Cancel streaming
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    isLoading,
    error,
    proactiveInsights,
    sendMessage,
    quickQuery,
    clearMessages,
    cancelStream,
    context: getContext()
  };
}

// Detect current module from route
function detectModule(route: string): string {
  const moduleMap: Record<string, string> = {
    "/fleet": "fleet",
    "/maritime": "crew",
    "/crew": "crew",
    "/maintenance": "maintenance",
    "/voyage": "voyage",
    "/finance": "finance",
    "/compliance": "compliance",
    "/training": "training",
    "/command": "command",
    "/analytics": "command",
    "/": "command"
  };

  for (const [path, module] of Object.entries(moduleMap)) {
    if (route.startsWith(path)) return module;
  }
  
  return "general";
}

export default useCopilot;
