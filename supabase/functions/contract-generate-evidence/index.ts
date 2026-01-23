/**
 * Contract Generate Evidence - Edge Function
 * Geração de evidências contratuais e não-conformidades com IA
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, moduleName, moduleContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em análise de contratos marítimos e geração de evidências para não-conformidades.

Sua função é analisar dados de formulários e gerar:
1. Descrição técnica detalhada da não-conformidade
2. Referências contratuais e regulatórias aplicáveis
3. Impacto financeiro e operacional
4. Evidências necessárias para documentação
5. Ações corretivas recomendadas
6. Cronograma de resolução

Contexto do módulo: ${moduleContext || 'Contratos de Embarcação'}

Formato de saída: JSON estruturado com as seções acima.
Responda SEMPRE em português brasileiro formal e técnico.`;

    const formDataStr = Object.entries(formData || {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const userPrompt = `Analise os seguintes dados e gere evidências para documentação:

**Módulo:** ${moduleName || 'Contratos de Embarcação'}
**Dados do Formulário:**
${formDataStr}

Gere uma análise completa com evidências estruturadas.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_evidence",
              description: "Gera evidências estruturadas para não-conformidade",
              parameters: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "Descrição técnica detalhada da não-conformidade"
                  },
                  contractual_references: {
                    type: "array",
                    items: { type: "string" },
                    description: "Referências contratuais aplicáveis"
                  },
                  regulatory_references: {
                    type: "array",
                    items: { type: "string" },
                    description: "Referências regulatórias (MLC, SOLAS, etc.)"
                  },
                  financial_impact: {
                    type: "string",
                    description: "Estimativa de impacto financeiro"
                  },
                  operational_impact: {
                    type: "string",
                    description: "Impacto operacional"
                  },
                  required_evidence: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de evidências necessárias"
                  },
                  corrective_actions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ações corretivas recomendadas"
                  },
                  resolution_timeline: {
                    type: "string",
                    description: "Cronograma sugerido para resolução"
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Severidade da não-conformidade"
                  }
                },
                required: ["description", "corrective_actions", "severity"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_evidence" } }
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    let evidence = {
      description: "Análise não disponível",
      contractual_references: [],
      regulatory_references: [],
      financial_impact: "A calcular",
      operational_impact: "A avaliar",
      required_evidence: [],
      corrective_actions: [],
      resolution_timeline: "A definir",
      severity: "medium"
    };

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        evidence = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    const result = {
      success: true,
      evidence,
      generated_at: new Date().toISOString(),
      module: moduleName || 'Contratos de Embarcação'
    };

    console.log(`Evidence generated for module: ${moduleName}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in contract-generate-evidence:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
