import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      function_name: 'mmi-forecast-email',
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
    console.log("🚀 Starting MMI forecast email generation...");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    // Buscar previsões dos últimos 2 dias
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`📊 Fetching forecasts from last 2 days (since ${twoDaysAgo})...`);

    const { data: jobs, error } = await supabase
      .from("mmi_jobs")
      .select("*")
      .gte("forecast_date", twoDaysAgo)
      .order("forecast_date", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      await logCronExecution(supabase, "error", "Failed to fetch forecast jobs", 
        { step: "fetch_jobs" }, error, startTime);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log("ℹ️ No forecasts found for the last 2 days");
      await logCronExecution(supabase, "warning", 
        "No forecast jobs found in the last 2 days",
        { days_checked: 2 },
        null,
        startTime
      );
      return new Response(
        JSON.stringify({ sent: false, message: "Nenhuma previsão para enviar." }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`✅ Found ${jobs.length} forecast jobs`);

    // Criar corpo do email
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #1e40af;">📈 Forecast de Manutenção - MMI</h1>
        <p style="color: #64748b;">Previsões de manutenção dos últimos 2 dias</p>
        <ul style="list-style: none; padding: 0;">
          ${jobs
            .map(
              (j) => `
            <li style="background: #f1f5f9; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <strong style="color: #1e293b; font-size: 16px;">${j.title}</strong><br/>
              <span style="color: #64748b;">📅 Previsão: ${j.forecast || 'N/A'}</span> | 
              <span style="color: #64748b;">⏱️ Horas: ${j.hours || 'N/A'}h</span> | 
              <span style="color: #64748b;">👤 Responsável: ${j.responsible || 'N/A'}</span>
            </li>`
            )
            .join("")}
        </ul>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
          Gerado automaticamente pelo sistema MMI em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    `;

    // Enviar email
    console.log("📧 Sending email to engenharia@nautilus.one...");
    
    const { error: emailError } = await resend.emails.send({
      from: "MMI Forecast <noreply@nautilus.one>",
      to: ["engenharia@nautilus.one"],
      subject: "📬 Previsões de Manutenção (últimos 2 dias)",
      html
    });

    if (emailError) {
      console.error("Erro ao enviar previsão MMI:", emailError);
      await logCronExecution(supabase, "error", "Failed to send email", 
        { jobs_count: jobs.length, step: "send_email" }, emailError, startTime);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("✅ Email sent successfully!");

    // Log successful execution
    await logCronExecution(supabase, "success", 
      `MMI forecast email sent successfully with ${jobs.length} forecast(s)`,
      { 
        jobs_count: jobs.length,
        recipients: ["engenharia@nautilus.one"]
      },
      null,
      startTime
    );

    return new Response(
      JSON.stringify({
        sent: true,
        message: "Forecasts enviados com sucesso",
        jobsCount: jobs.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in mmi-forecast-email:", error);
    
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

