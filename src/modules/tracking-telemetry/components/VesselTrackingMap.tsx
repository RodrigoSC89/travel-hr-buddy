/**
 * VesselTrackingMap - Mapa de Rastreamento de Embarcações
 * Visualização em tempo real com dados AIS
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Ship, Navigation, Anchor, Wind, Waves,
  Thermometer, Fuel, Clock, AlertTriangle, Search,
  Maximize2, Layers, RefreshCw, Satellite, Radio
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  status: "underway" | "anchored" | "moored" | "not-under-command";
  position: { lat: number; lng: number };
  course: number;
  speed: number;
  destination: string;
  eta: string;
  lastUpdate: string;
  weather?: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    temperature: number;
  };
  fuel?: {
    remaining: number;
    consumption: number;
    range: number;
  };
}

const vessels: Vessel[] = [
  {
    id: "1",
    name: "MV Atlântico Sul",
    imo: "9123456",
    type: "Bulk Carrier",
    flag: "🇧🇷 Brasil",
    status: "underway",
    position: { lat: -23.9618, lng: -46.3322 },
    course: 185,
    speed: 12.5,
    destination: "Santos, Brazil",
    eta: "2026-02-05 08:00",
    lastUpdate: "2 min atrás",
    weather: { windSpeed: 15, windDirection: 210, waveHeight: 1.8, temperature: 28 },
    fuel: { remaining: 850, consumption: 45, range: 4500 }
  },
  {
    id: "2",
    name: "MV Horizonte",
    imo: "9234567",
    type: "Container Ship",
    flag: "🇧🇷 Brasil",
    status: "anchored",
    position: { lat: 51.9244, lng: 4.4777 },
    course: 0,
    speed: 0,
    destination: "Rotterdam, Netherlands",
    eta: "Arrived",
    lastUpdate: "5 min atrás",
    weather: { windSpeed: 22, windDirection: 270, waveHeight: 2.5, temperature: 8 },
    fuel: { remaining: 420, consumption: 0, range: 2800 }
  },
  {
    id: "3",
    name: "MV Oceano",
    imo: "9345678",
    type: "Tanker",
    flag: "🇵🇦 Panama",
    status: "underway",
    position: { lat: -22.9068, lng: -43.1729 },
    course: 45,
    speed: 14.2,
    destination: "Rio de Janeiro, Brazil",
    eta: "2026-02-04 22:00",
    lastUpdate: "1 min atrás",
    weather: { windSpeed: 12, windDirection: 90, waveHeight: 1.2, temperature: 30 },
    fuel: { remaining: 1200, consumption: 52, range: 5200 }
  },
  {
    id: "4",
    name: "MV Pacífico",
    imo: "9456789",
    type: "Bulk Carrier",
    flag: "🇱🇷 Liberia",
    status: "moored",
    position: { lat: -23.9548, lng: -46.3078 },
    course: 90,
    speed: 0,
    destination: "Santos, Brazil",
    eta: "Arrived",
    lastUpdate: "10 min atrás",
    fuel: { remaining: 320, consumption: 0, range: 1800 }
  },
];

function StatusBadge({ status }: { status: Vessel["status"] }) {
  const config = {
    underway: { label: "Navegando", className: "bg-success/10 text-success", icon: Navigation },
    anchored: { label: "Fundeado", className: "bg-warning/10 text-warning", icon: Anchor },
    moored: { label: "Atracado", className: "bg-primary/10 text-primary", icon: Ship },
    "not-under-command": { label: "S/ Comando", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={c.className}>
      <c.icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function VesselCard({ vessel, isSelected, onSelect }: { vessel: Vessel; isSelected: boolean; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-accent/30"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={vessel.status} />
            <span className="text-xs text-muted-foreground">{vessel.flag}</span>
          </div>
          <h4 className="font-medium mt-1">{vessel.name}</h4>
          <p className="text-sm text-muted-foreground">IMO: {vessel.imo} • {vessel.type}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{vessel.speed} kn</p>
          <p className="text-xs text-muted-foreground">{vessel.course}°</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {vessel.destination}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          ETA: {vessel.eta.includes("Arrived") ? "Chegou" : vessel.eta.split(" ")[1]}
        </div>
      </div>

      {vessel.weather && vessel.status === "underway" && (
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            {vessel.weather.windSpeed} kn
          </span>
          <span className="flex items-center gap-1">
            <Waves className="h-3 w-3" />
            {vessel.weather.waveHeight}m
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {vessel.weather.temperature}°C
          </span>
        </div>
      )}

      {vessel.fuel && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Fuel className="h-3 w-3" />
          {vessel.fuel.remaining}t • Range: {vessel.fuel.range}nm
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Atualizado: {vessel.lastUpdate}
      </p>
    </motion.div>
  );
}

function MapPlaceholder({ selectedVessel }: { selectedVessel: Vessel | null }) {
  return (
    <div className="relative h-full bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-cyan-900/20 rounded-lg overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Vessel Markers */}
      {vessels.map((vessel, idx) => (
        <motion.div
          key={vessel.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`absolute ${
            vessel.id === "1" ? "top-[40%] left-[30%]" :
            vessel.id === "2" ? "top-[25%] right-[35%]" :
            vessel.id === "3" ? "top-[50%] left-[45%]" :
            "top-[42%] left-[32%]"
          }`}
        >
          <div className={`relative ${selectedVessel?.id === vessel.id ? "z-10" : ""}`}>
            <div className={`p-2 rounded-full ${
              vessel.status === "underway" ? "bg-success" :
              vessel.status === "anchored" ? "bg-warning" :
              "bg-primary"
            } ${selectedVessel?.id === vessel.id ? "ring-4 ring-primary/30 animate-pulse" : ""}`}>
              <Ship className="h-4 w-4 text-white" style={{ transform: `rotate(${vessel.course}deg)` }} />
            </div>
            {selectedVessel?.id === vessel.id && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-background border rounded text-xs whitespace-nowrap"
              >
                {vessel.name}
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Tela cheia" title="Tela cheia">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Camadas" title="Camadas">
          <Layers className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Satélite" title="Satélite">
          <Satellite className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 bg-background/80 backdrop-blur border rounded-lg text-xs">
        <p className="font-medium mb-2">Legenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Navegando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Fundeado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Atracado</span>
          </div>
        </div>
      </div>

      {/* Center Message */}
      {!selectedVessel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Satellite className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Mapa de Rastreamento AIS</p>
            <p className="text-sm">Selecione uma embarcação para detalhes</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VesselTrackingMap() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVessels = vessels.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.imo.includes(searchTerm)
  );

  const stats = {
    total: vessels.length,
    underway: vessels.filter(v => v.status === "underway").length,
    anchored: vessels.filter(v => v.status === "anchored").length,
    moored: vessels.filter(v => v.status === "moored").length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Frota Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Navegando</p>
                <p className="text-2xl font-bold text-success">{stats.underway}</p>
              </div>
              <Navigation className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Fundeado</p>
                <p className="text-2xl font-bold text-warning">{stats.anchored}</p>
              </div>
              <Anchor className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Atracado</p>
                <p className="text-2xl font-bold text-info">{stats.moored}</p>
              </div>
              <MapPin className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-primary" />
                  Rastreamento em Tempo Real
                </CardTitle>
                <CardDescription>Dados AIS atualizados a cada 2 minutos</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <MapPlaceholder selectedVessel={selectedVessel} />
            </div>
          </CardContent>
        </Card>

        {/* Vessel List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Embarcações
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar embarcação..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredVessels.map((vessel) => (
                  <VesselCard
                    key={vessel.id}
                    vessel={vessel}
                    isSelected={selectedVessel?.id === vessel.id}
                    onSelect={() => setSelectedVessel(vessel)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
