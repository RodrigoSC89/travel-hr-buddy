/**
 * Analyze Downtime - Edge Function
 * Analisa eventos de downtime com IA para verificar justificativas e calcular impacto SLA
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
    const { downtime_event, contract, vessel_name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calcular duração se não fornecida
    const durationHours = downtime_event.duration_hours || 
      (downtime_event.end_time 
        ? (new Date(downtime_event.end_time).getTime() - new Date(downtime_event.start_time).getTime()) / (1000 * 60 * 60)
        : 0);

    // Calcular impacto SLA (baseado em período mensal de 720h)
    const monthlyHours = 720;
    const slaImpact = parseFloat(((durationHours / monthlyHours) * 100).toFixed(2));
    const penaltyEstimate = durationHours * (contract.penalty_per_hour || 0);

    const systemPrompt = `Você é um especialista em operações marítimas e compliance de SLA para contratos de embarcações.
    
Sua tarefa é analisar eventos de downtime e determinar:
1. Se a justificativa é válida de acordo com práticas marítimas e contratuais
2. Classificar o nível de risco
3. Fornecer recomendações acionáveis

Categorias de downtime geralmente aceitas:
- Manutenção preventiva programada
- Condições climáticas adversas (força maior)
- Requisitos regulatórios/inspeções obrigatórias
- Emergências de segurança

Categorias que requerem justificativa adicional:
- Falhas mecânicas não planejadas
- Falhas elétricas
- Problemas operacionais
- Indisponibilidade de tripulação

Responda SEMPRE em português brasileiro.`;

    const userPrompt = `Analise o seguinte evento de downtime:

**Embarcação:** ${vessel_name}
**Cliente:** ${contract.client}
**Período:** ${new Date(downtime_event.start_time).toLocaleString('pt-BR')} até ${downtime_event.end_time ? new Date(downtime_event.end_time).toLocaleString('pt-BR') : 'Em andamento'}
**Duração:** ${durationHours.toFixed(1)} horas
**Sistema Afetado:** ${downtime_event.system_affected || 'Não especificado'}
**Nível de Impacto:** ${downtime_event.impact_level || 'Não classificado'}
**Motivo Informado:** ${downtime_event.reason || 'Não informado'}

**Parâmetros do Contrato:**
- SLA Downtime Permitido: ${contract.sla_downtime_percent}%
- Penalidade por Hora: USD ${contract.penalty_per_hour}

**Impacto SLA Calculado:** ${slaImpact}%
**Penalidade Estimada:** USD ${penaltyEstimate.toFixed(2)}

Forneça sua análise completa.`;

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
              name: "analyze_downtime",
              description: "Análise estruturada do evento de downtime",
              parameters: {
                type: "object",
                properties: {
                  justification_valid: {
                    type: "boolean",
                    description: "Se a justificativa é válida"
                  },
                  analysis: {
                    type: "string",
                    description: "Análise detalhada da situação (máximo 500 palavras)"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de até 5 recomendações"
                  },
                  risk_assessment: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Avaliação de risco"
                  }
                },
                required: ["justification_valid", "analysis", "recommendations", "risk_assessment"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_downtime" } }
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
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    let aiResult = {
      justification_valid: false,
      analysis: "Análise não disponível",
      recommendations: [] as string[],
      risk_assessment: "medium"
    };

    // Parse tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        aiResult = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        // Fallback to content parsing
        const content = data.choices?.[0]?.message?.content || "";
        aiResult.analysis = content;
      }
    }

    const result = {
      success: true,
      justification_valid: aiResult.justification_valid,
      sla_impact: slaImpact,
      penalty_estimate: penaltyEstimate,
      analysis: aiResult.analysis,
      recommendations: aiResult.recommendations || [],
      risk_level: aiResult.risk_assessment,
      generated_at: new Date().toISOString(),
      vessel_name,
      duration_hours: durationHours
    };

    console.log("Downtime analysis completed for vessel:", vessel_name);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in analyze-downtime:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
