/**
import { useEffect, useState } from "react";;
 * PREDICTIVE RECOMMENDATIONS PANEL - PHASE 1
 * Painel de recomendações preditivas com IA
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Brain, AlertTriangle, TrendingUp, Wrench, GraduationCap,
  Shield, Fuel, Ship, ChevronRight, RefreshCw, Loader2,
  CheckCircle2, Clock, Target, Sparkles, BarChart3
} from "lucide-react";
import {
  generateFullPredictiveAnalysis,
  type PredictiveAnalysis,
  type PredictiveRecommendation
} from "@/lib/ai/predictive-engine";

const priorityColors = {
  critical: "bg-red-500/20 text-red-500 border-red-500/30",
  high: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  low: "bg-green-500/20 text-green-500 border-green-500/30"
};

const priorityLabels = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo"
};

const typeIcons = {
  maintenance: Wrench,
  training: GraduationCap,
  compliance: Shield,
  fuel: Fuel,
  route: Ship,
  crew: GraduationCap
};

const typeLabels = {
  maintenance: "Manutenção",
  training: "Treinamento",
  compliance: "Compliance",
  fuel: "Combustível",
  route: "Rota",
  crew: "Tripulação"
};

interface RecommendationCardProps {
  recommendation: PredictiveRecommendation;
  onAction?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[recommendation.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${priorityColors[recommendation.priority]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{recommendation.title}</h4>
              <Badge variant="outline" className={priorityColors[recommendation.priority]}>
                {priorityLabels[recommendation.priority]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {typeLabels[recommendation.type]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {recommendation.description}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Confiança: {recommendation.confidence}%
              </span>
              {recommendation.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Prazo: {new Date(recommendation.deadline).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Impacto
                      </h5>
                      <p className="text-sm">{recommendation.impact}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Ações Recomendadas
                      </h5>
                      <ul className="space-y-1">
                        {recommendation.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {recommendation.estimatedSavings && (
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          💰 Economia estimada: {recommendation.estimatedSavings}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </Button>
      </div>
    </motion.div>
  );
};

interface InsightGaugeProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: "improving" | "stable" | "declining";
}

const InsightGauge: React.FC<InsightGaugeProps> = ({ label, value, icon, trend }) => {
  const trendColors = {
    improving: "text-green-500",
    stable: "text-yellow-500",
    declining: "text-red-500"
  };
  
  const trendIcons = {
    improving: "↑",
    stable: "→",
    declining: "↓"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{value}%</span>
          {trend && (
            <span className={trendColors[trend]}>
              {trendIcons[trend]}
            </span>
          )}
        </div>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
};

export const PredictiveRecommendationsPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const result = await generateFullPredictiveAnalysis();
      setAnalysis(result);
    } catch (error) {
      console.error("Error loading predictive analysis:", error);
      toast.error("Erro ao carregar análise preditiva");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const filterRecommendations = (type: string) => {
    if (!analysis) return [];
    if (type === "all") return analysis.recommendations;
    return analysis.recommendations.filter(r => r.type === type);
  };

  const criticalCount = analysis?.recommendations.filter(r => r.priority === "critical").length || 0;
  const highCount = analysis?.recommendations.filter(r => r.priority === "high").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Recomendações Preditivas
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            </h2>
            <p className="text-muted-foreground">
              Análise proativa baseada em dados operacionais
            </p>
          </div>
        </div>
        
        <Button onClick={loadAnalysis} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={criticalCount > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                  <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                  <p className="text-3xl font-bold text-orange-500">{highCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saúde Geral</p>
                  <p className="text-3xl font-bold text-green-500">{analysis.insights.overallHealth}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recomendações</p>
                  <p className="text-3xl font-bold">{analysis.recommendations.length}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Panel */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indicadores de Saúde Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightGauge 
                label="Manutenção" 
                value={analysis.insights.maintenanceRisk}
                icon={<Wrench className="h-4 w-4 text-blue-500" />}
                trend={analysis.trends.maintenance}
              />
              <InsightGauge 
                label="Tripulação" 
                value={analysis.insights.crewReadiness}
                icon={<GraduationCap className="h-4 w-4 text-green-500" />}
                trend={analysis.trends.crew}
              />
              <InsightGauge 
                label="Compliance" 
                value={analysis.insights.complianceScore}
                icon={<Shield className="h-4 w-4 text-purple-500" />}
                trend={analysis.trends.compliance}
              />
              <InsightGauge 
                label="Eficiência de Combustível" 
                value={analysis.insights.fuelEfficiency}
                icon={<Fuel className="h-4 w-4 text-orange-500" />}
                trend={analysis.trends.costs}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recomendações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todas ({analysis?.recommendations.length || 0})
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                Manutenção
              </TabsTrigger>
              <TabsTrigger value="training">
                Treinamento
              </TabsTrigger>
              <TabsTrigger value="compliance">
                Compliance
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                  <p className="text-muted-foreground">Analisando dados operacionais...</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filterRecommendations(activeTab).length > 0 ? (
                    filterRecommendations(activeTab).map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                      <h3 className="font-semibold text-lg">Tudo em ordem!</h3>
                      <p className="text-muted-foreground">
                        Nenhuma recomendação pendente nesta categoria
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveRecommendationsPanel;
