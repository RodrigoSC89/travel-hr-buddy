import { useEffect, useState } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Radio,
  Ship,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Radar,
  Navigation,
  Target,
  Anchor,
  Wind,
  Waves,
  Clock,
  Eye,
  RefreshCw,
  Settings,
  Zap,
  Bell,
  ArrowRight,
  CircleDot
} from "lucide-react";

interface AISVessel {
  mmsi: string;
  name: string;
  type: string;
  position: { lat: number; lon: number };
  course: number;
  speed: number;
  heading: number;
  destination?: string;
  eta?: string;
  status: "underway" | "anchored" | "moored" | "not_under_command";
  distance: number; // distance from own vessel in meters
  cpa: number; // closest point of approach in meters
  tcpa: number; // time to CPA in minutes
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
}

interface SimopsAlert {
  id: string;
  type: "approach" | "zone_entry" | "collision_risk" | "communication";
  severity: "info" | "warning" | "critical";
  vesselName: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const mockAISVessels: AISVessel[] = [
  {
    mmsi: "123456789",
    name: "FPSO Santos Basin",
    type: "FPSO",
    position: { lat: -22.9070, lon: -43.1730 },
    course: 0,
    speed: 0,
    heading: 45,
    status: "moored",
    distance: 450,
    cpa: 450,
    tcpa: 0,
    riskLevel: "none"
  },
  {
    mmsi: "987654321",
    name: "OSV Supply Master",
    type: "OSV",
    position: { lat: -22.9100, lon: -43.1750 },
    course: 275,
    speed: 8.5,
    heading: 270,
    destination: "FPSO Santos",
    eta: "14:30",
    status: "underway",
    distance: 1200,
    cpa: 350,
    tcpa: 25,
    riskLevel: "medium"
  },
  {
    mmsi: "567891234",
    name: "Anchor Handler III",
    type: "AHTS",
    position: { lat: -22.9050, lon: -43.1700 },
    course: 180,
    speed: 3.2,
    heading: 175,
    status: "underway",
    distance: 800,
    cpa: 150,
    tcpa: 15,
    riskLevel: "high"
  },
  {
    mmsi: "234567891",
    name: "Survey Vessel Alpha",
    type: "Survey",
    position: { lat: -22.9120, lon: -43.1780 },
    course: 90,
    speed: 4.0,
    heading: 88,
    status: "underway",
    distance: 2500,
    cpa: 1200,
    tcpa: 45,
    riskLevel: "low"
  }
];

const mockAlerts: SimopsAlert[] = [
  {
    id: "ALT-001",
    type: "approach",
    severity: "warning",
    vesselName: "Anchor Handler III",
    message: "Aproximação detectada - CPA 150m em 15 min",
    timestamp: new Date().toISOString(),
    acknowledged: false
  },
  {
    id: "ALT-002",
    type: "zone_entry",
    severity: "info",
    vesselName: "OSV Supply Master",
    message: "Entrando na zona de 2nm",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    acknowledged: true
  }
];

export const AISSimopsIntegration: React.FC = () => {
  const [vessels, setVessels] = useState<AISVessel[]>(mockAISVessels);
  const [alerts, setAlerts] = useState<SimopsAlert[]>(mockAlerts);
  const [selectedVessel, setSelectedVessel] = useState<AISVessel | null>(null);
  const [isAISEnabled, setIsAISEnabled] = useState(true);
  const [guardZone, setGuardZone] = useState(500);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate AIS updates
  useEffect(() => {
    if (!isAISEnabled) return;
    
    const interval = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        distance: v.distance + (Math.random() - 0.5) * 50,
        speed: Math.max(0, v.speed + (Math.random() - 0.5) * 0.5)
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isAISEnabled]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido");
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
    case "critical": return <Badge variant="destructive">Crítico</Badge>;
    case "high": return <Badge className="bg-orange-500">Alto</Badge>;
    case "medium": return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
    case "low": return <Badge className="bg-green-500">Baixo</Badge>;
    default: return <Badge variant="secondary">Nenhum</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "underway": return <Navigation className="h-4 w-4 text-green-500" />;
    case "anchored": return <Anchor className="h-4 w-4 text-yellow-500" />;
    case "moored": return <CircleDot className="h-4 w-4 text-blue-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const highRiskVessels = vessels.filter(v => ["high", "critical"].includes(v.riskLevel));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Radio className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Integração AIS + SIMOPS</h2>
            <p className="text-muted-foreground">Monitoramento de tráfego marítimo em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">AIS Feed</span>
            <Switch checked={isAISEnabled} onCheckedChange={setIsAISEnabled} />
          </div>
          <Button variant="outline" onClick={() => toast.info("Atualizando dados AIS...")}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Bell className="h-6 w-6 text-yellow-500 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-yellow-600">Alertas Ativos ({activeAlerts.length})</p>
                <div className="mt-2 space-y-2">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <div>
                        <p className="text-sm font-medium">{alert.vesselName}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                        Reconhecer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações AIS</p>
                <p className="text-2xl font-bold">{vessels.length}</p>
              </div>
              <Radar className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">{highRiskVessels.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zona de Guarda</p>
                <p className="text-2xl font-bold">{guardZone}m</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-yellow-600">{activeAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-lg font-bold">{lastUpdate.toLocaleTimeString("pt-BR")}</p>
              </div>
              <Clock className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* AIS Map */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5" />
              Radar AIS - Tráfego Marítimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg border overflow-hidden">
              {/* Grid */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              
              {/* Own vessel center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Ship className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <Badge>MV Atlantic Explorer</Badge>
                </div>
              </div>

              {/* Guard zone rings */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-yellow-500/50" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-blue-500/30" />

              {/* AIS vessels */}
              {vessels.map((vessel, i) => {
                const angle = (i / vessels.length) * 2 * Math.PI;
                const radius = Math.min(150, vessel.distance / 10);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const riskColors = {
                  critical: "bg-red-500",
                  high: "bg-orange-500",
                  medium: "bg-yellow-500",
                  low: "bg-green-500",
                  none: "bg-blue-500"
                };

                return (
                  <div
                    key={vessel.mmsi}
                    className={`absolute w-8 h-8 rounded-full ${riskColors[vessel.riskLevel]} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
                    style={{ 
                      top: `calc(50% + ${y}px)`, 
                      left: `calc(50% + ${x}px)`,
                      transform: "translate(-50%, -50%)"
                    }}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    {getStatusIcon(vessel.status)}
                    {/* Course indicator */}
                    <div 
                      className="absolute w-4 h-0.5 bg-white/70 origin-left"
                      style={{ 
                        transform: `rotate(${vessel.course - 90}deg)`,
                        left: "100%"
                      }}
                    />
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs font-medium mb-2">Nível de Risco</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Crítico</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span>Alto</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Médio</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Baixo</span></div>
                </div>
              </div>

              {/* AIS status */}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isAISEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-xs">{isAISEnabled ? "AIS Ativo" : "AIS Desabilitado"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vessel List & Details */}
        <div className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Zona de Guarda</span>
                  <span className="text-sm font-medium">{guardZone}m</span>
                </div>
                <Slider
                  value={[guardZone]}
                  onValueChange={([v]) => setGuardZone(v)}
                  min={100}
                  max={2000}
                  step={50}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alertas Automáticos</span>
                <Switch checked={autoAlerts} onCheckedChange={setAutoAlerts} />
              </div>
            </CardContent>
          </Card>

          {/* Vessel List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Embarcações Próximas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {vessels.sort((a, b) => a.distance - b.distance).map(vessel => (
                    <div
                      key={vessel.mmsi}
                      className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedVessel?.mmsi === vessel.mmsi ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(vessel.status)}
                          <div>
                            <p className="text-sm font-medium">{vessel.name}</p>
                            <p className="text-xs text-muted-foreground">{vessel.type}</p>
                          </div>
                        </div>
                        {getRiskBadge(vessel.riskLevel)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Dist: {vessel.distance}m</span>
                        <span>CPA: {vessel.cpa}m</span>
                        <span>TCPA: {vessel.tcpa}min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Vessel Details */}
      {selectedVessel && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                {selectedVessel.name}
              </CardTitle>
              {getRiskBadge(selectedVessel.riskLevel)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">MMSI</p>
                <p className="font-mono">{selectedVessel.mmsi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p>{selectedVessel.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Velocidade</p>
                <p>{selectedVessel.speed.toFixed(1)} kn</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rumo</p>
                <p>{selectedVessel.course}°</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPA</p>
                <p className={selectedVessel.cpa < 500 ? "text-red-600 font-bold" : ""}>{selectedVessel.cpa}m</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TCPA</p>
                <p>{selectedVessel.tcpa} min</p>
              </div>
            </div>
            {selectedVessel.destination && (
              <div className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Destino: {selectedVessel.destination}</span>
                {selectedVessel.eta && <Badge variant="outline">ETA: {selectedVessel.eta}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
