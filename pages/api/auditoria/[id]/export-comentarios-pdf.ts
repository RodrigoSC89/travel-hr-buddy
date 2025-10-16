import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id: auditoriaId },
    method,
  } = req;

  if (typeof auditoriaId !== "string") {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Fetch audit details
    const { data: auditoria, error: auditoriaError } = await supabase
      .from("auditorias_imca")
      .select("id, title, description, audit_date, status, score")
      .eq("id", auditoriaId)
      .single();

    if (auditoriaError || !auditoria) {
      return res.status(404).json({ error: "Auditoria não encontrada." });
    }

    // Fetch comments
    const { data: comentarios, error: comentariosError } = await supabase
      .from("auditoria_comentarios")
      .select("id, comentario, created_at, user_id")
      .eq("auditoria_id", auditoriaId)
      .order("created_at", { ascending: true });

    if (comentariosError) {
      return res.status(500).json({ error: comentariosError.message });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Relatório de Comentários - Auditoria IMCA", pageWidth / 2, 20, { align: "center" });

    // Audit metadata
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // slate-600
    let yPos = 35;
    
    doc.text(`Título: ${auditoria.title || "N/A"}`, 14, yPos);
    yPos += 7;
    
    if (auditoria.description) {
      doc.text(`Descrição: ${auditoria.description}`, 14, yPos);
      yPos += 7;
    }
    
    if (auditoria.audit_date) {
      doc.text(`Data: ${new Date(auditoria.audit_date).toLocaleDateString("pt-BR")}`, 14, yPos);
      yPos += 7;
    }
    
    if (auditoria.status) {
      doc.text(`Status: ${auditoria.status}`, 14, yPos);
      yPos += 7;
    }
    
    if (auditoria.score !== null && auditoria.score !== undefined) {
      doc.text(`Pontuação: ${auditoria.score}/100`, 14, yPos);
      yPos += 7;
    }

    yPos += 5;

    // Comments table
    if (comentarios && comentarios.length > 0) {
      const tableData = comentarios.map((c) => {
        const isAI = c.user_id === "ia-auto-responder";
        
        return [
          new Date(c.created_at).toLocaleString("pt-BR"),
          isAI ? "IA Auditor IMCA" : "Usuário",
          c.comentario,
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [["Data/Hora", "Autor", "Comentário"]],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [15, 23, 42], // slate-900
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        didParseCell: (data) => {
          // Check if this is a comment cell with critical warning
          if (data.column.index === 2 && data.cell.text[0]?.startsWith("⚠️ Atenção:")) {
            data.cell.styles.fillColor = [254, 242, 242]; // red-50
            data.cell.styles.textColor = [127, 29, 29]; // red-900
          }
          // Style AI comments
          if (data.column.index === 1 && data.cell.text[0] === "IA Auditor IMCA") {
            data.cell.styles.textColor = [37, 99, 235]; // blue-600
            data.cell.styles.fontStyle = "bold";
          }
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
      });
    } else {
      doc.text("Nenhum comentário encontrado.", 14, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="auditoria-comentarios-${auditoriaId}-${new Date().toISOString().split("T")[0]}.pdf"`
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return res.status(500).json({ error: "Erro ao gerar PDF." });
  }
}
