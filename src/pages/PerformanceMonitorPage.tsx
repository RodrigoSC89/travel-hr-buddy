/**
 * Performance Monitor Page
 * Exposes Web Vitals + Bundle Stats to end users
 */
import { useWebVitals } from "@/hooks/useWebVitals";
import { useBundleStats } from "@/hooks/useBundleStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Gauge, HardDrive, Wifi, Zap, Clock } from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function getScoreBadge(score: number) {
  if (score >= 90) return <Badge className="bg-success/20 text-success">Excelente</Badge>;
  if (score >= 50) return <Badge className="bg-warning/20 text-warning">Regular</Badge>;
  return <Badge className="bg-destructive/20 text-destructive">Atenção</Badge>;
}

export default function PerformanceMonitorPage() {
  const { metrics, score, budget } = useWebVitals();
  const { stats, network } = useBundleStats();

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Performance Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Core Web Vitals, métricas de bundle e saúde do sistema
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
          {getScoreBadge(score)}
        </div>
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Baseado em Core Web Vitals com budgets otimizados para ambientes marítimos (2 Mbps)
          </p>
        </CardContent>
      </Card>

      {/* Web Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.length > 0 ? metrics.map((m) => (
          <Card key={m.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{m.name}</span>
                <Badge variant="outline" className="text-xs">
                  {m.rating === "good" ? "✅ Bom" : m.rating === "needs-improvement" ? "⚠️ Regular" : "❌ Ruim"}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {m.value.toFixed(m.name === "CLS" ? 3 : 0)}
                <span className="text-sm text-muted-foreground ml-1">
                  {m.name === "CLS" ? "" : "ms"}
                </span>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Navegue pelo sistema para coletar métricas de performance em tempo real
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bundle Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recursos Carregados</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(stats.totalSize / 1024).toFixed(0)} KB total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(0)}%</div>
              <Progress value={stats.cacheHitRate} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rede</span>
              </div>
              <div className="text-2xl font-bold">{network?.effectiveType || "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {network?.downlink ? `${network.downlink} Mbps` : "Detectando..."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Info */}
      {budget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-primary" />
              Performance Budget (Maritime)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              {Object.entries(budget).map(([key, val]) => (
                <div key={key}>
                  <span className="text-muted-foreground">{key.toUpperCase()}</span>
                  <div className="font-mono font-bold">{String(val)}{key === "CLS" ? "" : "ms"}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
