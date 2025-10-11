import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email from environment variables
const ADMIN_EMAIL = Deno.env.get("EMAIL_TO") || Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const ALERT_EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";

/**
 * Sends an error alert email via SendGrid
 * @param subject - Email subject
 * @param message - Error message details
 */
async function sendErrorAlert(subject: string, message: string): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.error("⚠️ SENDGRID_API_KEY não configurado - não é possível enviar alertas por e-mail");
    return;
  }

  try {
    console.log(`📧 Enviando alerta de erro para ${ADMIN_EMAIL}...`);
    
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
        from: { email: ALERT_EMAIL_FROM },
        subject: subject,
        content: [{
          type: "text/html",
          value: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 5px;">
                    <h2 style="margin: 0;">⚠️ Alerta de Erro - Daily Restore Report</h2>
                  </div>
                  <div style="padding: 20px; background-color: #f9fafb; margin-top: 10px; border-radius: 5px;">
                    <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <p><strong>Função:</strong> daily-restore-report</p>
                    <p><strong>Mensagem:</strong></p>
                    <pre style="background-color: #fff; padding: 15px; border-left: 3px solid #ef4444; overflow-x: auto;">${message}</pre>
                  </div>
                  <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 5px;">
                    <p style="margin: 0;"><strong>🔍 Onde verificar:</strong></p>
                    <p style="margin: 5px 0 0 0;">Supabase Dashboard → Logs → Edge Functions → daily-restore-report</p>
                  </div>
                </div>
              </body>
            </html>
          `
        }],
      }),
    });

    if (response.ok) {
      console.log("✅ Alerta de erro enviado com sucesso");
    } else {
      const errorText = await response.text();
      console.error("❌ Erro ao enviar alerta:", response.status, errorText);
    }
  } catch (error) {
    console.error("❌ Exceção ao enviar alerta de erro:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🟢 Iniciando execução da função diária...");
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`);
    console.log(`👤 Admin Email: ${ADMIN_EMAIL}`);

    // Get the site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("VITE_SUPABASE_URL")?.replace("/rest/v1", "") || "https://SEUSITE.com";
    const chartUrl = `${siteUrl}/api/generate-chart-image`;
    
    console.log(`📊 URL do gráfico: ${chartUrl}`);
    console.log("🔄 Capturando gráfico...");

    // Capture the chart image
    const imageRes = await fetch(chartUrl);

    if (!imageRes.ok) {
      const errorText = await imageRes.text();
      console.error("❌ Erro ao capturar o gráfico");
      console.error(`   Status: ${imageRes.status} ${imageRes.statusText}`);
      console.error(`   Detalhes: ${errorText}`);
      
      await sendErrorAlert(
        "❌ Falha ao capturar gráfico", 
        `A captura automática do gráfico falhou.\n\nURL: ${chartUrl}\nStatus: ${imageRes.status}\nDetalhes: ${errorText}`
      );
      
      return new Response(
        JSON.stringify({
          error: "Falha na captura do gráfico",
          status: imageRes.status,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    console.log(`✅ Gráfico capturado com sucesso`);
    console.log(`   Tamanho da imagem: ${imageBuffer.byteLength} bytes`);
    console.log(`   Tamanho em base64: ${imageBase64.length} caracteres`);
    console.log("📧 Enviando e-mail...");

    // Send the email with the chart
    const emailEndpoint = `${siteUrl}/api/send-restore-report`;
    console.log(`   Endpoint de e-mail: ${emailEndpoint}`);
    
    const emailRes = await fetch(emailEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${imageBase64}`,
        toEmail: ADMIN_EMAIL,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("❌ Erro ao enviar o e-mail");
      console.error(`   Status: ${emailRes.status} ${emailRes.statusText}`);
      console.error(`   Detalhes: ${errorText}`);
      
      await sendErrorAlert(
        "❌ Falha no envio de relatório", 
        `Erro ao enviar o relatório por e-mail.\n\nEndpoint: ${emailEndpoint}\nStatus: ${emailRes.status}\nDetalhes: ${errorText}`
      );
      
      return new Response(
        JSON.stringify({
          error: "Falha no envio",
          status: emailRes.status,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const emailResult = await emailRes.json();
    console.log("✅ Relatório enviado com sucesso!");
    console.log(`   Destinatário: ${ADMIN_EMAIL}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Execução finalizada com sucesso",
        timestamp: new Date().toISOString(),
        recipient: ADMIN_EMAIL,
        chartUrl: chartUrl,
        emailResult: emailResult
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : "";
    
    console.error("❌ Erro geral na execução:", errorMessage);
    if (errorStack) {
      console.error("   Stack trace:", errorStack);
    }
    
    await sendErrorAlert(
      "❌ Erro crítico na função Edge", 
      `Erro geral na execução da função daily-restore-report:\n\n${errorMessage}\n\nStack Trace:\n${errorStack}`
    );
    
    return new Response(
      JSON.stringify({
        error: "Falha crítica",
        message: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
