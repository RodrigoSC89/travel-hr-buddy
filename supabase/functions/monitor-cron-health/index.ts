// Supabase Edge Function - Monitor Cron Job Health
// Monitors cron job execution health and sends email alerts when issues are detected

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate alert email HTML
 */
function generateAlertEmailHtml(functionName: string, lastExecution: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning-icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="warning-icon">⚠️</div>
          <h1>Falha na execução do CRON diário</h1>
          <p>Nautilus One - Travel HR Buddy</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h2>🚨 Alerta de Monitoramento</h2>
            <p><strong>Função:</strong> ${functionName}</p>
            <p><strong>Status:</strong> Falha detectada</p>
            <p><strong>Última execução bem-sucedida:</strong> ${lastExecution}</p>
          </div>
          <h3>Ações Recomendadas:</h3>
          <ul>
            <li>Verificar os logs da função no Supabase Dashboard</li>
            <li>Confirmar que o cron job está configurado corretamente</li>
            <li>Verificar variáveis de ambiente (RESEND_API_KEY, ADMIN_EMAIL)</li>
            <li>Testar a função manualmente para identificar erros</li>
          </ul>
          <h3>Como verificar:</h3>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto;">
# Ver logs recentes
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;

# Testar função manualmente
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-assistant-report \\
  -H "Authorization: Bearer YOUR_ANON_KEY"
          </pre>
        </div>
        <div class="footer">
          <p>Este é um alerta automático do sistema de monitoramento de CRON.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send alert email via Resend API
 */
async function sendAlertEmail(
  toEmail: string,
  functionName: string,
  lastExecution: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "alertas@nautilus.ai",
      to: toEmail,
      subject: "⚠️ Falha na execução do CRON diário",
      html: generateAlertEmailHtml(functionName, lastExecution),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("🔍 Checking cron job health...");

    // Call the check function
    const { data: healthCheck, error: checkError } = await supabase
      .rpc("check_daily_cron_execution");

    if (checkError) {
      console.error("Error checking cron health:", checkError);
      throw new Error(`Failed to check cron health: ${checkError.message}`);
    }

    console.log("Health check result:", healthCheck);

    // Extract status from the result
    const status = healthCheck && healthCheck.length > 0 ? healthCheck[0].status : 'error';
    const message = healthCheck && healthCheck.length > 0 ? healthCheck[0].message : 'No data returned';
    const lastExecution = healthCheck && healthCheck.length > 0 ? healthCheck[0].last_execution : null;

    // If status is warning, send alert email
    if (status === 'warning') {
      console.log("⚠️ Warning detected, sending alert email...");
      
      const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@nautilus.ai";
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

      if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured, skipping email alert");
      } else {
        const lastExecStr = lastExecution 
          ? new Date(lastExecution).toLocaleString('pt-BR')
          : 'Nunca';
        
        await sendAlertEmail(
          ADMIN_EMAIL,
          'send-assistant-report-daily',
          lastExecStr,
          RESEND_API_KEY
        );
        
        console.log("✅ Alert email sent successfully");
      }
    } else {
      console.log("✅ Cron job health is OK");
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        message: message,
        lastExecution: lastExecution,
        alertSent: status === 'warning' && !!Deno.env.get("RESEND_API_KEY")
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in monitor-cron-health:", error);
    
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
