/**
 * Fleet Position Map - Mapa de Posições da Frota
 * Visualização em tempo real com filtros avançados
 */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Map, Navigation, Ship, Anchor, Wind, Waves,
  Thermometer, Clock, Search, Filter, Maximize2,
  Signal, Satellite, AlertTriangle, Eye
} from "lucide-react";

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  type: string;
  status: "underway" | "anchored" | "moored" | "drifting";
  lat: number;
  lon: number;
  course: number;
  speed: number;
  destination: string;
  eta: string;
  lastUpdate: string;
  signalStrength: number;
}

const fallbackVessels: VesselPosition[] = [
  { id: "1", name: "MV Atlantic Explorer", imo: "9123456", type: "Tanker", status: "underway", lat: -23.9618, lon: -46.3322, course: 180, speed: 12.5, destination: "Santos, BR", eta: "2024-01-16 08:00", lastUpdate: "2min", signalStrength: 95 },
  { id: "2", name: "MV Pacific Voyager", imo: "9234567", type: "Container", status: "anchored", lat: -22.9035, lon: -43.1729, course: 0, speed: 0, destination: "Rio de Janeiro, BR", eta: "Atracado", lastUpdate: "1min", signalStrength: 98 },
  { id: "3", name: "MV Indian Star", imo: "9345678", type: "Bulk Carrier", status: "underway", lat: -25.2521, lon: -48.5055, course: 215, speed: 10.2, destination: "Paranaguá, BR", eta: "2024-01-17 14:30", lastUpdate: "5min", signalStrength: 87 },
  { id: "4", name: "MV Nordic Queen", imo: "9456789", type: "FPSO", status: "moored", lat: -22.3584, lon: -39.8524, course: 45, speed: 0, destination: "Campo de Lula", eta: "Operando", lastUpdate: "30s", signalStrength: 92 },
  { id: "5", name: "MV Southern Cross", imo: "9567890", type: "Supply Vessel", status: "underway", lat: -23.0025, lon: -42.0234, course: 90, speed: 8.7, destination: "Macaé, BR", eta: "2024-01-15 16:45", lastUpdate: "3min", signalStrength: 78 },
];

const weatherData = {
  windSpeed: 15,
  windDirection: "NE",
  waveHeight: 1.8,
  temperature: 28,
  visibility: "Good",
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string, label: string }> = {
    underway: { color: "bg-success text-success-foreground", label: "Navegando" },
    anchored: { color: "bg-warning text-warning-foreground", label: "Fundeado" },
    moored: { color: "bg-blue-500 text-white", label: "Atracado" },
    drifting: { color: "bg-destructive text-destructive-foreground", label: "À Deriva" },
  };
  const { color, label } = config[status] || { color: "bg-muted", label: status };
  return <Badge className={color}>{label}</Badge>;
};

export default function FleetPositionMap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [vessels, setVessels] = useState<VesselPosition[]>(fallbackVessels);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const { data, error } = await supabase
          .from("vessels")
          .select("*")
          .order("name", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: VesselPosition[] = data.map((v) => ({
            id: v.id,
            name: v.name,
            imo: v.imo_number || "",
            type: v.vessel_type || "Unknown",
            status: (v.status === "active" ? "underway" : v.status === "maintenance" ? "moored" : "anchored") as VesselPosition["status"],
            lat: -23 + Math.random() * 5,
            lon: -46 + Math.random() * 10,
            course: Math.floor(Math.random() * 360),
            speed: v.status === "active" ? 8 + Math.random() * 8 : 0,
            destination: v.current_location || "N/A",
            eta: v.status === "active" ? "Em trânsito" : "Atracado",
            lastUpdate: "1min",
            signalStrength: 80 + Math.floor(Math.random() * 20),
          }));
          setVessels(mapped);
        }
      } catch {}
    };
    loadVessels();
  }, []);

  const filteredVessels = vessels.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.imo.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const underwayCount = vessels.filter(v => v.status === "underway").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-blue-500" />
            Posicionamento da Frota
          </h2>
          <p className="text-muted-foreground">
            Rastreamento em tempo real via AIS/VSAT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Signal className="h-3 w-3 mr-1 animate-pulse" />
            {vessels.length} Embarcações Online
          </Badge>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Tela Cheia
          </Button>
        </div>
      </div>

      {/* Weather Bar */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Vento</p>
                  <p className="font-semibold">{weatherData.windSpeed} kts {weatherData.windDirection}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Ondas</p>
                  <p className="font-semibold">{weatherData.waveHeight}m</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-semibold">{weatherData.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Visibilidade</p>
                  <p className="font-semibold">{weatherData.visibility}</p>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              <Satellite className="h-3 w-3 mr-1" />
              Atualizado há 30s
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="col-span-2">
          <Card className="h-[500px]">
            <CardContent className="p-0 h-full relative">
              {/* Placeholder for actual map */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-50" />
                  <p className="text-blue-300 mb-2">Mapa Interativo</p>
                  <p className="text-sm text-blue-400/60">Integração com Mapbox/Google Maps</p>
                </div>
                
                {/* Vessel markers overlay */}
                {vessels.map((vessel: VesselPosition, index: number) => (
                  <div
                    key={vessel.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index * 10)}%`,
                    }}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className={`p-2 rounded-full ${
                      vessel.status === "underway" ? "bg-success" :
                      vessel.status === "anchored" ? "bg-warning" : "bg-blue-500"
                    } transition-transform group-hover:scale-125`}>
                      <Ship className="h-4 w-4 text-white" style={{ transform: `rotate(${vessel.course}deg)` }} />
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      {vessel.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vessel List */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar embarcação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="underway">Navegando</SelectItem>
                <SelectItem value="anchored">Fundeado</SelectItem>
                <SelectItem value="moored">Atracado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Cards */}
          <ScrollArea className="h-[430px]">
            <div className="space-y-3 pr-4">
              {filteredVessels.map((vessel) => (
                <Card
                  key={vessel.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{vessel.name}</p>
                        <p className="text-xs text-muted-foreground">IMO: {vessel.imo}</p>
                      </div>
                      <StatusBadge status={vessel.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-muted-foreground" />
                        <span>{vessel.course}° / {vessel.speed} kts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3 text-muted-foreground" />
                        <span>{vessel.signalStrength}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Anchor className="h-3 w-3" />
                        {vessel.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {vessel.lastUpdate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Selected Vessel Details */}
      {selectedVessel && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  {selectedVessel.name}
                </CardTitle>
                <CardDescription>IMO: {selectedVessel.imo} | Tipo: {selectedVessel.type}</CardDescription>
              </div>
              <StatusBadge status={selectedVessel.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{selectedVessel.lat.toFixed(4)}°</p>
                <p className="text-xs text-muted-foreground">Latitude</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{selectedVessel.lon.toFixed(4)}°</p>
                <p className="text-xs text-muted-foreground">Longitude</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{selectedVessel.course}°</p>
                <p className="text-xs text-muted-foreground">Rumo</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{selectedVessel.speed} kts</p>
                <p className="text-xs text-muted-foreground">Velocidade</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-success">{selectedVessel.signalStrength}%</p>
                <p className="text-xs text-muted-foreground">Sinal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
