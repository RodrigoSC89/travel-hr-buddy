/**
 * SGSO Report Generation Library
 * Helper functions for generating SGSO reports and PDF buffers
 */

import jsPDF from "jspdf";
import "jspdf-autotable";
import { createClient } from "@supabase/supabase-js";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

export interface VesselData {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  status: string;
  responsibleEmail?: string;
  organization_id?: string;
}

export interface SGSOMetrics {
  vessel_id: string;
  vessel_name: string;
  incidents_count: number;
  non_conformities_count: number;
  risk_assessments_count: number;
  pending_actions: number;
  compliance_level: number;
}

/**
 * Get all vessels from database
 * @returns Array of vessel data
 */
export async function getAllVessels(): Promise<VesselData[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("vessels")
    .select("id, name, imo_number, vessel_type, status, organization_id")
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("Error fetching vessels:", error);
    throw new Error(`Failed to fetch vessels: ${error.message}`);
  }

  return data || [];
}

/**
 * Get SGSO metrics for a specific vessel
 * @param vesselId - Vessel UUID
 * @returns SGSO metrics data
 */
export async function getSGSOMetricsForVessel(
  vesselId: string
): Promise<SGSOMetrics | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get vessel info
  const { data: vessel } = await supabase
    .from("vessels")
    .select("name")
    .eq("id", vesselId)
    .single();

  if (!vessel) {
    return null;
  }

  // Get incidents count
  const { count: incidentsCount } = await supabase
    .from("safety_incidents")
    .select("*", { count: "exact", head: true })
    .eq("vessel_id", vesselId)
    .gte("incident_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  // Get non-conformities count
  const { count: nonConformitiesCount } = await supabase
    .from("non_conformities")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "investigating", "corrective_action"])
    .gte("identified_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

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
      ? practices.reduce((sum, p) => sum + (p.compliance_level || 0), 0) / practices.length
      : 0;

  return {
    vessel_id: vesselId,
    vessel_name: vessel.name,
    incidents_count: incidentsCount || 0,
    non_conformities_count: nonConformitiesCount || 0,
    risk_assessments_count: riskAssessmentsCount || 0,
    pending_actions: (nonConformitiesCount || 0) + (riskAssessmentsCount || 0),
    compliance_level: Math.round(avgCompliance),
  };
}

/**
 * Generate PDF buffer for a vessel's SGSO report
 * @param vesselId - Vessel UUID
 * @returns PDF buffer
 */
export async function generatePDFBufferForVessel(vesselId: string): Promise<Buffer> {
  const metrics = await getSGSOMetricsForVessel(vesselId);

  if (!metrics) {
    throw new Error(`No metrics found for vessel ID: ${vesselId}`);
  }

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
      metrics.pending_actions > 10 ? "🔴 Crítico" : metrics.pending_actions > 5 ? "⚠️ Atenção" : "✅ Normal",
    ],
    [
      "Nível de Conformidade ANP",
      `${metrics.compliance_level}%`,
      metrics.compliance_level >= 80 ? "✅ Adequado" : "⚠️ Atenção",
    ],
  ];

  doc.autoTable({
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
  const finalY = (doc as unknown).lastAutoTable.finalY || 110;
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
    doc.text(
      "• Priorizar o fechamento de não-conformidades abertas",
      25,
      recommendationY
    );
    recommendationY += 7;
  }

  if (metrics.risk_assessments_count > 2) {
    doc.text(
      "• Implementar planos de mitigação para riscos críticos/altos",
      25,
      recommendationY
    );
    recommendationY += 7;
  }

  if (metrics.compliance_level < 80) {
    doc.text("• Intensificar ações para atingir conformidade mínima de 80%", 25, recommendationY);
    recommendationY += 7;
  }

  if (recommendationY === finalY + 23) {
    doc.text("• Manter os bons níveis de segurança operacional", 25, recommendationY);
    recommendationY += 7;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Sistema de Gestão de Segurança Operacional - Nautilus One",
    105,
    280,
    { align: "center" }
  );
  doc.text("Este documento é confidencial e de uso exclusivo da organização", 105, 285, {
    align: "center",
  });

  // Convert to buffer
  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}
