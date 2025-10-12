// ✅ Supabase Edge Function — Monitor Cron Health
// Monitors cron job health and sends email alerts when executions are overdue

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthCheckResult {
  status: string;
  message: string;
  last_execution: string | null;
  hours_since_last_execution: number | null;
}

/**
 * Send alert email via Resend API
 */
async function sendAlertEmail(
  functionName: string,
  message: string,
  lastExecution: string | null,
  apiKey: string,
  adminEmail: string,
  emailFrom: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            padding: 30px; 
          }
          .alert-box { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444;
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 4px;
          }
          .alert-box h2 {
            margin-top: 0;
            color: #dc2626;
            font-size: 18px;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background: #f9fafb;
            border-radius: 4px;
          }
          .info-item strong {
            color: #4b5563;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f9fafb;
            color: #6b7280; 
            font-size: 12px; 
          }
          .timestamp {
            font-family: monospace;
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Falha - CRON Diário</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Nautilus One - Sistema de Monitoramento</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Função não executou no prazo esperado</h2>
              <p>${message}</p>
            </div>
            
            <div class="info-item">
              <strong>📋 Função:</strong> <code>${functionName}</code>
            </div>
            
            ${lastExecution ? `
            <div class="info-item">
              <strong>🕒 Última Execução:</strong> 
              <span class="timestamp">${new Date(lastExecution).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                dateStyle: 'full',
                timeStyle: 'long'
              })}</span>
            </div>
            ` : `
            <div class="info-item">
              <strong>🕒 Última Execução:</strong> 
              <span style="color: #dc2626;">Nenhuma execução registrada</span>
            </div>
            `}
            
            <div class="info-item">
              <strong>📅 Data do Alerta:</strong> 
              <span class="timestamp">${new Date().toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                dateStyle: 'full',
                timeStyle: 'long'
              })}</span>
            </div>

            <p style="margin-top: 20px;">
              <strong>Ação Recomendada:</strong><br>
              Por favor, verifique os logs da função e o status do cron job no painel do Supabase.
            </p>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado pelo sistema de monitoramento.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: adminEmail,
      subject: `⚠️ Falha na execução do CRON diário - ${functionName}`,
      html: htmlContent,
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
    console.log("🔍 Starting cron health check...");

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@nautilus.ai";
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "alertas@nautilus.ai";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Check health of send-daily-assistant-report
    const { data: healthData, error: healthError } = await supabase
      .rpc("check_daily_cron_execution", {
        p_function_name: "send-daily-assistant-report",
        p_hours_threshold: 36
      });

    if (healthError) {
      console.error("Error checking cron health:", healthError);
      throw new Error(`Failed to check cron health: ${healthError.message}`);
    }

    const healthResult = healthData[0] as HealthCheckResult;
    console.log("Health check result:", healthResult);

    // If status is warning, send alert email
    if (healthResult.status === "warning") {
      console.log("⚠️ Warning detected, sending alert email...");
      
      if (!RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured, cannot send alert email");
        throw new Error("RESEND_API_KEY not configured");
      }

      await sendAlertEmail(
        "send-daily-assistant-report",
        healthResult.message,
        healthResult.last_execution,
        RESEND_API_KEY,
        ADMIN_EMAIL,
        EMAIL_FROM
      );

      console.log("✅ Alert email sent successfully");

      return new Response(
        JSON.stringify({
          success: true,
          status: "warning",
          message: "Alert email sent",
          healthCheck: healthResult
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.log("✅ Cron job is healthy");

      return new Response(
        JSON.stringify({
          success: true,
          status: "ok",
          message: "Cron job is healthy",
          healthCheck: healthResult
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
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
