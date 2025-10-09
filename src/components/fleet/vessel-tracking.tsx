import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ship, 
  Navigation, 
  MapPin, 
  Fuel, 
  Gauge,
  Thermometer,
  Wind,
  Radio,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface VesselPosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: "sailing" | "anchored" | "docked" | "maintenance" | "emergency";
  fuel_level: number;
  last_update: string;
  weather: {
    temperature: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
  };
  crew_count: number;
  destination: string;
  eta: string;
}

export const VesselTracking = () => {
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [trackingMode, setTrackingMode] = useState<"real-time" | "historical">("real-time");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVessels();
    
    // Set up real-time tracking
    const interval = setInterval(() => {
      if (trackingMode === "real-time") {
        loadVessels();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [trackingMode]);

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .eq("status", "active");

      if (error) throw error;

      // Transform to tracking format with mock real-time data
      const trackingData: VesselPosition[] = data?.map(vessel => ({
        id: vessel.id,
        name: vessel.name,
        latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
        longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
        speed: Math.random() * 20,
        heading: Math.random() * 360,
        status: ["sailing", "anchored", "docked"][Math.floor(Math.random() * 3)] as any,
        fuel_level: 50 + Math.random() * 50,
        last_update: new Date().toISOString(),
        weather: {
          temperature: 20 + Math.random() * 15,
          wind_speed: Math.random() * 25,
          wind_direction: Math.random() * 360,
          visibility: 5 + Math.random() * 5
        },
        crew_count: Math.floor(10 + Math.random() * 20),
        destination: "Porto de Santos",
        eta: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString()
      })) || [];

      setVessels(trackingData);
      if (!selectedVessel && trackingData.length > 0) {
        setSelectedVessel(trackingData[0]);
      }
    } catch (error) {
      console.error("Error loading vessels:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos navios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: VesselPosition["status"]) => {
    switch (status) {
    case "sailing": return "bg-blue-500";
    case "anchored": return "bg-yellow-500";
    case "docked": return "bg-green-500";
    case "maintenance": return "bg-orange-500";
    case "emergency": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: VesselPosition["status"]) => {
    switch (status) {
    case "sailing": return "Navegando";
    case "anchored": return "Ancorado";
    case "docked": return "Atracado";
    case "maintenance": return "Manutenção";
    case "emergency": return "Emergência";
    default: return "Desconhecido";
    }
  };

  const formatCoordinate = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rastreamento de Navios</h2>
          <p className="text-muted-foreground">
            Acompanhe a posição e status da frota em tempo real
          </p>
        </div>
        
        <Tabs value={trackingMode} onValueChange={(value) => setTrackingMode(value as any)}>
          <TabsList>
            <TabsTrigger value="real-time">Tempo Real</TabsTrigger>
            <TabsTrigger value="historical">Histórico</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Navios Ativos ({vessels.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vessels.map((vessel) => (
                <div
                  key={vessel.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVessel?.id === vessel.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{vessel.name}</h4>
                    <Badge variant="outline" className={`${getStatusColor(vessel.status)} text-azure-50`}>
                      {getStatusText(vessel.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {formatCoordinate(vessel.latitude, vessel.longitude)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-3 w-3" />
                      {vessel.speed.toFixed(1)} nós
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-3 w-3" />
                      {vessel.fuel_level.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details */}
        <div className="lg:col-span-2">
          {selectedVessel ? (
            <div className="space-y-6">
              {/* Main Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-6 w-6" />
                      {selectedVessel.name}
                    </CardTitle>
                    <Badge variant="outline" className={`${getStatusColor(selectedVessel.status)} text-azure-50`}>
                      {getStatusText(selectedVessel.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <Navigation className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{selectedVessel.speed.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Nós</div>
                    </div>
                    
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <Fuel className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{selectedVessel.fuel_level.toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">Combustível</div>
                    </div>
                    
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold">{selectedVessel.heading.toFixed(0)}°</div>
                      <div className="text-sm text-muted-foreground">Rumo</div>
                    </div>
                    
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{selectedVessel.crew_count}</div>
                      <div className="text-sm text-muted-foreground">Tripulação</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Position */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Posição Atual
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>Latitude: {selectedVessel.latitude.toFixed(6)}</div>
                        <div>Longitude: {selectedVessel.longitude.toFixed(6)}</div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Atualizado: {new Date(selectedVessel.last_update).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Weather */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        Condições Meteorológicas
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-3 w-3" />
                          {selectedVessel.weather.temperature.toFixed(1)}°C
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="h-3 w-3" />
                          Vento: {selectedVessel.weather.wind_speed.toFixed(1)} nós
                        </div>
                        <div>Visibilidade: {selectedVessel.weather.visibility.toFixed(1)} km</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Centralizar no Mapa
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Comunicar
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Ver Rota
                    </Button>
                    {selectedVessel.status === "emergency" && (
                      <Button variant="destructive" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Protocolo Emergência
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum navio selecionado</h3>
                <p className="text-muted-foreground">
                  Selecione um navio da lista para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};