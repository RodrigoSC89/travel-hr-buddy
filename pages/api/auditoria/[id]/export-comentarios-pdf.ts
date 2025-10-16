import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    // Get auditoria details
    const { data: auditoria, error: auditoriaError } = await supabase
      .from("auditorias_imca")
      .select("title, description, audit_date, score, status")
      .eq("id", auditoriaId)
      .single();

    if (auditoriaError || !auditoria) {
      return res.status(404).json({ error: "Auditoria não encontrada." });
    }

    // Get comments
    const { data: comentarios, error: comentariosError } = await supabase
      .from("auditoria_comentarios")
      .select("id, comentario, created_at, user_id")
      .eq("auditoria_id", auditoriaId)
      .order("created_at", { ascending: true });

    if (comentariosError) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar comentários: " + comentariosError.message });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Auditoria IMCA", margin, yPosition);
    yPosition += 12;

    // Add auditoria details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.setFont("helvetica", "bold");
    doc.text("Título:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(auditoria.title || "-", margin + 30, yPosition);
    yPosition += 7;

    if (auditoria.description) {
      doc.setFont("helvetica", "bold");
      doc.text("Descrição:", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      const splitDescription = doc.splitTextToSize(
        auditoria.description,
        pageWidth - 2 * margin
      );
      doc.text(splitDescription, margin, yPosition);
      yPosition += splitDescription.length * 5 + 5;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Data da Auditoria:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(
      auditoria.audit_date
        ? format(new Date(auditoria.audit_date), "dd/MM/yyyy")
        : "-",
      margin + 50,
      yPosition
    );
    yPosition += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Status:", margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(auditoria.status || "-", margin + 30, yPosition);
    yPosition += 7;

    if (auditoria.score !== null && auditoria.score !== undefined) {
      doc.setFont("helvetica", "bold");
      doc.text("Pontuação:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${auditoria.score}/100`, margin + 30, yPosition);
      yPosition += 7;
    }

    yPosition += 5;

    // Add comments section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comentários e Análises Técnicas", margin, yPosition);
    yPosition += 10;

    if (comentarios && comentarios.length > 0) {
      // Prepare table data
      const tableData = comentarios.map((c) => [
        format(new Date(c.created_at), "dd/MM/yyyy HH:mm"),
        c.user_id === "ia-auto-responder" ? "IA IMCA" : "Usuário",
        c.comentario,
      ]);

      // Add table with autoTable
      autoTable(doc, {
        head: [["Data/Hora", "Autor", "Comentário"]],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [15, 23, 42], // slate-900
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: "auto" },
        },
        didParseCell: (data) => {
          // Highlight AI comments
          if (data.section === "body" && data.column.index === 1) {
            if (data.cell.raw === "IA IMCA") {
              data.cell.styles.textColor = [37, 99, 235]; // blue-600
              data.cell.styles.fontStyle = "bold";
            }
          }
          // Highlight critical warnings
          if (
            data.section === "body" &&
            data.column.index === 2 &&
            typeof data.cell.raw === "string" &&
            data.cell.raw.startsWith("⚠️")
          ) {
            data.cell.styles.fillColor = [254, 242, 242]; // red-50
            data.cell.styles.textColor = [127, 29, 29]; // red-900
          }
        },
      });

      // Get final Y position after table
      const docWithTable = doc as jsPDF & {
        lastAutoTable?: { finalY: number };
      };
      const finalY = docWithTable.lastAutoTable?.finalY || yPosition;
      yPosition = finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Nenhum comentário registrado.", margin, yPosition);
    }

    // Add footer with generation date
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128);
    doc.text(
      `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      margin,
      pageHeight - 10
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="auditoria-comentarios-${auditoriaId}-${format(new Date(), "yyyyMMdd")}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ error: "Erro ao gerar PDF dos comentários." });
  }
}
