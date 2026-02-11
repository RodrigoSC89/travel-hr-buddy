/**
 * Mission Control Center - Premium Operations Component
 * Centro de controle de missões e viagens com timeline interativa
 * CONNECTED TO REAL DATA via useVoyageOperationsData
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ship, 
  Anchor, 
  Navigation, 
  Clock, 
  MapPin,
  Fuel,
  Users,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Compass,
  Wind,
  Waves,
  Thermometer,
  Eye,
  FileText,
  Radio,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoyageOperationsData, type MissionVoyage } from "@/hooks/useVoyageOperationsData";
import { Loader2 } from "lucide-react";

type Voyage = MissionVoyage;

const statusConfig = {
  planning: { label: "Planejamento", color: "bg-muted", icon: FileText },
  loading: { label: "Carregando", color: "bg-primary", icon: Anchor },
  underway: { label: "Em Viagem", color: "bg-success", icon: Navigation },
  anchored: { label: "Ancorado", color: "bg-warning", icon: Anchor },
  discharging: { label: "Descarregando", color: "bg-warning", icon: Anchor },
  completed: { label: "Concluída", color: "bg-success", icon: CheckCircle2 }
};

const milestoneConfig = {
  departure: { icon: Ship, color: "text-primary" },
  waypoint: { icon: Navigation, color: "text-accent-foreground" },
  arrival: { icon: Anchor, color: "text-success" },
  inspection: { icon: Eye, color: "text-warning" },
  bunkering: { icon: Fuel, color: "text-warning" }
};

export default function MissionControlCenter() {
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useVoyageOperationsData();

  const voyages = data?.voyages || [];
  const kpis = data?.kpis || { activeVoyages: 0, inTransit: 0, activeAlerts: 0, onTimeRate: 0 };

  // Auto-select first voyage when data loads
  const effectiveSelected = selectedVoyage || voyages[0] || null;

  const filteredVoyages = voyages.filter((v: Voyage) => 
    v.voyageNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vesselName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", { 
      day: "2-digit", 
      month: "short", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando missões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis.activeVoyages}</p>
                <p className="text-xs text-muted-foreground">Viagens Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Navigation className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis.inTransit}</p>
                <p className="text-xs text-muted-foreground">Em Trânsito</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis.activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Alertas Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpis.onTimeRate}%</p>
                <p className="text-xs text-muted-foreground">On-Time Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Voyage List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Viagens
            </CardTitle>
            <Input 
              placeholder="Buscar viagem..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredVoyages.map((voyage) => {
                  const StatusIcon = statusConfig[voyage.status].icon;
                  return (
                    <div
                      key={voyage.id}
                      onClick={() => setSelectedVoyage(voyage)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        (selectedVoyage?.id || effectiveSelected?.id) === voyage.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{voyage.voyageNumber}</p>
                          <p className="text-sm text-muted-foreground">{voyage.vesselName}</p>
                        </div>
                        <Badge className={cn("text-white", statusConfig[voyage.status].color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[voyage.status].label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {voyage.departurePort} → {voyage.arrivalPort}
                      </div>

                      {voyage.status === "underway" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span>{voyage.progress}%</span>
                          </div>
                          <Progress value={voyage.progress} className="h-2" />
                        </div>
                      )}

                      {voyage.alerts.filter(a => !a.acknowledged).length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-yellow-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">{voyage.alerts.filter(a => !a.acknowledged).length} alertas</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Voyage Details */}
        <Card className="lg:col-span-2">
          {effectiveSelected ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{effectiveSelected.voyageNumber}</CardTitle>
                    <CardDescription>
                      {effectiveSelected.vesselName} (IMO: {effectiveSelected.vesselIMO})
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Radio className="h-4 w-4 mr-2" />
                      Comunicação
                    </Button>
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver no Mapa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="alerts">Alertas</TabsTrigger>
                    <TabsTrigger value="weather">Clima</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Route Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Ship className="h-4 w-4 text-primary" />
                          <span className="font-medium">Origem</span>
                        </div>
                        <p className="text-lg font-semibold">{effectiveSelected.departurePort}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(effectiveSelected.departureTime)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Anchor className="h-4 w-4 text-primary" />
                          <span className="font-medium">Destino</span>
                        </div>
                        <p className="text-lg font-semibold">{effectiveSelected.arrivalPort}</p>
                        <p className="text-sm text-muted-foreground">
                          ETA: {formatDateTime(effectiveSelected.estimatedArrival)}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg border text-center">
                        <Compass className="h-5 w-5 mx-auto mb-1 text-info" />
                        <p className="text-lg font-bold">{effectiveSelected.currentSpeed} kn</p>
                        <p className="text-xs text-muted-foreground">Velocidade</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <Fuel className="h-5 w-5 mx-auto mb-1 text-warning" />
                        <p className="text-lg font-bold">{effectiveSelected.fuelRemaining}%</p>
                        <p className="text-xs text-muted-foreground">Combustível</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <Users className="h-5 w-5 mx-auto mb-1 text-success" />
                        <p className="text-lg font-bold">{effectiveSelected.crewOnboard}</p>
                        <p className="text-xs text-muted-foreground">Tripulação</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <Ship className="h-5 w-5 mx-auto mb-1 text-accent" />
                        <p className="text-lg font-bold">{effectiveSelected.cargoTonnage.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Toneladas</p>
                      </div>
                    </div>

                    {/* Progress */}
                    {effectiveSelected.status === "underway" && (
                      <div className="p-4 rounded-lg border">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Progresso da Viagem</span>
                          <span className="text-primary font-bold">{effectiveSelected.progress}%</span>
                        </div>
                        <Progress value={effectiveSelected.progress} className="h-3" />
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>{effectiveSelected.departurePort}</span>
                          <span>{effectiveSelected.arrivalPort}</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="timeline">
                    <div className="relative">
                      {effectiveSelected.milestones.map((milestone, index) => {
                        const config = milestoneConfig[milestone.type];
                        const MilestoneIcon = config.icon;
                        return (
                          <div key={milestone.id} className="flex gap-4 pb-6 last:pb-0">
                            <div className="relative">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                milestone.status === "completed" ? "bg-success/20 border-success" :
                                milestone.status === "in-progress" ? "bg-primary/20 border-primary animate-pulse" :
                                milestone.status === "delayed" ? "bg-destructive/20 border-destructive" :
                                "bg-muted border-border"
                              )}>
                                <MilestoneIcon className={cn("h-5 w-5", config.color)} />
                              </div>
                              {index < effectiveSelected.milestones.length - 1 && (
                                <div className="absolute top-10 left-1/2 w-0.5 h-full -translate-x-1/2 bg-border" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{milestone.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Planejado: {formatDateTime(milestone.plannedTime)}
                                  </p>
                                  {milestone.actualTime && (
                                    <p className="text-sm text-success">
                                      Real: {formatDateTime(milestone.actualTime)}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={
                                  milestone.status === "completed" ? "default" :
                                  milestone.status === "in-progress" ? "secondary" :
                                  milestone.status === "delayed" ? "destructive" : "outline"
                                }>
                                  {milestone.status === "completed" ? "Concluído" :
                                   milestone.status === "in-progress" ? "Em Andamento" :
                                   milestone.status === "delayed" ? "Atrasado" : "Pendente"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="alerts">
                    <div className="space-y-3">
                      {effectiveSelected.alerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum alerta ativo</p>
                        </div>
                      ) : (
                        effectiveSelected.alerts.map((alert) => (
                          <div 
                            key={alert.id}
                            className={cn(
                              "p-4 rounded-lg border-l-4",
                              alert.severity === "critical" ? "border-l-destructive bg-destructive/5" :
                              alert.severity === "warning" ? "border-l-warning bg-warning/5" :
                              "border-l-info bg-info/5"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={
                                    alert.severity === "critical" ? "destructive" :
                                    alert.severity === "warning" ? "secondary" : "outline"
                                  }>
                                    {alert.type.toUpperCase()}
                                  </Badge>
                                  {alert.acknowledged && (
                                    <Badge variant="outline" className="text-success">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Reconhecido
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDateTime(alert.timestamp)}
                                </p>
                              </div>
                              {!alert.acknowledged && (
                                <Button size="sm" variant="outline">
                                  Reconhecer
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="weather">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border text-center">
                        <Wind className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{effectiveSelected.weatherConditions.windSpeed}</p>
                        <p className="text-sm text-muted-foreground">Vento (kn)</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Waves className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{effectiveSelected.weatherConditions.waveHeight}</p>
                        <p className="text-sm text-muted-foreground">Ondas (m)</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-warning" />
                        <p className="text-2xl font-bold">{effectiveSelected.weatherConditions.temperature}°</p>
                        <p className="text-sm text-muted-foreground">Temperatura</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-success" />
                        <p className="text-lg font-bold">{effectiveSelected.weatherConditions.visibility}</p>
                        <p className="text-sm text-muted-foreground">Visibilidade</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <Ship className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma viagem para ver detalhes</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
