/**
 * Report Generator for LSA & FFA Inspections
 * Generates PDF reports with inspection results and AI recommendations
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  LSAFFAInspection,
  ChecklistItem,
  InspectionIssue,
  ReportExportOptions,
} from '@/types/lsa-ffa';
import { calculateInspectionScore } from '@/lib/scoreCalculator';

export class ReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  /**
   * Generate inspection report
   */
  async generateReport(
    inspection: LSAFFAInspection,
    vesselName: string,
    options: ReportExportOptions = {
      format: 'pdf',
      includeEvidence: false,
      includeAINotes: true,
      includeSignature: true,
      language: 'en',
    }
  ): Promise<Blob> {
    this.doc = new jsPDF();

    // Add header
    this.addHeader(inspection, vesselName);

    // Add inspection details
    this.addInspectionDetails(inspection);

    // Add score summary
    this.addScoreSummary(inspection);

    // Add checklist
    this.addChecklist(inspection.checklist);

    // Add issues
    if (inspection.issues_found.length > 0) {
      this.addIssues(inspection.issues_found);
    }

    // Add AI notes if enabled
    if (options.includeAINotes && inspection.ai_notes) {
      this.addAINotes(inspection.ai_notes);
    }

    // Add signature if enabled and available
    if (
      options.includeSignature &&
      inspection.signature_validated &&
      inspection.signature_data
    ) {
      this.addSignature(inspection);
    }

    // Add footer
    this.addFooter();

    return this.doc.output('blob');
  }

  /**
   * Add header section
   */
  private addHeader(inspection: LSAFFAInspection, vesselName: string): void {
    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      `${inspection.type} Inspection Report`,
      pageWidth / 2,
      20,
      { align: 'center' }
    );

    // Vessel name
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Vessel: ${vesselName}`, pageWidth / 2, 30, {
      align: 'center',
    });

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(15, 35, pageWidth - 15, 35);
  }

  /**
   * Add inspection details section
   */
  private addInspectionDetails(inspection: LSAFFAInspection): void {
    const startY = 45;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Inspection Details', 15, startY);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);

    const details = [
      `Inspector: ${inspection.inspector}`,
      `Date: ${new Date(inspection.date).toLocaleDateString()}`,
      `Type: ${inspection.type === 'LSA' ? 'Life-Saving Appliances' : 'Fire-Fighting Appliances'}`,
      `Report ID: ${inspection.id}`,
    ];

    details.forEach((detail, index) => {
      this.doc.text(detail, 15, startY + 10 + index * 7);
    });
  }

  /**
   * Add score summary section
   */
  private addScoreSummary(inspection: LSAFFAInspection): void {
    const startY = 80;
    const scoreData = calculateInspectionScore(
      inspection.checklist,
      inspection.issues_found
    );

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Compliance Score', 15, startY);

    // Score box
    const boxX = 15;
    const boxY = startY + 5;
    const boxWidth = 60;
    const boxHeight = 25;

    // Set color based on score
    if (scoreData.overallScore >= 90) {
      this.doc.setFillColor(34, 197, 94); // green
    } else if (scoreData.overallScore >= 75) {
      this.doc.setFillColor(59, 130, 246); // blue
    } else if (scoreData.overallScore >= 60) {
      this.doc.setFillColor(234, 179, 8); // yellow
    } else {
      this.doc.setFillColor(239, 68, 68); // red
    }

    this.doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    // Score text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      `${scoreData.overallScore}%`,
      boxX + boxWidth / 2,
      boxY + boxHeight / 2 + 3,
      { align: 'center' }
    );

    // Reset text color
    this.doc.setTextColor(0, 0, 0);

    // Compliance level
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Status: ${scoreData.complianceLevel.toUpperCase()}`,
      boxX + boxWidth + 10,
      boxY + 10
    );

    // Recommendation
    this.doc.setFontSize(9);
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const recommendationLines = this.doc.splitTextToSize(
      scoreData.recommendation,
      pageWidth - 30
    );
    this.doc.text(recommendationLines, 15, startY + 35);
  }

  /**
   * Add checklist section
   */
  private addChecklist(checklist: Record<string, ChecklistItem>): void {
    const items = Object.values(checklist);

    if (items.length === 0) return;

    this.doc.addPage();
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Inspection Checklist', 15, 20);

    const tableData = items.map((item) => [
      item.category,
      item.item,
      item.status.toUpperCase(),
      item.notes || '-',
    ]);

    autoTable(this.doc, {
      startY: 25,
      head: [['Category', 'Item', 'Status', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 55 },
      },
    });
  }

  /**
   * Add issues section
   */
  private addIssues(issues: InspectionIssue[]): void {
    this.doc.addPage();
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Issues Found', 15, 20);

    const tableData = issues.map((issue) => [
      issue.category,
      issue.description,
      issue.severity.toUpperCase(),
      issue.resolved ? 'Yes' : 'No',
    ]);

    autoTable(this.doc, {
      startY: 25,
      head: [['Category', 'Description', 'Severity', 'Resolved']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 85 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
    });
  }

  /**
   * Add AI notes section
   */
  private addAINotes(aiNotes: string): void {
    this.doc.addPage();
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('AI Recommendations', 15, 20);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const pageWidth = this.doc.internal.pageSize.getWidth();
    const lines = this.doc.splitTextToSize(aiNotes, pageWidth - 30);
    this.doc.text(lines, 15, 30);
  }

  /**
   * Add signature section
   */
  private addSignature(inspection: LSAFFAInspection): void {
    const pageHeight = this.doc.internal.pageSize.getHeight();
    const signatureY = pageHeight - 60;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Inspector Signature:', 15, signatureY);

    if (inspection.signature_data) {
      try {
        this.doc.addImage(
          inspection.signature_data,
          'PNG',
          15,
          signatureY + 5,
          50,
          20
        );
      } catch (error) {
        console.error('Failed to add signature image:', error);
      }
    }

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.text(`Signed by: ${inspection.inspector}`, 15, signatureY + 30);
    this.doc.text(
      `Date: ${new Date(inspection.signature_validated_at || inspection.date).toLocaleDateString()}`,
      15,
      signatureY + 36
    );
  }

  /**
   * Add footer to all pages
   */
  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      const pageHeight = this.doc.internal.pageSize.getHeight();
      const pageWidth = this.doc.internal.pageSize.getWidth();

      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(128, 128, 128);

      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Generated timestamp
      this.doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        15,
        pageHeight - 10
      );

      // SOLAS compliance note
      this.doc.text('SOLAS Compliant Report', pageWidth - 15, pageHeight - 10, {
        align: 'right',
      });
    }
  }

  /**
   * Save report to file
   */
  saveReport(filename: string): void {
    this.doc.save(filename);
  }

  /**
   * Get report as base64 string
   */
  getBase64(): string {
    return this.doc.output('datauristring');
  }
}

/**
 * Helper function to generate and download report
 */
export async function downloadInspectionReport(
  inspection: LSAFFAInspection,
  vesselName: string,
  options?: ReportExportOptions
): Promise<void> {
  const generator = new ReportGenerator();
  const blob = await generator.generateReport(inspection, vesselName, options);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${inspection.type}-Inspection-${vesselName}-${new Date(inspection.date).toISOString().split('T')[0]}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
