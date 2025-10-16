import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MetricasRisco {
  auditoria_id: string;
  embarcacao: string;
  mes: string;
  falhas_criticas: number;
}

// Generate CSV content
function generateCSV(data: MetricasRisco[]): string {
  const headers = ["Auditoria ID", "Embarcação", "Mês", "Falhas Críticas"];
  const rows = data.map((row) => [
    row.auditoria_id,
    row.embarcacao || "N/A",
    row.mes,
    row.falhas_criticas.toString(),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

// Generate email HTML content
function generateEmailHTML(data: MetricasRisco[], dashboardLink: string): string {
  const currentDate = new Date().toLocaleDateString("pt-BR");
  const highRiskVessels = data.filter((d) => d.falhas_criticas > 3);
  
  const tableRows = data
    .slice(0, 10) // Show top 10 in email
    .map(
      (row) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px;">${row.embarcacao || "N/A"}</td>
      <td style="padding: 10px;">${row.mes}</td>
      <td style="padding: 10px; ${
        row.falhas_criticas > 3 ? "color: #e74c3c; font-weight: bold;" : ""
      }">${row.falhas_criticas}</td>
      <td style="padding: 10px;">${
        row.falhas_criticas > 3 ? "⚠️ ALTO RISCO" : "✅ Normal"
      }</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3498db;
      color: white;
      padding: 20px;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .summary-box {
      background-color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #3498db;
    }
    .alert-box {
      background-color: #ffe6e6;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #e74c3c;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: white;
    }
    th {
      background-color: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📊 Relatório Mensal - Métricas de Risco IMCA</h1>
    <p style="margin: 5px 0 0 0;">Data: ${currentDate}</p>
  </div>
  
  <div class="content">
    <div class="summary-box">
      <h2 style="margin-top: 0;">📈 Resumo Executivo</h2>
      <ul style="margin: 10px 0;">
        <li><strong>Total de Auditorias:</strong> ${data.length}</li>
        <li><strong>Embarcações Monitoradas:</strong> ${
          new Set(data.map((d) => d.embarcacao)).size
        }</li>
        <li><strong>Total de Falhas Críticas:</strong> ${data.reduce(
          (sum, d) => sum + d.falhas_criticas,
          0
        )}</li>
        <li><strong>Embarcações em Alto Risco (>3 alertas/mês):</strong> ${
          highRiskVessels.length
        }</li>
      </ul>
    </div>

    ${
      highRiskVessels.length > 0
        ? `
    <div class="alert-box">
      <h3 style="margin-top: 0;">⚠️ Atenção Necessária</h3>
      <p>
        <strong>${highRiskVessels.length}</strong> embarcação(ões) apresenta(m) 
        alto índice de falhas críticas e requer(em) ação imediata da equipe de compliance.
      </p>
      <p style="margin-bottom: 0;">
        <strong>Embarcações:</strong> ${highRiskVessels
          .map((v) => v.embarcacao || "N/A")
          .slice(0, 5)
          .join(", ")}
        ${highRiskVessels.length > 5 ? ` e mais ${highRiskVessels.length - 5}...` : ""}
      </p>
    </div>
    `
        : ""
    }

    <h3>📋 Top 10 Auditorias Recentes</h3>
    <table>
      <thead>
        <tr>
          <th>Embarcação</th>
          <th>Mês</th>
          <th>Falhas Críticas</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${dashboardLink}" class="button">
        🔗 Acessar Painel Interativo Completo
      </a>
    </p>

    <div class="footer">
      <p>
        <strong>Arquivos Anexos:</strong><br>
        • Relatório completo em CSV com todos os dados<br>
        • Link para painel SGSO com mapa de risco operacional
      </p>
      <p>
        Este é um relatório automatizado enviado mensalmente no dia 01.<br>
        Sistema de Gestão de Auditorias IMCA - Travel HR Buddy
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appUrl = Deno.env.get("APP_URL") || "https://app.nautilus.system";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recipient list from request or use default
    const { recipients } = await req.json().catch(() => ({
      recipients: ["compliance@nautilus.system", "seguranca@nautilus.system"],
    }));

    // Call the RPC function to get metrics
    const { data, error } = await supabase.rpc("auditoria_metricas_risco");

    if (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }

    // Generate CSV content
    const csvContent = generateCSV(data || []);
    const csvBase64 = btoa(csvContent);

    // Generate email HTML
    const dashboardLink = `${appUrl}/admin/dashboard-auditorias`;
    const emailHTML = generateEmailHTML(data || [], dashboardLink);

    // Send email via Resend
    const emailPayload = {
      from: "SGSO Compliance <noreply@nautilus.system>",
      to: recipients,
      subject: `📊 Relatório Mensal de Auditorias IMCA - ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
      html: emailHTML,
      attachments: [
        {
          filename: `auditoria-metricas-${new Date().toISOString().slice(0, 7)}.csv`,
          content: csvBase64,
        },
      ],
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        recipients,
        emailId: emailResult.id,
        recordCount: data?.length || 0,
        summary: {
          totalAudits: data?.length || 0,
          highRiskVessels:
            data?.filter((d: MetricasRisco) => d.falhas_criticas > 3).length || 0,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-auditoria-report function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
