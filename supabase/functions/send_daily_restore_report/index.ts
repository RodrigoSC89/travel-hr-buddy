// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email with chart (PDF format)

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";

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
 * Generate HTML email content
 */
function generateEmailHtml(logsCount: number, csvAttached: boolean, chartAttached: boolean = false): string {
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
            <p><strong>Arquivo CSV:</strong> ${csvAttached ? "✅ CSV incluído" : "❌ Nenhum dado disponível"}</p>
            <p><strong>Gráfico PDF:</strong> ${chartAttached ? "✅ PDF com gráfico incluído" : "❌ Não gerado"}</p>
          </div>
          ${chartAttached ? '<p>O relatório em formato PDF com gráfico está anexado a este email.</p>' : ''}
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
          <p>Este é um email automático gerado diariamente às 7:00 AM.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via SendGrid API with PDF attachment
 */
async function sendEmailViaSendGridWithPDF(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string,
  pdfBuffer: Uint8Array,
  isoDate: string,
  apiKey: string
): Promise<void> {
  const csvBase64 = csvContent ? btoa(csvContent) : "";
  const pdfBase64 = encode(pdfBuffer);

  const attachments = [];
  
  if (csvContent) {
    attachments.push({
      content: csvBase64,
      filename: `restore-logs-${isoDate}.csv`,
      type: "text/csv",
      disposition: "attachment",
    });
  }

  attachments.push({
    content: pdfBase64,
    filename: `restore_report_${isoDate}.pdf`,
    type: "application/pdf",
    disposition: "attachment",
  });

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { 
        email: Deno.env.get("EMAIL_FROM") || "no-reply@nautilusone.com",
        name: "Nautilus One Reports"
      },
      subject: subject,
      content: [{ type: "text/html", value: htmlContent }],
      attachments: attachments,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string,
  apiKey: string
): Promise<void> {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("🚀 Starting daily restore report generation with chart...");

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "http://localhost:5173";

    console.log("📊 Fetching restore report logs from last 24h...");

    // Fetch logs from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error: logsError } = await supabase
      .from("restore_report_logs")
      .select("executed_at, status, message, error_details")
      .gte("executed_at", yesterday)
      .order("executed_at", { ascending: false });

    if (logsError) {
      console.error("Error fetching logs:", logsError);
      await logExecution(supabase, "error", "Failed to fetch restore report logs", logsError);
      throw new Error(`Failed to fetch logs: ${logsError.message}`);
    }

    console.log(`✅ Fetched ${logs?.length || 0} logs from last 24h`);

    // Generate chart image using Puppeteer
    console.log("📈 Generating chart image with Puppeteer...");
    let imageBase64 = "";
    let pdfBuffer: Uint8Array | null = null;

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      const embedUrl = `${APP_URL}/embed/restore-chart`;
      console.log(`Navigating to: ${embedUrl}`);
      
      await page.goto(embedUrl, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for chart to be ready
      await page.waitForFunction("window.chartReady === true", {
        timeout: 15000,
      });

      console.log("Chart loaded successfully");

      // Take screenshot
      const screenshotBuffer = await page.screenshot({ 
        type: "png",
        fullPage: false,
      });
      imageBase64 = encode(screenshotBuffer);

      // Generate PDF
      pdfBuffer = await page.pdf({ 
        format: "A4",
        printBackground: true,
        margin: {
          top: "1cm",
          right: "1cm",
          bottom: "1cm",
          left: "1cm",
        },
      });

      await browser.close();
      console.log("✅ Chart image and PDF generated successfully");
    } catch (puppeteerError) {
      console.error("❌ Error generating chart with Puppeteer:", puppeteerError);
      await logExecution(supabase, "error", "Falha ao gerar gráfico com Puppeteer", puppeteerError);
      // Continue without chart if Puppeteer fails
    }

    // Generate CSV for attachment
    const csvContent = logs && logs.length > 0 ? generateCSV(logs) : "";
    const emailHtml = generateEmailHtml(logs?.length || 0, csvContent.length > 0, imageBase64.length > 0);

    console.log("📧 Sending email report...");

    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];
    const subject = `📈 Restore Report with Chart - ${isoDate}`;
    
    try {
      if (SENDGRID_API_KEY && pdfBuffer) {
        console.log("Using SendGrid API with PDF attachment...");
        await sendEmailViaSendGridWithPDF(
          ADMIN_EMAIL,
          subject,
          emailHtml,
          csvContent,
          pdfBuffer,
          isoDate,
          SENDGRID_API_KEY
        );
      } else if (SENDGRID_API_KEY) {
        console.log("Using SendGrid API...");
        await sendEmailViaSendGrid(ADMIN_EMAIL, subject, emailHtml, csvContent, SENDGRID_API_KEY);
      } else {
        console.log("Using SMTP fallback...");
        await sendEmailViaSMTP(ADMIN_EMAIL, subject, emailHtml, csvContent);
      }
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      await logExecution(supabase, "error", "Falha no envio do e-mail", emailError);
      throw emailError;
    }

    console.log("✅ Email sent successfully!");
    
    // Log successful execution
    await logExecution(supabase, "success", `Relatório enviado com sucesso para ${ADMIN_EMAIL}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully with chart",
        logsCount: logs?.length || 0,
        recipient: ADMIN_EMAIL,
        emailSent: true,
        chartGenerated: pdfBuffer !== null
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
