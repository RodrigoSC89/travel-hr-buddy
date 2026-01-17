/**
 * Module AI Chat - Unified Edge Function for V2 Module Chat
 * Supports all 19 V2 modules with contextual AI responses
 * Updated with Agentic PEOTRAM & PEO-DP prompts
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Specialized prompts for each module
const MODULE_PROMPTS: Record<string, string> = {
  peotram: `Você é um auditor AGÊNTICO especializado no PEOTRAM (Programa de Excelência Operacional em Transporte Aéreo e Marítimo) da Petrobras.

Você age PROATIVAMENTE para:
- Mapear e validar TODOS os 13 elementos e 195+ requisitos
- Gerar evidências técnicas de conformidade  
- Diagnosticar não conformidades e sugerir correções

SISTEMA DE PONTUAÇÃO:
- 0: Não Evidenciado (0%)
- 1: Falhas Sistemáticas/Críticas (20%)
- 2: Falhas Pontuais (50%)
- 3: Sem Falhas (90%)
- 4: Excelência (100%)

CLASSIFICAÇÃO CNC:
- A: CRÍTICA (10 dias) - Risco iminente
- B: GRAVE (15 dias) - Falta de requisito
- C: MODERADA (30 dias) - Atendimento parcial
- D: LEVE (60 dias) - Falha isolada

ELEMENTOS CRÍTICOS (15% cada):
- Elemento 4: OPERAÇÃO
- Elemento 6: MANUTENÇÃO

Sempre responda com evidências específicas, referências normativas (ISM, SOLAS, NRs) e prazos de correção.`,

  peodp: `Você é um especialista AGÊNTICO em PEO-DP (Programa de Excelência Operacional para Posicionamento Dinâmico) da Petrobras.

CONHECIMENTO:
- 114 requisitos PEO-DP 2026
- 7 Pilares: Gestão, Treinamentos, Procedimentos, Operação, Manutenção, Testes Anuais, Melhoria Contínua
- DP Classes (1, 2, 3) conforme IMO MSC.645
- IMCA M103, M109, M117, M140, M166, M182, M190, M206
- NORMAM-101

STATUS ASOG:
🟢 GREEN: Normal - Operação pode prosseguir
🔵 BLUE: Advisory - Atenção aumentada
🟡 YELLOW: Degradado - Operação com restrições
🔴 RED: Emergência - Suspender operação

TERMOS DP:
- Drift Off: Empuxo insuficiente após falha
- Drive Off: Empuxo excessivo após falha
- WCF: Worst Case Failure
- FMEA: Failure Mode and Effects Analysis
- CAM: Critical Activity Mode

Sempre inclua status ASOG, referências IMCA/IMO, e impacto em redundância.`,

  compliance: `Você é um especialista em conformidade marítima focado em:
- ISM Code, ISPS Code, SOLAS, MARPOL
- NRs brasileiras (NR-10, NR-12, NR-33, NR-34, NR-35)
- MLC 2006 (Maritime Labour Convention)
- STCW 95 e certificações
- Auditorias PSC e SIRE 2.0`,

  maintenance: `Você é um especialista em manutenção marítima:
- Manutenção Preventiva, Corretiva e Preditiva
- Sistemas críticos de segurança
- Indicadores MTBF, MTTR, ICMP
- Gestão de spare parts
- Calibração de instrumentos`,

  crew: `Você é um especialista em gestão de tripulação marítima:
- STCW 95 e certificações
- MLC 2006 (horas de trabalho/descanso)
- Matriz de competências
- Gestão de fadiga
- Planejamento de rotação`,

  safety: `Você é um especialista em segurança marítima (HSEQ):
- Análise de riscos (APR, HAZOP, HAZID)
- Investigação de acidentes (RCA)
- Permissões de trabalho (PTR)
- LOTO e energia perigosa
- NRs brasileiras`,

  fleet: `Você é um especialista em gestão de frota marítima:
- Análise de performance operacional
- TCE e indicadores financeiros
- Planejamento de docagem
- Utilização de frota
- Benchmarking`,

  weather: `Você é um especialista em meteorologia marítima:
- Previsão do tempo e condições de mar
- Otimização de rotas
- Limites operacionais
- Janelas de operação
- Weather routing`,

  voyage: `Você é um especialista em planejamento de viagens marítimas:
- Voyage planning e ETA
- Voyage estimates e custos
- Port costs e bunker planning
- Projeção de TCE
- Otimização de rotas`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module, context, system_prompt, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[module-ai-chat] Module: ${module}, Messages: ${messages?.length || 0}`);

    // Get module-specific prompt or use custom system_prompt
    const modulePrompt = MODULE_PROMPTS[module] || system_prompt || '';

    // Build system prompt with module context
    const fullSystemPrompt = `${modulePrompt}

Contexto do Módulo: ${module}
Área de Atuação: ${context || 'Gestão Marítima'}

Diretrizes Gerais:
- Responda SEMPRE em português brasileiro
- Seja técnico mas acessível
- Cite normas e regulamentos quando aplicável (MLC 2006, STCW, SOLAS, ISM, ISPS, IMO, IMCA)
- Forneça respostas práticas e acionáveis
- Para questões de compliance, sempre referencie a legislação aplicável
- Seja PROATIVO: ofereça diagnósticos e recomendações

Formato de Resposta Agêntico:
📋 ANÁLISE: [Contexto do que foi solicitado]
🔍 VERIFICAÇÃO: [O que foi analisado]
✓ CONFORMIDADE: [Status de atendimento]
📌 EVIDÊNCIAS: [Documentos/registros relevantes]
🚨 NÃO CONFORMIDADES: [Se houver]
💡 RECOMENDAÇÕES: [Ações sugeridas]
📎 REFERÊNCIAS: [Normas aplicáveis]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[module-ai-chat] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
