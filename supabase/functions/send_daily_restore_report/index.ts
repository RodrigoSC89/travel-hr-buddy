// ✅ Edge Function: send_daily_restore_report
// Scheduled function that sends daily restore report via email with chart screenshot as PDF

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting chart screenshot and PDF generation...");

    // Get the project URL from environment
    const projectUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://YOUR_PROJECT_URL";
    const embedUrl = `${projectUrl}/embed/restore-chart`;
    
    console.log(`📊 Capturing chart from: ${embedUrl}`);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    // Navigate to the embed chart page
    await page.goto(embedUrl, {
      waitUntil: "networkidle0",
    });

    // Wait for chart to be ready
    await page.waitForFunction("window.chartReady === true", { timeout: 15000 });

    // Take screenshot
    const imageBuffer = await page.screenshot({ type: "png" });
    const imageBase64 = encode(imageBuffer);

    // Generate PDF
    const pdfBuffer = await page.pdf({ format: "A4" });
    const pdfBase64 = encode(pdfBuffer);

    await browser.close();

    console.log("✅ Chart captured and PDF generated successfully");

    // Prepare email data
    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];
    const fileName = `restore_report_${isoDate}.pdf`;

    // Get email configuration
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendGridApiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is required");
    }

    console.log(`📧 Sending email to: ${adminEmail}`);

    const formData = {
      personalizations: [{ to: [{ email: adminEmail }] }],
      from: { email: "no-reply@empresa.com", name: "Nautilus Logs" },
      subject: `📈 Restore Report with Chart - ${isoDate}`,
      content: [
        { 
          type: "text/plain", 
          value: "Relatório diário com gráfico em anexo." 
        },
        {
          type: "text/html",
          value: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                  .content { padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 8px; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📈 Relatório Diário de Restauração</h1>
                    <p>Nautilus One - Travel HR Buddy</p>
                    <p>${today.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div class="content">
                    <h2>Métricas de Restauração de Documentos</h2>
                    <p>Olá,</p>
                    <p>Segue em anexo o relatório diário com o gráfico de métricas de restauração de documentos.</p>
                    <p>O PDF contém uma visualização completa das restaurações realizadas nos últimos dias.</p>
                    <p><strong>Data de geração:</strong> ${today.toLocaleString('pt-BR')}</p>
                  </div>
                  <div class="footer">
                    <p>Este é um email automático. Por favor, não responda.</p>
                    <p>&copy; ${today.getFullYear()} Nautilus One - Travel HR Buddy</p>
                  </div>
                </div>
              </body>
            </html>
          `
        }
      ],
      attachments: [
        {
          content: pdfBase64,
          filename: fileName,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    const sendResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Erro ao enviar e-mail com gráfico: ${errorText}`);
    }

    console.log("✅ Email sent successfully");

    // Log success to report_email_logs table
    await supabase.from("report_email_logs").insert({
      sent_at: new Date().toISOString(),
      status: "success",
      message: "PDF com gráfico enviado com sucesso",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Enviado com gráfico no PDF",
        recipient: adminEmail,
        fileName: fileName,
        timestamp: today.toISOString(),
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ Error:", err);
    
    // Log error to report_email_logs table
    await supabase.from("report_email_logs").insert({
      sent_at: new Date().toISOString(),
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: "❌ Erro ao gerar ou enviar gráfico PDF",
        details: err instanceof Error ? err.message : String(err),
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
