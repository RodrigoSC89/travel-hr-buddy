/**
 * ComplianceScoreBenchmark - Real-time Compliance Score + Industry Benchmarking
 * AI-powered scoring across all frameworks (ISM/ISPS/MLC/SOLAS/PEOTRAM)
 * with fleet and industry average comparison + trending analysis
 */
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import ReactMarkdown from "react-markdown";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, Brain, Loader2,
  Shield, Target, Award, Sparkles, Ship, Users, AlertTriangle,
  CheckCircle, ArrowUpRight, ArrowDownRight, Activity, Zap
} from "lucide-react";

export interface ComplianceScoreBenchmarkProps {
  moduleId: string;
  moduleName: string;
  frameworks?: string[];
}

interface FrameworkScore {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  change: number;
  items_total: number;
  items_compliant: number;
  last_audit: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

interface BenchmarkData {
  vessel_score: number;
  fleet_average: number;
  industry_average: number;
  percentile: number;
  frameworks: FrameworkScore[];
  ai_insights: string;
  improvement_priority: string[];
  estimated_days_to_95: number;
}

export function ComplianceScoreBenchmark({
  moduleId,
  moduleName,
  frameworks = ["ISM Code", "ISPS Code", "SOLAS", "MLC 2006", "MARPOL"],
}: ComplianceScoreBenchmarkProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch real-time compliance data
  const { data: complianceItems = [] } = useQuery({
    queryKey: ["benchmark-compliance", moduleId],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("id, status, regulation_reference, last_checked, created_at")
        .limit(200);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["benchmark-audits", moduleId],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("id, audit_type, status, findings_count, compliance_score, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ["benchmark-ncs", moduleId],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("id, status, severity, source, created_at")
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  // Calculate live scores
  const liveScore = useMemo(() => {
    const total = complianceItems.length || 1;
    const compliant = complianceItems.filter((i: any) => i.status === "compliant").length;
    return Math.round((compliant / total) * 100);
  }, [complianceItems]);

  const openNCs = ncs.filter((n: any) => n.status === "open").length;

  const runBenchmarkAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      setProgress(20);

      const sgiSummary = {
        compliance_items: complianceItems.length,
        compliant: complianceItems.filter((i: any) => i.status === "compliant").length,
        non_compliant: complianceItems.filter((i: any) => i.status === "non_compliant").length,
        audits_total: audits.length,
        audits_completed: audits.filter((a: any) => a.status === "completed").length,
        avg_audit_score: audits.filter((a: any) => a.compliance_score).reduce((acc: number, a: any) => acc + (a.compliance_score || 0), 0) / (audits.filter((a: any) => a.compliance_score).length || 1),
        open_ncs: openNCs,
        total_ncs: ncs.length,
        nc_by_severity: ncs.reduce((acc: Record<string, number>, n: any) => { acc[n.severity || "minor"] = (acc[n.severity || "minor"] || 0) + 1; return acc; }, {}),
        nc_by_source: ncs.reduce((acc: Record<string, number>, n: any) => { acc[n.source || "other"] = (acc[n.source || "other"] || 0) + 1; return acc; }, {}),
      };

      setProgress(50);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um analista de benchmarking marítimo. Analise os dados de compliance e gere scores por framework com benchmarking contra médias da indústria.

IMPORTANTE: Use dados reais da indústria marítima para benchmarking:
- Média da indústria PSC: detention rate ~3.5%, compliance ~88%
- OCIMF SIRE average: ~85%
- ISM average compliance: ~91%
- MLC average: ~89%

Responda em JSON:
{
  "vessel_score": 0-100 (baseado nos dados reais),
  "fleet_average": 0-100 (estimativa),
  "industry_average": 0-100 (média da indústria),
  "percentile": 0-100 (posição percentual),
  "frameworks": [
    {
      "name": "framework name",
      "score": 0-100,
      "trend": "up|down|stable",
      "change": número (variação % últimos 30d),
      "items_total": número,
      "items_compliant": número,
      "last_audit": "data ou N/A",
      "risk_level": "low|medium|high|critical"
    }
  ],
  "ai_insights": "análise executiva em markdown com insights e comparações",
  "improvement_priority": ["ação prioritária 1", "ação 2", "ação 3"],
  "estimated_days_to_95": número (dias estimados para atingir 95%)
}`,
            },
            {
              role: "user",
              content: `Analise o compliance do módulo ${moduleName} e gere benchmarking:

DADOS REAIS SGI:
${JSON.stringify(sgiSummary, null, 2)}

FRAMEWORKS A ANALISAR: ${frameworks.join(", ")}

Gere scores realistas baseados nos dados e compare com médias da indústria marítima.`,
            },
          ],
        },
      });

      if (error) throw error;

      setProgress(90);

      const text = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setBenchmarkData({
          vessel_score: parsed.vessel_score || liveScore,
          fleet_average: parsed.fleet_average || 85,
          industry_average: parsed.industry_average || 88,
          percentile: parsed.percentile || 75,
          frameworks: parsed.frameworks || [],
          ai_insights: parsed.ai_insights || "",
          improvement_priority: parsed.improvement_priority || [],
          estimated_days_to_95: parsed.estimated_days_to_95 || 30,
        });
      }

      setProgress(100);
      toast.success("Benchmarking concluído!");
    } catch (err) {
      logger.error("[ComplianceScoreBenchmark]", err);
      toast.error("Erro ao gerar benchmarking");
    } finally {
      setIsAnalyzing(false);
    }
  }, [complianceItems, audits, ncs, openNCs, liveScore, moduleName, frameworks]);

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-success/20 text-success";
      case "medium": return "bg-warning/20 text-warning";
      case "high": return "bg-destructive/20 text-destructive";
      case "critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-success/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Compliance Score & Benchmarking
              <Badge className="bg-primary/20 text-primary text-xs">IA + Dados Reais</Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Score em tempo real por framework com benchmarking contra média da indústria
            </p>
          </div>
        </div>
        <Button onClick={runBenchmarkAnalysis} disabled={isAnalyzing} className="gap-2">
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isAnalyzing ? "Analisando..." : "Executar Benchmarking"}
        </Button>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Score Atual (Live)</p>
            <p className={`text-4xl font-bold ${getScoreColor(liveScore)}`}>{liveScore}%</p>
            <p className="text-xs text-muted-foreground">{complianceItems.length} itens avaliados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> NCs Abertas</p>
            <p className="text-3xl font-bold text-destructive">{openNCs}</p>
            <p className="text-xs text-muted-foreground">{ncs.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /> Auditorias</p>
            <p className="text-3xl font-bold">{audits.length}</p>
            <p className="text-xs text-muted-foreground">{audits.filter((a: any) => a.status === "completed").length} concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Conformes</p>
            <p className="text-3xl font-bold text-success">{complianceItems.filter((i: any) => i.status === "compliant").length}</p>
            <p className="text-xs text-muted-foreground">de {complianceItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isAnalyzing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Calculando benchmarking com IA...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Benchmark Results */}
      {benchmarkData && (
        <>
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="pt-5 pb-4 text-center">
                <Ship className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-4xl font-bold text-primary">{benchmarkData.vessel_score}%</p>
                <p className="text-xs text-muted-foreground mt-1">Sua Embarcação</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-4xl font-bold">{benchmarkData.fleet_average}%</p>
                <p className="text-xs text-muted-foreground mt-1">Média da Frota</p>
                {benchmarkData.vessel_score > benchmarkData.fleet_average ? (
                  <Badge className="mt-1 bg-success/20 text-success text-xs">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +{benchmarkData.vessel_score - benchmarkData.fleet_average}%
                  </Badge>
                ) : (
                  <Badge className="mt-1 bg-destructive/20 text-destructive text-xs">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    {benchmarkData.vessel_score - benchmarkData.fleet_average}%
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <Activity className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-4xl font-bold">{benchmarkData.industry_average}%</p>
                <p className="text-xs text-muted-foreground mt-1">Média da Indústria</p>
              </CardContent>
            </Card>
            <Card className="border-warning/20">
              <CardContent className="pt-5 pb-4 text-center">
                <Award className="h-6 w-6 mx-auto text-warning mb-2" />
                <p className="text-4xl font-bold text-warning">Top {100 - benchmarkData.percentile}%</p>
                <p className="text-xs text-muted-foreground mt-1">Ranking Indústria</p>
                <p className="text-xs text-muted-foreground">~{benchmarkData.estimated_days_to_95}d para 95%</p>
              </CardContent>
            </Card>
          </div>

          {/* Framework Breakdown */}
          {benchmarkData.frameworks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Score por Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkData.frameworks.map((fw, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(fw.trend)}
                          <span className="font-medium text-sm">{fw.name}</span>
                          <Badge className={`text-xs ${getRiskColor(fw.risk_level)}`}>
                            {fw.risk_level === "low" ? "Baixo" : fw.risk_level === "medium" ? "Médio" : fw.risk_level === "high" ? "Alto" : "Crítico"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {fw.items_compliant}/{fw.items_total} itens
                          </span>
                          <span className={`text-lg font-bold ${getScoreColor(fw.score)}`}>{fw.score}%</span>
                          <span className={`text-xs ${fw.change >= 0 ? "text-success" : "text-destructive"}`}>
                            {fw.change >= 0 ? "+" : ""}{fw.change}%
                          </span>
                        </div>
                      </div>
                      <Progress value={fw.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights + Priority Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benchmarkData.ai_insights && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" /> Insights IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{benchmarkData.ai_insights}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {benchmarkData.improvement_priority.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" /> Prioridades de Melhoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benchmarkData.improvement_priority.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                        <Badge className="bg-warning text-warning-foreground shrink-0 mt-0.5">{i + 1}</Badge>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}