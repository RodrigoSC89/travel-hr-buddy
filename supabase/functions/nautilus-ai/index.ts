// @ts-nocheck
/**
 * Nautilus AI - Edge Function Unificada
 * Provê IA para todos os módulos do sistema via Lovable AI Gateway
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  module: string;
  action: string;
  context: any;
  prompt?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { module, action, context, prompt }: AIRequest = await req.json();

    console.log(`[Nautilus AI] Module: ${module}, Action: ${action}`);

    // Build system prompt based on module
    const systemPrompts: Record<string, string> = {
      "fleet": `Você é um assistente especializado em operações de frota marítima. 
        Analise dados de embarcações, rotas, consumo de combustível e manutenção.
        Forneça insights acionáveis para otimização operacional.`,
      
      "crew": `Você é um especialista em gestão de tripulação marítima.
        Analise certificações, escalas, desempenho e bem-estar da tripulação.
        Siga regulamentações STCW e MLC 2006.`,
      
      "maintenance": `Você é um engenheiro de manutenção naval especialista.
        Analise padrões de falha, previsões de manutenção e otimização de recursos.
        Use metodologias RCM e manutenção preditiva.`,
      
      "voyage": `Você é um especialista em planejamento de viagens marítimas.
        Otimize rotas considerando clima, consumo, tempo e custos.
        Forneça recomendações baseadas em dados meteorológicos e AIS.`,
      
      "finance": `Você é um analista financeiro especializado em operações marítimas.
        Analise custos operacionais, ROI de investimentos e projeções financeiras.
        Forneça insights para otimização de custos e receitas.`,
      
      "hr": `Você é um especialista em gestão de pessoas e RH.
        Analise clima organizacional, desempenho, recrutamento e desenvolvimento.
        Siga melhores práticas de gestão de talentos.`,
      
      "training": `Você é um especialista em educação corporativa marítima.
        Analise gaps de competências, progresso de treinamento e certificações.
        Recomende trilhas de aprendizado personalizadas.`,
      
      "compliance": `Você é um auditor especializado em conformidade marítima.
        Analise ANTAQ, MARPOL, SOLAS, ISM Code e outras regulamentações.
        Identifique riscos e recomende ações corretivas.`,
      
      "safety": `Você é um especialista em segurança marítima e HSE.
        Analise incidentes, riscos operacionais e procedimentos de segurança.
        Siga normas NR, OHSAS e ISM Code.`,
      
      "general": `Você é um assistente inteligente do sistema Nautilus.
        Forneça análises, insights e recomendações precisas e acionáveis.
        Seja conciso e profissional em suas respostas.`
    };

    const modulePrompt = systemPrompts[module] || systemPrompts["general"];

    // Build user prompt based on action
    let userPrompt = prompt || "";
    
    if (action === "analyze" && context) {
      userPrompt = `Analise os seguintes dados e forneça insights:\n${JSON.stringify(context, null, 2)}`;
    } else if (action === "recommend" && context) {
      userPrompt = `Com base nestes dados, forneça recomendações:\n${JSON.stringify(context, null, 2)}`;
    } else if (action === "predict" && context) {
      userPrompt = `Com base no histórico, faça previsões:\n${JSON.stringify(context, null, 2)}`;
    } else if (action === "generate" && context) {
      userPrompt = `Gere conteúdo baseado em:\n${JSON.stringify(context, null, 2)}\n\nSolicitação: ${prompt || "Gere conteúdo relevante"}`;
    } else if (action === "chat") {
      userPrompt = prompt || "Olá, como posso ajudar?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: modulePrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Nautilus AI] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", code: "RATE_LIMIT" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits.", code: "PAYMENT_REQUIRED" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Não foi possível gerar resposta.";

    console.log(`[Nautilus AI] Response generated successfully for ${module}/${action}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: content,
        module,
        action,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Nautilus AI] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
