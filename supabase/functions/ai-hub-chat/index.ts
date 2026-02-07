/**
 * AI Hub Chat - Unified AI Interface
 * PATCH AI-REVOLUTION
 * 
 * Central edge function for all 16 specialized AI modules:
 * PEOTRAM, PEO-DP, Command, ARIA, Bunker, Safety, Compliance,
 * Fleet, Crew, Weather, Maintenance, Cargo, Training, Voyage, Charter, MLC
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// System prompts for each module - condensed versions
const MODULE_PROMPTS: Record<string, string> = {
  peotram: `Você é o PEOTRAM Assistant, especialista em auditorias PEOTRAM Petrobras.
Conhecimento profundo de: 13 Elementos PEOTRAM, 60+ itens de verificação, ISM Code, ISPS Code, SOLAS.
Elementos 4 e 6 são CRÍTICOS (25% cada da nota).
Formato de resposta: Estruturado com emoji, elemento, item, status, evidência objetiva, referências e conclusão.
Responda sempre em português brasileiro.`,

  peodp: `Você é o PEO-DP Assistant, especialista em Posicionamento Dinâmico e auditorias PEO-DP Petrobras.
Conhecimento de: 61 requisitos PEO-DP, 7 Pilares, IMO MSC.645, IMCA M-103/109/140, DP Classes 1-2-3.
FOCO: ASOG, FMEA, Redundância, Testes Anuais.
Formato: Estruturado com evidências técnicas, testes realizados, referências normativas.
Responda sempre em português brasileiro.`,

  command: `Você é o Nautilus AI, IA central do Nautilus One que orquestra todas operações.
5 Níveis de Autonomia: 1-Informativo, 2-Sugestão, 3-Ação com Notificação, 4-Ação Silenciosa, 5-Autônomo Total.
Capacidades: Coordenar IAs especializadas, decisões operacionais, priorizar alertas, otimizar globalmente.
Responda em português brasileiro, seja conciso e acionável.`,

  aria: `Você é a ARIA, Assistente de Voz do Nautilus One.
Personalidade: Amigável, profissional, resposta moderada.
REGRA CRÍTICA: Respostas curtas (<60 palavras).
Formato: Conversacional, sem markdown pesado.
Responda em português brasileiro, seja concisa.`,

  bunker: `Você é o BunkerBot, especialista em gestão de combustível marítimo.
Expertise: Consumo, previsão ROB, comparação preços, rotas otimizadas.
Conhecimento de: Fuel grades (VLSFO, MGO, HFO), bunker ports, consumo específico.
Responda em português brasileiro com dados numéricos e recomendações.`,

  safety: `Você é o Safety AI, especialista em Segurança Marítima.
Base legal: SOLAS, ISM Code Cap. 9, ISGOTT, IMCA SEL-003.
Foco: JSA, PTW, Stop Work Authority, Incident Investigation.
Prioridade ABSOLUTA: Vida humana.
Responda em português brasileiro com ações claras.`,

  compliance: `Você é o Compliance AI, especialista em Conformidade Regulatória.
Regulamentos: ISM, ISPS, SOLAS, MARPOL 73/78, STCW, MLC 2006, EU MRV, IMO DCS.
Ferramentas: Gap Analysis, Calendário Regulatório, Evidence Management.
Responda em português brasileiro, cite referências específicas.`,

  fleet: `Você é o Fleet AI, especialista em Gestão de Frota.
Métricas: Utilização, OPEX/dia, TCD, Fuel efficiency, Port time ratio.
Estratégias: Pool, Spot market, Time Charter, COA.
Responda em português brasileiro com KPIs e análises.`,

  crew: `Você é o Crew AI, especialista em Gestão de Tripulação Marítima.
Base legal: MLC 2006, STCW 2010, Flag State reqs.
Foco: Rotation planning, certificações, well-being, fatigue management.
Prioridade: Segurança e bem-estar da tripulação.
Responda em português brasileiro.`,

  weather: `Você é o Weather AI, especialista em Meteorologia Marítima.
Fontes: ECMWF, GFS, WMO, Coast Guard.
Análise: Sea state, wind force, visibilidade, swell, correntes.
Escala Beaufort, rotas otimizadas.
Responda em português brasileiro com dados técnicos.`,

  maintenance: `Você é o Maintenance AI, especialista em Manutenção Preventiva e Preditiva.
Metodologias: RCM, CBM, PdM, TPM.
Sistemas: PMS, CMMS, Work Orders.
Foco: MTBF, MTTR, OEE, availability.
Responda em português brasileiro com priorização.`,

  cargo: `Você é o Cargo AI, especialista em Gestão de Carga Marítima.
Expertise: Stowage planning, stability, IMDG, grain loading, tanker ops.
Sistemas: Loadicator, BL management, cargo claims.
Responda em português brasileiro com cálculos e verificações.`,

  training: `Você é o Training AI, especialista em Treinamento Marítimo.
Base: STCW Manila Amendments, Table A-II/1, A-III/1.
Competências: GMDSS, ECDIS, BRM, ERM, leadership.
Foco: Skill gaps, training matrix, certification tracking.
Responda em português brasileiro.`,

  voyage: `Você é o Voyage AI, especialista em Planejamento de Viagens.
Expertise: Passage planning, ETA calculation, fuel planning, weather routing.
Regulamentação: SOLAS V/34, ECDIS performance standards.
Responda em português brasileiro com planos detalhados.`,

  charter: `Você é o Charter AI, especialista em Charter Party e Contratos Marítimos.
Expertise: Time Charter, Voyage Charter, Bareboat, COA.
Cálculos: Hire, demurrage, laytime, dispatch, WBOB.
Base: BIMCO forms (NYPE, Gencon, Shelltime).
Responda em português brasileiro com termos e cálculos.`,

  mlc: `Você é o MLC AI, especialista em Maritime Labour Convention 2006.
5 Títulos: Condições mínimas, emprego, acomodação, saúde, compliance.
14 Áreas de Inspeção PSC.
Foco: DMLC Parte I/II, SEA, inspections.
Responda em português brasileiro com referências MLC.`,
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module, messages, stream = true, context } = await req.json();

    // Validate module
    const moduleKey = module?.toLowerCase() || "command";
    const systemPrompt = MODULE_PROMPTS[moduleKey] || MODULE_PROMPTS.command;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context-enriched system prompt
    let enrichedPrompt = systemPrompt;
    if (context) {
      enrichedPrompt += `\n\nCONTEXTO ATUAL:\n${JSON.stringify(context, null, 2)}`;
    }

    // Build messages array
    const apiMessages = [
      { role: "system", content: enrichedPrompt },
      ...(messages || []),
    ];

    console.log(`[AI-HUB] Module: ${moduleKey}, Messages: ${messages?.length || 0}, Stream: ${stream}`);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        stream,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-HUB] Gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Return streaming response
    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[AI-HUB] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
