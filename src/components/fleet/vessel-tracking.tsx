import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Fuel,
  Thermometer,
  Wind,
  Anchor,
  Radio
} from 'lucide-react';

interface VesselPosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  lastUpdate: string;
  fuel: number;
  temperature: number;
  weather: string;
}

const mockVesselPositions: VesselPosition[] = [
  {
    id: '1',
    name: 'MV Atlântico',
    latitude: -23.9618,
    longitude: -46.3322,
    speed: 12.5,
    heading: 180,
    status: 'underway',
    lastUpdate: '2024-01-20T10:30:00Z',
    fuel: 75,
    temperature: 24,
    weather: 'Clear'
  },
  {
    id: '2',
    name: 'MV Pacífico',
    latitude: -25.4284,
    longitude: -48.6732,
    speed: 0,
    heading: 0,
    status: 'anchored',
    lastUpdate: '2024-01-20T10:15:00Z',
    fuel: 65,
    temperature: 22,
    weather: 'Partly Cloudy'
  },
  {
    id: '3',
    name: 'MV Índico',
    latitude: -8.8137,
    longitude: -35.2369,
    speed: 15.2,
    heading: 90,
    status: 'underway',
    lastUpdate: '2024-01-20T10:45:00Z',
    fuel: 85,
    temperature: 28,
    weather: 'Sunny'
  }
];

export const VesselTracking: React.FC = () => {
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [trackingMode, setTrackingMode] = useState<'real-time' | 'historical'>('real-time');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'underway': return 'bg-green-500 text-white';
      case 'anchored': return 'bg-blue-500 text-white';
      case 'maintenance': return 'bg-yellow-500 text-white';
      case 'emergency': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'underway': return 'Em Trânsito';
      case 'anchored': return 'Ancorado';
      case 'maintenance': return 'Manutenção';
      case 'emergency': return 'Emergência';
      default: return 'Desconhecido';
    }
  };

  const formatCoordinate = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Rastreamento de Embarcações
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da localização e status da frota
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={trackingMode === 'real-time' ? 'default' : 'outline'}
            onClick={() => setTrackingMode('real-time')}
          >
            Tempo Real
          </Button>
          <Button 
            variant={trackingMode === 'historical' ? 'default' : 'outline'}
            onClick={() => setTrackingMode('historical')}
          >
            Histórico
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessel List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Embarcações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockVesselPositions.map((vessel) => (
                  <div
                    key={vessel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedVessel?.id === vessel.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Anchor className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{vessel.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCoordinate(vessel.latitude, vessel.longitude)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(vessel.status)}>
                        {getStatusText(vessel.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span>{vessel.speed} nós</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(vessel.lastUpdate).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span>{vessel.fuel}% combustível</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        <span>{vessel.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vessel Details */}
        <div>
          {selectedVessel ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  {selectedVessel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getStatusColor(selectedVessel.status)}>
                    {getStatusText(selectedVessel.status)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Posição:</span>
                    <span className="text-sm font-medium">
                      {formatCoordinate(selectedVessel.latitude, selectedVessel.longitude)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Velocidade:</span>
                    <span className="text-sm font-medium">{selectedVessel.speed} nós</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rumo:</span>
                    <span className="text-sm font-medium">{selectedVessel.heading}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Combustível:</span>
                    <span className="text-sm font-medium">{selectedVessel.fuel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Temperatura:</span>
                    <span className="text-sm font-medium">{selectedVessel.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Clima:</span>
                    <span className="text-sm font-medium">{selectedVessel.weather}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Última Atualização</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedVessel.lastUpdate).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Centralizar no Mapa
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Radio className="h-4 w-4 mr-2" />
                    Comunicar com Embarcação
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Wind className="h-4 w-4 mr-2" />
                    Condições Meteorológicas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Navigation className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma embarcação para ver os detalhes de rastreamento
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};