/**
 * Compliance Predictive AI - Reusable predictive analysis for compliance modules
 * Provides risk forecasting, trend analysis, and proactive recommendations
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Shield,
  Target, Loader2, RefreshCw, Sparkles, BarChart3,
  CheckCircle, Clock, Zap, FileCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface PredictionResult {
  id: string;
  category: string;
  risk_level: "low" | "medium" | "high" | "critical";
  probability: number;
  title: string;
  description: string;
  recommendations: string[];
  timeline: string;
  impact: string;
}

interface CompliancePredictiveAIProps {
  moduleId: string;
  moduleName: string;
  moduleContext: string;
  riskAreas?: { name: string; score: number; trend: "up" | "down" | "stable" }[];
}

export function CompliancePredictiveAI({
  moduleId,
  moduleName,
  moduleContext,
  riskAreas = [],
}: CompliancePredictiveAIProps) {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const defaultRiskAreas = riskAreas.length > 0 ? riskAreas : [
    { name: "Documentação", score: 92, trend: "up" as const },
    { name: "Treinamento", score: 78, trend: "down" as const },
    { name: "Equipamentos", score: 88, trend: "stable" as const },
    { name: "Procedimentos", score: 95, trend: "up" as const },
    { name: "Auditorias", score: 85, trend: "stable" as const },
  ];

  const runPredictiveAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um sistema de IA preditiva especializado em ${moduleName}. ${moduleContext}. 
Analise os dados e forneça previsões de risco, tendências e recomendações proativas.
Responda em JSON com a estrutura:
{
  "summary": "resumo da análise",
  "predictions": [
    {
      "category": "categoria",
      "risk_level": "low|medium|high|critical",
      "probability": 0-100,
      "title": "título da previsão",
      "description": "descrição detalhada",
      "recommendations": ["rec1", "rec2"],
      "timeline": "prazo estimado",
      "impact": "impacto potencial"
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Execute análise preditiva completa para ${moduleName}. Áreas de risco atuais: ${JSON.stringify(defaultRiskAreas)}. Identifique tendências, riscos emergentes e recomendações proativas.`,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data?.choices?.[0]?.message?.content || data?.response || "";

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAiSummary(parsed.summary || "Análise concluída com sucesso.");
          setPredictions(
            (parsed.predictions || []).map((p: any, i: number) => ({
              ...p,
              id: `pred-${Date.now()}-${i}`,
            }))
          );
        } else {
          setAiSummary(responseText);
        }
      } catch {
        setAiSummary(responseText);
      }

      setLastAnalysis(new Date());
      toast.success("Análise preditiva concluída");
    } catch (err) {
      logger.error(`[CompliancePredictiveAI:${moduleId}]`, err);
      toast.error("Erro na análise preditiva");
    } finally {
      setIsAnalyzing(false);
    }
  }, [moduleId, moduleName, moduleContext, defaultRiskAreas]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-warning/70 text-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-success" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">IA Preditiva - {moduleName}</h3>
            <p className="text-sm text-muted-foreground">
              Análise de riscos, tendências e recomendações proativas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastAnalysis && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {lastAnalysis.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Badge>
          )}
          <Button onClick={runPredictiveAnalysis} disabled={isAnalyzing} className="gap-2">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isAnalyzing ? "Analisando..." : "Executar Análise"}
          </Button>
        </div>
      </div>

      {/* Risk Areas Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {defaultRiskAreas.map((area, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3 px-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{area.name}</p>
                {getTrendIcon(area.trend)}
              </div>
              <p className="text-2xl font-bold">{area.score}%</p>
              <Progress
                value={area.score}
                className={`mt-2 h-1.5 ${
                  area.score >= 90 ? "[&>div]:bg-success" :
                  area.score >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                }`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Previsões e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {predictions.map(pred => (
                  <div key={pred.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          pred.risk_level === "critical" ? "text-destructive" :
                          pred.risk_level === "high" ? "text-warning" : "text-muted-foreground"
                        }`} />
                        <p className="font-semibold">{pred.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(pred.risk_level)}>
                          {pred.risk_level === "critical" ? "Crítico" :
                           pred.risk_level === "high" ? "Alto" :
                           pred.risk_level === "medium" ? "Médio" : "Baixo"}
                        </Badge>
                        <Badge variant="outline">{pred.probability}%</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{pred.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {pred.timeline}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {pred.impact}
                      </span>
                    </div>
                    {pred.recommendations?.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Recomendações:</p>
                          {pred.recommendations.map((rec, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!aiSummary && predictions.length === 0 && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Análise Preditiva Disponível</p>
            <p className="text-sm mt-1">
              Clique em "Executar Análise" para gerar previsões de risco e recomendações com IA
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CompliancePredictiveAI;
