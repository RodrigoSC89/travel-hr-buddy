/**
 * Pre-OVID PDF Export Generator
 * PATCH 650 - Pre-OVID Inspection Module
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface InspectionData {
  id: string;
  vessel_name?: string;
  inspector_name?: string;
  inspection_date: string;
  location?: string;
  checklist_version?: string;
  status?: string;
  notes?: string;
  responses?: Array<{
    section: string;
    question_number: string;
    question_text: string;
    response: string;
    comments?: string;
    non_conformity: boolean;
    ai_suggestion?: string;
    ai_risk_analysis?: string;
  }>;
  ai_report?: {
    summary?: string;
    critical_findings?: string;
    suggested_plan?: string;
    risk_score?: number;
    compliance_score?: number;
  };
}

/**
 * Generate a PDF report for a Pre-OVID inspection
 */
export async function generatePreOvidPDF(inspection: InspectionData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pré-OVID Inspection Report', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Header information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  const headerInfo = [
    `Vessel: ${inspection.vessel_name || 'N/A'}`,
    `Inspector: ${inspection.inspector_name || 'N/A'}`,
    `Date: ${new Date(inspection.inspection_date).toLocaleDateString('pt-BR')}`,
    `Location: ${inspection.location || 'N/A'}`,
    `Checklist: ${inspection.checklist_version || 'N/A'}`,
    `Status: ${inspection.status || 'N/A'}`,
  ];

  headerInfo.forEach((info) => {
    doc.text(info, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // AI Summary Section
  if (inspection.ai_report?.summary) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Summary', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(
      inspection.ai_report.summary,
      pageWidth - 40
    );
    summaryLines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Scores
  if (
    inspection.ai_report?.risk_score !== undefined ||
    inspection.ai_report?.compliance_score !== undefined
  ) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores:', 20, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    if (inspection.ai_report.risk_score !== undefined) {
      doc.text(
        `Risk Score: ${inspection.ai_report.risk_score}%`,
        30,
        yPosition
      );
      yPosition += 6;
    }
    if (inspection.ai_report.compliance_score !== undefined) {
      doc.text(
        `Compliance Score: ${inspection.ai_report.compliance_score}%`,
        30,
        yPosition
      );
      yPosition += 6;
    }
    yPosition += 5;
  }

  // Critical Findings
  if (inspection.ai_report?.critical_findings) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🔍 Critical Findings', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const findingsLines = doc.splitTextToSize(
      inspection.ai_report.critical_findings,
      pageWidth - 40
    );
    findingsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Checklist Results
  if (inspection.responses && inspection.responses.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Checklist Results', 20, yPosition);
    yPosition += 10;

    // Limit to first 30 items to avoid huge PDFs
    const itemsToShow = inspection.responses.slice(0, 30);

    itemsToShow.forEach((response, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Q${response.question_number}: ${response.section}`,
        20,
        yPosition
      );
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const questionLines = doc.splitTextToSize(
        response.question_text,
        pageWidth - 40
      );
      questionLines.forEach((line: string) => {
        doc.text(line, 25, yPosition);
        yPosition += 5;
      });

      doc.text(`Response: ${response.response}`, 25, yPosition);
      yPosition += 5;

      if (response.comments) {
        doc.text(`Comments: ${response.comments}`, 25, yPosition);
        yPosition += 5;
      }

      if (response.non_conformity) {
        doc.setTextColor(255, 0, 0);
        doc.text('⚠️ Non-conformity', 25, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
      }

      if (response.ai_risk_analysis) {
        doc.setTextColor(0, 0, 255);
        const analysisLines = doc.splitTextToSize(
          `AI Analysis: ${response.ai_risk_analysis}`,
          pageWidth - 50
        );
        analysisLines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
        doc.setTextColor(0, 0, 0);
      }

      yPosition += 3;
    });

    if (inspection.responses.length > 30) {
      doc.text(
        `... and ${inspection.responses.length - 30} more items`,
        20,
        yPosition
      );
    }
  }

  // Action Plan
  if (inspection.ai_report?.suggested_plan) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Suggested Action Plan', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const planLines = doc.splitTextToSize(
      inspection.ai_report.suggested_plan,
      pageWidth - 40
    );
    planLines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`pre-ovid-inspection-${inspection.id}.pdf`);
}

/**
 * Export inspection data to CSV
 */
export function exportInspectionToCSV(inspection: InspectionData) {
  const rows: string[][] = [];

  // Header row
  rows.push([
    'Section',
    'Question Number',
    'Question',
    'Response',
    'Comments',
    'Non-Conformity',
    'AI Suggestion',
    'AI Risk Analysis',
  ]);

  // Data rows
  if (inspection.responses) {
    inspection.responses.forEach((response) => {
      rows.push([
        response.section,
        response.question_number,
        response.question_text,
        response.response,
        response.comments || '',
        response.non_conformity ? 'Yes' : 'No',
        response.ai_suggestion || '',
        response.ai_risk_analysis || '',
      ]);
    });
  }

  // Convert to CSV string
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pre-ovid-inspection-${inspection.id}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
