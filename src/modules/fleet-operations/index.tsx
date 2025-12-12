/**
import { useState } from "react";;
 * Fleet Operations Center - Módulo Unificado de Frota
 * PATCH UNIFY-2.0 - Fusão dos módulos de frota e operações
 * 
 * Módulos fundidos:
 * - fleet-dashboard → Fleet Operations
 * - fleet-tracking → Fleet Operations
 * - fleet-management → Fleet Operations
 * - operations-dashboard → Fleet Operations
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Ship, 
  MapPin, 
  Anchor,
  Navigation,
  Fuel,
  Users,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Globe,
  Compass,
  Waves,
  ThermometerSun,
  Wind,
  Search
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface Vessel {
  id: string;
  name: string;
  type: string;
  imo: string;
  status: "operational" | "maintenance" | "docked" | "transit";
  position: { lat: number; lng: number };
  destination: string;
  eta: Date;
  speed: number;
  heading: number;
  fuel: number;
  crew: number;
  lastMaintenance: Date;
  captain: string;
}

interface OperationalMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: number;
}

const FleetOperationsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { analyzeAudit, isLoading } = useNautilusEnhancementAI();

  const [vessels] = useState<Vessel[]>([
    {
      id: "1",
      name: "MV Nautilus Explorer",
      type: "PSV",
      imo: "9876543",
      status: "operational",
      position: { lat: -22.9068, lng: -43.1729 },
      destination: "Campo de Búzios",
      eta: new Date(Date.now() + 86400000),
      speed: 12.5,
      heading: 45,
      fuel: 78,
      crew: 24,
      lastMaintenance: new Date(Date.now() - 86400000 * 30),
      captain: "Cap. João Silva"
    },
    {
      id: "2",
      name: "MV Ocean Pioneer",
      type: "AHTS",
      imo: "9876544",
      status: "transit",
      position: { lat: -23.0068, lng: -44.1729 },
      destination: "Porto do Rio",
      eta: new Date(Date.now() + 172800000),
      speed: 10.2,
      heading: 180,
      fuel: 65,
      crew: 28,
      lastMaintenance: new Date(Date.now() - 86400000 * 45),
      captain: "Cap. Maria Santos"
    },
    {
      id: "3",
      name: "MV Deep Mariner",
      type: "DSV",
      imo: "9876545",
      status: "docked",
      position: { lat: -22.8068, lng: -43.0729 },
      destination: "Porto de Santos",
      eta: new Date(),
      speed: 0,
      heading: 0,
      fuel: 95,
      crew: 32,
      lastMaintenance: new Date(Date.now() - 86400000 * 15),
      captain: "Cap. Pedro Costa"
    },
    {
      id: "4",
      name: "MV Atlantic Star",
      type: "PSV",
      imo: "9876546",
      status: "maintenance",
      position: { lat: -22.7068, lng: -43.2729 },
      destination: "Estaleiro Brasfels",
      eta: new Date(Date.now() + 604800000),
      speed: 0,
      heading: 0,
      fuel: 45,
      crew: 12,
      lastMaintenance: new Date(),
      captain: "Cap. Ana Oliveira"
    }
  ]);

  const [metrics] = useState<OperationalMetric[]>([
    { name: "Disponibilidade", value: 92, unit: "%", status: "good", trend: 3 },
    { name: "Eficiência Operacional", value: 87, unit: "%", status: "good", trend: 5 },
    { name: "Consumo Médio", value: 245, unit: "t/dia", status: "warning", trend: -2 },
    { name: "Tripulantes Ativos", value: 96, unit: "", status: "good", trend: 0 }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "operational":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operacional</Badge>;
    case "transit":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em Trânsito</Badge>;
    case "docked":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Atracado</Badge>;
    case "maintenance":
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Manutenção</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
    case "good": return "text-green-400";
    case "warning": return "text-yellow-400";
    case "critical": return "text-red-400";
    default: return "text-foreground";
    }
  };

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imo.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30">
            <Ship className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fleet Operations Center</h1>
            <p className="text-muted-foreground">Centro de Operações da Frota</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar embarcação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            {vessels.filter(v => v.status === "operational" || v.status === "transit").length} embarcações ativas
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.name}</span>
                <Badge 
                  variant="outline" 
                  className={metric.trend > 0 ? "text-green-400" : metric.trend < 0 ? "text-red-400" : "text-muted-foreground"}
                >
                  {metric.trend > 0 ? "+" : ""}{metric.trend}%
                </Badge>
              </div>
              <div className={`text-3xl font-bold ${getMetricColor(metric.status)}`}>
                {metric.value}{metric.unit}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2">
            <Ship className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger value="tracking" className="gap-2">
            <MapPin className="h-4 w-4" />
            Rastreamento
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Activity className="h-4 w-4" />
            Operações
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status da Frota */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Status da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Operacional", count: vessels.filter(v => v.status === "operational").length, color: "bg-green-500" },
                    { label: "Em Trânsito", count: vessels.filter(v => v.status === "transit").length, color: "bg-blue-500" },
                    { label: "Atracado", count: vessels.filter(v => v.status === "docked").length, color: "bg-yellow-500" },
                    { label: "Manutenção", count: vessels.filter(v => v.status === "maintenance").length, color: "bg-orange-500" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className="font-bold text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas Ativos */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Alertas Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { vessel: "MV Atlantic Star", alert: "Manutenção programada", severity: "info" },
                    { vessel: "MV Ocean Pioneer", alert: "Nível de combustível baixo", severity: "warning" },
                    { vessel: "MV Deep Mariner", alert: "Certificado expira em 15 dias", severity: "warning" }
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                      {alert.severity === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-400 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{alert.vessel}</p>
                        <p className="text-xs text-muted-foreground">{alert.alert}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Condições Meteorológicas */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-primary" />
                  Condições Marítimas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Vento</span>
                    </div>
                    <span className="text-foreground font-medium">15 nós NE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Ondas</span>
                    </div>
                    <span className="text-foreground font-medium">1.5m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Temperatura</span>
                    </div>
                    <span className="text-foreground font-medium">24°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Visibilidade</span>
                    </div>
                    <span className="text-foreground font-medium">Boa (10nm+)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="mt-6">
          <div className="grid gap-4">
            {filteredVessels.map((vessel) => (
              <Card key={vessel.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Ship className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{vessel.name}</h3>
                          {getStatusBadge(vessel.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>IMO: {vessel.imo}</span>
                          <span>Tipo: {vessel.type}</span>
                          <span>Capitão: {vessel.captain}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vessel.destination}
                          </span>
                          {vessel.speed > 0 && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-4 w-4" />
                              {vessel.speed} nós
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {vessel.crew} tripulantes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Combustível:</span>
                        <Progress value={vessel.fuel} className="w-24" />
                        <span className="text-sm text-foreground">{vessel.fuel}%</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MapPin className="h-4 w-4 mr-1" />
                          Rastrear
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Mapa de Rastreamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Mapa de rastreamento em tempo real</p>
                  <p className="text-sm">Integração com AIS e serviços de satélite</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {vessels.map((vessel) => (
                  <div key={vessel.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full ${vessel.status === "operational" || vessel.status === "transit" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
                      <span className="text-sm font-medium text-foreground">{vessel.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Lat: {vessel.position.lat.toFixed(4)}</p>
                      <p>Lng: {vessel.position.lng.toFixed(4)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Operações em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { vessel: "MV Nautilus Explorer", operation: "Ressuprimento P-52", progress: 75, eta: "4h" },
                    { vessel: "MV Ocean Pioneer", operation: "Transporte de carga para FPSO", progress: 45, eta: "12h" },
                    { vessel: "MV Deep Mariner", operation: "Standby operacional", progress: 100, eta: "Aguardando" }
                  ].map((op, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{op.vessel}</span>
                        <Badge variant="outline">{op.eta}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{op.operation}</p>
                      <Progress value={op.progress} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Próximas Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vessels
                    .sort((a, b) => a.lastMaintenance.getTime() - b.lastMaintenance.getTime())
                    .slice(0, 3)
                    .map((vessel, i) => {
                      const daysSince = Math.floor((Date.now() - vessel.lastMaintenance.getTime()) / 86400000);
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium text-foreground">{vessel.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Última: {vessel.lastMaintenance.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge variant={daysSince > 30 ? "destructive" : "secondary"}>
                            {daysSince} dias
                          </Badge>
                        </div>
                      );
                    })}
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
