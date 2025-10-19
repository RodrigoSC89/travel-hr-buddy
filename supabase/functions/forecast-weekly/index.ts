// ============================================================================
// Supabase Edge Function: forecast-weekly
// Purpose: Weekly AI-powered forecast generation for MMI maintenance jobs
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

interface ForecastResult {
  job_id: string;
  risco_estimado: string;
  proxima_execucao: string;
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

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting weekly forecast generation...');

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
        // ⚙️ Simulação de forecast IA — substitua com GPT real depois
        // Generate simulated risk assessment (70% chance of moderate, 30% chance of high)
        const risco = Math.random() > 0.7 ? 'alto' : 'moderado';
        
        // Calculate next execution date based on risk
        const proximaData = new Date();
        proximaData.setDate(proximaData.getDate() + (risco === 'alto' ? 7 : 30));

        // Prepare forecast data based on mmi_forecasts schema
        const forecastData = {
          vessel_name: job.vessel_name || 'Unknown Vessel',
          system_name: job.component_name || job.asset_name || 'Unknown System',
          hourmeter: 0, // Default value, could be enhanced with actual data
          last_maintenance: [],
          forecast_text: `Forecast gerado automaticamente via cron semanal para ${job.title}. Risco estimado: ${risco}. Próxima execução recomendada: ${proximaData.toISOString().split('T')[0]}.`,
          priority: risco === 'alto' ? 'high' : 'medium',
        };

        // Insert forecast into mmi_forecasts
        const { data: forecast, error: forecastError } = await supabase
          .from('mmi_forecasts')
          .insert(forecastData)
          .select()
          .single();

        if (forecastError) {
          console.error(`❌ Error creating forecast for job ${job.job_id}:`, forecastError);
          continue;
        }

        forecastsCreated++;
        console.log(`✅ Forecast created for job ${job.job_id} with risk: ${risco}`);

        forecastResults.push({
          job_id: job.job_id,
          risco_estimado: risco,
          proxima_execucao: proximaData.toISOString(),
        });

        // Create work order (mmi_orders) automatically if risk is high
        if (risco === 'alto' && forecast) {
          const orderData = {
            forecast_id: forecast.id,
            vessel_name: job.vessel_name || 'Unknown Vessel',
            system_name: job.component_name || job.asset_name || 'Unknown System',
            description: `OS gerada automaticamente via forecast semanal para ${job.title}. Prioridade alta requerida.`,
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
      },
    };

    console.log('✅ Weekly forecast generation completed successfully!');
    console.log(`📊 Summary: ${jobs.length} jobs processed, ${forecastsCreated} forecasts created, ${ordersCreated} work orders created`);
    console.log(`⚠️  Risk distribution: ${summary.forecast_summary.high_risk} high-risk, ${summary.forecast_summary.moderate_risk} moderate-risk`);

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
