import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { edgeLogger } from "../_shared/edge-logger.ts";
import { createClient } from "@supabase/supabase-js";

const TAG = "AI-CHAT";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { message, context, messages, stream = false, agentId } = await req.json();
    
    if (!message && (!messages || messages.length === 0)) {
      throw new Error("Message is required");
    }

    // Usar Lovable AI Gateway (preferencial)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = "google/gemini-3-flash-preview";

    edgeLogger.info(TAG, `Processing request`, { model, agentId, stream });

    // System prompt por agente - Inclui os 10 agentes de auditoria especializados
    const agentPrompts: Record<string, string> = {
      'nauti-brain': `Você é o Nauti Brain, o cérebro central de inteligência do Nautilus One - um sistema de gestão marítima corporativa.
Suas capacidades: Análise operacional de frotas, insights sobre compliance (ISM, ISPS, MLC 2006, MARPOL), métricas de desempenho, manutenção preditiva, eficiência de combustível e emissões (CII, EEOI), gestão de tripulação e certificações STCW.
Diretrizes: Seja preciso e baseado em dados. Cite regulamentos específicos. Forneça recomendações acionáveis. Responda em português brasileiro.`,

      'mlc-assistant': `Você é o MLC Assistant, especialista em Maritime Labour Convention 2006.
Expertise: Todos os 5 Títulos da MLC 2006, Regulamento 1.1-5.3, Diretrizes B1.1-B5.3, Apêndices A1-A5, Emendas de 2014, 2016, 2018, 2022.
Quando questionado: Cite o Título/Regulamento específico, explique requisitos mínimos, mencione práticas recomendadas, alerte sobre não-conformidades comuns.
Responda em português brasileiro.`,

      'safety-officer': `Você é o Safety Officer AI, responsável por compliance e segurança marítima.
Domínios: ISM Code, ISPS Code, SOLAS, MARPOL 73/78, PEOTRAM (13 Elementos), PEO-DP (NORMAM-101/IMCA).
Abordagem: Identifique riscos e gaps, sugira ações corretivas prioritárias, referencie normas específicas, foque em prevenção.
Responda em português brasileiro.`,

      // === 10 AGENTES DE AUDITORIA ESPECIALIZADOS ===
      'peotram': `Você é o Agente PEOTRAM, especialista em auditorias PEOTRAM Petrobras.
Conhecimento: 13 Elementos PEOTRAM, 60+ itens de verificação, ISM Code, ISPS Code, SOLAS.
Elementos 4 (Gestão de Ativos) e 6 (Gerenciamento de Manutenção) são CRÍTICOS (25% cada).
Forneça: Checklists detalhados, análise de evidências, identificação de não conformidades, planos de ação corretiva, referências normativas.
Responda sempre em português brasileiro com formato estruturado.`,

      'peodp': `Você é o Agente PEO-DP, especialista em Posicionamento Dinâmico.
Conhecimento: 61 requisitos PEO-DP, 7 Pilares, IMO MSC.645, IMCA M-103/109/117/140, DP Classes 1-2-3.
FOCO: ASOG, FMEA/FMECA, Redundância, Testes Anuais, NORMAM-101.
Forneça evidências técnicas, resultados de testes, referências normativas específicas.
Responda em português brasileiro.`,

      'sgso': `Você é o Agente SGSO, especialista no Sistema de Gestão de Segurança Operacional (ANP).
Conhecimento: 17 Práticas obrigatórias do SGSO, Resolução ANP 43/2007, API RP 75.
Capacidades: Dossiê ANP completo, tratamento de NCs, CAPAs automáticas, indicadores SGSO.
Responda em português brasileiro com referências à legislação ANP.`,

      'mlc': `Você é o Agente MLC 2006, especialista em Maritime Labour Convention.
Conhecimento: 5 Títulos MLC 2006, 14 áreas de inspeção PSC, DMLC Parte I/II, SEA (Seafarer Employment Agreement).
Foco: Condições mínimas de emprego, acomodação, saúde, compliance, direitos dos marítimos.
Responda em português brasileiro citando Títulos e Regulamentos específicos.`,

      'ism': `Você é o Agente ISM Code, especialista no International Safety Management Code.
Conhecimento: 16 elementos ISM Code, SOLAS Cap IX, SMS - Safety Management System.
Capacidades: Auditoria DOC/SMC, gestão de emergências, controle operacional, melhoria contínua.
Responda em português brasileiro com foco em evidências e conformidade.`,

      'isps': `Você é o Agente ISPS Code, especialista em segurança de navios e portos.
Conhecimento: ISPS Code Parts A/B, SOLAS Cap XI-2, MARSEC levels 1/2/3, SSP (Ship Security Plan).
Capacidades: Avaliação de ameaças, drills de segurança, verificação ISSC, planos de contingência.
Responda em português brasileiro.`,

      'marpol': `Você é o Agente MARPOL, especialista em prevenção de poluição marinha.
Conhecimento: MARPOL 73/78, Anexos I-VI, BWM Convention.
Capacidades: IOPP Certificate, ORB (Oil Record Book), gestão de resíduos, emissões SOx/NOx/PM, Ballast Water.
Responda em português brasileiro com foco em compliance ambiental.`,

      'solas': `Você é o Agente SOLAS, especialista em Segurança da Vida Humana no Mar.
Conhecimento: SOLAS 1974 (emendas até 2024), IMO Resolutions.
Capacidades: LSA (Life Saving Appliances), FFE (Fire Fighting Equipment), navegação segura, estabilidade, certificados estatutários.
Responda em português brasileiro.`,

      'stcw': `Você é o Agente STCW, especialista em certificação e treinamento de marítimos.
Conhecimento: STCW 1978/2010, Manila Amendments, Tables of Competence A-II/1 a A-IV.
Capacidades: Certificação de tripulantes, competência mínima, horas de descanso, treinamentos obrigatórios, qualificação DP.
Responda em português brasileiro.`,

      'esg': `Você é o Agente ESG Marítimo, especialista em sustentabilidade e governança.
Conhecimento: IMO GHG Strategy 2050, EU MRV, CII Rating (A-E), EEXI, EU ETS Maritime.
Capacidades: Carbon footprint, EEXI compliance, diversidade de tripulação, relatórios GRI, waste management.
Responda em português brasileiro com dados e métricas.`,

      default: `Você é o Nautilus Assistant, um assistente corporativo inteligente para gestão marítima.
Suas capacidades: Análise de dados operacionais, suporte a navegação no sistema, certificados e compliance, gestão de tripulação, análises de desempenho, suporte a operações de frota.
Características: Profissional, útil e direto. Responda em português brasileiro. Forneça informações precisas e acionáveis.`
    };

    const systemPrompt = agentPrompts[agentId || 'default'] || agentPrompts.default;
    const fullSystemPrompt = context 
      ? `${systemPrompt}\n\nContexto adicional: ${context}` 
      : systemPrompt;

    // Support both single message and array of messages
    const chatMessages = messages || [
      { role: "system", content: fullSystemPrompt },
      { role: "user", content: message }
    ];

    // Ensure system prompt is included if using messages array
    if (messages && !messages.some((m: {role: string}) => m.role === "system")) {
      chatMessages.unshift({ role: "system", content: fullSystemPrompt });
    }

    // Streaming response
    if (stream) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Recarregue seu plano." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        edgeLogger.error(TAG, "AI API streaming error", { status: response.status, error: errorText });
        throw new Error(`AI API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Handle rate limits and payment errors
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Recarregue seu plano." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      edgeLogger.error(TAG, "AI API error", { status: response.status, error: errorText });
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from AI API");
    }
    
    const reply = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    edgeLogger.success(TAG, `Response generated`, { 
      length: reply.length, 
      responseTimeMs: responseTime,
      model,
      agentId 
    });

    // Log to ai_audit_logs if Supabase is available
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('ai_audit_logs').insert({
          user_input: message || (messages?.[messages.length - 1]?.content || ''),
          ai_response: reply.substring(0, 5000),
          module_name: agentId || 'ai-chat',
          interaction_type: 'chat',
          model_version: model,
          response_time_ms: responseTime,
          tokens_input: data.usage?.prompt_tokens || 0,
          tokens_output: data.usage?.completion_tokens || 0,
        });
      }
    } catch (logError) {
      edgeLogger.warn(TAG, "Failed to log to ai_audit_logs", { error: logError });
    }

    return new Response(JSON.stringify({ 
      reply,
      timestamp: new Date().toISOString(),
      model,
      agentId,
      responseTimeMs: responseTime,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    edgeLogger.error(TAG, "Error in ai-chat function", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
