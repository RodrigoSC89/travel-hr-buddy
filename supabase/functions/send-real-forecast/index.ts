// ✅ Supabase Edge Function — Send Real Forecast Report via Email
// Scheduled function that generates and sends daily maintenance forecast report

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobData {
  component_id: string;
  completed_at: string;
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
      function_name: 'send-real-forecast',
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
 * Generate AI forecast using OpenAI
 */
async function generateForecast(trendByComponent: Record<string, string[]>, apiKey: string): Promise<string> {
  const prompt = `Abaixo estão os dados de jobs por componente (por mês):\n
${JSON.stringify(trendByComponent, null, 2)}\n
Gere uma previsão dos próximos dois meses por componente e indique os mais críticos.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No forecast generated";
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
    console.log("🚀 Starting real forecast report generation...");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const TO_EMAILS = Deno.env.get("FORECAST_REPORT_EMAILS") || "engenharia@nautilus.system";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("📊 Fetching completed jobs from last 6 months...");

    // 1. Collect completed jobs from last 6 months
    const sixMonthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString();
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select('component_id, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', sixMonthsAgo);

    if (error) {
      console.error("Error fetching jobs:", error);
      await logCronExecution(supabase, "error", "Failed to fetch jobs data", 
        { step: "fetch_jobs" }, error, startTime);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    console.log(`✅ Fetched ${data?.length || 0} completed jobs from last 6 months`);

    // 2. Group by component and month
    const trendByComponent: Record<string, string[]> = {};
    (data || []).forEach((job: JobData) => {
      if (job.completed_at) {
        const month = job.completed_at.slice(0, 7); // YYYY-MM format
        const componentId = job.component_id || 'unknown';
        if (!trendByComponent[componentId]) {
          trendByComponent[componentId] = [];
        }
        trendByComponent[componentId].push(month);
      }
    });

    console.log("🤖 Generating AI forecast...");

    // 3. Generate AI forecast
    const forecast = await generateForecast(trendByComponent, OPENAI_API_KEY);

    console.log("✅ AI forecast generated successfully");

    // 4. Send email report
    const emailHtml = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🔮 Previsão Real IA</h2>
        <pre style="background:#f4f4f4; padding: 10px; border-radius: 6px; white-space: pre-wrap;">${forecast}</pre>
      </div>
    `;

    const subject = "🔧 Previsão Real de Manutenção por Componente";
    const recipients = TO_EMAILS.split(",").map(email => email.trim());

    console.log(`📧 Sending email to ${recipients.join(", ")}...`);

    await sendEmailViaResend(recipients, subject, emailHtml, RESEND_API_KEY);

    console.log("✅ Email sent successfully!");

    // Log successful execution
    await logCronExecution(supabase, "success", 
      `Real forecast report sent successfully to ${recipients.join(", ")}`,
      { 
        jobs_count: data?.length || 0,
        components_count: Object.keys(trendByComponent).length,
        recipients: recipients
      },
      null,
      startTime
    );

    return new Response(
      JSON.stringify({
        sent: true,
        message: "Real forecast report sent successfully",
        jobsCount: data?.length || 0,
        componentsCount: Object.keys(trendByComponent).length,
        recipients: recipients
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in send-real-forecast:", error);
    
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
