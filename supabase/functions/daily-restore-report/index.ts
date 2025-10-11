/**
 * Edge Function: daily-restore-report
 * 
 * Automatically generates and sends daily email reports with restore metrics.
 * This function is designed to run on a cron schedule (e.g., daily at 8 AM).
 * 
 * @module daily-restore-report
 * @requires supabase-js - Supabase client for data fetching
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Type definitions for better type safety
interface RestoreData {
  day: string;
  count: number;
  email?: string;
}

interface SummaryData {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface EmailPayload {
  embedUrl: string;
  toEmail: string;
  summary: SummaryData;
  data: RestoreData[];
}

interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
}

/**
 * Validate and load configuration from environment variables
 * @throws {Error} If required environment variables are missing
 */
function loadConfig(): Config {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");

  // Validate required configuration
  if (!supabaseUrl) {
    throw new Error("Missing required environment variable: SUPABASE_URL");
  }
  if (!supabaseKey) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
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

/**
 * Fetch restore data from Supabase
 */
async function fetchRestoreData(
  supabase: any,
  emailInput = ""
): Promise<RestoreData[]> {
  console.log("📊 Fetching restore data from Supabase...");
  
  const { data, error } = await supabase.rpc(
    "get_restore_count_by_day_with_email",
    { email_input: emailInput }
  );

  if (error) {
    console.error("❌ Error fetching restore data:", error);
    throw new Error(`Failed to fetch restore data: ${error.message}`);
  }

  console.log(`✅ Fetched ${data?.length || 0} days of restore data`);
  return data || [];
}

/**
 * Fetch summary statistics from Supabase
 */
async function fetchSummaryData(
  supabase: any,
  emailInput = ""
): Promise<SummaryData> {
  console.log("📈 Fetching summary statistics...");
  
  const { data, error } = await supabase.rpc(
    "get_restore_summary",
    { email_input: emailInput }
  );

  if (error) {
    console.warn("⚠️ Warning: Could not fetch summary data:", error.message);
    // Return default values if summary fetch fails
    return {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0,
    };
  }

  const summary = data && data.length > 0 ? data[0] : {
    total: 0,
    unique_docs: 0,
    avg_per_day: 0,
  };

  console.log("📊 Summary statistics:", summary);
  return summary;
}

/**
 * Main request handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting daily restore report generation...");
    console.log(`📅 Execution time: ${new Date().toISOString()}`);

    // Load and validate configuration
    const config = loadConfig();
    console.log(`✅ Configuration loaded successfully`);
    console.log(`📧 Admin email: ${config.adminEmail}`);
    console.log(`🌐 App URL: ${config.appUrl}`);

    // Initialize Supabase client
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Fetch data in parallel for better performance
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase),
      fetchSummaryData(supabase),
    ]);

    // Validate data
    if (!restoreData || restoreData.length === 0) {
      console.warn("⚠️ No restore data available for report");
      return new Response(
        JSON.stringify({
          success: false,
          message: "No restore data available",
          summary,
          dataPoints: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embed URL
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️ Chart embed URL: ${embedUrl}`);

    // Prepare email payload
    const emailPayload: EmailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData,
    };

    // Generate email HTML content
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);

    // Send email via API
    console.log("📧 Sending email report...");
    await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml);

    console.log("✅ Daily restore report sent successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary,
        dataPoints: restoreData.length,
        emailSent: true,
        timestamp: new Date().toISOString(),
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
 * Generate HTML email content with restore metrics
 */
function generateEmailHtml(
  summary: SummaryData,
  data: RestoreData[],
  embedUrl: string
): string {
  // Format data entries for display
  const chartData = data
    .map((d: RestoreData) => {
      const date = new Date(d.day);
      const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      return `${dateStr}: ${d.count} restaurações`;
    })
    .join("<br>");

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
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
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
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
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
            opacity: 0.95;
          }
          .content {
            padding: 30px;
            background: white;
          }
          .summary-box {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .summary-box h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #2d3748;
          }
          .summary-grid {
            display: table;
            width: 100%;
          }
          .summary-item {
            display: table-row;
            margin: 0;
          }
          .summary-item strong {
            display: table-cell;
            padding: 8px 10px 8px 0;
            color: #4a5568;
            width: 60%;
          }
          .summary-item span {
            display: table-cell;
            padding: 8px 0;
            color: #1a202c;
            font-size: 18px;
            font-weight: 600;
          }
          .data-section {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .data-section h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #2d3748;
          }
          .data-section p {
            margin: 0;
            line-height: 1.8;
            font-size: 14px;
            color: #4a5568;
          }
          .chart-link {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
            transition: transform 0.2s;
          }
          .chart-link:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f7fafc;
            color: #718096;
            font-size: 13px;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 8px 0;
          }
          @media (max-width: 600px) {
            .content {
              padding: 20px;
            }
            .header {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário - Restauração de Documentos</h1>
            <p><strong>Nautilus One - Travel HR Buddy</strong></p>
            <p>${currentDate}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <strong>Total de Restaurações:</strong>
                  <span>${summary.total || 0}</span>
                </div>
                <div class="summary-item">
                  <strong>Documentos Únicos:</strong>
                  <span>${summary.unique_docs || 0}</span>
                </div>
                <div class="summary-item">
                  <strong>Média Diária:</strong>
                  <span>${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : "0.00"}</span>
                </div>
              </div>
            </div>
            
            <div class="data-section">
              <h3>📊 Dados dos Últimos Dias</h3>
              <p>${chartData}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="chart-link" target="_blank">
                📈 Ver Gráfico Interativo Completo
              </a>
            </div>
          </div>
          <div class="footer">
            <p><strong>Este é um email automático gerado diariamente.</strong></p>
            <p>Para visualizar o gráfico interativo completo, clique no botão acima.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via API endpoint
 * @param appUrl - Application base URL
 * @param payload - Email payload data
 * @param htmlContent - HTML email content
 */
async function sendEmailViaAPI(
  appUrl: string,
  payload: EmailPayload,
  htmlContent: string
): Promise<void> {
  const emailApiUrl = `${appUrl}/api/send-restore-report`;
  
  console.log(`📧 Calling email API: ${emailApiUrl}`);
  
  try {
    const response = await fetch(emailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        toEmail: payload.toEmail,
        summary: payload.summary,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Email API returned status ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Email API response:", result);
    
    if (!result.success) {
      throw new Error(result.error || "Email sending failed");
    }
  } catch (error) {
    console.error("❌ Error calling email API:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
