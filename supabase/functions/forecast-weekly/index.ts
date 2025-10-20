// ✅ Supabase Edge Function — Forecast Weekly with Real GPT-4 Intelligence
// Automated weekly maintenance forecasting with AI-powered risk assessment
// Etapa 8: Real GPT-4 forecasting with job execution history

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobLog {
  executado_em: string;
  status: string;
}

interface Job {
  id: string;
  title: string;
  nome?: string;
  description?: string;
  component_id?: string;
  status: string;
}

interface ForecastResult {
  job_id: string;
  job_nome: string;
  data_sugerida: string;
  risco: string;
  justificativa: string;
  historico_analisado: number;
}

/**
 * Log execution to cron_execution_logs table
 */
async function logCronExecution(
  supabase: any,
  status: 'success' | 'error' | 'warning' | 'critical',
  message: string,
  metadata: any = {},
  error: any = null,
  startTime?: number
) {
  try {
    const executionData: any = {
      function_name: 'forecast-weekly',
      status,
      message,
      metadata,
      error_details: error ? { 
        message: error.message, 
        stack: error.stack,
        details: error 
      } : null,
    };

    if (startTime) {
      executionData.execution_duration_ms = Date.now() - startTime;
    }

    await supabase.from("cron_execution_logs").insert(executionData);
  } catch (logError) {
    console.error("Failed to log to cron_execution_logs:", logError);
  }
}

/**
 * Generate AI forecast using GPT-4 for a specific job with history
 */
