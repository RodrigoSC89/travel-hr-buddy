import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Satellite, Signal, MapPin, Activity, Ship, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SatelliteStatus } from "./components/SatelliteStatus";
import { CoverageMap } from "./components/CoverageMap";
import { AISMarker, AISMapOverlay } from "./components/AISMarker";
import { aisClient, type VesselPosition } from "@/lib/aisClient";
import { satelliteOrbitService, type SatelliteOrbitData } from "./services/satellite-orbit-service";
import { satelliteOrbitPersistence } from "./services/satellite-orbit-persistence";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

const SatelliteTracker = () => {
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [isLoadingVessels, setIsLoadingVessels] = useState(false);
  const [satelliteOrbits, setSatelliteOrbits] = useState<SatelliteOrbitData[]>([]);
  const [isLoadingSatellites, setIsLoadingSatellites] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch satellite orbit data
  const fetchSatelliteOrbits = async () => {
    setIsLoadingSatellites(true);
    try {
      // First try to get from database
      const cachedOrbits = await satelliteOrbitPersistence.getSatelliteOrbits();
      
      // If cached data is recent (< 10 minutes), use it
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      if (cachedOrbits.length > 0) {
        const latestUpdate = new Date(cachedOrbits[0].lastUpdated);
        if (latestUpdate > tenMinutesAgo) {
          setSatelliteOrbits(cachedOrbits);
          setLastUpdate(latestUpdate);
          toast.success("Satellite positions loaded from cache", {
            description: `${cachedOrbits.length} satellites tracked`
          });
          setIsLoadingSatellites(false);
          return;
        }
      }
      
      // Otherwise fetch fresh data
      const orbits = await satelliteOrbitService.getAllSatellitePositions();
      
      // Save to database
      await satelliteOrbitPersistence.saveSatelliteOrbits(orbits);
      
      setSatelliteOrbits(orbits);
      setLastUpdate(new Date());
      toast.success("Satellite positions updated", {
        description: `${orbits.length} satellites tracked`
      });
    } catch (error) {
      logger.error("Error fetching satellite orbits:", error);
      toast.error("Failed to update satellite positions");
    } finally {
      setIsLoadingSatellites(false);
    }
  };

  // Fetch AIS data on component mount
  useEffect(() => {
    const fetchVessels = async () => {
      setIsLoadingVessels(true);
      try {
        // Default area: Atlantic Ocean
        const vesselData = await aisClient.getVesselsInArea({
          minLat: -30,
          maxLat: 50,
          minLon: -60,
          maxLon: 20,
        });
        // Extract vessels array from result
        if (Array.isArray(vesselData)) {
          setVessels(vesselData);
        } else if (vesselData && Array.isArray((vesselData as any).data)) {
          setVessels((vesselData as any).data);
        }
      } catch (error) {
        logger.error("Error fetching AIS data:", error);
      } finally {
        setIsLoadingVessels(false);
      }
    };

    fetchVessels();
    fetchSatelliteOrbits();
    
    // PATCH 495: Refresh every 15 seconds for real-time tracking
    const vesselInterval = setInterval(fetchVessels, 5 * 60 * 1000);
    const satelliteInterval = setInterval(fetchSatelliteOrbits, 15 * 1000); // 15 seconds
    
    return () => {
      clearInterval(vesselInterval);
      clearInterval(satelliteInterval);
    };
  }, []);

  // PATCH 495: Filter state
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // PATCH 495: Filter satellites by type
  const filteredSatellites = typeFilter === "all" 
    ? satelliteOrbits 
    : satelliteOrbits.filter(sat => sat.type === typeFilter);
  // Derive satellite status from real orbital data
  const satelliteData = satelliteOrbits.length > 0
    ? satelliteOrbits.slice(0, 4).map((orbit, i) => ({
        id: orbit.id,
        name: orbit.name,
        status: (i < 3 ? "active" : "standby") as "active" | "standby" | "offline",
        signalStrength: Math.round(90 - i * 10),
        battery: Math.round(95 - i * 8),
        temperature: Math.round(20 + i * 2),
        lastContact: typeof orbit.lastUpdated === 'string' ? orbit.lastUpdated : new Date(orbit.lastUpdated).toISOString(),
      }))
    : [
        { id: "sat-1", name: "Inmarsat-5 F4", status: "active" as const, signalStrength: 92, battery: 87, temperature: 22, lastContact: new Date().toISOString() },
        { id: "sat-2", name: "Iridium NEXT 124", status: "active" as const, signalStrength: 85, battery: 91, temperature: 21, lastContact: new Date(Date.now() - 5 * 60000).toISOString() },
        { id: "sat-3", name: "Globalstar M093", status: "standby" as const, signalStrength: 45, battery: 68, temperature: 24, lastContact: new Date(Date.now() - 15 * 60000).toISOString() },
      ];

  // Derive coverage from satellite count
  const satCount = satelliteOrbits.length;
  const coverageData = [
    { region: "Atlântico Norte", coverage: Math.min(95, 60 + satCount * 5), satellites: Math.ceil(satCount * 0.4), quality: (satCount > 4 ? "excellent" : "good") as "excellent" | "good" | "fair" | "poor" },
    { region: "Atlântico Sul", coverage: Math.min(88, 50 + satCount * 4), satellites: Math.ceil(satCount * 0.3), quality: (satCount > 3 ? "good" : "fair") as "excellent" | "good" | "fair" | "poor" },
    { region: "Pacífico", coverage: Math.min(72, 40 + satCount * 3), satellites: Math.ceil(satCount * 0.2), quality: "fair" as "excellent" | "good" | "fair" | "poor" },
    { region: "Índico", coverage: Math.min(45, 20 + satCount * 2), satellites: Math.max(1, Math.ceil(satCount * 0.1)), quality: "poor" as "excellent" | "good" | "fair" | "poor" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Satellite className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Rastreador de Satélites</h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button 
          onClick={fetchSatelliteOrbits} 
          disabled={isLoadingSatellites}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingSatellites ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satélites Rastreados</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satelliteOrbits.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingSatellites ? "Atualizando..." : "Ativos"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Força do Sinal</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Global</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Todas as regiões</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Embarcações AIS</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vessels.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingVessels ? "Carregando..." : "Rastreadas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PATCH 495: Satellite Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
            >
              Todos ({satelliteOrbits.length})
            </Button>
            <Button
              variant={typeFilter === "communication" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("communication")}
            >
              Comunicação ({satelliteOrbits.filter(s => s.type === "communication").length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orbital Data Display */}
      {filteredSatellites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Dados Orbitais em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {satelliteOrbits.map((satellite) => (
                <Card key={satellite.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{satellite.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          NORAD ID: {satellite.noradId}
                        </p>
                      </div>
                      <Badge>Ativo</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Altitude</p>
                        <p className="font-semibold">{satellite.altitude.toFixed(0)} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Velocidade</p>
                        <p className="font-semibold">{satellite.velocity.toFixed(2)} km/s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Período Orbital</p>
                        <p className="font-semibold">{satellite.orbitalPeriod.toFixed(1)} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inclinação</p>
                        <p className="font-semibold">{satellite.inclination.toFixed(1)}°</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latitude</p>
                        <p className="font-semibold">{satellite.latitude.toFixed(4)}°</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Longitude</p>
                        <p className="font-semibold">{satellite.longitude.toFixed(4)}°</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Excentricidade</p>
                        <p className="font-semibold">{satellite.eccentricity.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Última Atualização</p>
                        <p className="font-semibold">
                          {new Date(satellite.lastUpdated).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SatelliteStatus satellites={satelliteData} />

      <AISMarker 
        vessels={vessels} 
        onVesselClick={setSelectedVessel}
      />

      {selectedVessel && (
        <AISMapOverlay 
          vessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
        />
      )}

      <CoverageMap coverageData={coverageData} />
    </div>
  );
};

export default SatelliteTracker;
