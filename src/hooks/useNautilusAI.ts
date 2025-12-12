/**
 * NAUTILUS AI - Hook Universal para LLM em todos os módulos
 * Centraliza chamadas de IA com contexto específico por módulo
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AIModule = 
  | "maintenance" 
  | "crew" 
  | "procurement" 
  | "voyage" 
  | "qhse" 
  | "training" 
  | "peodp" 
  | "finance"
  | "command"
  | "general";

export type AIAction = 
  | "predict" 
  | "analyze" 
  | "suggest" 
  | "generate" 
  | "chat"
  | "summarize"
  | "match"
  | "optimize";

// Helper type for the hook return

interface AIRequest {
  module: AIModule;
  action: AIAction;
  prompt: string;
  context?: Record<string, unknown>;
  stream?: boolean;
}

interface AIResponse {
  response: string;
  suggestions?: string[];
  references?: string[];
  confidence?: number;
  metadata?: Record<string, unknown>;
}

const MODULE_PROMPTS: Record<AIModule, string> = {
  maintenance: "Você é um especialista em manutenção preditiva marítima. Analise dados de equipamentos, preveja falhas, sugira manutenções e otimize cronogramas. Use normas SOLAS, ISM e classificadoras.",
  
  crew: "Você é um especialista em gestão de tripulação marítima. Otimize escalas considerando fadiga (MLC 2006), competências, certificações STCW, e bem-estar. Faça matching inteligente tripulante-embarcação.",
  
  procurement: "Você é um especialista em compras e supply chain marítimo. Analise TCO, sugira fornecedores, preveja necessidades de estoque e otimize pedidos. Considere lead times portuários.",
  
  voyage: "Você é um especialista em planejamento de viagens marítimas. Otimize rotas considerando clima, combustível, manutenção pendente, crew planning e custos. Integre dados de ECDIS e weather routing.",
  
  qhse: "Você é um especialista em QHSE marítimo. Monitore compliance ISM/ISPS, TMSA, prepare para vettings OCIMF, gere evidências de conformidade e identifique gaps de segurança.",
  
  training: "Você é um tutor especializado em treinamento marítimo. Crie trilhas personalizadas, gere conteúdo adaptativo, avalie competências STCW e sugira certificações. Simule cenários operacionais.",
  
  peodp: "Você é um especialista em PEO-DP (Petrobras) e Posicionamento Dinâmico. Conhece IMCA, IMO, NORMAM, os 7 pilares do programa, ASOG, FMEA, e procedimentos de auditoria. Gere evidências de conformidade.",
  
  finance: "Você é um especialista em gestão financeira marítima. Analise custos operacionais (OPEX), TCE, budget variance, preveja despesas e sugira otimizações. Considere bunker, crew costs, maintenance.",
  
  command: "Você é o Nautilus Command - centro de comando inteligente. Tem visão 360° de toda operação: frota, crew, manutenção, compliance, finanças. Priorize alertas por criticidade e impacto.",
  
  general: "Você é o Nautilus Brain - assistente inteligente do sistema Nautilus One. Ajude em qualquer aspecto da gestão marítima com conhecimento técnico e prático."
};

export function useNautilusAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async ({
    module,
    action,
    prompt,
    context = {},
    stream = false
  }: AIRequest): Promise<AIResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const actionContext = getActionContext(action);

      const { data, error: fnError } = await supabase.functions.invoke("nautilus-ai", {
        body: {
          module,
          action,
          prompt: `${actionContext}\n\n${prompt}`,
          context
        }
      });

      if (fnError) throw fnError;

      return {
        response: data?.response || "Não foi possível processar a solicitação.",
        suggestions: data?.suggestions || [],
        references: data?.references || [],
        confidence: data?.confidence,
        metadata: data?.metadata
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro na consulta IA";
      setError(message);
      toast.error("Erro na IA", { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predict = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "predict", prompt, context }), [query]);

  const analyze = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "analyze", prompt, context }), [query]);

  const suggest = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "suggest", prompt, context }), [query]);

  const generate = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "generate", prompt, context }), [query]);

  const chat = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "chat", prompt, context }), [query]);

  const optimize = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "optimize", prompt, context }), [query]);

  const match = useCallback((module: AIModule, prompt: string, context?: Record<string, unknown>) => 
    query({ module, action: "match", prompt, context }), [query]);

  return {
    query,
    predict,
    analyze,
    suggest,
    generate,
    chat,
    optimize,
    match,
    isLoading,
    error
  };
}

function getActionContext(action: AIAction): string {
  switch (action) {
  case "predict":
    return "TAREFA: Fazer previsão/predição baseada nos dados fornecidos. Inclua probabilidades e horizonte temporal.";
  case "analyze":
    return "TAREFA: Analisar os dados fornecidos. Identifique padrões, anomalias e insights acionáveis.";
  case "suggest":
    return "TAREFA: Sugerir ações ou melhorias. Priorize por impacto e facilidade de implementação.";
  case "generate":
    return "TAREFA: Gerar conteúdo/documento conforme solicitado. Siga padrões e normas aplicáveis.";
  case "chat":
    return "TAREFA: Responder à pergunta de forma clara e técnica. Cite referências quando aplicável.";
  case "summarize":
    return "TAREFA: Resumir as informações fornecidas. Destaque pontos-chave e ações necessárias.";
  case "match":
    return "TAREFA: Fazer matching/correspondência inteligente entre os elementos fornecidos.";
  case "optimize":
    return "TAREFA: Otimizar o processo/recurso fornecido. Considere múltiplos objetivos e restrições.";
  default:
    return "";
  }
}

export default useNautilusAI;
