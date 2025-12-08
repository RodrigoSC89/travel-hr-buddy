// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictiveRequest {
  vesselId?: string;
  equipmentId?: string;
  analysisType: 'failure_prediction' | 'maintenance_schedule' | 'anomaly_detection' | 'health_assessment';
  timeHorizonDays?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { vesselId, equipmentId, analysisType, timeHorizonDays = 30 }: PredictiveRequest = await req.json();
    
    console.log(`[AI-Predictive] Analysis type: ${analysisType}, Vessel: ${vesselId}, Equipment: ${equipmentId}`);

    // Fetch relevant data based on analysis type
    let contextData: any = {};

    // Get maintenance history
    const { data: maintenanceHistory } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .order('scheduled_date', { ascending: false })
      .limit(50);

    // Get equipment data if available
    const { data: equipment } = await supabase
      .from('equipment')
      .select('*')
      .limit(20);

    // Get recent work orders
    const { data: workOrders } = await supabase
      .from('mmi_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    contextData = {
      maintenanceHistory: maintenanceHistory || [],
      equipment: equipment || [],
      workOrders: workOrders || [],
      analysisDate: new Date().toISOString(),
      timeHorizon: timeHorizonDays
    };

    // Build analysis prompt based on type
    const analysisPrompts: Record<string, string> = {
      failure_prediction: `Analise os dados de manutenção e histórico de trabalho para prever possíveis falhas nos próximos ${timeHorizonDays} dias.
        
Dados disponíveis:
- Histórico de manutenção: ${JSON.stringify(contextData.maintenanceHistory.slice(0, 10))}
- Equipamentos: ${JSON.stringify(contextData.equipment.slice(0, 5))}
- Ordens de trabalho recentes: ${JSON.stringify(contextData.workOrders.slice(0, 10))}

Forneça:
1. Lista de equipamentos com maior probabilidade de falha
2. Probabilidade estimada (%) para cada um
3. Sinais de alerta identificados
4. Ações preventivas recomendadas
5. Impacto financeiro estimado se não tratado`,

      maintenance_schedule: `Otimize o cronograma de manutenção para os próximos ${timeHorizonDays} dias baseado nos dados históricos.

Dados:
- Manutenções programadas: ${JSON.stringify(contextData.maintenanceHistory.slice(0, 10))}
- Equipamentos: ${JSON.stringify(contextData.equipment.slice(0, 5))}

Forneça:
1. Cronograma otimizado de manutenções
2. Priorização baseada em criticidade
3. Recursos necessários estimados
4. Janelas de oportunidade identificadas
5. Economia potencial com a otimização`,

      anomaly_detection: `Detecte anomalias nos padrões de manutenção e operação.

Dados históricos:
- Manutenções: ${JSON.stringify(contextData.maintenanceHistory.slice(0, 15))}
- Ordens de trabalho: ${JSON.stringify(contextData.workOrders.slice(0, 15))}

Identifique:
1. Padrões anômalos de falha
2. Equipamentos com comportamento fora do esperado
3. Tendências preocupantes
4. Correlações inesperadas
5. Recomendações de investigação`,

      health_assessment: `Avalie a saúde geral dos ativos e forneça um diagnóstico completo.

Dados:
- Equipamentos: ${JSON.stringify(contextData.equipment)}
- Histórico: ${JSON.stringify(contextData.maintenanceHistory.slice(0, 20))}

Forneça:
1. Score de saúde geral (0-100)
2. Score por categoria de equipamento
3. Ativos críticos que requerem atenção
4. Vida útil estimada restante
5. Investimentos recomendados`
    };

    const systemPrompt = `Você é um especialista em manutenção preditiva e análise de ativos industriais marítimos.
Sua análise deve ser técnica, precisa e acionável.
Use dados quantitativos sempre que possível.
Priorize segurança operacional.
Forneça respostas em formato estruturado JSON quando apropriado.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompts[analysisType] }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns segundos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'Créditos de IA esgotados.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-Predictive] AI API error:', errorText);
      throw new Error('AI API error');
    }

    const data = await aiResponse.json();
    const analysis = data.choices[0].message.content;

    // Log the analysis
    console.log(`[AI-Predictive] Analysis completed for ${analysisType}`);

    return new Response(
      JSON.stringify({
        analysisType,
        analysis,
        contextSummary: {
          maintenanceCount: contextData.maintenanceHistory.length,
          equipmentCount: contextData.equipment.length,
          workOrderCount: contextData.workOrders.length,
        },
        generatedAt: new Date().toISOString(),
        timeHorizonDays
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI-Predictive] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
