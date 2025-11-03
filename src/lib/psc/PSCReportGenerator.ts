/**
 * PSC Report Generator
 * Generates PDF reports for Pre-PSC inspections using jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PSCFinding, PSCScoreResult } from '@/modules/pre-psc/PSCScoreCalculator';

export interface PSCInspection {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  inspector_name: string;
  inspection_date: string;
  findings: PSCFinding[];
  recommendations: string[];
  score: number;
  signed_by: string;
  signature_hash?: string;
  risk_flag: boolean;
}

/**
 * Generate PDF report for PSC inspection
 */
export async function generatePSCReport(
  inspection: PSCInspection,
  scoreResult: PSCScoreResult
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre-Port State Control Inspection Report', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Inspection Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inspection Information', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const inspectionInfo = [
    ['Inspection ID:', inspection.id],
    ['Vessel:', inspection.vessel_name || 'N/A'],
    ['Inspector:', inspection.inspector_name],
    ['Date:', new Date(inspection.inspection_date).toLocaleDateString()],
    ['Time:', new Date(inspection.inspection_date).toLocaleTimeString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: inspectionInfo,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // Compliance Score Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Compliance Score', 14, yPosition);
  yPosition += 8;

  // Score Box
  const scoreColor = getScoreColorRGB(scoreResult.overallScore);
  doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
  doc.roundedRect(14, yPosition, 50, 20, 3, 3, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${scoreResult.overallScore}%`, 39, yPosition + 13, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPosition += 25;

  // Score Details
  const scoreDetails = [
    ['Total Items:', scoreResult.totalItems.toString()],
    ['Compliant:', scoreResult.compliantItems.toString()],
    ['Non-Compliant:', scoreResult.nonCompliantItems.toString()],
    ['Critical Findings:', scoreResult.criticalFindings.toString()],
    ['Risk Level:', scoreResult.riskLevel.toUpperCase()],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: scoreDetails,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // Category Scores
  if (Object.keys(scoreResult.categoryScores).length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Scores', 14, yPosition);
    yPosition += 8;

    const categoryData = Object.entries(scoreResult.categoryScores).map(([category, score]) => [
      category,
      `${score}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Score']],
      body: categoryData,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }

  // Add new page for findings
  doc.addPage();
  yPosition = 20;

  // Findings Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inspection Findings', 14, yPosition);
  yPosition += 8;

  const findingsData = inspection.findings
    .filter(f => f.status !== 'not-applicable')
    .map(finding => [
      finding.category,
      finding.item,
      finding.status.replace('-', ' ').toUpperCase(),
      finding.severity?.toUpperCase() || 'N/A',
    ]);

  if (findingsData.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Item', 'Status', 'Severity']],
      body: findingsData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }

  // Recommendations Section
  if (scoreResult.recommendations.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    scoreResult.recommendations.forEach((recommendation, index) => {
      const text = `${index + 1}. ${recommendation}`;
      const splitText = doc.splitTextToSize(text, pageWidth - 28);
      
      // Check if we need a new page
      if (yPosition + (splitText.length * 5) > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(splitText, 14, yPosition);
      yPosition += splitText.length * 5 + 3;
    });
  }

  // Signature Section
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  } else {
    yPosition += 15;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Digital Signature', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed by: ${inspection.signed_by}`, 14, yPosition);
  yPosition += 6;
  
  if (inspection.signature_hash) {
    doc.setFontSize(8);
    doc.text(`Signature Hash: ${inspection.signature_hash.substring(0, 64)}...`, 14, yPosition);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Return as Blob
  return doc.output('blob');
}

/**
 * Get RGB color based on score
 */
function getScoreColorRGB(score: number): { r: number; g: number; b: number } {
  if (score >= 90) return { r: 34, g: 197, b: 94 }; // Green
  if (score >= 75) return { r: 234, g: 179, b: 8 }; // Yellow
  if (score >= 60) return { r: 249, g: 115, b: 22 }; // Orange
  return { r: 239, g: 68, b: 68 }; // Red
}

/**
 * Export report as PDF file
 */
export async function exportPSCReport(
  inspection: PSCInspection,
  scoreResult: PSCScoreResult,
  filename?: string
): Promise<void> {
  const blob = await generatePSCReport(inspection, scoreResult);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `PSC_Report_${inspection.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
