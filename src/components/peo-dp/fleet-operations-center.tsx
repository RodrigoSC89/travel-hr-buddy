import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Globe,
  Ship,
  Anchor,
  AlertTriangle,
  Activity,
  MapPin,
  Wind,
  Waves,
  Eye,
  Bell,
  TrendingUp,
  Clock,
  Users,
  Search,
  RefreshCw,
  Download
} from "lucide-react";

interface VesselStatus {
  id: string;
  name: string;
  type: string;
  dpClass: string;
  location: { lat: number; lon: number };
  heading: number;
  dpMode: "Auto DP" | "TAM" | "CAM" | "Joystick" | "Manual" | "Standby";
  asogStatus: "green" | "yellow" | "red";
  operationType: string;
  environmental: {
    windSpeed: number;
    waveHeight: number;
    current: number;
  };
  power: {
    available: number;
    consumed: number;
  };
  alerts: number;
  lastUpdate: string;
  crew: number;
  onlineStatus: "online" | "degraded" | "offline";
}

interface FleetAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const mockVessels: VesselStatus[] = [
  {
    id: "VES-001",
    name: "MV Atlantic Explorer",
    type: "PSV",
    dpClass: "DP-2",
    location: { lat: -22.9068, lon: -43.1729 },
    heading: 145,
    dpMode: "Auto DP",
    asogStatus: "green",
    operationType: "Offloading",
    environmental: { windSpeed: 18, waveHeight: 1.2, current: 0.8 },
    power: { available: 12000, consumed: 7500 },
    alerts: 0,
    lastUpdate: "2024-12-04T15:30:00",
    crew: 24,
    onlineStatus: "online"
  },
  {
    id: "VES-002",
    name: "OSV Petrobras XXI",
    type: "AHTS",
    dpClass: "DP-2",
    location: { lat: -23.1234, lon: -42.9876 },
    heading: 270,
    dpMode: "TAM",
    asogStatus: "yellow",
    operationType: "Anchor Handling",
    environmental: { windSpeed: 25, waveHeight: 2.1, current: 1.2 },
    power: { available: 18000, consumed: 14000 },
    alerts: 2,
    lastUpdate: "2024-12-04T15:28:00",
    crew: 32,
    onlineStatus: "online"
  },
  {
    id: "VES-003",
    name: "DSV Ocean Pioneer",
    type: "DSV",
    dpClass: "DP-3",
    location: { lat: -22.5432, lon: -40.8765 },
    heading: 90,
    dpMode: "Auto DP",
    asogStatus: "green",
    operationType: "Diving Operations",
    environmental: { windSpeed: 12, waveHeight: 0.8, current: 0.5 },
    power: { available: 24000, consumed: 12000 },
    alerts: 0,
    lastUpdate: "2024-12-04T15:31:00",
    crew: 48,
    onlineStatus: "online"
  },
  {
    id: "VES-004",
    name: "PLSV Campos Star",
    type: "PLSV",
    dpClass: "DP-3",
    location: { lat: -22.7654, lon: -41.2345 },
    heading: 180,
    dpMode: "Auto DP",
    asogStatus: "red",
    operationType: "Pipelay",
    environmental: { windSpeed: 32, waveHeight: 3.5, current: 1.8 },
    power: { available: 30000, consumed: 25000 },
    alerts: 5,
    lastUpdate: "2024-12-04T15:25:00",
    crew: 120,
    onlineStatus: "degraded"
  }
];

const mockAlerts: FleetAlert[] = [
  { id: "ALT-001", vesselId: "VES-004", vesselName: "PLSV Campos Star", type: "critical", message: "ASOG excedido - Operação suspensa", timestamp: "2024-12-04T15:25:00", acknowledged: false },
  { id: "ALT-002", vesselId: "VES-004", vesselName: "PLSV Campos Star", type: "critical", message: "Vento acima do limite operacional", timestamp: "2024-12-04T15:24:00", acknowledged: false },
  { id: "ALT-003", vesselId: "VES-002", vesselName: "OSV Petrobras XXI", type: "warning", message: "Corrente aproximando-se do limite ASOG", timestamp: "2024-12-04T15:20:00", acknowledged: true },
  { id: "ALT-004", vesselId: "VES-002", vesselName: "OSV Petrobras XXI", type: "warning", message: "Consumo de potência acima de 75%", timestamp: "2024-12-04T15:18:00", acknowledged: true },
  { id: "ALT-005", vesselId: "VES-001", vesselName: "MV Atlantic Explorer", type: "info", message: "Troca de turno registrada", timestamp: "2024-12-04T14:00:00", acknowledged: true }
];

