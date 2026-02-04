/**
 * Realtime Tracking Map - Mapa de Rastreamento em Tempo Real
 * Visualização de frota com posições, rotas e alertas
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ship,
  Navigation,
  MapPin,
  Anchor,
  AlertTriangle,
  Wind,
  Waves,
  Thermometer,
  Compass,
  Clock,
  Signal,
  Satellite,
  Eye,
  RefreshCw,
  Filter,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Route,
  Target,
  Radio,
  Activity,
  Gauge,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  lat: number;
  lng: number;
  course: number;
  speed: number;
  heading: number;
  status: "underway" | "anchored" | "moored" | "not_defined";
  destination: string;
  eta: Date;
  lastUpdate: Date;
  signalQuality: number;
}

interface WeatherData {
  location: string;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  temperature: number;
  visibility: number;
}

interface Alert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "weather" | "zone" | "equipment" | "ais";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

const MOCK_VESSELS: VesselPosition[] = [
  {
    id: "1",
    name: "MV Atlantic Star",
    imo: "9123456",
    type: "Bulk Carrier",
    flag: "🇧🇷",
    lat: -23.9618,
    lng: -46.3322,
    course: 45,
    speed: 12.5,
    heading: 47,
    status: "underway",
    destination: "Rotterdam",
    eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    lastUpdate: new Date(),
    signalQuality: 98,
  },
  {
    id: "2",
    name: "MV Pacific Explorer",
    imo: "9234567",
    type: "Container Ship",
    flag: "🇧🇷",
    lat: -22.8889,
    lng: -43.1729,
    course: 180,
    speed: 0,
    heading: 180,
    status: "moored",
    destination: "Santos",
    eta: new Date(),
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    signalQuality: 100,
  },
  {
    id: "3",
    name: "MV Nordic Spirit",
    imo: "9345678",
    type: "Tanker",
    flag: "🇳🇴",
    lat: -25.2521,
    lng: -48.5055,
    course: 270,
    speed: 8.2,
    heading: 268,
    status: "underway",
    destination: "Paranaguá",
    eta: new Date(Date.now() + 6 * 60 * 60 * 1000),
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    signalQuality: 92,
  },
];

const MOCK_WEATHER: WeatherData = {
  location: "Lat -23.96, Lng -46.33",
  windSpeed: 15,
  windDirection: 225,
  waveHeight: 1.8,
  temperature: 24,
  visibility: 12,
};

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    vesselId: "1",
    vesselName: "MV Atlantic Star",
    type: "weather",
    severity: "warning",
    message: "Tempestade prevista na rota em 48h",
    timestamp: new Date(),
  },
  {
    id: "2",
    vesselId: "3",
    vesselName: "MV Nordic Spirit",
    type: "zone",
    severity: "info",
    message: "Entrando em zona de proteção ambiental",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export default function RealtimeTrackingMap() {
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLayer, setMapLayer] = useState("standard");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredVessels = MOCK_VESSELS.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.imo.includes(searchQuery)
  );

  const getStatusBadge = (status: VesselPosition["status"]) => {
    const config = {
      underway: { label: "Navegando", color: "bg-green-500/10 text-green-500" },
      anchored: { label: "Ancorado", color: "bg-blue-500/10 text-blue-500" },
      moored: { label: "Atracado", color: "bg-purple-500/10 text-purple-500" },
      not_defined: { label: "Indefinido", color: "bg-gray-500/10 text-gray-500" },
    };
    const { label, color } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "weather":
        return <Wind className="h-4 w-4" />;
      case "zone":
        return <MapPin className="h-4 w-4" />;
      case "equipment":
        return <Activity className="h-4 w-4" />;
      case "ais":
        return <Signal className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{MOCK_VESSELS.length}</p>
                <p className="text-xs text-muted-foreground">Embarcações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Navigation className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {MOCK_VESSELS.filter((v) => v.status === "underway").length}
                </p>
                <p className="text-xs text-muted-foreground">Navegando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Anchor className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {MOCK_VESSELS.filter((v) => v.status === "moored" || v.status === "anchored").length}
                </p>
                <p className="text-xs text-muted-foreground">Em Porto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Satellite className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs text-muted-foreground">Cobertura AIS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{MOCK_ALERTS.length}</p>
                <p className="text-xs text-muted-foreground">Alertas Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa de Rastreamento
              </CardTitle>
              <CardDescription>
                Última atualização: {format(lastRefresh, "HH:mm:ss")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={mapLayer} onValueChange={setMapLayer}>
                <SelectTrigger className="w-32">
                  <Layers className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="satellite">Satélite</SelectItem>
                  <SelectItem value="nautical">Náutico</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map Placeholder */}
            <div className="relative h-[500px] bg-gradient-to-b from-blue-950 to-blue-900 rounded-lg overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full" style={{
                  backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "50px 50px"
                }} />
              </div>
              
              {/* Vessels */}
              {MOCK_VESSELS.map((vessel, index) => (
                <motion.div
                  key={vessel.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`absolute cursor-pointer transition-transform hover:scale-110 ${
                    selectedVessel?.id === vessel.id ? "z-20" : "z-10"
                  }`}
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 15}%`,
                    transform: `rotate(${vessel.heading}deg)`,
                  }}
                >
                  <div className="relative">
                    <Ship className={`h-8 w-8 ${
                      vessel.status === "underway" ? "text-green-400" :
                      vessel.status === "moored" ? "text-purple-400" :
                      "text-blue-400"
                    }`} style={{ transform: `rotate(-${vessel.heading}deg)` }} />
                    {selectedVessel?.id === vessel.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-background border rounded-lg p-2 shadow-lg whitespace-nowrap"
                      >
                        <p className="font-medium text-sm">{vessel.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vessel.speed} kn | {vessel.course}°
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Weather overlay */}
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Wind className="h-4 w-4 text-blue-400" />
                    <span>{MOCK_WEATHER.windSpeed} kn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Waves className="h-4 w-4 text-cyan-400" />
                    <span>{MOCK_WEATHER.waveHeight}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span>{MOCK_WEATHER.temperature}°C</span>
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Compass */}
              <div className="absolute top-4 right-4 p-2 bg-background/90 backdrop-blur rounded-full">
                <Compass className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vessel List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Embarcações
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredVessels.map((vessel) => (
                    <motion.div
                      key={vessel.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedVessel(vessel)}
                      className={`p-2 border rounded-lg cursor-pointer ${
                        selectedVessel?.id === vessel.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{vessel.flag}</span>
                          <span className="font-medium text-sm">{vessel.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Signal className={`h-3 w-3 ${
                            vessel.signalQuality > 90 ? "text-green-500" :
                            vessel.signalQuality > 70 ? "text-amber-500" :
                            "text-red-500"
                          }`} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>{vessel.speed} kn</span>
                        {getStatusBadge(vessel.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Vessel Details */}
          {selectedVessel && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {selectedVessel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground">Velocidade</p>
                    <p className="font-medium">{selectedVessel.speed} kn</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground">Curso</p>
                    <p className="font-medium">{selectedVessel.course}°</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground">Proa</p>
                    <p className="font-medium">{selectedVessel.heading}°</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground">Sinal</p>
                    <p className="font-medium">{selectedVessel.signalQuality}%</p>
                  </div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="font-medium">{selectedVessel.destination}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ETA: {format(selectedVessel.eta, "dd/MM HH:mm")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Route className="h-4 w-4 mr-1" />
                    Ver Rota
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {MOCK_ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-2 rounded-lg border ${
                        alert.severity === "critical" ? "border-destructive/50 bg-destructive/5" :
                        alert.severity === "warning" ? "border-amber-500/50 bg-amber-500/5" :
                        "border-blue-500/50 bg-blue-500/5"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.vesselName}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
