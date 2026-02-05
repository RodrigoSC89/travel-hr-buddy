/**
 * Operations Overview Page - Visão Operacional em Tempo Real
 * Dashboard de operações marítimas consolidado
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Ship, Anchor, Navigation, AlertTriangle, CheckCircle2,
  Clock, MapPin, Fuel, Users, TrendingUp, RefreshCw, MoreVertical,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface VesselOperation {
  id: string;
  name: string;
  imo: string;
  status: 'Navigating' | 'Port' | 'Anchored' | 'Drydock' | 'Emergency';
  position: { lat: number; lng: number };
  destination?: string;
  eta?: Date;
  speed?: number;
  heading?: number;
  fuelROB?: number;
  crewOnboard: number;
  lastUpdate: Date;
  alerts: number;
}

const mockOperations: VesselOperation[] = [
  {
    id: 'V001',
    name: 'Atlantic Pioneer',
    imo: '9876543',
    status: 'Navigating',
    position: { lat: -23.5505, lng: -46.6333 },
    destination: 'Rotterdam',
    eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    speed: 14.2,
    heading: 45,
    fuelROB: 78,
    crewOnboard: 28,
    lastUpdate: new Date(),
    alerts: 0
  },
  {
    id: 'V002',
    name: 'Pacific Voyager',
    imo: '8765432',
    status: 'Port',
    position: { lat: 1.3521, lng: 103.8198 },
    destination: 'Singapore',
    fuelROB: 45,
    crewOnboard: 32,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    alerts: 2
  },
  {
    id: 'V003',
    name: 'Northern Star',
    imo: '7654321',
    status: 'Anchored',
    position: { lat: 51.9244, lng: 4.4777 },
    destination: 'Awaiting berth',
    fuelROB: 62,
    crewOnboard: 25,
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
    alerts: 1
  },
  {
    id: 'V004',
    name: 'Coral Queen',
    imo: '6543210',
    status: 'Drydock',
    position: { lat: 35.6762, lng: 139.6503 },
    crewOnboard: 8,
    lastUpdate: new Date(Date.now() - 60 * 60 * 1000),
    alerts: 0
  }
];

const operationalKPIs = {
  activeVessels: 45,
  navigating: 28,
  inPort: 12,
  anchored: 4,
  maintenance: 1,
  totalAlerts: 15,
  criticalAlerts: 3,
  avgSpeed: 13.8,
  fleetUtilization: 89,
  onTimePerformance: 94
};

export default function OperationsOverviewPage() {
  const [operations] = useState<VesselOperation[]>(mockOperations);

  const getStatusColor = (status: VesselOperation['status']) => {
    switch (status) {
      case 'Navigating': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Port': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Anchored': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Drydock': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Emergency': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: VesselOperation['status']) => {
    switch (status) {
      case 'Navigating': return <Navigation className="h-4 w-4" />;
      case 'Port': return <Anchor className="h-4 w-4" />;
      case 'Anchored': return <Anchor className="h-4 w-4" />;
      case 'Drydock': return <Ship className="h-4 w-4" />;
      case 'Emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Navegando</p>
                <p className="text-2xl font-bold text-green-500">{operationalKPIs.navigating}</p>
              </div>
              <Navigation className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <ArrowUp className="h-3 w-3" />
              <span>+3 desde ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Porto</p>
                <p className="text-2xl font-bold text-blue-500">{operationalKPIs.inPort}</p>
              </div>
              <Anchor className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Minus className="h-3 w-3" />
              <span>Estável</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundeados</p>
                <p className="text-2xl font-bold text-yellow-500">{operationalKPIs.anchored}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-500">
              <ArrowDown className="h-3 w-3" />
              <span>-1 desde ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card className={operationalKPIs.criticalAlerts > 0 ? 'border-red-500/50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-red-500">{operationalKPIs.totalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-xs text-red-500 mt-2">
              {operationalKPIs.criticalAlerts} críticos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilização</p>
                <p className="text-2xl font-bold">{operationalKPIs.fleetUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={operationalKPIs.fleetUtilization} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Operações em Tempo Real
              </CardTitle>
              <CardDescription>
                Status operacional de toda a frota
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operations.map((vessel) => (
              <Card key={vessel.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(vessel.status)}`}>
                        {getStatusIcon(vessel.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{vessel.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            IMO {vessel.imo}
                          </Badge>
                          {vessel.alerts > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {vessel.alerts} alertas
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vessel.destination || 'N/A'}
                          </span>
                          {vessel.speed && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {vessel.speed} kn
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {vessel.crewOnboard} tripulantes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {vessel.fuelROB !== undefined && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span>{vessel.fuelROB}%</span>
                          </div>
                          <Progress value={vessel.fuelROB} className="w-20 h-1.5 mt-1" />
                        </div>
                      )}
                      
                      <Badge variant="outline" className={getStatusColor(vessel.status)}>
                        {vessel.status}
                      </Badge>
                      
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>On-Time Performance</span>
                  <span className="font-medium">{operationalKPIs.onTimePerformance}%</span>
                </div>
                <Progress value={operationalKPIs.onTimePerformance} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fleet Utilization</span>
                  <span className="font-medium">{operationalKPIs.fleetUtilization}%</span>
                </div>
                <Progress value={operationalKPIs.fleetUtilization} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Velocidade Média</span>
                  <span className="font-medium">{operationalKPIs.avgSpeed} knots</span>
                </div>
                <Progress value={(operationalKPIs.avgSpeed / 20) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-3xl font-bold text-green-500">{operationalKPIs.navigating}</p>
                <p className="text-sm text-muted-foreground">Navegando</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-3xl font-bold text-blue-500">{operationalKPIs.inPort}</p>
                <p className="text-sm text-muted-foreground">Em Porto</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-3xl font-bold text-yellow-500">{operationalKPIs.anchored}</p>
                <p className="text-sm text-muted-foreground">Fundeados</p>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <p className="text-3xl font-bold text-orange-500">{operationalKPIs.maintenance}</p>
                <p className="text-sm text-muted-foreground">Manutenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
