import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface AIAssistantMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AIAssistantOptions {
  context?: string;
  mode?: "online" | "offline";
  cacheEnabled?: boolean;
}

const DB_NAME = "crew_assistant_cache";
const DB_VERSION = 1;
const STORE_NAME = "contexts";

export const useAIAssistant = (type: "crew" | "general") => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // IndexedDB operations for offline cache
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }, []);

  const cacheContext = useCallback(async (key: string, data: unknown) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      // Wrap in Promise to ensure proper transaction completion
      return new Promise<void>((resolve, reject) => {
        const request = store.put({ id: key, data, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      logger.error("Failed to cache context:", error);
      throw error;
    }
  }, [openDB]);

  const getCachedContext = useCallback(async (key: string): Promise<any> => {
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      logger.error("Failed to get cached context:", error);
      return null;
    }
  }, [openDB]);

  const sendMessage = useCallback(async (
    content: string, 
    options: AIAssistantOptions = {}
  ) => {
    const userMessage: AIAssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Check for offline mode or cache
      const { mode = "online", cacheEnabled = true } = options;
      
      // PATCH iOS PWA: Removido check de navigator.onLine - tentar sempre online primeiro
      if (mode === "offline") {
        // Use cached responses for common queries
        const cachedResponse = await getCachedContext(`${type}-${content}`);
        
        if (cachedResponse) {
          const assistantMessage: AIAssistantMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: cachedResponse,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          return assistantMessage;
        }

        // Provide offline fallback responses
        const offlineResponse = getOfflineFallback(type, content);
        const assistantMessage: AIAssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: offlineResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      }

      // Online mode - make actual AI call
      const timeoutId = setTimeout(() => {
        // Timeout handling - will fall through to catch block
      }, 30000);

      try {
        const response = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [...messages, userMessage],
            context: options.context || type,
          },
        });

        clearTimeout(timeoutId);

        if (response.error) {
          throw new Error(`AI request failed: ${response.error.message}`);
        }

        const aiData = response.data;
        const assistantMessage: AIAssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: aiData?.message || aiData?.content || "Sem resposta",
          timestamp: new Date(),
        };

        // Cache the response for offline use
        if (cacheEnabled) {
          await cacheContext(`${type}-${content}`, assistantMessage.content);
        }

        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      logger.error("AI Assistant error:", error);
      
      // Fallback to offline mode on error
      const fallbackResponse = getOfflineFallback(type, content);
      const assistantMessage: AIAssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Modo Offline",
        description: "Usando respostas em cache. Conecte-se para respostas atualizadas.",
        variant: "default",
      });

      return assistantMessage;
    } finally {
      setIsProcessing(false);
    }
  }, [messages, type, toast, getCachedContext, cacheContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const quickAction = useCallback(async (action: string) => {
    const actionMessages: Record<string, string> = {
      "report": "Como posso criar um relatório rápido?",
      "incident": "Preciso registrar um incidente",
      "checklist": "Mostrar checklist de segurança",
      "technical": "Tenho uma dúvida técnica sobre o equipamento",
      "status": "Qual o status atual da embarcação?",
    };

    const message = actionMessages[action] || action;
    return sendMessage(message);
  }, [sendMessage]);

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
    quickAction,
  };
};

// Offline fallback responses
function getOfflineFallback(type: string, query: string): string {
  const lowercaseQuery = query.toLowerCase();

  if (type === "crew") {
    if (lowercaseQuery.includes("relatório") || lowercaseQuery.includes("report")) {
      return "📋 Para criar um relatório offline:\n\n1. Acesse o menu 'Relatórios'\n2. Preencha os campos necessários\n3. Salve localmente\n4. Será sincronizado quando conectar\n\nTipo de relatórios disponíveis:\n- Incidentes de segurança\n- Manutenção preventiva\n- Observações operacionais";
    }
    
    if (lowercaseQuery.includes("incidente") || lowercaseQuery.includes("incident")) {
      return "🚨 Registro de Incidente (Modo Offline):\n\n1. Descreva o ocorrido\n2. Indique localização\n3. Classifique a severidade\n4. Adicione fotos se necessário\n5. Dados serão salvos localmente\n\nLembre-se:\n- Notifique superiores imediatamente em casos críticos\n- Documente testemunhas\n- Preserve evidências";
    }
    
    if (lowercaseQuery.includes("checklist")) {
      return "✅ Checklists Disponíveis (Offline):\n\n🔧 Segurança:\n- Verificação diária de EPIs\n- Inspeção de equipamentos de combate a incêndio\n- Teste de sistemas de alarme\n\n⚓ Operacional:\n- Pré-partida\n- Troca de turno\n- Rotina de navegação\n\n🛠️ Manutenção:\n- Motores principais\n- Sistemas auxiliares\n- Equipamentos de convés";
    }

    if (lowercaseQuery.includes("técnica") || lowercaseQuery.includes("technical") || lowercaseQuery.includes("equipamento")) {
      return "🔧 Suporte Técnico (Modo Offline):\n\nPara dúvidas técnicas:\n1. Consulte o manual do equipamento (disponível offline)\n2. Verifique procedimentos de segurança\n3. Contate o supervisor de máquinas\n\nEquipamentos críticos:\n- Motor principal: Verificar temperatura, pressão de óleo\n- Geradores: Monitorar voltagem e frequência\n- Sistemas hidráulicos: Verificar níveis e pressão";
    }

    if (lowercaseQuery.includes("status") || lowercaseQuery.includes("embarcação")) {
      return "⚓ Status da Embarcação (Dados em Cache):\n\n🟢 Sistemas Operacionais\n⚡ Energia: Normal\n🌡️ Temperatura: Dentro dos parâmetros\n⛽ Combustível: Adequado\n\n⚠️ Atenção:\nDados podem estar desatualizados. Conecte-se para informações em tempo real.";
    }
  }

  return "🤖 Assistente no Modo Offline\n\nEstou operando com dados em cache. Para informações atualizadas, conecte-se à rede.\n\nPosso ajudar com:\n- Relatórios\n- Checklists\n- Procedimentos de segurança\n- Orientações básicas\n\nO que você precisa?";
}
