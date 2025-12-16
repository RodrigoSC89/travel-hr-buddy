/**
 * Hook dedicado para o Nautilus Command AI
 * Streaming chat otimizado para o centro de comando
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommandMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "pending" | "complete" | "error";
}

export interface SystemContext {
  fleet: { vessels: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

const COMMAND_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nautilus-command`;

export function useNautilusCommandAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CommandMessage[]>([]);

  const sendMessage = useCallback(async (
    content: string,
    context?: SystemContext,
    onStream?: (chunk: string) => void
  ): Promise<string | null> => {
    if (!content.trim()) return null;
    
    setIsLoading(true);

    const userMessage: CommandMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      status: "complete"
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: CommandMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "pending"
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    try {
      const messagesToSend = [
        ...messages.filter(m => m.status === "complete").map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: "user" as const, content }
      ];

      const resp = await fetch(COMMAND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: messagesToSend,
          context 
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Limite de requisições atingido. Aguarde um momento.");
          throw new Error("Rate limit exceeded");
        }
        if (resp.status === 402) {
          toast.error("Créditos insuficientes para uso da IA.");
          throw new Error("Payment required");
        }
        throw new Error(`Request failed: ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

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
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              fullResponse += chunk;
              onStream?.(chunk);
              setMessages(prev => prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: fullResponse }
                  : m
              ));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              fullResponse += chunk;
              onStream?.(chunk);
            }
          } catch {}
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: fullResponse, status: "complete" }
          : m
      ));

      setIsLoading(false);
      return fullResponse;

    } catch (error) {
      console.error("Command AI error:", error);
      
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: "Desculpe, ocorreu um erro ao processar sua solicitação.", status: "error" }
          : m
      ));
      
      setIsLoading(false);
      return null;
    }
  }, [messages]);

  const generateBriefing = useCallback(async (context: SystemContext): Promise<string | null> => {
    const prompt = `Gere um briefing executivo completo do dia considerando os dados atuais do sistema:
    
Frota: ${context.fleet.vessels} embarcações, ${context.fleet.active} ativas, ${context.fleet.alerts} com alertas
Tripulação: ${context.crew.total} pessoas, ${context.crew.onboard} a bordo, ${context.crew.expiringCerts} certificados expirando
Manutenção: ${context.maintenance.scheduled} agendadas, ${context.maintenance.overdue} vencidas, ${context.maintenance.efficiency}% eficiência
Estoque: ${context.inventory.lowStock} itens em baixo estoque, ${context.inventory.pendingOrders} pedidos pendentes
Compliance: ${context.compliance.score}% score, ${context.compliance.pendingAudits} auditorias pendentes

Formate o briefing de forma executiva, destacando alertas críticos e ações prioritárias.`;

    return sendMessage(prompt, context);
  }, [sendMessage]);

  const analyzeAlerts = useCallback(async (context: SystemContext): Promise<string | null> => {
    const prompt = `Analise todos os alertas ativos do sistema e forneça:
1. Priorização dos alertas por criticidade
2. Impacto operacional de cada alerta
3. Ações recomendadas imediatas
4. Previsão de recursos necessários

Dados atuais: ${JSON.stringify(context)}`;

    return sendMessage(prompt, context);
  }, [sendMessage]);

  const suggestActions = useCallback(async (context: SystemContext): Promise<string | null> => {
    const prompt = `Com base nos dados operacionais atuais, sugira as 5 ações prioritárias para hoje:
    
${JSON.stringify(context, null, 2)}

Para cada ação, indique:
- Prioridade (crítica/alta/média)
- Módulo responsável
- Tempo estimado
- Impacto esperado`;

    return sendMessage(prompt, context);
  }, [sendMessage]);

  const get360View = useCallback(async (context: SystemContext): Promise<string | null> => {
    const prompt = `Forneça uma visão 360° completa da operação:

1. STATUS DA FROTA
2. TRIPULAÇÃO E CERTIFICAÇÕES
3. MANUTENÇÃO E EQUIPAMENTOS
4. ESTOQUE E SUPRIMENTOS
5. COMPLIANCE E AUDITORIAS
6. ALERTAS E RISCOS
7. RECOMENDAÇÕES ESTRATÉGICAS

Dados: ${JSON.stringify(context)}`;

    return sendMessage(prompt, context);
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    generateBriefing,
    analyzeAlerts,
    suggestActions,
    get360View,
    clearMessages,
    setMessages
  };
}
