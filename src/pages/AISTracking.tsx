/**
 * AIS Tracking - Real-time Vessel Position Tracking
 * Global map with vessel positions via AIS satellite data
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  Ship,
  Satellite,
  MapPin,
  Navigation,
  Anchor,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Radio,
  Compass,
  Clock,
  Waves,
  Globe
} from "lucide-react";

interface VesselPosition {
  mmsi: string;
  imo?: string;
  name: string;
  callsign?: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  navStatus: string;
  shipType: string;
  destination?: string;
  eta?: string;
  lastUpdate: string;
  distance?: number;
}

interface FleetSummary {
  total: number;
  atSea: number;
  atAnchor: number;
  moored: number;
  avgSpeed: number;
}

export default function AISTracking() {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alerts, setAlerts] = useState<Array<{ vessel: string; message: string; severity: string }>>([]);

  const fetchFleetStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ais-tracking", {
        body: { operation: "fleet-status" }
      });

      if (error) throw error;

      setVessels(data.vessels || []);
      setSummary(data.summary || null);

      toast({
        title: "Dados atualizados",
        description: `${data.vessels?.length || 0} embarcações rastreadas`,
      });
    } catch (error) {
      logger.error("AIS error:", error);
      toast({
        title: "Erro ao buscar dados",
        description: "Falha na conexão com AIS",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const searchArea = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ais-tracking", {
        body: { 
          operation: "area-search",
          bounds: {
            north: -22,
            south: -25,
            east: -43,
            west: -46
          }
        }
      });

      if (error) throw error;

      setVessels(data.vessels || []);
      
      toast({
        title: "Busca concluída",
        description: `${data.count} embarcações na área`,
      });
    } catch (error) {
      logger.error("Area search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkProximity = async (lat: number, lon: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("ais-tracking", {
        body: { 
          operation: "proximity-alert",
          centerLat: lat,
          centerLon: lon,
          radiusNm: 10
        }
      });

      if (error) throw error;

      setAlerts(data.alerts || []);

      if (data.alerts?.length > 0) {
        toast({
          title: "Alerta de Proximidade",
          description: `${data.alerts.length} embarcação(ões) próxima(s)`,
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error("Proximity check error:", error);
    }
  };

  useEffect(() => {
    fetchFleetStatus();
  }, [fetchFleetStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchFleetStatus, 60000); // 1 min
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFleetStatus]);

  const filteredVessels = vessels.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.mmsi.includes(searchQuery) ||
    v.shipType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under way using engine": return "bg-success";
      case "At anchor": return "bg-warning";
      case "Moored": return "bg-primary";
      default: return "bg-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Under way using engine": return <Navigation className="h-4 w-4" />;
      case "At anchor": return <Anchor className="h-4 w-4" />;
      case "Moored": return <MapPin className="h-4 w-4" />;
      default: return <Ship className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            AIS Tracking
          </h1>
          <p className="text-muted-foreground">
            Rastreamento satelital de embarcações em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Radio className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`} />
            {autoRefresh ? "Live" : "Pausado"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFleetStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Ship className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total Frota</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Navigation className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.atSea}</p>
                <p className="text-sm text-muted-foreground">Em Navegação</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Anchor className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.atAnchor}</p>
                <p className="text-sm text-muted-foreground">Fundeados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.moored}</p>
                <p className="text-sm text-muted-foreground">Atracados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Waves className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgSpeed.toFixed(1)} kn</p>
                <p className="text-sm text-muted-foreground">Vel. Média</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Mapa de Posições
            </CardTitle>
            <CardDescription>
              Visualização geográfica das embarcações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg relative overflow-hidden">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              {/* Vessel Markers */}
              {filteredVessels.map((vessel, index) => (
                <div
                  key={vessel.mmsi}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(vessel.longitude + 46) * 20 + 10}%`,
                    top: `${(vessel.latitude + 25) * 30 + 10}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  onClick={() => {
                    setSelectedVessel(vessel);
                    checkProximity(vessel.latitude, vessel.longitude);
                  }}
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(vessel.navStatus)} animate-pulse`}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {vessel.name}
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/90 p-3 rounded-lg text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Em navegação</span>
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

              {/* Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button size="sm" variant="secondary" onClick={searchArea}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Área
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vessel List & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Embarcações
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, MMSI..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">Lista</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                <TabsTrigger value="alerts" className="flex-1">
                  Alertas
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredVessels.map((vessel) => (
                      <div
                        key={vessel.mmsi}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedVessel?.mmsi === vessel.mmsi ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedVessel(vessel)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(vessel.navStatus)}
                            <span className="font-medium">{vessel.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {vessel.shipType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Compass className="h-3 w-3" />
                            {vessel.course}°
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {vessel.speed.toFixed(1)} kn
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(vessel.lastUpdate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details">
                {selectedVessel ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Ship className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <h3 className="text-xl font-bold">{selectedVessel.name}</h3>
                      <p className="text-muted-foreground">{selectedVessel.shipType}</p>
                    </div>

                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">MMSI</TableCell>
                          <TableCell>{selectedVessel.mmsi}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">IMO</TableCell>
                          <TableCell>{selectedVessel.imo || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Callsign</TableCell>
                          <TableCell>{selectedVessel.callsign || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Posição</TableCell>
                          <TableCell>
                            {selectedVessel.latitude.toFixed(4)}°, {selectedVessel.longitude.toFixed(4)}°
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Curso</TableCell>
                          <TableCell>{selectedVessel.course}°</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Velocidade</TableCell>
                          <TableCell>{selectedVessel.speed.toFixed(1)} nós</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Status</TableCell>
                          <TableCell>
                            <Badge variant="outline">{selectedVessel.navStatus}</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Destino</TableCell>
                          <TableCell>{selectedVessel.destination || "-"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ETA</TableCell>
                          <TableCell>
                            {selectedVessel.eta 
                              ? new Date(selectedVessel.eta).toLocaleDateString("pt-BR")
                              : "-"
                            }
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <Button 
                      className="w-full" 
                      onClick={() => checkProximity(selectedVessel.latitude, selectedVessel.longitude)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Verificar Proximidade
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Ship className="h-12 w-12 mb-4 opacity-50" />
                    <p>Selecione uma embarcação</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="alerts">
                <ScrollArea className="h-[400px]">
                  {alerts.length > 0 ? (
                    <div className="space-y-2">
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg ${
                            alert.severity === "critical" 
                              ? "border-red-500 bg-red-500/10" 
                              : alert.severity === "warning"
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-blue-500 bg-blue-500/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === "critical" ? "text-red-500" : "text-yellow-500"
                            }`} />
                            <span className="font-medium">{alert.vessel}</span>
                          </div>
                          <p className="text-sm mt-1">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                      <p>Nenhum alerta ativo</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
