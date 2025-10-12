// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email (PDF format with Puppeteer)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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

interface ChartData {
  day: string;
  count: number;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
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
 * Generate PDF from chart using Puppeteer
 */
async function generateChartPDF(appUrl: string, embedToken: string): Promise<Uint8Array> {
  console.log("🚀 Launching Puppeteer browser...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 800, height: 600 });
    
    // Navigate to embed chart with token
    const chartUrl = `${appUrl}/embed/restore-chart?token=${embedToken}`;
    console.log(`📊 Navigating to chart: ${chartUrl}`);
    
    await page.goto(chartUrl, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });
    
    // Wait for chart to be ready
    console.log("⏳ Waiting for chart to load...");
    await page.waitForFunction(
      "window.chartReady === true", 
      { timeout: 15000 }
    );
    
    console.log("✅ Chart loaded successfully");
    
    // Generate PDF
    console.log("📄 Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });
    
    console.log("✅ PDF generated successfully");
    
    return pdfBuffer;
  } finally {
    await browser.close();
    console.log("🔒 Browser closed");
  }
}

/**
 * Generate HTML email content for PDF report
 */
function generateEmailHtml(reportDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 20px; 
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
            padding: 30px 20px; 
            background: #f8f9fa;
            max-width: 600px;
            margin: 0 auto;
          }
          .info-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .info-box h2 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #667eea;
          }
          .info-box p {
            margin: 10px 0;
            font-size: 14px;
          }
          .footer { 
            text-align: center; 
            padding: 25px 20px; 
            color: #666; 
            font-size: 12px;
            background: white;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          .attachment-note {
            background: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .attachment-note strong {
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Diário de Restaurações</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>📅 ${reportDate}</p>
        </div>
        <div class="content">
          <div class="info-box">
            <h2>📈 Sobre este Relatório</h2>
            <p>Este relatório contém as métricas de restauração de documentos das últimas 24 horas, incluindo:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Total de restaurações:</strong> Número total de operações realizadas</li>
              <li><strong>Documentos únicos:</strong> Quantidade de documentos distintos restaurados</li>
              <li><strong>Média por dia:</strong> Taxa média de restaurações</li>
              <li><strong>Última execução:</strong> Timestamp da última operação</li>
            </ul>
          </div>
          
          <div class="attachment-note">
            <strong>📎 Anexo:</strong> O gráfico detalhado com as métricas está incluído como PDF anexo a este email.
          </div>
          
          <div class="info-box">
            <h2>🔍 Como usar este relatório</h2>
            <p>O PDF anexo contém visualizações gráficas dos dados de restauração. Use-o para:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Monitorar tendências de uso do sistema</li>
              <li>Identificar picos de atividade</li>
              <li>Planejar capacidade e recursos</li>
              <li>Análise de padrões de comportamento</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p><strong>🤖 Relatório Automático</strong></p>
          <p>Este email é gerado automaticamente todos os dias às 8:00 AM UTC.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">
            Para alterar as configurações de notificação, entre em contato com o administrador do sistema.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via SendGrid API with PDF attachment
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  pdfBuffer: Uint8Array,
  apiKey: string
): Promise<void> {
  // Convert Uint8Array to base64
  const base64Pdf = btoa(String.fromCharCode(...pdfBuffer));
  
  const reportDate = new Date().toISOString().split('T')[0];
  
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
      attachments: [{
        content: base64Pdf,
        filename: `restore_report_${reportDate}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
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
    console.log("🚀 Starting daily restore report generation with Puppeteer...");

    // Get required environment variables
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
    const EMBED_TOKEN = Deno.env.get("VITE_EMBED_ACCESS_TOKEN");

    // Validate required environment variables
    if (!ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL environment variable is required");
    }
    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is required");
    }
    if (!APP_URL) {
      throw new Error("VITE_APP_URL or APP_URL environment variable is required");
    }
    if (!EMBED_TOKEN) {
      throw new Error("VITE_EMBED_ACCESS_TOKEN environment variable is required");
    }

    console.log(`📧 Target email: ${ADMIN_EMAIL}`);
    console.log(`🌐 App URL: ${APP_URL}`);

    // Generate PDF from chart using Puppeteer
    console.log("📊 Generating chart PDF with Puppeteer...");
    const pdfBuffer = await generateChartPDF(APP_URL, EMBED_TOKEN);
    console.log(`✅ PDF generated successfully (${pdfBuffer.length} bytes)`);

    // Generate email content
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const emailHtml = generateEmailHtml(reportDate);
    const subject = `📊 Relatório Diário de Restaurações - ${reportDate}`;

    // Send email via SendGrid with PDF attachment
    console.log("📧 Sending email report...");
    await sendEmailViaSendGrid(
      ADMIN_EMAIL, 
      subject, 
      emailHtml, 
      pdfBuffer, 
      SENDGRID_API_KEY
    );

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(
      supabase, 
      "success", 
      `Relatório PDF enviado com sucesso para ${ADMIN_EMAIL} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        recipient: ADMIN_EMAIL,
        pdfSize: pdfBuffer.length,
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
