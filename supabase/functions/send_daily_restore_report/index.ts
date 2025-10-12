// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email (PDF with chart screenshot)
// Uses Puppeteer to capture restore metrics chart and convert to PDF

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
 * Generate HTML email content for PDF attachment
 */
function generateEmailHtml(): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px; 
          }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Diário - Métricas de Restauração</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${today}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Gráfico de Restaurações</h2>
            <p>O relatório em formato PDF está anexado a este email com o gráfico de métricas de restauração de documentos.</p>
            <p>O gráfico mostra o número de restaurações realizadas por dia nos últimos 30 dias.</p>
          </div>
          <p><strong>Arquivo anexado:</strong> restore_report_${new Date().toISOString().split('T')[0]}.pdf</p>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente às 8:00 AM UTC.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Capture chart screenshot using Puppeteer and generate PDF
 */
async function captureChartAsPDF(chartUrl: string): Promise<Uint8Array> {
  console.log("🎨 Launching browser to capture chart...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshot size
    await page.setViewport({ width: 1024, height: 768 });
    
    console.log(`📄 Navigating to chart URL: ${chartUrl}`);
    await page.goto(chartUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for chart to be ready (component sets window.chartReady flag)
    console.log("⏳ Waiting for chart to render...");
    await page.waitForFunction("window.chartReady === true", { 
      timeout: 15000 
    });
    
    // Give extra time for animations to complete
    await page.waitForTimeout(2000);

    console.log("📸 Generating PDF from page...");
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
 * Send email via SendGrid API with PDF attachment
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  pdfBuffer: Uint8Array,
  apiKey: string
): Promise<void> {
  console.log("📧 Sending email via SendGrid...");
  
  // Convert PDF buffer to base64
  const base64PDF = btoa(String.fromCharCode(...pdfBuffer));
  
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
        content: base64PDF,
        filename: `restore_report_${new Date().toISOString().split('T')[0]}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }
  
  console.log("✅ Email sent successfully via SendGrid");
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
    console.log("🚀 Starting daily restore report generation with chart PDF...");

    // Get configuration from environment
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");

    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is required");
    }

    if (!APP_URL) {
      throw new Error("VITE_APP_URL or APP_URL environment variable is required");
    }

    console.log(`📊 Chart URL: ${APP_URL}/embed/restore-chart`);

    // Capture chart as PDF using Puppeteer
    const pdfBuffer = await captureChartAsPDF(`${APP_URL}/embed/restore-chart`);

    // Generate email HTML
    const emailHtml = generateEmailHtml();
    const subject = `📊 Relatório Diário - Métricas de Restauração ${new Date().toLocaleDateString('pt-BR')}`;

    // Send email with PDF attachment
    await sendEmailViaSendGrid(ADMIN_EMAIL, subject, emailHtml, pdfBuffer, SENDGRID_API_KEY);

    console.log("✅ Report sent successfully!");
    
    // Log successful execution
    await logExecution(
      supabase, 
      "success", 
      `Relatório PDF enviado com sucesso para ${ADMIN_EMAIL}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore chart report sent successfully as PDF",
        recipient: ADMIN_EMAIL,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in send_daily_restore_report:", error);
    
    // Log critical error
    await logExecution(supabase, "critical", "Erro crítico na geração do relatório PDF", error);
    
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
