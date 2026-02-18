/**
 * AI Executive Insights Panel
 * Auto-generated insights based on real operational data
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  ChevronRight, Sparkles, RefreshCw, Shield, DollarSign, Users, Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InsightData {
  id: string;
  type: "positive" | "warning" | "critical" | "opportunity";
  category: string;
  title: string;
  description: string;
  impact: string;
  icon: React.ReactNode;
}

interface AIExecutiveInsightsProps {
  vesselCount: number;
  activeVessels: number;
  crewCount: number;
  activeCrew: number;
  pendingMaint: number;
  complianceScore: number;
  openNCs: number;
  totalExpenses: number;
  expiringCerts: number;
}

export function AIExecutiveInsights({
  vesselCount, activeVessels, crewCount, activeCrew,
  pendingMaint, complianceScore, openNCs, totalExpenses, expiringCerts
}: AIExecutiveInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const insights = useMemo<InsightData[]>(() => {
    const result: InsightData[] = [];

    // Fleet utilization
    const fleetUtil = vesselCount > 0 ? (activeVessels / vesselCount) * 100 : 0;
    if (fleetUtil < 80) {
      result.push({
        id: "fleet-util", type: "warning", category: "Frota",
        title: `Utilização da frota em ${Math.round(fleetUtil)}%`,
        description: `${vesselCount - activeVessels} embarcações inativas representam custo fixo sem receita.`,
        impact: `Potencial: +$${((vesselCount - activeVessels) * 15000).toLocaleString()}/mês`,
        icon: <TrendingDown className="h-4 w-4" />,
      });
    } else {
      result.push({
        id: "fleet-ok", type: "positive", category: "Frota",
        title: `Frota operando a ${Math.round(fleetUtil)}% de capacidade`,
        description: "Utilização acima do benchmark da indústria (75%).",
        impact: "Eficiência operacional superior",
        icon: <TrendingUp className="h-4 w-4" />,
      });
    }

    // Compliance
    if (complianceScore < 80) {
      result.push({
        id: "compliance-risk", type: "critical", category: "Compliance",
        title: `Score de compliance em ${complianceScore}% — risco elevado`,
        description: `${openNCs} não-conformidades abertas e ${expiringCerts} certificados vencendo.`,
        impact: "Risco: detenção por Port State Control",
        icon: <Shield className="h-4 w-4" />,
      });
    }

    // Maintenance
    if (pendingMaint > 5) {
      result.push({
        id: "maint-backlog", type: "warning", category: "Manutenção",
        title: `${pendingMaint} manutenções pendentes — backlog crescente`,
        description: "Backlog alto aumenta risco de falhas imprevistas e custos de reparo.",
        impact: `Economia estimada: $${(pendingMaint * 2500).toLocaleString()} em manutenção preventiva vs corretiva`,
        icon: <Wrench className="h-4 w-4" />,
      });
    }

    // Crew readiness
    const crewReady = crewCount > 0 ? (activeCrew / crewCount) * 100 : 0;
    if (crewReady < 90) {
      result.push({
        id: "crew-gap", type: "warning", category: "Tripulação",
        title: `${crewCount - activeCrew} tripulantes inativos — gaps de manning`,
        description: "Posições não preenchidas podem afetar operações e segurança.",
        impact: "Risco STCW: manning mínimo comprometido",
        icon: <Users className="h-4 w-4" />,
      });
    }

    // Cost optimization
    if (totalExpenses > 100000) {
      result.push({
        id: "cost-opt", type: "opportunity", category: "Financeiro",
        title: "Oportunidade de otimização de custos identificada",
        description: `OPEX de $${(totalExpenses / 1000).toFixed(0)}K. Análise de IA sugere potencial de redução.`,
        impact: `Potencial saving: $${Math.round(totalExpenses * 0.08).toLocaleString()} (8% via procurement otimizado)`,
        icon: <DollarSign className="h-4 w-4" />,
      });
    }

    return result;
  }, [vesselCount, activeVessels, crewCount, activeCrew, pendingMaint, complianceScore, openNCs, totalExpenses, expiringCerts]);

  const handleAIDeepAnalysis = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("nauti-ai", {
        body: {
          module: "general",
          action: "analyze",
          context: {
            fleet: { total: vesselCount, active: activeVessels },
            crew: { total: crewCount, active: activeCrew },
            maintenance: { pending: pendingMaint },
            compliance: { score: complianceScore, openNCs, expiringCerts },
            expenses: { total: totalExpenses },
          },
          prompt: "Gere um resumo executivo de 3 linhas com as principais recomendações de ação para o CEO."
        },
      });
      if (error) throw error;
      setAiInsight(data?.response || "Análise indisponível no momento.");
    } catch {
      toast.error("Erro ao gerar análise de IA");
      setAiInsight(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const typeStyles = {
    positive: "border-l-emerald-500 bg-emerald-500/5",
    warning: "border-l-amber-500 bg-amber-500/5",
    critical: "border-l-destructive bg-destructive/5",
    opportunity: "border-l-primary bg-primary/5",
  };

  const typeBadge = {
    positive: <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">OK</Badge>,
    warning: <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">Atenção</Badge>,
    critical: <Badge className="bg-destructive/10 text-destructive text-[10px]">Crítico</Badge>,
    opportunity: <Badge className="bg-primary/10 text-primary text-[10px]">Oportunidade</Badge>,
  };

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Executive Insights
            <Badge variant="outline" className="text-[10px] bg-primary/5">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              {insights.length} insights
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleAIDeepAnalysis}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
            Deep Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* AI Generated Insight */}
        <AnimatePresence>
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-3"
            >
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Análise IA</p>
                  <p className="text-xs text-foreground leading-relaxed">{aiInsight}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights List */}
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-lg border-l-2 ${typeStyles[insight.type]} cursor-default group hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0 opacity-70">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{insight.category}</span>
                  {typeBadge[insight.type]}
                </div>
                <p className="text-xs font-semibold">{insight.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insight.description}</p>
                <p className="text-[10px] text-primary font-medium mt-1 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {insight.impact}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Todos os indicadores estão saudáveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
