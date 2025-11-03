import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LSAFFAInspection, Vessel, LSAFFAEquipment } from './types';

export class ReportGenerator {
  /**
   * Generate a PDF report for an LSA/FFA inspection
   */
  static async generatePDF(
    inspection: LSAFFAInspection,
    vessel: Vessel,
    equipment?: LSAFFAEquipment[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${inspection.type} Inspection Report`, margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPos);
    
    // Vessel Information
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vessel Information', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const vesselInfo = [
      ['Vessel Name:', vessel.name],
      ['IMO Number:', vessel.imo_number || 'N/A'],
      ['Vessel Type:', vessel.vessel_type],
      ['Flag State:', vessel.flag_state],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: vesselInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Inspection Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inspection Details', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const inspectionInfo = [
      ['Inspection Type:', inspection.type === 'LSA' ? 'Life Saving Appliances' : 'Fire Fighting Appliances'],
      ['Inspector:', inspection.inspector],
      ['Date:', new Date(inspection.date).toLocaleDateString()],
      ['Status:', inspection.status.toUpperCase()],
      ['Compliance Score:', `${inspection.score}%`],
      ['Risk Rating:', inspection.ai_risk_rating?.toUpperCase() || 'N/A'],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: inspectionInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Checklist Results
    if (inspection.checklist && inspection.checklist.length > 0) {
      // Add new page if needed
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Checklist Results', margin, yPos);
      
      yPos += 8;
      
      const checklistData = inspection.checklist.map(item => [
        item.item,
        item.checked ? '✓ Pass' : '✗ Fail',
        item.notes || '-',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Status', 'Notes']],
        body: checklistData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 'auto' },
        },
        margin: { left: margin, right: margin },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Issues Found
    if (inspection.issues_found && inspection.issues_found.length > 0) {
      // Add new page if needed
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69); // Red color for issues
      doc.text('Issues & Non-Conformities', margin, yPos);
      doc.setTextColor(0, 0, 0); // Reset color
      
      yPos += 8;
      
      const issuesData = inspection.issues_found.map(issue => [
        issue.equipment,
        issue.description,
        issue.severity.toUpperCase(),
        issue.correctiveAction || 'Pending',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Equipment', 'Description', 'Severity', 'Corrective Action']],
        body: issuesData,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 55 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 'auto' },
        },
        margin: { left: margin, right: margin },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Equipment Details (if provided)
    if (equipment && equipment.length > 0) {
      // Add new page if needed
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Equipment Inspection Details', margin, yPos);
      
      yPos += 8;
      
      const equipmentData = equipment.map(eq => [
        eq.equipment_name,
        eq.equipment_type,
        eq.location || 'N/A',
        eq.condition,
        eq.compliant ? '✓' : '✗',
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Type', 'Location', 'Condition', 'Compliant']],
        body: equipmentData,
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: margin, right: margin },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // AI Notes (if available)
    if (inspection.ai_notes) {
      // Add new page if needed
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Analysis & Recommendations', margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(inspection.ai_notes, pageWidth - 2 * margin);
      doc.text(splitText, margin, yPos);
      
      yPos += splitText.length * 5 + 10;
    }

    // Footer with SOLAS references
    const addFooter = (pageNum: number) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Based on SOLAS Chapter III Regulation 20, MSC/Circ.1093, and MSC/Circ.1206',
        margin,
        pageHeight - 15
      );
      doc.text(
        `Page ${pageNum} | Generated: ${new Date().toLocaleString()}`,
        margin,
        pageHeight - 10
      );
    };

    // Add footers to all pages
    const totalPages = doc.internal.pages.length - 1; // Subtract first empty page
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    return doc.output('blob');
  }

  /**
   * Download the generated PDF
   */
  static async downloadPDF(
    inspection: LSAFFAInspection,
    vessel: Vessel,
    equipment?: LSAFFAEquipment[]
  ): Promise<void> {
    const blob = await this.generatePDF(inspection, vessel, equipment);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inspection.type}_Inspection_${vessel.name}_${new Date(inspection.date).toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a summary report for multiple inspections
   */
  static async generateSummaryPDF(
    inspections: LSAFFAInspection[],
    vessel: Vessel
  ): Promise<Blob> {
    const doc = new jsPDF();
    const margin = 14;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LSA/FFA Inspection Summary', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vessel: ${vessel.name}`, margin, yPos);
    yPos += 5;
    doc.text(`Period: ${new Date().toLocaleDateString()}`, margin, yPos);
    
    yPos += 15;

    // Summary Statistics
    const lsaCount = inspections.filter(i => i.type === 'LSA').length;
    const ffaCount = inspections.filter(i => i.type === 'FFA').length;
    const avgScore = inspections.reduce((sum, i) => sum + i.score, 0) / inspections.length;
    
    const summaryData = [
      ['Total Inspections:', inspections.length.toString()],
      ['LSA Inspections:', lsaCount.toString()],
      ['FFA Inspections:', ffaCount.toString()],
      ['Average Compliance Score:', `${avgScore.toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Individual Inspection Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inspection History', margin, yPos);
    
    yPos += 8;
    
    const inspectionData = inspections.map(inspection => [
      new Date(inspection.date).toLocaleDateString(),
      inspection.type,
      inspection.inspector,
      `${inspection.score}%`,
      inspection.status,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Type', 'Inspector', 'Score', 'Status']],
      body: inspectionData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });

    return doc.output('blob');
  }
}
