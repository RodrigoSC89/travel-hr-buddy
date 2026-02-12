/**
 * Telemetry Analytics Panel - World-Class Component
 * Telemetry insights, predictive analysis, sensor trends, and AI recommendations
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Activity, Brain, TrendingUp, AlertTriangle, RefreshCw,
  Sparkles, Loader2, Lightbulb, Target, BarChart3, Clock,
  CheckCircle2, ArrowUpRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { trackingIntelligence, type TelemetryInsight, type TelemetryAlert } from '@/services/tracking/tracking-intelligence.service';

const INSIGHT_ICONS: Record<string, React.ComponentType<any>> = {
  anomaly: AlertTriangle,
  prediction: Brain,
  optimization: TrendingUp,
  maintenance: Target,
  alert: Zap,
  default: Lightbulb,
};

const PRIORITY_COLORS: Record<number, string> = {
  1: 'border-destructive/50 bg-destructive/5',
  2: 'border-orange-500/50 bg-orange-500/5',
  3: 'border-amber-500/50 bg-amber-500/5',
  4: 'border-blue-500/50 bg-blue-500/5',
  5: 'border-muted bg-muted/5',
};

export function TelemetryAnalyticsPanel() {
  const [insights, setInsights] = useState<TelemetryInsight[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trackingIntelligence.getDashboardData();
      setInsights(data.insights);
      setAlerts(data.telemetryAlerts);
    } catch (err) {
      logger.error('Telemetry analytics error:', err);
      toast.error('Erro ao carregar dados de telemetria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await trackingIntelligence.runAIAnalysis();
      if (result) {
        setAiAnalysis(result);
        toast.success('Análise AI de telemetria concluída');
      }
    } catch {
      toast.error('Erro na análise AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const success = await trackingIntelligence.resolveAlert(alertId, 'telemetry_alerts');
    if (success) {
      toast.success('Alerta de telemetria resolvido');
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={`telemetry-skeleton-${i}`} className="animate-pulse">
            <CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeInsights = insights.filter(i => i.status === 'active' || i.status === 'pending');
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl">
            <Activity className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Telemetry Analytics</h2>
            <p className="text-sm text-muted-foreground">Insights preditivos e análise de telemetria</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Análise IA
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{insights.length}</p>
            <p className="text-xs text-muted-foreground">Total Insights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeInsights.length}</p>
            <p className="text-xs text-muted-foreground">Insights Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${unresolvedAlerts.length > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
            <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {insights.length > 0
                ? `${Math.round((insights.filter(i => i.confidence && i.confidence > 0.8).length / insights.length) * 100)}%`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Alta Confiança</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Análise AI de Telemetria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-xs">
                {aiAnalysis}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Insights Preditivos ({activeInsights.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeInsights.length > 0 ? activeInsights.map(insight => {
              const IconComp = INSIGHT_ICONS[insight.insightType] || INSIGHT_ICONS.default;
              const priorityClass = PRIORITY_COLORS[insight.priority || 5] || PRIORITY_COLORS[5];
              return (
                <div key={insight.id} className={`p-3 rounded-lg border ${priorityClass}`}>
                  <div className="flex items-start gap-2">
                    <IconComp className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold truncate">{insight.title}</p>
                        {insight.confidence != null && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {(insight.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      {insight.predictedIssue && (
                        <div className="mt-2 p-2 rounded bg-muted/30 border border-border/50">
                          <p className="text-xs"><span className="font-medium">Previsão:</span> {insight.predictedIssue}</p>
                        </div>
                      )}
                      {insight.recommendedAction && (
                        <p className="mt-1 text-xs text-primary flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> {insight.recommendedAction}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-6 text-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum insight ativo. Execute a análise AI para gerar insights.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telemetry Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Alertas de Telemetria ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unresolvedAlerts.length > 0 ? unresolvedAlerts.map(alert => (
              <div key={alert.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                      {alert.severity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{alert.alertType}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.createdAt?.split('T')[0]}</span>
                </div>
                <p className="text-xs font-medium mb-2">{alert.message}</p>
                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleResolveAlert(alert.id)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                </Button>
              </div>
            )) : (
              <div className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Todos os alertas resolvidos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
