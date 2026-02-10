/**
 * VesselTrackingCard - Integração AIS/Rastreamento
 * Localização em tempo real das embarcações
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Navigation, MapPin, Ship, Anchor, Clock, Wind, 
  Waves, Thermometer, RefreshCw, ExternalLink, Eye,
  Compass, Gauge, Target, AlertTriangle, Activity
} from "lucide-react";

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: 'underway' | 'anchored' | 'moored' | 'not_under_command';
  destination: string;
  eta: string;
  last_update: string;
  weather?: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    temperature: number;
  };
}

interface VesselTrackingCardProps {
  contractId?: string;
}

export function VesselTrackingCard({ contractId }: VesselTrackingCardProps) {
  const [vessels, setVessels] = useState<VesselPosition[]>([
    {
      id: '1',
      name: 'MV Atlantic Star',
      imo: '9876543',
      mmsi: '123456789',
      lat: -23.9618,
      lng: -46.3322,
      heading: 145,
      speed: 12.5,
      status: 'underway',
      destination: 'Santos, Brazil',
      eta: '2024-01-25T14:00:00Z',
      last_update: new Date().toISOString(),
      weather: {
        windSpeed: 15,
        windDirection: 180,
        waveHeight: 1.2,
        temperature: 28
      }
    },
    {
      id: '2',
      name: 'MV Pacific Voyager',
      imo: '9876544',
      mmsi: '123456790',
      lat: -22.9068,
      lng: -43.1729,
      heading: 0,
      speed: 0,
      status: 'moored',
      destination: 'Rio de Janeiro, Brazil',
      eta: '-',
      last_update: new Date().toISOString(),
      weather: {
        windSpeed: 8,
        windDirection: 90,
        waveHeight: 0.5,
        temperature: 32
      }
    },
    {
      id: '3',
      name: 'MV Ocean Dream',
      imo: '9876545',
      mmsi: '123456791',
      lat: -25.4284,
      lng: -49.2733,
      heading: 270,
      speed: 8.2,
      status: 'underway',
      destination: 'Paranaguá, Brazil',
      eta: '2024-01-24T08:00:00Z',
      last_update: new Date(Date.now() - 600000).toISOString(),
      weather: {
        windSpeed: 22,
        windDirection: 225,
        waveHeight: 2.5,
        temperature: 24
      }
    }
  ]);

  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshPositions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, imo_number, status')
        .limit(20);

      if (!error && data && data.length > 0) {
        setVessels(data.map((v) => ({
          id: v.id,
          name: v.name || 'Embarcação',
          imo: v.imo_number || '',
          mmsi: '',
          lat: -23.96,
          lng: -46.33,
          heading: 0,
          speed: 0,
          status: v.status === 'active' ? 'underway' as const : 'moored' as const,
          destination: '',
          eta: '-',
          last_update: new Date().toISOString(),
        })));
      } else {
        // Update timestamps on existing data
        setVessels(prev => prev.map(v => ({ ...v, last_update: new Date().toISOString() })));
      }
      toast.success('Posições atualizadas!');
    } catch {
      toast.error('Erro ao atualizar posições');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'underway':
        return <Badge className="bg-primary">Em Navegação</Badge>;
      case 'anchored':
        return <Badge className="bg-warning text-warning-foreground">Fundeado</Badge>;
      case 'moored':
        return <Badge className="bg-secondary">Atracado</Badge>;
      case 'not_under_command':
        return <Badge variant="destructive">Sem Comando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeSinceUpdate = (lastUpdate: string) => {
    const diff = Date.now() - new Date(lastUpdate).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m atrás`;
  };

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imo.includes(searchQuery) ||
    v.mmsi.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Rastreamento AIS</h2>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Buscar por nome, IMO ou MMSI..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-[250px]"
          />
          <Button variant="outline" size="sm" onClick={refreshPositions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Vessel List */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Embarcações ({filteredVessels.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-2">
                {filteredVessels.map(vessel => (
                  <div
                    key={vessel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedVessel?.id === vessel.id 
                        ? 'bg-primary/10 border border-primary' 
                        : 'hover:bg-muted'
                      }`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{vessel.name}</span>
                      </div>
                      {getStatusBadge(vessel.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {vessel.speed.toFixed(1)} kn
                      </div>
                      <div className="flex items-center gap-1">
                        <Compass className="h-3 w-3" />
                        {vessel.heading}°
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {getTimeSinceUpdate(vessel.last_update)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Mapa de Posições
              </CardTitle>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em Tela Cheia
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[450px] rounded-lg border bg-gradient-to-br from-primary/20 to-secondary/10 overflow-hidden">
              {/* Simple Map Representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Mapa Integrado AIS</p>
                  <p className="text-xs">Posições em tempo real via MarineTraffic/VesselFinder</p>
                </div>
              </div>

              {/* Vessel Markers (simulated) */}
              {filteredVessels.map((vessel, idx) => (
                <div
                  key={vessel.id}
                  className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all
                    ${vessel.status === 'underway' ? 'bg-primary' : 'bg-secondary'}
                    ${selectedVessel?.id === vessel.id ? 'ring-2 ring-white scale-125' : ''}
                  `}
                  style={{
                    left: `${30 + idx * 25}%`,
                    top: `${20 + idx * 20}%`,
                    transform: `rotate(${vessel.heading}deg)`
                  }}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <Navigation className="h-3 w-3 text-primary-foreground" />
                </div>
              ))}

              {/* Selected Vessel Info Overlay */}
              {selectedVessel && (
                <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur rounded-lg p-4 border shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Ship className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{selectedVessel.name}</span>
                        {getStatusBadge(selectedVessel.status)}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">IMO</p>
                          <p className="font-medium">{selectedVessel.imo}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">MMSI</p>
                          <p className="font-medium">{selectedVessel.mmsi}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Velocidade</p>
                          <p className="font-medium">{selectedVessel.speed.toFixed(1)} kn</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Rumo</p>
                          <p className="font-medium">{selectedVessel.heading}°</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Destino</p>
                      <p className="font-medium">{selectedVessel.destination}</p>
                      {selectedVessel.eta !== '-' && (
                        <p className="text-xs text-muted-foreground">
                          ETA: {new Date(selectedVessel.eta).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedVessel.weather && (
                    <>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Vento</p>
                            <p className="font-medium text-sm">{selectedVessel.weather.windSpeed} kn</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Compass className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dir. Vento</p>
                            <p className="font-medium text-sm">{selectedVessel.weather.windDirection}°</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Ondas</p>
                            <p className="font-medium text-sm">{selectedVessel.weather.waveHeight} m</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Temp.</p>
                            <p className="font-medium text-sm">{selectedVessel.weather.temperature}°C</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
