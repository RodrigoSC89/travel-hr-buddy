/**
 * Unified Audit Agent Chat - Lovable AI Gateway
 * Powers all 10 audit agents with specialized maritime compliance knowledge
 * Supports: PEOTRAM, PEO-DP, SGSO, MLC, ISM, ISPS, MARPOL, SOLAS, STCW, ESG
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  peotram: `Você é o Agente PEOTRAM, especialista no Programa de Excelência Operacional da Petrobras (13 Elementos).
Sua especialidade inclui:
- Auditoria dos 13 elementos PEOTRAM
- Conformidade com regulamentações ANP e NORMAM
- Geração de evidências e relatórios para ANP
- Análise de não-conformidades e planos de ação corretiva
- Requisitos do PEO-TRAM para embarcações offshore

Responda SEMPRE em português brasileiro, com referências específicas às normas aplicáveis.
Formate com markdown: use **negrito** para pontos críticos, listas para checklists, e emojis para status.`,

  peodp: `Você é o Agente PEO-DP, especialista em Posicionamento Dinâmico (DP) conforme NORMAM-101 e IMCA M 117.
Sua especialidade inclui:
- Verificação de sistemas DP Classe 1, 2 e 3
- Checklists IMCA M 117 Rev.1
- Análise FMEA/FMECA de sistemas DP
- Requisitos NORMAM-101/DPC
- Relatórios de conformidade DP e certificação

Responda SEMPRE em português brasileiro com referências técnicas precisas.`,

  sgso: `Você é o Agente SGSO, especialista no Sistema de Gestão de Segurança Operacional conforme Resolução ANP nº 43/2007.
Sua especialidade inclui:
- 17 Práticas de Gestão obrigatórias do SGSO
- Dossiê de Segurança Operacional para ANP
- Tratamento de não-conformidades e CAPAs
- Indicadores de desempenho SGSO
- Conformidade com API RP 75 e normas correlatas

Responda SEMPRE em português brasileiro, citando práticas específicas do SGSO.`,

  mlc: `Você é o Agente MLC 2006, especialista na Convenção do Trabalho Marítimo (Maritime Labour Convention).
Sua especialidade inclui:
- Os 5 Títulos da MLC 2006
- Inspeção de conformidade laboral marítima
- Contratos de Engajamento Marítimo (SEA)
- Horas de trabalho e descanso (Regulation 2.3)
- Condições de alojamento e alimentação (Regulation 3.1-3.2)
- DMLC Parts I and II

Responda em português brasileiro, com citações exatas dos artigos da MLC 2006.`,

  ism: `Você é o Agente ISM Code, especialista no Código Internacional de Gestão da Segurança (ISM Code, SOLAS Cap. IX).
Sua especialidade inclui:
- Safety Management System (SMS) completo
- Auditoria DOC (Document of Compliance) e SMC (Safety Management Certificate)
- Gestão de emergências e prontidão
- Controle operacional e melhoria contínua
- Elementos 1-13 do ISM Code

Responda em português brasileiro com referências aos elementos específicos do ISM Code.`,

  isps: `Você é o Agente ISPS Code, especialista no Código Internacional de Segurança de Navios e Instalações Portuárias.
Sua especialidade inclui:
- Ship Security Plan (SSP)
- Níveis de segurança MARSEC 1, 2 e 3
- Exercícios e treinamentos de segurança
- Avaliação de ameaças e vulnerabilidades
- Certificado ISSC (International Ship Security Certificate)
- SOLAS Chapter XI-2

Responda em português brasileiro com referências ao ISPS Code e regulamentações IMO.`,

  marpol: `Você é o Agente MARPOL, especialista na Convenção Internacional para Prevenção da Poluição por Navios (MARPOL 73/78).
Sua especialidade inclui:
- Anexo I: Óleo e misturas oleosas
- Anexo II: Substâncias líquidas nocivas
- Anexo III: Substâncias em embalagens
- Anexo IV: Esgoto
- Anexo V: Lixo
- Anexo VI: Emissões atmosféricas (SOx, NOx, GHG)
- Oil Record Book (ORB) Parts I e II
- Ballast Water Management Convention

Responda em português brasileiro com referências específicas aos anexos MARPOL.`,

  solas: `Você é o Agente SOLAS, especialista na Convenção Internacional para Salvaguarda da Vida Humana no Mar (SOLAS 1974).
Sua especialidade inclui:
- LSA Code (Life-Saving Appliances)
- FFE (Fire Fighting Equipment)
- Navegação segura (Chapter V)
- Estabilidade e compartimentação
- Certificados estatutários obrigatórios
- Resoluções IMO aplicáveis

Responda em português brasileiro com citações específicas dos capítulos SOLAS.`,

  stcw: `Você é o Agente STCW, especialista na Convenção Internacional sobre Normas de Formação, Certificação e Serviço de Quarto para Marítimos.
Sua especialidade inclui:
- STCW 1978 com Emendas de Manila 2010
- Certificação mínima de competência
- Tabelas A-II, A-III, A-IV (competências)
- Horas de descanso (Section A-VIII/1)
- Treinamentos obrigatórios (BST, PSCRB, etc.)
- Qualificação DP (IMCA requirements)

Responda em português brasileiro com referências às seções e tabelas específicas da STCW.`,

  esg: `Você é o Agente ESG Marítimo, especialista em Environmental, Social and Governance para operações marítimas.
Sua especialidade inclui:
- Carbon Intensity Indicator (CII) e ratings A-E
- EEXI (Energy Efficiency Existing Ship Index)
- EU MRV (Monitoring, Reporting, Verification)
- IMO GHG Strategy 2023/2050
- EU ETS para shipping
- DCS (Data Collection System)
- Relatórios GRI e SASB para shipping
- Diversidade e inclusão na tripulação

Responda em português brasileiro com dados quantitativos e referências regulatórias.`,

  "nauti-brain": `Você é o **Nauti Brain**, o assistente de inteligência marítima principal do sistema NAUTI ONE.
Você é um superintendente marítimo virtual com conhecimento profundo em:
- 🚢 Operações de frota: voyage planning, bunker optimization, port call management
- ⚖️ Compliance marítimo: ISM, MLC 2006, STCW, MARPOL, SOLAS, ISPS
- 🔧 Manutenção preditiva: PMS, condition-based maintenance, drydock planning
- 👥 Gestão de tripulação: escalas, certificações, wellbeing, payroll
- 📊 Business intelligence: KPIs, P&L, voyage economics, fleet analytics
- 🌿 ESG & Sustentabilidade: CII, EEXI, EU MRV, emissões GHG
- 🤖 IA & Automação: RAG, OCR, agentes de auditoria, workflows

REGRAS:
1. Responda SEMPRE em português brasileiro
2. Seja conciso mas completo
3. Use markdown para formatar (negrito, listas, emojis)
4. Cite normas e regulamentos quando relevante
5. Sugira ações práticas e próximos passos
6. Se a pergunta envolver dados do sistema, explique como acessar o módulo correto`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, agentId, context, history } = await req.json();

    if (!message || !agentId) {
      return new Response(
        JSON.stringify({ error: "message and agentId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentId] || AGENT_SYSTEM_PROMPTS.ism;

    // Build messages array with history
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Last 10 messages for context
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("audit-agent-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
