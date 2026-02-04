/**
 * Tracking Command Center - Premium Telemetry Dashboard
 * Centro de Comando de Rastreamento e Telemetria
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Satellite, Activity, Radio, AlertTriangle, History,
  MapPin, Navigation, Anchor, Ship, Wifi, Signal, Compass,
  Clock, Eye, Target, Zap, Globe, ArrowRight, Sparkles,
  Battery, Thermometer, Gauge, Wind, Waves, Sun, Moon,
  RefreshCw, Settings, Bell, Search, Filter, MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Vessel {
  id: string;
  name: string;
  imo: string;
  position: { lat: number; lng: number };
  heading: number;
  speed: number;
  status: "sailing" | "anchored" | "moored" | "maintenance";
  lastUpdate: string;
  signalStrength: number;
  fuelLevel: number;
  engineTemp: number;
  alerts: number;
}

interface TelemetryData {
  vesselsOnline: number;
  totalVessels: number;
  avgSignal: number;
  activeAlerts: number;
  dataPoints: number;
  lastSync: string;
}

// Mock data - should connect to real Supabase
const mockVessels: Vessel[] = [
  { id: "1", name: "MV Atlântico Sul", imo: "IMO 9876543", position: { lat: -22.9068, lng: -43.1729 }, heading: 125, speed: 12.5, status: "sailing", lastUpdate: "10s", signalStrength: 95, fuelLevel: 78, engineTemp: 72, alerts: 0 },
  { id: "2", name: "MV Horizonte", imo: "IMO 9876544", position: { lat: -23.0068, lng: -42.8729 }, heading: 230, speed: 0, status: "anchored", lastUpdate: "15s", signalStrength: 88, fuelLevel: 65, engineTemp: 45, alerts: 1 },
  { id: "3", name: "MV Oceano", imo: "IMO 9876545", position: { lat: -22.7068, lng: -43.4729 }, heading: 45, speed: 8.2, status: "sailing", lastUpdate: "5s", signalStrength: 92, fuelLevel: 82, engineTemp: 68, alerts: 0 },
  { id: "4", name: "MV Pacífico", imo: "IMO 9876546", position: { lat: -22.5068, lng: -43.7729 }, heading: 180, speed: 0, status: "moored", lastUpdate: "8s", signalStrength: 98, fuelLevel: 95, engineTemp: 35, alerts: 0 },
  { id: "5", name: "MV Caribe", imo: "IMO 9876547", position: { lat: -23.2068, lng: -44.1729 }, heading: 90, speed: 15.8, status: "sailing", lastUpdate: "12s", signalStrength: 75, fuelLevel: 45, engineTemp: 78, alerts: 2 },
];

const telemetryStats: TelemetryData = {
  vesselsOnline: 14,
  totalVessels: 15,
  avgSignal: 89,
  activeAlerts: 3,
  dataPoints: 1247852,
  lastSync: "2s ago"
};

// Vessel Status Badge
function VesselStatusBadge({ status }: { status: Vessel["status"] }) {
  const variants = {
    sailing: { label: "Navegando", className: "bg-success/10 text-success border-success/20", icon: Navigation },
    anchored: { label: "Ancorado", className: "bg-warning/10 text-warning border-warning/20", icon: Anchor },
    moored: { label: "Atracado", className: "bg-primary/10 text-primary border-primary/20", icon: MapPin },
    maintenance: { label: "Manutenção", className: "bg-muted text-muted-foreground", icon: Settings },
  };
  const variant = variants[status];
  const Icon = variant.icon;
  
  return (
    <Badge variant="outline" className={`${variant.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </Badge>
  );
}

// Signal Strength Indicator
function SignalIndicator({ strength }: { strength: number }) {
  const bars = Math.ceil(strength / 25);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-full transition-all ${
            bar <= bars ? "bg-success" : "bg-muted"
          }`}
          style={{ height: `${bar * 4 + 4}px` }}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{strength}%</span>
    </div>
  );
}

// Live Vessel Card
function VesselCard({ vessel, onSelect }: { vessel: Vessel; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-xl border hover:border-primary/50 transition-all cursor-pointer bg-card"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${vessel.status === "sailing" ? "bg-success/10" : "bg-primary/10"}`}>
            <Ship className={`h-5 w-5 ${vessel.status === "sailing" ? "text-success" : "text-primary"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{vessel.name}</p>
              {vessel.alerts > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {vessel.alerts}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{vessel.imo}</p>
          </div>
        </div>
        <VesselStatusBadge status={vessel.status} />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <Compass className="h-4 w-4 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium mt-1">{vessel.heading}°</p>
          <p className="text-[10px] text-muted-foreground">Heading</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <Gauge className="h-4 w-4 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium mt-1">{vessel.speed} kn</p>
          <p className="text-[10px] text-muted-foreground">Velocidade</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <Battery className="h-4 w-4 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium mt-1">{vessel.fuelLevel}%</p>
          <p className="text-[10px] text-muted-foreground">Combustível</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <Thermometer className="h-4 w-4 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium mt-1">{vessel.engineTemp}°C</p>
          <p className="text-[10px] text-muted-foreground">Motor</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Atualizado há {vessel.lastUpdate}
        </div>
        <SignalIndicator strength={vessel.signalStrength} />
      </div>
    </motion.div>
  );
}

// Real-time Stats Panel
function RealtimeStatsPanel({ stats }: { stats: TelemetryData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-success">{stats.vesselsOnline}</p>
                <p className="text-xs">de {stats.totalVessels} navios</p>
              </div>
              <Wifi className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sinal Médio</p>
                <p className="text-2xl font-bold">{stats.avgSignal}%</p>
                <p className="text-xs">Qualidade</p>
              </div>
              <Signal className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-warning">{stats.activeAlerts}</p>
                <p className="text-xs">Ativos</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold text-purple-600">{(stats.dataPoints / 1000000).toFixed(1)}M</p>
                <p className="text-xs">Coletados</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Satélites</p>
                <p className="text-2xl font-bold text-cyan-600">4</p>
                <p className="text-xs">Conectados</p>
              </div>
              <Satellite className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sync</p>
                <p className="text-2xl font-bold text-emerald-600">Live</p>
                <p className="text-xs">{stats.lastSync}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-emerald-500 opacity-60 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Alert Panel
function AlertsPanel() {
  const alerts = [
    { id: "1", vessel: "MV Caribe", type: "fuel", message: "Nível de combustível baixo (45%)", priority: "high", time: "2m" },
    { id: "2", vessel: "MV Caribe", type: "temp", message: "Temperatura do motor elevada", priority: "high", time: "5m" },
    { id: "3", vessel: "MV Horizonte", type: "position", message: "Desvio de rota detectado", priority: "medium", time: "15m" },
  ];

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-destructive" />
            Alertas Ativos
          </CardTitle>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  alert.priority === "high" ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{alert.vessel}</p>
                  <span className="text-xs text-muted-foreground">{alert.time} atrás</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Dispensar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// AI Predictions Panel
function AIPredictionsPanel() {
  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          IA Preditiva
        </CardTitle>
        <CardDescription>Análises e previsões em tempo real</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-success" />
            <span className="font-medium text-sm">ETA Otimizado</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            MV Atlântico Sul chegará 2h antes do previsto baseado no padrão de correntes.
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-warning" />
            <span className="font-medium text-sm">Alerta Meteorológico</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Frente fria prevista para região do MV Caribe em 6h. Sugerir rota alternativa.
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Consumo de Combustível</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Redução de 8% no consumo detectada após otimização de velocidade.
          </p>
        </div>
        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Ver Todas as Previsões
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TrackingCommandCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [vessels] = useState(mockVessels);

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.imo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    toast.info(`Focando em ${vessel.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <RealtimeStatsPanel stats={telemetryStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Frota em Tempo Real
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar embarcação..."
                      className="pl-8 h-8 w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredVessels.map((vessel) => (
                    <VesselCard 
                      key={vessel.id} 
                      vessel={vessel} 
                      onSelect={() => handleVesselSelect(vessel)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <AlertsPanel />
          <AIPredictionsPanel />
        </div>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Mapa da Frota
          </CardTitle>
          <CardDescription>Visualização geográfica em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto text-primary/30" />
              <p className="text-muted-foreground mt-2">Mapa interativo integrado</p>
              <Button className="mt-4 gap-2">
                <Eye className="h-4 w-4" />
                Abrir Mapa Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
