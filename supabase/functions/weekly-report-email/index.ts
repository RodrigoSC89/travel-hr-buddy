import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, reportData } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("Recipients array is required");
    }

    // Build HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #1e3a5f, #2d5a87); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .kpi-card { background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; }
    .kpi-value { font-size: 24px; font-weight: bold; color: #1e3a5f; }
    .kpi-label { font-size: 12px; color: #666; margin-top: 5px; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #1e3a5f; background: #f8f9fa; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    .status-ok { color: #22c55e; }
    .status-warning { color: #f59e0b; }
    .status-critical { color: #ef4444; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório Executivo Semanal</h1>
    <p>Nautilus One - ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  
  <div class="content">
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">${reportData?.fleet?.activeVessels || 0}/${reportData?.fleet?.totalVessels || 0}</div>
        <div class="kpi-label">Embarcações Ativas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${reportData?.wellness?.avgScore || 0}%</div>
        <div class="kpi-label">Wellness Médio</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value ${(reportData?.iot?.criticalAlerts || 0) > 0 ? 'status-critical' : 'status-ok'}">${reportData?.iot?.criticalAlerts || 0}</div>
        <div class="kpi-label">Alertas Críticos</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🛳️ Status da Frota</div>
      <p>Total de embarcações: ${reportData?.fleet?.totalVessels || 0}</p>
      <p>Embarcações ativas: ${reportData?.fleet?.activeVessels || 0}</p>
    </div>

    <div class="section">
      <div class="section-title">👥 Wellness da Tripulação</div>
      <p>Check-ins realizados: ${reportData?.wellness?.totalCheckins || 0}</p>
      <p>Score médio de wellness: ${reportData?.wellness?.avgScore || 0}%</p>
      <p>Tripulantes em risco: <span class="${(reportData?.wellness?.crewAtRisk || 0) > 0 ? 'status-warning' : 'status-ok'}">${reportData?.wellness?.crewAtRisk || 0}</span></p>
    </div>

    <div class="section">
      <div class="section-title">📡 Sensores IoT</div>
      <p>Leituras totais: ${reportData?.iot?.totalReadings || 0}</p>
      <p>Anomalias detectadas: ${reportData?.iot?.anomalies || 0}</p>
      <p>Alertas críticos: <span class="${(reportData?.iot?.criticalAlerts || 0) > 0 ? 'status-critical' : 'status-ok'}">${reportData?.iot?.criticalAlerts || 0}</span></p>
    </div>
  </div>

  <div class="footer">
    <p>Este relatório foi gerado automaticamente pelo Nautilus One</p>
    <p>© ${new Date().getFullYear()} Nautilus One - Maritime HR Management</p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nautilus One <reports@resend.dev>",
        to: recipients,
        subject: `📊 Relatório Executivo Semanal - ${new Date().toLocaleDateString('pt-BR')}`,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("weekly-report-email error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
