/**
 * Enhanced Operations Command Center - Premium Experience
 * PATCH OPERATIONS-2.0 - Complete operational management
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Navigation, Ship, Anchor, Fuel, Clock, MapPin, AlertTriangle,
  RefreshCw, Activity, Thermometer, Gauge, Wind, Waves,
  TrendingUp, Calendar, Users, Radio, Eye, PlayCircle,
  CheckCircle, XCircle, Timer, BarChart3, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, differenceInHours, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VesselStatus {
  id: string;
  name: string;
  type: string;
  status: 'underway' | 'anchored' | 'moored' | 'maintenance' | 'emergency';
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  destination: string;
  eta: Date;
  fuelLevel: number;
  cargoLoad: number;
  crewOnboard: number;
  lastUpdate: Date;
}

interface TelemetryData {
  vesselId: string;
  engineRpm: number;
  engineTemp: number;
  fuelConsumption: number;
  speed: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  seaTemp: number;
}

interface OperationalAlert {
  id: string;
  type: 'weather' | 'maintenance' | 'safety' | 'navigation' | 'crew';
  severity: 'info' | 'warning' | 'critical';
  vessel: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export const EnhancedOperationsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const [vessels, setVessels] = useState<VesselStatus[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);

  useEffect(() => {
    loadOperationsData();
    const interval = setInterval(loadOperationsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOperationsData = async () => {
    setLoading(true);
    try {
      // Load operations data

      setVessels([
        {
          id: '1',
          name: 'MV Atlantic Star',
          type: 'Bulk Carrier',
          status: 'underway',
          position: { lat: -23.9547, lng: -46.3323 },
          speed: 12.5,
          heading: 45,
          destination: 'Porto de Rotterdam',
          eta: addHours(new Date(), 168),
          fuelLevel: 72,
          cargoLoad: 85,
          crewOnboard: 24,
          lastUpdate: new Date()
        },
        {
          id: '2',
          name: 'MV Pacific Explorer',
          type: 'Container Ship',
          status: 'moored',
          position: { lat: -22.8808, lng: -43.1729 },
          speed: 0,
          heading: 180,
          destination: 'Porto do Rio de Janeiro',
          eta: new Date(),
          fuelLevel: 45,
          cargoLoad: 60,
          crewOnboard: 28,
          lastUpdate: new Date()
        },
        {
          id: '3',
          name: 'MV Ocean Titan',
          type: 'Tanker',
          status: 'anchored',
          position: { lat: -3.7319, lng: -38.5267 },
          speed: 0,
          heading: 90,
          destination: 'Porto de Fortaleza',
          eta: addHours(new Date(), 6),
          fuelLevel: 88,
          cargoLoad: 95,
          crewOnboard: 22,
          lastUpdate: new Date()
        },
        {
          id: '4',
          name: 'MV Caribbean Queen',
          type: 'Offshore Support',
          status: 'maintenance',
          position: { lat: -22.4085, lng: -41.7824 },
          speed: 0,
          heading: 0,
          destination: 'Estaleiro Mauá',
          eta: addHours(new Date(), 72),
          fuelLevel: 30,
          cargoLoad: 0,
          crewOnboard: 15,
          lastUpdate: new Date()
        }
      ]);

      setTelemetry([
        { vesselId: '1', engineRpm: 145, engineTemp: 82, fuelConsumption: 8.5, speed: 12.5, windSpeed: 15, windDirection: 270, waveHeight: 1.2, seaTemp: 24 },
        { vesselId: '2', engineRpm: 0, engineTemp: 35, fuelConsumption: 0.5, speed: 0, windSpeed: 8, windDirection: 180, waveHeight: 0.5, seaTemp: 26 },
        { vesselId: '3', engineRpm: 0, engineTemp: 42, fuelConsumption: 0.8, speed: 0, windSpeed: 12, windDirection: 90, waveHeight: 0.8, seaTemp: 28 },
        { vesselId: '4', engineRpm: 0, engineTemp: 25, fuelConsumption: 0, speed: 0, windSpeed: 5, windDirection: 45, waveHeight: 0.3, seaTemp: 25 },
      ]);

      setAlerts([
        { id: '1', type: 'weather', severity: 'warning', vessel: 'MV Atlantic Star', message: 'Tempestade prevista no trajeto em 48h', timestamp: new Date(), acknowledged: false },
        { id: '2', type: 'maintenance', severity: 'info', vessel: 'MV Ocean Titan', message: 'Manutenção preventiva agendada para próximo porto', timestamp: new Date(), acknowledged: true },
        { id: '3', type: 'safety', severity: 'critical', vessel: 'MV Caribbean Queen', message: 'Inspeção de segurança pendente', timestamp: new Date(), acknowledged: false },
        { id: '4', type: 'navigation', severity: 'info', vessel: 'MV Pacific Explorer', message: 'Prático confirmado para 14:00', timestamp: new Date(), acknowledged: true },
      ]);

    } catch (error) {
      logger.error('Error loading operations data', error as Error);
      toast.error('Erro ao carregar dados operacionais');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'underway': return 'bg-success/20 text-success border-success/30';
      case 'moored': return 'bg-info/20 text-info border-info/30';
      case 'anchored': return 'bg-warning/20 text-warning border-warning/30';
      case 'maintenance': return 'bg-warning/20 text-warning border-warning/30';
      case 'emergency': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'info': return 'bg-info text-info-foreground';
      default: return 'bg-muted';
    }
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success('Alerta reconhecido');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={`ops-skeleton-${i}`} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-info/20 to-primary/10 border border-info/20">
            <Navigation className="h-8 w-8 text-info" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro de Operações</h1>
            <p className="text-muted-foreground">Monitoramento em tempo real da frota</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-success/10 text-success">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {vessels.filter(v => v.status === 'underway').length} navegando
          </Badge>
          <Button variant="outline" onClick={loadOperationsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Embarcações', value: vessels.length, icon: Ship, color: 'text-primary' },
          { label: 'Em Navegação', value: vessels.filter(v => v.status === 'underway').length, icon: Navigation, color: 'text-success' },
          { label: 'Em Porto', value: vessels.filter(v => v.status === 'moored' || v.status === 'anchored').length, icon: Anchor, color: 'text-info' },
          { label: 'Alertas Ativos', value: alerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: 'text-destructive' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Telemetria
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programação
          </TabsTrigger>
        </TabsList>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-4">
          <div className="grid gap-4">
            {vessels.map((vessel) => (
              <Card key={vessel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(vessel.status)}`}>
                        <Ship className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{vessel.name}</h3>
                          <Badge variant="outline">{vessel.type}</Badge>
                          <Badge className={getStatusColor(vessel.status)}>
                            {vessel.status === 'underway' ? 'Navegando' :
                             vessel.status === 'moored' ? 'Atracado' :
                             vessel.status === 'anchored' ? 'Fundeado' :
                             vessel.status === 'maintenance' ? 'Manutenção' : 'Emergência'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vessel.position.lat.toFixed(4)}°, {vessel.position.lng.toFixed(4)}°
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {vessel.speed} nós
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {vessel.crewOnboard} tripulantes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{vessel.destination}</span>
                          <span className="text-xs text-muted-foreground">
                            ETA: {format(vessel.eta, "dd/MM HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Combustível</p>
                        <div className="flex items-center gap-2">
                          <Progress value={vessel.fuelLevel} className="w-20 h-2" />
                          <span className="text-sm font-medium">{vessel.fuelLevel}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Carga</p>
                        <div className="flex items-center gap-2">
                          <Progress value={vessel.cargoLoad} className="w-20 h-2" />
                          <span className="text-sm font-medium">{vessel.cargoLoad}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vessels.map((vessel) => {
              const data = telemetry.find(t => t.vesselId === vessel.id);
              if (!data) return null;
              
              return (
                <Card key={vessel.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      {vessel.name}
                    </CardTitle>
                    <CardDescription>Dados em tempo real</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">RPM Motor</span>
                        </div>
                        <p className="text-2xl font-bold">{data.engineRpm}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">Temp. Motor</span>
                        </div>
                        <p className="text-2xl font-bold">{data.engineTemp}°C</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Fuel className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">Consumo</span>
                        </div>
                        <p className="text-2xl font-bold">{data.fuelConsumption} t/h</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Navigation className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Velocidade</span>
                        </div>
                        <p className="text-2xl font-bold">{data.speed} nós</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Wind className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Vento</span>
                        </div>
                        <p className="text-2xl font-bold">{data.windSpeed} kt</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Waves className="h-4 w-4 text-info" />
                          <span className="text-sm text-muted-foreground">Ondas</span>
                        </div>
                        <p className="text-2xl font-bold">{data.waveHeight} m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.acknowledged ? 'border-l-4' : ''} ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.message}</h4>
                          {alert.acknowledged && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {alert.vessel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(alert.timestamp, "dd/MM HH:mm")}
                          </span>
                          <Badge variant="outline">{alert.type}</Badge>
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                        Reconhecer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Programação de Viagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vessels.map((vessel) => (
                  <div key={vessel.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Ship className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{vessel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vessel.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">ETA</p>
                        <p className="font-medium">{format(vessel.eta, "dd/MM/yyyy HH:mm")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tempo Restante</p>
                        <p className="font-medium">{differenceInHours(vessel.eta, new Date())}h</p>
                      </div>
                      <Badge className={getStatusColor(vessel.status)}>
                        {vessel.status === 'underway' ? 'Em Viagem' :
                         vessel.status === 'moored' ? 'Em Porto' : vessel.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOperationsCenter;
