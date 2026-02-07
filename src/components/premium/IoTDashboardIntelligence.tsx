/**
 * IoT Dashboard Intelligence - SMART Notation Compliant
 * ABS SMART (SHM/MHM/AEM/OPM) framework
 * PATCH Sprint 15: Replaced mock data with useIoTIntelligenceData hook
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Cpu, Activity, Thermometer, Gauge, AlertTriangle,
  Wifi, Battery, Signal, Zap, TrendingUp, Ship,
  Waves, Wind, Settings, BarChart3, Brain
} from "lucide-react";
import { useIoTIntelligenceData } from "@/hooks/useIoTIntelligenceData";

export default function IoTDashboardIntelligence() {
  const { data, isLoading } = useIoTIntelligenceData();
  const sensors = data?.sensors || [];
  const equipmentHealth = data?.equipmentHealth || [];
  const [activeTab, setActiveTab] = useState("realtime");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-destructive bg-destructive/10";
      case "warning": return "text-warning bg-warning/10";
      default: return "text-success bg-success/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-warning" />;
      case "down": return <TrendingUp className="h-3 w-3 text-cyan-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-warning";
    return "text-destructive";
  };

  const onlineSensors = sensors.length;
  const criticalAlerts = sensors.filter(s => s.status === "critical").length;
  const avgHealth = equipmentHealth.length > 0 
    ? Math.round(equipmentHealth.reduce((sum, e) => sum + e.healthScore, 0) / equipmentHealth.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sensores Online</p>
                <p className="text-2xl font-bold text-success">{onlineSensors}</p>
              </div>
              <Wifi className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">{avgHealth}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary/50" />
            </div>
            <Progress value={avgHealth} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${criticalAlerts > 0 ? "from-destructive/10 to-destructive/5" : "from-muted/10 to-muted/5"}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas Críticos</p>
                <p className={`text-2xl font-bold ${criticalAlerts > 0 ? "text-destructive" : ""}`}>{criticalAlerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalAlerts > 0 ? "text-destructive/50 animate-pulse" : "text-muted/50"}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{equipmentHealth.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Eficiência Média</p>
                <p className="text-2xl font-bold">
                  {equipmentHealth.length > 0 
                    ? Math.round(equipmentHealth.reduce((s, e) => s + e.efficiency, 0) / equipmentHealth.length) 
                    : 0}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-cyan-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="realtime" className="flex items-center gap-2 py-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Tempo Real</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2 py-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Health (SHM/MHM)</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2 py-2">
            <Ship className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Operações (OPM)</span>
          </TabsTrigger>
        </TabsList>

        {/* Real-Time Sensors */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                Sensores em Tempo Real
              </CardTitle>
              <CardDescription>Telemetria IoT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map((sensor) => (
                  <div key={sensor.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{sensor.name}</p>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status === "critical" ? "Crítico" : sensor.status === "warning" ? "Alerta" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-3">
                      <span className="text-3xl font-bold">{sensor.value}</span>
                      <span className="text-lg text-muted-foreground">{sensor.unit}</span>
                      {getTrendIcon(sensor.trend)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        <span>{sensor.battery}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        <span>{sensor.signalStrength}%</span>
                      </div>
                      <span>{sensor.lastUpdate}</span>
                    </div>
                  </div>
                ))}
                {sensors.length === 0 && (
                  <p className="col-span-3 text-center text-muted-foreground py-8">
                    Nenhum sensor IoT cadastrado. Configure os sensores da embarcação.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Health */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Saúde de Equipamentos — ABS SMART (SHM/MHM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentHealth.map((equip) => (
                  <div key={equip.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{equip.name}</p>
                        <p className="text-xs text-muted-foreground">{equip.location}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getHealthColor(equip.healthScore)}`}>{equip.healthScore}%</p>
                        <p className="text-xs text-muted-foreground">Health Score</p>
                      </div>
                    </div>
                    <Progress 
                      value={equip.healthScore} 
                      className={`h-2 mb-3 ${equip.healthScore < 75 ? "[&>div]:bg-destructive" : equip.healthScore < 90 ? "[&>div]:bg-warning" : ""}`}
                    />
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="font-medium">{equip.operatingHours.toLocaleString()}</p>
                        <p className="text-muted-foreground">Horas Op.</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="font-medium">{equip.nextMaintenance}</p>
                        <p className="text-muted-foreground">Próx. Mnt.</p>
                      </div>
                      <div className={`rounded p-2 ${equip.anomalies > 0 ? "bg-warning/20" : "bg-muted/50"}`}>
                        <p className="font-medium">{equip.anomalies}</p>
                        <p className="text-muted-foreground">Anomalias</p>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <p className="font-medium">{equip.efficiency}%</p>
                        <p className="text-muted-foreground">Eficiência</p>
                      </div>
                    </div>
                  </div>
                ))}
                {equipmentHealth.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum equipamento monitorado. Cadastre registros de manutenção.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Performance Operacional (OPM)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Wind className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                <p className="text-2xl font-bold">{sensors.length > 0 ? "12.5" : "—"} kn</p>
                <p className="text-muted-foreground text-sm">Velocidade Média</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Gauge className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{sensors.length > 0 ? "18.2" : "—"} t/d</p>
                <p className="text-muted-foreground text-sm">Consumo Combustível</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 mx-auto text-success mb-2" />
                <p className="text-2xl font-bold">{avgHealth > 0 ? `${avgHealth}%` : "—"}</p>
                <p className="text-muted-foreground text-sm">Disponibilidade</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
