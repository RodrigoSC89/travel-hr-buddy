/**
 * PEOTRAM Report Generator - Complete ANP audit report generation
 * Generates PDF-ready reports with scores, NCs, evidence summary and action plans
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Loader2, Download, Copy, Sparkles, BarChart3,
  Shield, Target, AlertTriangle, CheckCircle, Clock, Printer
} from "lucide-react";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";
import { PEOTRAM_ELEMENTS, SCORE_CRITERIA } from "@/data/peotram-elements-data";

interface PeotramReportGeneratorProps {
  vesselName?: string;
  auditorName?: string;
  auditDate?: string;
  cycle?: string;
  elementScores?: Record<string, number>;
}

export function PeotramReportGenerator({ vesselName: propVessel, auditorName: propAuditor, auditDate: propDate, cycle: propCycle, elementScores }: PeotramReportGeneratorProps = {}) {
  const [vesselName, setVesselName] = useState(propVessel || "");
  const [auditorName, setAuditorName] = useState(propAuditor || "");
  const [auditDate, setAuditDate] = useState(propDate || new Date().toISOString().split("T")[0]);
  const [auditCycle, setAuditCycle] = useState(propCycle || "2025");
  const [reportContent, setReportContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateFullReport = useCallback(async () => {
    if (!vesselName || !auditorName) {
      toast.error("Preencha embarcação e auditor");
      return;
    }

    setIsGenerating(true);
    setReportContent("");
    setGenerationProgress(0);

    try {
      // Step 1: Fetch real data
      setGenerationProgress(10);
      const [auditsRes, ncsRes, actionsRes] = await Promise.all([
        fromUntyped("internal_audits").select("*").or("audit_type.ilike.%peotram%,scope.ilike.%peotram%").order("created_at", { ascending: false }).limit(20),
        fromUntyped("non_conformities").select("*").or("source.ilike.%peotram%,source.ilike.%anp%").order("created_at", { ascending: false }).limit(50),
        fromUntyped("action_items").select("*").ilike("source_module", "%peotram%").order("created_at", { ascending: false }).limit(30),
      ]);

      const audits = auditsRes.data || [];
      const ncs = ncsRes.data || [];
      const actions = actionsRes.data || [];
      setGenerationProgress(30);

      // Step 2: Generate AI executive summary
      const elementSummary = PEOTRAM_ELEMENTS.map(el => {
        const itemCount = el.subelements.reduce((a, s) => a + s.items.length, 0);
        return `- Elemento ${el.id} (${el.sigla}): ${el.name} [${itemCount} itens, peso ${el.weightPercentage}%${el.isCritical ? ", CRÍTICO" : ""}]`;
      }).join("\n");

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um redator técnico sênior especializado em relatórios PEOTRAM para Petrobras.
Gere um relatório de auditoria COMPLETO em markdown profissional.
Use tabelas markdown quando apropriado. Inclua todas as seções obrigatórias.
Formato ANP/Petrobras oficial. Linguagem técnica e objetiva.`
            },
            {
              role: "user",
              content: `Gere o RELATÓRIO COMPLETO de auditoria PEOTRAM com as seguintes informações:

**DADOS DA AUDITORIA:**
- Embarcação: ${vesselName}
- Auditor Líder: ${auditorName}
- Data: ${auditDate}
- Ciclo: ${auditCycle}

**13 ELEMENTOS:**
${elementSummary}

**DADOS DO SISTEMA:**
- ${audits.length} auditorias registradas (${audits.filter((a: any) => a.status === "completed").length} concluídas)
- ${ncs.length} não conformidades (${ncs.filter((nc: any) => nc.status === "open").length} abertas)
- ${actions.length} planos de ação (${actions.filter((a: any) => a.status !== "completed").length} pendentes)

**NCs ABERTAS:**
${ncs.filter((nc: any) => nc.status === "open").slice(0, 10).map((nc: any) => `- ${nc.title || nc.nc_number}: ${nc.description?.substring(0, 100) || "Sem descrição"}`).join("\n") || "Nenhuma NC aberta"}

**SEÇÕES OBRIGATÓRIAS DO RELATÓRIO:**
1. CAPA (Dados da auditoria, equipe, escopo)
2. SUMÁRIO EXECUTIVO (Resumo dos achados, nota geral estimada)
3. METODOLOGIA (Critérios de pontuação 0-4, classificação NC A-D)
4. ANÁLISE POR ELEMENTO (Para cada um dos 13 elementos: pontos fortes, oportunidades de melhoria, NCs encontradas)
5. RESUMO DE NÃO CONFORMIDADES (Tabela com todas NCs, classificação, prazo, status)
6. PLANO DE AÇÃO CONSOLIDADO (Ações corretivas e preventivas com responsáveis e prazos)
7. GRÁFICOS DE RADAR SUGERIDOS (Descrição textual de como o radar dos 13 elementos ficaria)
8. CONCLUSÃO E RECOMENDAÇÕES
9. PRÓXIMOS PASSOS

Gere todas as seções com conteúdo substantivo e relevante.`
            }
          ]
        }
      });

      setGenerationProgress(80);

      if (error) throw error;
      const content = data?.choices?.[0]?.message?.content || data?.response || "";
      setReportContent(content);
      setGenerationProgress(100);
      toast.success("Relatório PEOTRAM gerado com sucesso!");
    } catch (err) {
      logger.error("[ReportGenerator] Error", err);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  }, [vesselName, auditorName, auditDate, auditCycle]);

  const copyReport = () => {
    navigator.clipboard.writeText(reportContent);
    toast.success("Relatório copiado!");
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Relatório PEOTRAM - ${vesselName}</title>
        <style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;line-height:1.6}
        h1{color:#1a365d;border-bottom:3px solid #e53e3e;padding-bottom:10px}
        h2{color:#2d3748;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-top:30px}
        h3{color:#4a5568}table{width:100%;border-collapse:collapse;margin:15px 0}
        th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#f7fafc}
        </style></head><body>${reportContent.replace(/\n/g, "<br>")}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Gerador de Relatório PEOTRAM</h3>
          <p className="text-sm text-muted-foreground">
            Gera relatório completo de auditoria no formato ANP/Petrobras com dados reais do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Embarcação *</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" />
            </div>
            <div className="space-y-2">
              <Label>Auditor Líder *</Label>
              <Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Data da Auditoria</Label>
              <Input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ciclo</Label>
              <Input value={auditCycle} onChange={e => setAuditCycle(e.target.value)} placeholder="2025" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateFullReport} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Gerando Relatório..." : "Gerar Relatório Completo"}
            </Button>
            {reportContent && (
              <>
                <Button variant="outline" onClick={copyReport} className="gap-1">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
                <Button variant="outline" onClick={printReport} className="gap-1">
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
              </>
            )}
          </div>

          {isGenerating && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Gerando relatório...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2 [&>div]:bg-primary" />
            </div>
          )}

          {reportContent && (
            <Card className="border-primary/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Relatório PEOTRAM - {vesselName} - Ciclo {auditCycle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{reportContent}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PeotramReportGenerator;
