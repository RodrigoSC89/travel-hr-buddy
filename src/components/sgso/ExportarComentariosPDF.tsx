import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface Comentario {
  user_id: string;
  created_at: string;
  comentario: string;
}

interface ExportarComentariosPDFProps {
  comentarios: Comentario[];
}

export function ExportarComentariosPDF({ comentarios }: ExportarComentariosPDFProps) {
  const gerarPDF = () => {
    if (comentarios.length === 0) {
      return;
    }

    const container = document.createElement("div");
    container.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Comentários da Auditoria</h1>
          <p style="color: #666; margin-top: 10px; font-size: 14px;">
            Gerado em: ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
        
        <div style="margin-top: 20px;">
          ${comentarios
    .map(
      (c) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-left: 4px solid #2563eb; border-radius: 8px; background: #f9fafb; page-break-inside: avoid;">
              <div style="margin-bottom: 8px;">
                <strong style="color: #1f2937;">Usuário:</strong> 
                <span style="color: #4b5563;">${c.user_id}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #1f2937;">Data:</strong> 
                <span style="color: #4b5563;">${new Date(c.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <div style="margin-top: 12px;">
                <strong style="color: #1f2937;">Comentário:</strong>
                <div style="margin-top: 5px; color: #374151; line-height: 1.6;">
                  ${c.comentario}
                </div>
              </div>
            </div>
          `
    )
    .join("")}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>Total de comentários: ${comentarios.length}</p>
        </div>
      </div>
    `;

    html2pdf()
      .from(container)
      .set({
        margin: [10, 10, 10, 10],
        filename: "comentarios-auditoria.pdf",
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .save();
  };

  return (
    <Button
      onClick={gerarPDF}
      disabled={comentarios.length === 0}
      className="bg-slate-700 text-white hover:bg-slate-800"
      size="default"
    >
      <FileDown className="w-4 h-4 mr-2" />
      Exportar Comentários (PDF)
    </Button>
  );
}
