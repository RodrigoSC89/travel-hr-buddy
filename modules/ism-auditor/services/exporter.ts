/**
 * PATCH 627 - ISM Evidence-Based Auditor
 * Report export service (JSON/PDF)
 */

import type { AuditResult, AuditReport, ActionItem } from '../types';
import { ISMAuditorService } from './auditor';

/**
 * Report generator service
 */
export class ReportGeneratorService {
  /**
   * Generate comprehensive audit report
   */
  static generateReport(auditResult: AuditResult): AuditReport {
    const executiveSummary = this.generateExecutiveSummary(auditResult);
    const detailedFindings = auditResult.non_conformities.map((nc) => ({
      checkpoint: nc.section,
      standard: nc.standard,
      status: 'non_compliant' as const,
      evidence: nc.evidence,
      comments: nc.description,
    }));
    const actionPlan = ISMAuditorService.generateActionPlan(auditResult);

    return {
      audit_result: auditResult,
      executive_summary: executiveSummary,
      detailed_findings: detailedFindings,
      action_plan: actionPlan,
      generated_at: new Date().toISOString(),
    };
  }

  private static generateExecutiveSummary(auditResult: AuditResult): string {
    const { compliance_score, risk_level, non_conformities, total_checkpoints } = auditResult;

    let summary = `# ISM Audit Executive Summary\n\n`;
    summary += `**Audit Date:** ${new Date(auditResult.audit_date).toLocaleDateString()}\n`;
    summary += `**Auditor:** ${auditResult.auditor}\n`;
    if (auditResult.vessel) {
      summary += `**Vessel:** ${auditResult.vessel}\n`;
    }
    summary += `\n---\n\n`;

    summary += `## Overall Compliance: ${compliance_score}%\n\n`;
    summary += `**Risk Level:** ${risk_level.toUpperCase()}\n\n`;

    summary += `### Audit Scope\n`;
    summary += `- Standards Checked: ${auditResult.standards_checked.join(', ')}\n`;
    summary += `- Total Checkpoints: ${total_checkpoints}\n`;
    summary += `- Passed: ${auditResult.passed_checkpoints}\n`;
    summary += `- Failed: ${auditResult.failed_checkpoints}\n\n`;

    summary += `### Non-Conformities Summary\n`;
    summary += `- Total: ${non_conformities.length}\n`;
    const critical = non_conformities.filter((nc) => nc.severity === 'critical').length;
    const major = non_conformities.filter((nc) => nc.severity === 'major').length;
    const minor = non_conformities.filter((nc) => nc.severity === 'minor').length;
    summary += `- Critical: ${critical}\n`;
    summary += `- Major: ${major}\n`;
    summary += `- Minor: ${minor}\n\n`;

    summary += `### Key Recommendations\n`;
    auditResult.recommendations.forEach((rec) => {
      summary += `- ${rec}\n`;
    });

    return summary;
  }
}

/**
 * JSON Export Service
 */
export class JSONExportService {
  /**
   * Export audit report as JSON
   */
  static exportToJSON(report: AuditReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export audit report as JSON file download
   */
  static downloadJSON(report: AuditReport, filename?: string): void {
    const json = this.exportToJSON(report);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `audit-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse JSON audit report
   */
  static parseJSON(json: string): AuditReport {
    return JSON.parse(json);
  }
}

/**
 * PDF Export Service
 */
export class PDFExportService {
  /**
   * Export audit report as PDF
   */
  static async exportToPDF(report: AuditReport): Promise<Blob> {
    // Using jsPDF library (already in dependencies)
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ISM Audit Report', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Audit Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Audit ID: ${report.audit_result.id}`, 20, yPosition);
    yPosition += 7;
    doc.text(
      `Date: ${new Date(report.audit_result.audit_date).toLocaleDateString()}`,
      20,
      yPosition
    );
    yPosition += 7;
    doc.text(`Auditor: ${report.audit_result.auditor}`, 20, yPosition);
    yPosition += 7;
    if (report.audit_result.vessel) {
      doc.text(`Vessel: ${report.audit_result.vessel}`, 20, yPosition);
      yPosition += 7;
    }
    yPosition += 5;

    // Compliance Score Box
    doc.setFillColor(
      report.audit_result.compliance_score >= 85 ? 34 : 
      report.audit_result.compliance_score >= 70 ? 255 : 
      220, 
      report.audit_result.compliance_score >= 85 ? 197 : 
      report.audit_result.compliance_score >= 70 ? 165 : 
      53, 
      report.audit_result.compliance_score >= 85 ? 94 : 0
    );
    doc.rect(20, yPosition, 170, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Compliance Score: ${report.audit_result.compliance_score}%`,
      105,
      yPosition + 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Risk Level
    doc.setFontSize(12);
    doc.text(
      `Risk Level: ${report.audit_result.risk_level.toUpperCase()}`,
      20,
      yPosition
    );
    yPosition += 10;

    // Non-Conformities Table
    if (report.audit_result.non_conformities.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Non-Conformities', 20, yPosition);
      yPosition += 7;

      const ncTableData = report.audit_result.non_conformities.map((nc) => [
        nc.standard,
        nc.section.substring(0, 30),
        nc.severity.toUpperCase(),
        nc.status,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Standard', 'Section', 'Severity', 'Status']],
        body: ncTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Action Plan
    if (report.action_plan.length > 0 && yPosition < 250) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Action Plan', 20, yPosition);
      yPosition += 7;

      const actionTableData = report.action_plan.slice(0, 5).map((action) => [
        action.priority.toUpperCase(),
        action.description.substring(0, 60),
        action.responsible,
        new Date(action.due_date).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Priority', 'Action', 'Responsible', 'Due Date']],
        body: actionTableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    // Recommendations (new page if needed)
    if (report.audit_result.recommendations.length > 0) {
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      report.audit_result.recommendations.forEach((rec, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const text = `${index + 1}. ${rec}`;
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 7;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Generated: ${new Date(report.generated_at).toLocaleString()}`,
        20,
        285
      );
      doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }

    return doc.output('blob');
  }

  /**
   * Download PDF file
   */
  static async downloadPDF(report: AuditReport, filename?: string): Promise<void> {
    const blob = await this.exportToPDF(report);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `audit-report-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Combined export service
 */
export class AuditReportExporter {
  /**
   * Generate and export report in specified format
   */
  static async exportReport(
    auditResult: AuditResult,
    format: 'json' | 'pdf',
    filename?: string
  ): Promise<void> {
    const report = ReportGeneratorService.generateReport(auditResult);

    if (format === 'json') {
      JSONExportService.downloadJSON(report, filename);
    } else {
      await PDFExportService.downloadPDF(report, filename);
    }
  }

  /**
   * Generate report object without downloading
   */
  static generateReportObject(auditResult: AuditResult): AuditReport {
    return ReportGeneratorService.generateReport(auditResult);
  }

  /**
   * Export report in both formats
   */
  static async exportBothFormats(
    auditResult: AuditResult,
    baseFilename?: string
  ): Promise<void> {
    const report = ReportGeneratorService.generateReport(auditResult);
    const timestamp = Date.now();
    const base = baseFilename || `audit-report-${timestamp}`;

    JSONExportService.downloadJSON(report, `${base}.json`);
    await PDFExportService.downloadPDF(report, `${base}.pdf`);
  }
}

export default AuditReportExporter;
