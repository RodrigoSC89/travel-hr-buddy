// ✅ Supabase Edge Function — Send AI Forecast Report via Email
// Scheduled function that generates and sends weekly maintenance forecast report
// Enhanced with GPT-4 real forecast logic based on job execution history

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobData {
  id: string;
  title: string;
  component_name: string | null;
  vessel_name: string | null;
}

interface LogData {
  executado_em: string;
  status: string;
}

interface ForecastResult {
  job_id: string;
  job_title: string;
  next_date: string;
  risk_level: string;
  reasoning: string;
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
      function_name: 'send-forecast-report',
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
 * Generate AI forecast for a single job using GPT-4
 * Based on job execution history from mmi_logs
 */
async function generateForecastForJob(
  job: JobData,
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
  let normalizedRisk = 'medium';
  if (risco.includes('baixo') || risco.includes('low')) {
    normalizedRisk = 'low';
  } else if (risco.includes('alto') || risco.includes('high') || risco.includes('crítico') || risco.includes('critical')) {
    normalizedRisk = 'high';
  }

  return {
    job_id: job.id,
    job_title: job.title,
    next_date: dataSugerida,
    risk_level: normalizedRisk,
    reasoning: resposta.substring(0, 500) // Limit reasoning to 500 chars
  };
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmails: string[],
  subject: string,
  htmlContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "noreply@nautilus.system",
      to: toEmails,
      subject: subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
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
    console.log("🚀 Starting weekly forecast report generation with GPT-4...");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const TO_EMAILS = Deno.env.get("FORECAST_REPORT_EMAILS") || "engenharia@nautilus.system";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("📊 Fetching active maintenance jobs...");

    // 1. Fetch all active jobs that need forecasting
    const { data: jobs, error: jobsError } = await supabase
      .from('mmi_jobs')
      .select('id, title, component_name, vessel_name')
      .in('status', ['pending', 'in_progress'])
      .limit(50);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      await logCronExecution(supabase, "error", "Failed to fetch jobs data", 
        { step: "fetch_jobs" }, jobsError, startTime);
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    console.log(`✅ Fetched ${jobs?.length || 0} active jobs for forecasting`);

    if (!jobs || jobs.length === 0) {
      console.log("⚠️ No active jobs found for forecasting");
      await logCronExecution(supabase, "warning", "No active jobs found", 
        { jobs_count: 0 }, null, startTime);
      
      return new Response(
        JSON.stringify({
          sent: false,
          message: "No active jobs to forecast",
          jobsCount: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 2. Generate forecasts for each job
    const forecasts: ForecastResult[] = [];
    const forecastsToSave: any[] = [];

    for (const job of jobs) {
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
      try {
        const forecast = await generateForecastForJob(job, historico || [], OPENAI_API_KEY);
        forecasts.push(forecast);

        // Prepare forecast for saving to mmi_forecasts table
        forecastsToSave.push({
          vessel_name: job.vessel_name || 'Unknown',
          system_name: job.component_name || job.title,
          hourmeter: 0, // Default value, can be enhanced later
          last_maintenance: historico || [],
          forecast_text: forecast.reasoning,
          priority: forecast.risk_level === 'high' ? 'critical' : forecast.risk_level === 'low' ? 'low' : 'medium'
        });

        console.log(`✅ Forecast generated for ${job.title}: ${forecast.next_date} (${forecast.risk_level})`);
      } catch (forecastError) {
        console.error(`❌ Error generating forecast for ${job.title}:`, forecastError);
        // Continue with next job even if one fails
      }
    }

    console.log(`✅ Generated ${forecasts.length} forecasts successfully`);

    // 3. Save forecasts to mmi_forecasts table
    if (forecastsToSave.length > 0) {
      const { error: saveError } = await supabase
        .from('mmi_forecasts')
        .insert(forecastsToSave);

      if (saveError) {
        console.error("⚠️ Error saving forecasts to database:", saveError);
        // Continue with email even if save fails
      } else {
        console.log(`✅ Saved ${forecastsToSave.length} forecasts to database`);
      }
    }

    // 4. Build email report
    const emailHtml = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🔮 Previsão Semanal de Manutenção - GPT-4</h2>
        <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Total de jobs analisados: ${forecasts.length}</p>
        <hr style="margin: 20px 0;">
        ${forecasts.map(f => `
          <div style="margin-bottom: 25px; padding: 15px; border-left: 4px solid ${
            f.risk_level === 'high' ? '#ef4444' : f.risk_level === 'low' ? '#22c55e' : '#f59e0b'
          }; background: #f9fafb;">
            <h3 style="margin-top: 0;">${f.job_title}</h3>
            <p><strong>📆 Próxima execução sugerida:</strong> ${f.next_date}</p>
            <p><strong>⚠️ Nível de risco:</strong> 
              <span style="color: ${
                f.risk_level === 'high' ? '#ef4444' : f.risk_level === 'low' ? '#22c55e' : '#f59e0b'
              }; font-weight: bold;">
                ${f.risk_level === 'high' ? 'ALTO' : f.risk_level === 'low' ? 'BAIXO' : 'MODERADO'}
              </span>
            </p>
            <p><strong>🧠 Justificativa:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 4px; font-size: 14px;">
              ${f.reasoning}
            </p>
          </div>
        `).join('')}
      </div>
    `;

    const subject = "🔧 Previsão Semanal de Manutenção - Análise GPT-4";
    const recipients = TO_EMAILS.split(",").map(email => email.trim());

    console.log(`📧 Sending email to ${recipients.join(", ")}...`);

    await sendEmailViaResend(recipients, subject, emailHtml, RESEND_API_KEY);

    console.log("✅ Email sent successfully!");

    // Log successful execution
    await logCronExecution(supabase, "success", 
      `Forecast report sent successfully to ${recipients.join(", ")}`,
      { 
        jobs_count: jobs.length,
        forecasts_generated: forecasts.length,
        forecasts_saved: forecastsToSave.length,
        recipients: recipients
      },
      null,
      startTime
    );

    return new Response(
      JSON.stringify({
        sent: true,
        message: "Forecast report sent successfully",
        jobsCount: jobs.length,
        forecastsGenerated: forecasts.length,
        recipients: recipients
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in send-forecast-report:", error);
    
    // Log critical error
    await logCronExecution(supabase, "critical", "Critical error in function",
      { step: "general_exception" }, error, startTime);
    
    return new Response(
      JSON.stringify({
        sent: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
