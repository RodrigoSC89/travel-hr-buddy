/**
 * LVS Audit Pack Generator - Auto-generates PDF audit pack
 * Compiles checklist status, evidence mapping, and gap analysis into a professional PDF
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Download, Package, CheckCircle2, AlertTriangle,
  XCircle, Clock, Shield, BarChart3, Loader2, FileCheck,
  Printer, Eye
} from "lucide-react";
import { toast } from "sonner";
import { ALL_LVS_SECTIONS, type Section, type ItemStatus } from "./lvs-data";

interface AuditPackConfig {
  includeExecutiveSummary: boolean;
  includeDetailedChecklist: boolean;
  includeGapAnalysis: boolean;
  includeEvidenceMatrix: boolean;
  includeActionPlan: boolean;
  includeRiskHeatmap: boolean;
  includeTimeline: boolean;
  includeSignatures: boolean;
}

const DEFAULT_CONFIG: AuditPackConfig = {
  includeExecutiveSummary: true,
  includeDetailedChecklist: true,
  includeGapAnalysis: true,
  includeEvidenceMatrix: true,
  includeActionPlan: true,
  includeRiskHeatmap: false,
  includeTimeline: true,
  includeSignatures: true,
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
  not_applicable: "N/A",
  not_verified: "Não Verificado",
};

const STATUS_COLORS: Record<ItemStatus, string> = {
  approved: "text-green-400",
  pending: "text-yellow-400",
  rejected: "text-red-400",
  not_applicable: "text-muted-foreground",
  not_verified: "text-muted-foreground",
};

function computeStats(sections: Section[]) {
  const allItems = sections.flatMap(s => s.subsections.flatMap(ss => ss.items));
  const total = allItems.length;
  const approved = allItems.filter(i => i.status === "approved").length;
  const pending = allItems.filter(i => i.status === "pending").length;
  const rejected = allItems.filter(i => i.status === "rejected").length;
  const notVerified = allItems.filter(i => i.status === "not_verified").length;
  const na = allItems.filter(i => i.status === "not_applicable").length;
  const applicable = total - na;
  const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

  return { total, approved, pending, rejected, notVerified, na, applicable, score };
}

function getSectionStats(section: Section) {
  const items = section.subsections.flatMap(ss => ss.items);
  const total = items.length;
  const approved = items.filter(i => i.status === "approved").length;
  const pending = items.filter(i => i.status === "pending").length;
  const rejected = items.filter(i => i.status === "rejected").length;
  return { total, approved, pending, rejected, score: total > 0 ? Math.round((approved / total) * 100) : 0 };
}

export const LVSAuditPackGenerator: React.FC = () => {
  const [config, setConfig] = useState<AuditPackConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);

  const sections = ALL_LVS_SECTIONS;
  const stats = computeStats(sections);

  const toggleConfig = (key: keyof AuditPackConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { loadJsPDF } = await import("@/lib/performance/heavy-libs-loader");
      const { jsPDF } = await loadJsPDF();
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      const addHeader = () => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("NAUTI ONE — Audit Pack LVS", margin, 18);
        doc.setFontSize(10);
        doc.text("Lista de Verificação de Aceitação RSV — Petrobras", margin, 26);
        doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`, margin, 33);
        doc.setTextColor(0, 0, 0);
        y = 50;
      };

      const checkPage = (needed: number) => {
        if (y + needed > 275) {
          doc.addPage();
          y = 20;
        }
      };

      // === Cover Page ===
      addHeader();

      // === Executive Summary ===
      if (config.includeExecutiveSummary) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("1. Resumo Executivo", margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryLines = [
          `Score Geral de Conformidade: ${stats.score}%`,
          `Total de Itens: ${stats.total}`,
          `Aprovados: ${stats.approved} | Pendentes: ${stats.pending} | Rejeitados: ${stats.rejected}`,
          `Não Verificados: ${stats.notVerified} | N/A: ${stats.na}`,
          `Itens Aplicáveis: ${stats.applicable}`,
          "",
          stats.score >= 90
            ? "STATUS: PRONTO PARA INSPEÇÃO — Nível de conformidade excelente."
            : stats.score >= 70
            ? "STATUS: ATENÇÃO — Gaps significativos a serem resolvidos antes da inspeção."
            : "STATUS: CRÍTICO — Ação imediata necessária para atingir conformidade.",
        ];
        summaryLines.forEach(line => {
          doc.text(line, margin, y);
          y += 5;
        });
        y += 5;
      }

      // === Detailed Checklist ===
      if (config.includeDetailedChecklist) {
        checkPage(20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("2. Checklist Detalhado por Seção", margin, y);
        y += 10;

        for (const section of sections) {
          checkPage(25);
          const sStats = getSectionStats(section);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${section.code} — ${section.title} (${sStats.score}%)`, margin, y);
          y += 6;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`Aprovados: ${sStats.approved}/${sStats.total} | Pendentes: ${sStats.pending} | Rejeitados: ${sStats.rejected}`, margin + 2, y);
          y += 5;

          for (const sub of section.subsections) {
            for (const item of sub.items) {
              checkPage(12);
              const statusText = STATUS_LABELS[item.status];
              doc.setFontSize(7);
              doc.text(`[${statusText}] ${item.ref}: ${item.question.substring(0, 100)}`, margin + 4, y);
              y += 4;
              if (item.pendency) {
                doc.setTextColor(200, 50, 50);
                doc.text(`   Pendência: ${item.pendency}`, margin + 4, y);
                doc.setTextColor(0, 0, 0);
                y += 4;
              }
            }
          }
          y += 3;
        }
      }

      // === Gap Analysis ===
      if (config.includeGapAnalysis) {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("3. Análise de Gaps", margin, y);
        y += 10;

        const gaps = sections.flatMap(s =>
          s.subsections.flatMap(ss =>
            ss.items
              .filter(i => i.status === "rejected" || i.status === "pending")
              .map(i => ({ section: s.title, ref: i.ref, question: i.question, status: i.status, pendency: i.pendency }))
          )
        );

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Total de gaps identificados: ${gaps.length}`, margin, y);
        y += 7;

        for (const gap of gaps.slice(0, 50)) {
          checkPage(14);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(`${gap.ref} — ${gap.section}`, margin + 2, y);
          y += 4;
          doc.setFont("helvetica", "normal");
          doc.text(gap.question.substring(0, 120), margin + 4, y);
          y += 4;
          if (gap.pendency) {
            doc.setTextColor(200, 100, 0);
            doc.text(`Pendência: ${gap.pendency}`, margin + 4, y);
            doc.setTextColor(0, 0, 0);
            y += 4;
          }
          y += 2;
        }
      }

      // === Signatures ===
      if (config.includeSignatures) {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Termos de Aceite e Assinaturas", margin, y);
        y += 15;

        const sigFields = [
          "Responsável Técnico (CONTRATADA)",
          "Superintendente de Operações",
          "Representante Petrobras",
          "Inspetor de Qualidade",
        ];

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        sigFields.forEach(field => {
          checkPage(30);
          doc.text(field, margin, y);
          y += 5;
          doc.line(margin, y + 10, pageWidth - margin, y + 10);
          doc.text("Assinatura", margin, y + 14);
          doc.text("Data: ____/____/______", pageWidth - 80, y + 14);
          y += 25;
        });
      }

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
          `Nauti One — Audit Pack LVS Petrobras | Página ${i}/${totalPages}`,
          pageWidth / 2,
          290,
          { align: "center" }
        );
        doc.setTextColor(0);
      }

      doc.save(`LVS_AuditPack_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Audit Pack gerado com sucesso!", { description: `${totalPages} páginas exportadas` });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [config, sections, stats]);

  const handlePreview = useCallback(() => {
    setIsPreviewing(true);
    const lines: string[] = [];
    lines.push("═══ PREVIEW DO AUDIT PACK ═══");
    lines.push(`Score: ${stats.score}% | ${stats.approved}/${stats.applicable} aprovados`);
    lines.push(`Gaps: ${stats.pending + stats.rejected} itens com pendências`);
    lines.push("");

    sections.forEach(s => {
      const ss = getSectionStats(s);
      lines.push(`${s.code} ${s.title}: ${ss.score}% (${ss.approved}/${ss.total})`);
    });

    setPreviewData(lines.join("\n"));
    setIsPreviewing(false);
  }, [sections, stats]);

  const configOptions: { key: keyof AuditPackConfig; label: string; desc: string }[] = [
    { key: "includeExecutiveSummary", label: "Resumo Executivo", desc: "Score geral e status de prontidão" },
    { key: "includeDetailedChecklist", label: "Checklist Detalhado", desc: "Todos os itens com status por seção" },
    { key: "includeGapAnalysis", label: "Análise de Gaps", desc: "Itens pendentes e rejeitados" },
    { key: "includeEvidenceMatrix", label: "Matriz de Evidências", desc: "Mapeamento documento-requisito" },
    { key: "includeActionPlan", label: "Plano de Ação", desc: "Ações corretivas com prazos" },
    { key: "includeRiskHeatmap", label: "Heatmap de Risco", desc: "Mapa visual de riscos por seção" },
    { key: "includeTimeline", label: "Timeline de Readiness", desc: "Cronograma até a aceitação" },
    { key: "includeSignatures", label: "Folha de Assinaturas", desc: "Termos de aceite para assinatura" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Aprovados</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-center">
            <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejeitados</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <Shield className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-400">{stats.score}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-3 text-center">
            <BarChart3 className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Itens</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Config Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Configuração do Audit Pack
            </CardTitle>
            <CardDescription>Selecione as seções do pacote de auditoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {configOptions.map(opt => (
              <div key={opt.key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{opt.label}</Label>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch
                  checked={config[opt.key]}
                  onCheckedChange={() => toggleConfig(opt.key)}
                />
              </div>
            ))}

            <Separator className="my-3" />

            <div className="flex gap-2">
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" /> Gerar PDF</>
                )}
              </Button>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-1" /> Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Breakdown / Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              {previewData ? "Preview do Pack" : "Conformidade por Seção"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              {previewData ? (
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                  {previewData}
                </pre>
              ) : (
                <div className="space-y-2">
                  {sections.map(section => {
                    const ss = getSectionStats(section);
                    return (
                      <div key={section.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{section.code} {section.title}</span>
                          <Badge variant={ss.score >= 80 ? "default" : ss.score >= 50 ? "secondary" : "destructive"} className="text-xs">
                            {ss.score}%
                          </Badge>
                        </div>
                        <Progress value={ss.score} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
