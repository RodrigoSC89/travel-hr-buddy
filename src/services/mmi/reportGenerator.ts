/**
 * MMI Job PDF Report Generator with AI Suggestions
 * Generates PDF reports with historical context and recommendations
 */

import jsPDF from "jspdf";
import type { Job } from "./jobsApi";
import type { CopilotSuggestion } from "./copilotService";
import { generateCopilotSuggestion } from "./copilotService";

export interface JobReportData {
  job: Job;
  aiSuggestion?: CopilotSuggestion;
}

/**
 * Generates HTML content for the AI suggestion section
 * This matches the format specified in the problem statement
 */
export function generateAISuggestionHTML(suggestion: CopilotSuggestion): string {
  const confidencePercent = (suggestion.confidence * 100).toFixed(0);
  const monthYear = new Date().toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  return `
    <div style="margin-top: 12px;">
      <h4>💡 Sugestão IA baseada em histórico:</h4>
      <p>
        ${suggestion.historical_context}
      </p>
      <p><strong>Ação recomendada:</strong> ${suggestion.recommended_action} Prazo: ${suggestion.estimated_time}.</p>
      <p style="color: #666; font-size: 0.9em;">
        <em>Confiança: ${confidencePercent}% | Jobs similares: ${suggestion.similar_jobs_found}</em>
      </p>
    </div>
  `;
}

/**
 * Generates a comprehensive PDF report for an MMI job
 * Includes AI suggestions and historical context
 */
export async function generateJobPDF(job: Job): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Job MMI", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Job ID
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Job ID: ${job.id}`, 20, yPos);
  yPos += 10;

  // Job Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Título:", 20, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const titleLines = doc.splitTextToSize(job.title, pageWidth - 40);
  doc.text(titleLines, 20, yPos);
  yPos += titleLines.length * 7 + 5;

  // Job Details
  doc.setFontSize(12);
  doc.text(`Status: ${job.status}`, 20, yPos);
  yPos += 7;
  doc.text(`Prioridade: ${job.priority}`, 20, yPos);
  yPos += 7;
  doc.text(`Prazo: ${new Date(job.due_date).toLocaleDateString("pt-BR")}`, 20, yPos);
  yPos += 10;

  // Component Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do Componente:", 20, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Componente: ${job.component.name}`, 20, yPos);
  yPos += 7;
  doc.text(`Ativo: ${job.component.asset.name}`, 20, yPos);
  yPos += 7;
  doc.text(`Embarcação: ${job.component.asset.vessel}`, 20, yPos);
  yPos += 15;

  // Generate AI Suggestion if not already present
  let aiSuggestion: CopilotSuggestion | undefined;
  if (job.suggestion_ia) {
    // Try to get AI suggestion from copilot
    try {
      aiSuggestion = await generateCopilotSuggestion(job.title);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
    }
  }

  // AI Suggestion Section (as specified in problem statement)
  if (aiSuggestion || job.suggestion_ia) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("💡 Sugestão IA baseada em histórico:", 20, yPos);
    yPos += 10;

    if (aiSuggestion) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      // Historical context
      const contextLines = doc.splitTextToSize(aiSuggestion.historical_context, pageWidth - 40);
      doc.text(contextLines, 20, yPos);
      yPos += contextLines.length * 6 + 5;

      // Recommended action
      doc.setFont("helvetica", "bold");
      doc.text("Ação recomendada:", 20, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      const actionLines = doc.splitTextToSize(
        `${aiSuggestion.recommended_action} Prazo: ${aiSuggestion.estimated_time}.`,
        pageWidth - 40
      );
      doc.text(actionLines, 20, yPos);
      yPos += actionLines.length * 6 + 5;

      // Confidence and metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Confiança: ${(aiSuggestion.confidence * 100).toFixed(0)}% | Jobs similares: ${aiSuggestion.similar_jobs_found}`,
        20,
        yPos
      );
      doc.setTextColor(0, 0, 0);
      yPos += 10;
    } else if (job.suggestion_ia) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const suggestionLines = doc.splitTextToSize(job.suggestion_ia, pageWidth - 40);
      doc.text(suggestionLines, 20, yPos);
      yPos += suggestionLines.length * 6 + 10;
    }
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const timestamp = new Date().toLocaleString("pt-BR");
  doc.text(
    `Relatório gerado automaticamente em ${timestamp}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );
  doc.setTextColor(0, 0, 0);

  return doc;
}

/**
 * Downloads the PDF report for a job
 */
export async function downloadJobReport(job: Job): Promise<void> {
  const pdf = await generateJobPDF(job);
  pdf.save(`job-report-${job.id}-${Date.now()}.pdf`);
}

/**
 * Generates HTML preview of the report (for display in UI)
 */
export async function generateJobReportHTML(job: Job): Promise<string> {
  let aiSuggestion: CopilotSuggestion | undefined;
  
  if (job.suggestion_ia || job.title) {
    try {
      aiSuggestion = await generateCopilotSuggestion(job.title);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
    }
  }

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
      <h1 style="text-align: center;">Relatório de Job MMI</h1>
      <p><strong>Job ID:</strong> ${job.id}</p>
      
      <h2>Título</h2>
      <p>${job.title}</p>
      
      <h2>Detalhes</h2>
      <p><strong>Status:</strong> ${job.status}</p>
      <p><strong>Prioridade:</strong> ${job.priority}</p>
      <p><strong>Prazo:</strong> ${new Date(job.due_date).toLocaleDateString("pt-BR")}</p>
      
      <h2>Informações do Componente</h2>
      <p><strong>Componente:</strong> ${job.component.name}</p>
      <p><strong>Ativo:</strong> ${job.component.asset.name}</p>
      <p><strong>Embarcação:</strong> ${job.component.asset.vessel}</p>
      
      ${aiSuggestion ? generateAISuggestionHTML(aiSuggestion) : job.suggestion_ia ? `
        <div style="margin-top: 12px;">
          <h4>💡 Sugestão IA:</h4>
          <p>${job.suggestion_ia}</p>
        </div>
      ` : ''}
      
      <p style="text-align: center; color: #999; font-size: 0.9em; margin-top: 30px;">
        Relatório gerado automaticamente em ${new Date().toLocaleString("pt-BR")}
      </p>
    </div>
  `;
}
