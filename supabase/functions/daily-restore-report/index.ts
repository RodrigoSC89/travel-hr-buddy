// ✅ Edge Function: daily-restore-report v2.0
// This function sends a daily email with the restore chart as PNG attachment
// Refactored with TypeScript type safety and modular architecture

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== Type Definitions ==========

interface ReportConfig {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
  unique_documents?: number;
  user_email?: string;
}

// ========== Configuration Management ==========

/**
 * Load and validate configuration from environment variables
 * Fails fast if required variables are missing
 */
function loadConfig(): ReportConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!appUrl) {
    throw new Error("Missing required environment variable: VITE_APP_URL or APP_URL");
  }

  if (!adminEmail) {
    throw new Error("Missing required environment variable: ADMIN_EMAIL");
  }

  return {
    supabaseUrl,
    supabaseKey,
    appUrl,
    adminEmail,
  };
}

// ========== Database Operations ==========

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
 * Fetch restore data from Supabase with error handling
 */
async function fetchRestoreData(supabase: any): Promise<RestoreDataPoint[]> {
  console.log("📊 Fetching restore data from Supabase...");

  const { data, error } = await supabase.rpc(
    "get_restore_count_by_day_with_email",
    { email_input: "" }
  );

  if (error) {
    console.error("Error fetching restore data:", error);
    throw new Error(`Failed to fetch restore data: ${error.message}`);
  }

  console.log(`✅ Fetched ${data?.length || 0} days of restore data`);
  return data || [];
}

/**
 * Fetch summary statistics from Supabase with fallback
 */
async function fetchSummaryData(supabase: any): Promise<RestoreSummary> {
  console.log("📈 Fetching summary statistics...");

  const { data, error } = await supabase.rpc(
    "get_restore_summary",
    { email_input: "" }
  );

  if (error) {
    console.warn("Error fetching summary data:", error);
  }

  const summary = data && data.length > 0 ? data[0] : {
    total: 0,
    unique_docs: 0,
    avg_per_day: 0
  };

  console.log("📈 Summary:", summary);
  return summary;
}

// ========== Email Generation ==========

/**
 * Generate professional HTML email content with responsive design
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
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 30px;
          }
          .summary-box { 
            background: linear-gradient(to bottom, #f8f9fa, #ffffff);
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border: 1px solid #e0e0e0;
          }
          .summary-box h2 {
            margin: 0 0 20px 0;
            font-size: 22px;
            color: #667eea;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .metric-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            margin: 5px 0;
          }
          .metric-label {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .data-section { 
            background: #f8f9fa;
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .data-section h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
          }
          .data-section p {
            margin: 0;
            line-height: 1.8;
          }
          .chart-link { 
            display: inline-block; 
            padding: 14px 32px; 
            background: #667eea;
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          .chart-link:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #999; 
            font-size: 13px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .header h1 {
              font-size: 24px;
            }
            .metrics-grid {
              grid-template-columns: 1fr;
            }
            .content {
              padding: 20px;
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
            <p style="font-size: 14px; margin-top: 10px;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">${summary.total || 0}</div>
                  <div class="metric-label">Total de Restaurações</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${summary.unique_docs || 0}</div>
                  <div class="metric-label">Documentos Únicos</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${summary.avg_per_day ? summary.avg_per_day.toFixed(1) : 0}</div>
                  <div class="metric-label">Média Diária</div>
                </div>
              </div>
            </div>
            
            <div class="data-section">
              <h3>📊 Dados dos Últimos Dias</h3>
              <p>${chartData}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Completo Interativo</a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado diariamente.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            <p style="margin-top: 10px; font-size: 11px;">Versão 2.0</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via API endpoint with enhanced error handling
 */
async function sendEmailViaAPI(appUrl: string, payload: any, htmlContent: string, supabase: any): Promise<any> {
  try {
    const emailApiUrl = `${appUrl}/api/send-restore-report`;
    
    console.log(`📧 Calling email API: ${emailApiUrl}`);
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        html: htmlContent, 
        toEmail: payload.toEmail,
        summary: payload.summary
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await logExecution(supabase, "error", "Falha no envio do e-mail", errorText);
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Email API response:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Error calling email API:", error);
    throw error;
  }
}

// ========== Main Handler ==========

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase: any;

  try {
    console.log("🚀 Starting daily restore report generation v2.0...");

    // Load and validate configuration
    const config = loadConfig();
    console.log(`✅ Configuration loaded for ${config.adminEmail}`);

    // Create Supabase client
    supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Fetch data in parallel for better performance
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase),
      fetchSummaryData(supabase)
    ]);

    // Generate embed URL
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️ Embed URL: ${embedUrl}`);

    // Generate professional email HTML
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);

    console.log("📧 Sending email report...");

    // Prepare email payload
    const emailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData
    };

    // Send email via API
    await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml, supabase);

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        version: "2.0"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in daily-restore-report:", error);
    
    // Log error if supabase client is available
    if (supabase) {
      await logExecution(supabase, "error", "Erro crítico na função", error);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        version: "2.0"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
