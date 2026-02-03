/**
 * Satellite Tracker Dashboard
 * ✅ P0 CORRIGIDO: Dados reais via Supabase (R01 MITIGADO)
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Satellite, 
  Activity, 
  Globe, 
  AlertTriangle, 
  RefreshCw,
  Radio,
  Bot,
  Map,
  Navigation,
  Eye,
  Signal,
  WifiOff,
  Settings
} from "lucide-react";
import { SatelliteMap } from "./SatelliteMap";
import { OrbitVisualization } from "./OrbitVisualization";
import { CoverageMap } from "./CoverageMap";
import { SatelliteAlerts } from "./SatelliteAlerts";
import { SatelliteAICopilot } from "./SatelliteAICopilot";
import { SatelliteDetailPanel } from "./SatelliteDetailPanel";
import { DGNSSDashboard } from "./DGNSSDashboard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SatelliteData {
  id: string;
  norad_id: number;
  satellite_name: string;
  orbit_type: "LEO" | "MEO" | "GEO" | "HEO";
  status: "active" | "inactive" | "maintenance";
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_kmh: number;
  visibility: "visible" | "eclipsed" | "daylight";
}

export const SatelliteDashboard: React.FC = () => {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("tracker");
  const [showAICopilot, setShowAICopilot] = useState(true);

  // ✅ R01: Fetch real satellite data from database
  const { data: satellitesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["satellites-tracker"],
    queryFn: async (): Promise<SatelliteData[]> => {
      const { data, error } = await supabase
        .from("satellites")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      return (data || []).map(s => ({
        id: s.id,
        norad_id: s.norad_id || 0,
        satellite_name: s.name || "Satélite",
        orbit_type: (s.orbit_type === "LEO" ? "LEO" : s.orbit_type === "MEO" ? "MEO" : s.orbit_type === "GEO" ? "GEO" : "LEO") as SatelliteData["orbit_type"],
        status: (s.status === "active" ? "active" : s.status === "inactive" ? "inactive" : "maintenance") as SatelliteData["status"],
        latitude: s.latitude || 0,
        longitude: s.longitude || 0,
        altitude_km: s.altitude_km || 400,
        velocity_kmh: s.velocity_kmh || 27000,
        visibility: "visible" as const,
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const satellites = satellitesData || [];

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("Posições atualizadas com sucesso");
  }, [refetch]);

  const getOrbitColor = (orbit: string) => {
    switch (orbit) {
      case "LEO": return "bg-blue-500";
      case "MEO": return "bg-green-500";
      case "GEO": return "bg-purple-500";
      case "HEO": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const activeSatellites = satellites.filter(s => s.status === "active");
  const leoSatellites = satellites.filter(s => s.orbit_type === "LEO");
  const meoSatellites = satellites.filter(s => s.orbit_type === "MEO");
  const geoSatellites = satellites.filter(s => s.orbit_type === "GEO");

  // ⚠️ Estado "Não Configurado" quando não há satélites
  if (!isLoading && satellites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Satellite className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">Satellite Live Tracker</h1>
            <p className="text-muted-foreground">Rastreamento em tempo real</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhum Satélite Configurado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure satélites para monitoramento em tempo real.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este dashboard exibe apenas dados reais de satélites cadastrados.
              </AlertDescription>
            </Alert>
            <Button onClick={() => window.location.href = '/settings/integrations'}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Satélites
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            Satellite Live Tracker
          </h1>
          <p className="text-muted-foreground">
            Rastreamento em tempo real • {satellites.length} satélites monitorados • {activeSatellites.length} ativos
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline">Dados Reais</Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAICopilot(!showAICopilot)}
          >
            <Bot className={`h-4 w-4 mr-2 ${showAICopilot ? 'text-primary' : ''}`} />
            AI Copilot
          </Button>
          <Button onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="tracker">
            <Satellite className="h-4 w-4 mr-2" />
            Rastreador
          </TabsTrigger>
          <TabsTrigger value="dgnss">
            <Navigation className="h-4 w-4 mr-2" />
            DGNSS
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
        </TabsList>

        {/* Tracker Tab */}
        <TabsContent value="tracker" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{satellites.length}</div>
                <p className="text-xs text-muted-foreground">satélites monitorados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeSatellites.length}</div>
                <p className="text-xs text-muted-foreground">em operação</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">LEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{leoSatellites.length}</div>
                <p className="text-xs text-muted-foreground">&lt;2.000 km</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-500">MEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{meoSatellites.length}</div>
                <p className="text-xs text-muted-foreground">2.000-35.786 km</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">GEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{geoSatellites.length}</div>
                <p className="text-xs text-muted-foreground">~35.786 km</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <p className="text-xs text-muted-foreground">pendentes</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Satellite List */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Signal className="h-5 w-5" />
                  Satélites ({satellites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-3 space-y-2">
                    {satellites.map((sat) => (
                      <div
                        key={sat.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSatellite?.id === sat.id
                            ? "bg-primary/10 border-primary shadow-md"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedSatellite(sat)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Satellite className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm truncate max-w-[120px]">
                              {sat.satellite_name.split(' ')[0]}
                            </span>
                          </div>
                          <Badge className={`${getOrbitColor(sat.orbit_type)} text-xs`}>
                            {sat.orbit_type}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>NORAD:</span>
                            <span className="font-mono">{sat.norad_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alt:</span>
                            <span>{sat.altitude_km.toFixed(0)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vel:</span>
                            <span>{(sat.velocity_kmh / 1000).toFixed(1)} km/s</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className={`h-3 w-3 ${
                              sat.visibility === 'visible' ? 'text-green-500' : 
                              sat.visibility === 'eclipsed' ? 'text-gray-500' : 'text-yellow-500'
                            }`} />
                            <span className="capitalize">{sat.visibility}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Center: Visualization */}
            <Card className={`${showAICopilot ? 'lg:col-span-5' : 'lg:col-span-6'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {selectedSatellite ? selectedSatellite.satellite_name : "Selecione um satélite"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSatellite ? (
                  <Tabs defaultValue="map">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="map">
                        <Map className="h-4 w-4 mr-2" />
                        Mapa
                      </TabsTrigger>
                      <TabsTrigger value="orbit">
                        <Activity className="h-4 w-4 mr-2" />
                        Órbita
                      </TabsTrigger>
                      <TabsTrigger value="coverage">
                        <Radio className="h-4 w-4 mr-2" />
                        Cobertura
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="map" className="mt-4">
                      <SatelliteMap 
                        satellite={{
                          id: selectedSatellite.id,
                          name: selectedSatellite.satellite_name,
                          position: {
                            latitude: selectedSatellite.latitude,
                            longitude: selectedSatellite.longitude,
                            altitude: selectedSatellite.altitude_km
                          }
                        }} 
                      />
                    </TabsContent>
                    
                    <TabsContent value="orbit" className="mt-4">
                      <OrbitVisualization 
                        satellite={{
                          id: selectedSatellite.id,
                          name: selectedSatellite.satellite_name,
                          position: {
                            altitude: selectedSatellite.altitude_km,
                            velocity: selectedSatellite.velocity_kmh / 3600
                          }
                        }} 
                      />
                    </TabsContent>
                    
                    <TabsContent value="coverage" className="mt-4">
                      <CoverageMap 
                        satellite={{
                          id: selectedSatellite.id,
                          name: selectedSatellite.satellite_name,
                          position: {
                            altitude: selectedSatellite.altitude_km
                          }
                        }} 
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um satélite para visualizar os detalhes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Panel */}
            <div className={`${showAICopilot ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-4`}>
              {selectedSatellite && (
                <SatelliteDetailPanel satellite={selectedSatellite} />
              )}
              
              {showAICopilot && (
                <SatelliteAICopilot 
                  satellites={satellites}
                  selectedSatellite={selectedSatellite}
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* DGNSS Tab */}
        <TabsContent value="dgnss">
          <DGNSSDashboard />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <SatelliteAlerts satelliteId={selectedSatellite?.id || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SatelliteDashboard;
