/**
 * PATCH 501: Satellite Tracker Dashboard
 * Real-time satellite tracking with position, orbit, and coverage visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, Activity, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { satelliteTrackingService } from '../services/satellite-tracking-service';
import { SatelliteMap } from './SatelliteMap';
import { OrbitVisualization } from './OrbitVisualization';
import { CoverageMap } from './CoverageMap';
import { SatelliteAlerts } from './SatelliteAlerts';
import { toast } from 'sonner';

interface SatelliteInfo {
  id: string;
  noradId: number;
  name: string;
  type: string;
  status: string;
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    velocity?: number;
  };
}

export const SatelliteDashboard: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteInfo[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSatellites();
    const interval = setInterval(updatePositions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSatellites = async () => {
    try {
      setIsLoading(true);
      const data = await satelliteTrackingService.getActiveSatellites();
      
      // Load positions for each satellite
      const satellitesWithPositions = await Promise.all(
        data.map(async (sat) => {
          const position = await satelliteTrackingService.getCurrentPosition(sat.id);
          return {
            id: sat.id,
            noradId: sat.noradId,
            name: sat.name,
            type: sat.satelliteType,
            status: sat.isActive ? 'active' : 'inactive',
            position: position ? {
              latitude: position.latitude,
              longitude: position.longitude,
              altitude: position.altitude,
              velocity: position.velocity
            } : undefined
          };
        })
      );

      setSatellites(satellitesWithPositions);
      if (satellitesWithPositions.length > 0 && !selectedSatellite) {
        setSelectedSatellite(satellitesWithPositions[0]);
      }
    } catch (error) {
      console.error('Failed to load satellites:', error);
      toast.error('Falha ao carregar satélites');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePositions = async () => {
    if (satellites.length === 0) return;
    
    setIsUpdating(true);
    try {
      const updatedSatellites = await Promise.all(
        satellites.map(async (sat) => {
          try {
            const newPosition = await satelliteTrackingService.calculateSatellitePosition(sat.id);
            return {
              ...sat,
              position: {
                latitude: newPosition.latitude,
                longitude: newPosition.longitude,
                altitude: newPosition.altitude,
                velocity: newPosition.velocity
              }
            };
          } catch (error) {
            console.error(`Failed to update position for ${sat.name}:`, error);
            return sat;
          }
        })
      );
      
      setSatellites(updatedSatellites);
      setLastUpdate(new Date());
      
      // Update selected satellite if it exists
      if (selectedSatellite) {
        const updated = updatedSatellites.find(s => s.id === selectedSatellite.id);
        if (updated) setSelectedSatellite(updated);
      }
    } catch (error) {
      console.error('Failed to update positions:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando satélites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Satellite Tracker
          </h1>
          <p className="text-muted-foreground">
            Rastreamento em tempo real • {satellites.length} satélites ativos
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button onClick={updatePositions} disabled={isUpdating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Satélites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satellites.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {satellites.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rastreados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {satellites.filter(s => s.position).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Satellite List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Satélites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {satellites.map((sat) => (
              <div
                key={sat.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSatellite?.id === sat.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedSatellite(sat)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Satellite className="h-4 w-4" />
                    <span className="font-medium text-sm">{sat.name}</span>
                  </div>
                  <Badge className={getStatusColor(sat.status)}>
                    {sat.status}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>NORAD: {sat.noradId}</div>
                  <div>Tipo: {sat.type}</div>
                  {sat.position && (
                    <>
                      <div>Alt: {sat.position.altitude.toFixed(1)} km</div>
                      <div>Vel: {sat.position.velocity?.toFixed(2)} km/s</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSatellite ? selectedSatellite.name : 'Selecione um satélite'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSatellite ? (
              <Tabs defaultValue="position">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="position">
                    <Globe className="h-4 w-4 mr-2" />
                    Posição
                  </TabsTrigger>
                  <TabsTrigger value="orbit">
                    <Activity className="h-4 w-4 mr-2" />
                    Órbita
                  </TabsTrigger>
                  <TabsTrigger value="coverage">
                    <Satellite className="h-4 w-4 mr-2" />
                    Cobertura
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="position" className="mt-4">
                  <SatelliteMap satellite={selectedSatellite} />
                </TabsContent>
                
                <TabsContent value="orbit" className="mt-4">
                  <OrbitVisualization satellite={selectedSatellite} />
                </TabsContent>
                
                <TabsContent value="coverage" className="mt-4">
                  <CoverageMap satellite={selectedSatellite} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Selecione um satélite para visualizar os detalhes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {selectedSatellite && (
        <SatelliteAlerts satelliteId={selectedSatellite.id} />
      )}
    </div>
  );
};
