// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email (CSV format)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreLog {
  executed_at: string;
  status: string;
  message: string;
  error_details: string | null;
}

/**
 * Log execution status to restore_report_logs table
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
) {
  try {
    await supabase.from("restore_report_logs").insert({
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    });
  } catch (logError) {
    console.error("Failed to log execution:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Generate CSV content from restore report logs
 */
function generateCSV(logs: RestoreLog[]): string {
  const headers = ["Date", "Status", "Message", "Error"];
  const rows = logs.map((log) => [
    new Date(log.executed_at).toLocaleString("pt-BR"),
    log.status,
    log.message || "-",
    log.error_details || "-",
  ]);

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
          <h1>📊 Relatório Diário - Logs de Restauração</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Resumo do Relatório</h2>
            <p><strong>Total de Logs (últimas 24h):</strong> ${logsCount}</p>
            <p><strong>Arquivo Anexo:</strong> ${csvAttached ? "✅ CSV incluído" : "❌ Nenhum dado disponível"}</p>
          </div>
          <p>O relatório em formato CSV está anexado a este email com os logs de execução das últimas 24 horas.</p>
          <p>Colunas do relatório:</p>
          <ul>
            <li><strong>Date:</strong> Data e hora da execução</li>
            <li><strong>Status:</strong> Status da execução (success, error, critical)</li>
            <li><strong>Message:</strong> Mensagem descritiva</li>
            <li><strong>Error:</strong> Detalhes do erro (se houver)</li>
          </ul>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente às 7:00 AM.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
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
        filename: `restore-logs-${new Date().toISOString().split('T')[0]}.csv`,
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

/**
 * Send email via SMTP (fallback method)
 */
async function sendEmailViaSMTP(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string
): Promise<void> {
  // Note: This requires a Node.js API endpoint with nodemailer
  // For edge functions, SendGrid is recommended
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  if (!appUrl) {
    throw new Error("APP_URL not configured for SMTP fallback");
  }

  const response = await fetch(`${appUrl}/api/send-restore-report-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toEmail,
      subject,
      html: htmlContent,
      csvContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SMTP API error: ${response.status} - ${errorText}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("🚀 Starting daily restore report generation...");

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

    console.log("📊 Fetching restore report logs from last 24h...");

    // Fetch logs from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error: logsError } = await supabase
      .from("restore_report_logs")
      .select("executed_at, status, message, error_details")
      .gte("executed_at", yesterday)
      .order("executed_at", { ascending: false });

    if (logsError) {
      console.error("Error fetching logs:", logsError);
      await logExecution(supabase, "error", "Failed to fetch restore report logs", logsError);
      throw new Error(`Failed to fetch logs: ${logsError.message}`);
    }

    console.log(`✅ Fetched ${logs?.length || 0} logs from last 24h`);

    // Generate CSV
    const csvContent = logs && logs.length > 0 ? generateCSV(logs) : "";
    const emailHtml = generateEmailHtml(logs?.length || 0, csvContent.length > 0);

    console.log("📧 Sending email report...");

    // Send email via SendGrid or SMTP
    const subject = `📊 Relatório Diário - Restore Logs ${new Date().toLocaleDateString('pt-BR')}`;
    
    try {
      if (SENDGRID_API_KEY) {
        console.log("Using SendGrid API...");
        await sendEmailViaSendGrid(ADMIN_EMAIL, subject, emailHtml, csvContent, SENDGRID_API_KEY);
      } else {
        console.log("Using SMTP fallback...");
        await sendEmailViaSMTP(ADMIN_EMAIL, subject, emailHtml, csvContent);
      }
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      await logExecution(supabase, "error", "Falha no envio do e-mail", emailError);
      throw emailError;
    }

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(supabase, "success", `Relatório enviado com sucesso para ${ADMIN_EMAIL}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        logsCount: logs?.length || 0,
        recipient: ADMIN_EMAIL,
        emailSent: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in send_daily_restore_report:", error);
    
    // Log critical error
    await logExecution(supabase, "critical", "Erro crítico na função", error);
    
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
