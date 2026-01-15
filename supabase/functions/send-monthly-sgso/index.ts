// @ts-nocheck
// ✅ Supabase Edge Function — Send Monthly SGSO Reports
// Scheduled function that generates and sends monthly SGSO reports for all vessels

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import jsPDF from "https://esm.sh/jspdf@2.5.2";
import "https://esm.sh/jspdf-autotable@3.8.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VesselData {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  organization_id?: string;
}

interface SGSOMetrics {
  vessel_id: string;
  vessel_name: string;
  incidents_count: number;
  non_conformities_count: number;
  risk_assessments_count: number;
  pending_actions: number;
  compliance_level: number;
}

/**
 * Log execution to cron_execution_logs table
 */
async function logCronExecution(
  supabase: any,
  status: "success" | "error" | "warning" | "critical",
  message: string,
  metadata: any = {},
  error: any = null,
  startTime?: number
) {
  try {
    const executionData: any = {
      function_name: "send-monthly-sgso",
      status,
      message,
      metadata,
      error_details: error
        ? {
            message: error.message,
            stack: error.stack,
            details: error,
          }
        : null,
    };

    if (startTime) {
      executionData.execution_duration_ms = Date.now() - startTime;
    }

    await supabase.from("cron_execution_logs").insert(executionData);
  } catch (logError) {
    console.error("Failed to log to cron_execution_logs:", logError);
  }
}

/**
 * Get SGSO metrics for a specific vessel
 */
async function getSGSOMetricsForVessel(
  supabase: any,
  vesselId: string,
  vesselName: string
): Promise<SGSOMetrics> {
  // Get incidents count (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { count: incidentsCount } = await supabase
    .from("safety_incidents")
    .select("*", { count: "exact", head: true })
    .eq("vessel_id", vesselId)
    .gte("incident_date", thirtyDaysAgo);

  // Get non-conformities count
  const { count: nonConformitiesCount } = await supabase
    .from("non_conformities")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "investigating", "corrective_action"])
    .gte("identified_date", thirtyDaysAgo);

  // Get risk assessments count
  const { count: riskAssessmentsCount } = await supabase
    .from("risk_assessments")
    .select("*", { count: "exact", head: true })
    .eq("vessel_id", vesselId)
    .in("risk_level", ["critical", "high"]);

  // Get SGSO practices compliance
  const { data: practices } = await supabase
    .from("sgso_practices")
    .select("compliance_level")
    .eq("status", "compliant");

  const avgCompliance =
    practices && practices.length > 0
      ? practices.reduce((sum: number, p: any) => sum + (p.compliance_level || 0), 0) /
        practices.length
      : 0;

  return {
    vessel_id: vesselId,
    vessel_name: vesselName,
    incidents_count: incidentsCount || 0,
    non_conformities_count: nonConformitiesCount || 0,
    risk_assessments_count: riskAssessmentsCount || 0,
    pending_actions: (nonConformitiesCount || 0) + (riskAssessmentsCount || 0),
    compliance_level: Math.round(avgCompliance),
  };
}

/**
 * Generate PDF buffer for a vessel's SGSO report
 */
