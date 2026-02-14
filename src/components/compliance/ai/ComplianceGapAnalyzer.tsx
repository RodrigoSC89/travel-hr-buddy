/**
 * ComplianceGapAnalyzer - AI-powered gap analysis that scans the entire SGI
 * Identifies compliance gaps BEFORE auditors find them
 * Cross-references ISM, ISPS, PEOTRAM, SOLAS, MARPOL, STCW, MLC
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, AlertTriangle, CheckCircle, Shield, Brain, Loader2,
  Target, TrendingDown, TrendingUp, FileCheck, Zap, BarChart3,
  Clock, ArrowRight, XCircle, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface GapItem {
  id: string;
  area: string;
  regulation: string;
  requirement: string;
  current_status: "compliant" | "partial" | "non_compliant" | "unknown";
  severity: "critical" | "major" | "minor" | "observation";
  evidence_found: boolean;
  gap_description: string;
  recommended_action: string;
  deadline: string;
  effort_hours: number;
}

interface GapAnalysisResult {
  overall_score: number;
  total_requirements: number;
  compliant: number;
  partial: number;
  non_compliant: number;
  unknown: number;
  critical_gaps: number;
  gaps: GapItem[];
  executive_summary: string;
  priority_actions: string[];
  cross_references: Array<{ from: string; to: string; overlap: string }>;
}

interface ComplianceGapAnalyzerProps {
  moduleId: string;
  moduleName: string;
  standards?: string[];
}

export function ComplianceGapAnalyzer({
  moduleId,
  moduleName,
  standards = ["ISM Code", "ISPS Code", "SOLAS", "MARPOL", "STCW", "MLC 2006"],
}: ComplianceGapAnalyzerProps) {
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
  const [selectedGap, setSelectedGap] = useState<GapItem | null>(null);

  const runGapAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Step 1: Collect data from multiple SGI sources
      setPhase("Coletando dados do SGI...");
      setProgress(10);

      const [
        { data: complianceItems },
        { data: audits },
        { data: ncs },
        { data: certifications },
        { data: inspections },
        { data: corrections },
      ] = await Promise.all([
        (supabase.from as Function)("compliance_items").select("*").limit(100),
        (supabase.from as Function)("internal_audits").select("*").order("created_at", { ascending: false }).limit(30),
        (supabase.from as Function)("non_conformities").select("*").order("created_at", { ascending: false }).limit(50),
        (supabase.from as Function)("crew_certifications").select("*").limit(50),
        (supabase.from as Function)("psc_inspections").select("*").order("created_at", { ascending: false }).limit(20),
        (supabase.from as Function)("corrective_actions").select("*").order("created_at", { ascending: false }).limit(30),
      ]);

      setPhase("Analisando conformidade com IA...");
      setProgress(50);

      const sgiSummary = {
        compliance_items: (complianceItems || []).length,
        compliant_items: (complianceItems || []).filter((i: any) => i.status === "compliant").length,
        open_ncs: (ncs || []).filter((n: any) => n.status === "open").length,
        total_ncs: (ncs || []).length,
        expired_certs: (certifications || []).filter((c: any) => c.expiry_date && new Date(c.expiry_date) < new Date()).length,
        total_certs: (certifications || []).length,
        completed_audits: (audits || []).filter((a: any) => a.status === "completed").length,
        pending_corrections: (corrections || []).filter((c: any) => c.status !== "completed").length,
        psc_deficiencies: (inspections || []).reduce((a: number, i: any) => a + (i.deficiencies_count || 0), 0),
        recent_audit_findings: (audits || []).slice(0, 5).map((a: any) => ({
          type: a.audit_type,
          findings: a.findings_count,
          date: a.scheduled_date,
        })),
        nc_by_source: (ncs || []).reduce((acc: Record<string, number>, n: any) => {
          acc[n.source || "other"] = (acc[n.source || "other"] || 0) + 1;
          return acc;
        }, {}),
      };

      // Step 2: AI analysis
      setPhase("Gerando análise de lacunas...");
      setProgress(75);

      const standardFilter = selectedStandard === "all"
        ? standards.join(", ")
        : selectedStandard;

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um auditor líder certificado em ${standardFilter}. Analise os dados do SGI e identifique TODAS as lacunas de conformidade.

Responda em JSON:
{
  "overall_score": 0-100,
  "total_requirements": número,
  "compliant": número,
  "partial": número,
  "non_compliant": número,
  "unknown": número,
  "critical_gaps": número,
  "executive_summary": "resumo executivo em markdown",
  "gaps": [
    {
      "id": "GAP-001",
      "area": "área afetada",
      "regulation": "norma (ex: ISM 6.2)",
      "requirement": "requisito específico",
      "current_status": "compliant|partial|non_compliant|unknown",
      "severity": "critical|major|minor|observation",
      "evidence_found": true/false,
      "gap_description": "descrição da lacuna",
      "recommended_action": "ação recomendada",
      "deadline": "prazo sugerido",
      "effort_hours": número estimado de horas
    }
  ],
  "priority_actions": ["ação prioritária 1", "..."],
  "cross_references": [{"from": "ISM 6", "to": "STCW A-I/2", "overlap": "descrição da sobreposição"}]
}`,
            },
            {
              role: "user",
              content: `Execute análise de lacunas completa para: ${standardFilter}

DADOS REAIS DO SGI:
${JSON.stringify(sgiSummary, null, 2)}

Identifique gaps, severidades, ações corretivas e referências cruzadas entre normas.`,
            },
          ],
        },
      });

      if (error) throw error;

      setPhase("Processando resultados...");
      setProgress(90);

      const responseText = data?.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResult({
            overall_score: parsed.overall_score || 0,
            total_requirements: parsed.total_requirements || 0,
            compliant: parsed.compliant || 0,
            partial: parsed.partial || 0,
            non_compliant: parsed.non_compliant || 0,
            unknown: parsed.unknown || 0,
            critical_gaps: parsed.critical_gaps || 0,
            gaps: parsed.gaps || [],
            executive_summary: parsed.executive_summary || "",
            priority_actions: parsed.priority_actions || [],
            cross_references: parsed.cross_references || [],
          });
        }
      } catch {
        setResult({
          overall_score: 0, total_requirements: 0, compliant: 0, partial: 0,
          non_compliant: 0, unknown: 0, critical_gaps: 0, gaps: [],
          executive_summary: responseText, priority_actions: [], cross_references: [],
        });
      }

      setProgress(100);
      toast.success("Análise de lacunas concluída!");
    } catch (err) {
      logger.error("[ComplianceGapAnalyzer]", err);
      toast.error("Erro na análise de lacunas");
    } finally {
      setIsAnalyzing(false);
      setPhase("");
    }
  }, [selectedStandard, standards, moduleName]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "major": return "bg-warning text-warning-foreground";
      case "minor": return "bg-warning/60";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-4 w-4 text-success" />;
      case "partial": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "non_compliant": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-destructive/20 to-warning/10">
            <Search className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Gap Analysis Inteligente
              <Badge className="bg-destructive/20 text-destructive text-xs">IA Preditiva</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Identifica lacunas de conformidade antes que o auditor encontre
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedStandard} onValueChange={setSelectedStandard}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Normas</SelectItem>
              {standards.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runGapAnalysis} disabled={isAnalyzing} className="gap-2">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isAnalyzing ? "Analisando..." : "Executar Análise"}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isAnalyzing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{phase}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Score Geral</p>
                <p className="text-3xl font-bold text-primary">{result.overall_score}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Requisitos</p>
                <p className="text-2xl font-bold">{result.total_requirements}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Conformes</p>
                <p className="text-2xl font-bold text-success">{result.compliant}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-warning" /> Parciais</p>
                <p className="text-2xl font-bold text-warning">{result.partial}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Não Conformes</p>
                <p className="text-2xl font-bold text-destructive">{result.non_compliant}</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Gaps Críticos</p>
                <p className="text-2xl font-bold text-destructive">{result.critical_gaps}</p>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          {result.executive_summary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{result.executive_summary}</ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority Actions */}
          {result.priority_actions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" /> Ações Prioritárias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.priority_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-warning/5 border border-warning/10">
                      <Badge className="bg-warning text-warning-foreground shrink-0 mt-0.5">{i + 1}</Badge>
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gaps List */}
          {result.gaps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Lacunas Identificadas ({result.gaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {result.gaps.map((gap, i) => (
                      <div
                        key={gap.id || i}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedGap(selectedGap?.id === gap.id ? null : gap)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(gap.current_status)}
                            <span className="font-medium text-sm">{gap.area}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{gap.regulation}</Badge>
                            <Badge className={`text-xs ${getSeverityColor(gap.severity)}`}>
                              {gap.severity === "critical" ? "Crítico" :
                               gap.severity === "major" ? "Maior" :
                               gap.severity === "minor" ? "Menor" : "Obs"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{gap.requirement}</p>
                        
                        {selectedGap?.id === gap.id && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <p className="text-sm"><strong>Lacuna:</strong> {gap.gap_description}</p>
                            <p className="text-sm"><strong>Ação Recomendada:</strong> {gap.recommended_action}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {gap.deadline}</span>
                              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> ~{gap.effort_hours}h esforço</span>
                              <span className="flex items-center gap-1">
                                {gap.evidence_found ? (
                                  <><CheckCircle className="h-3 w-3 text-success" /> Evidência encontrada</>
                                ) : (
                                  <><XCircle className="h-3 w-3 text-destructive" /> Sem evidência</>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Cross References */}
          {result.cross_references.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Referências Cruzadas entre Normas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.cross_references.map((ref, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Badge variant="outline">{ref.from}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{ref.to}</Badge>
                      <span className="text-sm text-muted-foreground flex-1">{ref.overlap}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Gap Analysis Pronta para Executar</p>
            <p className="text-sm mt-1 mb-4">
              A IA analisará todo o SGI e identificará lacunas de conformidade
            </p>
            <Button onClick={runGapAnalysis} className="gap-2">
              <Zap className="h-4 w-4" /> Iniciar Análise
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ComplianceGapAnalyzer;
