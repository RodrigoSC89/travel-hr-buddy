/**
 * AI Analytics Dashboard - Connected to real Supabase data
 */

import { useState, useMemo } from 'react';
import {
  Brain, TrendingUp, MessageSquare, Clock, Zap, BarChart3,
  Activity, RefreshCw, Bot, Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIControlTowerData } from '@/hooks/useAIControlTowerData';

export default function AIAnalyticsDashboard() {
  const { agents, auditLogs, decisions, insights, metrics, isLoading } = useAIControlTowerData();

  const totalTokens = useMemo(() =>
    auditLogs.reduce((sum: number, l: any) => sum + (l.tokens_input || 0) + (l.tokens_output || 0), 0),
    [auditLogs]
  );

  const avgConfidenceScore = useMemo(() => {
    const withScore = auditLogs.filter((l: any) => l.confidence_score != null);
    if (withScore.length === 0) return 0;
    return Math.round(withScore.reduce((sum: number, l: any) => sum + (l.confidence_score || 0), 0) / withScore.length * 100);
  }, [auditLogs]);

  // Group logs by model
  const modelStats = useMemo(() => {
    const map: Record<string, { count: number; avgTime: number; tokens: number }> = {};
    auditLogs.forEach((log: any) => {
      const model = log.model_version || "unknown";
      if (!map[model]) map[model] = { count: 0, avgTime: 0, tokens: 0 };
      map[model].count++;
      map[model].avgTime += log.response_time_ms || 0;
      map[model].tokens += (log.tokens_input || 0) + (log.tokens_output || 0);
    });
    return Object.entries(map)
      .map(([model, stats]) => ({
        model,
        count: stats.count,
        avgTime: stats.count > 0 ? Math.round(stats.avgTime / stats.count) : 0,
        tokens: stats.tokens,
      }))
      .sort((a, b) => b.count - a.count);
  }, [auditLogs]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Analytics IA</h2>
            <p className="text-muted-foreground">Métricas de uso e performance dos sistemas de IA</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-3xl font-bold">{auditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Interações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-3xl font-bold">{metrics.avgConfidence}%</p>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-3xl font-bold">{metrics.avgResponseTime}ms</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-3xl font-bold">{totalTokens.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Tokens Utilizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Uso por Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma interação registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modelStats.map((stat) => (
                  <div key={stat.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stat.model}</Badge>
                        <span className="text-sm text-muted-foreground">{stat.count} requisições</span>
                      </div>
                      <span className="text-sm font-medium">{stat.avgTime}ms avg</span>
                    </div>
                    <Progress value={modelStats.length > 0 ? (stat.count / modelStats[0].count) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agentes Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum agente registrado</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {agents.map((agent: any) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === "active" || agent.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{(agent.capabilities || []).length} capacidades</p>
                        </div>
                      </div>
                      <Badge variant={agent.status === "active" || agent.status === "online" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Decisions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resumo de Decisões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600">{metrics.approvedDecisions}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingDecisions}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                <p className="text-2xl font-bold text-red-600">{metrics.rejectedDecisions}</p>
                <p className="text-xs text-muted-foreground">Rejeitadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights Ativos ({insights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum insight gerado</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {insights.slice(0, 10).map((insight: any) => (
                    <div key={insight.id} className="p-3 rounded-lg border">
                      <p className="text-sm font-medium">{insight.title || "Insight"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description || ""}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
