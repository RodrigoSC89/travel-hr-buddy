/**
 * ISM Audit Intelligence Module - Report Export Service
 * PATCH 633
 * PATCH 653 - Lazy loading for jsPDF
 * Handles PDF and JSON export of ISM audit reports
 */

import { ISMAuditItem, ISMChecklistItem, ISMFinding, ISMReportExport, ISM_SECTIONS } from "./types";
import { Logger } from "@/lib/utils/logger";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return jsPDF;
};

/**
 * Export ISM audit report as PDF
 */
export async function exportISMAuditPDF(
  audit: ISMAuditItem,
  checklist: ISMChecklistItem[],
  findings: ISMFinding[]
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    Logger.info("Exporting ISM audit to PDF", { auditId: audit.id });

    const jsPDF = await loadJsPDF();
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ISM Audit Report", 105, yPosition, { align: "center" });
    yPosition += 15;

    // Audit Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Vessel: ${audit.vessel_name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Audit Date: ${new Date(audit.audit_date).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Auditor: ${audit.auditor_name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Audit Type: ${audit.audit_type}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Status: ${audit.status}`, 20, yPosition);
    yPosition += 10;

    // Overall Score
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const scoreColor = audit.overall_score >= 90 ? [0, 128, 0] : audit.overall_score >= 75 ? [0, 0, 255] : [255, 0, 0];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`Overall Score: ${audit.overall_score}%`, 105, yPosition, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    // Section Scores Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Section Scores", 20, yPosition);
    yPosition += 5;

    const sectionTableData = Object.entries(audit.section_scores).map(([section, score]) => [
      ISM_SECTIONS[section as keyof typeof ISM_SECTIONS].title,
      ISM_SECTIONS[section as keyof typeof ISM_SECTIONS].imo_ref,
      `${score}%`
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [["Section", "IMO Reference", "Score"]],
      body: sectionTableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Findings Summary
    if (findings.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Findings", 20, yPosition);
      yPosition += 5;

      const findingsData = findings.map(finding => [
        ISM_SECTIONS[finding.section].title,
        finding.type.replace(/_/g, " ").toUpperCase(),
        finding.title,
        finding.status
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [["Section", "Type", "Finding", "Status"]],
        body: findingsData,
        theme: "grid",
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Checklist Details (Summary)
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Checklist Summary", 20, yPosition);
    yPosition += 5;

    const checklistSummary = {
      compliant: checklist.filter(i => i.compliance_status === "compliant").length,
      observation: checklist.filter(i => i.compliance_status === "observation").length,
      non_conformity: checklist.filter(i => i.compliance_status === "non_conformity").length,
      major_non_conformity: checklist.filter(i => i.compliance_status === "major_non_conformity").length,
      not_verified: checklist.filter(i => i.compliance_status === "not_verified").length
    };

    const summaryData = [
      ["Compliant", `${checklistSummary.compliant}`],
      ["Observations", `${checklistSummary.observation}`],
      ["Non-Conformities", `${checklistSummary.non_conformity}`],
      ["Major Non-Conformities", `${checklistSummary.major_non_conformity}`],
      ["Not Verified", `${checklistSummary.not_verified}`],
      ["Total Items", `${checklist.length}`]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [["Status", "Count"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [52, 73, 94] },
      margin: { left: 20, right: 20 }
    });

    // LLM Analysis
    if (audit.llm_analysis) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("AI Analysis", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Overall Assessment
      const splitText = doc.splitTextToSize(audit.llm_analysis.overall_assessment, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += (splitText.length * 5) + 10;

      // Critical Gaps
      if (audit.llm_analysis.critical_gaps.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Critical Gaps:", 20, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        
        audit.llm_analysis.critical_gaps.forEach((gap, index) => {
          const gapText = doc.splitTextToSize(`${index + 1}. ${gap}`, 165);
          doc.text(gapText, 25, yPosition);
          yPosition += (gapText.length * 5) + 2;
        });
        yPosition += 5;
      }

      // Recommendations
      if (audit.llm_analysis.recommendations.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text("Recommendations:", 20, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        
        audit.llm_analysis.recommendations.forEach((rec, index) => {
          const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
          doc.text(recText, 25, yPosition);
          yPosition += (recText.length * 5) + 2;
        });
      }
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        105,
        285,
        { align: "center" }
      );
    }

    const blob = doc.output("blob");

    Logger.info("PDF export completed", { auditId: audit.id });

    return {
      success: true,
      blob
    };
  } catch (error) {
    Logger.error("Failed to export PDF", error, "ism-audit-export");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Export ISM audit report as JSON
 */
export async function exportISMAuditJSON(
  audit: ISMAuditItem,
  checklist: ISMChecklistItem[],
  findings: ISMFinding[],
  evidence: any[] = []
): Promise<{ success: boolean; json?: string; error?: string }> {
  try {
    Logger.info("Exporting ISM audit to JSON", { auditId: audit.id });

    const reportData: ISMReportExport = {
      audit,
      checklist,
      findings,
      evidence,
      llm_analysis: audit.llm_analysis,
      generated_at: new Date().toISOString(),
      generated_by: audit.created_by
    };

    const json = JSON.stringify(reportData, null, 2);

    Logger.info("JSON export completed", { auditId: audit.id });

    return {
      success: true,
      json
    };
  } catch (error) {
    Logger.error("Failed to export JSON", error, "ism-audit-export");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Download PDF report
 */
export function downloadPDFReport(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download JSON report
 */
export function downloadJSONReport(json: string, fileName: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
