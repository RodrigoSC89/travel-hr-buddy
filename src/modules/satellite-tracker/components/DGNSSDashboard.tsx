/**
import { useEffect, useState, useCallback } from "react";;
 * DGNSS Satellite Tracking Dashboard
 * Combines satellite tracking with Windy weather visualization
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Satellite, 
  Activity, 
  Globe, 
  Radio, 
  RefreshCw, 
  Signal,
  Navigation,
  Target,
  Compass,
  Clock
} from "lucide-react";
import { dgnssService, DGNSSSatellite, DGNSSStation, DGNSS_SATELLITES } from "@/services/dgnss-service";
import { WindyMapPlugin } from "@/components/maps/WindyMapPlugin";
import { toast } from "sonner";

interface ConstellationStatus {
  constellation: string;
  visible: number;
  pdop: number;
}

export const DGNSSDashboard: React.FC = () => {
  const [satellites, setSatellites] = useState<DGNSSSatellite[]>([]);
  const [stations, setStations] = useState<DGNSSStation[]>([]);
  const [constellationStatus, setConstellationStatus] = useState<ConstellationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [observerLocation, setObserverLocation] = useState({
    lat: -22.9068,
    lng: -43.1729,
    alt: 0,
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(updateData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch satellites above location
      const sats = await dgnssService.getSatellitesAbove(
        observerLocation.lat,
        observerLocation.lng,
        observerLocation.alt,
        90,
        18 // GPS constellation
      );
      setSatellites(sats);
      
      // Fetch DGNSS stations
      const stns = await dgnssService.getDGNSSStations();
      setStations(stns);
      
      // Get constellation status
      const status = await dgnssService.getConstellationStatus(
        observerLocation.lat,
        observerLocation.lng
      );
      setConstellationStatus(status);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading DGNSS data:", error);
      toast.error("Erro ao carregar dados DGNSS");
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      const sats = await dgnssService.getSatellitesAbove(
        observerLocation.lat,
        observerLocation.lng,
        observerLocation.alt
      );
      setSatellites(sats);
      
      const status = await dgnssService.getConstellationStatus(
        observerLocation.lat,
        observerLocation.lng
      );
      setConstellationStatus(status);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error updating DGNSS data:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: "online" | "offline" | "maintenance") => {
    switch (status) {
    case "online": return "bg-green-500";
    case "offline": return "bg-red-500";
    case "maintenance": return "bg-yellow-500";
    default: return "bg-gray-500";
    }
  };

  const getPDOPQuality = (pdop: number) => {
    if (pdop <= 2) return { label: "Excelente", color: "text-green-500" };
    if (pdop <= 4) return { label: "Bom", color: "text-blue-500" };
    if (pdop <= 6) return { label: "Moderado", color: "text-yellow-500" };
    return { label: "Ruim", color: "text-red-500" };
  };

  const getConstellationIcon = (constellation: string) => {
    switch (constellation) {
    case "GPS": return "🇺🇸";
    case "GLONASS": return "🇷🇺";
    case "GALILEO": return "🇪🇺";
    case "SBAS": return "📡";
    default: return "🛰️";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando sistema DGNSS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="h-8 w-8" />
            DGNSS Satellite Tracker
          </h1>
          <p className="text-muted-foreground">
            Sistema diferencial GNSS • {satellites.length} satélites visíveis
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button onClick={updateData} disabled={isUpdating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Constellation Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {constellationStatus.map((cs) => {
          const pdopQuality = getPDOPQuality(cs.pdop);
          return (
            <Card key={cs.constellation}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span>{getConstellationIcon(cs.constellation)}</span>
                  {cs.constellation}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{cs.visible}</div>
                    <div className="text-xs text-muted-foreground">satélites visíveis</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${pdopQuality.color}`}>
                      {cs.pdop.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">{pdopQuality.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Satellite List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Satélites Visíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {satellites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum satélite visível na região
              </p>
            ) : (
              satellites.map((sat) => (
                <div
                  key={sat.satid}
                  className="p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      <span className="font-medium text-sm">{sat.satname}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sat.satid}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Lat:</span>
                      <span>{sat.satlat.toFixed(4)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lng:</span>
                      <span>{sat.satlng.toFixed(4)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alt:</span>
                      <span>{sat.satalt.toFixed(0)} km</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Map Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weather">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weather">
                  <Activity className="h-4 w-4 mr-2" />
                  Clima (Windy)
                </TabsTrigger>
                <TabsTrigger value="stations">
                  <Radio className="h-4 w-4 mr-2" />
                  Estações DGNSS
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weather" className="mt-4">
                <WindyMapPlugin
                  latitude={observerLocation.lat}
                  longitude={observerLocation.lng}
                  zoom={4}
                  height="400px"
                  showControls={true}
                  overlay="wind"
                />
              </TabsContent>
              
              <TabsContent value="stations" className="mt-4">
                <div className="space-y-3">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          <span className="font-medium">{station.name}</span>
                        </div>
                        <Badge className={getStatusColor(station.status)}>
                          {station.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>Precisão: {station.accuracy} cm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          <span>
                            {station.latitude.toFixed(4)}°, {station.longitude.toFixed(4)}°
                          </span>
                        </div>
                        {station.corrections && (
                          <>
                            <div className="flex items-center gap-1">
                              <Signal className="h-3 w-3" />
                              <span>Qualidade: {station.corrections.quality}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Idade: {station.corrections.age}s</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {station.corrections && (
                        <Progress 
                          value={station.corrections.quality} 
                          className="mt-2 h-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* DGNSS System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Status do Sistema DGNSS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{satellites.length}</div>
              <div className="text-xs text-muted-foreground">Satélites Visíveis</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {stations.filter(s => s.status === "online").length}
              </div>
              <div className="text-xs text-muted-foreground">Estações Online</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {constellationStatus.reduce((acc, cs) => acc + cs.visible, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Constelações</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {(constellationStatus.reduce((acc, cs) => acc + cs.pdop, 0) / Math.max(constellationStatus.length, 1)).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">PDOP Médio</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">
                {stations.filter(s => s.status === "maintenance").length}
              </div>
              <div className="text-xs text-muted-foreground">Em Manutenção</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DGNSSDashboard;
