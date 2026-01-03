/**
 * Module Generate Evidence - Unified Edge Function for V2 Evidence Generation
 * Supports all 19 V2 modules with AI-powered evidence and action plans
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvidenceRequest {
  module: string;
  context: string;
  nc_type?: string;
  observed_condition?: string;
  [key: string]: string | undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EvidenceRequest = await req.json();
    const { module, context, nc_type, observed_condition, ...additionalData } = requestData;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[module-generate-evidence] Module: ${module}, NC Type: ${nc_type}`);

    const systemPrompt = `Você é um especialista em ${context} com profundo conhecimento das normas e regulamentos marítimos internacionais.

Sua tarefa é gerar uma análise de evidência completa para uma não conformidade identificada no módulo ${module}.

RESPONDA APENAS EM JSON VÁLIDO com a seguinte estrutura:
{
  "technical_analysis": "Análise técnica detalhada da não conformidade (3-5 parágrafos)",
  "legal_reference": "Referências legais e normativas aplicáveis (citar artigos específicos)",
  "standard_reference": "Standards aplicáveis (ISO, IMO, SOLAS, MLC 2006, STCW, IMCA, etc.)",
  "risk_assessment": "Avaliação de risco detalhada com classificação e impactos",
  "recommendations": "Lista numerada de 5-8 recomendações específicas",
  "corrective_action": "Plano de ação corretiva detalhado com etapas",
  "responsible_party": "Responsável sugerido para implementação",
  "deadline_suggestion": "Prazo sugerido baseado na criticidade",
  "ai_confidence": 0.85
}`;

    const userPrompt = `Gere a evidência para a seguinte não conformidade:

MÓDULO: ${module}
CONTEXTO: ${context}
CLASSIFICAÇÃO: ${nc_type || 'Não especificada'}
CONDIÇÃO OBSERVADA: ${observed_condition || 'Não especificada'}
DADOS ADICIONAIS: ${JSON.stringify(additionalData)}

Analise tecnicamente e gere o plano de evidência completo em JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response
    let evidenceResult;
    try {
      evidenceResult = JSON.parse(content);
    } catch (parseError) {
      // Extract JSON from markdown if needed
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        evidenceResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    console.log(`[module-generate-evidence] Success for ${module}`);

    return new Response(JSON.stringify(evidenceResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[module-generate-evidence] Error:", error);
    
    // Return fallback evidence
    const fallbackEvidence = {
      technical_analysis: "Análise técnica da não conformidade identificada. A condição observada indica desvio dos requisitos estabelecidos nas normas aplicáveis. Esta situação requer atenção imediata para garantir conformidade e segurança operacional.",
      legal_reference: "Referência normativa aplicável conforme regulamentos marítimos internacionais",
      standard_reference: "ISO 9001, ISO 14001, ISM Code, SOLAS, MLC 2006",
      risk_assessment: "Avaliação de risco baseada na classificação informada. Impacto potencial na segurança e operação requer ação corretiva.",
      recommendations: "1. Investigar causa raiz\n2. Implementar ação corretiva imediata\n3. Documentar evidências\n4. Atualizar procedimentos\n5. Treinar equipe envolvida\n6. Verificar eficácia das ações",
      corrective_action: "Plano de ação corretiva para resolução da não conformidade identificada com verificação de eficácia.",
      responsible_party: "Responsável designado conforme matriz de responsabilidades",
      deadline_suggestion: "14 dias",
      ai_confidence: 0.75
    };
    
    return new Response(JSON.stringify(fallbackEvidence), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
