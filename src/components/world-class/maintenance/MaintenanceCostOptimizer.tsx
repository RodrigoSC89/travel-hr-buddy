/**
 * Maintenance Cost Optimizer - M049
 * Budget forecasting, preventive vs corrective cost analysis, ROI
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, DollarSign, TrendingUp, TrendingDown, BarChart3,
  RefreshCw, Sparkles, PiggyBank, ArrowUpRight, Target,
  Layers, AlertTriangle,
} from "lucide-react";
import { maintenanceIntelligence } from "@/services/maintenance";
import { useMaintenanceStats } from "@/hooks/useSmartMaintenanceData";
import { toast } from "sonner";

interface CostBreakdown {
  category: string;
  amount_usd: number;
  percentage?: number;
  trend?: "up" | "down" | "stable";
}

export function MaintenanceCostOptimizer() {
  const stats = useMaintenanceStats();
  const [aiResult, setAiResult] = useState<{
    cost_analysis?: {
      preventive_budget_usd?: number;
      corrective_budget_usd?: number;
      potential_savings_usd?: number;
      roi_percentage?: number;
      cost_breakdown?: CostBreakdown[];
    };
    summary?: string;
    overall_health?: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runCostAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await maintenanceIntelligence.runOptimization("cost_optimization");
      setAiResult(result);
      toast.success("Análise de custos concluída");
    } catch (err) {
      toast.error("Erro na análise de custos");
    } finally {
      setAnalyzing(false);
    }
  };

  const trendIcon = (t?: string) => {
    if (t === "up") return <TrendingUp className="h-3 w-3 text-red-400" />;
    if (t === "down") return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    return null;
  };

  const costAnalysis = aiResult?.cost_analysis;

  return (
    <div className="space-y-4">
      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.criticalTasks}</p>
              <p className="text-xs text-muted-foreground">Tarefas Críticas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overdueCount}</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgHealthScore}%</p>
              <p className="text-xs text-muted-foreground">Saúde Média</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <PiggyBank className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${costAnalysis?.potential_savings_usd?.toLocaleString() || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Economia Potencial</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Otimizador de Custos de Manutenção</p>
              <p className="text-sm text-muted-foreground">
                AI analisa custos preventivos vs corretivos, ROI e oportunidades de economia
              </p>
            </div>
          </div>
          <Button onClick={runCostAnalysis} disabled={analyzing} className="gap-2">
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analisando..." : "Analisar Custos"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {costAnalysis && (
        <>
          {/* Budget Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                <p className="text-2xl font-bold">${(costAnalysis.preventive_budget_usd || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Orçamento Preventivo</p>
                <Badge variant="outline" className="mt-2 text-emerald-500">Recomendado</Badge>
              </CardContent>
            </Card>
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">${(costAnalysis.corrective_budget_usd || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Custo Corretivo</p>
                <Badge variant="outline" className="mt-2 text-red-500">Evitar</Badge>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <ArrowUpRight className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{costAnalysis.roi_percentage || 0}%</p>
                <p className="text-sm text-muted-foreground">ROI de Manutenção</p>
                <Badge variant="outline" className="mt-2 text-primary">Meta: 300%+</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          {costAnalysis.cost_breakdown && costAnalysis.cost_breakdown.length > 0 && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Breakdown de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costAnalysis.cost_breakdown.map((item, idx) => {
                    const totalBudget = (costAnalysis.preventive_budget_usd || 0) + (costAnalysis.corrective_budget_usd || 0);
                    const percentage = item.percentage || (totalBudget > 0 ? Math.round((item.amount_usd / totalBudget) * 100) : 0);

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-32 text-sm text-muted-foreground truncate">{item.category}</span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="flex items-center gap-2 w-36 justify-end">
                          {trendIcon(item.trend)}
                          <span className="text-sm font-medium">${item.amount_usd.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {aiResult?.summary && (
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Resumo da Análise AI</p>
                    <p className="text-sm text-muted-foreground">{aiResult.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
