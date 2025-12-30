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
    const { downtime_event, contract, vessel_name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em análise de downtime marítimo e contratos de SLA.
Analise eventos de parada e determine:
1. Se a justificativa é válida conforme o contrato
2. Impacto no SLA (% permitido vs % usado)
3. Possíveis penalidades
4. Recomendações de melhoria

Sempre responda em português brasileiro de forma técnica e objetiva.`;

    const userPrompt = `Analise o seguinte evento de downtime:

**Embarcação**: ${vessel_name}
**Início da Parada**: ${downtime_event.start_time}
**Fim da Parada**: ${downtime_event.end_time || 'Em andamento'}
**Motivo**: ${downtime_event.reason}
**Sistema Afetado**: ${downtime_event.system_affected}
**Nível de Impacto**: ${downtime_event.impact_level}

**Contrato**:
- SLA Downtime Permitido: ${contract.sla_downtime_percent}%
- Penalidade por Hora: R$ ${contract.penalty_per_hour}
- Cliente: ${contract.client}

Forneça uma análise completa incluindo:
1. Validação da justificativa
2. Impacto no SLA
3. Cálculo de penalidade (se aplicável)
4. Recomendações`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "";

    // Parse da análise para estruturar
    const result = {
      analysis,
      justification_valid: analysis.toLowerCase().includes("válida") || analysis.toLowerCase().includes("justificável"),
      sla_impact: extractSLAImpact(analysis),
      penalty_estimate: extractPenalty(analysis, contract.penalty_per_hour),
      recommendations: extractRecommendations(analysis),
      generated_at: new Date().toISOString()
    };

    console.log("Downtime analysis completed for vessel:", vessel_name);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in analyze-downtime:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractSLAImpact(analysis: string): string {
  const match = analysis.match(/(\d+[,.]?\d*)\s*%/);
  return match ? match[0] : "A calcular";
}

function extractPenalty(analysis: string, hourlyRate: number): number {
  const hoursMatch = analysis.match(/(\d+)\s*(hora|hours)/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1]) * hourlyRate;
  }
  return 0;
}

function extractRecommendations(analysis: string): string[] {
  const recSection = analysis.split(/recomenda/i)[1] || "";
  const items = recSection.split(/\n[-•*]|\d\./);
  return items.filter(r => r.trim().length > 10).slice(0, 5).map(r => r.trim());
}
