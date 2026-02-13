/**
 * AI Model Performance Monitor - World-Class Component
 * Real-time model metrics, latency tracking, quality scores, token usage
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Cpu, Gauge, Clock, Coins, TrendingUp, BarChart3,
  RefreshCw, Sparkles, Zap, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { aiControlTower, type ModelMetrics } from '@/services/ai/ai-control-tower.service';
import { logger } from '@/lib/logger';

export function AIModelPerformanceMonitor() {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await aiControlTower.getControlTowerData();
      setMetrics(data.modelMetrics);
      setTotalRequests(data.totalRequests);
      setTotalTokens(data.totalTokens);
    } catch (err) {
      logger.error('Model metrics error', err as Error);
      toast.error('Erro ao carregar métricas de modelos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={`ai-model-skel-${i}`} className="animate-pulse">
            <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl">
            <Cpu className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Model Performance</h2>
            <p className="text-sm text-muted-foreground">Monitoramento de modelos e métricas</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Cpu className="h-5 w-5 text-violet-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{metrics.length}</p>
            <p className="text-xs text-muted-foreground">Modelos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Tokens Consumidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {metrics.length > 0
                ? `${Math.round(metrics.reduce((a, m) => a + m.avgLatency, 0) / metrics.length)}ms`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Latência Média</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Cards */}
      <div className="space-y-3">
        {metrics.length > 0 ? metrics.map((m) => (
          <Card key={`model-${m.model}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-violet-500" />
                  <span className="font-semibold text-sm">{m.model}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {m.requests} requests
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCell
                  icon={<Clock className="h-3.5 w-3.5 text-blue-500" />}
                  label="Latência Média"
                  value={`${m.avgLatency}ms`}
                  good={m.avgLatency < 2000}
                />
                <MetricCell
                  icon={<Coins className="h-3.5 w-3.5 text-green-500" />}
                  label="Tokens (In/Out)"
                  value={`${(m.totalTokensIn / 1000).toFixed(1)}K / ${(m.totalTokensOut / 1000).toFixed(1)}K`}
                />
                <MetricCell
                  icon={<TrendingUp className="h-3.5 w-3.5 text-amber-500" />}
                  label="Qualidade"
                  value={m.avgQuality != null ? `${(m.avgQuality * 100).toFixed(0)}%` : 'N/A'}
                  good={m.avgQuality != null && m.avgQuality >= 0.8}
                />
                <MetricCell
                  icon={<BarChart3 className="h-3.5 w-3.5 text-violet-500" />}
                  label="Confiança"
                  value={m.avgConfidence != null ? `${(m.avgConfidence * 100).toFixed(0)}%` : 'N/A'}
                  good={m.avgConfidence != null && m.avgConfidence >= 0.85}
                />
              </div>

              {m.avgQuality != null && (
                <div className="mt-3">
                  <Progress value={m.avgQuality * 100} className="h-1.5" />
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Cpu className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma métrica de modelo disponível. As métricas são geradas a partir de interações com IA.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCell({ icon, label, value, good }: {
  icon: React.ReactNode; label: string; value: string; good?: boolean;
}) {
  return (
    <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold">{value}</span>
        {good !== undefined && (
          good ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />
        )}
      </div>
    </div>
  );
}
