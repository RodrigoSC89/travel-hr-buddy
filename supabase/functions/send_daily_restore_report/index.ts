// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email (CSV format)
// Logs all email attempts to report_email_logs table for audit trail

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TypeScript Interfaces
interface RestoreLog {
  executed_at: string;
  status: string;
  message: string;
  error_details: string | null;
}

interface EmailLogEntry {
  status: 'success' | 'error';
  message: string;
  error_details?: Record<string, unknown>;
  recipient_email: string;
  logs_count: number;
}

interface Configuration {
  supabaseUrl: string;
  supabaseServiceKey: string;
  adminEmail: string;
  sendGridApiKey?: string;
  emailFrom: string;
}

/**
 * Get and validate configuration from environment variables
 */
function getConfiguration(): Configuration {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    adminEmail: Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com",
    sendGridApiKey: Deno.env.get("SENDGRID_API_KEY"),
    emailFrom: Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com",
  };
}

/**
 * Log email sending attempt to report_email_logs table
 */
async function logEmailAttempt(
  supabase: any,
  logEntry: EmailLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from("report_email_logs")
      .insert({
        status: logEntry.status,
        message: logEntry.message,
        error_details: logEntry.error_details || null,
        recipient_email: logEntry.recipient_email,
        logs_count: logEntry.logs_count,
      });
    
    if (error) {
      console.error("Failed to log email attempt:", error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  } catch (error) {
    console.error("Exception while logging email attempt:", error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log execution status to restore_report_logs table
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
): Promise<void> {
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
 * Fetch restore logs from the last 24 hours
 */
async function fetchRestoreLogs(supabase: any): Promise<RestoreLog[]> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: logs, error: logsError } = await supabase
    .from("restore_report_logs")
    .select("executed_at, status, message, error_details")
    .gte("executed_at", yesterday)
    .order("executed_at", { ascending: false });

  if (logsError) {
    throw new Error(`Failed to fetch logs: ${logsError.message}`);
  }

  return logs || [];
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
 * Generate formatted email body with emoji indicators
 */
function generateEmailBody(logs: RestoreLog[]): string {
  if (logs.length === 0) {
    return "📭 Nenhum log encontrado nas últimas 24 horas.";
  }

  const logEntries = logs.slice(0, 10).map((log) => {
    const statusEmoji = log.status === 'success' ? '✅' : 
                        log.status === 'error' ? '❌' : 
                        log.status === 'critical' ? '🔴' : '🔹';
    
    let entry = `📅 ${new Date(log.executed_at).toLocaleString('pt-BR')}\n`;
    entry += `${statusEmoji} Status: ${log.status}\n`;
    entry += `📝 ${log.message}\n`;
    
    if (log.error_details) {
      entry += `❗ ${log.error_details}\n`;
    }
    
    return entry;
  }).join('\n');

  let body = `Relatório de Logs das Últimas 24 Horas\n`;
  body += `Total de Logs: ${logs.length}\n\n`;
  body += logEntries;
  
  if (logs.length > 10) {
    body += `\n\n... e mais ${logs.length - 10} logs. Veja o arquivo CSV anexo para detalhes completos.`;
  }
  
  return body;
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(logs: RestoreLog[], logsCount: number, csvAttached: boolean): string {
  const successCount = logs.filter(log => log.status === 'success').length;
  const errorCount = logs.filter(log => log.status === 'error').length;
  const criticalCount = logs.filter(log => log.status === 'critical').length;
  
  const statusSummary = `
    <div style="display: flex; gap: 20px; margin: 20px 0;">
      <div style="flex: 1; text-align: center; padding: 15px; background: #d4edda; border-radius: 8px;">
        <div style="font-size: 24px;">✅</div>
        <div style="font-weight: bold;">${successCount}</div>
        <div style="font-size: 12px;">Sucesso</div>
      </div>
      <div style="flex: 1; text-align: center; padding: 15px; background: #f8d7da; border-radius: 8px;">
        <div style="font-size: 24px;">❌</div>
        <div style="font-weight: bold;">${errorCount}</div>
        <div style="font-size: 12px;">Erro</div>
      </div>
      <div style="flex: 1; text-align: center; padding: 15px; background: #f5c6cb; border-radius: 8px;">
        <div style="font-size: 24px;">🔴</div>
        <div style="font-weight: bold;">${criticalCount}</div>
        <div style="font-size: 12px;">Crítico</div>
      </div>
    </div>
  `;

  const recentLogs = logs.slice(0, 5).map(log => {
    const statusEmoji = log.status === 'success' ? '✅' : 
                        log.status === 'error' ? '❌' : 
                        log.status === 'critical' ? '🔴' : '🔹';
    return `
      <div style="border-left: 4px solid ${log.status === 'success' ? '#28a745' : log.status === 'error' ? '#dc3545' : '#6c757d'}; padding: 10px; margin: 10px 0; background: #f8f9fa;">
        <div><strong>${statusEmoji} ${new Date(log.executed_at).toLocaleString('pt-BR')}</strong></div>
        <div>Status: ${log.status}</div>
        <div>${log.message}</div>
        ${log.error_details ? `<div style="color: #dc3545; font-size: 12px;">Erro: ${log.error_details}</div>` : ''}
      </div>
    `;
  }).join('');

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
            ${statusSummary}
          </div>
          
          ${logs.length > 0 ? `
            <div class="summary-box">
              <h3>📋 Logs Recentes (5 mais recentes)</h3>
              ${recentLogs}
              ${logs.length > 5 ? `<p style="text-align: center; color: #666;">... e mais ${logs.length - 5} logs no arquivo CSV anexo</p>` : ''}
            </div>
          ` : ''}
          
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
          <p>Este é um email automático gerado diariamente às 7:00 AM UTC.</p>
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
  config: Configuration,
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string
): Promise<void> {
  if (!config.sendGridApiKey) {
    throw new Error("SENDGRID_API_KEY is required for email sending");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.sendGridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { 
        email: config.emailFrom,
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
  config: Configuration,
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

/**
 * Send email with proper error handling and logging
 */
async function sendEmail(
  supabase: any,
  config: Configuration,
  logs: RestoreLog[]
): Promise<void> {
  const subject = `📊 Relatório Diário - Restore Logs ${new Date().toLocaleDateString('pt-BR')}`;
  const csvContent = logs.length > 0 ? generateCSV(logs) : "";
  const emailHtml = generateEmailHtml(logs, logs.length, csvContent.length > 0);

  try {
    if (config.sendGridApiKey) {
      console.log("📧 Using SendGrid API...");
      await sendEmailViaSendGrid(config, config.adminEmail, subject, emailHtml, csvContent);
    } else {
      console.log("📧 Using SMTP fallback...");
      await sendEmailViaSMTP(config, config.adminEmail, subject, emailHtml, csvContent);
    }

    console.log("✅ Email sent successfully!");
    
    // Log successful email attempt
    await logEmailAttempt(supabase, {
      status: 'success',
      message: `Relatório enviado com sucesso para ${config.adminEmail}`,
      recipient_email: config.adminEmail,
      logs_count: logs.length,
    });

  } catch (emailError) {
    console.error("❌ Error sending email:", emailError);
    
    // Log failed email attempt
    await logEmailAttempt(supabase, {
      status: 'error',
      message: 'Falha no envio do e-mail',
      error_details: {
        message: emailError instanceof Error ? emailError.message : String(emailError),
        timestamp: new Date().toISOString(),
      },
      recipient_email: config.adminEmail,
      logs_count: logs.length,
    });
    
    throw emailError;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting daily restore report generation...");

    // Get configuration
    const config = getConfiguration();
    console.log(`📧 Admin email: ${config.adminEmail}`);

    // Initialize Supabase client
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

    // Fetch restore logs
    console.log("📊 Fetching restore report logs from last 24h...");
    const logs = await fetchRestoreLogs(supabase);
    console.log(`✅ Fetched ${logs.length} logs from last 24h`);

    // Send email with logs
    await sendEmail(supabase, config, logs);

    // Log successful execution to restore_report_logs
    await logExecution(supabase, "success", `Relatório enviado com sucesso para ${config.adminEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        logsCount: logs.length,
        recipient: config.adminEmail,
        emailSent: true,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in send_daily_restore_report:", error);
    
    try {
      // Attempt to log critical error
      const config = getConfiguration();
      const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
      await logExecution(supabase, "critical", "Erro crítico na função", error);
    } catch (logError) {
      console.error("Failed to log critical error:", logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
