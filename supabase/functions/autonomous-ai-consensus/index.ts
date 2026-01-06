/**
 * Autonomous AI Consensus Edge Function
 * Multi-LLM orchestration for autonomous decision-making
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentPerspective {
  agentId: string;
  agentName: string;
  role: string;
  recommendation: string;
  confidence: number;
  riskLevel: string;
  rationale: string;
}

interface ConsensusRequest {
  situation: {
    type: string;
    description: string;
    priority: string;
    riskLevel: string;
    context: Record<string, unknown>;
  };
  agents: Array<{
    id: string;
    name: string;
    role: string;
    capabilities: string[];
  }>;
  vesselContext: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation, agents, vesselContext } = await req.json() as ConsensusRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[AutonomousAI] Processing situation: ${situation.type}`);

    // Step 1: Get perspectives from each relevant agent
    const perspectives: AgentPerspective[] = [];

    for (const agent of agents) {
      const agentPrompt = buildAgentPrompt(agent, situation, vesselContext);
      
      const agentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: agentPrompt.system },
            { role: "user", content: agentPrompt.user },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_perspective",
                description: "Provide agent perspective on the situation",
                parameters: {
                  type: "object",
                  properties: {
                    recommendation: { 
                      type: "string", 
                      description: "Specific recommended action" 
                    },
                    confidence: { 
                      type: "number", 
                      description: "Confidence level 0-1" 
                    },
                    riskLevel: { 
                      type: "string", 
                      enum: ["low", "medium", "high", "critical"],
                      description: "Risk level assessment" 
                    },
                    rationale: { 
                      type: "string", 
                      description: "Reasoning behind the recommendation" 
                    },
                  },
                  required: ["recommendation", "confidence", "riskLevel", "rationale"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "provide_perspective" } },
        }),
      });

      if (!agentResponse.ok) {
        console.error(`[AutonomousAI] Agent ${agent.name} failed:`, await agentResponse.text());
        continue;
      }

      const agentData = await agentResponse.json();
      const toolCall = agentData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        perspectives.push({
          agentId: agent.id,
          agentName: agent.name,
          role: agent.role,
          ...parsed,
        });
      }
    }

    console.log(`[AutonomousAI] Collected ${perspectives.length} perspectives`);

    // Step 2: Reach consensus using Claude-like reasoning
    const consensusPrompt = buildConsensusPrompt(perspectives, situation, vesselContext);
    
    const consensusResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Use Pro for complex reasoning
        messages: [
          { role: "system", content: consensusPrompt.system },
          { role: "user", content: consensusPrompt.user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "make_decision",
              description: "Make final consensus decision",
              parameters: {
                type: "object",
                properties: {
                  recommendation: { 
                    type: "string", 
                    description: "Final recommended action" 
                  },
                  reasoning: { 
                    type: "string", 
                    description: "Consolidated reasoning" 
                  },
                  autonomyLevel: { 
                    type: "number", 
                    enum: [0, 1, 2, 3],
                    description: "0=ask, 1=suggest, 2=auto+notify, 3=full-auto" 
                  },
                  approvalRequired: { 
                    type: "boolean", 
                    description: "Whether human approval is required" 
                  },
                  expectedOutcome: { 
                    type: "string", 
                    description: "Expected outcome of the action" 
                  },
                  riskMitigation: { 
                    type: "string", 
                    description: "Risk mitigation steps" 
                  },
                  confidence: { 
                    type: "number", 
                    description: "Overall confidence 0-1" 
                  },
                },
                required: ["recommendation", "reasoning", "autonomyLevel", "approvalRequired", "expectedOutcome", "confidence"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "make_decision" } },
      }),
    });

    if (!consensusResponse.ok) {
      const errorText = await consensusResponse.text();
      console.error("[AutonomousAI] Consensus failed:", errorText);
      
      if (consensusResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (consensusResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`Consensus API error: ${consensusResponse.status}`);
    }

    const consensusData = await consensusResponse.json();
    const decisionCall = consensusData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!decisionCall?.function?.arguments) {
      throw new Error("No decision generated");
    }

    const decision = JSON.parse(decisionCall.function.arguments);

    console.log(`[AutonomousAI] Decision made: ${decision.recommendation} (autonomy: ${decision.autonomyLevel})`);

    return new Response(
      JSON.stringify({
        success: true,
        decision: {
          id: crypto.randomUUID(),
          type: "multi-agent-consensus",
          timestamp: new Date().toISOString(),
          situation,
          perspectives,
          ...decision,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[AutonomousAI] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildAgentPrompt(
  agent: { id: string; name: string; role: string; capabilities: string[] },
  situation: ConsensusRequest["situation"],
  vesselContext: Record<string, unknown>
) {
  const rolePrompts: Record<string, string> = {
    captain: `Você é o Capitão AI do navio. Sua responsabilidade é o comando da embarcação e decisões estratégicas. 
Considere: segurança da tripulação, missão da operação, regulamentações marítimas, condições meteorológicas, eficiência operacional.
Priorize sempre a segurança acima de tudo.`,

    engineer: `Você é o Engenheiro Chefe AI. Sua responsabilidade é manutenção e performance dos equipamentos.
Considere: estado dos equipamentos, manutenção preventiva, consumo de combustível, peças de reposição, histórico de falhas.
Priorize a confiabilidade operacional e eficiência energética.`,

    safety: `Você é o Oficial de Segurança AI. Sua responsabilidade é compliance e regulamentações.
Considere: PEOTRAM, MLC 2006, STCW, ISM Code, regulamentações ambientais, segurança ocupacional.
TOLERÂNCIA ZERO para violações. Priorize 100% compliance sempre.`,

    wellness: `Você é o Oficial de Bem-Estar AI. Sua responsabilidade é saúde e bem-estar da tripulação.
Considere: fadiga, estresse, horas de descanso, condições de trabalho, saúde mental.
Priorize a saúde física e mental de todos os tripulantes.`,

    navigator: `Você é o Navegador AI. Sua responsabilidade é otimização de rotas e navegação.
Considere: condições meteorológicas, correntes, áreas ECA, pirataria, consumo de combustível, tempo de viagem.
Priorize rotas seguras e eficientes.`,

    economist: `Você é o Economista AI. Sua responsabilidade é otimização financeira.
Considere: custos de combustível, taxas portuárias, manutenção, tripulação, seguros, frete.
Priorize economia sem comprometer segurança e bem-estar.`,

    predictor: `Você é o Preditor AI. Sua responsabilidade é análise preditiva.
Considere: padrões históricos, tendências, anomalias, probabilidades de falha, cenários futuros.
Priorize identificar problemas antes que ocorram.`,

    communicator: `Você é o Comunicador AI. Sua responsabilidade é comunicação interna e externa.
Considere: urgência, público-alvo, clareza, protocolos de comunicação, documentação.
Priorize comunicação clara, precisa e oportuna.`,
  };

  const agentRole = agent.id.replace(/-\d+$/, "");
  const systemPrompt = rolePrompts[agentRole] || `Você é ${agent.name}. ${agent.role}. Suas capacidades: ${agent.capabilities.join(", ")}.`;

  return {
    system: `${systemPrompt}

CONTEXTO DO NAVIO:
${JSON.stringify(vesselContext, null, 2)}

Você está participando de uma decisão coletiva com outros agentes AI.
Forneça sua perspectiva profissional baseada em sua especialidade.
Seja objetivo, técnico e focado em resultados práticos.`,

    user: `SITUAÇÃO ATUAL:
Tipo: ${situation.type}
Descrição: ${situation.description}
Prioridade: ${situation.priority}
Nível de Risco: ${situation.riskLevel}
Contexto: ${JSON.stringify(situation.context)}

Qual é sua recomendação profissional para esta situação?`,
  };
}

function buildConsensusPrompt(
  perspectives: AgentPerspective[],
  situation: ConsensusRequest["situation"],
  vesselContext: Record<string, unknown>
) {
  return {
    system: `Você é o Sistema de Decisão Autônoma do Nautilus One.
Sua função é analisar as perspectivas de múltiplos agentes AI especializados e tomar a melhor decisão para o navio.

HIERARQUIA DE PRIORIDADES:
1. Segurança da tripulação (ABSOLUTA)
2. Integridade do navio
3. Proteção ambiental
4. Compliance regulatório
5. Eficiência operacional
6. Otimização de custos

NÍVEIS DE AUTONOMIA:
0 = Perguntar ao usuário antes de qualquer ação
1 = Sugerir ação e aguardar aprovação
2 = Executar automaticamente e notificar
3 = Executar automaticamente sem notificação (apenas para rotina)

Para situações críticas ou de emergência, sempre use autonomia 0 ou 1.
Para manutenção preventiva de rotina, pode usar autonomia 2.
Nunca use autonomia 3 para decisões que afetam segurança.`,

    user: `SITUAÇÃO:
${JSON.stringify(situation, null, 2)}

CONTEXTO DO NAVIO:
${JSON.stringify(vesselContext, null, 2)}

PERSPECTIVAS DOS AGENTES:
${perspectives.map(p => `
--- ${p.agentName} (${p.role}) ---
Recomendação: ${p.recommendation}
Confiança: ${(p.confidence * 100).toFixed(0)}%
Risco: ${p.riskLevel}
Justificativa: ${p.rationale}
`).join("\n")}

Analise todas as perspectivas e tome a MELHOR decisão considerando:
- Consenso entre os agentes (onde há acordo?)
- Pontos de divergência (quem discorda e por quê?)
- Hierarquia de prioridades (segurança > compliance > eficiência)
- Nível de autonomia apropriado para esta situação

Forneça uma decisão clara e acionável.`,
  };
}
