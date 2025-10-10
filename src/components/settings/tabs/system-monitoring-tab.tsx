import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TestTube,
  Server,
  Cpu,
  HardDrive,
  Network,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";

interface MonitoringSettings {
  enableMetrics: boolean;
  alertThresholds: Record<string, number>;
  retentionDays: number;
  enableHealthChecks: boolean;
}

interface SystemMonitoringTabProps {
  settings: MonitoringSettings;
  onUpdate: (updates: Partial<MonitoringSettings>) => void;
  testMode: boolean;
}

export const SystemMonitoringTab: React.FC<SystemMonitoringTabProps> = ({
  settings,
  onUpdate,
  testMode,
}) => {
  const [realTimeData] = useState({
    cpu: 65,
    memory: 78,
    disk: 45,
    network: 32,
    responseTime: 250,
    activeUsers: 24,
    errors: 3,
    uptime: 99.8,
  });

  const metrics = [
    {
      label: "CPU",
      value: realTimeData.cpu,
      threshold: settings.alertThresholds.cpu || 80,
      unit: "%",
      icon: Cpu,
      color: realTimeData.cpu > 80 ? "red" : realTimeData.cpu > 60 ? "yellow" : "green",
    },
    {
      label: "Memória",
      value: realTimeData.memory,
      threshold: settings.alertThresholds.memory || 85,
      unit: "%",
      icon: Server,
      color: realTimeData.memory > 85 ? "red" : realTimeData.memory > 70 ? "yellow" : "green",
    },
    {
      label: "Disco",
      value: realTimeData.disk,
      threshold: settings.alertThresholds.disk || 90,
      unit: "%",
      icon: HardDrive,
      color: realTimeData.disk > 90 ? "red" : realTimeData.disk > 75 ? "yellow" : "green",
    },
    {
      label: "Rede",
      value: realTimeData.network,
      threshold: 100,
      unit: "Mbps",
      icon: Network,
      color: "green",
    },
  ];

  const updateThreshold = (metric: string, value: number) => {
    onUpdate({
      alertThresholds: {
        ...settings.alertThresholds,
        [metric]: value,
      },
    });
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-600 bg-red-100";
      case "yellow":
        return "text-yellow-600 bg-yellow-100";
      case "green":
        return "text-green-600 bg-green-100";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Monitoramento do Sistema
            {testMode && (
              <Badge variant="outline" className="ml-2">
                <TestTube className="w-3 h-3 mr-1" />
                Teste
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Monitore a saúde e performance do sistema em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(metric => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <Badge className={getStatusColor(metric.color)}>
                      {metric.color === "red"
                        ? "Crítico"
                        : metric.color === "yellow"
                          ? "Atenção"
                          : "Normal"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className="text-lg font-bold">
                        {metric.value}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={metric.value}
                      className={`h-2 ${
                        metric.color === "red"
                          ? "[&>div]:bg-red-500"
                          : metric.color === "yellow"
                            ? "[&>div]:bg-yellow-500"
                            : "[&>div]:bg-green-500"
                      }`}
                    />
                    <div className="text-xs text-muted-foreground">
                      Limite: {metric.threshold}
                      {metric.unit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Sistema Operacional
                </span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Uptime: {realTimeData.uptime}% • {realTimeData.activeUsers} usuários ativos
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Tempo de Resposta
                </span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Médio: {realTimeData.responseTime}ms • Último check: agora
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">Alertas</span>
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                {realTimeData.errors} erros nas últimas 24h
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Configuração de Alertas
          </CardTitle>
          <CardDescription>Configure limites para alertas automáticos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Monitoramento Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar coleta de métricas em tempo real
                </p>
              </div>
              <Switch
                checked={settings.enableMetrics}
                onCheckedChange={checked => onUpdate({ enableMetrics: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Health Checks</Label>
                <p className="text-sm text-muted-foreground">
                  Verificações automáticas de saúde do sistema
                </p>
              </div>
              <Switch
                checked={settings.enableHealthChecks}
                onCheckedChange={checked => onUpdate({ enableHealthChecks: checked })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Limites de Alertas</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>CPU (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.alertThresholds.cpu || 80}
                    onChange={e => updateThreshold("cpu", parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Memória (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.alertThresholds.memory || 85}
                    onChange={e => updateThreshold("memory", parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Disco (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.alertThresholds.disk || 90}
                    onChange={e => updateThreshold("disk", parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Tempo de Resposta (ms)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.alertThresholds.responseTime || 2000}
                    onChange={e => updateThreshold("responseTime", parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Retenção de Dados</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Dias de Retenção</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.retentionDays}
                    onChange={e => onUpdate({ retentionDays: parseInt(e.target.value) })}
                    className="w-20"
                  />
                </div>

                <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p>
                    Dados mais antigos que {settings.retentionDays} dias serão automaticamente
                    removidos.
                  </p>
                  <p className="mt-1">
                    Espaço estimado: ~{Math.round(settings.retentionDays * 0.1)}GB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics e Relatórios
          </CardTitle>
          <CardDescription>Visualize tendências e gere relatórios de performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <LineChart className="w-6 h-6 mb-2" />
              <span>Gráfico de Tendências</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <PieChart className="w-6 h-6 mb-2" />
              <span>Distribuição de Recursos</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span>Relatório de Performance</span>
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
            <h4 className="font-medium mb-2">Insights Automáticos</h4>
            <div className="space-y-2 text-sm">
              <p>• CPU está 23% acima da média da semana passada</p>
              <p>• Uso de memória mais eficiente nos últimos 3 dias</p>
              <p>• Tempo de resposta melhorou 15% desde a última atualização</p>
              <p>• Pico de usuários detectado às 14:30 (horário habitual)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