export const FleetOperationsCenter: React.FC = () => {
  const [vessels] = useState<VesselStatus[]>(mockVessels);
  const [alerts, setAlerts] = useState<FleetAlert[]>(mockAlerts);
  const [selectedVessel, setSelectedVessel] = useState<VesselStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido");
  };

  const getAsogStatusColor = (status: string) => {
    switch (status) {
    case "green": return "bg-green-500";
    case "yellow": return "bg-yellow-500";
    case "red": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getDPModeBadge = (mode: string) => {
    switch (mode) {
    case "Auto DP": return <Badge className="bg-green-500">Auto DP</Badge>;
    case "TAM": return <Badge className="bg-blue-500">TAM</Badge>;
    case "CAM": return <Badge className="bg-purple-500">CAM</Badge>;
    case "Joystick": return <Badge className="bg-yellow-500 text-black">Joystick</Badge>;
    case "Manual": return <Badge variant="destructive">Manual</Badge>;
    case "Standby": return <Badge variant="secondary">Standby</Badge>;
    default: return <Badge variant="outline">{mode}</Badge>;
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.type === "critical" && !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fleet Operations Center</h2>
            <p className="text-muted-foreground">Central de comando para telemetria da frota</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {criticalAlerts > 0 && (
            <Badge variant="destructive" className="animate-pulse px-3 py-1">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {criticalAlerts} Alertas Críticos
            </Badge>
          )}
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
          <Button><Download className="w-4 h-4 mr-2" />Relatório</Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações</p>
                <p className="text-2xl font-bold">{vessels.length}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Operação</p>
                <p className="text-2xl font-bold">{vessels.filter(v => v.dpMode !== "Standby").length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ASOG Alerta</p>
                <p className="text-2xl font-bold">{vessels.filter(v => v.asogStatus !== "green").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulação Total</p>
                <p className="text-2xl font-bold">{vessels.reduce((acc, v) => acc + v.crew, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{unacknowledgedAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2"><Eye className="w-4 h-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />Alertas
            {unacknowledgedAlerts > 0 && <Badge variant="destructive" className="ml-1">{unacknowledgedAlerts}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Mapa</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar embarcação..." 
              value={searchTerm} 
              onChange={handleChange} 
              className="pl-10" 
            />
          </div>

          {/* Vessels Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredVessels.map((vessel) => (
              <Card 
                key={vessel.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""}`}
                onClick={handleSetSelectedVessel}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vessel.onlineStatus === "online" ? "bg-green-500/10" : vessel.onlineStatus === "degraded" ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                        <Ship className={`h-6 w-6 ${vessel.onlineStatus === "online" ? "text-green-500" : vessel.onlineStatus === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vessel.name}</h3>
                        <p className="text-xs text-muted-foreground">{vessel.type} • {vessel.dpClass}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getAsogStatusColor(vessel.asogStatus)}`} />
                      {getDPModeBadge(vessel.dpMode)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Wind className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental.windSpeed}kn</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Waves className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental.waveHeight}m</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Activity className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental.current}kn</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Potência</span>
                      <span className="font-medium">{Math.round(vessel.power.consumed / vessel.power.available * 100)}%</span>
                    </div>
                    <Progress value={vessel.power.consumed / vessel.power.available * 100} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Anchor className="h-3 w-3" />{vessel.operationType}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(vessel.lastUpdate).toLocaleTimeString("pt-BR")}</span>
                    {vessel.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">{vessel.alerts} alertas</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Central de Alertas da Frota</CardTitle>
              <CardDescription>Alertas em tempo real de todas as embarcações</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.type === "critical" && !alert.acknowledged 
                          ? "border-red-500/50 bg-red-500/5" 
                          : alert.type === "warning" && !alert.acknowledged 
                            ? "border-yellow-500/50 bg-yellow-500/5" 
                            : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            alert.type === "critical" ? "bg-red-500/10" : 
                              alert.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              alert.type === "critical" ? "text-red-500" : 
                                alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{alert.vesselName}</Badge>
                              <Badge variant={alert.type === "critical" ? "destructive" : alert.type === "warning" ? "default" : "secondary"}>
                                {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Atenção" : "Info"}
                              </Badge>
                              {alert.acknowledged && <Badge variant="outline" className="text-green-500 border-green-500">✓ Reconhecido</Badge>}
                            </div>
                            <p className="text-sm mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline" onClick={() => handlehandleAcknowledgeAlert}>
                            Reconhecer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Operações</CardTitle>
              <CardDescription>Visualização geográfica da frota em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-muted/30 rounded-lg border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-medium">Mapa Interativo</p>
                  <p className="text-sm">Integração com Mapbox/Leaflet disponível</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {vessels.map((v) => (
                      <Badge key={v.id} variant="outline" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getAsogStatusColor(v.asogStatus)}`} />
                        {v.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance da Frota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>DP Uptime Médio</span>
                    <span className="font-bold text-green-500">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Eficiência Operacional</span>
                    <span className="font-bold text-blue-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance ASOG</span>
                    <span className="font-bold text-green-500">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsão de Falhas (ML)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">PLSV Campos Star</span>
                    <Badge className="bg-yellow-500 text-black">75% risco</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Thruster #3 - manutenção recomendada em 48h</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">MV Atlantic Explorer</span>
                    <Badge className="bg-green-500">5% risco</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Todos os sistemas operando normalmente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetOperationsCenter;
