/**
 * PDF Export Utility
 * 
 * Reusable function for exporting content to PDF using html2pdf.js
 */

import html2pdf from "html2pdf.js";
import { toast } from "sonner";

export interface PDFOptions {
  margin?: number;
  filename?: string;
  image?: {
    type: string;
    quality: number;
  };
  html2canvas?: {
    scale: number;
  };
  jsPDF?: {
    unit: string;
    format: string;
    orientation: "portrait" | "landscape";
  };
}

/**
 * Exports HTML content to PDF
 * 
 * @param content - HTML string content to be converted to PDF
 * @param filename - Output PDF filename (default: document.pdf)
 * @param options - Additional PDF generation options
 * @returns Promise that resolves when PDF is generated
 */
export async function exportToPDF(
  content: string,
  filename = "document.pdf",
  options?: Partial<PDFOptions>
): Promise<void> {
  try {
    // Show generating toast
    toast.info("Gerando PDF...");

    // Create a temporary div element to hold the content
    const element = document.createElement("div");
    element.innerHTML = content;

    // Default options
    const defaultOptions: PDFOptions = {
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Merge with user options
    const finalOptions = {
      ...defaultOptions,
      ...options,
    };

    // Generate PDF
    await html2pdf().set(finalOptions).from(element).save();

    // Show success toast
    toast.success("PDF gerado com sucesso!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Erro ao gerar PDF");
    throw error;
  }
}

/**
 * Formats HTML content for PDF export with standard styling
 * 
 * @param title - Document title
 * @param content - Main content HTML
 * @param footer - Optional footer content
 * @returns Formatted HTML string
 */
export function formatPDFContent(
  title: string,
  content: string,
  footer?: string
): string {
  const timestamp = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const defaultFooter = footer || `
    <p>Gerado em: ${timestamp}</p>
    <p>Sistema Nautilus One - Travel HR Buddy</p>
  `;

  return `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #1e40af; margin-bottom: 20px;">${title}</h1>
      ${content}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
        ${defaultFooter}
      </div>
    </div>
  `;
}
