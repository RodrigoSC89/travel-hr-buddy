/**
 * Fleet Tracking Dashboard - Connected to real Supabase data
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFleetTrackingDashboardData } from "@/hooks/useFleetTrackingDashboardData";
import type { VesselPosition, TrackingAlert } from "@/hooks/useFleetTrackingDashboardData";
import {
  Ship, MapPin, Navigation, Anchor, Wind, Waves, Thermometer, Fuel, Clock,
  AlertTriangle, Bell, Settings, Satellite, Radio, Gauge, Activity,
  TrendingUp, Eye, Map, Globe, Compass, BarChart3, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusColor = (status: VesselPosition["status"]) => {
  const colors: Record<string, string> = {
    "underway": "bg-success", "anchored": "bg-warning",
    "moored": "bg-info", "drifting": "bg-destructive"
  };
  return colors[status] || "bg-muted";
};

const getSeverityColor = (severity: TrackingAlert["severity"]) => {
  const colors: Record<string, string> = {
    "info": "text-info bg-info/10",
    "warning": "text-warning bg-warning/10",
    "critical": "text-destructive bg-destructive/10"
  };
  return colors[severity] || "text-muted-foreground bg-muted";
};

export default function FleetTrackingDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  
  const { vesselPositions, alerts, geofences, isLoading, refetch, acknowledgeAlert, stats } = useFleetTrackingDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vesselPositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Ship className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma embarcação cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg"><Ship className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVessels}</p>
                <p className="text-xs text-muted-foreground">Total Frota</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg"><Navigation className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.underway}</p>
                <p className="text-xs text-muted-foreground">Em Navegação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg"><Anchor className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.anchored}</p>
                <p className="text-xs text-muted-foreground">Ancorados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg"><Satellite className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-muted-foreground">Cobertura AIS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(stats.criticalAlerts > 0 && "border-destructive/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stats.criticalAlerts > 0 ? "bg-destructive/20" : "bg-muted")}>
                <AlertTriangle className={cn("h-5 w-5", stats.criticalAlerts > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", stats.criticalAlerts > 0 && "text-destructive")}>{stats.criticalAlerts}</p>
                <p className="text-xs text-muted-foreground">Alertas Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map / Vessel List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Posição da Frota</CardTitle>
                <CardDescription>Rastreamento via dados de embarcações</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map placeholder */}
            <div className="h-[400px] bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />
              </div>
              {vesselPositions.map((vessel, i) => (
                <div key={vessel.id} className="absolute cursor-pointer group"
                  style={{ left: `${15 + (i * 18) % 70}%`, top: `${20 + (i * 15) % 60}%`, transform: `rotate(${vessel.course}deg)` }}
                  onClick={() => setSelectedVessel(vessel.id)}
                >
                  <div className={cn("p-2 rounded-full transition-all", selectedVessel === vessel.id ? "bg-primary scale-125" : getStatusColor(vessel.status), "group-hover:scale-110")}>
                    <Ship className="h-4 w-4 text-white" style={{ transform: `rotate(-${vessel.course}deg)` }} />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background border rounded-lg p-2 shadow-lg whitespace-nowrap">
                      <p className="font-medium text-sm">{vessel.name}</p>
                      <p className="text-xs text-muted-foreground">{vessel.speed} kn</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center z-10">
                <Globe className="h-16 w-16 text-primary/30 mx-auto mb-2" />
                <p className="text-muted-foreground">Mapa Interativo</p>
                <p className="text-xs text-muted-foreground">Clique em um navio para ver detalhes</p>
              </div>
            </div>

            {/* Vessel list */}
            <div className="mt-4 space-y-2">
              {vesselPositions.map((vessel) => (
                <div key={vessel.id}
                  className={cn("flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedVessel === vessel.id ? "bg-primary/10 border-primary" : "hover:bg-accent/50"
                  )}
                  onClick={() => setSelectedVessel(vessel.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", getStatusColor(vessel.status))} />
                    <div>
                      <p className="font-medium">{vessel.name}</p>
                      <p className="text-xs text-muted-foreground">IMO: {vessel.imo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1"><Navigation className="h-4 w-4 text-muted-foreground" /><span>{vessel.speed} kn</span></div>
                    <div className="flex items-center gap-1"><Compass className="h-4 w-4 text-muted-foreground" /><span>{vessel.course}°</span></div>
                    <Badge variant="secondary">
                      {vessel.status === "underway" ? "Navegando" : vessel.status === "anchored" ? "Ancorado" : vessel.status === "moored" ? "Atracado" : "Derivando"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Selected vessel details */}
          {selectedVessel && (() => {
            const vessel = vesselPositions.find(v => v.id === selectedVessel);
            if (!vessel) return null;
            return (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">{vessel.name}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Posição</span><p className="font-medium">{vessel.position.lat.toFixed(4)}, {vessel.position.lon.toFixed(4)}</p></div>
                      <div><span className="text-muted-foreground">Destino</span><p className="font-medium">{vessel.destination}</p></div>
                      <div><span className="text-muted-foreground">ETA</span><p className="font-medium">{vessel.eta}</p></div>
                      <div><span className="text-muted-foreground">Velocidade</span><p className="font-medium">{vessel.speed} knots</p></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Nível de Combustível</span>
                        <span className="font-medium">{vessel.fuelLevel}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", vessel.fuelLevel > 50 ? "bg-emerald-500" : vessel.fuelLevel > 25 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${vessel.fuelLevel}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm">Motor Principal</span>
                      <Badge variant={vessel.engineStatus === "running" ? "default" : "secondary"}>
                        {vessel.engineStatus === "running" ? "Em Operação" : vessel.engineStatus === "idle" ? "Em Espera" : "Parado"}
                      </Badge>
                    </div>
                    <Button className="w-full" size="sm" onClick={() => {
                      window.history.pushState({}, '', `/vessels/${vessel.id}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}><Eye className="h-4 w-4 mr-2" />Ver Detalhes Completos</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Alertas</CardTitle>
                <Badge variant="secondary">{alerts.filter(a => !a.acknowledged).length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={cn("p-3 rounded-lg border", !alert.acknowledged && alert.severity === "critical" && "bg-destructive/10 border-destructive/50")}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={cn("h-4 w-4 mt-0.5",
                            alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-amber-500" : "text-blue-500"
                          )} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{alert.vessel}</span>
                              <Badge variant="outline" className={cn("text-xs", getSeverityColor(alert.severity))}>
                                {alert.severity === "critical" ? "Crítico" : alert.severity === "warning" ? "Aviso" : "Info"}
                              </Badge>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => acknowledgeAlert(alert.id)}>ACK</Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Geofences */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" />Geofences</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {geofences.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", zone.active ? "bg-emerald-500" : "bg-muted")} />
                      <div>
                        <p className="text-sm font-medium">{zone.name}</p>
                        <Badge variant="outline" className="text-xs capitalize">{zone.type}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{zone.vesselsInside} navios</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
