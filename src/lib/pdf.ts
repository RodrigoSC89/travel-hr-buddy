import html2pdf from "html2pdf.js";
import { toast } from "sonner";

/**
 * Export text content to PDF
 * @param content - The text content to export
 * @param filename - The name of the PDF file (default: "document.pdf")
 */
export function exportToPDF(content: string, filename: string = "document.pdf") {
  try {
    toast.info("Gerando PDF...");
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Documento MMI</h1>
          <p style="color: #666; margin-top: 10px; font-size: 14px;">
            Gerado em: ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
        
        <div style="margin-top: 20px; line-height: 1.6; white-space: pre-wrap;">
          ${content}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Sistema de Gestão MMI - Travel HR Buddy</p>
        </div>
      </div>
    `;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
    };

    html2pdf()
      .from(htmlContent)
      .set(opt)
      .save()
      .then(() => {
        toast.success("PDF exportado com sucesso!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      });
  } catch (error) {
    console.error("Error in exportToPDF:", error);
    toast.error("Erro ao gerar PDF. Tente novamente.");
  }
}
