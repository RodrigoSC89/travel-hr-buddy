/**
 * PDF Report Generator for MMI Jobs
 * Generates comprehensive PDF reports with AI suggestions
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Job } from './jobsApi';
import type { CopilotSuggestion } from './copilotService';

export interface ReportOptions {
  includeAISuggestions?: boolean;
  includeJobDetails?: boolean;
  includeComponentInfo?: boolean;
}

/**
 * Generate a PDF report for a job with AI suggestions
 * @param job - Job data
 * @param aiSuggestion - Optional AI suggestion to include in the report
 * @param options - Report generation options
 * @returns jsPDF instance
 */
export function generateJobReport(
  job: Job,
  aiSuggestion?: CopilotSuggestion,
  options: ReportOptions = {}
): jsPDF {
  const {
    includeAISuggestions = true,
    includeJobDetails = true,
    includeComponentInfo = true,
  } = options;

  // Create PDF document
  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Job MMI', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
  
  yPosition += 15;

  // Job details section
  if (includeJobDetails) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Detalhes do Job', margin, yPosition);
    
    yPosition += 8;
    
    // Create table for job details
    autoTable(doc, {
      startY: yPosition,
      head: [['Campo', 'Valor']],
      body: [
        ['ID', job.id],
        ['Título', job.title],
        ['Status', job.status],
        ['Prioridade', job.priority],
        ['Data de Vencimento', job.due_date],
      ],
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Component information section
  if (includeComponentInfo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Componente', margin, yPosition);
    
    yPosition += 8;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Campo', 'Valor']],
      body: [
        ['Componente', job.component.name],
        ['Ativo', job.component.asset.name],
        ['Embarcação', job.component.asset.vessel],
      ],
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // AI Suggestions section
  if (includeAISuggestions && aiSuggestion) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('💡 Sugestão IA baseada em histórico', margin, yPosition);
    
    yPosition += 10;

    // AI suggestion box
    doc.setFillColor(240, 248, 255);
    doc.rect(margin, yPosition, contentWidth, 10, 'F');
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Contexto Histórico:', margin + 3, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Split historical context into lines
    const contextLines = doc.splitTextToSize(
      aiSuggestion.historical_context,
      contentWidth - 6
    );
    
    contextLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin + 3, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
    
    // Recommended action
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Ação Recomendada:', margin + 3, yPosition);
    
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const actionLines = doc.splitTextToSize(
      `${aiSuggestion.recommended_action} Prazo: ${aiSuggestion.estimated_time}.`,
      contentWidth - 6
    );
    
    actionLines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin + 3, yPosition);
      yPosition += 5;
    });
    
    yPosition += 8;
    
    // Confidence score
    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Jobs Similares Encontrados', aiSuggestion.similar_jobs_found.toString()],
        ['Confiança da Sugestão', `${Math.round(aiSuggestion.confidence * 100)}%`],
        ['Tempo Estimado', aiSuggestion.estimated_time],
      ],
      theme: 'grid',
      headStyles: { fillColor: [92, 184, 92] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });
  }

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generate and download a PDF report
 * @param job - Job data
 * @param aiSuggestion - Optional AI suggestion
 * @param options - Report generation options
 */
export async function downloadJobReport(
  job: Job,
  aiSuggestion?: CopilotSuggestion,
  options?: ReportOptions
): Promise<void> {
  try {
    const doc = generateJobReport(job, aiSuggestion, options);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `MMI_Job_${job.id}_${timestamp}.pdf`;
    
    // Download the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
}

/**
 * Generate and preview a PDF report in a new window
 * @param job - Job data
 * @param aiSuggestion - Optional AI suggestion
 * @param options - Report generation options
 */
export async function previewJobReport(
  job: Job,
  aiSuggestion?: CopilotSuggestion,
  options?: ReportOptions
): Promise<void> {
  try {
    const doc = generateJobReport(job, aiSuggestion, options);
    
    // Open PDF in new window
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error previewing PDF report:', error);
    throw error;
  }
}
