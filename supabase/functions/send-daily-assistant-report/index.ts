// @ts-nocheck
// ✅ Supabase Edge Function — Send Daily Assistant Report via Email (CSV)
// Scheduled function that sends daily assistant interaction logs via email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssistantLog {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user_id: string;
}

/**
 * Log execution status to assistant_report_logs table
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  logs_count: number = 0,
  error: any = null
) {
  try {
    await supabase.from("assistant_report_logs").insert({
      status,
      message,
      logs_count,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    });
  } catch (logError) {
    console.error("Failed to log execution:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log execution to cron_execution_logs table (comprehensive monitoring)
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
      function_name: 'send-daily-assistant-report',
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
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Generate CSV content from assistant logs
 */
function generateCSV(logs: AssistantLog[], profiles: any): string {
  const headers = ["Data/Hora", "Usuário", "Pergunta", "Resposta"];
  
  const rows = logs.map((log) => {
    // Find user email from profiles
    const profile = profiles.find((p: any) => p.id === log.user_id);
    const userEmail = profile?.email || "Anônimo";
    
    return [
      new Date(log.created_at).toLocaleString("pt-BR"),
      userEmail,
      log.question.replace(/[\r\n]+/g, " ").substring(0, 500),
      log.answer.replace(/<[^>]*>/g, "").replace(/[\r\n]+/g, " ").substring(0, 1000),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => 
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(logsCount: number, csvAttached: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📬 Relatório Diário - Assistente IA</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Resumo do Relatório</h2>
            <p><strong>Total de Interações (últimas 24h):</strong> ${logsCount}</p>
            <p><strong>Arquivo Anexo:</strong> ${csvAttached ? "✅ CSV incluído" : "❌ Nenhum dado disponível"}</p>
          </div>
          <p>O relatório em formato CSV está anexado a este email com as interações do Assistente IA das últimas 24 horas.</p>
          <p>Colunas do relatório:</p>
          <ul>
            <li><strong>Data/Hora:</strong> Data e hora da interação</li>
            <li><strong>Usuário:</strong> Email do usuário</li>
            <li><strong>Pergunta:</strong> Pergunta feita ao assistente</li>
            <li><strong>Resposta:</strong> Resposta fornecida pelo assistente</li>
          </ul>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente às 8:00 AM UTC.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "noreply@nauti-one.com",
      to: toEmail,
      subject: subject,
      html: htmlContent,
      attachments: csvContent ? [{
        filename: `relatorio-assistente-${new Date().toISOString().split('T')[0]}.csv`,
        content: btoa(csvContent),
      }] : [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { 
        email: Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com",
        name: "Nautilus One Reports"
      },
      subject: subject,
      content: [{ type: "text/html", value: htmlContent }],
      attachments: csvContent ? [{
        content: btoa(csvContent),
        filename: `relatorio-assistente-${new Date().toISOString().split('T')[0]}.csv`,
        type: "text/csv",
        disposition: "attachment",
      }] : [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
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
    console.log("🚀 Starting daily assistant report generation...");

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@nautilusone.com";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

    console.log("📊 Fetching assistant logs from last 24h...");

    // Fetch logs from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error: logsError } = await supabase
      .from("assistant_logs")
      .select("id, question, answer, created_at, user_id")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("Error fetching logs:", logsError);
      await logExecution(supabase, "error", "Failed to fetch assistant logs", 0, logsError);
      // ✅ Log Fetch Error to cron_execution_logs
      await logCronExecution(supabase, "error", "Failed to fetch assistant logs", 
        { step: "fetch_logs" }, logsError, startTime);
      throw new Error(`Failed to fetch logs: ${logsError.message}`);
    }

    console.log(`✅ Fetched ${logs?.length || 0} logs from last 24h`);

    // Fetch user profiles to get emails
    let profiles = [];
    if (logs && logs.length > 0) {
      const userIds = [...new Set(logs.map(log => log.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      profiles = profilesData || [];
    }

    // Generate CSV
    const csvContent = logs && logs.length > 0 ? generateCSV(logs, profiles) : "";
    const emailHtml = generateEmailHtml(logs?.length || 0, csvContent.length > 0);

    console.log("📧 Sending email report...");

    // Send email via Resend or SendGrid
    const subject = `📬 Relatório Diário - Assistente IA ${new Date().toLocaleDateString('pt-BR')}`;
    
    try {
      if (RESEND_API_KEY) {
        console.log("Using Resend API...");
        await sendEmailViaResend(ADMIN_EMAIL, subject, emailHtml, csvContent, RESEND_API_KEY);
      } else if (SENDGRID_API_KEY) {
        console.log("Using SendGrid API...");
        await sendEmailViaSendGrid(ADMIN_EMAIL, subject, emailHtml, csvContent, SENDGRID_API_KEY);
      } else {
        throw new Error("No email service configured. Please set RESEND_API_KEY or SENDGRID_API_KEY");
      }
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      await logExecution(supabase, "error", "Failed to send email", logs?.length || 0, emailError);
      // ✅ Email Send Error to cron_execution_logs
      await logCronExecution(supabase, "error", "Failed to send email", 
        { step: "send_email", logs_count: logs?.length || 0, recipient: ADMIN_EMAIL }, 
        emailError, startTime);
      throw emailError;
    }

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(
      supabase, 
      "success", 
      `Report sent successfully to ${ADMIN_EMAIL}`,
      logs?.length || 0
    );

    // ✅ Success to cron_execution_logs
    await logCronExecution(supabase, "success", 
      `Report sent successfully to ${ADMIN_EMAIL}`,
      { 
        logs_count: logs?.length || 0, 
        recipient: ADMIN_EMAIL,
        email_service: RESEND_API_KEY ? 'resend' : 'sendgrid'
      },
      null,
      startTime
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily assistant report sent successfully",
        logsCount: logs?.length || 0,
        recipient: ADMIN_EMAIL,
        emailSent: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in send-daily-assistant-report:", error);
    
    // Log critical error
    await logExecution(supabase, "critical", "Critical error in function", 0, error);
    
    // ✅ Critical Error to cron_execution_logs
    await logCronExecution(supabase, "critical", "Critical error in function",
      { step: "general_exception" }, error, startTime);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
