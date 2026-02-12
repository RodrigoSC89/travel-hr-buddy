import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Globe,
  Ship,
  Anchor,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  MapPin,
  Gauge,
  Thermometer,
  Wind,
  Waves,
  Radio,
  Eye,
  Bell,
  TrendingUp,
  Clock,
  Users,
  Settings,
  Search,
  RefreshCw,
  Download
} from "lucide-react";
import { useFleetTracking, useFleetStats, type VesselLocation, type FleetAlert } from "@/hooks/useFleetTrackingData";

export const FleetOperationsCenter: React.FC = () => {
  const navigate = useNavigate();
  const { vessels, alerts, isLoading, error, refetch } = useFleetTracking();
  const stats = useFleetStats();
  const [localAlerts, setLocalAlerts] = useState<FleetAlert[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Sync remote alerts with local state for acknowledgement
  React.useEffect(() => {
    if (alerts.length > 0 && localAlerts.length === 0) {
      setLocalAlerts(alerts);
    }
  }, [alerts]);

  const displayAlerts = localAlerts.length > 0 ? localAlerts : alerts;

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcknowledgeAlert = (alertId: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido");
  };

  const getAsogStatusColor = (status: string | undefined) => {
    switch (status) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDPModeBadge = (mode: string | undefined) => {
    switch (mode) {
      case "Auto DP": return <Badge className="bg-green-500">Auto DP</Badge>;
      case "TAM": return <Badge className="bg-blue-500">TAM</Badge>;
      case "CAM": return <Badge className="bg-purple-500">CAM</Badge>;
      case "Joystick": return <Badge className="bg-yellow-500 text-black">Joystick</Badge>;
      case "Manual": return <Badge variant="destructive">Manual</Badge>;
      case "Standby": return <Badge variant="secondary">Standby</Badge>;
      default: return <Badge variant="outline">{mode || "N/A"}</Badge>;
    }
  };

  const unacknowledgedAlerts = displayAlerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = displayAlerts.filter(a => a.type === "critical" && !a.acknowledged).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={`fleet-ops-skel-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Erro ao carregar frota"
        description="Não foi possível carregar os dados da frota. Tente novamente."
        actionLabel="Tentar Novamente"
        onAction={refetch}
      />
    );
  }

  if (vessels.length === 0) {
    return (
      <EmptyState
        icon={Ship}
        title="Nenhuma embarcação cadastrada"
        description="Adicione embarcações ao sistema para visualizar o centro de operações."
        actionLabel="Ir para Frota"
        onAction={() => navigate("/fleet-command")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fleet Operations Center</h2>
            <p className="text-muted-foreground">Central de comando para telemetria da frota</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {criticalAlerts > 0 && (
            <Badge variant="destructive" className="animate-pulse px-3 py-1">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {criticalAlerts} Alertas Críticos
            </Badge>
          )}
          <Button variant="outline" onClick={() => refetch()}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
          <Button onClick={() => {
            const csvRows = ["Embarcação,Tipo,Status,DP Mode,Velocidade Vento,Altura Onda"].concat(
              vessels.map(v => `"${v.name}","${v.type}","${v.onlineStatus}","${v.dpMode}","${v.environmental?.windSpeed ?? ''}","${v.environmental?.waveHeight ?? ''}"`)
            );
            const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `fleet-report-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
            toast.success("Relatório CSV exportado");
          }}><Download className="w-4 h-4 mr-2" />Relatório</Button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Operação</p>
                <p className="text-2xl font-bold">{stats.activeVessels}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ASOG Alerta</p>
                <p className="text-2xl font-bold">{stats.asogAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulação Total</p>
                <p className="text-2xl font-bold">{stats.totalCrew}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{unacknowledgedAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2"><Eye className="w-4 h-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />Alertas
            {unacknowledgedAlerts > 0 && <Badge variant="destructive" className="ml-1">{unacknowledgedAlerts}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Mapa</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar embarcação..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>

          {/* Vessels Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredVessels.map((vessel) => (
              <Card 
                key={vessel.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedVessel(vessel)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vessel.onlineStatus === "online" ? "bg-green-500/10" : vessel.onlineStatus === "degraded" ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                        <Ship className={`h-6 w-6 ${vessel.onlineStatus === "online" ? "text-green-500" : vessel.onlineStatus === "degraded" ? "text-yellow-500" : "text-red-500"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vessel.name}</h3>
                        <p className="text-xs text-muted-foreground">{vessel.type} • {vessel.dpClass}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getAsogStatusColor(vessel.asogStatus)}`} />
                      {getDPModeBadge(vessel.dpMode)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Wind className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental?.windSpeed ?? 0}kn</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Waves className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental?.waveHeight ?? 0}m</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <Activity className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{vessel.environmental?.current ?? 0}kn</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Potência</span>
                      <span className="font-medium">{vessel.power ? Math.round((vessel.power.consumed / vessel.power.available) * 100) : 0}%</span>
                    </div>
                    <Progress value={vessel.power ? (vessel.power.consumed / vessel.power.available) * 100 : 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Anchor className="h-3 w-3" />{vessel.operationType || "Operação"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(vessel.last_update).toLocaleTimeString("pt-BR")}</span>
                    {(vessel.alerts || 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">{vessel.alerts} alertas</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Central de Alertas da Frota</CardTitle>
              <CardDescription>Alertas em tempo real de todas as embarcações</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {displayAlerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum alerta ativo no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border ${
                          alert.type === "critical" && !alert.acknowledged 
                            ? "border-red-500/50 bg-red-500/5" 
                            : alert.type === "warning" && !alert.acknowledged 
                            ? "border-yellow-500/50 bg-yellow-500/5" 
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              alert.type === "critical" ? "bg-red-500/10" : 
                              alert.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                            }`}>
                              <AlertTriangle className={`h-5 w-5 ${
                                alert.type === "critical" ? "text-red-500" : 
                                alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{alert.vesselName}</Badge>
                                <Badge variant={alert.type === "critical" ? "destructive" : alert.type === "warning" ? "default" : "secondary"}>
                                  {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Atenção" : "Info"}
                                </Badge>
                                {alert.acknowledged && <Badge variant="outline" className="text-green-500 border-green-500">✓ Reconhecido</Badge>}
                              </div>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                              Reconhecer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Operações</CardTitle>
              <CardDescription>Visualização geográfica da frota em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-muted/30 rounded-lg border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-medium">Mapa Interativo</p>
                  <p className="text-sm">Integração com Mapbox/Leaflet disponível</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {vessels.map((v) => (
                      <Badge key={v.id} variant="outline" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getAsogStatusColor(v.asogStatus)}`} />
                        {v.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance da Frota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>DP Uptime Médio</span>
                    <span className="font-bold text-green-500">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Eficiência Operacional</span>
                    <span className="font-bold text-blue-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance ASOG</span>
                    <span className="font-bold text-green-500">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsão de Falhas (ML)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">PLSV Campos Star</span>
                    <Badge className="bg-yellow-500 text-black">75% risco</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Thruster #3 - manutenção recomendada em 48h</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">MV Atlantic Explorer</span>
                    <Badge className="bg-green-500">5% risco</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Todos os sistemas operando normalmente</p>
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
