/**
 * ✅ Daily Restore Report - Supabase Edge Function
 * 
 * Automatically generates and sends a daily email report with restore metrics.
 * Scheduled to run via cron job (default: daily at 8 AM UTC).
 * 
 * @module daily-restore-report
 * @version 2.0.0
 * @author Nautilus One - Travel HR Buddy
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Configuration interface for the report
 */
interface ReportConfig {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
}

/**
 * Summary statistics interface
 */
interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

/**
 * Restore data point interface
 */
interface RestoreDataPoint {
  day: string;
  count: number;
  unique_documents: number;
}

/**
 * Load and validate configuration from environment
 */
function loadConfig(): ReportConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  
  return {
    supabaseUrl,
    supabaseKey,
    appUrl: Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app",
    adminEmail: Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com",
  };
}

/**
 * Fetch restore data from Supabase
 */
async function fetchRestoreData(
  supabase: any
): Promise<{ data: RestoreDataPoint[]; summary: RestoreSummary }> {
  console.log("📊 Fetching restore data from Supabase...");

  // Fetch daily restore counts
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
    console.warn("Warning: Failed to fetch summary data:", summaryError);
  }

  const summary: RestoreSummary = summaryData && summaryData.length > 0 
    ? summaryData[0] 
    : {
        total: 0,
        unique_docs: 0,
        avg_per_day: 0,
      };

  console.log("📈 Summary:", summary);

  return {
    data: restoreData || [],
    summary,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting daily restore report generation...");
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Load configuration
    const config = loadConfig();
    console.log(`📍 App URL: ${config.appUrl}`);
    console.log(`📧 Admin Email: ${config.adminEmail}`);

    // Initialize Supabase client
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Fetch data
    const { data: restoreData, summary } = await fetchRestoreData(supabase);

    // Generate embed URL for the chart
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️  Embed URL: ${embedUrl}`);

    // Build email payload
    const emailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData,
    };

    // Generate HTML email content
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);
    console.log("📧 Email HTML generated");

    // Send email via API
    console.log("📤 Sending email report...");
    const emailResult = await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml);
    console.log("✅ Email sent successfully!");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        timestamp: new Date().toISOString(),
        summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        recipient: config.adminEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in daily-restore-report:", error);
    
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

/**
 * Generate HTML email content with restore report
 * 
 * @param summary - Summary statistics object
 * @param data - Array of daily restore data points
 * @param embedUrl - URL to the embedded chart page
 * @returns HTML string for email body
 */
function generateEmailHtml(
  summary: RestoreSummary,
  data: RestoreDataPoint[],
  embedUrl: string
): string {
  // Format data points for display
  const chartData = data
    .slice(0, 30) // Show last 30 days
    .map((d: RestoreDataPoint) => {
      const date = new Date(d.day);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      return `${formattedDate}: <strong>${d.count}</strong> restaurações`;
    })
    .join("<br>");

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Diário - Restauração de Documentos</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
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
            border-radius: 0;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
            opacity: 0.95;
          }
          .content {
            padding: 30px;
          }
          .summary-box {
            background: linear-gradient(to bottom, #f8f9fa, #ffffff);
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .summary-box h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #495057;
            display: flex;
            align-items: center;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          }
          .summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            text-align: center;
          }
          .summary-item-value {
            display: block;
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }
          .summary-item-label {
            display: block;
            font-size: 13px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            font-size: 18px;
            color: #495057;
          }
          .data-content {
            font-size: 14px;
            line-height: 1.8;
            color: #495057;
          }
          .chart-link {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          .chart-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          }
          .footer {
            text-align: center;
            padding: 25px 30px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .summary-grid {
              grid-template-columns: 1fr;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário</h1>
            <p>Restauração de Documentos</p>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${formattedDate}</p>
          </div>
          
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-item-value">${summary.total || 0}</span>
                  <span class="summary-item-label">Total de Restaurações</span>
                </div>
                <div class="summary-item">
                  <span class="summary-item-value">${summary.unique_docs || 0}</span>
                  <span class="summary-item-label">Documentos Únicos</span>
                </div>
                <div class="summary-item" style="grid-column: 1 / -1;">
                  <span class="summary-item-value">${
                    summary.avg_per_day ? summary.avg_per_day.toFixed(2) : "0.00"
                  }</span>
                  <span class="summary-item-label">Média Diária</span>
                </div>
              </div>
            </div>
            
            <div class="data-section">
              <h3>📊 Últimos 30 Dias</h3>
              <div class="data-content">
                ${chartData || "<em>Nenhum dado disponível</em>"}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Interativo Completo</a>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px; font-size: 14px;">
              <strong>💡 Dica:</strong> Acesse o dashboard completo para análises detalhadas e filtros avançados.
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Este é um email automático gerado diariamente.</strong></p>
            <p>Para modificar as preferências de email ou frequência, entre em contato com o administrador do sistema.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via the application's API endpoint
 * 
 * @param appUrl - Base URL of the application
 * @param payload - Email payload data
 * @param htmlContent - HTML email content
 * @returns Promise with API response
 */
async function sendEmailViaAPI(
  appUrl: string,
  payload: any,
  htmlContent: string
): Promise<any> {
  try {
    const emailApiUrl = `${appUrl}/api/send-restore-report`;
    
    console.log(`📧 Calling email API: ${emailApiUrl}`);
    
    const response = await fetch(emailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        toEmail: payload.toEmail,
        summary: payload.summary,
        subject: `📊 Relatório Diário de Restauração - ${new Date().toLocaleDateString("pt-BR")}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Email API response:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Error calling email API:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
