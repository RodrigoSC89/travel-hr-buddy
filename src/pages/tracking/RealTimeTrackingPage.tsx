/**
 * Real-Time Tracking Page - Rastreamento em Tempo Real
 * Mapa e lista de embarcações com posições AIS/GNSS
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Ship, Navigation, Clock, Fuel, Search,
  RefreshCw, Filter, Maximize2, Radio, Activity,
  AlertTriangle, CheckCircle2, Anchor, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VesselPosition {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  position: {
    lat: number;
    lng: number;
  };
  course: number;
  speed: number;
  status: 'underway' | 'moored' | 'anchored' | 'not-defined';
  destination?: string;
  eta?: Date;
  lastUpdate: Date;
  signalQuality: 'excellent' | 'good' | 'poor' | 'lost';
  fuelROB?: number;
}

const mockVessels: VesselPosition[] = [
  {
    id: 'V001',
    name: 'Atlantic Pioneer',
    mmsi: '123456789',
    imo: '9876543',
    position: { lat: -23.9618, lng: -46.3322 },
    course: 45,
    speed: 14.2,
    status: 'underway',
    destination: 'Rotterdam',
    eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    lastUpdate: new Date(),
    signalQuality: 'excellent',
    fuelROB: 78
  },
  {
    id: 'V002',
    name: 'Pacific Voyager',
    mmsi: '234567890',
    imo: '8765432',
    position: { lat: 1.2903, lng: 103.8520 },
    course: 0,
    speed: 0,
    status: 'moored',
    destination: 'Singapore',
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    signalQuality: 'good',
    fuelROB: 45
  },
  {
    id: 'V003',
    name: 'Northern Star',
    mmsi: '345678901',
    imo: '7654321',
    position: { lat: 51.8853, lng: 4.5028 },
    course: 180,
    speed: 0,
    status: 'anchored',
    destination: 'Rotterdam',
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    signalQuality: 'poor',
    fuelROB: 62
  },
  {
    id: 'V004',
    name: 'Coral Queen',
    mmsi: '456789012',
    imo: '6543210',
    position: { lat: 35.4437, lng: 139.6380 },
    course: 90,
    speed: 12.5,
    status: 'underway',
    destination: 'Yokohama',
    eta: new Date(Date.now() + 12 * 60 * 60 * 1000),
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    signalQuality: 'excellent',
    fuelROB: 55
  },
  {
    id: 'V005',
    name: 'Ocean Explorer',
    mmsi: '567890123',
    imo: '5432109',
    position: { lat: -33.8688, lng: 151.2093 },
    course: 270,
    speed: 0,
    status: 'moored',
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
    signalQuality: 'lost'
  }
];

export default function RealTimeTrackingPage() {
  const [vessels, setVessels] = useState<VesselPosition[]>(mockVessels);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const getStatusColor = (status: VesselPosition['status']) => {
    switch (status) {
      case 'underway': return 'bg-green-500';
      case 'moored': return 'bg-blue-500';
      case 'anchored': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: VesselPosition['status']) => {
    switch (status) {
      case 'underway': return 'Navegando';
      case 'moored': return 'Atracado';
      case 'anchored': return 'Fundeado';
      default: return 'Indefinido';
    }
  };

  const getSignalIcon = (quality: VesselPosition['signalQuality']) => {
    switch (quality) {
      case 'excellent': return <Radio className="h-4 w-4 text-green-500" />;
      case 'good': return <Radio className="h-4 w-4 text-blue-500" />;
      case 'poor': return <Radio className="h-4 w-4 text-yellow-500" />;
      case 'lost': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Simular atualização
  };

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.mmsi.includes(searchTerm) ||
    v.imo.includes(searchTerm)
  );

  const stats = {
    total: vessels.length,
    underway: vessels.filter(v => v.status === 'underway').length,
    moored: vessels.filter(v => v.status === 'moored').length,
    anchored: vessels.filter(v => v.status === 'anchored').length,
    signalLost: vessels.filter(v => v.signalQuality === 'lost').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ship className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Navegando</p>
                <p className="text-2xl font-bold text-green-500">{stats.underway}</p>
              </div>
              <Navigation className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atracados</p>
                <p className="text-2xl font-bold text-blue-500">{stats.moored}</p>
              </div>
              <Anchor className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundeados</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.anchored}</p>
              </div>
              <Anchor className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={stats.signalLost > 0 ? 'border-red-500/50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sinal Perdido</p>
                <p className="text-2xl font-bold text-red-500">{stats.signalLost}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa em Tempo Real
                </CardTitle>
                <CardDescription>
                  Última atualização: {format(lastRefresh, "HH:mm:ss", { locale: ptBR })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button variant="outline" size="icon">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Map background simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-blue-800/10" />
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
              
              {/* Vessel markers simulation */}
              {vessels.slice(0, 4).map((vessel, idx) => (
                <div 
                  key={vessel.id}
                  className="absolute"
                  style={{
                    left: `${20 + idx * 18}%`,
                    top: `${30 + (idx % 2) * 30}%`
                  }}
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(vessel.status)} animate-pulse`} />
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {vessel.name}
                  </div>
                </div>
              ))}
              
              <div className="text-center z-10">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
                <p className="text-muted-foreground">Mapa AIS Interativo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {vessels.length} embarcações rastreadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vessel List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Embarcações</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar navio, MMSI, IMO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredVessels.map((vessel) => (
                <Card 
                  key={vessel.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedVessel === vessel.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedVessel(vessel.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(vessel.status)}`} />
                        <span className="font-medium text-sm">{vessel.name}</span>
                      </div>
                      {getSignalIcon(vessel.signalQuality)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>{vessel.speed} kn / {vessel.course}°</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(vessel.lastUpdate, "HH:mm")}</span>
                      </div>
                    </div>
                    
                    {vessel.destination && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Destino: </span>
                        <span className="font-medium">{vessel.destination}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(vessel.status)}
                      </Badge>
                      {vessel.fuelROB && (
                        <div className="flex items-center gap-1 text-xs">
                          <Fuel className="h-3 w-3" />
                          <span>{vessel.fuelROB}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Navegando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Atracado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Fundeado</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-green-500" />
              <span className="text-sm">Sinal Excelente</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Sinal Perdido</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
