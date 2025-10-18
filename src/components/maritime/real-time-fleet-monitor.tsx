import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ship, 
  Navigation, 
  Gauge, 
  Fuel, 
  AlertTriangle,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  Anchor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VesselMetrics {
  id: string;
  name: string;
  status: string;
  location: { lat: number; lon: number };
  speed: number;
  heading: number;
  fuelLevel: number;
  engineHours: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
  crew: number;
  weather?: any;
}

export const RealTimeFleetMonitor = () => {
  const [vessels, setVessels] = useState<VesselMetrics[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    loadFleetData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel("fleet-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vessels"
      }, handleFleetUpdate)
      .subscribe();

    // Set up periodic updates
    const interval = setInterval(() => {
      updateVesselPositions();
    }, 30000); // Update every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadFleetData = async () => {
    try {
      setLoading(true);
      
      const { data: vesselsData, error } = await supabase
        .from("vessels")
        .select("*")
        .limit(10);

      if (error) throw error;

      // Transform data to match our interface with mock performance data
      const transformedVessels: VesselMetrics[] = vesselsData?.map(vessel => ({
        id: vessel.id,
        name: vessel.name,
        status: vessel.status || "operational",
        location: vessel.current_location && 
                 typeof vessel.current_location === "object"
          ? { 
            lat: (vessel.current_location as unknown).lat || -23.5505, 
            lon: (vessel.current_location as unknown).lon || -46.6333 
          }
          : { lat: -23.5505, lon: -46.6333 },
        speed: Math.random() * 20 + 5, // Mock speed 5-25 knots
        heading: Math.random() * 360, // Mock heading 0-360 degrees
        fuelLevel: Math.random() * 100, // Mock fuel level 0-100%
        engineHours: Math.floor(Math.random() * 5000 + 1000), // Mock engine hours
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        crew: Math.floor(Math.random() * 20 + 5) // Mock crew size 5-25
      })) || [];

      setVessels(transformedVessels);
      
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleFleetUpdate = (payload: Record<string, unknown>) => {
    // Update specific vessel data
    if (payload.eventType === "UPDATE") {
      setVessels(prev => prev.map(vessel => 
        vessel.id === payload.new.id 
          ? { ...vessel, ...payload.new }
          : vessel
      ));
    }
  };

  const updateVesselPositions = async () => {
    // Simulate real-time position updates
    setVessels(prev => prev.map(vessel => ({
      ...vessel,
      speed: Math.max(0, vessel.speed + (Math.random() - 0.5) * 2),
      heading: (vessel.heading + (Math.random() - 0.5) * 10) % 360,
      location: {
        lat: vessel.location.lat + (Math.random() - 0.5) * 0.01,
        lon: vessel.location.lon + (Math.random() - 0.5) * 0.01
      }
    })));
  };

  const updateWeatherForVessel = async (vesselId: string, location: { lat: number; lon: number }) => {
    try {
      const { data, error } = await supabase.functions.invoke("maritime-weather", {
        body: { location, vesselId }
      });

      if (error) throw error;

      setWeatherData(data.weather);
    } catch (error) {
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
    case "operational": return "bg-green-100 text-green-800";
    case "maintenance": return "bg-yellow-100 text-yellow-800";
    case "emergency": return "bg-red-100 text-red-800";
    case "docked": return "bg-blue-100 text-blue-800";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 25) return "text-yellow-600";
    return "text-red-600";
  };

  const selectedVesselData = vessels.find(v => v.id === selectedVessel);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monitor da Frota em Tempo Real</h2>
        <p className="text-muted-foreground">
          Acompanhamento ao vivo da posição, status e performance das embarcações
        </p>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vessels.map((vessel) => (
          <Card 
            key={vessel.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVessel === vessel.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => {
              setSelectedVessel(vessel.id);
              updateWeatherForVessel(vessel.id, vessel.location);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {vessel.name}
                </CardTitle>
                <Badge className={getStatusColor(vessel.status)}>
                  {vessel.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <span>{vessel.speed.toFixed(1)} kn</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-green-500" />
                  <span>{vessel.heading.toFixed(0)}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className={`h-4 w-4 ${getFuelLevelColor(vessel.fuelLevel)}`} />
                  <span>{vessel.fuelLevel.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span>{vessel.crew} crew</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Combustível</span>
                  <span>{vessel.fuelLevel.toFixed(0)}%</span>
                </div>
                <Progress value={vessel.fuelLevel} className="h-2" />
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vessel.location.lat.toFixed(4)}, {vessel.location.lon.toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedVesselData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              {selectedVesselData.name} - Detalhes
            </CardTitle>
            <CardDescription>
              Informações detalhadas da embarcação selecionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
                <TabsTrigger value="weather">Tempo</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Gauge className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedVesselData.speed.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Velocidade (kn)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Navigation className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{selectedVesselData.heading.toFixed(0)}°</div>
                    <div className="text-sm text-muted-foreground">Rumo</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Fuel className={`h-8 w-8 mx-auto mb-2 ${getFuelLevelColor(selectedVesselData.fuelLevel)}`} />
                    <div className="text-2xl font-bold">{selectedVesselData.fuelLevel.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Combustível</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{selectedVesselData.crew}</div>
                    <div className="text-sm text-muted-foreground">Tripulação</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Horas de Motor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{selectedVesselData.engineHours.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Horas totais de operação</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Eficiência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">92%</div>
                      <p className="text-sm text-muted-foreground">Eficiência operacional</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Última Manutenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">
                        {selectedVesselData.lastMaintenance.toLocaleDateString("pt-BR")}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor((Date.now() - selectedVesselData.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Próxima Manutenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">
                        {selectedVesselData.nextMaintenance.toLocaleDateString("pt-BR")}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Em {Math.floor((selectedVesselData.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="weather" className="space-y-4">
                {weatherData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Condições Atuais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Temperatura:</span>
                          <span>{weatherData.current.temperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vento:</span>
                          <span>{weatherData.current.windSpeed} m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Visibilidade:</span>
                          <span>{(weatherData.current.visibility/1000).toFixed(1)} km</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {weatherData.alerts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-red-600">Alertas Meteorológicos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {weatherData.alerts.map((alert: unknown, index: number) => (
                            <div key={index} className="p-2 bg-red-50 border border-red-200 rounded mb-2">
                              <p className="text-sm text-red-800">{alert.message}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={() => updateWeatherForVessel(selectedVesselData.id, selectedVesselData.location)}>
                      Carregar Dados Meteorológicos
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};