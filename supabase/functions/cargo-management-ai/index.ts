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
      case "optimize_loading":
        systemPrompt = `Você é um especialista em planejamento de carga marítima.
Otimize o plano de carregamento considerando estabilidade, segregação e sequência de descarga.

Output em JSON com:
- optimization_score: 0-100
- utilization_percent: número
- stability_gm: número em metros
- restows_minimized: número
- loading_sequence: array de {container_id, bay, row, tier, loading_order}
- warnings: array de strings
- recommendations: array de strings`;

        userPrompt = `Otimize o carregamento:

Embarcação:
- Nome: ${data.vessel_name}
- Capacidade TEU: ${data.teu_capacity}
- Bays: ${data.total_bays}

Containers a carregar:
${JSON.stringify(data.containers || [], null, 2)}

Restrições:
- Reefer slots disponíveis: ${data.reefer_slots}
- DG slots: ${data.dg_slots}
- Peso máximo por bay: ${data.max_weight_per_bay} tons

Portos de descarga: ${JSON.stringify(data.discharge_ports || [])}`;
        break;

      case "predict_operations_time":
        systemPrompt = `Você é um especialista em operações de terminal marítimo.
Preveja o tempo de operação de carga/descarga com precisão.

Output em JSON com:
- estimated_hours: número
- confidence: 0.0-1.0
- factors: array de {factor, impact: positive/negative/neutral}
- risks: array de {risk, probability, delay_hours}
- recommended_berth_time: string ISO
- completion_eta: string ISO`;

        userPrompt = `Preveja tempo de operação:

Operação:
- Tipo: ${data.operation_type} (loading/discharging)
- Containers: ${data.container_count}
- Terminal: ${data.terminal_name}

Dados do terminal:
- Guindastes disponíveis: ${data.cranes_available}
- Produtividade média: ${data.avg_moves_per_hour} moves/hora
- Condições atuais: ${data.current_conditions}

Histórico do terminal:
${JSON.stringify(data.terminal_history || [], null, 2)}`;
        break;

      case "detect_anomalies":
        systemPrompt = `Você é um especialista em segurança de carga marítima.
Detecte anomalias em declarações de carga e identifique riscos potenciais.

Output em JSON com:
- risk_level: low/medium/high/critical
- anomalies: array de {type, severity, description, recommendation}
- compliance_issues: array de strings
- required_actions: array de {action, urgency, responsible}
- safe_to_load: boolean
- additional_inspections_needed: boolean`;

        userPrompt = `Analise declaração de carga:

Container: ${data.container_number}
Declarado como: ${data.declared_content}
Peso declarado: ${data.declared_weight} kg
Origem: ${data.origin}
Shipper: ${data.shipper_name}

Dados adicionais:
- Classe DG: ${data.dg_class || 'Não declarado'}
- Temperatura requerida: ${data.temperature || 'N/A'}
- Valor declarado: $${data.declared_value || 'N/A'}

Histórico do shipper:
${JSON.stringify(data.shipper_history || [], null, 2)}`;
        break;

      case "generate_documentation":
        systemPrompt = `Você é um especialista em documentação marítima de carga.
Gere documentos de carga conforme padrões IMDG, SOLAS e práticas comerciais.

Output em JSON com:
- bill_of_lading: {bl_number, fields: objeto}
- cargo_manifest: {entries: array}
- dangerous_goods_declaration: objeto (se aplicável)
- stowage_plan_summary: string
- missing_documents: array de strings
- validation_status: valid/invalid
- issues: array de strings`;

        userPrompt = `Gere documentação para:

Viagem:
- Embarcação: ${data.vessel_name}
- Viagem nº: ${data.voyage_number}
- Porto de carga: ${data.loading_port}
- Porto de descarga: ${data.discharge_port}

Carga:
${JSON.stringify(data.cargo_list || [], null, 2)}

Partes:
- Shipper: ${data.shipper}
- Consignee: ${data.consignee}
- Notify Party: ${data.notify_party || 'Same as consignee'}`;
        break;

      case "stability_check":
        systemPrompt = `Você é um engenheiro naval especializado em estabilidade de embarcações.
Verifique a estabilidade do plano de carga proposto.

Output em JSON com:
- gm_meters: número
- gm_status: safe/marginal/unsafe
- bending_moment_percent: número do máximo permitido
- shear_force_percent: número do máximo permitido
- heel_degrees: número
- trim_meters: número
- load_line_compliance: boolean
- warnings: array de strings
- corrections_needed: array de {action, impact_on_gm}
- approval_status: approved/conditional/rejected`;

        userPrompt = `Verifique estabilidade:

Embarcação:
- Nome: ${data.vessel_name}
- LBP: ${data.lbp_meters} m
- Beam: ${data.beam_meters} m
- GM mínimo requerido: ${data.min_gm} m

Distribuição de carga proposta:
${JSON.stringify(data.loading_plan || [], null, 2)}

Tanques:
${JSON.stringify(data.tank_soundings || [], null, 2)}

Condição de carga total: ${data.total_cargo_weight} tons`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Cargo Management AI - Action: ${action}`);

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
    console.error("Error in cargo-management-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