async function generateJobForecast(
  job: Job,
  historico: JobLog[],
  apiKey: string
): Promise<Omit<ForecastResult, 'job_id' | 'job_nome' | 'historico_analisado'>> {
  const jobName = job.nome || job.title;
  
  // Build context from execution history
  const historicoText = historico && historico.length > 0
    ? historico.map((h) => `- ${h.executado_em} (${h.status})`).join('\n')
    : 'Nenhum histórico disponível';

  const context = `
Job: ${jobName}
Descrição: ${job.description || 'Sem descrição'}
Status Atual: ${job.status}

Últimas execuções:
${historicoText}

Recomende a próxima execução e avalie o risco técnico com base no histórico.
Responda no seguinte formato:
Data sugerida: YYYY-MM-DD
Risco: [baixo|moderado|alto]
Justificativa: [Análise técnica em até 200 caracteres]
`;

  const gptPayload = {
    model: 'gpt-4',
    messages: [
      { 
        role: 'system', 
        content: 'Você é um engenheiro especialista em manutenção offshore. Analise o histórico de manutenção e forneça previsões técnicas precisas.' 
      },
      { role: 'user', content: context }
    ],
    temperature: 0.3
  };

  console.log(`📤 Calling GPT-4 for job: ${jobName}`);

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

  console.log(`📥 GPT-4 response for ${jobName}:`, resposta);

  // Extract data from response using regex
  const dataRegex = /data sugerida:\s*(\d{4}-\d{2}-\d{2})/i;
  const riscoRegex = /risco:\s*(baixo|moderado|alto)/i;
  const justificativaRegex = /justificativa:\s*(.+?)(?:\n|$)/i;

  const dataMatch = dataRegex.exec(resposta);
  const riscoMatch = riscoRegex.exec(resposta);
  const justificativaMatch = justificativaRegex.exec(resposta);

  // Calculate suggested date (default to 30 days from now if not parsed)
  let dataSugerida = new Date();
  if (dataMatch && dataMatch[1]) {
    dataSugerida = new Date(dataMatch[1]);
  } else {
    // If no date parsed, estimate based on history or default to 30 days
    if (historico && historico.length >= 2) {
      // Calculate average interval between executions
      const intervals = [];
      for (let i = 1; i < historico.length; i++) {
        const date1 = new Date(historico[i-1].executado_em);
        const date2 = new Date(historico[i].executado_em);
        intervals.push(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const lastExecution = new Date(historico[0].executado_em);
      dataSugerida = new Date(lastExecution.getTime() + avgInterval * 24 * 60 * 60 * 1000);
    } else {
      dataSugerida.setDate(dataSugerida.getDate() + 30);
    }
  }

  const risco = riscoMatch?.[1]?.toLowerCase() || 'moderado';
  const justificativa = justificativaMatch?.[1]?.trim() || 
    'Previsão baseada em análise do histórico de manutenção e intervalos típicos.';

  return {
    data_sugerida: dataSugerida.toISOString().split('T')[0],
    risco: risco,
    justificativa: justificativa.substring(0, 200) // Limit to 200 chars
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const startTime = Date.now();

  try {
    console.log("🚀 Starting weekly forecast generation with GPT-4...");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("✅ OPENAI_API_KEY configured");

    // 1. Fetch all active maintenance jobs
    console.log("📊 Fetching active maintenance jobs...");
    
    const { data: jobs, error: jobsError } = await supabase
      .from('mmi_jobs')
      .select('id, title, nome, description, component_id, status')
      .in('status', ['pending', 'in_progress'])
      .limit(50); // Process up to 50 jobs at a time

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      await logCronExecution(supabase, "error", "Failed to fetch jobs", 
        { step: "fetch_jobs" }, jobsError, startTime);
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    console.log(`✅ Fetched ${jobs?.length || 0} active jobs`);

    if (!jobs || jobs.length === 0) {
      await logCronExecution(supabase, "warning", "No active jobs found for forecasting",
        { jobs_count: 0 }, null, startTime);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active jobs to forecast",
          forecasts: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 2. Process each job and generate forecast
    const forecasts: ForecastResult[] = [];
    const errors: Array<{job_id: string, error: string}> = [];

    for (const job of jobs) {
      try {
        console.log(`🔍 Processing job: ${job.title || job.nome} (${job.id})`);

        // Get execution history for this job
        const { data: historico, error: historicoError } = await supabase
          .from('mmi_logs')
          .select('executado_em, status')
          .eq('job_id', job.id)
          .order('executado_em', { ascending: false })
          .limit(5);

        if (historicoError) {
          console.error(`Error fetching history for job ${job.id}:`, historicoError);
          errors.push({ job_id: job.id, error: historicoError.message });
          continue;
        }

        console.log(`📜 Found ${historico?.length || 0} history records for job ${job.id}`);

        // Generate forecast with GPT-4
        const forecast = await generateJobForecast(job, historico || [], OPENAI_API_KEY);

        const forecastResult: ForecastResult = {
          job_id: job.id,
          job_nome: job.title || job.nome || 'Sem nome',
          ...forecast,
          historico_analisado: historico?.length || 0
        };

        forecasts.push(forecastResult);
        console.log(`✅ Forecast generated for ${forecastResult.job_nome}:`, forecastResult);

      } catch (jobError: any) {
        console.error(`Error processing job ${job.id}:`, jobError);
        errors.push({ job_id: job.id, error: jobError.message });
      }
    }

    console.log(`✅ Generated ${forecasts.length} forecasts`);
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} jobs had errors:`, errors);
    }

    // Log successful execution
    await logCronExecution(supabase, 
      errors.length > 0 ? "warning" : "success",
      `Weekly forecast completed: ${forecasts.length} forecasts generated`,
      { 
        jobs_processed: jobs.length,
        forecasts_generated: forecasts.length,
        errors_count: errors.length,
        errors: errors.slice(0, 5) // Only log first 5 errors
      },
      null,
      startTime
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly forecast completed successfully",
        forecasts: forecasts,
        summary: {
          jobs_processed: jobs.length,
          forecasts_generated: forecasts.length,
          errors: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("❌ Critical error in forecast-weekly:", error);
    
    // Log critical error
    await logCronExecution(supabase, "critical", "Critical error in function",
      { step: "general_exception" }, error, startTime);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
