// ✅ Edge Function: send-daily-restore-report
// This function sends a daily email report with logs from restore_report_logs table
// Queries logs from the last 24 hours and sends via SendGrid

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== Type Definitions ==========

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

// ========== Configuration Management ==========

/**
 * Load and validate configuration from environment variables
 */
function loadConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!sendGridApiKey) {
    throw new Error("Missing required environment variable: SENDGRID_API_KEY");
  }

  return {
    supabaseUrl,
    supabaseKey,
    sendGridApiKey,
    adminEmail,
  };
}

// ========== Database Operations ==========

/**
 * Fetch restore report logs from the last 24 hours
 */
async function fetchRecentLogs(supabase: any): Promise<RestoreReportLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - 1);
  const iso = since.toISOString();

  console.log(`📊 Fetching logs since ${iso}`);

  const { data: logs, error } = await supabase
    .from("restore_report_logs")
    .select("*")
    .gte("executed_at", iso)
    .order("executed_at", { ascending: false });

  if (error) {
    throw new Error("Erro ao buscar logs: " + error.message);
  }

  return logs || [];
}

/**
 * Log email sending status to report_email_logs table
 */
async function logEmailStatus(
  supabase: any,
  status: string,
  message: string
): Promise<void> {
  try {
    await supabase.from("report_email_logs").insert({
      status,
      message,
    });
  } catch (logError) {
    console.error("Failed to log email status:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

// ========== Email Generation ==========

/**
 * Format logs into email body text
 */
function formatEmailBody(logs: RestoreReportLog[]): string {
  if (logs.length === 0) {
    return "📭 Nenhum log encontrado nas últimas 24 horas.";
  }

  return logs.map((log) =>
    `📅 ${log.executed_at}\n🔹 Status: ${log.status}\n📝 ${log.message || "N/A"}${
      log.error_details ? `\n❗ ${log.error_details}` : ""
    }`
  ).join("\n\n");
}

// ========== Email Sending ==========

/**
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(
  apiKey: string,
  toEmail: string,
  subject: string,
  body: string
): Promise<void> {
  console.log(`📧 Sending email to ${toEmail}`);

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: "no-reply@empresa.com", name: "Nautilus Logs" },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Erro ao enviar e-mail: " + errorText);
  }

  console.log("✅ Email sent successfully");
}

// ========== Main Handler ==========

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase: any = null;

  try {
    console.log("🚀 Starting send-daily-restore-report function...");

    // Load configuration
    const config = loadConfig();

    // Initialize Supabase client
    supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Fetch logs from last 24 hours
    const logs = await fetchRecentLogs(supabase);
    console.log(`📊 Found ${logs.length} logs`);

    // Format email body
    const body = formatEmailBody(logs);

    // Generate subject with current date
    const subject = `📄 Relatório de Logs - ${new Date().toLocaleDateString('pt-BR')}`;

    // Send email via SendGrid
    await sendEmailViaSendGrid(config.sendGridApiKey, config.adminEmail, subject, body);

    // Log successful email sending
    await logEmailStatus(
      supabase,
      "success",
      `Enviado para ${config.adminEmail} (${logs.length} logs)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Email enviado com sucesso!",
        logsCount: logs.length,
        recipient: config.adminEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in send-daily-restore-report:", error);

    // Log error to report_email_logs if supabase is available
    if (supabase) {
      await logEmailStatus(supabase, "error", error.message);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "❌ Erro no envio de relatório",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
