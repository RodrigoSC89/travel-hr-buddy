import html2pdf from 'html2pdf.js';

/**
 * Export HTML content to PDF using html2pdf.js
 * @param html - HTML content to export
 * @param filename - Name of the PDF file to generate (default: 'template.pdf')
 */
export function exportToPDF(html: string, filename = 'template.pdf'): void {
  html2pdf().from(html).set({
    filename,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }).save();
}

/**
 * Export template to PDF with custom options
 * @param html - HTML content to export
 * @param options - Custom options for PDF generation
 */
export function exportToPDFWithOptions(
  html: string,
  options: {
    filename?: string;
    margin?: number;
    format?: string;
    orientation?: 'portrait' | 'landscape';
  } = {}
): void {
  const {
    filename = 'template.pdf',
    margin = 1,
    format = 'letter',
    orientation = 'portrait'
  } = options;

  html2pdf().from(html).set({
    margin,
    filename,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format, orientation },
  }).save();
}

/**
 * Generate PDF from HTML element
 * @param element - DOM element to convert to PDF
 * @param filename - Name of the PDF file to generate (default: 'template.pdf')
 */
export function exportElementToPDF(element: HTMLElement, filename = 'template.pdf'): void {
  html2pdf().from(element).set({
    filename,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }).save();
}
