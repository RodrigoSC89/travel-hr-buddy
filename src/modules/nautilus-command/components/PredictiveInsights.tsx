/**
import { useEffect, useState } from "react";;
 * Predictive Insights - Insights e previsões da IA
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Lightbulb, Target, BarChart3, Clock, ArrowRight, Brain
} from "lucide-react";

interface SystemStatus {
  fleet: { vessels: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

interface PredictiveInsightsProps {
  systemStatus: SystemStatus;
}

interface Insight {
  id: string;
  type: "prediction" | "recommendation" | "risk" | "opportunity";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action?: string;
  module: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ systemStatus }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [systemStatus]);

  const generateInsights = () => {
    setLoading(true);
    
    // Generate insights based on system status
    const generatedInsights: Insight[] = [];

    // Maintenance predictions
    if (systemStatus.maintenance.overdue > 0) {
      generatedInsights.push({
        id: "1",
        type: "risk",
        priority: "high",
        title: "Risco de Falha Operacional",
        description: `${systemStatus.maintenance.overdue} manutenções vencidas podem causar paradas não programadas.`,
        impact: "Potencial perda de R$ 50.000/dia por embarcação parada",
        confidence: 92,
        action: "Agendar manutenções urgentes",
        module: "Manutenção"
      });
    }

    // Crew certificate predictions
    if (systemStatus.crew.expiringCerts > 0) {
      generatedInsights.push({
        id: "2",
        type: "prediction",
        priority: "medium",
        title: "Certificações Expirando",
        description: `${systemStatus.crew.expiringCerts} certificados expiram nos próximos 30 dias.`,
        impact: "Risco de não-conformidade regulatória",
        confidence: 100,
        action: "Iniciar processo de renovação",
        module: "Tripulação"
      });
    }

    // Inventory optimization
    if (systemStatus.inventory.lowStock > 0) {
      generatedInsights.push({
        id: "3",
        type: "recommendation",
        priority: "medium",
        title: "Otimização de Estoque",
        description: `Previsão de ruptura em ${systemStatus.inventory.lowStock} itens críticos nas próximas 2 semanas.`,
        impact: "Economia potencial de 15% com compras antecipadas",
        confidence: 87,
        action: "Gerar ordens de compra automáticas",
        module: "Estoque"
      });
    }

    // Efficiency opportunity
    if (systemStatus.maintenance.efficiency < 95) {
      generatedInsights.push({
        id: "4",
        type: "opportunity",
        priority: "low",
        title: "Oportunidade de Melhoria",
        description: "Análise sugere otimização no cronograma de manutenção preventiva.",
        impact: "Aumento de 5% na eficiência operacional",
        confidence: 78,
        action: "Revisar cronograma com IA",
        module: "Manutenção"
      });
    }

    // Fleet utilization
    if (systemStatus.fleet.active < systemStatus.fleet.vessels * 0.8) {
      generatedInsights.push({
        id: "5",
        type: "recommendation",
        priority: "medium",
        title: "Utilização da Frota",
        description: "Taxa de utilização abaixo do ideal. Considere redistribuição de rotas.",
        impact: "Aumento potencial de 12% na receita",
        confidence: 85,
        action: "Analisar rotas alternativas",
        module: "Frota"
      });
    }

    // Compliance score
    if (systemStatus.compliance.score >= 95) {
      generatedInsights.push({
        id: "6",
        type: "opportunity",
        priority: "low",
        title: "Excelência em Compliance",
        description: "Score de compliance acima de 95%. Elegível para certificação premium.",
        impact: "Redução de 20% em prêmios de seguro",
        confidence: 95,
        action: "Solicitar certificação",
        module: "Compliance"
      });
    }

    setInsights(generatedInsights);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "prediction": return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case "recommendation": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    case "risk": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "opportunity": return <Target className="h-4 w-4 text-green-500" />;
    default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
    case "prediction": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Previsão</Badge>;
    case "recommendation": return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Recomendação</Badge>;
    case "risk": return <Badge variant="destructive">Risco</Badge>;
    case "opportunity": return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Oportunidade</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "border-l-red-500";
    case "medium": return "border-l-yellow-500";
    default: return "border-l-green-500";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-3 text-purple-500 animate-pulse" />
              <p className="text-muted-foreground">Nautilus Brain está analisando os dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Insights Preditivos
              </CardTitle>
              <CardDescription>
                Análises e previsões geradas pelo Nautilus Brain
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Brain className="h-3 w-3" />
              {insights.length} Insights
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p className="text-muted-foreground">Nenhum insight no momento</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sistema operando em condições ideais
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${getPriorityColor(insight.priority)} hover:shadow-md transition-all`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(insight.type)}
                          {getTypeBadge(insight.type)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.module}
                        </Badge>
                      </div>

                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>

                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Impacto Estimado</p>
                        <p className="text-sm font-medium">{insight.impact}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confiança:</span>
                          <Progress value={insight.confidence} className="w-16 h-1.5" />
                          <span className="text-xs font-medium">{insight.confidence}%</span>
                        </div>
                        {insight.action && (
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            {insight.action} <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
