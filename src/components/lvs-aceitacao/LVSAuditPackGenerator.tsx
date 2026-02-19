/**
 * LVS Auto-Generate Audit Pack (PDF)
 * Gera pacote completo de auditoria em PDF profissional
 * Organizado por seção/ET, com capa, índice, status e evidências
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText, Download, Loader2, Ship, Calendar,
  CheckCircle2, XCircle, Clock, Settings, Eye,
  BookOpen, Shield, Printer, Package
} from "lucide-react";
import { ALL_LVS_SECTIONS, type LVItem, type Section } from "./lvs-data";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditPackConfig {
  vesselName: string;
  imoNumber: string;
  companyName: string;
  inspectorName: string;
  auditDate: string;
  includeCover: boolean;
  includeIndex: boolean;
  includeStatusSummary: boolean;
  includeSectionDetails: boolean;
  includeNCList: boolean;
  includeSignaturePage: boolean;
  selectedSections: string[];
}

const flattenItems = (section: Section): LVItem[] =>
  section.subsections.flatMap(sub => sub.items);

const STATUS_LABELS: Record<string, string> = {
  approved: "CONFORME",
  pending: "PENDENTE",
  rejected: "NÃO CONFORME",
  not_applicable: "N/A",
  not_verified: "NÃO VERIFICADO"
};

export const LVSAuditPackGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [config, setConfig] = useState<AuditPackConfig>({
    vesselName: "",
    imoNumber: "",
    companyName: "",
    inspectorName: "",
    auditDate: new Date().toISOString().split("T")[0],
    includeCover: true,
    includeIndex: true,
    includeStatusSummary: true,
    includeSectionDetails: true,
    includeNCList: true,
    includeSignaturePage: true,
    selectedSections: ALL_LVS_SECTIONS.map(s => s.code)
  });

  const stats = useMemo(() => {
    let total = 0, approved = 0, rejected = 0, pending = 0, na = 0, notVerified = 0;
    ALL_LVS_SECTIONS.forEach(section => {
      if (!config.selectedSections.includes(section.code)) return;
      const items = flattenItems(section);
      items.forEach((item: LVItem) => {
        total++;
        if (item.status === "approved") approved++;
        else if (item.status === "rejected") rejected++;
        else if (item.status === "pending") pending++;
        else if (item.status === "not_applicable") na++;
        else notVerified++;
      });
    });
    const applicable = total - na;
    const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;
    return { total, approved, rejected, pending, na, notVerified, score };
  }, [config.selectedSections]);

  const toggleSection = (code: string) => {
    setConfig(prev => ({
      ...prev,
      selectedSections: prev.selectedSections.includes(code)
        ? prev.selectedSections.filter(c => c !== code)
        : [...prev.selectedSections, code]
    }));
  };

  const generatePDF = async () => {
    if (!config.vesselName) {
      toast.error("Preencha o nome da embarcação");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;
      let pageNum = 1;

      const addHeader = () => {
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("CONFIDENCIAL — LVS Aceitação RSV Petrobras", margin, 8);
        doc.text(`Pág. ${pageNum}`, pageWidth - margin, 8, { align: "right" });
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 10, pageWidth - margin, 10);
      };

      const addFooter = () => {
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} — Nautilus One Maritime Platform`, margin, pageHeight - 5);
        doc.text(`${config.vesselName} | IMO ${config.imoNumber}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      };

      const checkPageBreak = (neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - 20) {
          addFooter();
          doc.addPage();
          pageNum++;
          addHeader();
          currentY = 15;
        }
      };

      // === COVER PAGE ===
      if (config.includeCover) {
        setGenerationProgress(5);
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.text("AUDIT PACK", pageWidth / 2, 60, { align: "center" });
        doc.setFontSize(14);
        doc.text("LVS Aceitação RSV — Petrobras", pageWidth / 2, 75, { align: "center" });

        doc.setFontSize(10);
        doc.text("ET-3000.00-1500-91C-PLL-017", pageWidth / 2, 90, { align: "center" });

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(40, 110, pageWidth - 80, 70, 3, 3, "F");
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(11);
        const infoY = 125;
        doc.text(`Embarcação: ${config.vesselName}`, 50, infoY);
        doc.text(`IMO: ${config.imoNumber || "N/A"}`, 50, infoY + 10);
        doc.text(`Empresa: ${config.companyName || "N/A"}`, 50, infoY + 20);
        doc.text(`Inspetor: ${config.inspectorName || "N/A"}`, 50, infoY + 30);
        doc.text(`Data: ${config.auditDate}`, 50, infoY + 40);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.text(`${stats.score}%`, pageWidth / 2, 215, { align: "center" });
        doc.setFontSize(10);
        doc.text("COMPLIANCE SCORE", pageWidth / 2, 225, { align: "center" });

        doc.setFontSize(9);
        doc.text(`${stats.approved} Conformes | ${stats.rejected} NCs | ${stats.pending + stats.notVerified} Pendentes | ${stats.na} N/A`, pageWidth / 2, 240, { align: "center" });

        doc.setFontSize(7);
        doc.text("DOCUMENTO CONFIDENCIAL — Nautilus One Maritime Platform", pageWidth / 2, pageHeight - 15, { align: "center" });

        doc.addPage();
        pageNum++;
      }

      // === INDEX ===
      if (config.includeIndex) {
        setGenerationProgress(15);
        addHeader();
        currentY = 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("ÍNDICE", margin, currentY);
        currentY += 12;

        const selectedSections = ALL_LVS_SECTIONS.filter(s => config.selectedSections.includes(s.code));
        doc.setFontSize(9);
        selectedSections.forEach((section, idx) => {
          const items = flattenItems(section);
          const conformeCount = items.filter((i: LVItem) => i.status === "approved").length;
          doc.setTextColor(60, 60, 60);
          doc.text(`${idx + 1}. Seção ${section.code} — ${section.title}`, margin, currentY);
          doc.text(`${conformeCount}/${items.length}`, pageWidth - margin, currentY, { align: "right" });
          currentY += 6;
        });

        addFooter();
        doc.addPage();
        pageNum++;
      }

      // === STATUS SUMMARY ===
      if (config.includeStatusSummary) {
        setGenerationProgress(25);
        addHeader();
        currentY = 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("RESUMO DE STATUS", margin, currentY);
        currentY += 10;

        autoTable(doc, {
          startY: currentY,
          head: [["Seção", "Título", "Total", "Conforme", "NC", "Pendente", "N/A", "Score"]],
          body: ALL_LVS_SECTIONS
            .filter(s => config.selectedSections.includes(s.code))
            .map(section => {
              const items = flattenItems(section);
              const app = items.filter((i: LVItem) => i.status === "approved").length;
              const nc = items.filter((i: LVItem) => i.status === "rejected").length;
              const pend = items.filter((i: LVItem) => i.status === "pending" || i.status === "not_verified").length;
              const na = items.filter((i: LVItem) => i.status === "not_applicable").length;
              const applicable = items.length - na;
              const score = applicable > 0 ? Math.round((app / applicable) * 100) : 100;
              return [section.code, section.title, items.length.toString(), app.toString(), nc.toString(), pend.toString(), na.toString(), `${score}%`];
            }),
          theme: "grid",
          headStyles: { fillColor: [0, 51, 102], fontSize: 7 },
          bodyStyles: { fontSize: 7 },
          columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 55 } },
          margin: { left: margin, right: margin }
        });

        addFooter();
        doc.addPage();
        pageNum++;
      }

      // === SECTION DETAILS ===
      if (config.includeSectionDetails) {
        const selectedSections = ALL_LVS_SECTIONS.filter(s => config.selectedSections.includes(s.code));
        const totalSections = selectedSections.length;

        for (let sIdx = 0; sIdx < totalSections; sIdx++) {
          const section = selectedSections[sIdx];
          setGenerationProgress(30 + Math.round((sIdx / totalSections) * 50));

          addHeader();
          currentY = 20;
          doc.setTextColor(0, 51, 102);
          doc.setFontSize(14);
          doc.text(`Seção ${section.code} — ${section.title}`, margin, currentY);
          currentY += 5;
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`ET: ${section.etRef}`, margin, currentY);
          currentY += 8;

          const items = flattenItems(section);
          autoTable(doc, {
            startY: currentY,
            head: [["Ref", "Item de Verificação", "Metodologia", "Status", "Observações"]],
            body: items.map((item: LVItem) => [
              item.ref,
              item.question.substring(0, 80),
              item.methodology.substring(0, 30),
              STATUS_LABELS[item.status] || item.status,
              item.observations || item.pendency || "-"
            ]),
            theme: "striped",
            headStyles: { fillColor: [0, 51, 102], fontSize: 6.5 },
            bodyStyles: { fontSize: 6 },
            columnStyles: {
              0: { cellWidth: 14 },
              1: { cellWidth: 60 },
              2: { cellWidth: 25 },
              3: { cellWidth: 22 },
              4: { cellWidth: 40 }
            },
            margin: { left: margin, right: margin },
            didParseCell: (data) => {
              if (data.column.index === 3 && data.section === "body") {
                const val = data.cell.raw as string;
                if (val === "NÃO CONFORME") {
                  data.cell.styles.textColor = [200, 0, 0];
                  data.cell.styles.fontStyle = "bold";
                } else if (val === "CONFORME") {
                  data.cell.styles.textColor = [0, 128, 0];
                }
              }
            }
          });

          addFooter();
          if (sIdx < totalSections - 1) {
            doc.addPage();
            pageNum++;
          }
        }
      }

      // === NC LIST ===
      if (config.includeNCList) {
        setGenerationProgress(85);
        doc.addPage();
        pageNum++;
        addHeader();
        currentY = 20;
        doc.setTextColor(200, 0, 0);
        doc.setFontSize(16);
        doc.text("NÃO CONFORMIDADES", margin, currentY);
        currentY += 10;

        const allNCs: string[][] = [];
        ALL_LVS_SECTIONS
          .filter(s => config.selectedSections.includes(s.code))
          .forEach(section => {
            flattenItems(section).forEach((item: LVItem) => {
              if (item.status === "rejected") {
                allNCs.push([
                  item.ref,
                  `S${section.code}`,
                  item.question.substring(0, 70),
                  item.pendency || "Sem pendência registrada",
                  item.deadline || "-"
                ]);
              }
            });
          });

        if (allNCs.length > 0) {
          autoTable(doc, {
            startY: currentY,
            head: [["Ref", "Seção", "Item", "Pendência", "Prazo"]],
            body: allNCs,
            theme: "grid",
            headStyles: { fillColor: [200, 0, 0], fontSize: 7 },
            bodyStyles: { fontSize: 6.5 },
            margin: { left: margin, right: margin }
          });
        } else {
          doc.setTextColor(0, 128, 0);
          doc.setFontSize(12);
          doc.text("Nenhuma não-conformidade registrada.", margin, currentY + 10);
        }
        addFooter();
      }

      // === SIGNATURE PAGE ===
      if (config.includeSignaturePage) {
        setGenerationProgress(95);
        doc.addPage();
        pageNum++;
        addHeader();
        currentY = 30;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("FOLHA DE ASSINATURAS", pageWidth / 2, currentY, { align: "center" });
        currentY += 20;

        const signatories = [
          { role: "Inspetor Petrobras", name: config.inspectorName || "_______________" },
          { role: "Comandante da Embarcação", name: "_______________" },
          { role: "Representante do Armador", name: "_______________" },
          { role: "Superintendente DPC", name: "_______________" }
        ];

        signatories.forEach(sig => {
          doc.setFontSize(10);
          doc.text(sig.role, margin + 10, currentY);
          doc.setFontSize(9);
          doc.text(`Nome: ${sig.name}`, margin + 10, currentY + 8);
          doc.line(margin + 10, currentY + 20, pageWidth / 2 - 10, currentY + 20);
          doc.setFontSize(7);
          doc.text("Assinatura", margin + 10, currentY + 24);
          doc.text("Data: ____/____/________", pageWidth / 2 - 10, currentY + 24, { align: "right" });
          currentY += 40;
        });

        addFooter();
      }

      setGenerationProgress(100);

      const fileName = `AuditPack_LVS_${config.vesselName.replace(/\s+/g, "_")}_${config.auditDate}.pdf`;
      doc.save(fileName);
      toast.success(`Audit Pack gerado: ${fileName}`, { description: `${pageNum} páginas • ${stats.total} itens analisados` });

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o Audit Pack PDF");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Config Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Configuração do Audit Pack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome da Embarcação *</Label>
                <Input value={config.vesselName} onChange={e => setConfig(p => ({ ...p, vesselName: e.target.value }))} placeholder="Ex: RSV Nautilus Explorer" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">IMO Number</Label>
                <Input value={config.imoNumber} onChange={e => setConfig(p => ({ ...p, imoNumber: e.target.value }))} placeholder="Ex: 9876543" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Empresa / Armador</Label>
                <Input value={config.companyName} onChange={e => setConfig(p => ({ ...p, companyName: e.target.value }))} placeholder="Ex: Deep Ocean Ltd" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Inspetor Petrobras</Label>
                <Input value={config.inspectorName} onChange={e => setConfig(p => ({ ...p, inspectorName: e.target.value }))} placeholder="Nome do inspetor" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Data da Auditoria</Label>
                <Input type="date" value={config.auditDate} onChange={e => setConfig(p => ({ ...p, auditDate: e.target.value }))} className="h-8 text-xs" />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold mb-2 block">Conteúdo do Pacote</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: "includeCover", label: "Capa Profissional", icon: BookOpen },
                  { key: "includeIndex", label: "Índice", icon: FileText },
                  { key: "includeStatusSummary", label: "Resumo de Status", icon: Eye },
                  { key: "includeSectionDetails", label: "Detalhes por Seção", icon: Shield },
                  { key: "includeNCList", label: "Lista de NCs", icon: XCircle },
                  { key: "includeSignaturePage", label: "Folha de Assinaturas", icon: Printer }
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 cursor-pointer text-xs">
                    <Checkbox
                      checked={config[opt.key as keyof AuditPackConfig] as boolean}
                      onCheckedChange={(checked) => setConfig(p => ({ ...p, [opt.key]: !!checked }))}
                    />
                    <opt.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Preview do Pacote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-black text-primary">{stats.score}%</div>
              <div className="text-xs text-muted-foreground mt-1">Compliance Score</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background/60 rounded p-2 text-center">
                <div className="font-bold text-emerald-500">{stats.approved}</div>
                <div className="text-muted-foreground">Conformes</div>
              </div>
              <div className="bg-background/60 rounded p-2 text-center">
                <div className="font-bold text-destructive">{stats.rejected}</div>
                <div className="text-muted-foreground">NCs</div>
              </div>
              <div className="bg-background/60 rounded p-2 text-center">
                <div className="font-bold text-amber-500">{stats.pending + stats.notVerified}</div>
                <div className="text-muted-foreground">Pendentes</div>
              </div>
              <div className="bg-background/60 rounded p-2 text-center">
                <div className="font-bold text-muted-foreground">{stats.na}</div>
                <div className="text-muted-foreground">N/A</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <div>{config.selectedSections.length} seções selecionadas</div>
              <div>{stats.total} itens no pacote</div>
            </div>

            {isGenerating ? (
              <div className="space-y-2">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">{generationProgress}% — Gerando PDF...</p>
              </div>
            ) : (
              <Button onClick={generatePDF} className="w-full gap-2" size="sm">
                <Download className="h-4 w-4" />
                Gerar Audit Pack PDF
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            Seções Incluídas no Pacote
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {config.selectedSections.length}/{ALL_LVS_SECTIONS.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {ALL_LVS_SECTIONS.map(section => {
              const items = flattenItems(section);
              const approved = items.filter((i: LVItem) => i.status === "approved").length;
              const isSelected = config.selectedSections.includes(section.code);
              return (
                <label
                  key={section.code}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors text-xs ${
                    isSelected ? "border-primary/50 bg-primary/5" : "border-border/50 bg-muted/20 opacity-60"
                  }`}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSection(section.code)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">S{section.code} — {section.title}</div>
                    <div className="text-muted-foreground">{approved}/{items.length} itens conformes</div>
                  </div>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
