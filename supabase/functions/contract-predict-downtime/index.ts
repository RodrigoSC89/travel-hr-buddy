/**
 * Contract Predict Downtime - Edge Function
 * Predição de downtime usando IA e dados históricos
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractId, vesselId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados históricos de downtime
    let query = supabase.from('downtime_events').select('*');
    if (vesselId) query = query.eq('vessel_id', vesselId);
    if (contractId) query = query.eq('contract_id', contractId);
    
    const { data: downtimeHistory, error: historyError } = await query
      .order('start_time', { ascending: false })
      .limit(100);

    if (historyError) throw historyError;

    // Buscar dados de manutenção
    const { data: maintenanceData } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .limit(50);

    // Buscar dados de embarcações
    const { data: vessels } = await supabase
      .from('vessels')
      .select('id, name, type, age_years, last_maintenance_date')
      .limit(20);

    if (!LOVABLE_API_KEY) {
      // Fallback: análise baseada em regras sem IA
      const predictions = (vessels || []).slice(0, 3).map((vessel: any) => {
        const vesselDowntimes = (downtimeHistory || []).filter(
          (d: any) => d.vessel_id === vessel.id
        );
        const avgDuration = vesselDowntimes.length > 0
          ? vesselDowntimes.reduce((acc: number, d: any) => acc + (d.duration_hours || 0), 0) / vesselDowntimes.length
          : 24;
        
        const frequency = vesselDowntimes.length / 12; // eventos por mês
        const probability = Math.min(0.95, 0.2 + (frequency * 0.1) + ((vessel.age_years || 0) * 0.02));
        
        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name || 'Embarcação',
          probability,
          estimated_date: new Date(Date.now() + Math.random() * 30 * 86400000).toISOString(),
          predicted_duration_hours: Math.round(avgDuration),
          predicted_cause: frequency > 2 ? 'Falha mecânica recorrente' : 'Manutenção preventiva programada',
          confidence: 0.75,
          risk_factors: [
            vessel.age_years > 10 ? 'Idade da embarcação' : null,
            frequency > 1 ? 'Histórico de paradas frequentes' : null,
            'Condições meteorológicas sazonais',
          ].filter(Boolean),
          preventive_actions: [
            'Revisar cronograma de manutenção preventiva',
            'Verificar estoque de peças de reposição',
            'Agendar inspeção técnica antecipada',
          ],
        };
      });

      return new Response(JSON.stringify({ 
        success: true, 
        predictions,
        method: 'rule_based'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Análise com IA
    const systemPrompt = `Você é um especialista em predição de manutenção marítima e análise de riscos.
    
Analise os dados históricos e gere predições de downtime para as embarcações.

Dados de Downtime Histórico:
${JSON.stringify(downtimeHistory?.slice(0, 20), null, 2)}

Dados de Manutenção:
${JSON.stringify(maintenanceData?.slice(0, 10), null, 2)}

Embarcações:
${JSON.stringify(vessels, null, 2)}

Gere predições realistas baseadas em padrões identificados.`;

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
          { role: "user", content: "Gere predições de downtime para as próximas 4 semanas." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_predictions",
            description: "Gera predições de downtime para embarcações",
            parameters: {
              type: "object",
              properties: {
                predictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      vessel_id: { type: "string" },
                      vessel_name: { type: "string" },
                      probability: { type: "number", minimum: 0, maximum: 1 },
                      estimated_date: { type: "string", format: "date" },
                      predicted_duration_hours: { type: "number" },
                      predicted_cause: { type: "string" },
                      confidence: { type: "number", minimum: 0, maximum: 1 },
                      risk_factors: { type: "array", items: { type: "string" } },
                      preventive_actions: { type: "array", items: { type: "string" } }
                    },
                    required: ["vessel_id", "vessel_name", "probability", "predicted_cause", "risk_factors", "preventive_actions"]
                  }
                }
              },
              required: ["predictions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_predictions" } }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const predictions = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ 
        success: true, 
        ...predictions,
        method: 'ai_powered'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Failed to parse AI response');

  } catch (error: unknown) {
    console.error("Error in contract-predict-downtime:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
