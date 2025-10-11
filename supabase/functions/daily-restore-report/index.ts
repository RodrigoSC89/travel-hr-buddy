// ✅ Edge Function: daily-restore-report v2.0
// Sends daily email reports with restore metrics using direct SendGrid integration
// Features: TypeScript types, automatic error alerts, performance monitoring

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// ==================== Type Definitions ====================

interface RestoreDataPoint {
  day: string;
  count: number;
  user_email?: string;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface SendGridEmailRequest {
  personalizations: Array<{
    to: Array<{ email: string }>;
    subject: string;
  }>;
  from: { email: string; name?: string };
  content: Array<{
    type: string;
    value: string;
  }>;
}

interface EmailParams {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==================== Helper Functions ====================

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
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(params: EmailParams): Promise<void> {
  const { apiKey, fromEmail, fromName, toEmail, subject, htmlContent } = params;

  const emailRequest: SendGridEmailRequest = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        subject: subject,
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    content: [
      {
        type: "text/html",
        value: htmlContent,
      },
    ],
  };

  console.log(`📧 Sending email via SendGrid to ${toEmail}...`);

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
  }

  console.log("✅ Email sent successfully via SendGrid");
}

/**
 * Send error alert email to administrators
 */
async function sendErrorAlert(
  error: Error,
  executionTime: number,
  sendGridApiKey: string,
  fromEmail: string,
  fromName: string,
  alertEmail: string
): Promise<void> {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #fef2f2; }
          .error-box { background: white; padding: 20px; border-left: 4px solid #dc2626; border-radius: 8px; margin: 20px 0; }
          .info-item { margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .code { font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Daily Restore Report - Error Alert</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="error-box">
            <h2>❌ Error Details</h2>
            <div class="info-item">
              <strong>Error Message:</strong><br>
              ${error.message}
            </div>
            <div class="info-item">
              <strong>Stack Trace:</strong><br>
              <pre class="code">${error.stack || 'No stack trace available'}</pre>
            </div>
            <div class="info-item">
              <strong>Execution Time:</strong> ${executionTime}ms
            </div>
            <div class="info-item">
              <strong>Timestamp:</strong> ${new Date().toISOString()}
            </div>
          </div>
          
          <div class="error-box">
            <h3>🔍 Troubleshooting Steps</h3>
            <ul>
              <li>Check Supabase Edge Function logs for more details</li>
              <li>Verify all environment variables are set correctly</li>
              <li>Ensure SendGrid API key is valid and not expired</li>
              <li>Confirm Supabase RPC functions are working</li>
              <li>Check if the restore_report_logs table is accessible</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This is an automatic error alert from the daily restore report function.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmailViaSendGrid({
      apiKey: sendGridApiKey,
      fromEmail,
      fromName,
      toEmail: alertEmail,
      subject: "⚠️ Daily Restore Report - Error Alert",
      htmlContent: errorHtml,
    });
    console.log("✅ Error alert sent successfully");
  } catch (alertError) {
    console.error("❌ Failed to send error alert:", alertError);
    // Don't throw - alert failure shouldn't hide the original error
  }
}

// ==================== Main Function ====================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let supabase: any;

  try {
    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("🚀 Starting daily restore report generation...");

    // Validate environment variables
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const FROM_NAME = Deno.env.get("FROM_NAME") || "Travel HR Buddy";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const ERROR_ALERT_EMAIL = Deno.env.get("ERROR_ALERT_EMAIL") || ADMIN_EMAIL;
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app";

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is not set. Please configure your SendGrid API key.");
    }

    if (!FROM_EMAIL) {
      throw new Error("FROM_EMAIL environment variable is not set. Please configure the sender email address.");
    }

    if (!ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL environment variable is not set. Please configure the recipient email address.");
    }

    console.log("✅ Environment variables validated");
    console.log(`📧 Sending report from ${FROM_EMAIL} to ${ADMIN_EMAIL}`);

    console.log("📊 Fetching restore data from Supabase...");

    // Fetch the restore data directly from Supabase
    const { data: restoreData, error: dataError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );

    if (dataError) {
      console.error("Error fetching restore data:", dataError);
      await logExecution(supabase, "error", "Failed to fetch restore data", dataError);
      throw new Error(`Failed to fetch restore data: ${dataError.message}`);
    }

    console.log(`✅ Fetched ${restoreData?.length || 0} days of restore data`);

    // Get summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    if (summaryError) {
      console.warn("Warning: Failed to fetch summary data:", summaryError);
    }

    const summary: RestoreSummary = summaryData && summaryData.length > 0 ? summaryData[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log("📈 Summary:", summary);

    // Generate embed URL for chart
    const embedUrl = `${APP_URL}/embed-restore-chart.html`;
    console.log(`🖼️ Chart URL: ${embedUrl}`);

    // Generate HTML email content
    const emailHtml = generateEmailHtml(summary, restoreData || [], embedUrl);

    console.log("📧 Sending email report via SendGrid...");

    // Send email via SendGrid
    await sendEmailViaSendGrid({
      apiKey: SENDGRID_API_KEY,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
      toEmail: ADMIN_EMAIL,
      subject: `📊 Relatório Diário - Gráfico de Restauração (${new Date().toLocaleDateString('pt-BR')})`,
      htmlContent: emailHtml,
    });

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(supabase, "success", "Relatório enviado com sucesso via SendGrid.");

    const executionTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary: summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        executionTimeMs: executionTime,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in daily-restore-report:", error);
    
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Log critical error
    if (supabase) {
      await logExecution(supabase, "critical", errorMessage, error);
    }

    // Send error alert
    try {
      const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
      const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
      const FROM_NAME = Deno.env.get("FROM_NAME") || "Travel HR Buddy";
      const ERROR_ALERT_EMAIL = Deno.env.get("ERROR_ALERT_EMAIL") || Deno.env.get("ADMIN_EMAIL");

      if (SENDGRID_API_KEY && FROM_EMAIL && ERROR_ALERT_EMAIL && error instanceof Error) {
        await sendErrorAlert(
          error,
          executionTime,
          SENDGRID_API_KEY,
          FROM_EMAIL,
          FROM_NAME,
          ERROR_ALERT_EMAIL
        );
      }
    } catch (alertError) {
      console.error("Failed to send error alert:", alertError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        executionTimeMs: executionTime,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ==================== Email Template Generator ====================

/**
 * Generate HTML email content with enhanced styling
 */
function generateEmailHtml(summary: RestoreSummary, data: RestoreDataPoint[], embedUrl: string): string {
  const chartData = data.map((d: RestoreDataPoint) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0;
            opacity: 0.95;
            font-size: 14px;
          }
          .content { 
            padding: 30px; 
          }
          .summary-box { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 20px 0;
            border: 1px solid #e9ecef;
          }
          .summary-box h2 {
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #495057;
            font-weight: 600;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .summary-item { 
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .summary-item strong {
            display: block;
            color: #6c757d;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: 700;
            color: #212529;
          }
          .chart-link { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #3b82f6; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0;
            font-weight: 600;
            transition: background 0.3s ease;
          }
          .chart-link:hover {
            background: #2563eb;
          }
          .data-section { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0;
            border: 1px solid #e9ecef;
          }
          .data-section h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #495057;
            font-weight: 600;
          }
          .data-section p {
            margin: 0;
            line-height: 1.8;
            color: #6c757d;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #6c757d; 
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #e7f3ff;
            color: #0969da;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário - Restauração de Documentos</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <strong>Total de Restaurações</strong>
                  <div class="value">${summary.total || 0}</div>
                </div>
                <div class="summary-item">
                  <strong>Documentos Únicos</strong>
                  <div class="value">${summary.unique_docs || 0}</div>
                </div>
                <div class="summary-item">
                  <strong>Média Diária</strong>
                  <div class="value">${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : '0.00'}</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Interativo Completo</a>
            </div>
            
            ${data.length > 0 ? `
            <div class="data-section">
              <h3>📊 Dados dos Últimos Dias</h3>
              <p>${chartData}</p>
            </div>
            ` : '<p style="text-align: center; color: #6c757d;">Nenhum dado disponível para o período.</p>'}
          </div>
          <div class="footer">
            <p>Este é um email automático gerado diariamente via SendGrid.<span class="badge">v2.0</span></p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
