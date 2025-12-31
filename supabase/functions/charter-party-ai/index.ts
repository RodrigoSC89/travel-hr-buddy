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
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "calculate_hire":
        systemPrompt = `Você é um especialista em contratos de afretamento marítimo.
Calcule o hire devido com precisão, considerando off-hire e deduções.

Output em JSON com:
- gross_hire_usd: número
- off_hire_deductions: array de {reason, days, amount_usd}
- total_off_hire_usd: número
- net_hire_usd: número
- billing_period: {from, to, days}
- adjustments: array de {description, amount_usd}
- final_amount_due: número
- payment_due_date: string ISO`;

        userPrompt = `Calcule hire para:

Contrato:
- Tipo: ${data.charter_type} (time/voyage/bareboat)
- Embarcação: ${data.vessel_name}
- Taxa diária: $${data.daily_rate}

Período:
- De: ${data.period_from}
- Até: ${data.period_to}
- Dias totais: ${data.total_days}

Off-hire events:
${JSON.stringify(data.off_hire_events || [], null, 2)}

Deduções aplicáveis:
${JSON.stringify(data.deductions || [], null, 2)}`;
        break;

      case "calculate_demurrage":
        systemPrompt = `Você é um especialista em demurrage e despatch marítimo.
Calcule demurrage/despatch com precisão baseado no Statement of Facts.

Output em JSON com:
- laytime_allowed_hours: número
- laytime_used_hours: número
- laytime_saved_hours: número (se despatch)
- laytime_exceeded_hours: número (se demurrage)
- demurrage_rate_per_day: número
- despatch_rate_per_day: número
- demurrage_amount_usd: número
- despatch_amount_usd: número
- net_amount_usd: número
- calculation_breakdown: array de {port, operation, started, completed, hours}
- exceptions: array de strings (tempo não contado)`;

        userPrompt = `Calcule demurrage/despatch:

Charter Party:
- Laytime permitido: ${data.laytime_hours} horas
- Taxa demurrage: $${data.demurrage_rate}/dia
- Taxa despatch: $${data.despatch_rate}/dia
- Termos: ${data.laytime_terms || 'SHINC'}

Statement of Facts:
${JSON.stringify(data.sof || [], null, 2)}

Exceções a considerar:
- Feriados: ${data.holidays || 'Contar'}
- Domingo: ${data.sundays || 'Contar'}
- Weather: ${data.weather_working || 'Excluir'}`;
        break;

      case "analyze_contract":
        systemPrompt = `Você é um advogado especializado em direito marítimo e contratos de afretamento.
Analise o contrato e identifique riscos e oportunidades.

Output em JSON com:
- contract_type: string
- key_terms: array de {clause, description, risk_level}
- favorable_clauses: array de strings
- unfavorable_clauses: array de strings
- missing_clauses: array de strings recomendadas
- risk_assessment: {overall: low/medium/high, areas: array}
- negotiation_points: array de strings
- compliance_checklist: array de {item, status, notes}`;

        userPrompt = `Analise o contrato de afretamento:

Tipo: ${data.charter_type}
Partes:
- Owner: ${data.owner}
- Charterer: ${data.charterer}

Termos principais:
${JSON.stringify(data.terms || {}, null, 2)}

Cláusulas especiais:
${data.special_clauses || 'Nenhuma informada'}

Jurisdição: ${data.governing_law || 'English Law'}
Arbitragem: ${data.arbitration || 'London'}`;
        break;

      case "performance_tracking":
        systemPrompt = `Você é um analista de performance de contratos de afretamento.
Avalie a performance do contrato vs os termos acordados.

Output em JSON com:
- contract_compliance_percent: número
- performance_metrics: {speed, consumption, availability}
- claims_potential: array de {type, basis, estimated_value_usd}
- owner_performance_score: 0-100
- charterer_performance_score: 0-100
- issues_log: array de {date, issue, resolution_status}
- recommendations: array de strings`;

        userPrompt = `Avalie performance do contrato:

Contrato:
- Nº: ${data.contract_number}
- Tipo: ${data.charter_type}
- Período: ${data.contract_period}

Termos contratados:
- Velocidade garantida: ${data.warranted_speed} nós
- Consumo garantido: ${data.warranted_consumption} tons/dia
- Disponibilidade: ${data.warranted_availability}%

Performance real:
${JSON.stringify(data.actual_performance || [], null, 2)}

Incidentes:
${JSON.stringify(data.incidents || [], null, 2)}`;
        break;

      case "market_rate_check":
        systemPrompt = `Você é um broker marítimo experiente.
Compare taxas do contrato com o mercado atual e forneça insights.

Output em JSON com:
- contracted_rate: número
- current_market_rate: número
- rate_difference_percent: número
- market_position: above_market/at_market/below_market
- contract_value_assessment: favorable/neutral/unfavorable
- market_trend: rising/stable/falling
- renegotiation_opportunity: boolean
- recommended_actions: array de strings`;

        userPrompt = `Compare com mercado:

Contrato atual:
- Taxa: $${data.contracted_rate}/dia
- Tipo: ${data.charter_type}
- Embarcação: ${data.vessel_type}
- Período restante: ${data.remaining_days} dias

Dados de mercado:
- Baltic Index atual: ${data.baltic_index || 'N/A'}
- Taxas recentes similares: ${JSON.stringify(data.comparable_fixtures || [])}
- Tendência: ${data.market_trend || 'stable'}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Charter Party AI - Action: ${action}`);

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

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_response: content };
    } catch {
      result = { raw_response: content };
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      result,
      generated_at: new Date().toISOString(),
      ai_model: "google/gemini-2.5-flash"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in charter-party-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
