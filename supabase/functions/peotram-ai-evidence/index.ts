/**
 * PEOTRAM AI Evidence Generator Edge Function
 * Generates contextual evidence suggestions for PEOTRAM 2024 audit requirements
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvidenceRequest {
  requirementCode: string;
  requirementDescription: string;
  requiredEvidence: string[];
  elementName: string;
  vesselName?: string;
  dpClass?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      requirementCode, 
      requirementDescription, 
      requiredEvidence, 
      elementName,
      vesselName,
      dpClass
    }: EvidenceRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em auditorias PEOTRAM (Programa de Excelência Operacional em Transporte Marítimo) da Petrobras.
Sua função é gerar sugestões de evidências documentais para atender aos requisitos de auditoria.

CONTEXTO:
- PEOTRAM é o programa de auditoria anual da Petrobras para embarcações contratadas
- São 13 elementos de avaliação com ~195 requisitos no total
- Cada requisito requer evidências específicas para demonstrar conformidade
- A pontuação vai de 0 (não evidenciado) a 4 (excelência)

REGRAS:
1. Gere sugestões práticas e específicas para o requisito
2. Inclua templates de documentos quando aplicável
3. Sugira registros fotográficos e documentais
4. Considere normas ISM Code, STCW, NRs, IMCA
5. Seja objetivo e técnico

FORMATO DE RESPOSTA:
- Liste 3-5 evidências sugeridas
- Para cada evidência, inclua:
  - Tipo (documento, foto, registro, entrevista)
  - Descrição do que incluir
  - Template ou modelo quando aplicável`;

    const userPrompt = `Gere sugestões de evidências para o seguinte requisito PEOTRAM:

CÓDIGO: ${requirementCode}
ELEMENTO: ${elementName}
${vesselName ? `EMBARCAÇÃO: ${vesselName}` : ""}
${dpClass ? `CLASSE DP: ${dpClass}` : ""}

REQUISITO:
${requirementDescription}

EVIDÊNCIAS REQUERIDAS PELO DOCUMENTO OFICIAL:
${requiredEvidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Por favor, gere sugestões detalhadas de como atender a cada uma dessas evidências, incluindo templates e exemplos práticos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    // Parse the generated content into structured suggestions
    const suggestions = parseEvidenceSuggestions(generatedContent, requiredEvidence);

    return new Response(
      JSON.stringify({
        success: true,
        requirementCode,
        suggestions,
        rawContent: generatedContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating evidence:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseEvidenceSuggestions(content: string, requiredEvidence: string[]) {
  // Simple parsing - in production, you'd want more sophisticated parsing
  const suggestions = requiredEvidence.map((evidence, index) => ({
    originalEvidence: evidence,
    suggestions: [],
    template: null as string | null,
    examples: [] as string[]
  }));

  // For now, return the structured suggestions with the full content
  return {
    evidences: suggestions,
    fullAnalysis: content,
    templates: extractTemplates(content),
    recommendations: extractRecommendations(content)
  };
}

function extractTemplates(content: string): string[] {
  // Extract any template suggestions from the content
  const templates: string[] = [];
  const templateRegex = /template|modelo|formulário/gi;
  const lines = content.split("\n");
  
  lines.forEach(line => {
    if (templateRegex.test(line)) {
      templates.push(line.trim());
    }
  });
  
  return templates;
}

function extractRecommendations(content: string): string[] {
  // Extract recommendations
  const recommendations: string[] = [];
  const recRegex = /recomend|sugest|dica|importante/gi;
  const lines = content.split("\n");
  
  lines.forEach(line => {
    if (recRegex.test(line) && line.length > 20) {
      recommendations.push(line.trim());
    }
  });
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
