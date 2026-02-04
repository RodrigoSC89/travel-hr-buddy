/**
 * Voyage Planning Panel - Planejamento de Viagens Premium
 * Gestão completa de rotas, ETAs e otimização
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Map, Navigation, Anchor, Clock, Fuel, Wind, 
  Waves, Cloud, Ship, Target, Route, Calendar,
  Plus, Play, Pause, AlertTriangle, CheckCircle2,
  TrendingUp, DollarSign, Gauge, Thermometer, ArrowRight,
  MapPin, Compass, Timer, Zap, Brain, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  eta: string;
  status: "completed" | "current" | "upcoming";
  distance: number;
  weather?: {
    condition: string;
    windSpeed: number;
    waveHeight: number;
    visibility: string;
  };
}

interface Voyage {
  id: string;
  name: string;
  vessel: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  status: "planning" | "active" | "completed";
  progress: number;
  totalDistance: number;
  remainingDistance: number;
  averageSpeed: number;
  fuelConsumption: number;
  estimatedFuelCost: number;
  waypoints: Waypoint[];
  cargo: {
    type: string;
    quantity: number;
    unit: string;
  };
}

const CURRENT_VOYAGE: Voyage = {
  id: "v1",
  name: "Viagem Santos → Rotterdam",
  vessel: "MV Atlantic Star",
  origin: "Santos, Brasil",
  destination: "Rotterdam, Holanda",
  departureDate: "2024-01-15T08:00:00",
  arrivalDate: "2024-01-30T14:00:00",
  status: "active",
  progress: 45,
  totalDistance: 5842,
  remainingDistance: 3213,
  averageSpeed: 14.2,
  fuelConsumption: 45,
  estimatedFuelCost: 125000,
  cargo: {
    type: "Containers",
    quantity: 2450,
    unit: "TEU"
  },
  waypoints: [
    { 
      id: "w1", 
      name: "Santos (Origem)", 
      lat: -23.9618, 
      lon: -46.3322, 
      eta: "2024-01-15T08:00:00", 
      status: "completed", 
      distance: 0 
    },
    { 
      id: "w2", 
      name: "WP-01 (Costeira)", 
      lat: -22.8833, 
      lon: -42.0167, 
      eta: "2024-01-16T14:00:00", 
      status: "completed", 
      distance: 312,
      weather: { condition: "Céu limpo", windSpeed: 12, waveHeight: 1.2, visibility: "Boa" }
    },
    { 
      id: "w3", 
      name: "WP-02 (Atlântico)", 
      lat: -15.0000, 
      lon: -30.0000, 
      eta: "2024-01-20T06:00:00", 
      status: "current", 
      distance: 1450,
      weather: { condition: "Nublado", windSpeed: 18, waveHeight: 2.5, visibility: "Moderada" }
    },
    { 
      id: "w4", 
      name: "WP-03 (Equador)", 
      lat: 0.0000, 
      lon: -20.0000, 
      eta: "2024-01-23T12:00:00", 
      status: "upcoming", 
      distance: 2180,
      weather: { condition: "Chuva leve", windSpeed: 15, waveHeight: 2.0, visibility: "Moderada" }
    },
    { 
      id: "w5", 
      name: "WP-04 (Canárias)", 
      lat: 28.0000, 
      lon: -15.0000, 
      eta: "2024-01-26T18:00:00", 
      status: "upcoming", 
      distance: 3850 
    },
    { 
      id: "w6", 
      name: "Rotterdam (Destino)", 
      lat: 51.9244, 
      lon: 4.4777, 
      eta: "2024-01-30T14:00:00", 
      status: "upcoming", 
      distance: 5842 
    },
  ]
};

const upcomingVoyages = [
  { id: "v2", name: "Rotterdam → Singapore", date: "2024-02-05", distance: 8600, status: "planning" },
  { id: "v3", name: "Singapore → Shanghai", date: "2024-02-20", distance: 2200, status: "planning" },
  { id: "v4", name: "Shanghai → Los Angeles", date: "2024-03-05", distance: 9800, status: "planning" },
];

export default function VoyagePlanningPanel() {
  const [voyage] = useState<Voyage>(CURRENT_VOYAGE);
  const [showNewVoyageDialog, setShowNewVoyageDialog] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  const hoursRemaining = differenceInHours(new Date(voyage.arrivalDate), new Date());
  const etaStatus = hoursRemaining > 0 ? "on-time" : "delayed";

  return (
    <div className="space-y-6">
      {/* Current Voyage Overview */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Ship className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {voyage.name}
                  <Badge variant="default" className="ml-2">
                    <Play className="h-3 w-3 mr-1" />
                    Em Andamento
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Anchor className="h-3 w-3" />
                    {voyage.vessel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {voyage.cargo.quantity} {voyage.cargo.unit}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Map className="h-4 w-4 mr-2" />
                Ver Mapa
              </Button>
              <Button size="sm">
                <Gauge className="h-4 w-4 mr-2" />
                Otimizar Rota
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Route Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{voyage.origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{voyage.destination}</span>
                <MapPin className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="relative">
              <Progress value={voyage.progress} className="h-3" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"
                style={{ left: `${voyage.progress}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{format(new Date(voyage.departureDate), "dd/MM HH:mm")}</span>
              <span className="font-medium text-primary">{voyage.progress}% concluído</span>
              <span>{format(new Date(voyage.arrivalDate), "dd/MM HH:mm")}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Route className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{voyage.remainingDistance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">NM Restantes</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold">{Math.floor(hoursRemaining / 24)}d {hoursRemaining % 24}h</p>
              <p className="text-xs text-muted-foreground">Tempo Restante</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Gauge className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold">{voyage.averageSpeed}</p>
              <p className="text-xs text-muted-foreground">Velocidade (nós)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Fuel className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold">{voyage.fuelConsumption}</p>
              <p className="text-xs text-muted-foreground">Consumo (MT/dia)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <DollarSign className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <p className="text-lg font-bold">${(voyage.estimatedFuelCost/1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Custo Combustível</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Target className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold flex items-center justify-center gap-1">
                {etaStatus === "on-time" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                ETA
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(voyage.arrivalDate), "dd/MM HH:mm")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waypoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Waypoints da Rota
            </CardTitle>
            <CardDescription>
              {voyage.waypoints.length} pontos de passagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {voyage.waypoints.map((wp, index) => (
                  <motion.div
                    key={wp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                        wp.status === "current" ? "bg-primary/5 border-primary" :
                        wp.status === "completed" ? "bg-muted/30" : ""
                      }`}
                      onClick={() => setSelectedWaypoint(wp)}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          wp.status === "completed" ? "bg-success text-success-foreground" :
                          wp.status === "current" ? "bg-primary text-primary-foreground animate-pulse" :
                          "bg-muted"
                        }`}>
                          {wp.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : wp.status === "current" ? (
                            <Ship className="h-5 w-5" />
                          ) : (
                            <MapPin className="h-5 w-5" />
                          )}
                        </div>
                        {index < voyage.waypoints.length - 1 && (
                          <div className={`w-0.5 h-8 mt-2 ${
                            wp.status === "completed" ? "bg-success" : "bg-border"
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{wp.name}</h4>
                          <Badge variant={
                            wp.status === "completed" ? "outline" :
                            wp.status === "current" ? "default" : "secondary"
                          }>
                            {wp.status === "completed" ? "Concluído" :
                             wp.status === "current" ? "Posição Atual" : "Próximo"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Compass className="h-3 w-3" />
                            {wp.lat.toFixed(4)}°, {wp.lon.toFixed(4)}°
                          </span>
                          <span className="flex items-center gap-1">
                            <Route className="h-3 w-3" />
                            {wp.distance.toLocaleString()} NM
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(wp.eta), "dd/MM HH:mm")}
                          </span>
                        </div>

                        {wp.weather && (
                          <div className="flex items-center gap-3 mt-2 p-2 rounded bg-muted/50 text-xs">
                            <span className="flex items-center gap-1">
                              <Cloud className="h-3 w-3" />
                              {wp.weather.condition}
                            </span>
                            <span className="flex items-center gap-1">
                              <Wind className="h-3 w-3" />
                              {wp.weather.windSpeed} kts
                            </span>
                            <span className="flex items-center gap-1">
                              <Waves className="h-3 w-3" />
                              {wp.weather.waveHeight}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Optimization & Weather */}
        <div className="space-y-6">
          {/* Weather Alert */}
          <Card className="border-warning/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Alerta Meteorológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-warning/10">
                  <p className="text-sm font-medium">Frente Fria Aproximando</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ventos de 25-30 nós e ondas de 3-4m previstos para WP-03 em 48h.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" className="flex-1">
                    Ajustar Rota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Otimização IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-sm">Economia Sugerida</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduzir velocidade para 13.5 nós entre WP-02 e WP-04 pode economizar 
                  <span className="font-bold text-emerald-600"> $8,500</span> em combustível.
                </p>
                <Button size="sm" className="w-full mt-3" variant="outline">
                  <Sparkles className="h-3 w-3 mr-2" />
                  Aplicar Otimização
                </Button>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Route className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Rota Alternativa</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Desvio de 45 NM ao norte evita frente fria e mantém ETA original.
                </p>
                <Button size="sm" className="w-full mt-3" variant="outline">
                  Simular Rota
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Voyages */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Viagens
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowNewVoyageDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingVoyages.map((v) => (
                  <div 
                    key={v.id}
                    className="p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{v.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {v.distance.toLocaleString()} NM
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(v.date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
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
