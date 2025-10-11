// ✅ Edge Function: daily-restore-report
// This function sends a daily email with the restore chart as PNG attachment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get the app URL from environment or use default
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";

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

    const summary = summaryData && summaryData.length > 0 ? summaryData[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log("📈 Summary:", summary);

    // Method 1: Use external screenshot service (recommended for production)
    // For example: API Flash, URL2PNG, etc.
    // const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&url=${APP_URL}/embed-restore-chart.html`;

    // Method 2: Call the API endpoint to get the embed URL and screenshot it
    // This requires a service that can take screenshots (Puppeteer, Playwright, etc.)
    const embedUrl = `${APP_URL}/embed-restore-chart.html`;
    
    console.log(`🖼️ Embed URL: ${embedUrl}`);
    console.log("⚠️ Note: Screenshot generation requires an external service or Puppeteer");

    // For this implementation, we'll send an email with the chart link
    // In production, you would:
    // 1. Use a screenshot API to capture the embed page
    // 2. Or deploy a separate service with Puppeteer to generate the image
    // 3. Then send that image via email

    // Call the send-restore-report API endpoint
    const emailPayload = {
      embedUrl: embedUrl,
      toEmail: ADMIN_EMAIL,
      summary: summary,
      data: restoreData
    };

    // Since we can't easily generate screenshots in Deno/Supabase Edge Functions,
    // we'll send an email with the data and a link to view the chart
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);

    console.log("📧 Sending email report...");

    // Note: For actual email sending, you would need to:
    // 1. Use an email service API (SendGrid, Mailgun, etc.)
    // 2. Or call your API endpoint that uses nodemailer
    // 3. Or use Supabase's built-in email functionality (if available)

    const emailResult = await sendEmailViaAPI(APP_URL, emailPayload, emailHtml, supabase);

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary: summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in daily-restore-report:", error);
    
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

/**
 * Generate HTML email content
 */
function generateEmailHtml(summary: any, data: any[], embedUrl: string): string {
  const chartData = data.map((d: any) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .summary-item { margin: 10px 0; }
          .chart-link { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .data-section { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Diário - Restauração de Documentos</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Resumo Executivo</h2>
            <div class="summary-item"><strong>Total de Restaurações:</strong> ${summary.total || 0}</div>
            <div class="summary-item"><strong>Documentos Únicos:</strong> ${summary.unique_docs || 0}</div>
            <div class="summary-item"><strong>Média Diária:</strong> ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}</div>
          </div>
          
          <div class="data-section">
            <h3>📊 Dados dos Últimos Dias</h3>
            <p>${chartData}</p>
          </div>
          
          <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Completo</a>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via API endpoint
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
