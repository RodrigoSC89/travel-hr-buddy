/**
 * Fleet Operations Panel - Real-time Fleet Operations Management
 * Painel de Operações da Frota em Tempo Real
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Ship,
  Anchor,
  Navigation,
  Fuel,
  Users,
  MapPin,
  Clock,
  Gauge,
  Wind,
  Waves,
  Compass,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Globe,
  Thermometer,
  Droplets,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";

interface VesselOperation {
  id: string;
  name: string;
  imo: string;
  status: "sailing" | "anchored" | "moored" | "maintenance" | "idle";
  position: { lat: number; lon: number };
  speed: number;
  heading: number;
  destination: string;
  eta: Date;
  fuelLevel: number;
  fuelConsumption: number;
  crew: number;
  cargo: number;
  cargoType: string;
  weather: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    visibility: number;
  };
  engines: {
    main: { rpm: number; temp: number; status: "running" | "standby" | "error" };
    aux: { rpm: number; temp: number; status: "running" | "standby" | "error" };
  };
  lastUpdate: Date;
}

export default function FleetOperationsPanel() {
  const [selectedVessel, setSelectedVessel] = useState<VesselOperation | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  // Fetch fleet data
  const { data: fleetData = [], isLoading, refetch } = useQuery({
    queryKey: ["fleet-operations-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  // Mock fleet for UI demonstration
  const fleet: VesselOperation[] = [
    {
      id: "v1",
      name: "MV Atlântico Sul",
      imo: "9876543",
      status: "sailing",
      position: { lat: -23.9618, lon: -46.3322 },
      speed: 14.5,
      heading: 45,
      destination: "Rotterdam",
      eta: new Date("2026-02-15T14:00:00"),
      fuelLevel: 78,
      fuelConsumption: 42,
      crew: 22,
      cargo: 45000,
      cargoType: "Container",
      weather: { windSpeed: 15, windDirection: 270, waveHeight: 2.1, visibility: 12 },
      engines: {
        main: { rpm: 95, temp: 82, status: "running" },
        aux: { rpm: 1200, temp: 68, status: "running" },
      },
      lastUpdate: new Date(),
    },
    {
      id: "v2",
      name: "MV Horizonte",
      imo: "9876544",
      status: "anchored",
      position: { lat: -22.8932, lon: -43.1729 },
      speed: 0,
      heading: 180,
      destination: "Houston",
      eta: new Date("2026-02-20T08:00:00"),
      fuelLevel: 92,
      fuelConsumption: 0,
      crew: 20,
      cargo: 0,
      cargoType: "Tanker - Awaiting Load",
      weather: { windSpeed: 8, windDirection: 120, waveHeight: 0.5, visibility: 18 },
      engines: {
        main: { rpm: 0, temp: 32, status: "standby" },
        aux: { rpm: 800, temp: 45, status: "running" },
      },
      lastUpdate: new Date(),
    },
    {
      id: "v3",
      name: "MV Oceano",
      imo: "9876545",
      status: "sailing",
      position: { lat: -25.5214, lon: -48.5098 },
      speed: 11.5,
      heading: 135,
      destination: "Shanghai",
      eta: new Date("2026-03-05T06:00:00"),
      fuelLevel: 65,
      fuelConsumption: 38,
      crew: 24,
      cargo: 52000,
      cargoType: "Grain Bulk",
      weather: { windSpeed: 22, windDirection: 315, waveHeight: 3.8, visibility: 8 },
      engines: {
        main: { rpm: 88, temp: 78, status: "running" },
        aux: { rpm: 1100, temp: 62, status: "running" },
      },
      lastUpdate: new Date(),
    },
    {
      id: "v4",
      name: "MV Pacífico",
      imo: "9876546",
      status: "moored",
      position: { lat: -20.3167, lon: -40.2867 },
      speed: 0,
      heading: 90,
      destination: "Qingdao",
      eta: new Date("2026-02-08T20:00:00"),
      fuelLevel: 45,
      fuelConsumption: 0,
      crew: 18,
      cargo: 68000,
      cargoType: "Iron Ore",
      weather: { windSpeed: 5, windDirection: 90, waveHeight: 0.3, visibility: 25 },
      engines: {
        main: { rpm: 0, temp: 28, status: "standby" },
        aux: { rpm: 600, temp: 42, status: "running" },
      },
      lastUpdate: new Date(),
    },
    {
      id: "v5",
      name: "MV Caribe",
      imo: "9876547",
      status: "maintenance",
      position: { lat: -23.9618, lon: -46.3322 },
      speed: 0,
      heading: 0,
      destination: "Santos",
      eta: new Date("2026-02-10T00:00:00"),
      fuelLevel: 30,
      fuelConsumption: 0,
      crew: 8,
      cargo: 0,
      cargoType: "N/A - In Drydock",
      weather: { windSpeed: 10, windDirection: 180, waveHeight: 0, visibility: 20 },
      engines: {
        main: { rpm: 0, temp: 25, status: "standby" },
        aux: { rpm: 0, temp: 25, status: "standby" },
      },
      lastUpdate: new Date(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sailing":
        return "bg-success text-success-foreground";
      case "anchored":
        return "bg-warning text-warning-foreground";
      case "moored":
        return "bg-primary text-primary-foreground";
      case "maintenance":
        return "bg-destructive text-destructive-foreground";
      case "idle":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sailing":
        return <Navigation className="h-4 w-4" />;
      case "anchored":
        return <Anchor className="h-4 w-4" />;
      case "moored":
        return <MapPin className="h-4 w-4" />;
      case "maintenance":
        return <Settings className="h-4 w-4 animate-spin" />;
      default:
        return <Ship className="h-4 w-4" />;
    }
  };

  const getEngineStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-success";
      case "standby":
        return "text-warning";
      case "error":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const fleetStats = {
    sailing: fleet.filter(v => v.status === "sailing").length,
    anchored: fleet.filter(v => v.status === "anchored").length,
    moored: fleet.filter(v => v.status === "moored").length,
    maintenance: fleet.filter(v => v.status === "maintenance").length,
    avgSpeed: fleet.filter(v => v.speed > 0).reduce((sum, v) => sum + v.speed, 0) / fleet.filter(v => v.speed > 0).length || 0,
    totalCrew: fleet.reduce((sum, v) => sum + v.crew, 0),
    totalCargo: fleet.reduce((sum, v) => sum + v.cargo, 0),
  };

  const performanceData = fleet.filter(v => v.status === "sailing").map(v => ({
    subject: v.name.replace("MV ", ""),
    speed: (v.speed / 18) * 100,
    fuel: v.fuelLevel,
    efficiency: 100 - (v.fuelConsumption / 50) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Navegando</span>
            </div>
            <p className="text-2xl font-bold text-success">{fleetStats.sailing}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Anchor className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Ancorados</span>
            </div>
            <p className="text-2xl font-bold text-warning">{fleetStats.anchored}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Atracados</span>
            </div>
            <p className="text-2xl font-bold text-primary">{fleetStats.moored}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-4 w-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Vel. Média</span>
            </div>
            <p className="text-2xl font-bold">{fleetStats.avgSpeed.toFixed(1)} kn</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Tripulação</span>
            </div>
            <p className="text-2xl font-bold">{fleetStats.totalCrew}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Carga Total</span>
            </div>
            <p className="text-2xl font-bold">{(fleetStats.totalCargo / 1000).toFixed(0)}k t</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar Posições
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Activity className="h-3 w-3" />
            Atualizado: {new Date().toLocaleTimeString("pt-BR")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Status da Frota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {fleet.map((vessel, idx) => (
                    <motion.div
                      key={vessel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-lg border hover:bg-accent/50 transition-all cursor-pointer ${
                        selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            vessel.status === "sailing" ? "bg-success/10" :
                            vessel.status === "maintenance" ? "bg-destructive/10" :
                            "bg-muted"
                          }`}>
                            {getStatusIcon(vessel.status)}
                          </div>
                          <div>
                            <h4 className="font-medium">{vessel.name}</h4>
                            <p className="text-xs text-muted-foreground">IMO: {vessel.imo}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(vessel.status)}>
                          {vessel.status === "sailing" ? "Navegando" :
                           vessel.status === "anchored" ? "Ancorado" :
                           vessel.status === "moored" ? "Atracado" :
                           vessel.status === "maintenance" ? "Manutenção" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Velocidade</p>
                          <p className="font-medium">{vessel.speed} kn</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Proa</p>
                          <p className="font-medium">{vessel.heading}°</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Combustível</p>
                          <div className="flex items-center gap-1">
                            <Progress value={vessel.fuelLevel} className="h-1.5 flex-1" />
                            <span className="text-xs">{vessel.fuelLevel}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Tripulação</p>
                          <p className="font-medium">{vessel.crew}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>→ {vessel.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>ETA: {vessel.eta.toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Weather Conditions */}
                      {vessel.status === "sailing" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            <span>{vessel.weather.windSpeed} kn</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Waves className="h-3 w-3" />
                            <span>{vessel.weather.waveHeight}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{vessel.weather.visibility} nm</span>
                          </div>
                          {vessel.weather.waveHeight > 3 && (
                            <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Mar agitado
                            </Badge>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details / Performance */}
        <div className="space-y-6">
          {selectedVessel ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  {selectedVessel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Engine Status */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Status dos Motores</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Motor Principal</span>
                        <Badge variant="outline" className={getEngineStatusColor(selectedVessel.engines.main.status)}>
                          {selectedVessel.engines.main.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>RPM:</span>
                          <span className="font-medium">{selectedVessel.engines.main.rpm}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temp:</span>
                          <span className="font-medium">{selectedVessel.engines.main.temp}°C</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Auxiliar</span>
                        <Badge variant="outline" className={getEngineStatusColor(selectedVessel.engines.aux.status)}>
                          {selectedVessel.engines.aux.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>RPM:</span>
                          <span className="font-medium">{selectedVessel.engines.aux.rpm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temp:</span>
                          <span className="font-medium">{selectedVessel.engines.aux.temp}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fuel */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Combustível</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nível</span>
                      <span className={`font-medium ${selectedVessel.fuelLevel < 30 ? "text-destructive" : ""}`}>
                        {selectedVessel.fuelLevel}%
                      </span>
                    </div>
                    <Progress value={selectedVessel.fuelLevel} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Consumo: {selectedVessel.fuelConsumption} t/dia</span>
                      <span>Autonomia: ~{Math.floor(selectedVessel.fuelLevel / (selectedVessel.fuelConsumption / 100 || 1))} dias</span>
                    </div>
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Carga</h5>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{(selectedVessel.cargo / 1000).toFixed(1)}k t</p>
                    <p className="text-xs text-muted-foreground">{selectedVessel.cargoType}</p>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Posição</h5>
                  <div className="text-sm space-y-1">
                    <p>Lat: {selectedVessel.position.lat.toFixed(4)}°</p>
                    <p>Lon: {selectedVessel.position.lon.toFixed(4)}°</p>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  Ver no Mapa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Velocidade"
                        dataKey="speed"
                        stroke="hsl(142, 71%, 45%)"
                        fill="hsl(142, 71%, 45%)"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Combustível"
                        dataKey="fuel"
                        stroke="hsl(217, 91%, 60%)"
                        fill="hsl(217, 91%, 60%)"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Clique em um navio para ver detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
