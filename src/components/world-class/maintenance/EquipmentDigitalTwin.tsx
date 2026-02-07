/**
 * Equipment Digital Twin - M047
 * 3D-style equipment health visualization with sensor data
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, AlertTriangle, CheckCircle, Cpu, Gauge, ThermometerSun,
  Waves, Wrench, TrendingUp, TrendingDown, Clock, BarChart3,
  RefreshCw, Settings, Zap, Info,
} from "lucide-react";
import { maintenanceIntelligence, EquipmentTwin, SensorReading } from "@/services/maintenance";
import { toast } from "sonner";

const statusConfig = {
  operational: { color: "bg-emerald-500", label: "Operacional", icon: CheckCircle },
  degraded: { color: "bg-amber-500", label: "Degradado", icon: AlertTriangle },
  warning: { color: "bg-orange-500", label: "Atenção", icon: AlertTriangle },
  critical: { color: "bg-red-500", label: "Crítico", icon: AlertTriangle },
  offline: { color: "bg-muted", label: "Offline", icon: Info },
};

const sensorIcons: Record<string, React.ElementType> = {
  temperature_c: ThermometerSun,
  vibration_mm_s: Waves,
  pressure_bar: Gauge,
  rpm: Activity,
};

export function EquipmentDigitalTwin() {
  const [twins, setTwins] = useState<EquipmentTwin[]>([]);
  const [selected, setSelected] = useState<EquipmentTwin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTwins();
  }, []);

  const loadTwins = async () => {
    setLoading(true);
    try {
      const data = await maintenanceIntelligence.getEquipmentTwins();
      setTwins(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (err) {
      toast.error("Erro ao carregar digital twins");
    } finally {
      setLoading(false);
    }
  };

  const healthColor = (score: number) => {
    if (score >= 85) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const sensorStatusColor = (status: SensorReading["status"]) => {
    switch (status) {
      case "normal": return "border-emerald-500/30 bg-emerald-500/5";
      case "warning": return "border-amber-500/30 bg-amber-500/5";
      case "alarm": return "border-orange-500/30 bg-orange-500/5";
      case "critical": return "border-red-500/30 bg-red-500/5";
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Equipment Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {twins.map((twin) => {
          const cfg = statusConfig[twin.status];
          return (
            <Card
              key={twin.id}
              onClick={() => setSelected(twin)}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                selected?.id === twin.id ? "ring-2 ring-primary border-primary" : "border-border/50"
              }`}
            >
              <CardContent className="p-3 text-center space-y-2">
                <div className="relative mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-foreground/70" />
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${cfg.color}`} />
                </div>
                <p className="text-xs font-medium truncate">{twin.name}</p>
                <p className={`text-lg font-bold ${healthColor(twin.healthScore)}`}>
                  {Math.round(twin.healthScore)}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Equipment Detail */}
      {selected && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selected.vessel} · {selected.type.toUpperCase()} · {selected.runningHours.toLocaleString()}h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selected.status === "operational" ? "default" : "destructive"}>
                  {statusConfig[selected.status].label}
                </Badge>
                <span className={`text-2xl font-bold ${healthColor(selected.healthScore)}`}>
                  {Math.round(selected.healthScore)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sensors" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="sensors">Sensores</TabsTrigger>
                <TabsTrigger value="components">Componentes</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              </TabsList>

              {/* Sensors Tab */}
              <TabsContent value="sensors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selected.sensors.map((sensor) => {
                    const Icon = sensorIcons[sensor.parameter] || Activity;
                    const percentage = Math.min(100, (sensor.value / sensor.threshold.critical) * 100);

                    return (
                      <div
                        key={sensor.id}
                        className={`p-4 rounded-lg border ${sensorStatusColor(sensor.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-foreground/70" />
                            <span className="font-medium text-sm">{sensor.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {sensor.trend === "rising" && <TrendingUp className="h-3 w-3 mr-1" />}
                            {sensor.trend === "falling" && <TrendingDown className="h-3 w-3 mr-1" />}
                            {sensor.trend}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-2xl font-bold">{sensor.value}</span>
                          <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                        </div>
                        <Progress value={percentage} className="h-2 mb-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Min: {sensor.threshold.min}</span>
                          <span>Max: {sensor.threshold.max}</span>
                          <span className="text-red-400">Crítico: {sensor.threshold.critical}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Components Tab */}
              <TabsContent value="components">
                <div className="space-y-3">
                  {selected.components.map((comp) => (
                    <div key={comp.id} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-foreground/70" />
                          <span className="font-medium">{comp.name}</span>
                        </div>
                        <span className={`font-bold ${healthColor(comp.healthPercent)}`}>
                          {comp.healthPercent}%
                        </span>
                      </div>
                      <Progress value={comp.healthPercent} className="h-2 mb-2" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block text-foreground/70">Desgaste</span>
                          {comp.wearLevel}%
                        </div>
                        <div>
                          <span className="block text-foreground/70">Vida Restante</span>
                          {comp.estimatedLifeRemaining} dias
                        </div>
                        <div>
                          <span className="block text-foreground/70">Custo Reposição</span>
                          ${comp.replacementCost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {selected.maintenanceHistory.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/10">
                        <div className="p-1.5 rounded bg-primary/10">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.date.toLocaleDateString("pt-BR")}
                            </span>
                            <Badge variant="outline" className="text-xs">{event.type}</Badge>
                            <span>{event.duration}h</span>
                            <span>${event.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Zap className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{selected.runningHours.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Horas de Operação</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{Math.round((selected.runningHours / selected.maxHours) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Vida Útil Usada</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{selected.lastInspection.toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">Última Inspeção</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-muted/20 text-center">
                    <Wrench className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{selected.nextMaintenance.toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">Próxima Manutenção</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
