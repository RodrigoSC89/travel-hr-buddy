import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  BarChart3,
  FileText,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import type { Checklist, ChecklistItem, ChecklistAIAnalysis, Anomaly } from "./checklist-types";

interface AIAnalysisProps {
  checklist: Checklist;
  onAnalysisComplete?: (analysis: ChecklistAIAnalysis) => void;
}

export const AIAnalysisComponent: React.FC<AIAnalysisProps> = ({
  checklist,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ChecklistAIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const runAIAnalysis = async () => {
    try {
      setAnalyzing(true);
      setLoading(true);

      const response = await supabase.functions.invoke("checklist-ai-analysis", {
        body: {
          checklistId: checklist.id,
          checklistData: {
            title: checklist.title,
            type: checklist.type,
            items: checklist.items,
            vessel: checklist.vessel,
            status: checklist.status,
            complianceScore: checklist.complianceScore
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiAnalysis: ChecklistAIAnalysis = response.data.analysis;
      setAnalysis(aiAnalysis);
      onAnalysisComplete?.(aiAnalysis);

      // Save analysis to database
      const { error: dbError } = await (supabase.from as Function)("checklist_ai_analysis")
        .insert({
          checklist_id: checklist.id,
          overall_score: aiAnalysis.overallScore,
          analysis_type: "comprehensive",
          analysis_data: aiAnalysis as unknown as Record<string, unknown>,
          recommendations: aiAnalysis.suggestions,
          issues_found: aiAnalysis.anomalies.length,
          critical_issues: aiAnalysis.anomalies.filter((a: Anomaly) => a.severity === "critical").length,
          confidence_level: 0.85,
          inconsistencies: aiAnalysis.inconsistencies || [],
          missing_fields: aiAnalysis.missingItems || []
        });

      if (dbError) {
        logger.error("Failed to save AI analysis:", dbError);
      }

      toast.success("Análise AI concluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao executar análise de IA");
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "text-destructive bg-destructive/10 border-destructive/30";
    case "high": return "text-warning bg-warning/10 border-warning/30";
    case "medium": return "text-warning bg-warning/10 border-warning/30";
    case "low": return "text-info bg-info/10 border-info/30";
    default: return "text-muted-foreground bg-muted border-border";
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
    case "critical": return "text-destructive";
    case "high": return "text-warning";
    case "medium": return "text-warning";
    case "low": return "text-success";
    default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-foreground" />
            Análise AI do Checklist
          </CardTitle>
          <CardDescription>
            Análise inteligente baseada em machine learning para identificar anomalias e sugerir melhorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-6">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Análise AI Disponível</h3>
              <p className="text-muted-foreground mb-4">
                Execute uma análise inteligente para identificar padrões, anomalias e sugestões de melhoria
              </p>
              <Button onClick={runAIAnalysis} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Executar Análise AI
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysis.overallScore}%</div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analysis.anomalies.length}</div>
                <div className="text-sm text-muted-foreground">Anomalias</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysis.suggestions.length}</div>
                <div className="text-sm text-muted-foreground">Sugestões</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold ${getRiskLevelColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">Nível de Risco</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Anomalies */}
          {analysis.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Anomalias Detectadas
                </CardTitle>
                <CardDescription>
                  Inconsistências e desvios identificados pela análise AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.anomalies.map((anomaly) => (
                  <div key={`${anomaly.type}-${anomaly.severity}`} className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{anomaly.type.replace("_", " ").toUpperCase()}</h4>
                      <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{anomaly.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-success">
                        <Lightbulb className="w-4 h-4 inline mr-1" />
                        {anomaly.suggestion}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Confiança: {Math.round(anomaly.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Sugestões de Melhoria
              </CardTitle>
              <CardDescription>
                Recomendações baseadas em análise de padrões e melhores práticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion) => (
                  <div key={suggestion} className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <Lightbulb className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historical Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Comparação Histórica
              </CardTitle>
              <CardDescription>
                Análise comparativa com checklists similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-xl font-bold">{analysis.comparisonWithHistory.similarChecklists}</div>
                  <div className="text-sm text-muted-foreground">Checklists Similares</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-xl font-bold">{analysis.comparisonWithHistory.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Score Médio</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-xl font-bold ${
                    analysis.comparisonWithHistory.trendAnalysis === "improving" ? "text-success" :
                      analysis.comparisonWithHistory.trendAnalysis === "declining" ? "text-destructive" :
                        "text-warning"
                  }`}>
                    {analysis.comparisonWithHistory.trendAnalysis === "improving" ? "↗️" :
                      analysis.comparisonWithHistory.trendAnalysis === "declining" ? "↘️" : "→"}
                  </div>
                  <div className="text-sm text-muted-foreground">Tendência</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          {analysis.predictiveInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Insights Preditivos
                </CardTitle>
                <CardDescription>
                  Previsões e recomendações baseadas em análise preditiva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.predictiveInsights.map((insight) => (
                    <div key={insight} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <TrendingUp className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={runAIAnalysis} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Executar Nova Análise
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};