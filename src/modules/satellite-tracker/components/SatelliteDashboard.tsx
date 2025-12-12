/**
import { useCallback, useMemo, useEffect, useState } from "react";;
 * PATCH 501+: Enhanced Satellite Tracker Dashboard
 * Real-time satellite tracking with AI Copilot, DGNSS integration, and demo data
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Zap,
  Signal
} from "lucide-react";
import { SatelliteMap } from "./SatelliteMap";
import { OrbitVisualization } from "./OrbitVisualization";
import { CoverageMap } from "./CoverageMap";
import { SatelliteAlerts } from "./SatelliteAlerts";
import { SatelliteAICopilot } from "./SatelliteAICopilot";
import { SatelliteDetailPanel } from "./SatelliteDetailPanel";
import { DGNSSDashboard } from "./DGNSSDashboard";
import { DEMO_SATELLITES, updateSatellitePositions, type DemoSatellite } from "../data/demo-satellites";
import { toast } from "sonner";

export const SatelliteDashboard: React.FC = () => {
  const [satellites, setSatellites] = useState<DemoSatellite[]>(DEMO_SATELLITES);
  const [selectedSatellite, setSelectedSatellite] = useState<DemoSatellite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeMainTab, setActiveMainTab] = useState("tracker");
  const [showAICopilot, setShowAICopilot] = useState(true);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setSatellites(updateSatellitePositions(DEMO_SATELLITES));
      if (DEMO_SATELLITES.length > 0) {
        setSelectedSatellite(DEMO_SATELLITES[0]);
      }
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-update positions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites(prev => {
        const updated = updateSatellitePositions(prev);
        // Update selected satellite if it exists
        if (selectedSatellite) {
          const updatedSelected = updated.find(s => s.id === selectedSatellite.id);
          if (updatedSelected) {
            setSelectedSatellite(updatedSelected);
          }
        }
        return updated;
      });
      setLastUpdate(new Date());
    }, 10000);
    
    return () => clearInterval(interval);
  }, [selectedSatellite]);

  const handleRefresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSatellites(updateSatellitePositions(satellites));
      setLastUpdate(new Date());
      toast.success("Posições atualizadas com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar posições");
    } finally {
      setIsUpdating(false);
    }
  }, [satellites]);

  const getOrbitColor = (orbit: string) => {
    switch (orbit) {
    case "LEO": return "bg-blue-500";
    case "MEO": return "bg-green-500";
    case "GEO": return "bg-purple-500";
    case "HEO": return "bg-orange-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "active": return <Badge className="bg-green-500">Ativo</Badge>;
    case "inactive": return <Badge variant="secondary">Inativo</Badge>;
    case "maintenance": return <Badge className="bg-yellow-500">Manutenção</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeSatellites = satellites.filter(s => s.status === "active");
  const leoSatellites = satellites.filter(s => s.orbit_type === "LEO");
  const meoSatellites = satellites.filter(s => s.orbit_type === "MEO");
  const geoSatellites = satellites.filter(s => s.orbit_type === "GEO");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Carregando sistema de rastreamento...</p>
        </div>
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
          <span className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSetShowAICopilot}
          >
            <Bot className={`h-4 w-4 mr-2 ${showAICopilot ? "text-primary" : ""}`} />
            AI Copilot
          </Button>
          <Button onClick={handleRefresh} disabled={isUpdating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
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
                        onClick={handleSetSelectedSatellite}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Satellite className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm truncate max-w-[120px]">
                              {sat.satellite_name.split(" ")[0]}
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
                              sat.visibility === "visible" ? "text-green-500" : 
                                sat.visibility === "eclipsed" ? "text-gray-500" : "text-yellow-500"
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
            <Card className={`${showAICopilot ? "lg:col-span-5" : "lg:col-span-6"}`}>
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

            {/* Right Panel: Detail Panel or AI Copilot */}
            <div className={`${showAICopilot ? "lg:col-span-4" : "lg:col-span-3"} space-y-4`}>
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
