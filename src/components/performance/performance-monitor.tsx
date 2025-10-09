import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Clock, Gauge } from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  score: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    score: 0,
  });

  useEffect(() => {
    const measurePerformance = () => {
      // Measure load time
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      // Measure memory (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;

      // Measure render time
      const renderTime = navigation.loadEventEnd - navigation.domContentLoadedEventStart;

      // Calculate network latency
      const networkLatency = navigation.responseEnd - navigation.requestStart;

      // Calculate performance score
      const score = Math.max(0, Math.min(100, 100 - loadTime / 50));

      setMetrics({
        loadTime: Math.round(loadTime),
        memoryUsage: Math.round(memoryUsage),
        networkLatency: Math.round(networkLatency),
        renderTime: Math.round(renderTime),
        score: Math.round(score),
      });
    };

    // Initial measurement
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
    }

    // Periodic measurements
    const interval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
        }));
      }
    }, 5000);

    return () => {
      window.removeEventListener("load", measurePerformance);
      clearInterval(interval);
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, text: "Excelente" };
    if (score >= 70) return { variant: "secondary" as const, text: "Bom" };
    return { variant: "destructive" as const, text: "Precisa Melhorar" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score de Performance</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(metrics.score)}`}>
            {metrics.score}
          </div>
          <Badge variant={getScoreBadge(metrics.score).variant} className="mt-1">
            {getScoreBadge(metrics.score).text}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Carregamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.loadTime}ms</div>
          <p className="text-xs text-muted-foreground">Inicial da página</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
          <p className="text-xs text-muted-foreground">Heap JavaScript</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latência de Rede</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.networkLatency}ms</div>
          <p className="text-xs text-muted-foreground">Resposta do servidor</p>
        </CardContent>
      </Card>
    </div>
  );
};
