// ✅ Edge Function: daily-restore-report com notificação de erro

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SENDGRID_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com"; // 📧 Para onde vai o alerta de erro
const SITE_URL = Deno.env.get("SITE_URL") || Deno.env.get("SUPABASE_URL")!;

async function sendErrorAlert(subject: string, message: string) {
  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
        from: { email: "alerts@nautilusone.com", name: "Nautilus One" },
        subject,
        content: [{ type: "text/plain", value: message }],
      }),
    });
  } catch (error) {
    console.error("Failed to send error alert email:", error);
  }
}

serve(async () => {
  try {
    // Gera URL do gráfico (usando a API de geração de imagem do chart)
    const chartUrl = `${SITE_URL}/functions/v1/generate-chart-image`;
    
    console.log("Fetching chart image from:", chartUrl);
    
    const imageRes = await fetch(chartUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify({
        chartType: "restore-dashboard"
      })
    });
    
    if (!imageRes.ok) {
      const errorText = await imageRes.text();
      throw new Error(`Erro ao capturar gráfico: ${imageRes.status} - ${errorText}`);
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    console.log("Chart image captured successfully, sending email...");

    // Envia e-mail com o gráfico usando a função send-chart-report
    const emailRes = await fetch(`${SITE_URL}/functions/v1/send-chart-report`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${imageBase64}`,
        toEmail: ADMIN_EMAIL,
        subject: "📊 Relatório Diário de Restaurações - Nautilus One",
        chartType: "Restore Dashboard"
      }),
    });

    if (!emailRes.ok) {
      const errorData = await emailRes.json();
      await sendErrorAlert(
        "❌ Falha no envio de relatório", 
        `Erro ao enviar o relatório de restaurações por e-mail.\n\nDetalhes: ${JSON.stringify(errorData)}`
      );
      return new Response(
        JSON.stringify({ 
          error: "Envio falhou (email)", 
          details: errorData 
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "✅ Envio automático de relatório realizado com sucesso",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (err) {
    console.error("Critical error in daily-restore-report:", err);
    
    await sendErrorAlert(
      "❌ Erro crítico na função Edge", 
      `Erro ao gerar ou enviar gráfico:\n\n${err}\n\nStack: ${err.stack || 'N/A'}`
    );
    
    return new Response(
      JSON.stringify({ 
        error: "Falha geral no processo de envio automático",
        details: err.toString(),
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
