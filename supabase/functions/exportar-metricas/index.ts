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

// Helper function to generate CSV from metrics data
function generateCSV(data: MetricasRisco[]): string {
  const headers = ["Auditoria ID", "Embarcação", "Mês", "Falhas Críticas"];
  const rows = data.map((row) => [
    row.auditoria_id,
    row.embarcacao || "N/A",
    row.mes,
    row.falhas_criticas.toString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

// Helper function to generate simple HTML for PDF conversion
function generateHTMLReport(data: MetricasRisco[]): string {
  const currentDate = new Date().toLocaleDateString("pt-BR");
  
  const tableRows = data
    .map(
      (row) => `
    <tr>
      <td>${row.embarcacao || "N/A"}</td>
      <td>${row.mes}</td>
      <td class="${row.falhas_criticas > 3 ? "alert" : ""}">${
        row.falhas_criticas
      }</td>
      <td>${row.falhas_criticas > 3 ? "ALTO RISCO" : "Normal"}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Métricas de Risco - Auditorias IMCA</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .header {
      margin-bottom: 30px;
    }
    .info {
      font-size: 14px;
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .alert {
      color: #e74c3c;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .summary {
      background-color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Métricas de Risco - Auditorias IMCA</h1>
    <div class="info">
      <strong>Data do Relatório:</strong> ${currentDate}<br>
      <strong>Total de Registros:</strong> ${data.length}<br>
      <strong>Período:</strong> Consolidado Mensal
    </div>
  </div>
  
  <div class="summary">
    <h3>Resumo Executivo</h3>
    <p>
      Este relatório apresenta as métricas consolidadas de auditorias IMCA, 
      destacando embarcações com alto índice de falhas críticas (> 3 alertas/mês).
    </p>
    <p>
      <strong>Embarcações em Alto Risco:</strong> ${
        data.filter((d) => d.falhas_criticas > 3).length
      }
    </p>
  </div>

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

  <div class="footer">
    <p>
      <strong>Nota:</strong> Embarcações com mais de 3 alertas críticos por mês 
      são automaticamente destacadas para ação imediata da equipe de compliance.
    </p>
    <p>Gerado automaticamente pelo Sistema de Gestão de Auditorias IMCA</p>
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

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the RPC function to get metrics
    const { data, error } = await supabase.rpc("auditoria_metricas_risco");

    if (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }

    // Generate CSV and HTML reports
    const csvContent = generateCSV(data || []);
    const htmlContent = generateHTMLReport(data || []);

    // Return both formats in the response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      recordCount: data?.length || 0,
      csv: csvContent,
      html: htmlContent,
      data: data || [],
      summary: {
        totalAudits: data?.length || 0,
        highRiskVessels: data?.filter((d: MetricasRisco) => d.falhas_criticas > 3).length || 0,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in exportar-metricas function:", error);
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
