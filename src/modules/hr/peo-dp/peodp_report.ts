/**
 * PEO-DP Report Generator
 * Gera relatório técnico PEO-DP em PDF (compatível com Petrobras)
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PEODPAuditoria } from "@/types/peodp-audit";
import { getScoreLevel } from "@/types/peodp-audit";

export class PEOReport {
  /**
   * Gera relatório PDF da auditoria PEO-DP
   */
  gerarRelatorio(auditoria: PEODPAuditoria, recomendacoes?: string[]): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE AUDITORIA PEO-DP", pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("NORMAM-101 + IMCA M 117", pageWidth / 2, yPosition, { align: "center" });
    
    yPosition += 15;
    
    // Vessel Info
    if (auditoria.vesselName || auditoria.dpClass) {
      doc.setFontSize(10);
      if (auditoria.vesselName) {
        doc.text(`Embarcação: ${auditoria.vesselName}`, 20, yPosition);
        yPosition += 6;
      }
      if (auditoria.dpClass) {
        doc.text(`Classe DP: ${auditoria.dpClass}`, 20, yPosition);
        yPosition += 6;
      }
      yPosition += 4;
    }

    // Date and Score
    doc.setFontSize(10);
    const dataFormatada = new Date(auditoria.data).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Data: ${dataFormatada}`, 20, yPosition);
    yPosition += 6;
    
    doc.setFont("helvetica", "bold");
    const scoreLevel = getScoreLevel(auditoria.score);
    doc.text(`Score de Conformidade: ${auditoria.score}% (${scoreLevel})`, 20, yPosition);
    yPosition += 6;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Normas Aplicadas: ${auditoria.normas.join(", ")}`, 20, yPosition);
    yPosition += 10;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Results Table
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resultados da Auditoria", 20, yPosition);
    yPosition += 8;

    const tableData = auditoria.resultado.map((item) => [
      item.item,
      item.descricao.length > 60 ? item.descricao.substring(0, 57) + "..." : item.descricao,
      item.cumprimento,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["ID", "Descrição", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 120 },
        2: { cellWidth: 30 },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const status = data.cell.raw as string;
          if (status === "OK") {
            data.cell.styles.textColor = [0, 128, 0];
            data.cell.styles.fontStyle = "bold";
          } else if (status === "Não Conforme") {
            data.cell.styles.textColor = [255, 0, 0];
            data.cell.styles.fontStyle = "bold";
          } else if (status === "Pendente") {
            data.cell.styles.textColor = [255, 165, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // Get final Y position after table
    yPosition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Recommendations
    if (recomendacoes && recomendacoes.length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Recomendações", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      for (const rec of recomendacoes) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const lines = doc.splitTextToSize(rec, pageWidth - 40);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5;
      }
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "Gerado por Nautilus One - Sistema PEO-DP Inteligente",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }

    return doc;
  }

  /**
   * Download do relatório em PDF
   */
  downloadRelatorio(auditoria: PEODPAuditoria, recomendacoes?: string[], filename?: string): void {
    const doc = this.gerarRelatorio(auditoria, recomendacoes);
    const defaultFilename = `PEO_DP_Auditoria_${auditoria.vesselName || "Report"}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(filename || defaultFilename);
  }

  /**
   * Gera preview base64 do PDF
   */
  gerarPreview(auditoria: PEODPAuditoria, recomendacoes?: string[]): string {
    const doc = this.gerarRelatorio(auditoria, recomendacoes);
    return doc.output("dataurlstring");
  }

  /**
   * Gera relatório em formato Markdown
   */
  gerarMarkdown(auditoria: PEODPAuditoria, recomendacoes?: string[]): string {
    const sections: string[] = [];

    // Header
    sections.push("# RELATÓRIO DE AUDITORIA PEO-DP");
    sections.push("\n## NORMAM-101 + IMCA M 117");
    
    if (auditoria.vesselName) {
      sections.push(`\n**Embarcação:** ${auditoria.vesselName}`);
    }
    if (auditoria.dpClass) {
      sections.push(`**Classe DP:** ${auditoria.dpClass}`);
    }
    
    const dataFormatada = new Date(auditoria.data).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    sections.push(`\n**Data:** ${dataFormatada}`);
    sections.push(`**Score de Conformidade:** ${auditoria.score}% (${getScoreLevel(auditoria.score)})`);
    sections.push(`**Normas Aplicadas:** ${auditoria.normas.join(", ")}`);

    // Results
    sections.push("\n## Resultados da Auditoria\n");
    for (const item of auditoria.resultado) {
      const icon = 
        item.cumprimento === "OK" ? "✅" :
          item.cumprimento === "Não Conforme" ? "❌" :
            item.cumprimento === "Pendente" ? "⏳" : "➖";
      
      sections.push(`### ${icon} ${item.item} - ${item.cumprimento}`);
      sections.push(item.descricao);
      if (item.observacoes) {
        sections.push(`*Observações:* ${item.observacoes}`);
      }
      sections.push("");
    }

    // Recommendations
    if (recomendacoes && recomendacoes.length > 0) {
      sections.push("\n## Recomendações\n");
      for (const rec of recomendacoes) {
        sections.push(`- ${rec}`);
      }
    }

    sections.push("\n---");
    sections.push("*Gerado por Nautilus One - Sistema PEO-DP Inteligente*");

    return sections.join("\n");
  }
}