function generatePDFBufferForVessel(metrics: SGSOMetrics): Uint8Array {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString("pt-BR");
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Relatório SGSO", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Embarcação: ${metrics.vessel_name}`, 105, 30, { align: "center" });
  doc.text(`Período: ${currentMonth}`, 105, 37, { align: "center" });
  doc.text(`Gerado em: ${currentDate}`, 105, 44, { align: "center" });

  // Draw header line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, 48, 190, 48);

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("📊 Resumo Executivo", 20, 58);

  const summaryData = [
    ["Métrica", "Valor", "Status"],
    [
      "Incidentes de Segurança (30 dias)",
      metrics.incidents_count.toString(),
      metrics.incidents_count > 3 ? "⚠️ Atenção" : "✅ Normal",
    ],
    [
      "Não-Conformidades Abertas",
      metrics.non_conformities_count.toString(),
      metrics.non_conformities_count > 5 ? "⚠️ Atenção" : "✅ Normal",
    ],
    [
      "Avaliações de Risco (Alto/Crítico)",
      metrics.risk_assessments_count.toString(),
      metrics.risk_assessments_count > 2 ? "⚠️ Atenção" : "✅ Normal",
    ],
    [
      "Ações Pendentes",
      metrics.pending_actions.toString(),
      metrics.pending_actions > 10
        ? "🔴 Crítico"
        : metrics.pending_actions > 5
        ? "⚠️ Atenção"
        : "✅ Normal",
    ],
    [
      "Nível de Conformidade ANP",
      `${metrics.compliance_level}%`,
      metrics.compliance_level >= 80 ? "✅ Adequado" : "⚠️ Atenção",
    ],
  ];

  (doc as any).autoTable({
    startY: 63,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Recommendations section
  const finalY = (doc as any).lastAutoTable.finalY || 110;
  doc.setFontSize(14);
  doc.text("💡 Recomendações", 20, finalY + 15);

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  let recommendationY = finalY + 23;

  if (metrics.incidents_count > 3) {
    doc.text("• Revisar procedimentos de segurança e intensificar treinamentos", 25, recommendationY);
    recommendationY += 7;
  }

  if (metrics.non_conformities_count > 5) {
    doc.text("• Priorizar o fechamento de não-conformidades abertas", 25, recommendationY);
    recommendationY += 7;
  }

  if (metrics.risk_assessments_count > 2) {
    doc.text("• Implementar planos de mitigação para riscos críticos/altos", 25, recommendationY);
    recommendationY += 7;
  }

  if (metrics.compliance_level < 80) {
    doc.text("• Intensificar ações para atingir conformidade mínima de 80%", 25, recommendationY);
    recommendationY += 7;
  }

  if (recommendationY === finalY + 23) {
    doc.text("• Manter os bons níveis de segurança operacional", 25, recommendationY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Sistema de Gestão de Segurança Operacional - Nautilus One", 105, 280, {
    align: "center",
  });
  doc.text("Este documento é confidencial e de uso exclusivo da organização", 105, 285, {
    align: "center",
  });

  // Return as Uint8Array
  return doc.output("arraybuffer");
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  vessel: string,
  toEmails: string[],
  pdfBuffer: Uint8Array,
  apiKey: string,
  dashboardLink: string
): Promise<void> {
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      border-radius: 5px 5px 0 0;
      text-align: center;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background-color: #eff6ff;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #2563eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📄 Relatório SGSO</h1>
    <p style="margin: 5px 0 0 0;">${currentMonth}</p>
  </div>
  
  <div class="content">
    <h2>Relatório de Segurança - ${vessel}</h2>
    
    <div class="info-box">
      <p style="margin: 0;">
        <strong>Embarcação:</strong> ${vessel}<br>
        <strong>Período:</strong> ${currentMonth}
      </p>
    </div>

    <p>
      Segue em anexo o relatório SGSO (Sistema de Gestão de Segurança Operacional) 
      da embarcação <strong>${vessel}</strong>.
    </p>

    <p>
      Este relatório contém informações sobre:
    </p>
    <ul>
      <li>Métricas de segurança operacional</li>
      <li>Incidentes e não-conformidades</li>
      <li>Status de práticas ANP</li>
      <li>Ações corretivas e preventivas</li>
    </ul>

    <p style="text-align: center;">
      <a href="${dashboardLink}" class="button">
        🔗 Acessar Painel SGSO
      </a>
    </p>

    <div class="footer">
      <p>
        <strong>Anexo:</strong> relatorio-sgso-${vessel.replace(/\s+/g, "-").toLowerCase()}.pdf
      </p>
      <p>
        Este é um relatório automatizado enviado mensalmente.<br>
        Sistema de Gestão de Segurança Operacional - Nautilus One
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Convert Uint8Array to base64
  const base64String = btoa(String.fromCharCode(...pdfBuffer));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "SGSO Reports <relatorios@nauti-one.com>",
      to: toEmails,
      subject: `📄 Relatório SGSO - ${vessel}`,
      html: htmlContent,
      attachments: [
        {
          filename: `relatorio-sgso-${vessel.replace(/\s+/g, "-").toLowerCase()}.pdf`,
          content: base64String,
        },
      ],
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

  const startTime = Date.now();

  try {
    console.log("🚀 Starting monthly SGSO report generation...");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const APP_URL = Deno.env.get("APP_URL") || "https://app.nauti-one.com";
    const SGSO_REPORT_EMAILS = Deno.env.get("SGSO_REPORT_EMAILS") || "seguranca@empresa.com";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("📊 Fetching active vessels...");

    // Get all active vessels
    const { data: vessels, error: vesselsError } = await supabase
      .from("vessels")
      .select("id, name, imo_number, vessel_type, organization_id")
      .eq("status", "active")
      .order("name");

    if (vesselsError) {
      console.error("Error fetching vessels:", vesselsError);
      await logCronExecution(
        supabase,
        "error",
        "Failed to fetch vessels",
        { step: "fetch_vessels" },
        vesselsError,
        startTime
      );
      throw new Error(`Failed to fetch vessels: ${vesselsError.message}`);
    }

    if (!vessels || vessels.length === 0) {
      console.log("ℹ️ No active vessels found");
      await logCronExecution(
        supabase,
        "warning",
        "No active vessels found",
        { vessels_count: 0 },
        null,
        startTime
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active vessels found",
          vessels_count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`✅ Found ${vessels.length} active vessel(s)`);

    const results = [];
    const recipients = SGSO_REPORT_EMAILS.split(",").map((email: string) => email.trim());

    // Process each vessel
    for (const vessel of vessels) {
      try {
        console.log(`📄 Generating report for ${vessel.name}...`);

        // Get SGSO metrics for the vessel
        const metrics = await getSGSOMetricsForVessel(supabase, vessel.id, vessel.name);

        // Generate PDF
        const pdfBuffer = generatePDFBufferForVessel(metrics);

        // Send email
        const dashboardLink = `${APP_URL}/admin/sgso`;
        await sendEmailViaResend(vessel.name, recipients, pdfBuffer, RESEND_API_KEY, dashboardLink);

        console.log(`✅ Report sent for ${vessel.name}`);
        results.push({
          vessel: vessel.name,
          success: true,
          metrics,
        });
      } catch (vesselError) {
        console.error(`❌ Error processing vessel ${vessel.name}:`, vesselError);
        results.push({
          vessel: vessel.name,
          success: false,
          error: vesselError instanceof Error ? vesselError.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Log successful execution
    await logCronExecution(
      supabase,
      failureCount > 0 ? "warning" : "success",
      `Monthly SGSO reports sent: ${successCount} successful, ${failureCount} failed`,
      {
        vessels_count: vessels.length,
        success_count: successCount,
        failure_count: failureCount,
        recipients: recipients,
        results: results,
      },
      null,
      startTime
    );

    console.log(`✅ Monthly SGSO report generation completed: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Monthly SGSO reports sent",
        vessels_count: vessels.length,
        success_count: successCount,
        failure_count: failureCount,
        recipients: recipients,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in send-monthly-sgso:", error);

    // Log critical error
    await logCronExecution(
      supabase,
      "critical",
      "Critical error in function",
      { step: "general_exception" },
      error,
      startTime
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
