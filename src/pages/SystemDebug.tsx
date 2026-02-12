/**
 * System Debug Page
 * PATCH 850.6 - Autodiagnóstico interno acessível via /__debug__
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Activity, Shield } from "lucide-react";
import { runHealthDiagnostics, type SystemHealth, type HealthCheck } from "@/lib/diagnostics/system-health";

const statusConfig = {
  healthy: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Saudável" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Atenção" },
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Crítico" },
  unknown: { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Desconhecido" },
};

function HealthCheckCard({ check }: { check: HealthCheck }) {
  const config = statusConfig[check.status];
  const Icon = config.icon;
  
  return (
    <div className={`p-4 rounded-lg border ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <h4 className="font-medium">{check.name}</h4>
            <p className="text-sm text-muted-foreground">{check.message}</p>
          </div>
        </div>
        {check.latency !== undefined && (
          <Badge variant="outline" className="text-xs">
            {check.latency}ms
          </Badge>
        )}
      </div>
      {check.details && (
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <pre className="overflow-x-auto">
            {JSON.stringify(check.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function SystemDebugPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await runHealthDiagnostics();
      setHealth(result);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(runDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallConfig = health ? statusConfig[health.overall] : statusConfig.unknown;
  const OverallIcon = overallConfig.icon;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">System Diagnostics</h1>
            <p className="text-muted-foreground text-sm">
              Autodiagnóstico de integridade do Nautilus One
            </p>
          </div>
        </div>
        <Button onClick={runDiagnostics} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Geral
            </CardTitle>
            {health && (
              <Badge className={`${overallConfig.bg} ${overallConfig.color} border-0`}>
                <OverallIcon className="h-3 w-3 mr-1" />
                {overallConfig.label}
              </Badge>
            )}
          </div>
          {lastRefresh && (
            <CardDescription>
              Última verificação: {lastRefresh.toLocaleTimeString("pt-BR")}
            </CardDescription>
          )}
        </CardHeader>
        {health && (
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-500/10">
                <div className="text-2xl font-bold text-green-500">{health.summary.healthy}</div>
                <div className="text-xs text-muted-foreground">Saudável</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-500">{health.summary.warning}</div>
                <div className="text-xs text-muted-foreground">Atenção</div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <div className="text-2xl font-bold text-red-500">{health.summary.critical}</div>
                <div className="text-xs text-muted-foreground">Crítico</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-muted-foreground">{health.summary.unknown}</div>
                <div className="text-xs text-muted-foreground">Desconhecido</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações Detalhadas</CardTitle>
          <CardDescription>
            Status de cada componente do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {health?.checks.map((check) => (
                <HealthCheckCard key={check.name} check={check} />
              ))}
              {loading && !health && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">User Agent:</span>
              <p className="font-mono text-xs break-all">{navigator.userAgent}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Viewport:</span>
              <p className="font-mono">{window.innerWidth} x {window.innerHeight}</p>
            </div>
            <div>
              <span className="text-muted-foreground">React Version:</span>
              <p className="font-mono">{React.version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Build Mode:</span>
              <p className="font-mono">{import.meta.env.MODE}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
