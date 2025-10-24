/**
 * PDF Export Utility
 * 
 * Reusable utility for exporting HTML content to PDF using html2pdf.js
 * with standardized branding, formatting, and error handling.
 */

import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

/**
 * Options for html2pdf.js configuration
 */
export interface PdfExportOptions {
  margin?: number | [number, number] | [number, number, number, number];
  filename?: string;
  image?: {
    type: "jpeg";
    quality: number;
  };
  html2canvas?: {
    scale: number;
    useCORS?: boolean;
  };
  jsPDF?: {
    unit?: "pt" | "mm" | "cm" | "in";
    format?: string | [number, number];
    orientation?: "portrait" | "landscape";
  };
}

/**
 * Format HTML content with standardized branding and styling
 * 
 * @param title - The title of the document
 * @param content - The main HTML content
 * @param footer - Optional custom footer (defaults to standard footer with timestamp)
 * @returns Formatted HTML string ready for PDF export
 */
export function formatPDFContent(
  title: string,
  content: string,
  footer?: string
): string {
  const defaultFooter = footer ?? `
    <div>
      Gerado em: ${new Date().toLocaleString()} - Sistema Nautilus One
    </div>
  `;

  return `
    <div style="font-family: Arial, sans-serif;">
      <h1 style="color: #1e40af">${title}</h1>
      <div>${content}</div>
      <footer>${defaultFooter}</footer>
    </div>
  `;
}

/**
 * Export HTML content to PDF with customizable options
 * 
 * @param contentHtml - The HTML content to export
 * @param filename - Optional filename (defaults to "document.pdf")
 * @param customOptions - Optional custom html2pdf.js options
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export async function exportToPDF(
  contentHtml: string,
  filename = "document.pdf",
  customOptions: Partial<PdfExportOptions> = {}
): Promise<void> {
  toast.info("Gerando PDF...");

  // Create temporary container
  const element = document.createElement("div");
  element.innerHTML = contentHtml;
  document.body.appendChild(element);

  try {
    // Default options
    const defaultOptions: PdfExportOptions = {
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Merge custom options with defaults, including nested jsPDF options
    const options: any = {
      ...defaultOptions,
      ...customOptions,
      jsPDF: {
        ...defaultOptions.jsPDF,
        ...(customOptions.jsPDF || {}),
      },
    };

    // Generate and download PDF
    await html2pdf().set(options).from(element).save();
    
    toast.success("PDF gerado com sucesso!");
  } catch (error) {
    logger.error("Error exporting PDF:", error);
    toast.error("Erro ao gerar PDF");
    throw error; // Re-throw for test assertions
  } finally {
    // Clean up temporary element
    document.body.removeChild(element);
  }
}
