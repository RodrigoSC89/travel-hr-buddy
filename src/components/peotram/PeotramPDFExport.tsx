/**
 * PEOTRAM PDF Export - Real jsPDF export with radar data
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS, SCORE_CRITERIA } from "@/data/peotram-elements-data";
import type { ItemAuditState } from "@/hooks/usePeotramAudit";

interface PeotramPDFExportProps {
  vesselName: string;
  auditorName: string;
  auditDate: string;
  cycle: string;
  elementScores: Record<string, number>;
  itemStates: Record<string, ItemAuditState>;
  overallScore: number;
}

export function PeotramPDFExport({
  vesselName, auditorName, auditDate, cycle, elementScores, itemStates, overallScore,
}: PeotramPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // ===== COVER =====
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("RELATÓRIO DE AUDITORIA PEOTRAM", pageWidth / 2, 25, { align: "center" });
      doc.setFontSize(12);
      doc.text("Programa de Excelência Operacional no Transporte Marítimo", pageWidth / 2, 35, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Ciclo ${cycle}`, pageWidth / 2, 48, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      let y = 75;
      const info = [
        ["Embarcação:", vesselName],
        ["Auditor Líder:", auditorName],
        ["Data da Auditoria:", auditDate],
        ["Score Geral:", `${overallScore}%`],
      ];
      for (const [label, value] of info) {
        doc.setFont("helvetica", "bold");
        doc.text(label, 25, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, 70, y);
        y += 8;
      }

      // ===== ELEMENT SCORES TABLE =====
      y += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Pontuação por Elemento", 15, y);
      y += 5;

      const elementRows = PEOTRAM_ELEMENTS.map(el => {
        const score = elementScores[String(el.id)] || 0;
        const items = el.subelements.flatMap(s => s.items);
        const scored = items.filter(i => itemStates[i.id]?.score !== "NA" && itemStates[i.id]?.score !== undefined).length;
        const ncs = items.filter(i => {
          const s = itemStates[i.id];
          return s && typeof s.score === "number" && s.score <= 2 && s.ncClassification;
        }).length;

        return [
          String(el.id),
          el.sigla,
          el.name,
          `${el.weightPercentage}%`,
          `${scored}/${items.length}`,
          `${score}%`,
          String(ncs),
          el.isCritical ? "SIM" : "",
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [["#", "Sigla", "Elemento", "Peso", "Avaliados", "Score", "NCs", "Crítico"]],
        body: elementRows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 12 },
          2: { cellWidth: 55 },
          3: { cellWidth: 14 },
          4: { cellWidth: 18 },
          5: { cellWidth: 14 },
          6: { cellWidth: 10 },
          7: { cellWidth: 14 },
        },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 5) {
            const val = parseInt(data.cell.text[0]);
            if (val >= 90) data.cell.styles.textColor = [22, 163, 74];
            else if (val >= 60) data.cell.styles.textColor = [202, 138, 4];
            else data.cell.styles.textColor = [220, 38, 38];
          }
          if (data.section === "body" && data.column.index === 7 && data.cell.text[0] === "SIM") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // ===== NCs DETAIL PAGE =====
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Não Conformidades Identificadas", 15, 20);

      const ncRows: string[][] = [];
      for (const el of PEOTRAM_ELEMENTS) {
        for (const sub of el.subelements) {
          for (const item of sub.items) {
            const state = itemStates[item.id];
            if (state && typeof state.score === "number" && state.score <= 2 && state.ncClassification) {
              ncRows.push([
                item.id,
                String(state.score),
                state.ncClassification,
                item.description.substring(0, 80) + "...",
                state.observations.substring(0, 60) || "-",
              ]);
            }
          }
        }
      }

      if (ncRows.length > 0) {
        autoTable(doc, {
          startY: 28,
          head: [["Item", "Nota", "NC", "Descrição", "Observação"]],
          body: ncRows,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [220, 38, 38], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 14 },
            1: { cellWidth: 10 },
            2: { cellWidth: 10 },
            3: { cellWidth: 90 },
            4: { cellWidth: 45 },
          },
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Nenhuma não conformidade identificada.", 15, 35);
      }

      // ===== FOOTER =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(128, 128, 128);
        doc.text(
          `PEOTRAM ${cycle} • ${vesselName} • Gerado em ${new Date().toLocaleString("pt-BR")} • Página ${i}/${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      doc.save(`PEOTRAM_${vesselName.replace(/\s+/g, "_")}_${cycle}_${auditDate}.pdf`);
      toast.success("PDF PEOTRAM exportado com sucesso!");
    } catch (err) {
      logger.error("[PeotramPDF] Export error", err);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={exportPDF} disabled={isExporting} variant="outline" className="gap-1.5">
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Exportar PDF
    </Button>
  );
}
