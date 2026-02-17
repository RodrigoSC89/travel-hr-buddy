/**
 * Compliance AI Recommendations
 * AI-powered insights and recommendations
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, CheckCircle, XCircle, Clock, Zap, RefreshCw } from "lucide-react";
import { useComplianceRecommendations, useComplianceRisks, useComplianceEvidences, useApplyRecommendation } from "../hooks/useComplianceData";
import { useAICompliance } from "../hooks/useAICompliance";

export default function ComplianceIARecommendations() {
  const { data: recommendations = [], isLoading } = useComplianceRecommendations();
  const { data: risks = [] } = useComplianceRisks();
  const { data: evidences = [] } = useComplianceEvidences();
  const { analyzeCompliance, isAnalyzing, lastAnalysis } = useAICompliance();
  const applyRecommendation = useApplyRecommendation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const appliedRecs = recommendations.filter((r) => r.status === "applied");

  const handleAnalyze = async () => {
    await analyzeCompliance({
      risks,
      evidences,
      context: "Análise geral de compliance da organização",
    });
  };

  const handleApply = async (id: string) => {
    await applyRecommendation.mutateAsync({ id, feedback });
    setSelectedId(null);
    setFeedback("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent" />
            IA de Compliance
          </h1>
          <p className="text-muted-foreground">
            Recomendações inteligentes baseadas em ISO 37301
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Nova Análise
            </>
          )}
        </Button>
      </div>

      {/* Analysis Result */}
      {lastAnalysis && (
        <Card className="bg-accent/10 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-foreground" />
              Última Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-background/50 p-4 rounded-lg">
                {lastAnalysis.analysis}
              </pre>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg px-4 py-1">
                Score: {lastAnalysis.riskScore}%
              </Badge>
              <span className="text-sm text-muted-foreground">
                {lastAnalysis.recommendations.length} novas recomendações geradas
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingRecs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aplicadas</p>
                <p className="text-2xl font-bold">{appliedRecs.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">
                  {recommendations.length > 0
                    ? Math.round(
                        (recommendations.reduce((acc, r) => acc + (r.confidence || 0), 0) /
                          recommendations.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <Brain className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Pendentes ({pendingRecs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : pendingRecs.length > 0 ? (
            <div className="space-y-4">
              {pendingRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.target_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Confiança: {Math.round((rec.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.recommendation}
                      </p>
                      {rec.reasoning && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          💡 {rec.reasoning}
                        </p>
                      )}
                      {rec.suggested_actions && rec.suggested_actions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Ações Sugeridas:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {rec.suggested_actions.map((action, idx) => (
                              <li key={action.action}>• {action.action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {selectedId === rec.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Feedback (opcional)"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-w-48"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApply(rec.id)}
                              disabled={applyRecommendation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setSelectedId(rec.id)}>
                          Aplicar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma recomendação pendente</p>
              <Button variant="outline" className="mt-4" onClick={handleAnalyze}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Análise
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applied Recommendations */}
      {appliedRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Recomendações Aplicadas ({appliedRecs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appliedRecs.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 border rounded-lg bg-success/10 border-success/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Aplicada em {new Date(rec.applied_at || "").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
