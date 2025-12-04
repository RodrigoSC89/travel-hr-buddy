/**
 * PATCH 653 - AI Adoption Metrics Page
 * Dedicated page for AI adoption scorecard and metrics
 */

import { Helmet } from "react-helmet-async";
import { AIAdoptionScorecard } from "@/components/ai/AIAdoptionScorecard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIPerformanceLog } from "@/hooks/ai/useAIPerformanceLog";
import { useAISuggestionsLog } from "@/hooks/ai/useAISuggestionsLog";
import { useEffect, useState } from "react";
import { TrendingUp, Brain, CheckCircle2, XCircle, Clock, BarChart3 } from "lucide-react";

export default function AIAdoption() {
  const { getRecentPerformance } = useAIPerformanceLog();
  const { getSuggestions } = useAISuggestionsLog();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [suggestionsData, setSuggestionsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [perf, sugg] = await Promise.all([
        getRecentPerformance(undefined, 100),
        getSuggestions(undefined, 100)
      ]);
      setPerformanceData(perf);
      setSuggestionsData(sugg);
    };
    fetchData();
  }, [getRecentPerformance, getSuggestions]);

  // Calculate metrics
  const totalSuggestions = suggestionsData.length;
  const acceptedSuggestions = suggestionsData.filter(s => s.accepted).length;
  const acceptanceRate = totalSuggestions > 0 
    ? Math.round((acceptedSuggestions / totalSuggestions) * 100) 
    : 0;

  const avgResponseTime = performanceData.length > 0
    ? Math.round(performanceData.reduce((sum, p) => sum + (p.execution_time_ms || 0), 0) / performanceData.length)
    : 0;

  const successfulOps = performanceData.filter(p => p.success).length;
  const successRate = performanceData.length > 0
    ? Math.round((successfulOps / performanceData.length) * 100)
    : 100;

  // Module breakdown
  const moduleStats: Record<string, number> = {};
  performanceData.forEach(p => {
    if (p.module_name) {
      moduleStats[p.module_name] = (moduleStats[p.module_name] || 0) + 1;
    }
  });

  return (
    <>
      <Helmet>
        <title>Métricas de Adoção IA | Nautilus One</title>
        <meta name="description" content="Scorecard e métricas de adoção do sistema de IA" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Métricas de Adoção de IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a adoção e efetividade do sistema de IA
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                  <p className="text-3xl font-bold text-primary">{acceptanceRate}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Sugestões</p>
                  <p className="text-3xl font-bold">{totalSuggestions}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-3xl font-bold">{avgResponseTime}ms</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold text-green-500">{successRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIAdoptionScorecard />

          <Card>
            <CardHeader>
              <CardTitle>Uso por Módulo</CardTitle>
              <CardDescription>Operações de IA por módulo do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(moduleStats).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(moduleStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([module, count]) => {
                      const percentage = Math.round((count / performanceData.length) * 100);
                      return (
                        <div key={module} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{module}</span>
                            <span className="text-muted-foreground">{count} ops ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado de módulo disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggestion Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Sugestões</CardTitle>
            <CardDescription>Estatísticas das sugestões geradas pela IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-500">{acceptedSuggestions}</p>
                <p className="text-xs text-muted-foreground">Aceitas</p>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold text-red-500">{totalSuggestions - acceptedSuggestions}</p>
                <p className="text-xs text-muted-foreground">Rejeitadas</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-500">{performanceData.length}</p>
                <p className="text-xs text-muted-foreground">Operações IA</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-purple-500">{acceptanceRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa Adoção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
