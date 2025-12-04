/**
 * AI Advisor Hook - Personalidade Adaptativa para PEO-DP
 * Adapta respostas baseado no perfil do usuário (DPO, Inspetor, Gestor)
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = "dpo" | "inspector" | "manager" | "engineer" | "auditor";

interface AIAdvisorConfig {
  profile: UserProfile;
  language?: "pt-BR" | "en-US";
  context?: string;
}

interface AIAdvisorResponse {
  response: string;
  confidence: number;
  sources?: string[];
  recommendations?: string[];
  profile: UserProfile;
}

const profilePrompts: Record<UserProfile, string> = {
  dpo: `Você é um assistente técnico especializado para DPOs (Dynamic Positioning Operators). 
Foque em:
- Procedimentos operacionais práticos
- Respostas rápidas e objetivas
- Referências a ASOG, FMEA e manuais
- Linguagem técnica de operação DP
- Alertas de segurança e limites operacionais`,

  inspector: `Você é um assistente para Inspetores/Auditores de conformidade DP.
Foque em:
- Verificação de conformidade com normas IMCA/IMO
- Checklists de auditoria
- Evidências e documentação
- Gap analysis e não-conformidades
- Referências normativas específicas (M117, M103, M166)`,

  manager: `Você é um assistente executivo para Gestores de operações offshore.
Foque em:
- Visão estratégica e KPIs
- Análise de riscos corporativos
- Relatórios executivos concisos
- ROI e eficiência operacional
- Decisões de alto nível`,

  engineer: `Você é um assistente técnico para Engenheiros de sistemas DP.
Foque em:
- Diagnósticos técnicos detalhados
- Análise de FMEA e redundância
- Especificações de equipamentos
- Troubleshooting avançado
- Manutenção preditiva`,

  auditor: `Você é um assistente para Auditores externos (PEOTRAM, Petrobras, Lloyd's).
Foque em:
- Conformidade regulatória estrita
- Documentação para certificação
- Trilha de auditoria completa
- Padrões internacionais
- Evidências objetivas`
};

const profileTones: Record<UserProfile, string> = {
  dpo: "direto, técnico, orientado a ação",
  inspector: "metódico, detalhado, baseado em normas",
  manager: "estratégico, conciso, focado em resultados",
  engineer: "analítico, técnico profundo, orientado a soluções",
  auditor: "formal, objetivo, documentado"
};

export function useAIAdvisor(config: AIAdvisorConfig) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIAdvisorResponse | null>(null);

  const ask = useCallback(async (question: string): Promise<AIAdvisorResponse> => {
    setLoading(true);
    setError(null);

    try {
      const systemPrompt = `${profilePrompts[config.profile]}

Tom de comunicação: ${profileTones[config.profile]}
${config.context ? `Contexto adicional: ${config.context}` : ""}

Sempre responda em ${config.language === "en-US" ? "inglês" : "português brasileiro"}.
Seja específico e cite normas/referências quando aplicável.`;

      const { data, error: fnError } = await supabase.functions.invoke("ai-advisor", {
        body: {
          question,
          systemPrompt,
          profile: config.profile,
        },
      });

      if (fnError) throw fnError;

      const response: AIAdvisorResponse = {
        response: data?.response || "Desculpe, não consegui processar sua pergunta.",
        confidence: data?.confidence || 0.8,
        sources: data?.sources || [],
        recommendations: data?.recommendations || [],
        profile: config.profile,
      };

      setLastResponse(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      
      // Fallback response
      const fallbackResponse: AIAdvisorResponse = {
        response: getFallbackResponse(config.profile, question),
        confidence: 0.5,
        profile: config.profile,
      };
      setLastResponse(fallbackResponse);
      return fallbackResponse;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const generateEvidence = useCallback(async (eventData: any): Promise<string> => {
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-advisor", {
        body: {
          action: "generate-evidence",
          eventData,
          profile: config.profile,
        },
      });

      if (fnError) throw fnError;
      return data?.evidence || generateFallbackEvidence(eventData);
    } catch {
      return generateFallbackEvidence(eventData);
    } finally {
      setLoading(false);
    }
  }, [config.profile]);

  const generateJustification = useCallback(async (decision: any): Promise<string> => {
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-advisor", {
        body: {
          action: "generate-justification",
          decision,
          profile: config.profile,
        },
      });

      if (fnError) throw fnError;
      return data?.justification || generateFallbackJustification(decision);
    } catch {
      return generateFallbackJustification(decision);
    } finally {
      setLoading(false);
    }
  }, [config.profile]);

  return {
    ask,
    generateEvidence,
    generateJustification,
    loading,
    error,
    lastResponse,
    profile: config.profile,
  };
}

function getFallbackResponse(profile: UserProfile, question: string): string {
  const fallbacks: Record<UserProfile, string> = {
    dpo: "Verifique o ASOG e procedimentos operacionais relevantes. Para situações críticas, consulte o SDPO.",
    inspector: "Consulte as normas IMCA aplicáveis (M117, M103, M166) para orientação de conformidade.",
    manager: "Análise requer dados adicionais. Consulte o dashboard de KPIs para métricas atualizadas.",
    engineer: "Verifique os logs de sistema e documentação FMEA para diagnóstico técnico detalhado.",
    auditor: "Consulte a matriz de conformidade e colete evidências documentais para verificação.",
  };
  return fallbacks[profile];
}

function generateFallbackEvidence(eventData: any): string {
  return `## Resumo de Evidência

**Evento:** ${eventData.type || "Não especificado"}
**Data:** ${eventData.date || new Date().toISOString()}
**Embarcação:** ${eventData.vessel || "N/A"}

### Descrição
${eventData.description || "Detalhes do evento não disponíveis."}

### Status de Conformidade
- Verificação de normas: Pendente
- Documentação: Em análise

*Evidência gerada automaticamente pelo Nautilus One*`;
}

function generateFallbackJustification(decision: any): string {
  return `## Justificativa Técnica

**Decisão:** ${decision.title || "Não especificada"}
**Responsável:** ${decision.decidedBy || "N/A"}
**Data:** ${decision.date || new Date().toISOString()}

### Fundamentação
${decision.justification || "Justificativa técnica pendente de análise."}

### Impacto
- Nível: ${decision.impact || "Médio"}
- Área afetada: Operações DP

### Conformidade
Esta decisão está alinhada com os procedimentos operacionais padrão.

*Justificativa gerada automaticamente pelo Nautilus One*`;
}
