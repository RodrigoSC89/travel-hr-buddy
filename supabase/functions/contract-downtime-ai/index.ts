/**
 * Contract Downtime AI - Edge Function
 * Orquestrador para análises de downtime e geração de BROA
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
    const { action, contractId, eventId, data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let result;

    switch (action) {
      case 'analyze_contract': {
        // Buscar contrato e seus eventos de downtime
        const { data: contract, error: contractError } = await supabase
          .from('vessel_contracts')
          .select('*')
          .eq('id', contractId)
          .single();
        
        if (contractError) throw contractError;

        const { data: downtimes, error: dtError } = await supabase
          .from('downtime_events')
          .select('*')
          .eq('contract_id', contractId)
          .order('start_time', { ascending: false })
          .limit(20);

        if (dtError) throw dtError;

        // Calcular métricas
        const totalDowntimeHours = (downtimes || []).reduce((acc: number, d: { duration_hours?: number }) => acc + (d.duration_hours || 0), 0);
        const contractDays = contract.end_date 
          ? Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))
          : 365;
        const totalContractHours = contractDays * 24;
        const downtimePercent = (totalDowntimeHours / totalContractHours) * 100;
        const slaStatus = downtimePercent <= (contract.sla_downtime_percent || 5) ? 'compliant' : 'violation';

        const systemPrompt = `Você é um analista de contratos marítimos. Analise o contrato e seus eventos de downtime para gerar insights acionáveis.`;
        
        const userPrompt = `Analise o seguinte contrato:

**Contrato:** ${contract.contract_number}
**Cliente:** ${contract.client_name}
**Período:** ${contract.start_date} até ${contract.end_date}
**SLA Downtime:** ${contract.sla_downtime_percent}%
**Penalidade/Hora:** USD ${contract.penalty_per_hour}

**Métricas Calculadas:**
- Total Downtime: ${totalDowntimeHours.toFixed(1)}h
- Downtime %: ${downtimePercent.toFixed(2)}%
- Status SLA: ${slaStatus}
- Eventos de Downtime: ${(downtimes || []).length}

Forneça:
1. Avaliação geral do status do contrato
2. Principais riscos identificados
3. Recomendações para melhorar compliance
4. Projeção de penalidades se a tendência continuar`;

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
          }),
        });

        if (!response.ok) {
          throw new Error(`AI gateway error: ${response.status}`);
        }

        const aiData = await response.json();
        const analysis = aiData.choices?.[0]?.message?.content || "";

        // Atualizar contrato com análise
        await supabase
          .from('vessel_contracts')
          .update({
            ai_analysis: {
              analysis,
              metrics: {
                totalDowntimeHours,
                downtimePercent,
                slaStatus,
                eventCount: (downtimes || []).length
              },
              analyzed_at: new Date().toISOString()
            }
          })
          .eq('id', contractId);

        result = {
          success: true,
          contract_number: contract.contract_number,
          analysis,
          metrics: {
            totalDowntimeHours,
            downtimePercent,
            slaStatus,
            eventCount: (downtimes || []).length
          }
        };
        break;
      }

      case 'generate_broa': {
        // Buscar evento de downtime
        const { data: event, error: eventError } = await supabase
          .from('downtime_events')
          .select('*, vessel_contracts(*)')
          .eq('id', eventId)
          .single();
        
        if (eventError) throw eventError;

        // Chamar generate-broa function internamente
        const broaResponse = await fetch(`${supabaseUrl}/functions/v1/generate-broa`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            downtime_event: {
              start_time: event.start_time,
              end_time: event.end_time,
              reason: event.reason,
              system_affected: event.reason_category,
              impact_level: event.impact_level,
              duration_hours: event.duration_hours
            },
            vessel: {
              name: event.vessel_contracts?.vessel_name || 'Embarcação',
              imo_number: event.vessel_contracts?.imo_number,
              flag_state: 'Brasil'
            },
            contract: event.vessel_contracts ? {
              contract_number: event.vessel_contracts.contract_number,
              client: event.vessel_contracts.client_name
            } : null
          }),
        });

        if (!broaResponse.ok) {
          throw new Error(`BROA generation failed: ${broaResponse.status}`);
        }

        result = await broaResponse.json();
        break;
      }

      case 'batch_analyze': {
        // Análise em lote de múltiplos eventos
        const events = data?.events || [];
        const analyses = [];

        for (const event of events.slice(0, 10)) {
          const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-downtime`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              downtime_event: event,
              contract: data?.contract || { sla_downtime_percent: 5, penalty_per_hour: 1000, client: 'N/A' },
              vessel_name: data?.vessel_name || 'Embarcação'
            }),
          });

          if (analysisResponse.ok) {
            const analysisResult = await analysisResponse.json();
            analyses.push({
              event_id: event.id,
              ...analysisResult
            });
          }
        }

        result = {
          success: true,
          analyzed_count: analyses.length,
          analyses
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Contract AI action '${action}' completed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in contract-downtime-ai:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
