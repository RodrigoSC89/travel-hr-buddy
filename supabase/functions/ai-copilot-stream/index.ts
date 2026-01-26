/**
 * AI Copilot Stream - Streaming AI responses for real-time interaction
 * PATCH: Global AI Copilot with context-aware responses
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "AI-COPILOT-STREAM";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CopilotRequest {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: {
    currentRoute?: string;
    currentModule?: string;
    systemMetrics?: Record<string, unknown>;
    userPreferences?: Record<string, unknown>;
  };
  mode?: "copilot" | "analyst" | "commander" | "auditor";
}

const MODE_PROMPTS: Record<string, string> = {
  copilot: `Você é o Nautilus Copilot - um assistente IA integrado ao sistema de gestão marítima Nautilus One.

SUAS CAPACIDADES:
- Análise em tempo real de dados operacionais
- Previsão de riscos e anomalias
- Geração de insights acionáveis
- Sugestões proativas baseadas no contexto atual
- Navegação por linguagem natural

COMPORTAMENTO:
- Seja conciso e direto
- Priorize informações críticas
- Sugira ações específicas quando aplicável
- Use dados do contexto fornecido
- Responda em português brasileiro

FORMATO:
- Use markdown para formatação
- Destaque alertas com 🚨
- Use ✅ para confirmações
- Use 📊 para métricas
- Use 💡 para insights`,

  analyst: `Você é o Nautilus Analyst - especialista em análise de dados marítimos.

FOCO:
- Análise profunda de tendências
- Correlações entre métricas
- Previsões baseadas em histórico
- Identificação de padrões

Forneça análises detalhadas com dados quantitativos quando disponíveis.`,

  commander: `Você é o Nautilus Commander - centro de comando inteligente.

PRIORIDADES:
1. Alertas críticos e segurança
2. Status operacional em tempo real
3. Decisões táticas urgentes
4. Coordenação de recursos

Seja extremamente conciso. Foque em ação imediata.`,

  auditor: `Você é o Nautilus Auditor - especialista em compliance e ESG marítimo.

EXPERTISE:
- SOLAS, MARPOL, ISM Code
- MLC 2006, STCW
- ESG e sustentabilidade
- Auditorias OCIMF/CDI

Identifique gaps de conformidade e sugira ações corretivas.`
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { messages, context, mode = "copilot" }: CopilotRequest = await req.json();

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(mode, context);

    // Add context to the conversation if available
    const contextMessage = context ? buildContextMessage(context) : null;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...(contextMessage ? [{ role: "system", content: contextMessage }] : []),
      ...messages
    ];

    edgeLogger.info(TAG, `Request`, { mode, route: context?.currentRoute || "unknown" });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      edgeLogger.error(TAG, "Gateway error", { status: response.status, error: errorText });
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    edgeLogger.error(TAG, "Error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(mode: string, context?: CopilotRequest["context"]): string {
  let prompt = MODE_PROMPTS[mode] || MODE_PROMPTS.copilot;

  if (context?.currentModule) {
    const moduleContexts: Record<string, string> = {
      "fleet": "Você está no módulo de FROTA. Foque em embarcações, status operacional e tracking.",
      "crew": "Você está no módulo de TRIPULAÇÃO. Foque em escalas, certificações e bem-estar.",
      "maintenance": "Você está no módulo de MANUTENÇÃO. Foque em ordens de serviço, previsões e custos.",
      "voyage": "Você está no módulo de VIAGENS. Foque em rotas, ETA, consumo e weather routing.",
      "finance": "Você está no módulo FINANCEIRO. Foque em custos, budget, ROI e projeções.",
      "compliance": "Você está no módulo de COMPLIANCE. Foque em auditorias, gaps e ações corretivas.",
      "training": "Você está no módulo de TREINAMENTO. Foque em certificações, cursos e competências.",
      "command": "Você está no COMMAND CENTER. Visão 360° de toda a operação."
    };

    prompt += `\n\nCONTEXTO DO MÓDULO:\n${moduleContexts[context.currentModule] || "Módulo geral do sistema."}`;
  }

  return prompt;
}

function buildContextMessage(context: CopilotRequest["context"]): string {
  const parts: string[] = ["CONTEXTO ATUAL DO SISTEMA:"];

  if (context?.currentRoute) {
    parts.push(`- Rota atual: ${context.currentRoute}`);
  }

  if (context?.systemMetrics) {
    parts.push(`- Métricas: ${JSON.stringify(context.systemMetrics)}`);
  }

  return parts.join("\n");
}
