import { edgeLogger } from "../_shared/edge-logger.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TAG = "MONITOR-CRON-HEALTH";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendAlertEmail(apiKey: string, from: string, to: string, message: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject: "⚠️ Alerta: Cron Diário Não Executado",
        html: `
          <h2>⚠️ Alerta de Monitoramento</h2>
          <p>O cron <strong>send-assistant-report-daily</strong> não foi executado nas últimas 36 horas.</p>
          <p><strong>Detalhes:</strong> ${message}</p>
          <p><strong>Ação requerida:</strong> Revisar logs no painel <code>/admin/reports/assistant</code></p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Este é um alerta automático do sistema de monitoramento.<br>
            Função: monitor-cron-health<br>
            Timestamp: ${new Date().toISOString()}
          </p>
        `
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    edgeLogger.info(TAG, "Checking daily cron execution status");

    const { data, error } = await supabase.rpc("check_daily_cron_execution");
    
    if (error || !data || !data[0]) {
      edgeLogger.error(TAG, "Error checking cron status", { error: error?.message });
      return new Response("Erro na verificação.", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const { status, message } = data[0];
    
    edgeLogger.info(TAG, `Cron status: ${status}`, { message });

    if (status === "ok") {
      edgeLogger.success(TAG, "Cron executed normally, no alert needed");
      return new Response("✅ Cron executado normalmente.", {
        headers: corsHeaders
      });
    }

    // Status is 'warning' - send alert email
    edgeLogger.warn(TAG, "Cron failure detected, sending alert email");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@nautilus.ai";
    const fromEmail = Deno.env.get("EMAIL_FROM") || "alertas@nautilus.ai";

    if (!resendApiKey) {
      edgeLogger.error(TAG, "RESEND_API_KEY not configured");
      return new Response("Erro: API key não configurada.", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const emailSent = await sendAlertEmail(resendApiKey, fromEmail, adminEmail, message);

    if (!emailSent) {
      edgeLogger.error(TAG, "Error sending alert email");
      return new Response("Erro ao enviar alerta.", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    edgeLogger.success(TAG, `Alert email sent to ${adminEmail}`);
    
    return new Response("⚠️ Alerta enviado com sucesso", {
      headers: corsHeaders
    });

  } catch (error) {
    edgeLogger.error(TAG, "Unexpected error", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
