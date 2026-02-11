/**
 * Real-Time Tracking Page - Rastreamento em Tempo Real
 * Mapa e lista de embarcações com posições conectadas ao Supabase
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Ship, Navigation, Clock, Fuel, Search,
  RefreshCw, Maximize2, Radio, Activity,
  AlertTriangle, Anchor, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFleetTracking, VesselPosition } from '@/hooks/useFleetTracking';

export default function RealTimeTrackingPage() {
  const { vessels, stats, isLoading, error, refetch } = useFleetTracking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const getStatusColor = (status: VesselPosition['status']) => {
    switch (status) {
      case 'underway': return 'bg-success';
      case 'moored': return 'bg-info';
      case 'anchored': return 'bg-warning';
      default: return 'bg-muted';
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
      case 'excellent': return <Radio className="h-4 w-4 text-success" />;
      case 'good': return <Radio className="h-4 w-4 text-info" />;
      case 'poor': return <Radio className="h-4 w-4 text-warning" />;
      case 'lost': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.mmsi.includes(searchTerm) ||
    v.imo.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados de rastreamento</h3>
            <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vessels.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ship className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma embarcação para rastrear</h3>
            <p className="text-muted-foreground">Cadastre embarcações para visualizar o rastreamento em tempo real.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold text-success">{stats.underway}</p>
              </div>
              <Navigation className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atracados</p>
                <p className="text-2xl font-bold text-info">{stats.moored}</p>
              </div>
              <Anchor className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundeados</p>
                <p className="text-2xl font-bold text-warning">{stats.anchored}</p>
              </div>
              <Anchor className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={stats.signalLost > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sinal Perdido</p>
                <p className="text-2xl font-bold text-destructive">{stats.signalLost}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa em Tempo Real
                </CardTitle>
                <CardDescription>
                  {vessels.length} embarcações rastreadas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refetch}>
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-blue-800/10" />
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
              
              {vessels.slice(0, 6).map((vessel, idx) => (
                <div 
                  key={vessel.id}
                  className={`absolute cursor-pointer transition-transform hover:scale-110 ${
                    selectedVessel === vessel.id ? 'scale-125 z-10' : ''
                  }`}
                  style={{
                    left: `${15 + (idx % 3) * 30}%`,
                    top: `${25 + Math.floor(idx / 3) * 40}%`
                  }}
                  onClick={() => setSelectedVessel(vessel.id)}
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(vessel.status)} animate-pulse`} />
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-background/90 px-2 py-1 rounded text-xs whitespace-nowrap shadow-sm">
                    {vessel.name}
                  </div>
                </div>
              ))}
              
              <div className="text-center z-10">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
                <p className="text-muted-foreground">Mapa AIS Interativo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dados em tempo real do Supabase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        <span>{vessel.speed.toFixed(1)} kn / {vessel.course}°</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(vessel.lastUpdate, "HH:mm", { locale: ptBR })}</span>
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

              {filteredVessels.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma embarcação encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Navegando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info" />
              <span className="text-sm">Atracado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm">Fundeado</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-success" />
              <span className="text-sm">Sinal Excelente</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm">Sinal Perdido</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}