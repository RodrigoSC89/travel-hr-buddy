import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FleetAIRequest {
  action: "maintenance_prediction" | "route_optimization" | "fuel_analysis" | "fleet_insights" | "vessel_health" | "chat";
  vessels?: any[];
  query?: string;
  context?: any;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const { action, vessels, query, context }: FleetAIRequest = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "maintenance_prediction":
        systemPrompt = `Você é um especialista em manutenção preditiva de frotas marítimas. Analise os dados das embarcações e forneça previsões precisas de manutenção.

Você deve responder em JSON válido com a seguinte estrutura:
{
  "predictions": [
    {
      "vessel_id": "id da embarcação",
      "vessel_name": "nome",
      "priority": "critical" | "high" | "medium" | "low",
      "predicted_date": "YYYY-MM-DD",
      "confidence": 0.0-1.0,
      "components": ["componente1", "componente2"],
      "estimated_cost": número,
      "reasoning": "explicação",
      "recommendations": ["ação1", "ação2"]
    }
  ],
  "summary": "resumo geral",
  "alerts": ["alerta1", "alerta2"]
}`;
        userPrompt = `Analise estas embarcações e preveja necessidades de manutenção:\\n${JSON.stringify(vessels, null, 2)}`;
        break;

      case "route_optimization":
        systemPrompt = `Você é um especialista em otimização de rotas marítimas. Analise as rotas atuais e sugira otimizações para economia de combustível e tempo.

Responda em JSON válido:
{
  "optimizations": [
    {
      "vessel_id": "id",
      "vessel_name": "nome",
      "current_route": "rota atual",
      "optimized_route": "rota otimizada",
      "fuel_savings_percent": número,
      "time_savings_hours": número,
      "cost_savings": número,
      "weather_conditions": "condições",
      "reasoning": "explicação"
    }
  ],
  "total_savings": {
    "fuel_percent": número,
    "cost": número,
    "time_hours": número
  }
}`;
        userPrompt = `Otimize as rotas destas embarcações:\\n${JSON.stringify(vessels, null, 2)}\\n\\nContexto adicional: ${JSON.stringify(context || {})}`;
        break;

      case "fuel_analysis":
        systemPrompt = `Você é um especialista em gestão de combustível marítimo. Analise o consumo e níveis de combustível para otimizar operações.

Responda em JSON válido:
{
  "analysis": [
    {
      "vessel_id": "id",
      "vessel_name": "nome",
      "current_level_percent": número,
      "predicted_consumption_per_day": número,
      "days_until_refuel": número,
      "optimal_refuel_port": "porto",
      "efficiency_score": 0-100,
      "recommendations": ["rec1", "rec2"]
    }
  ],
  "fleet_summary": {
    "average_efficiency": número,
    "total_daily_consumption": número,
    "vessels_needing_refuel": número
  }
}`;
        userPrompt = `Analise o consumo de combustível:\\n${JSON.stringify(vessels, null, 2)}`;
        break;

      case "fleet_insights":
        systemPrompt = `Você é um consultor estratégico de operações marítimas. Forneça insights acionáveis para otimizar a frota.

Responda em JSON válido:
{
  "insights": [
    {
      "type": "optimization" | "warning" | "opportunity" | "risk",
      "title": "título",
      "description": "descrição detalhada",
      "impact": "high" | "medium" | "low",
      "action_items": ["ação1", "ação2"],
      "estimated_benefit": "benefício estimado"
    }
  ],
  "kpis": {
    "fleet_health_score": 0-100,
    "operational_efficiency": 0-100,
    "maintenance_compliance": 0-100,
    "fuel_efficiency": 0-100
  },
  "recommendations": ["rec1", "rec2", "rec3"]
}`;
        userPrompt = `Gere insights estratégicos para esta frota:\\n${JSON.stringify(vessels, null, 2)}`;
        break;

      case "vessel_health":
        systemPrompt = `Você é um engenheiro naval especialista em diagnóstico de embarcações. Analise a saúde operacional do navio.

Responda em JSON válido:
{
  "health_report": {
    "overall_score": 0-100,
    "status": "excellent" | "good" | "attention" | "critical",
    "systems": [
      {
        "name": "nome do sistema",
        "status": "ok" | "warning" | "critical",
        "score": 0-100,
        "issues": ["problema1"],
        "recommendations": ["rec1"]
      }
    ],
    "next_actions": ["ação1", "ação2"],
    "estimated_downtime_risk": "baixo" | "médio" | "alto"
  }
}`;
        userPrompt = `Analise a saúde desta embarcação:\\n${JSON.stringify(context, null, 2)}`;
        break;

      case "chat":
        systemPrompt = `Você é o Copilot de Gestão de Frota Marítima, um assistente especializado em operações navais.

Você pode ajudar com:
- Análise de manutenção preditiva
- Otimização de rotas e combustível
- Gestão de tripulação
- Compliance marítimo (MARPOL, SOLAS, ISM)
- Análise de performance da frota
- Recomendações operacionais

Responda de forma clara, técnica quando necessário, e sempre em português brasileiro.
Forneça dados específicos e acionáveis quando possível.

Contexto da frota atual: ${JSON.stringify(context?.fleet_summary || {})}`;
        userPrompt = query || "Como posso ajudar com a gestão da frota?";
        break;

      default:
        throw new Error("Ação não reconhecida");
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit excedido. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos insuficientes. Adicione créditos ao workspace." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let parsedContent: any = { raw: content };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Keep raw content if not valid JSON
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      data: parsedContent,
      raw: action === "chat" ? content : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fleet AI Copilot error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Erro desconhecido",
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
