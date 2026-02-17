/**
 * Operations Overview Page - Visão Operacional em Tempo Real
 * Dashboard de operações marítimas consolidado com dados reais
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, Ship, Anchor, Navigation, AlertTriangle, 
  Clock, MapPin, Fuel, Users, TrendingUp, RefreshCw, MoreVertical,
  ArrowUp, ArrowDown, Minus, Download, AlertCircle
} from 'lucide-react';
import { useFleetOperations, VesselOperation } from '@/hooks/useFleetOperations';

export default function OperationsOverviewPage() {
  const { 
    operations, 
    kpis, 
    isLoading, 
    error, 
    refetch, 
    exportData 
  } = useFleetOperations();

  const getStatusColor = (status: VesselOperation['status']) => {
    switch (status) {
      case 'Navigating': return 'bg-success/10 text-success border-success/20';
      case 'Port': return 'bg-primary/10 text-primary border-primary/20';
      case 'Anchored': return 'bg-warning/10 text-warning border-warning/20';
      case 'Drydock': return 'bg-warning/10 text-warning border-warning/20';
      case 'Emergency': return 'bg-destructive/10 text-destructive border-destructive/20';
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={`ops-skel-${i}`}>
              <CardContent className="pt-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`ops-overview-skel-${i}`} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar operações</h3>
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

  // Empty state
  if (operations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ship className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma embarcação cadastrada</h3>
            <p className="text-muted-foreground">Cadastre embarcações para visualizar operações em tempo real.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Navegando</p>
                <p className="text-2xl font-bold text-success">{kpis?.navigating || 0}</p>
              </div>
              <Navigation className="h-8 w-8 text-success" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-success">
              <ArrowUp className="h-3 w-3" />
              <span>Tempo real</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Porto</p>
                <p className="text-2xl font-bold text-primary">{kpis?.inPort || 0}</p>
              </div>
              <Anchor className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Minus className="h-3 w-3" />
              <span>Atracados</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundeados</p>
                <p className="text-2xl font-bold text-warning">{kpis?.anchored || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-warning">
              <ArrowDown className="h-3 w-3" />
              <span>Aguardando</span>
            </div>
          </CardContent>
        </Card>

        <Card className={(kpis?.criticalAlerts || 0) > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-destructive">{kpis?.totalAlerts || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-xs text-destructive mt-2">
              {kpis?.criticalAlerts || 0} críticos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilização</p>
                <p className="text-2xl font-bold">{kpis?.fleetUtilization || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={kpis?.fleetUtilization || 0} className="mt-2 h-1.5" />
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
                Status operacional de toda a frota ({operations.length} embarcações)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
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
                          {vessel.speed !== undefined && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {vessel.speed.toFixed(1)} kn
                            </span>
                          )}
                          {vessel.crewOnboard && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {vessel.crewOnboard} tripulantes
                            </span>
                          )}
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
                      
                      <Button variant="ghost" size="icon" aria-label="Mais opções da embarcação" title="Mais opções">
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
                  <span className="font-medium">{kpis?.onTimePerformance || 0}%</span>
                </div>
                <Progress value={kpis?.onTimePerformance || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fleet Utilization</span>
                  <span className="font-medium">{kpis?.fleetUtilization || 0}%</span>
                </div>
                <Progress value={kpis?.fleetUtilization || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Velocidade Média</span>
                  <span className="font-medium">{kpis?.avgSpeed?.toFixed(1) || 0} knots</span>
                </div>
                <Progress value={((kpis?.avgSpeed || 0) / 20) * 100} className="h-2" />
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
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-3xl font-bold text-success">{kpis?.navigating || 0}</p>
                <p className="text-sm text-muted-foreground">Navegando</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">{kpis?.inPort || 0}</p>
                <p className="text-sm text-muted-foreground">Em Porto</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-3xl font-bold text-warning">{kpis?.anchored || 0}</p>
                <p className="text-sm text-muted-foreground">Fundeados</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-3xl font-bold text-warning">{kpis?.maintenance || 0}</p>
                <p className="text-sm text-muted-foreground">Manutenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
