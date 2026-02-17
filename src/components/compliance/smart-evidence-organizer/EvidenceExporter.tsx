/**
 * Evidence Exporter - PDF report + organized data export
 */
import React, { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, FolderArchive } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EvidencePack, EvidenceElement, EvidenceItem, EvidenceMatch } from "./types";

interface Props {
  pack: EvidencePack;
  elements: EvidenceElement[];
  items: EvidenceItem[];
  matches: EvidenceMatch[];
}

export const EvidenceExporter = memo(({ pack, elements, items, matches }: Props) => {
  const [exporting, setExporting] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const exportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(10, 25, 47);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RELATÓRIO DE EVIDÊNCIAS DE AUDITORIA", pageWidth / 2, 16, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${pack.framework.toUpperCase()} — ${pack.title}`, pageWidth / 2, 25, { align: "center" });
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} | Score: ${pack.overall_score.toFixed(0)}%`, pageWidth / 2, 33, { align: "center" });

      // Summary
      doc.setTextColor(0);
      let y = 50;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. RESUMO EXECUTIVO", 14, y);
      y += 8;

      const summaryData = [
        ["Total de Elementos", String(pack.total_elements)],
        ["Total de Itens", String(pack.total_items)],
        ["Evidências Encontradas", String(pack.matched_items)],
        ["Evidências Parciais", String(pack.partial_items)],
        ["Evidências Não Encontradas", String(pack.unmatched_items)],
        ["Score de Conformidade", `${pack.overall_score.toFixed(1)}%`],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [10, 25, 47], fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 12;

      // Elements detail
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. DETALHAMENTO POR ELEMENTO", 14, y);
      y += 6;

      for (const el of elements.sort((a, b) => a.sort_order - b.sort_order)) {
        if (y > 260) { doc.addPage(); y = 20; }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${el.element_code || `E${el.element_number}`} — ${el.element_name} (${el.compliance_score.toFixed(0)}%)`, 14, y);
        y += 4;

        const elItems = items
          .filter(i => i.element_id === el.id)
          .sort((a, b) => a.sort_order - b.sort_order);

        const tableData = elItems.map(item => {
          const itemMatches = matches.filter(m => m.item_id === item.id);
          const docs = itemMatches.map(m => m.document_title).filter(Boolean).join(", ");
          return [
            item.item_number,
            item.item_text.substring(0, 80) + (item.item_text.length > 80 ? "..." : ""),
            item.evidence_status === "found" ? "✅" : item.evidence_status === "partial" ? "⚠️" : "❌",
            docs || (item.ai_suggestion ? `💡 ${item.ai_suggestion.substring(0, 60)}` : "—"),
          ];
        });

        if (tableData.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [["#", "Item", "Status", "Evidência / Sugestão"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [10, 25, 47], fontSize: 8 },
            styles: { fontSize: 7, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 12 },
              1: { cellWidth: 65 },
              2: { cellWidth: 12, halign: "center" },
              3: { cellWidth: "auto" },
            },
            margin: { left: 14, right: 14 },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }
      }

      // AI Responses section
      const itemsWithResponses = items.filter(i => i.ai_response);
      if (itemsWithResponses.length > 0) {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("3. RESPOSTAS PREPARADAS PARA AUDITORIA", 14, y);
        y += 8;

        for (const item of itemsWithResponses.slice(0, 30)) {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(`${item.item_number}: ${item.item_text.substring(0, 90)}`, 14, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(item.ai_response || "", pageWidth - 30);
          doc.text(lines.slice(0, 8), 16, y);
          y += Math.min(lines.length, 8) * 4 + 6;
        }
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(128);
        doc.text(`Nautilus One — ${pack.framework.toUpperCase()} Evidence Report — Pág. ${i}/${totalPages}`, pageWidth / 2, 290, { align: "center" });
      }

      doc.save(`evidencias-${pack.framework}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Erro ao exportar PDF");
    } finally {
      setExporting(false);
    }
  }, [pack, elements, items, matches]);

  const exportZIP = useCallback(async () => {
    setExportingZip(true);
    try {
      const zip = new JSZip();

      // Generate PDF and add to ZIP
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(10, 25, 47);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${pack.framework.toUpperCase()} — Evidence Report`, pageWidth / 2, 15, { align: "center" });
      doc.setFontSize(9);
      doc.text(`Score: ${pack.overall_score.toFixed(0)}% | ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, 24, { align: "center" });
      doc.setTextColor(0);
      let y = 40;

      for (const el of elements.sort((a, b) => a.sort_order - b.sort_order)) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${el.element_code || `E${el.element_number}`} — ${el.element_name} (${el.compliance_score.toFixed(0)}%)`, 14, y);
        y += 5;
        const elItems = items.filter(i => i.element_id === el.id).sort((a, b) => a.sort_order - b.sort_order);
        autoTable(doc, {
          startY: y,
          head: [["#", "Item", "Status", "Evidência"]],
          body: elItems.map(item => {
            const docs = matches.filter(m => m.item_id === item.id).map(m => m.document_title).filter(Boolean).join(", ");
            return [item.item_number, item.item_text.substring(0, 70), item.evidence_status === "found" ? "✅" : item.evidence_status === "partial" ? "⚠️" : "❌", docs || "—"];
          }),
          theme: "striped",
          headStyles: { fillColor: [10, 25, 47], fontSize: 7 },
          styles: { fontSize: 7, cellPadding: 2 },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 6;
      }

      zip.file("relatorio-evidencias.pdf", doc.output("blob"));

      // Create folders per element with evidence info
      for (const el of elements.sort((a, b) => a.sort_order - b.sort_order)) {
        const folderName = `${el.element_code || `E${el.element_number}`}_${el.element_name.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").substring(0, 30).trim()}`;
        const elItems = items.filter(i => i.element_id === el.id);
        const elMatches = matches.filter(m => elItems.some(i => i.id === m.item_id));

        // Create a summary text for each element
        let summary = `# ${el.element_code} — ${el.element_name}\n`;
        summary += `Score: ${el.compliance_score.toFixed(0)}%\n`;
        summary += `Encontradas: ${el.matched_count} | Parciais: ${el.partial_count} | Gaps: ${el.unmatched_count}\n\n`;

        for (const item of elItems) {
          const itemMatches = matches.filter(m => m.item_id === item.id);
          summary += `## ${item.item_number}: ${item.item_text}\n`;
          summary += `Status: ${item.evidence_status}\n`;
          if (itemMatches.length) {
            summary += `Evidências: ${itemMatches.map(m => m.document_title).join(", ")}\n`;
          }
          if (item.ai_response) {
            summary += `Resposta IA: ${item.ai_response}\n`;
          }
          summary += "\n";
        }

        zip.file(`${folderName}/resumo.md`, summary);

        // List linked documents
        if (elMatches.length) {
          const docList = elMatches.map(m => `- ${m.document_title} (confiança: ${m.match_confidence || "N/A"}%) — ${m.match_reason || ""}`).join("\n");
          zip.file(`${folderName}/documentos-vinculados.txt`, docList);
        }
      }

      // Global summary
      let globalSummary = `# Pacote de Evidências — ${pack.framework.toUpperCase()}\n`;
      globalSummary += `Título: ${pack.title}\n`;
      globalSummary += `Data: ${new Date(pack.created_at).toLocaleDateString("pt-BR")}\n`;
      globalSummary += `Score: ${pack.overall_score.toFixed(1)}%\n`;
      globalSummary += `Elementos: ${pack.total_elements} | Itens: ${pack.total_items}\n`;
      globalSummary += `Encontradas: ${pack.matched_items} | Parciais: ${pack.partial_items} | Gaps: ${pack.unmatched_items}\n`;
      zip.file("RESUMO-GERAL.md", globalSummary);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `evidencias-${pack.framework}-${new Date().toISOString().split("T")[0]}.zip`);
      toast.success("ZIP exportado com sucesso!");
    } catch (err) {
      console.error("ZIP export error:", err);
      toast.error("Erro ao exportar ZIP");
    } finally {
      setExportingZip(false);
    }
  }, [pack, elements, items, matches]);

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={exportPDF}
        disabled={exporting}
        className="gap-1"
      >
        {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportZIP}
        disabled={exportingZip}
        className="gap-1"
      >
        {exportingZip ? <Loader2 className="h-3 w-3 animate-spin" /> : <FolderArchive className="h-3 w-3" />}
        ZIP
      </Button>
    </div>
  );
});

EvidenceExporter.displayName = "EvidenceExporter";
