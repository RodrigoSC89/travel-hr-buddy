/**
 * AI Usage Analytics Panel - World-Class Component
 * Token consumption, cost tracking, service distribution, error rates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, Coins, Zap, AlertTriangle, CheckCircle2,
  RefreshCw, TrendingUp, Server, Cpu, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { aiControlTower, type UsageByService, type UsageByModel } from '@/services/ai/ai-control-tower.service';

export function AIUsageAnalyticsPanel() {
  const [byService, setByService] = useState<UsageByService[]>([]);
  const [byModel, setByModel] = useState<UsageByModel[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await aiControlTower.getControlTowerData();
      setByService(data.usageByService);
      setByModel(data.usageByModel);
      setTotalRequests(data.totalRequests);
      setTotalTokens(data.totalTokens);
      setErrorRate(data.errorRate);
    } catch (err) {
      console.error('Usage analytics error:', err);
      toast.error('Erro ao carregar analytics de uso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const maxServiceRequests = Math.max(...byService.map(s => s.requests), 1);
  const maxModelCount = Math.max(...byModel.map(m => m.count), 1);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent>
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
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <BarChart3 className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Usage Analytics</h2>
            <p className="text-sm text-muted-foreground">Consumo, custos e distribuição de uso</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Requests Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Tokens Usados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{byService.length}</p>
            <p className="text-xs text-muted-foreground">Serviços Ativos</p>
          </CardContent>
        </Card>
        <Card className={errorRate > 5 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4 text-center">
            {errorRate > 5 ? (
              <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            )}
            <p className="text-2xl font-bold">{errorRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Erro</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Service */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              Uso por Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byService.length > 0 ? byService
              .sort((a, b) => b.requests - a.requests)
              .slice(0, 10)
              .map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium truncate max-w-[150px]">{s.service}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{s.requests} req</span>
                      <span className="text-muted-foreground">{(s.tokens / 1000).toFixed(1)}K tok</span>
                      {s.errors > 0 && (
                        <Badge variant="destructive" className="text-xs">{s.errors} err</Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={(s.requests / maxServiceRequests) * 100} className="h-1.5" />
                </div>
              )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* By Model */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-500" />
              Distribuição por Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byModel.length > 0 ? byModel
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((m, i) => {
                const pct = totalRequests > 0 ? ((m.count / totalRequests) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium truncate max-w-[180px]">{m.model}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{m.count}</span>
                        <Badge variant="outline" className="text-xs">{pct}%</Badge>
                      </div>
                    </div>
                    <Progress value={(m.count / maxModelCount) * 100} className="h-1.5" />
                  </div>
                );
              }) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
