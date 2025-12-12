/**
import { useState, useCallback } from "react";;
 * AI Predictive Panel - Análises Preditivas e Insights de IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface PredictiveInsight {
  id: string;
  type: "risk" | "pattern" | "recommendation" | "prediction";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  action?: string;
  data?: Record<string, unknown>;
}

interface AIPredictivePanelProps {
  insights: PredictiveInsight[];
  onGenerateInsights: () => Promise<void>;
  loading?: boolean;
}

export const AIPredictivePanel: React.FC<AIPredictivePanelProps> = ({
  insights,
  onGenerateInsights,
  loading
}) => {
  const [selectedTab, setSelectedTab] = useState("insights");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateInsights();
      toast.success("Análise preditiva gerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar análise");
    } finally {
      setGenerating(false);
    }
  };

  const riskInsights = insights.filter(i => i.type === "risk");
  const patternInsights = insights.filter(i => i.type === "pattern");
  const recommendations = insights.filter(i => i.type === "recommendation");
  const predictions = insights.filter(i => i.type === "prediction");

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "critical": return "text-red-400 bg-red-500/20 border-red-500/30";
    case "high": return "text-orange-400 bg-orange-500/20 border-orange-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    default: return "text-green-400 bg-green-500/20 border-green-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "risk": return <AlertTriangle className="h-5 w-5" />;
    case "pattern": return <BarChart3 className="h-5 w-5" />;
    case "recommendation": return <Lightbulb className="h-5 w-5" />;
    case "prediction": return <Target className="h-5 w-5" />;
    default: return <Brain className="h-5 w-5" />;
    }
  };

  // Mock predictive metrics
  const predictiveMetrics = {
    riskScore: 72,
    incidentProbability: 15,
    complianceForecast: 94,
    safetyTrend: "improving"
  };

  return (
    <div className="space-y-6">
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de Risco</p>
                <p className="text-2xl font-bold">{predictiveMetrics.riskScore}/100</p>
              </div>
            </div>
            <Progress value={100 - predictiveMetrics.riskScore} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prob. Incidente</p>
                <p className="text-2xl font-bold">{predictiveMetrics.incidentProbability}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Previsto</p>
                <p className="text-2xl font-bold">{predictiveMetrics.complianceForecast}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Próximo trimestre</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tendência</p>
                <p className="text-2xl font-bold capitalize">
                  {predictiveMetrics.safetyTrend === "improving" ? "↗ Melhoria" : "↘ Declínio"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerate} 
          disabled={generating || loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Gerar Nova Análise
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="h-4 w-4" />
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riscos ({riskInsights.length})
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Padrões ({patternInsights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendações ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum insight disponível</h3>
                  <p className="text-muted-foreground mb-4">
                    Clique em "Gerar Nova Análise" para obter insights preditivos da IA
                  </p>
                  <Button onClick={handleGenerate} disabled={generating}>
                    <Zap className="h-4 w-4 mr-2" />
                    Gerar Análise
                  </Button>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {insight.type === "risk" && "Risco"}
                            {insight.type === "pattern" && "Padrão"}
                            {insight.type === "recommendation" && "Recomendação"}
                            {insight.type === "prediction" && "Previsão"}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact === "critical" && "Crítico"}
                        {insight.impact === "high" && "Alto"}
                        {insight.impact === "medium" && "Médio"}
                        {insight.impact === "low" && "Baixo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confiança:</span>
                        <Progress value={insight.confidence} className="w-20 h-2" />
                        <span className="text-xs font-medium">{insight.confidence}%</span>
                      </div>
                      {insight.action && (
                        <Button size="sm" variant="ghost" className="gap-1">
                          {insight.action}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Análise de Riscos Preditiva
              </CardTitle>
              <CardDescription>
                Riscos identificados pela IA com base em padrões históricos e dados atuais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskInsights.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum risco crítico identificado
                </p>
              ) : (
                <div className="space-y-4">
                  {riskInsights.map((risk) => (
                    <div key={risk.id} className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{risk.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                        </div>
                        <Badge className={getImpactColor(risk.impact)}>
                          {risk.impact}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          Confiança: {risk.confidence}%
                        </span>
                        {risk.action && (
                          <Button size="sm" variant="destructive">
                            {risk.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Padrões Detectados
              </CardTitle>
              <CardDescription>
                Padrões identificados nos dados de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patternInsights.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum padrão significativo detectado
                </p>
              ) : (
                <div className="space-y-4">
                  {patternInsights.map((pattern) => (
                    <div key={pattern.id} className="p-4 rounded-lg border bg-card">
                      <h4 className="font-medium">{pattern.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                      <div className="mt-2">
                        <Progress value={pattern.confidence} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          Confiança: {pattern.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Recomendações da IA
              </CardTitle>
              <CardDescription>
                Ações sugeridas para melhorar a segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma recomendação disponível
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
