// ============================================================================
// Supabase Edge Function: forecast-weekly
// Purpose: Weekly AI-powered forecast generation for MMI maintenance jobs using GPT-4
// Schedule: Runs every Sunday at 03:00 UTC via cron (0 3 * * 0)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Job {
  id: string;
  job_id: string;
  title: string;
  status: string;
  priority: string;
  component_name: string | null;
  vessel_name: string | null;
  asset_name: string | null;
}

interface LogData {
  executado_em: string;
  status: string;
}

interface ForecastResult {
  job_id: string;
  job_title: string;
  risco_estimado: string;
  proxima_execucao: string;
  justificativa: string;
  historico_analisado: number;
}

/**
 * Generate AI forecast for a single job using GPT-4
 * Based on job execution history from mmi_logs
 */
async function generateForecastForJob(
  job: Job,
  historico: LogData[],
  apiKey: string
): Promise<ForecastResult> {
  // Build context from historical data
  const context = `
Job: ${job.title}
Últimas execuções:
${historico?.map((h) => `- ${h.executado_em} (${h.status})`).join('\n') || '- Nenhuma execução registrada'}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
`;

  const gptPayload = {
    model: 'gpt-4',
    messages: [
      { 
        role: 'system', 
        content: 'Você é um engenheiro especialista em manutenção offshore.' 
      },
      { 
        role: 'user', 
        content: context 
      }
    ],
    temperature: 0.3
  };

  const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gptPayload)
  });

  if (!gptRes.ok) {
    const errorText = await gptRes.text();
    throw new Error(`OpenAI API error: ${gptRes.status} - ${errorText}`);
  }

  const gptData = await gptRes.json();
  const resposta = gptData.choices?.[0]?.message?.content || '';

  // 🔍 Extract data from response with regex
  const dataRegex = /\d{4}-\d{2}-\d{2}/;
  const riscoRegex = /risco:\s*(.+)/i;

  const dataSugerida = dataRegex.exec(resposta)?.[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const risco = riscoRegex.exec(resposta)?.[1]?.toLowerCase() || 'moderado';

  // Normalize risk level to standard values
  let normalizedRisk = 'moderado';
  if (risco.includes('baixo') || risco.includes('low')) {
    normalizedRisk = 'baixo';
  } else if (risco.includes('alto') || risco.includes('high') || risco.includes('crítico') || risco.includes('critical')) {
    normalizedRisk = 'alto';
  }

  return {
    job_id: job.job_id,
    job_title: job.title,
    risco_estimado: normalizedRisk,
    proxima_execucao: dataSugerida,
    justificativa: resposta.substring(0, 500), // Limit reasoning to 500 chars
    historico_analisado: historico?.length || 0
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting weekly forecast generation with GPT-4...');

    // Fetch all active jobs from mmi_jobs
    const { data: jobs, error: fetchError } = await supabase
      .from('mmi_jobs')
      .select('id, job_id, title, status, priority, component_name, vessel_name, asset_name')
      .in('status', ['pending', 'in_progress']);

    if (fetchError) {
      console.error('❌ Error fetching jobs:', fetchError);
      throw fetchError;
    }

    if (!jobs || jobs.length === 0) {
      console.log('ℹ️  No active jobs found for forecast generation');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active jobs to process',
          jobs_processed: 0,
          forecasts_created: 0,
          orders_created: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processing ${jobs.length} jobs...`);

    let forecastsCreated = 0;
    let ordersCreated = 0;
    const forecastResults: ForecastResult[] = [];

    // Process each job
    for (const job of jobs as Job[]) {
      try {
        console.log(`🔍 Processing job: ${job.title}`);

        // Query historical execution data from mmi_logs
        const { data: historico } = await supabase
          .from('mmi_logs')
          .select('executado_em, status')
          .eq('job_id', job.id)
          .order('executado_em', { ascending: false })
          .limit(5);

        console.log(`📜 Found ${historico?.length || 0} historical executions for ${job.title}`);

        // Generate forecast using GPT-4
        const forecast = await generateForecastForJob(job, historico || [], OPENAI_API_KEY);
        
        // Prepare forecast data based on mmi_forecasts schema
        const forecastData = {
          vessel_name: job.vessel_name || 'Unknown Vessel',
          system_name: job.component_name || job.asset_name || 'Unknown System',
          hourmeter: 0, // Default value, could be enhanced with actual data
          last_maintenance: historico || [],
          forecast_text: forecast.justificativa,
          priority: forecast.risco_estimado === 'alto' ? 'high' : forecast.risco_estimado === 'baixo' ? 'low' : 'medium',
        };

        // Insert forecast into mmi_forecasts
        const { data: savedForecast, error: forecastError } = await supabase
          .from('mmi_forecasts')
          .insert(forecastData)
          .select()
          .single();

        if (forecastError) {
          console.error(`❌ Error creating forecast for job ${job.job_id}:`, forecastError);
          continue;
        }

        forecastsCreated++;
        console.log(`✅ Forecast created for job ${job.job_id} with risk: ${forecast.risco_estimado}`);

        forecastResults.push(forecast);

        // Create work order (mmi_orders) automatically if risk is high
        if (forecast.risco_estimado === 'alto' && savedForecast) {
          const orderData = {
            forecast_id: savedForecast.id,
            vessel_name: job.vessel_name || 'Unknown Vessel',
            system_name: job.component_name || job.asset_name || 'Unknown System',
            description: `OS gerada automaticamente via forecast semanal GPT-4 para ${job.title}. Justificativa: ${forecast.justificativa.substring(0, 200)}...`,
            status: 'pendente',
            priority: 'alta',
          };

          const { error: orderError } = await supabase
            .from('mmi_orders')
            .insert(orderData);

          if (orderError) {
            console.error(`⚠️  Error creating order for job ${job.job_id}:`, orderError);
          } else {
            ordersCreated++;
            console.log(`📋 Work order created for high-risk job ${job.job_id}`);
          }
        }

      } catch (jobError) {
        console.error(`❌ Error processing job ${job.job_id}:`, jobError);
        continue;
      }
    }

    // Prepare summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      jobs_processed: jobs.length,
      forecasts_created: forecastsCreated,
      orders_created: ordersCreated,
      forecast_summary: {
        high_risk: forecastResults.filter(f => f.risco_estimado === 'alto').length,
        moderate_risk: forecastResults.filter(f => f.risco_estimado === 'moderado').length,
        low_risk: forecastResults.filter(f => f.risco_estimado === 'baixo').length,
      },
      forecasts: forecastResults,
    };

    console.log('✅ Weekly forecast generation with GPT-4 completed successfully!');
    console.log(`📊 Summary: ${jobs.length} jobs processed, ${forecastsCreated} forecasts created, ${ordersCreated} work orders created`);
    console.log(`⚠️  Risk distribution: ${summary.forecast_summary.high_risk} high-risk, ${summary.forecast_summary.moderate_risk} moderate-risk, ${summary.forecast_summary.low_risk} low-risk`);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in forecast-weekly:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

console.log('📅 Forecast Weekly Cron Function initialized');
