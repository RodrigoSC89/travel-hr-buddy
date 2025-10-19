/**
 * PDF Export Utility
 * Provides functions for exporting HTML content and DOM elements to PDF
 * Uses html2pdf.js library for PDF generation
 */

// Import html2pdf dynamically to support both browser and server environments
let html2pdfModule: any = null;

async function loadHtml2Pdf() {
  if (html2pdfModule) return html2pdfModule;
  
  // Dynamic import for html2pdf
  if (typeof window !== "undefined") {
    try {
      html2pdfModule = (await import("html2pdf.js")).default;
    } catch (error) {
      console.error("html2pdf.js not installed. Install with: npm install html2pdf.js");
      throw new Error("html2pdf.js is required for PDF export");
    }
  }
  
  return html2pdfModule;
}

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: "a4" | "letter" | "legal" | [number, number];
  orientation?: "portrait" | "landscape";
  scale?: number;
}

/**
 * Exports HTML content to PDF
 * @param html - HTML content to export
 * @param filename - Output filename (default: 'template.pdf')
 * @example
 * exportToPDF('<h1>My Document</h1>', 'output.pdf');
 */
export async function exportToPDF(html: string, filename = "template.pdf"): Promise<void> {
  const html2pdf = await loadHtml2Pdf();
  
  await html2pdf().from(html).set({
    filename,
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  }).save();
}

/**
 * Exports HTML content to PDF with custom options
 * @param html - HTML content to export
 * @param options - PDF export options
 * @example
 * exportToPDFWithOptions(html, {
 *   filename: 'report.pdf',
 *   margin: 1,
 *   format: 'a4',
 *   orientation: 'landscape'
 * });
 */
export async function exportToPDFWithOptions(
  html: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();
  
  const {
    filename = "template.pdf",
    margin = 0.5,
    format = "a4",
    orientation = "portrait",
    scale = 2,
  } = options;

  await html2pdf().from(html).set({
    filename,
    margin,
    html2canvas: { scale },
    jsPDF: { unit: "in", format, orientation },
  }).save();
}

/**
 * Exports a DOM element to PDF
 * @param element - DOM element to export
 * @param filename - Output filename (default: 'template.pdf')
 * @example
 * exportElementToPDF(document.getElementById('template'), 'doc.pdf');
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename = "template.pdf"
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();
  
  await html2pdf().from(element).set({
    filename,
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  }).save();
}

/**
 * Exports a DOM element to PDF with custom options
 * @param element - DOM element to export
 * @param options - PDF export options
 * @example
 * exportElementToPDFWithOptions(document.getElementById('template'), {
 *   filename: 'report.pdf',
 *   margin: 1,
 *   format: 'a4'
 * });
 */
export async function exportElementToPDFWithOptions(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();
  
  const {
    filename = "template.pdf",
    margin = 0.5,
    format = "a4",
    orientation = "portrait",
    scale = 2,
  } = options;

  await html2pdf().from(element).set({
    filename,
    margin,
    html2canvas: { scale },
    jsPDF: { unit: "in", format, orientation },
  }).save();
}
