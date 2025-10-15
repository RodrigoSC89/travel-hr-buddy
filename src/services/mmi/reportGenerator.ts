/**
 * PDF Report Generator for MMI Jobs with AI Suggestions
 * Generates comprehensive PDF reports with job details and AI recommendations
 */

import jsPDF from "jspdf";
import type { Job } from "./jobsApi";

export interface ReportOptions {
  includeAISuggestion?: boolean;
  includeMetadata?: boolean;
}

/**
 * Generates a PDF report for a job with AI suggestions
 * @param job - The job to generate a report for
 * @param options - Report generation options
 * @returns Promise that resolves when the PDF is generated
 */
export const generateJobReport = async (
  job: Job,
  options: ReportOptions = {}
): Promise<void> => {
  const { includeAISuggestion = true, includeMetadata = true } = options;

  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * fontSize * 0.5) + 5;
  };

  // Title
  addText("Relatório de Job MMI", 18, true);
  yPosition += 5;

  // Job ID and Title
  addText(`Job ID: ${job.id}`, 12, true);
  addText(job.title, 14, true);
  yPosition += 5;

  // Job Details Section
  addText("Detalhes do Job", 14, true);
  addText(`Status: ${job.status}`, 11);
  addText(`Prioridade: ${job.priority}`, 11);
  addText(`Data de Vencimento: ${job.due_date}`, 11);
  yPosition += 5;

  // Component Information
  addText("Informações do Componente", 14, true);
  addText(`Componente: ${job.component.name}`, 11);
  addText(`Ativo: ${job.component.asset.name}`, 11);
  addText(`Embarcação: ${job.component.asset.vessel}`, 11);
  yPosition += 5;

  // AI Suggestion Section
  if (includeAISuggestion && job.suggestion_ia) {
    addText("💡 Sugestão IA baseada em histórico:", 14, true);
    yPosition += 2;
    
    // Add suggestion in a box-like format
    doc.setFillColor(240, 240, 240);
    const suggestionHeight = doc.splitTextToSize(job.suggestion_ia, pageWidth - 2 * margin - 10).length * 6 + 10;
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, suggestionHeight, "F");
    
    addText(job.suggestion_ia, 10);
    yPosition += 5;
  }

  // Metadata Section
  if (includeMetadata) {
    addText("Informações do Relatório", 14, true);
    addText(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10);
    addText("Sistema: MMI Copilot - Travel HR Buddy", 10);
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `Job_${job.id}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Generates a consolidated report for multiple jobs
 * @param jobs - Array of jobs to include in the report
 * @param options - Report generation options
 */
export const generateBatchReport = async (
  jobs: Job[],
  options: ReportOptions = {}
): Promise<void> => {
  const { includeAISuggestion = true } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper function to add text
  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    checkNewPage(lines.length * fontSize * 0.5 + 10);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * fontSize * 0.5) + 5;
  };

  // Title
  addText("Relatório Consolidado de Jobs MMI", 18, true);
  addText(`Total de Jobs: ${jobs.length}`, 12);
  addText(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10);
  yPosition += 10;

  // Process each job
  jobs.forEach((job, index) => {
    checkNewPage(80);
    
    // Job header with separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    addText(`${index + 1}. ${job.title}`, 13, true);
    addText(`Job ID: ${job.id} | Status: ${job.status} | Prioridade: ${job.priority}`, 10);
    addText(`Vencimento: ${job.due_date}`, 10);
    addText(`Componente: ${job.component.name} - ${job.component.asset.vessel}`, 10);
    
    if (includeAISuggestion && job.suggestion_ia) {
      yPosition += 2;
      addText("💡 Sugestão IA:", 11, true);
      addText(job.suggestion_ia, 9);
    }
    
    yPosition += 10;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Relatório MMI Copilot - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const fileName = `Jobs_Consolidado_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
