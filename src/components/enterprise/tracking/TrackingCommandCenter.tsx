/**
 * TrackingCommandCenter - Centro de Rastreamento em Tempo Real
 * Enterprise-grade fleet tracking with AIS integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Ship, Navigation, Clock, AlertTriangle, 
  Wifi, WifiOff, Target, Anchor, Wind, Waves, Thermometer,
  Search, Filter, Download, RefreshCw, Satellite
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VesselPosition {
  vesselId: string;
  vesselName: string;
  imo: string;
  mmsi: string;
  flag: string;
  type: "tanker" | "bulk" | "container" | "offshore" | "passenger";
  status: "underway" | "at_anchor" | "moored" | "not_under_command";
  lat: number;
  lng: number;
  course: number;
  speed: number;
  heading: number;
  destination: string;
  eta: Date;
  lastUpdate: Date;
  signalQuality: "excellent" | "good" | "fair" | "poor";
  weather?: {
    wind: number;
    waves: number;
    temp: number;
  };
}

const mockPositions: VesselPosition[] = [
  {
    vesselId: "v1",
    vesselName: "MV Atlantic Star",
    imo: "9123456",
    mmsi: "123456789",
    flag: "🇧🇷",
    type: "tanker",
    status: "underway",
    lat: 51.8891,
    lng: 4.2577,
    course: 225,
    speed: 12.5,
    heading: 228,
    destination: "SINGAPORE",
    eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    signalQuality: "excellent",
    weather: { wind: 15, waves: 1.2, temp: 8 },
  },
  {
    vesselId: "v2",
    vesselName: "MV Pacific Dawn",
    imo: "9234567",
    mmsi: "234567890",
    flag: "🇵🇦",
    type: "bulk",
    status: "at_anchor",
    lat: 1.2644,
    lng: 103.8222,
    course: 0,
    speed: 0,
    heading: 45,
    destination: "SINGAPORE",
    eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    signalQuality: "good",
    weather: { wind: 8, waves: 0.5, temp: 28 },
  },
  {
    vesselId: "v3",
    vesselName: "MV Caribbean Blue",
    imo: "9345678",
    mmsi: "345678901",
    flag: "🇱🇷",
    type: "container",
    status: "moored",
    lat: 29.7604,
    lng: -95.3698,
    course: 0,
    speed: 0,
    heading: 180,
    destination: "HOUSTON",
    eta: new Date(),
    lastUpdate: new Date(Date.now() - 1 * 60 * 1000),
    signalQuality: "excellent",
    weather: { wind: 12, waves: 0.8, temp: 22 },
  },
];

const statusConfig = {
  underway: { label: "Em Navegação", color: "bg-green-500", icon: Navigation },
  at_anchor: { label: "Fundeado", color: "bg-amber-500", icon: Anchor },
  moored: { label: "Atracado", color: "bg-blue-500", icon: MapPin },
  not_under_command: { label: "Sem Comando", color: "bg-red-500", icon: AlertTriangle },
};

const signalColors = {
  excellent: "text-green-500",
  good: "text-lime-500",
  fair: "text-amber-500",
  poor: "text-red-500",
};

export function TrackingCommandCenter() {
  const [positions, setPositions] = useState<VesselPosition[]>(mockPositions);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => ({
        ...pos,
        lastUpdate: new Date(),
        speed: pos.status === "underway" ? pos.speed + (Math.random() - 0.5) * 0.5 : 0,
        course: pos.status === "underway" ? pos.course + (Math.random() - 0.5) * 2 : pos.course,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredPositions = positions.filter(pos => {
    const matchesSearch = pos.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pos.imo.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || pos.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: positions.length,
    underway: positions.filter(p => p.status === "underway").length,
    atAnchor: positions.filter(p => p.status === "at_anchor").length,
    moored: positions.filter(p => p.status === "moored").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Centro de Rastreamento
          </h2>
          <p className="text-muted-foreground">Posição em tempo real da frota via AIS</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isLive ? "default" : "outline"} 
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
            {isLive ? "AO VIVO" : "PAUSADO"}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rastreados</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Navegação</p>
                <p className="text-2xl font-bold text-green-600">{stats.underway}</p>
              </div>
              <Navigation className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundeados</p>
                <p className="text-2xl font-bold text-amber-600">{stats.atAnchor}</p>
              </div>
              <Anchor className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atracados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.moored}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar navio..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="underway">Navegando</SelectItem>
                <SelectItem value="at_anchor">Fundeado</SelectItem>
                <SelectItem value="moored">Atracado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPositions.map((vessel) => {
              const StatusIcon = statusConfig[vessel.status].icon;
              const isSelected = selectedVessel?.vesselId === vessel.vesselId;
              
              return (
                <motion.div
                  key={vessel.vesselId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{vessel.flag}</span>
                          <div>
                            <h4 className="font-semibold text-sm">{vessel.vesselName}</h4>
                            <p className="text-xs text-muted-foreground">IMO {vessel.imo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Satellite className={`h-4 w-4 ${signalColors[vessel.signalQuality]}`} />
                          <div className={`h-2 w-2 rounded-full ${statusConfig[vessel.status].color}`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Velocidade</p>
                          <p className="font-medium">{vessel.speed.toFixed(1)} kn</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rumo</p>
                          <p className="font-medium">{vessel.course.toFixed(0)}°</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Destino</p>
                          <p className="font-medium truncate">{vessel.destination}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <Badge className={`${statusConfig[vessel.status].color} text-white text-xs`}>
                          {statusConfig[vessel.status].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(vessel.lastUpdate, "HH:mm:ss")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Map Placeholder & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map Placeholder */}
          <Card className="h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Mapa de Rastreamento</p>
                <p className="text-sm opacity-75">Integração com Mapbox / AIS</p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  {positions.map((pos) => (
                    <div 
                      key={pos.vesselId}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10"
                    >
                      <div className={`h-2 w-2 rounded-full ${statusConfig[pos.status].color}`} />
                      <span className="text-xs">{pos.vesselName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Vessel Details */}
          <AnimatePresence>
            {selectedVessel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedVessel.flag}</span>
                        <div>
                          <CardTitle>{selectedVessel.vesselName}</CardTitle>
                          <CardDescription>
                            IMO {selectedVessel.imo} | MMSI {selectedVessel.mmsi}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${statusConfig[selectedVessel.status].color} text-white`}>
                        {statusConfig[selectedVessel.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="navigation">
                      <TabsList>
                        <TabsTrigger value="navigation">Navegação</TabsTrigger>
                        <TabsTrigger value="weather">Meteorologia</TabsTrigger>
                        <TabsTrigger value="voyage">Viagem</TabsTrigger>
                      </TabsList>

                      <TabsContent value="navigation" className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Latitude</p>
                            <p className="font-mono font-medium">{selectedVessel.lat.toFixed(4)}°</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Longitude</p>
                            <p className="font-mono font-medium">{selectedVessel.lng.toFixed(4)}°</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Velocidade</p>
                            <p className="font-medium">{selectedVessel.speed.toFixed(1)} knots</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Rumo</p>
                            <p className="font-medium">{selectedVessel.course.toFixed(0)}°</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Proa</p>
                            <p className="font-medium">{selectedVessel.heading}°</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Destino</p>
                            <p className="font-medium">{selectedVessel.destination}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">ETA</p>
                            <p className="font-medium">{format(selectedVessel.eta, "dd/MM HH:mm", { locale: ptBR })}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Sinal AIS</p>
                            <p className={`font-medium ${signalColors[selectedVessel.signalQuality]}`}>
                              {selectedVessel.signalQuality.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="weather" className="mt-4">
                        {selectedVessel.weather && (
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="pt-4 text-center">
                                <Wind className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <p className="text-2xl font-bold">{selectedVessel.weather.wind}</p>
                                <p className="text-xs text-muted-foreground">Vento (kn)</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4 text-center">
                                <Waves className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                                <p className="text-2xl font-bold">{selectedVessel.weather.waves}</p>
                                <p className="text-xs text-muted-foreground">Ondas (m)</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4 text-center">
                                <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                <p className="text-2xl font-bold">{selectedVessel.weather.temp}°</p>
                                <p className="text-xs text-muted-foreground">Temperatura</p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="voyage" className="mt-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                              <span>Origem</span>
                            </div>
                            <div className="flex-1 border-t border-dashed mx-4" />
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              <span>{selectedVessel.destination}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ETA: {format(selectedVessel.eta, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default TrackingCommandCenter;
