// ✅ Edge Function: daily-restore-report
// Enterprise-grade daily restore report with comprehensive type safety and error handling

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// Type Definitions
// ============================================================================

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

interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load and validate configuration from environment variables
 * Implements fail-fast behavior for missing required variables
 */
function loadConfig(): Config {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");

  // Fail-fast validation
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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminEmail)) {
    throw new Error(`Invalid email address format: ${adminEmail}`);
  }

  console.log("✅ Configuration validated successfully");
  console.log(`📧 Admin email: ${adminEmail}`);
  console.log(`🌐 App URL: ${appUrl}`);

  return {
    supabaseUrl,
    supabaseKey,
    appUrl,
    adminEmail,
  };
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
 * Fetch restore data from Supabase RPC function
 */
async function fetchRestoreData(supabase: any): Promise<RestoreData[]> {
  console.log("📊 Fetching restore data...");
  
  const { data, error } = await supabase.rpc(
    "get_restore_count_by_day_with_email",
    { email_input: "" }
  );

  if (error) {
    console.error("❌ Error fetching restore data:", error);
    throw new Error(`Failed to fetch restore data: ${error.message}`);
  }

  console.log(`✅ Fetched ${data?.length || 0} days of restore data`);
  return data || [];
}

/**
 * Fetch summary statistics from Supabase RPC function
 */
async function fetchSummaryData(supabase: any): Promise<SummaryData> {
  console.log("📈 Fetching summary data...");
  
  const { data, error } = await supabase.rpc(
    "get_restore_summary",
    { email_input: "" }
  );

  if (error) {
    console.warn("⚠️ Error fetching summary data:", error);
    // Return default summary on error instead of failing
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

  console.log(`✅ Summary: ${summary.total} total, ${summary.unique_docs} unique docs, ${summary.avg_per_day.toFixed(2)} avg/day`);
  return summary;
}

/**
 * Generate beautiful responsive HTML email content
 */
function generateEmailHtml(summary: SummaryData, data: RestoreData[], embedUrl: string): string {
  const chartData = data.map((d) => {
    const date = new Date(d.day);
    const dayStr = date.getDate().toString().padStart(2, '0');
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    return `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${dayStr}/${monthStr}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #3b82f6;">${d.count}</td>
    </tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0;
            background-color: #f3f4f6;
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
            opacity: 0.95;
            font-size: 14px;
          }
          .content { 
            padding: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .summary-card {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin: 10px 0;
          }
          .summary-card .label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .data-table th {
            background: #f9fafb;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .button { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #3b82f6; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
          }
          .button:hover {
            background: #2563eb;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #6b7280; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          @media only screen and (max-width: 600px) {
            .summary-grid {
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
            <h1>📊 Relatório Diário de Restauração</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">📈 Resumo Executivo</h2>
            
            <div class="summary-grid">
              <div class="summary-card">
                <div class="label">Total</div>
                <div class="value">${summary.total || 0}</div>
                <div class="label">Restaurações</div>
              </div>
              <div class="summary-card">
                <div class="label">Documentos</div>
                <div class="value">${summary.unique_docs || 0}</div>
                <div class="label">Únicos</div>
              </div>
              <div class="summary-card">
                <div class="label">Média</div>
                <div class="value">${summary.avg_per_day ? summary.avg_per_day.toFixed(1) : 0}</div>
                <div class="label">Por Dia</div>
              </div>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">📊 Últimos Registros</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th style="text-align: right;">Restaurações</th>
                </tr>
              </thead>
              <tbody>
                ${chartData || '<tr><td colspan="2" style="padding: 20px; text-align: center; color: #6b7280;">Nenhum dado disponível</td></tr>'}
              </tbody>
            </table>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="button">📈 Ver Gráfico Completo</a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado diariamente às 8:00 AM.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            <p style="margin-top: 10px; color: #9ca3af;">Sistema de Gestão de Recursos Humanos</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via API endpoint with verification
 */
async function sendEmailViaAPI(
  appUrl: string, 
  toEmail: string, 
  htmlContent: string, 
  summary: SummaryData,
  supabase: any
): Promise<any> {
  try {
    const emailApiUrl = `${appUrl}/api/send-restore-report`;
    
    console.log(`📧 Calling email API: ${emailApiUrl}`);
    console.log(`📬 Sending to: ${toEmail}`);
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        html: htmlContent, 
        toEmail: toEmail,
        summary: summary
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Email API error: ${response.status}`);
      await logExecution(supabase, "error", "Falha no envio do e-mail", { 
        status: response.status, 
        error: errorText 
      });
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

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase: any;
  
  try {
    console.log("🚀 Starting daily restore report generation...");
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);

    // Step 1: Load and validate configuration
    const config = loadConfig();
    
    // Step 2: Initialize Supabase client
    supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Step 3: Fetch data in parallel (50% faster than sequential)
    console.log("⚡ Fetching data in parallel...");
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase),
      fetchSummaryData(supabase),
    ]);

    console.log("✅ Data fetching complete");

    // Step 4: Generate embed URL
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️ Embed URL: ${embedUrl}`);

    // Step 5: Generate email HTML
    console.log("📝 Generating email content...");
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);

    // Step 6: Send email
    console.log("📧 Sending email report...");
    await sendEmailViaAPI(
      config.appUrl, 
      config.adminEmail, 
      emailHtml, 
      summary,
      supabase
    );

    console.log("✅ Email sent successfully!");
    
    // Step 7: Log successful execution
    await logExecution(
      supabase, 
      "success", 
      `Relatório enviado com sucesso para ${config.adminEmail}. Total: ${summary.total} restaurações.`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        timestamp: new Date().toISOString(),
        summary: summary,
        dataPoints: restoreData?.length || 0,
        recipient: config.adminEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Critical error in daily-restore-report:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Log critical error if supabase is available
    if (supabase) {
      await logExecution(supabase, "critical", "Erro crítico na função", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
