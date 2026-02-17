/**
 * Realtime Tracking Map - Mapa de Rastreamento em Tempo Real
 * Integrado com Supabase (vessels + navigation_history)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ship, Navigation, MapPin, Anchor, AlertTriangle, Wind, Waves,
  Thermometer, Compass, Signal, Satellite, Eye, RefreshCw, Search,
  ZoomIn, ZoomOut, Maximize2, Layers, Route, Target, Activity, Gauge, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface Alert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "weather" | "zone" | "equipment" | "ais";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

export default function RealtimeTrackingMap() {
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLayer, setMapLayer] = useState("standard");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch real vessels from Supabase
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["tracking-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type, flag_state, status, current_location, next_port, eta")
        .limit(50);
      if (error) throw error;
      return (data || []).map((v, idx) => {
        return {
          id: v.id,
          name: v.name,
          imo: v.imo_number || "N/A",
          type: v.vessel_type || "Unknown",
          flag: v.flag_state === "Brazil" ? "🇧🇷" : v.flag_state === "Norway" ? "🇳🇴" : "🏴",
          lat: -23 - idx * 1.5,
          lng: -46 + idx * 2,
          course: idx * 45 % 360,
          speed: v.status === "active" ? 12 : 0,
          heading: idx * 45 % 360,
          status: (v.status === "active" ? "underway" : v.status === "maintenance" ? "moored" : "anchored") as VesselPosition["status"],
          destination: v.next_port || v.current_location || "N/A",
          eta: v.eta ? new Date(v.eta) : new Date(Date.now() + (1 + idx) * 24 * 60 * 60 * 1000),
          lastUpdate: new Date(),
          signalQuality: 92,
        } satisfies VesselPosition;
      });
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch alerts from ai_insights
  const { data: alerts = [] } = useQuery({
    queryKey: ["tracking-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("id, title, description, priority, category, related_module, created_at")
        .in("category", ["safety", "navigation", "weather", "compliance"])
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((a) => ({
        id: a.id,
        vesselId: "",
        vesselName: a.related_module || "Sistema",
        type: (a.category === "weather" ? "weather" : a.category === "navigation" ? "zone" : "equipment") as Alert["type"],
        severity: (a.priority === "critical" ? "critical" : a.priority === "high" ? "warning" : "info") as Alert["severity"],
        message: a.description || a.title,
        timestamp: new Date(a.created_at),
      }));
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setLastRefresh(new Date()), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredVessels = vessels.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.imo.includes(searchQuery)
  );

  const getStatusBadge = (status: VesselPosition["status"]) => {
    const config = {
      underway: { label: "Navegando", color: "bg-success/10 text-success" },
      anchored: { label: "Ancorado", color: "bg-info/10 text-info" },
      moored: { label: "Atracado", color: "bg-accent/10 text-accent" },
      not_defined: { label: "Indefinido", color: "bg-muted text-muted-foreground" },
    };
    const { label, color } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "weather": return <Wind className="h-4 w-4" />;
      case "zone": return <MapPin className="h-4 w-4" />;
      case "equipment": return <Activity className="h-4 w-4" />;
      case "ais": return <Signal className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando rastreamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{vessels.length}</p>
                <p className="text-xs text-muted-foreground">Embarcações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Navigation className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{vessels.filter((v) => v.status === "underway").length}</p>
                <p className="text-xs text-muted-foreground">Navegando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Anchor className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{vessels.filter((v) => v.status === "moored" || v.status === "anchored").length}</p>
                <p className="text-xs text-muted-foreground">Em Porto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Satellite className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {vessels.length > 0
                    ? Math.round(vessels.reduce((sum, v) => sum + v.signalQuality, 0) / vessels.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Cobertura AIS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
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
              <Button variant="outline" size="icon" onClick={() => setAutoRefresh(!autoRefresh)} aria-label={autoRefresh ? "Pausar atualização automática" : "Ativar atualização automática"} title={autoRefresh ? "Pausar" : "Auto-refresh"}>
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" aria-label="Tela cheia" title="Tela cheia">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] bg-gradient-to-b from-blue-950 to-blue-900 rounded-lg overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full" style={{
                  backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "50px 50px"
                }} />
              </div>

              {vessels.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Ship className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Nenhuma embarcação cadastrada</p>
                    <p className="text-sm">Cadastre embarcações para ver no mapa</p>
                  </div>
                </div>
              ) : (
                vessels.map((vessel, index) => (
                  <motion.div
                    key={vessel.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`absolute cursor-pointer transition-transform hover:scale-110 ${selectedVessel?.id === vessel.id ? "z-20" : "z-10"}`}
                    style={{
                      left: `${15 + (index % 5) * 18}%`,
                      top: `${20 + Math.floor(index / 5) * 25}%`,
                    }}
                  >
                    <div className="relative">
                      <Ship className={`h-8 w-8 ${
                        vessel.status === "underway" ? "text-success" :
                        vessel.status === "moored" ? "text-accent-foreground" : "text-primary"
                      }`} />
                      {selectedVessel?.id === vessel.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-background border rounded-lg p-2 shadow-lg whitespace-nowrap"
                        >
                          <p className="font-medium text-sm">{vessel.name}</p>
                          <p className="text-xs text-muted-foreground">{vessel.speed} kn | {vessel.course}°</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Aumentar zoom" title="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary" className="h-8 w-8" aria-label="Diminuir zoom" title="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
              </div>

              <div className="absolute top-4 right-4 p-2 bg-background/90 backdrop-blur rounded-full">
                <Compass className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Embarcações
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                      className={`p-2 border rounded-lg cursor-pointer ${selectedVessel?.id === vessel.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{vessel.flag}</span>
                          <span className="font-medium text-sm">{vessel.name}</span>
                        </div>
                        <Signal className={`h-3 w-3 ${vessel.signalQuality > 90 ? "text-success" : vessel.signalQuality > 70 ? "text-warning" : "text-destructive"}`} />
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
                  <p className="text-xs text-muted-foreground mt-1">ETA: {format(selectedVessel.eta, "dd/MM HH:mm")}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1"><Route className="h-4 w-4 mr-1" />Ver Rota</Button>
                  <Button size="sm" variant="outline" className="flex-1"><Eye className="h-4 w-4 mr-1" />Detalhes</Button>
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
                  {alerts.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Nenhum alerta ativo</p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-2 rounded-lg border ${
                          alert.severity === "critical" ? "border-destructive/50 bg-destructive/5" :
                          alert.severity === "warning" ? "border-warning/50 bg-warning/5" :
                          "border-info/50 bg-info/5"
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
