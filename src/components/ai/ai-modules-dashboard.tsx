import { memo } from "react";
/**
 * AI Modules Dashboard
 * Visual overview of all AI-integrated modules
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAIModulesStatus } from "@/hooks/use-ai-modules-status";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";

export const AIModulesDashboard = memo(() => {
  const { modules, isLoading, overallHealth, refresh } = useAIModulesStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "offline":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "healthy":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "degraded":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "offline":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getOverallHealthColor = () => {
    switch (overallHealth) {
    case "healthy":
      return "text-green-500";
    case "degraded":
      return "text-yellow-500";
    case "critical":
      return "text-red-500";
    default:
      return "text-gray-500";
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Modules Dashboard</h2>
          <p className="text-muted-foreground">
            Status em tempo real de todas as integrações de IA
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className={`h-6 w-6 ${getOverallHealthColor()}`} />
            <span className="text-sm font-medium">
              Status Geral: <span className={getOverallHealthColor()}>{overallHealth.toUpperCase()}</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.id} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(module.status)}
                  <CardTitle className="text-xl">{module.name}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(module.status)}
                >
                  {module.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Status */}
              <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg">
                <span className="text-sm font-medium">IA Habilitada</span>
                <Badge variant={module.aiEnabled ? "default" : "secondary"}>
                  {module.aiEnabled ? "SIM" : "NÃO"}
                </Badge>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Recursos IA:
                </span>
                <div className="flex flex-wrap gap-2">
                  {module.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              {module.metrics && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1 text-center p-2 bg-muted/50 rounded">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">Requests</span>
                    </div>
                    <p className="text-lg font-bold">{module.metrics.totalRequests}</p>
                  </div>
                  <div className="space-y-1 text-center p-2 bg-muted/50 rounded">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">Taxa</span>
                    </div>
                    <p className="text-lg font-bold">{module.metrics.successRate.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1 text-center p-2 bg-muted/50 rounded">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Tempo</span>
                    </div>
                    <p className="text-lg font-bold">{module.metrics.avgResponseTime.toFixed(0)}ms</p>
                  </div>
                </div>
              )}

              {/* Last Check */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Última verificação: {new Date(module.lastCheck).toLocaleString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-3xl font-bold text-primary">{modules.length}</p>
              <p className="text-sm text-muted-foreground">Módulos Integrados</p>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <p className="text-3xl font-bold text-green-500">
                {modules.filter(m => m.status === "healthy").length}
              </p>
              <p className="text-sm text-muted-foreground">Módulos Saudáveis</p>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-lg">
              <p className="text-3xl font-bold text-blue-500">
                {modules.reduce((sum, m) => sum + m.features.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Recursos IA</p>
            </div>
            <div className="text-center p-4 bg-purple-500/5 rounded-lg">
              <p className="text-3xl font-bold text-purple-500">
                {modules.reduce((sum, m) => sum + (m.metrics?.totalRequests || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total de Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
