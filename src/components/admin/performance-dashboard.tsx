/**
import { useState } from "react";;
 * PATCH 652 - Performance Dashboard
 * Real-time visualization of Core Web Vitals and performance metrics
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Zap, 
  Eye, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Database,
  Info
} from "lucide-react";
import { usePerformanceMonitor, evaluatePerformance, type PerformanceMetrics } from "@/hooks/use-performance-monitor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    memory: null,
    timestamp: Date.now()
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  const { collectMetrics } = usePerformanceMonitor({
    enabled: isMonitoring,
    interval: 5000,
    onMetricsUpdate: setMetrics
  });

  const evaluation = evaluatePerformance(metrics);

  const getScoreColor = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return "text-success";
    if (value <= thresholds.needsImprovement) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (value: number, thresholds: { good: number; needsImprovement: number }) => {
    if (value <= thresholds.good) return <Badge className="bg-success/20 text-success border-success/30">Excelente</Badge>;
    if (value <= thresholds.needsImprovement) return <Badge className="bg-warning/20 text-warning border-warning/30">Bom</Badge>;
    return <Badge variant="destructive">Precisa Melhorar</Badge>;
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
    case "excellent":
      return <Badge className="bg-success/20 text-success border-success/30">Excelente</Badge>;
    case "good":
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Bom</Badge>;
    case "needs-improvement":
      return <Badge className="bg-warning/20 text-warning border-warning/30">Precisa Melhorar</Badge>;
    case "poor":
      return <Badge variant="destructive">Crítico</Badge>;
    default:
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-nautical/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Monitoramento em tempo real de Core Web Vitals e recursos do navegador
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? "Pausar" : "Retomar"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => collectMetrics()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Score
            </CardTitle>
            {getRatingBadge(evaluation.rating)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke={
                      evaluation.score >= 90 ? "hsl(var(--success))" :
                        evaluation.score >= 75 ? "hsl(var(--primary))" :
                          evaluation.score >= 50 ? "hsl(var(--warning))" :
                            "hsl(var(--destructive))"
                    }
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(evaluation.score / 100) * 339.29} 339.29`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${
                      evaluation.score >= 90 ? "text-success" :
                        evaluation.score >= 75 ? "text-primary" :
                          evaluation.score >= 50 ? "text-warning" :
                            "text-destructive"
                    }`}>
                      {evaluation.score}
                    </p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Performance geral da aplicação baseada em Core Web Vitals
                </p>
                {evaluation.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Recomendações:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {evaluation.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LCP */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">LCP</span>
              </div>
              {metrics.lcp && getScoreBadge(metrics.lcp, { good: 2500, needsImprovement: 4000 })}
            </div>
            <div className={`text-2xl font-bold ${metrics.lcp ? getScoreColor(metrics.lcp, { good: 2500, needsImprovement: 4000 }) : "text-muted-foreground"}`}>
              {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : "Medindo..."}
            </div>
            <p className="text-xs text-muted-foreground mb-2">Largest Contentful Paint</p>
            <Progress 
              value={metrics.lcp ? Math.min((metrics.lcp / 4000) * 100, 100) : 0} 
              className="h-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt; 2.5s
            </p>
          </CardContent>
        </Card>

        {/* FID */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">FID</span>
              </div>
              {metrics.fid !== null && getScoreBadge(metrics.fid, { good: 100, needsImprovement: 300 })}
            </div>
            <div className={`text-2xl font-bold ${metrics.fid !== null ? getScoreColor(metrics.fid, { good: 100, needsImprovement: 300 }) : "text-muted-foreground"}`}>
              {metrics.fid !== null ? `${metrics.fid.toFixed(0)}ms` : "Aguardando..."}
            </div>
            <p className="text-xs text-muted-foreground mb-2">First Input Delay</p>
            <Progress 
              value={metrics.fid !== null ? Math.min((metrics.fid / 300) * 100, 100) : 0} 
              className="h-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt; 100ms
            </p>
          </CardContent>
        </Card>

        {/* CLS */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">CLS</span>
              </div>
              {metrics.cls !== null && getScoreBadge(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}
            </div>
            <div className={`text-2xl font-bold ${metrics.cls !== null ? getScoreColor(metrics.cls, { good: 0.1, needsImprovement: 0.25 }) : "text-muted-foreground"}`}>
              {metrics.cls !== null ? metrics.cls.toFixed(3) : "Medindo..."}
            </div>
            <p className="text-xs text-muted-foreground mb-2">Cumulative Layout Shift</p>
            <Progress 
              value={metrics.cls !== null ? Math.min((metrics.cls / 0.25) * 100, 100) : 0} 
              className="h-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt; 0.1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">TTFB</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : "Medindo..."}
            </div>
            <p className="text-xs text-muted-foreground">Time to First Byte</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">FCP</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : "Medindo..."}
            </div>
            <p className="text-xs text-muted-foreground">First Contentful Paint</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <div className={`text-2xl font-bold ${metrics.memory && metrics.memory.percentage > 85 ? "text-destructive" : "text-foreground"}`}>
              {metrics.memory ? `${metrics.memory.percentage.toFixed(1)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.memory ? 
                `${(metrics.memory.used / 1048576).toFixed(0)} MB / ${(metrics.memory.total / 1048576).toFixed(0)} MB` : 
                "Chrome/Edge only"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Core Web Vitals</AlertTitle>
        <AlertDescription>
          <div className="space-y-2 text-sm mt-2">
            <p><strong>LCP</strong>: Mede o tempo para renderizar o maior elemento visível. Ideal: &lt; 2.5s</p>
            <p><strong>FID</strong>: Mede o tempo de resposta à primeira interação. Ideal: &lt; 100ms</p>
            <p><strong>CLS</strong>: Mede a estabilidade visual da página. Ideal: &lt; 0.1</p>
            <p className="pt-2 border-t">
              💡 <strong>Dica</strong>: Use `window.__NAUTILUS_PERFORMANCE__` no console para acessar métricas em tempo real
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Debug Info */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs font-mono text-muted-foreground space-y-1">
            <p>Última atualização: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
            <p>Monitoring: {isMonitoring ? "🟢 Ativo" : "🔴 Pausado"}</p>
            <p>Interval: 5000ms</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
