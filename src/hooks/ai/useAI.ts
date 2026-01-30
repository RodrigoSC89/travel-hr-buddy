/**
 * useAI - Hook Genérico de Chat para todas as 16 IAs
 * Centraliza chamadas com histórico, typing states, e configuração por provider
 */

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export type AIProvider = 
  | "command-center" 
  | "peotram" 
  | "peo-dp" 
  | "crew" 
  | "fleet" 
  | "safety" 
  | "compliance" 
  | "weather" 
  | "maintenance" 
  | "cargo" 
  | "training" 
  | "voyage" 
  | "charter" 
  | "mlc" 
  | "bunker" 
  | "aria";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface AIConfig {
  provider: AIProvider;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enableConsensus?: boolean;
}

export interface UseAIReturn {
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => void;
  clearHistory: () => void;
  isLoading: boolean;
  error: Error | null;
}

const PROVIDER_SYSTEM_PROMPTS: Record<AIProvider, string> = {
  "command-center": `Você é o Command Center AI do Nautilus One. Tem visão 360° de toda operação marítima: frota, tripulação, manutenção, compliance, finanças. Priorize alertas por criticidade e impacto. Seja conciso e direto.`,
  
  "peotram": `Você é o PEOTRAM AI - especialista nos 13 elementos do Programa de Excelência Operacional. Ajude com auditorias, evidências, scores e ações corretivas. Cite os elementos específicos (1.1, 2.3, etc).`,
  
  "peo-dp": `Você é o PEO-DP AI - especialista em Posicionamento Dinâmico da Petrobras. Conhece IMCA, IMO, NORMAM, os 7 pilares, ASOG, FMEA, e procedimentos de auditoria. Gere evidências de conformidade.`,
  
  "crew": `Você é o Crew AI - especialista em gestão de tripulação marítima. Otimize escalas considerando fadiga (MLC 2006), competências, certificações STCW, e bem-estar. Faça matching inteligente.`,
  
  "fleet": `Você é o Fleet AI - especialista em gestão de frota marítima. Monitore status operacional, manutenções pendentes, consumo de combustível, e performance geral da frota.`,
  
  "safety": `Você é o Safety AI - especialista em segurança marítima (QHSE). Monitore ISM/ISPS, TMSA, prepare para vettings OCIMF, identifique gaps de segurança e sugira ações preventivas.`,
  
  "compliance": `Você é o Compliance AI - especialista em conformidade regulatória marítima. Monitore ANTAQ, MARPOL, SOLAS, ISM, MLC 2006, STCW. Alerte sobre documentos vencendo e auditorias pendentes.`,
  
  "weather": `Você é o Weather AI - especialista em meteorologia marítima e weather routing. Analise condições meteo, sugira rotas otimizadas, alerte sobre mau tempo e janelas de operação.`,
  
  "maintenance": `Você é o Maintenance AI - especialista em manutenção preditiva marítima. Analise dados de equipamentos, preveja falhas, sugira manutenções e otimize cronogramas usando normas SOLAS e ISM.`,
  
  "cargo": `Você é o Cargo AI - especialista em operações de carga marítima. Otimize estivagem, calcule estabilidade, monitore condições de carga e planeje operações de carga/descarga.`,
  
  "training": `Você é o Training AI - tutor especializado em treinamento marítimo. Crie trilhas personalizadas, avalie competências STCW, sugira certificações e simule cenários operacionais.`,
  
  "voyage": `Você é o Voyage AI - especialista em planejamento de viagens. Otimize rotas considerando clima, combustível, manutenção, crew planning e custos. Integre weather routing.`,
  
  "charter": `Você é o Charter AI - especialista em afretamento marítimo. Analise contratos, calcule TCE, avalie charterparties, monitore laytimes e demurrages. Sugira otimizações comerciais.`,
  
  "mlc": `Você é o MLC AI - especialista em Maritime Labour Convention 2006. Monitore conformidade com direitos trabalhistas, condições a bordo, pagamentos, descanso, e repatriação.`,
  
  "bunker": `Você é o Bunker AI - especialista em combustível marítimo. Otimize compras de bunker, monitore consumo, sugira melhores portos para abastecimento e analise qualidade do combustível.`,
  
  "aria": `Você é ARIA - assistente de voz do Nautilus One. Responda de forma conversacional e natural. Ajude em qualquer aspecto da operação marítima. Seja proativa e sugira ações.`,
};

export function useAI(config: AIConfig): UseAIReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const systemPrompt = config.systemPrompt || PROVIDER_SYSTEM_PROMPTS[config.provider];

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsTyping(true);

      try {
        // Build history for context (last 10 messages max)
        const historyContext = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const { data, error } = await supabase.functions.invoke("nauti-ai", {
          body: {
            module: config.provider,
            action: "chat",
            prompt: message,
            context: {
              history: historyContext,
              systemPrompt,
              temperature: config.temperature ?? 0.7,
              maxTokens: config.maxTokens ?? 1000,
              enableConsensus: config.enableConsensus ?? false,
            },
          },
        });

        if (error) throw error;

        return data?.response || "Não foi possível processar a solicitação.";
      } finally {
        setIsTyping(false);
      }
    },
    onSuccess: (response, message) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message, timestamp: new Date() },
        { role: "assistant", content: response, timestamp: new Date() },
      ]);
    },
    onError: (error) => {
      logger.error("AI chat failed", { error, provider: config.provider });
      toast.error("Falha ao comunicar com IA", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      chatMutation.mutate(message);
    },
    [chatMutation]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
  };
}

// ============================================
// Specialized hooks for each of the 16 AIs
// ============================================

export function useCommandCenterAI() {
  return useAI({
    provider: "command-center",
    enableConsensus: true,
  });
}

export function usePeotramAI() {
  return useAI({
    provider: "peotram",
    enableConsensus: true,
  });
}

export function usePeoDpAI() {
  return useAI({
    provider: "peo-dp",
    enableConsensus: true,
  });
}

export function useCrewAI() {
  return useAI({
    provider: "crew",
    enableConsensus: true,
  });
}

export function useFleetAI() {
  return useAI({
    provider: "fleet",
    enableConsensus: true,
  });
}

export function useSafetyAI() {
  return useAI({
    provider: "safety",
    enableConsensus: true,
  });
}

export function useComplianceAI() {
  return useAI({
    provider: "compliance",
    enableConsensus: true,
  });
}

export function useWeatherAI() {
  return useAI({
    provider: "weather",
    enableConsensus: false, // Weather is more factual
  });
}

export function useMaintenanceAI() {
  return useAI({
    provider: "maintenance",
    enableConsensus: true,
  });
}

export function useCargoAI() {
  return useAI({
    provider: "cargo",
    enableConsensus: false,
  });
}

export function useTrainingAI() {
  return useAI({
    provider: "training",
    enableConsensus: false,
  });
}

export function useVoyageAI() {
  return useAI({
    provider: "voyage",
    enableConsensus: true,
  });
}

export function useCharterAI() {
  return useAI({
    provider: "charter",
    enableConsensus: true,
  });
}

export function useMlcAI() {
  return useAI({
    provider: "mlc",
    enableConsensus: true,
  });
}

export function useBunkerAI() {
  return useAI({
    provider: "bunker",
    enableConsensus: false,
  });
}

export function useAriaAI() {
  return useAI({
    provider: "aria",
    temperature: 0.8, // More creative for voice
    enableConsensus: false,
  });
}

export default useAI;
