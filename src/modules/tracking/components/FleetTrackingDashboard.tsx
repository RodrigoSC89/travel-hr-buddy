/**
 * Fleet Tracking Dashboard - Premium Tracking Module
 * Rastreamento em tempo real da frota com telemetria
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Ship,
  MapPin,
  Navigation,
  Anchor,
  Wind,
  Waves,
  Thermometer,
  Fuel,
  Clock,
  AlertTriangle,
  Bell,
  Settings,
  Satellite,
  Radio,
  Gauge,
  Activity,
  TrendingUp,
  Eye,
  Map,
  Globe,
  Compass,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  type: string;
  status: "underway" | "anchored" | "moored" | "drifting";
  position: { lat: number; lon: number };
  course: number;
  speed: number;
  destination: string;
  eta: string;
  lastUpdate: string;
  fuelLevel: number;
  engineStatus: "running" | "idle" | "stopped";
}

interface Alert {
  id: string;
  type: "geofence" | "speed" | "ais" | "weather" | "mechanical";
  severity: "info" | "warning" | "critical";
  vessel: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface GeofenceZone {
  id: string;
  name: string;
  type: "restricted" | "safe" | "port" | "custom";
  active: boolean;
  vesselsInside: number;
}

// Mock data
const mockVessels: VesselPosition[] = [
  {
    id: "1",
    name: "MV Atlantic Star",
    imo: "9876543",
    mmsi: "123456789",
    type: "Cargo",
    status: "underway",
    position: { lat: -23.9618, lon: -46.3322 },
    course: 45,
    speed: 12.5,
    destination: "Porto de Santos",
    eta: "2024-01-18 14:30",
    lastUpdate: "2024-01-17 10:45",
    fuelLevel: 78,
    engineStatus: "running"
  },
  {
    id: "2",
    name: "MV Pacific Dream",
    imo: "9876544",
    mmsi: "123456790",
    type: "Tanker",
    status: "anchored",
    position: { lat: -22.9068, lon: -43.1729 },
    course: 0,
    speed: 0,
    destination: "Rio de Janeiro",
    eta: "2024-01-17 18:00",
    lastUpdate: "2024-01-17 10:42",
    fuelLevel: 92,
    engineStatus: "idle"
  },
  {
    id: "3",
    name: "MV Ocean Pride",
    imo: "9876545",
    mmsi: "123456791",
    type: "Container",
    status: "moored",
    position: { lat: -25.2521, lon: -48.2962 },
    course: 180,
    speed: 0,
    destination: "Paranaguá",
    eta: "-",
    lastUpdate: "2024-01-17 10:30",
    fuelLevel: 45,
    engineStatus: "stopped"
  },
];

const mockAlerts: Alert[] = [
  { id: "1", type: "geofence", severity: "warning", vessel: "MV Atlantic Star", message: "Aproximando-se de zona restrita de pesca", timestamp: "2024-01-17 10:40", acknowledged: false },
  { id: "2", type: "speed", severity: "info", vessel: "MV Atlantic Star", message: "Velocidade acima da média para a rota", timestamp: "2024-01-17 10:35", acknowledged: true },
  { id: "3", type: "weather", severity: "critical", vessel: "MV Pacific Dream", message: "Alerta de tempestade na área de navegação", timestamp: "2024-01-17 10:20", acknowledged: false },
  { id: "4", type: "ais", severity: "warning", vessel: "MV Ocean Pride", message: "Sinal AIS fraco - verificar antena", timestamp: "2024-01-17 09:55", acknowledged: false },
];

const mockGeofences: GeofenceZone[] = [
  { id: "1", name: "Porto de Santos", type: "port", active: true, vesselsInside: 1 },
  { id: "2", name: "Zona de Exclusão - Plataforma P-51", type: "restricted", active: true, vesselsInside: 0 },
  { id: "3", name: "Área de Ancoragem Rio", type: "safe", active: true, vesselsInside: 1 },
  { id: "4", name: "Rota Preferencial Sul", type: "custom", active: false, vesselsInside: 0 },
];

const getStatusColor = (status: VesselPosition["status"]) => {
  const colors = {
    "underway": "bg-emerald-500",
    "anchored": "bg-amber-500",
    "moored": "bg-blue-500",
    "drifting": "bg-red-500"
  };
  return colors[status];
};

const getSeverityColor = (severity: Alert["severity"]) => {
  const colors = {
    "info": "text-blue-600 bg-blue-100",
    "warning": "text-amber-600 bg-amber-100",
    "critical": "text-red-600 bg-red-100"
  };
  return colors[severity];
};

export default function FleetTrackingDashboard() {
  const [activeTab, setActiveTab] = useState("map");
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const underwayCount = mockVessels.filter(v => v.status === "underway").length;
  const anchoredCount = mockVessels.filter(v => v.status === "anchored").length;
  const criticalAlerts = mockAlerts.filter(a => a.severity === "critical" && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockVessels.length}</p>
                <p className="text-xs text-muted-foreground">Total Frota</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Navigation className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{underwayCount}</p>
                <p className="text-xs text-muted-foreground">Em Navegação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Anchor className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{anchoredCount}</p>
                <p className="text-xs text-muted-foreground">Ancorados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Satellite className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-muted-foreground">Cobertura AIS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(criticalAlerts > 0 && "border-destructive/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", criticalAlerts > 0 ? "bg-destructive/20" : "bg-muted")}>
                <AlertTriangle className={cn("h-5 w-5", criticalAlerts > 0 ? "text-destructive" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", criticalAlerts > 0 && "text-destructive")}>{criticalAlerts}</p>
                <p className="text-xs text-muted-foreground">Alertas Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa / Lista de Embarcações */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Posição da Frota</CardTitle>
                <CardDescription>Rastreamento em tempo real via AIS</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Map className="h-4 w-4 mr-2" />
                  Mapa
                </Button>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Satélite
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Placeholder do mapa */}
            <div className="h-[400px] bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Grid do mapa */}
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />
              </div>
              
              {/* Marcadores dos navios */}
              {mockVessels.map((vessel, i) => (
                <div 
                  key={vessel.id}
                  className="absolute cursor-pointer group"
                  style={{ 
                    left: `${20 + (i * 25)}%`, 
                    top: `${30 + (i * 20)}%`,
                    transform: `rotate(${vessel.course}deg)`
                  }}
                  onClick={() => setSelectedVessel(vessel.id)}
                >
                  <div className={cn(
                    "p-2 rounded-full transition-all",
                    selectedVessel === vessel.id ? "bg-primary scale-125" : getStatusColor(vessel.status),
                    "group-hover:scale-110"
                  )}>
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

            {/* Lista de embarcações */}
            <div className="mt-4 space-y-2">
              {mockVessels.map((vessel) => (
                <div 
                  key={vessel.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
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
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span>{vessel.speed} kn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Compass className="h-4 w-4 text-muted-foreground" />
                      <span>{vessel.course}°</span>
                    </div>
                    <Badge variant="secondary">
                      {vessel.status === "underway" ? "Navegando" :
                       vessel.status === "anchored" ? "Ancorado" :
                       vessel.status === "moored" ? "Atracado" : "Derivando"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Detalhes do Navio Selecionado */}
          {selectedVessel && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {mockVessels.find(v => v.id === selectedVessel)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const vessel = mockVessels.find(v => v.id === selectedVessel)!;
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Posição</span>
                          <p className="font-medium">{vessel.position.lat.toFixed(4)}, {vessel.position.lon.toFixed(4)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Destino</span>
                          <p className="font-medium">{vessel.destination}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ETA</span>
                          <p className="font-medium">{vessel.eta}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Velocidade</span>
                          <p className="font-medium">{vessel.speed} knots</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Nível de Combustível</span>
                          <span className="font-medium">{vessel.fuelLevel}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              vessel.fuelLevel > 50 ? "bg-emerald-500" :
                              vessel.fuelLevel > 25 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${vessel.fuelLevel}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <span className="text-sm">Motor Principal</span>
                        <Badge variant={vessel.engineStatus === "running" ? "default" : "secondary"}>
                          {vessel.engineStatus === "running" ? "Em Operação" :
                           vessel.engineStatus === "idle" ? "Em Espera" : "Parado"}
                        </Badge>
                      </div>

                      <Button className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes Completos
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Alertas Recentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas
                </CardTitle>
                <Badge variant="secondary">{mockAlerts.filter(a => !a.acknowledged).length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {mockAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        !alert.acknowledged && alert.severity === "critical" && "bg-destructive/10 border-destructive/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn(
                          "h-4 w-4 mt-0.5",
                          alert.severity === "critical" ? "text-destructive" :
                          alert.severity === "warning" ? "text-amber-500" : "text-blue-500"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.vessel} • {alert.timestamp}</p>
                        </div>
                        {!alert.acknowledged && (
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Settings className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Geofences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Zonas de Geofence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockGeofences.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        zone.type === "restricted" ? "bg-red-500" :
                        zone.type === "port" ? "bg-blue-500" :
                        zone.type === "safe" ? "bg-emerald-500" : "bg-gray-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.vesselsInside} navios</p>
                      </div>
                    </div>
                    <Switch checked={zone.active} />
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
