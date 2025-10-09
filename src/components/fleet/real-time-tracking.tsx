import React, { useState, useEffect } from "react";
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
  speed: number; // knots
  heading: number; // degrees
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
  const [vessels, setVessels] = useState<VesselLocation[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVesselLocations();
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      updateVesselPositions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadVesselLocations = () => {
    // Mock real-time vessel data
    const mockVessels: VesselLocation[] = [
      {
        id: "1",
        name: "MV Atlântico Explorer",
        coordinates: { lat: -23.96, lng: -46.33 }, // Santos area
        status: "sailing",
        speed: 18.5,
        heading: 45,
        destination: "Rio de Janeiro",
        eta: "2024-01-20T14:30:00Z",
        lastUpdate: new Date().toISOString(),
        weather: {
          windSpeed: 12,
          waveHeight: 1.2,
          temperature: 28,
          visibility: 15
        },
        fuel: {
          current: 850,
          capacity: 1200,
          consumption: 15.2
        },
        crew: 24,
        cargo: {
          current: 8500,
          capacity: 12000
        }
      },
      {
        id: "2",
        name: "MV Pacífico Star",
        coordinates: { lat: -25.52, lng: -48.52 }, // Paranaguá area
        status: "docked",
        speed: 0,
        heading: 180,
        destination: "Salvador",
        eta: "2024-01-22T08:00:00Z",
        lastUpdate: new Date().toISOString(),
        weather: {
          windSpeed: 8,
          waveHeight: 0.8,
          temperature: 26,
          visibility: 20
        },
        fuel: {
          current: 1100,
          capacity: 1500,
          consumption: 0
        },
        crew: 22,
        cargo: {
          current: 15000,
          capacity: 18000
        }
      },
      {
        id: "3",
        name: "MV Índico Pioneer",
        coordinates: { lat: -8.05, lng: -34.95 }, // Recife area
        status: "anchored",
        speed: 0,
        heading: 90,
        destination: "Fortaleza",
        eta: "2024-01-24T16:00:00Z",
        lastUpdate: new Date().toISOString(),
        weather: {
          windSpeed: 15,
          waveHeight: 1.8,
          temperature: 32,
          visibility: 12
        },
        fuel: {
          current: 2000,
          capacity: 2500,
          consumption: 0
        },
        crew: 26,
        cargo: {
          current: 20000,
          capacity: 25000
        }
      },
      {
        id: "4",
        name: "MV Mediterrâneo",
        coordinates: { lat: -20.32, lng: -40.34 }, // Vitória area
        status: "emergency",
        speed: 2.1,
        heading: 270,
        destination: "Emergency Port",
        eta: "2024-01-19T20:00:00Z",
        lastUpdate: new Date().toISOString(),
        weather: {
          windSpeed: 25,
          waveHeight: 3.2,
          temperature: 24,
          visibility: 8
        },
        fuel: {
          current: 450,
          capacity: 900,
          consumption: 8.5
        },
        crew: 20,
        cargo: {
          current: 6000,
          capacity: 8500
        }
      }
    ];

    setVessels(mockVessels);
    setSelectedVessel(mockVessels[0]);
    setIsLoading(false);
  };

  const updateVesselPositions = () => {
    setVessels(prev => prev.map(vessel => ({
      ...vessel,
      coordinates: {
        lat: vessel.coordinates.lat + (Math.random() - 0.5) * 0.01,
        lng: vessel.coordinates.lng + (Math.random() - 0.5) * 0.01
      },
      speed: vessel.status === "sailing" ? vessel.speed + (Math.random() - 0.5) * 2 : 0,
      lastUpdate: new Date().toISOString()
    })));
  };

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