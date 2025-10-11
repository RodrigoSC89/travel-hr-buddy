// ✅ Edge Function: daily-restore-report
// This function sends a daily email with restore metrics using SendGrid
// Includes automatic error alerting for failures

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Type definitions
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let errorOccurred = false;
  let errorMessage = "";

  try {
    console.log("🚀 Starting daily restore report generation...");

    // Validate required environment variables
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";
    const FROM_NAME = Deno.env.get("FROM_NAME") || "Travel HR Buddy";
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app";

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    console.log(`📧 Recipient: ${ADMIN_EMAIL}`);
    console.log(`📤 From: ${FROM_NAME} <${FROM_EMAIL}>`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("📊 Fetching restore data from Supabase...");

    // Fetch the restore data directly from Supabase
    const { data: restoreData, error: dataError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );

    if (dataError) {
      console.error("Error fetching restore data:", dataError);
      throw new Error(`Failed to fetch restore data: ${dataError.message}`);
    }

    console.log(`✅ Fetched ${restoreData?.length || 0} days of restore data`);

    // Get summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    if (summaryError) {
      console.warn("Warning fetching summary:", summaryError);
    }

    const summary: RestoreSummary = summaryData && summaryData.length > 0 ? summaryData[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log("📈 Summary:", summary);

    // Generate email HTML content
    const embedUrl = `${APP_URL}/embed-restore-chart.html`;
    const emailHtml = generateEmailHtml(summary, restoreData || [], embedUrl);

    console.log("📧 Sending email via SendGrid...");

    // Send email using SendGrid API
    await sendEmailViaSendGrid({
      apiKey: SENDGRID_API_KEY,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
      toEmail: ADMIN_EMAIL,
      subject: `📊 Relatório Diário - Restauração de Documentos - ${new Date().toLocaleDateString('pt-BR')}`,
      htmlContent: emailHtml
    });

    const executionTime = Date.now() - startTime;
    console.log(`✅ Email sent successfully in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary: summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        executionTimeMs: executionTime
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    errorOccurred = true;
    errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const executionTime = Date.now() - startTime;
    
    console.error("❌ Error in daily-restore-report:", error);

    // Send error alert email
    try {
      await sendErrorAlert(error, executionTime);
    } catch (alertError) {
      console.error("❌ Failed to send error alert:", alertError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        executionTimeMs: executionTime
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Generate HTML email content with professional styling
 */
function generateEmailHtml(summary: RestoreSummary, data: RestoreDataPoint[], embedUrl: string): string {
  const chartData = data.map((d) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
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
            opacity: 0.9;
          }
          .content { 
            padding: 30px; 
          }
          .summary-box { 
            background: #f9fafb; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #667eea;
          }
          .summary-box h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #1f2937;
          }
          .summary-item { 
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          .summary-item strong {
            color: #4b5563;
          }
          .chart-link { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 500;
            transition: background 0.2s;
          }
          .chart-link:hover {
            background: #2563eb;
          }
          .data-section { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .data-section h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #1f2937;
          }
          .data-section p {
            line-height: 1.8;
            color: #4b5563;
          }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            color: #6b7280; 
            font-size: 13px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário - Restauração de Documentos</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="summary-item">
                <strong>Total de Restaurações:</strong> ${summary.total || 0}
              </div>
              <div class="summary-item">
                <strong>Documentos Únicos:</strong> ${summary.unique_docs || 0}
              </div>
              <div class="summary-item">
                <strong>Média Diária:</strong> ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}
              </div>
            </div>
            
            ${data && data.length > 0 ? `
              <div class="data-section">
                <h3>📊 Dados dos Últimos Dias</h3>
                <p>${chartData}</p>
              </div>
            ` : '<p>Nenhum dado disponível para exibição.</p>'}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Completo</a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado diariamente pelo sistema.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email using SendGrid API
 */
async function sendEmailViaSendGrid(params: {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const emailData: SendGridEmailRequest = {
    personalizations: [
      {
        to: [{ email: params.toEmail }],
        subject: params.subject,
      },
    ],
    from: {
      email: params.fromEmail,
      name: params.fromName,
    },
    content: [
      {
        type: "text/html",
        value: params.htmlContent,
      },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("SendGrid API error:", errorText);
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  console.log("✅ Email sent via SendGrid successfully");
}

/**
 * Send error alert email when the function fails
 */
async function sendErrorAlert(error: unknown, executionTimeMs: number): Promise<void> {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  const ERROR_ALERT_EMAIL = Deno.env.get("ERROR_ALERT_EMAIL") || Deno.env.get("ADMIN_EMAIL");
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";
  const FROM_NAME = Deno.env.get("FROM_NAME") || "Travel HR Buddy Alerts";

  if (!SENDGRID_API_KEY || !ERROR_ALERT_EMAIL) {
    console.warn("⚠️ Cannot send error alert: Missing SendGrid API key or alert email");
    return;
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : "No stack trace available";

  const alertHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .content { 
            padding: 30px; 
          }
          .error-box { 
            background: #fef2f2; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626;
          }
          .error-details {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 12px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Erro no Relatório Diário</h1>
            <p>Daily Restore Report - Falha na Execução</p>
          </div>
          <div class="content">
            <div class="error-box">
              <h2>❌ Detalhes do Erro</h2>
              <div class="info-item">
                <strong>Função:</strong> daily-restore-report
              </div>
              <div class="info-item">
                <strong>Timestamp:</strong> ${new Date().toISOString()}
              </div>
              <div class="info-item">
                <strong>Tempo de Execução:</strong> ${executionTimeMs}ms
              </div>
              <div class="info-item">
                <strong>Mensagem de Erro:</strong><br>
                ${errorMessage}
              </div>
            </div>
            
            <div class="error-details">
              <strong>Stack Trace:</strong><br>
              ${errorStack.replace(/\n/g, '<br>')}
            </div>
            
            <p><strong>Ações Recomendadas:</strong></p>
            <ul>
              <li>Verifique as credenciais do Supabase</li>
              <li>Confirme que a chave do SendGrid está configurada</li>
              <li>Verifique os logs da função no Supabase Dashboard</li>
              <li>Teste as funções RPC manualmente</li>
            </ul>
          </div>
          <div class="footer">
            <p>Este é um alerta automático do sistema.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmailViaSendGrid({
      apiKey: SENDGRID_API_KEY,
      fromEmail: FROM_EMAIL,
      fromName: FROM_NAME,
      toEmail: ERROR_ALERT_EMAIL,
      subject: `🚨 ERRO: Daily Restore Report - ${new Date().toLocaleDateString('pt-BR')}`,
      htmlContent: alertHtml,
    });
    console.log("✅ Error alert sent successfully");
  } catch (alertError) {
    console.error("❌ Failed to send error alert:", alertError);
    throw alertError;
  }
}
