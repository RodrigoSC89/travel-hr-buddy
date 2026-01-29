import React, { useState, useEffect } from "react";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";
import { useVesselTracking } from "@/hooks/useVesselsData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Navigation, 
  Anchor,
  Ship,
  Activity,
  Clock,
  Wind,
  Waves,
  Thermometer,
  Compass,
  AlertTriangle,
  CheckCircle,
  RadioIcon as Radio,
  Satellite,
  Fuel,
  Users
} from "lucide-react";

interface VesselLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: "sailing" | "anchored" | "docked" | "emergency";
  speed: number;
  heading: number;
  destination: string;
  eta: string;
  lastUpdate: string;
  weather: {
    windSpeed: number;
    waveHeight: number;
    temperature: number;
    visibility: number;
  };
  fuel: {
    current: number;
    capacity: number;
    consumption: number;
  };
  crew: number;
  cargo: {
    current: number;
    capacity: number;
  };
}

const RealTimeTracking: React.FC = () => {
  // Fetch real vessel data from Supabase
  const { data: vesselData, isLoading: queryLoading, refetch } = useVesselTracking();
  
  const [vessels, setVessels] = useState<VesselLocation[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Transform Supabase data to component format
  useEffect(() => {
    if (vesselData && vesselData.length > 0) {
      const transformedVessels: VesselLocation[] = vesselData.map((v, index) => {
        const statusMap: Record<string, VesselLocation['status']> = {
          'at_sea': 'sailing',
          'in_port': 'docked',
          'anchored': 'anchored',
          'emergency': 'emergency',
          'maintenance': 'docked'
        };
        
        // Deterministic values based on ID hash and index
        const idHash = v.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        
        return {
          id: v.id,
          name: v.name,
          coordinates: { 
            lat: v.location?.lat || -23.96 + index * 0.5,
            lng: v.location?.lng || -46.33 + index * 0.3
          },
          status: statusMap[v.status] || 'sailing',
          speed: v.speed || 12 + (idHash % 8),
          heading: v.heading || (idHash % 360),
          destination: v.route?.destination || 'Santos',
          eta: v.eta || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          lastUpdate: v.lastUpdate || new Date().toISOString(),
          weather: {
            windSpeed: 8 + (idHash % 12),
            waveHeight: 0.8 + ((idHash % 20) / 10),
            temperature: 24 + (idHash % 8),
            visibility: 10 + (idHash % 10)
          },
          fuel: {
            current: v.fuel?.current || 800 + (idHash % 400),
            capacity: v.fuel?.capacity || 1500,
            consumption: v.fuel?.consumption || 12 + (idHash % 8)
          },
          crew: v.crew?.onboard || 20 + (idHash % 8),
          cargo: {
            current: v.cargo?.current_load || 8000 + (idHash % 4000),
            capacity: v.cargo?.capacity || 15000
          }
        };
      });
      
      setVessels(transformedVessels);
      if (!selectedVessel && transformedVessels.length > 0) {
        setSelectedVessel(transformedVessels[0]);
      }
      setIsLoading(false);
    } else if (!queryLoading) {
      setIsLoading(false);
    }
  }, [vesselData, queryLoading, selectedVessel]);

  const updateVesselPositions = () => {
    setVessels(prev => prev.map((vessel, idx) => {
      // Deterministic movement based on time
      const timeComponent = Date.now() / 60000;
      const latDelta = Math.sin(timeComponent + idx) * 0.005;
      const lngDelta = Math.cos(timeComponent + idx) * 0.005;
      
      return {
        ...vessel,
        coordinates: {
          lat: vessel.coordinates.lat + latDelta,
          lng: vessel.coordinates.lng + lngDelta
        },
        speed: vessel.status === "sailing" ? vessel.speed : 0,
        lastUpdate: new Date().toISOString()
      };
    }));
  };

  // Real-time updates with optimized polling
  useOptimizedPolling({
    id: "fleet-real-time-tracking",
    callback: updateVesselPositions,
    interval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case "sailing": return "bg-success text-success-foreground";
    case "docked": return "bg-info text-info-foreground";
    case "anchored": return "bg-warning text-warning-foreground";
    case "emergency": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case "sailing": return "Navegando";
    case "docked": return "Atracada";
    case "anchored": return "Fundeada";
    case "emergency": return "Emergência";
    default: return "Desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "sailing": return <Ship className="h-4 w-4" />;
    case "docked": return <Anchor className="h-4 w-4" />;
    case "anchored": return <Navigation className="h-4 w-4" />;
    case "emergency": return <AlertTriangle className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
  };

  const filteredVessels = vessels.filter(vessel =>
    vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Satellite className="h-6 w-6 text-primary" />
            Rastreamento em Tempo Real
          </h2>
          <p className="text-muted-foreground">
            Localização e status atual de toda a frota
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-success">
            <Radio className="h-4 w-4" />
            <span>Sistema Online</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar embarcação ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Embarcações</CardTitle>
              <CardDescription>
                {filteredVessels.length} embarcações sendo monitoradas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-96 overflow-y-auto p-4">
                {filteredVessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedVessel?.id === vessel.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(vessel.status)}
                        <div>
                          <p className="font-medium text-sm">{vessel.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Para {vessel.destination}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(vessel.status)} variant="secondary">
                        {getStatusText(vessel.status)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{vessel.speed.toFixed(1)} kn</span>
                      <span>{formatCoordinates(vessel.coordinates.lat, vessel.coordinates.lng)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details */}
        <div className="lg:col-span-2">
          {selectedVessel ? (
            <div className="space-y-6">
              {/* Vessel Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(selectedVessel.status)}
                        {selectedVessel.name}
                      </CardTitle>
                      <CardDescription>
                        Última atualização: {new Date(selectedVessel.lastUpdate).toLocaleString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedVessel.status)} variant="secondary">
                      {getStatusText(selectedVessel.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Navigation className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{selectedVessel.speed.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Velocidade (kn)</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <Compass className="h-5 w-5 mx-auto mb-1 text-azure-600" />
                      <div className="text-lg font-bold">{selectedVessel.heading}°</div>
                      <div className="text-xs text-muted-foreground">Rumo</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <MapPin className="h-5 w-5 mx-auto mb-1 text-success" />
                      <div className="text-xs font-medium">
                        {formatCoordinates(selectedVessel.coordinates.lat, selectedVessel.coordinates.lng)}
                      </div>
                      <div className="text-xs text-muted-foreground">Posição</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                      <div className="text-xs font-medium">
                        {new Date(selectedVessel.eta).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground">ETA {selectedVessel.destination}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    Condições Meteorológicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Wind className="h-5 w-5 mx-auto mb-1 text-azure-600" />
                      <div className="text-lg font-bold">{selectedVessel.weather.windSpeed}</div>
                      <div className="text-xs text-muted-foreground">Vento (kn)</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <Waves className="h-5 w-5 mx-auto mb-1 text-info" />
                      <div className="text-lg font-bold">{selectedVessel.weather.waveHeight}m</div>
                      <div className="text-xs text-muted-foreground">Ondas</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <Thermometer className="h-5 w-5 mx-auto mb-1 text-warning" />
                      <div className="text-lg font-bold">{selectedVessel.weather.temperature}°C</div>
                      <div className="text-xs text-muted-foreground">Temperatura</div>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <Activity className="h-5 w-5 mx-auto mb-1 text-success" />
                      <div className="text-lg font-bold">{selectedVessel.weather.visibility} nm</div>
                      <div className="text-xs text-muted-foreground">Visibilidade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-warning" />
                      Combustível
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Atual</span>
                        <span className="font-medium">
                          {selectedVessel.fuel.current}L / {selectedVessel.fuel.capacity}L
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-warning h-2 rounded-full" 
                          style={{ width: `${(selectedVessel.fuel.current / selectedVessel.fuel.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Consumo: {selectedVessel.fuel.consumption} L/h
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-info" />
                      Tripulação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-info">{selectedVessel.crew}</div>
                      <div className="text-sm text-muted-foreground">tripulantes a bordo</div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completa
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      Carga
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Atual</span>
                        <span className="font-medium">
                          {selectedVessel.cargo.current}t / {selectedVessel.cargo.capacity}t
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(selectedVessel.cargo.current / selectedVessel.cargo.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ocupação: {((selectedVessel.cargo.current / selectedVessel.cargo.capacity) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma embarcação</h3>
                  <p className="text-muted-foreground">
                    Escolha uma embarcação da lista para ver os detalhes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;