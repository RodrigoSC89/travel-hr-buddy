import { SGSOAudit, SGSOAuditItem, ComplianceStatus, AIAnalysis } from "@/types/sgso-audit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Analyze a SGSO audit item using AI
 * This function makes a call to the edge function for AI analysis
 */
export async function analyzeSGSOItemWithAI(
  requirementTitle: string,
  description: string,
  evidence: string,
  complianceStatus: ComplianceStatus
): Promise<AIAnalysis> {
  try {
    // Call the Supabase Edge Function for AI analysis
    const response = await fetch("/api/ai/analyze-sgso-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirementTitle,
        description,
        evidence,
        complianceStatus,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze with AI");
    }

    const analysis: AIAnalysis = await response.json();
    return analysis;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    
    // Return a fallback analysis if the AI call fails
    return {
      causa_provavel: "Análise automática não disponível no momento.",
      recomendacao: "Por favor, complete a análise manualmente ou tente novamente mais tarde.",
      impacto: "Impacto a ser avaliado manualmente.",
      analise_completa: "Sistema de IA temporariamente indisponível.",
    };
  }
}

/**
 * Export SGSO audit to PDF
 */
export async function exportSGSOAuditToPDF(
  audit: SGSOAudit,
  items: SGSOAuditItem[],
  vesselName: string
): Promise<void> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Relatório de Auditoria SGSO", 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Embarcação: ${vesselName}`, 14, 30);
  doc.text(`Número da Auditoria: ${audit.audit_number}`, 14, 37);
  doc.text(`Data: ${new Date(audit.audit_date).toLocaleDateString('pt-BR')}`, 14, 44);
  doc.text(`Status: ${audit.status}`, 14, 51);
  
  // Summary statistics
  const stats = {
    compliant: items.filter(i => i.compliance_status === 'compliant').length,
    non_compliant: items.filter(i => i.compliance_status === 'non_compliant').length,
    partial: items.filter(i => i.compliance_status === 'partial').length,
    pending: items.filter(i => i.compliance_status === 'pending').length,
  };

  doc.text("Resumo:", 14, 62);
  doc.setFontSize(10);
  doc.text(`✓ Conformes: ${stats.compliant}`, 14, 69);
  doc.text(`✗ Não Conformes: ${stats.non_compliant}`, 14, 75);
  doc.text(`⚠ Parcialmente Conformes: ${stats.partial}`, 14, 81);
  doc.text(`⏳ Pendentes: ${stats.pending}`, 14, 87);

  // Table of audit items
  const tableData = items.map(item => [
    item.requirement_number.toString(),
    item.requirement_title,
    getComplianceLabel(item.compliance_status),
    item.evidence ? item.evidence.substring(0, 50) + "..." : "N/A",
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["#", "Requisito", "Status", "Evidências"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 40 },
      3: { cellWidth: 70 },
    },
  });

  // Add detailed findings on new pages
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.text("Detalhes dos Requisitos", 14, currentY);
  currentY += 10;

  items.forEach((item, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${item.requirement_number}. ${item.requirement_title}`, 14, currentY);
    currentY += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    // Description
    const descLines = doc.splitTextToSize(item.description, 180);
    doc.text(descLines, 14, currentY);
    currentY += descLines.length * 5;

    // Status
    doc.setFont(undefined, 'bold');
    doc.text(`Status: ${getComplianceLabel(item.compliance_status)}`, 14, currentY);
    currentY += 7;
    doc.setFont(undefined, 'normal');

    // Evidence
    if (item.evidence) {
      doc.text("Evidências:", 14, currentY);
      currentY += 5;
      const evidenceLines = doc.splitTextToSize(item.evidence, 175);
      doc.text(evidenceLines, 19, currentY);
      currentY += evidenceLines.length * 5;
    }

    // AI Analysis
    if (item.ai_analysis && Object.keys(item.ai_analysis).length > 0) {
      doc.text("Análise IA:", 14, currentY);
      currentY += 5;
      
      if (item.ai_analysis.causa_provavel) {
        doc.text("Causa Provável:", 19, currentY);
        currentY += 5;
        const causaLines = doc.splitTextToSize(item.ai_analysis.causa_provavel, 170);
        doc.text(causaLines, 24, currentY);
        currentY += causaLines.length * 5;
      }
      
      if (item.ai_analysis.recomendacao) {
        doc.text("Recomendação:", 19, currentY);
        currentY += 5;
        const recomLines = doc.splitTextToSize(item.ai_analysis.recomendacao, 170);
        doc.text(recomLines, 24, currentY);
        currentY += recomLines.length * 5;
      }
    }

    currentY += 8; // Space between items
  });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save PDF
  const fileName = `SGSO_Auditoria_${vesselName.replace(/\s+/g, '_')}_${audit.audit_number}.pdf`;
  doc.save(fileName);
}

function getComplianceLabel(status: ComplianceStatus): string {
  const labels: Record<ComplianceStatus, string> = {
    compliant: "Conforme",
    non_compliant: "Não Conforme",
    partial: "Parcialmente Conforme",
    pending: "Pendente"
  };
  return labels[status];
}
