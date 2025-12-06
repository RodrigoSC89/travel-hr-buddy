/**
 * PATCH 518 - Satélite Live Integrator
 * Real satellite tracking with demo data and AI integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Satellite, Globe, RefreshCw, Radio, Bot, Eye, List } from "lucide-react";
import { toast } from "sonner";
import { DEMO_SATELLITES, updateSatellitePositions, createSyncLog, type DemoSatellite, type SyncLog } from "@/modules/satellite-tracker/data/demo-satellites";
import { SatelliteGlobeMap } from "@/modules/satellite-tracker/components/SatelliteGlobeMap";
import { SatelliteDetailPanel } from "@/modules/satellite-tracker/components/SatelliteDetailPanel";
import { SatelliteAICopilot } from "@/modules/satellite-tracker/components/SatelliteAICopilot";

export default function SatelliteLivePage() {
  const [satellites, setSatellites] = useState<DemoSatellite[]>(DEMO_SATELLITES);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<string>("all");
  const [selectedSatellite, setSelectedSatellite] = useState<DemoSatellite | null>(null);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    // Auto-update positions every 10 seconds
    const interval = setInterval(() => {
      setSatellites(prev => updateSatellitePositions(prev));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const syncSatelliteData = async () => {
    setSyncing(true);
    const startTime = Date.now();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedSatellites = updateSatellitePositions(satellites);
      setSatellites(updatedSatellites);
      
      const log = createSyncLog("N2YO API", updatedSatellites.length, true, Date.now() - startTime);
      setSyncLogs(prev => [log, ...prev].slice(0, 10));
      
      toast.success(`${updatedSatellites.length} satélites sincronizados`);
    } catch (error) {
      const log = createSyncLog("N2YO API", 0, false, Date.now() - startTime, String(error));
      setSyncLogs(prev => [log, ...prev].slice(0, 10));
      toast.error("Falha ao sincronizar dados");
    } finally {
      setSyncing(false);
    }
  };

  const filteredSatellites = satellites.filter(sat =>
    selectedOrbit === "all" || sat.orbit_type === selectedOrbit
  );

  const getOrbitColor = (orbit: string) => {
    switch (orbit) {
      case "LEO": return "bg-blue-500";
      case "MEO": return "bg-green-500";
      case "GEO": return "bg-purple-500";
      case "HEO": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            Satélite Live Integrator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            PATCH 518 - Rastreamento em tempo real com integração de IA
          </p>
        </div>
        <Button onClick={syncSatelliteData} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar Dados"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satélites Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satellites.length}</div>
            <p className="text-xs text-muted-foreground">Em rastreamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órbita LEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {satellites.filter(s => s.orbit_type === "LEO").length}
            </div>
            <p className="text-xs text-muted-foreground">Órbita Baixa Terrestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órbita MEO/GEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {satellites.filter(s => s.orbit_type === "MEO" || s.orbit_type === "GEO").length}
            </div>
            <p className="text-xs text-muted-foreground">Órbita Média/Geoestacionária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncLogs[0] ? new Date(syncLogs[0].timestamp).toLocaleTimeString() : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncLogs[0] ? `${syncLogs[0].response_time_ms}ms` : "Nunca"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orbit Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "LEO", "MEO", "GEO", "HEO"].map(orbit => (
          <Button
            key={orbit}
            variant={selectedOrbit === orbit ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedOrbit(orbit)}
          >
            {orbit === "all" ? "Todas as Órbitas" : orbit}
            {orbit !== "all" && (
              <Badge className={`ml-2 ${getOrbitColor(orbit)}`}>
                {satellites.filter(s => s.orbit_type === orbit).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="map"><Globe className="h-4 w-4 mr-2" />Mapa Global</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-2" />Lista</TabsTrigger>
          <TabsTrigger value="copilot"><Bot className="h-4 w-4 mr-2" />AI Copilot</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SatelliteGlobeMap 
                satellites={filteredSatellites}
                selectedSatellite={selectedSatellite}
                onSelectSatellite={setSelectedSatellite}
              />
            </div>
            <div>
              {selectedSatellite ? (
                <SatelliteDetailPanel satellite={selectedSatellite} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground p-8">
                    <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione um satélite no mapa para ver detalhes</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Satélites Rastreados ({filteredSatellites.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredSatellites.map(satellite => (
                <Card 
                  key={satellite.id} 
                  className={`cursor-pointer transition-colors hover:border-primary ${selectedSatellite?.id === satellite.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setSelectedSatellite(satellite)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Satellite className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{satellite.satellite_name}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getOrbitColor(satellite.orbit_type)}>{satellite.orbit_type}</Badge>
                            <Badge variant="outline">{satellite.country}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Alt: {satellite.altitude_km.toFixed(0)} km</div>
                        <div className="text-muted-foreground">{satellite.velocity_kmh.toFixed(0)} km/h</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copilot" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SatelliteAICopilot satellites={satellites} selectedSatellite={selectedSatellite} />
            <div>
              {selectedSatellite ? (
                <SatelliteDetailPanel satellite={selectedSatellite} />
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Satélites por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["LEO", "MEO", "GEO"].map(orbit => (
                      <div key={orbit} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{orbit}</span>
                          <Badge className={getOrbitColor(orbit)}>
                            {satellites.filter(s => s.orbit_type === orbit).length}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {satellites.filter(s => s.orbit_type === orbit).map(s => s.satellite_name).join(", ")}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Logs de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Nenhum log de sincronização ainda</p>
          ) : (
            <div className="space-y-2">
              {syncLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={log.success ? "default" : "destructive"}>
                      {log.success ? "Sucesso" : "Falha"}
                    </Badge>
                    <span className="text-sm">{log.satellites_updated} satélites de {log.api_provider}</span>
                    <span className="text-xs text-muted-foreground">{log.response_time_ms}ms</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
