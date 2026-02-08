import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Fuel, 
  Gauge, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Loader2,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useVesselPerformanceData, type VesselPerformanceData, type VesselPerformanceStats } from "@/hooks/useVesselPerformanceData";

const VesselPerformanceMonitor = () => {
  const { vessels, stats, isLoading, error, refetch } = useVesselPerformanceData();
  const [selectedVessel, setSelectedVessel] = useState<string>("");

  // Set first vessel as selected
  useEffect(() => {
    if (!selectedVessel && vessels.length > 0) {
      setSelectedVessel(vessels[0].vesselId);
    }
  }, [vessels, selectedVessel]);

  const selectedVesselData = vessels.find(v => v.vesselId === selectedVessel);

  const getAlertIcon = (status: string) => {
    switch (status) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "critical":
      return <Badge variant="destructive">Crítico</Badge>;
    case "warning":
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Alerta</Badge>;
    default:
      return <Badge variant="default" className="bg-green-500/20 text-green-600">Optimal</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <span className="text-muted-foreground text-xs">→</span>;
    }
  };

  // Generate deterministic history for chart using sine waves
  const generateChartData = (vesselData: VesselPerformanceData) => {
    const now = new Date();
    const nameHash = vesselData.vesselName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const phase = nameHash * 0.1;
      const sineVal = Math.sin((i / 24) * Math.PI * 2 + phase) * 5;
      const cosVal = Math.cos((i / 24) * Math.PI * 3 + phase * 0.7) * 2;
      return {
        time: time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        speed: Math.max(0, vesselData.averageSpeed + sineVal),
        fuel: Math.max(0, vesselData.fuelConsumption + cosVal),
        efficiency: Math.max(0, Math.min(100, vesselData.efficiency + sineVal * 0.8))
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados de performance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real da frota</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Vessel Selector */}
      <div className="flex gap-2 flex-wrap">
        {vessels.map((vessel) => (
          <Button
            key={vessel.vesselId}
            variant={selectedVessel === vessel.vesselId ? "default" : "outline"}
            onClick={() => setSelectedVessel(vessel.vesselId)}
            className="gap-2"
          >
            {getAlertIcon(vessel.status)}
            {vessel.vesselName}
          </Button>
        ))}
      </div>

      {selectedVesselData && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Velocidade</p>
                    <p className="text-2xl font-bold">{selectedVesselData.averageSpeed.toFixed(1)} kn</p>
                  </div>
                  <Gauge className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(selectedVesselData.trends.speedTrend)}
                  <span className="text-xs text-muted-foreground">vs anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Consumo</p>
                    <p className="text-2xl font-bold">{selectedVesselData.fuelConsumption.toFixed(1)} L/h</p>
                  </div>
                  <Fuel className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(selectedVesselData.trends.fuelTrend)}
                  <span className="text-xs text-muted-foreground">vs anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Horas Motor</p>
                    <p className="text-2xl font-bold">{selectedVesselData.engineHours.toFixed(0)}h</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiência</p>
                    <p className="text-2xl font-bold">{selectedVesselData.efficiency}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={selectedVesselData.efficiency} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Manutenção</p>
                    <p className="text-2xl font-bold">{selectedVesselData.maintenanceScore}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={selectedVesselData.maintenanceScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Histórico de Performance (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateChartData(selectedVesselData)}>
                    <defs>
                      <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      name="Velocidade (kn)"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorSpeed)"
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      name="Eficiência (%)"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorEfficiency)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status da Embarcação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Geral</span>
                  {getStatusBadge(selectedVesselData.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Última Atualização</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(selectedVesselData.lastUpdate).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium">Tendências</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(selectedVesselData.trends.speedTrend)}
                      </div>
                      <span className="text-xs text-muted-foreground">Velocidade</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(selectedVesselData.trends.fuelTrend)}
                      </div>
                      <span className="text-xs text-muted-foreground">Combustível</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(selectedVesselData.trends.efficiencyTrend)}
                      </div>
                      <span className="text-xs text-muted-foreground">Eficiência</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fleet Summary */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold">{vessels.length}</p>
                    <p className="text-sm text-muted-foreground">Embarcações</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold">{stats.avgEfficiency}%</p>
                    <p className="text-sm text-muted-foreground">Eficiência Média</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold">{stats.totalFuelConsumption.toFixed(0)} L</p>
                    <p className="text-sm text-muted-foreground">Combustível Total</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-destructive">{stats.vesselsCritical + stats.vesselsWarning}</p>
                    <p className="text-sm text-muted-foreground">Com Alertas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {vessels.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma embarcação encontrada</p>
        </Card>
      )}
    </div>
  );
};

export default VesselPerformanceMonitor;
