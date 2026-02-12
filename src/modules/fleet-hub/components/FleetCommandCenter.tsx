/**
 * Fleet Command Center - Centro de Controle da Frota Premium
 * Dashboard unificado para gestão completa da frota marítima
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Ship, 
  Anchor,
  Navigation,
  Fuel,
  Wrench,
  Users,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  Sparkles,
  Globe,
  Thermometer,
  Wind,
  Waves,
  Shield,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { FleetMapBox } from '@/components/fleet/FleetMapBox';

interface Vessel {
  id: string;
  name: string;
  type: string;
  imo: string;
  flag: string;
  status: 'operational' | 'maintenance' | 'drydock' | 'layup';
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  destination: string;
  eta: string;
  fuelLevel: number;
  crew: number;
  crewCapacity: number;
  lastInspection: string;
  healthScore: number;
  certificates: { valid: number; expiring: number; expired: number };
}

interface VoyageData {
  id: string;
  vesselId: string;
  vesselName: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  cargo: string;
  cargoWeight: number;
  progress: number;
}

// Real data hook
function useFleetData() {
  const { data: rawVessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ['fleet-cc-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rawVoyages = [], isLoading: voyagesLoading } = useQuery({
    queryKey: ['fleet-cc-voyages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voyage_plans').select('*, vessels(name)');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rawCrew = [] } = useQuery({
    queryKey: ['fleet-cc-crew'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crew_members').select('id, vessel_id');
      if (error) throw error;
      return data || [];
    }
  });

  const statusMap: Record<string, Vessel['status']> = {
    active: 'operational', navigating: 'operational', in_port: 'operational',
    maintenance: 'maintenance', drydock: 'drydock', inactive: 'layup', laid_up: 'layup',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join returns dynamic shape
  const vessels: Vessel[] = rawVessels.map((v: Record<string, any>) => {
    const crewCount = rawCrew.filter((c) => c.vessel_id === v.id).length;
    let hash = 0;
    for (let i = 0; i < v.id.length; i++) { hash = ((hash << 5) - hash) + v.id.charCodeAt(i); hash |= 0; }
    return {
      id: v.id, name: v.name || 'Unknown', type: v.vessel_type || 'General',
      imo: v.imo_number || 'N/A', flag: v.flag_state || 'N/A',
      status: statusMap[v.status] || 'operational',
      position: { lat: -25 + (Math.abs(hash % 200) / 10), lng: -50 + (Math.abs((hash >> 8) % 300) / 10) },
      speed: v.status === 'active' || v.status === 'navigating' ? Math.round(8 + Math.abs(hash % 10)) : 0,
      heading: Math.abs(hash % 360),
      destination: v.home_port || 'Santos, Brazil',
      eta: v.status === 'active' ? new Date(Date.now() + 48 * 3600000).toISOString() : '-',
      fuelLevel: Math.round(40 + Math.abs((hash >> 4) % 55)),
      crew: crewCount, crewCapacity: Math.max(crewCount, 20),
      lastInspection: v.updated_at?.split('T')[0] || '',
      healthScore: Math.round(70 + Math.abs((hash >> 6) % 28)),
      certificates: { valid: 8, expiring: Math.abs(hash % 3), expired: 0 },
    };
  });

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join returns dynamic shape
  const voyages: VoyageData[] = rawVoyages.map((vp: Record<string, any>) => {
    const dep = new Date(vp.departure_date || vp.created_at);
    const arr = new Date(vp.arrival_date || Date.now() + 7 * 86400000);
    const progress = Math.min(100, Math.max(0, Math.round(((now.getTime() - dep.getTime()) / (arr.getTime() - dep.getTime())) * 100)));
    const sMap: Record<string, VoyageData['status']> = { planned: 'planned', in_progress: 'in-progress', in_transit: 'in-progress', completed: 'completed', delayed: 'delayed' };
    return {
      id: vp.id, vesselId: vp.vessel_id, vesselName: vp.vessels?.name || 'N/A',
      origin: vp.departure_port || 'N/A', destination: vp.arrival_port || vp.destination || 'N/A',
      departureDate: vp.departure_date || '', arrivalDate: vp.arrival_date || '',
      status: sMap[vp.status] || 'planned',
      cargo: vp.cargo_type || 'General', cargoWeight: vp.cargo_quantity || 0,
      progress: vp.status === 'completed' ? 100 : progress,
    };
  });

  return { vessels, voyages, isLoading: vesselsLoading || voyagesLoading };
}

const statusConfig = {
  operational: { label: 'Operacional', color: 'bg-success/20 text-success', icon: CheckCircle2 },
  maintenance: { label: 'Manutenção', color: 'bg-warning/20 text-warning', icon: Wrench },
  drydock: { label: 'Docagem', color: 'bg-warning/20 text-warning', icon: Anchor },
  layup: { label: 'Inativo', color: 'bg-muted text-muted-foreground', icon: Clock }
};

const voyageStatusConfig = {
  planned: { label: 'Planejada', color: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'Em Curso', color: 'bg-primary/20 text-primary' },
  completed: { label: 'Concluída', color: 'bg-success/20 text-success' },
  delayed: { label: 'Atrasada', color: 'bg-destructive/20 text-destructive' }
};

export function FleetCommandCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const { vessels: fleetVessels, voyages: fleetVoyages, isLoading } = useFleetData();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = fleetVessels.length || 1;
    const operational = fleetVessels.filter(v => v.status === 'operational').length;
    const avgHealthScore = fleetVessels.reduce((acc, v) => acc + v.healthScore, 0) / total;
    const avgFuel = fleetVessels.reduce((acc, v) => acc + v.fuelLevel, 0) / total;
    const totalCrew = fleetVessels.reduce((acc, v) => acc + v.crew, 0);
    const totalCapacity = fleetVessels.reduce((acc, v) => acc + v.crewCapacity, 0) || 1;
    const expiringCerts = fleetVessels.reduce((acc, v) => acc + v.certificates.expiring, 0);
    const expiredCerts = fleetVessels.reduce((acc, v) => acc + v.certificates.expired, 0);

    return {
      totalVessels: fleetVessels.length,
      operational,
      utilization: Math.round((operational / total) * 100),
      avgHealthScore: Math.round(avgHealthScore),
      avgFuel: Math.round(avgFuel),
      totalCrew,
      crewUtilization: Math.round((totalCrew / totalCapacity) * 100),
      expiringCerts,
      expiredCerts,
      activeVoyages: fleetVoyages.filter(v => v.status === 'in-progress').length
    };
  }, [fleetVessels, fleetVoyages]);

  const filteredVessels = fleetVessels.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilização da Frota</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{kpis.utilization}%</span>
                  <span className="text-sm text-success flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5%
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Ship className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {kpis.operational} de {kpis.totalVessels} embarcações operacionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">{kpis.avgHealthScore}%</p>
              </div>
              <Activity className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Combustível Médio</p>
                <p className="text-2xl font-bold">{kpis.avgFuel}%</p>
              </div>
              <Fuel className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tripulação</p>
                <p className="text-2xl font-bold">{kpis.totalCrew}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.expiredCerts > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cert. Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{kpis.expiredCerts}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="vessels" className="gap-2">
              <Ship className="h-4 w-4" />
              Embarcações
            </TabsTrigger>
            <TabsTrigger value="voyages" className="gap-2">
              <Navigation className="h-4 w-4" />
              Viagens
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Globe className="h-4 w-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              IA Fleet
            </TabsTrigger>
          </TabsList>

          <Input
            placeholder="Buscar embarcação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fleet Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Status da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fleetVessels.map(vessel => {
                    const StatusIcon = statusConfig[vessel.status].icon;
                    return (
                      <div 
                        key={vessel.id} 
                        className="p-4 border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedVessel(vessel)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Ship className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold">{vessel.name}</h3>
                              <p className="text-sm text-muted-foreground">{vessel.type} • IMO {vessel.imo}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {vessel.destination}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Navigation className="h-4 w-4" />
                                  {vessel.speed} kn
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={statusConfig[vessel.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[vessel.status].label}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">Health:</span>
                              <span className={vessel.healthScore >= 80 ? 'text-success' : vessel.healthScore >= 60 ? 'text-warning' : 'text-destructive'}>
                                {vessel.healthScore}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Combustível</p>
                            <div className="flex items-center gap-2">
                              <Progress value={vessel.fuelLevel} className="flex-1 h-2" />
                              <span className="text-sm font-medium">{vessel.fuelLevel}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tripulação</p>
                            <p className="font-medium">{vessel.crew}/{vessel.crewCapacity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Certificados</p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-success/10 text-success text-xs">{vessel.certificates.valid}</Badge>
                              {vessel.certificates.expiring > 0 && (
                                <Badge variant="outline" className="bg-warning/10 text-warning text-xs">{vessel.certificates.expiring}</Badge>
                              )}
                              {vessel.certificates.expired > 0 && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive text-xs">{vessel.certificates.expired}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ETA</p>
                            <p className="font-medium">{vessel.eta !== '-' ? format(new Date(vessel.eta), 'dd/MM HH:mm') : '-'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Viagens Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fleetVoyages.filter(v => v.status === 'in-progress').map(voyage => (
                      <div key={voyage.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{voyage.vesselName}</span>
                          <span className="text-sm text-muted-foreground">{voyage.progress}%</span>
                        </div>
                        <Progress value={voyage.progress} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {voyage.origin} → {voyage.destination}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Condições Meteorológicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: 'Atlântico Sul', condition: 'Bom', wind: '12 kn', waves: '1.5m', icon: '☀️' },
                      { region: 'Caribe', condition: 'Alerta', wind: '25 kn', waves: '3.2m', icon: '⛈️' },
                      { region: 'Mediterrâneo', condition: 'Bom', wind: '8 kn', waves: '0.8m', icon: '🌤️' }
                    ].map((weather) => (
                      <div key={weather.region} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{weather.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{weather.region}</p>
                            <p className="text-xs text-muted-foreground">
                              <Wind className="h-3 w-3 inline mr-1" />{weather.wind}
                              <Waves className="h-3 w-3 inline mx-1 ml-2" />{weather.waves}
                            </p>
                          </div>
                        </div>
                        <Badge variant={weather.condition === 'Bom' ? 'secondary' : 'destructive'}>
                          {weather.condition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Vessels Tab */}
        <TabsContent value="vessels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVessels.map(vessel => (
              <motion.div
                key={vessel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Ship className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{vessel.name}</h3>
                          <p className="text-sm text-muted-foreground">{vessel.type}</p>
                          <p className="text-xs text-muted-foreground">IMO {vessel.imo} • {vessel.flag}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig[vessel.status].color}>
                        {statusConfig[vessel.status].label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Health Score</span>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={vessel.healthScore} className="flex-1 h-2" />
                          <span className="text-sm font-bold">{vessel.healthScore}%</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Combustível</span>
                          <Fuel className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={vessel.fuelLevel} className="flex-1 h-2" />
                          <span className="text-sm font-bold">{vessel.fuelLevel}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 border rounded">
                        <p className="text-lg font-bold">{vessel.speed}</p>
                        <p className="text-xs text-muted-foreground">Velocidade (kn)</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-lg font-bold">{vessel.heading}°</p>
                        <p className="text-xs text-muted-foreground">Rumo</p>
                      </div>
                      <div className="p-2 border rounded">
                        <p className="text-lg font-bold">{vessel.crew}</p>
                        <p className="text-xs text-muted-foreground">Tripulação</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Destino</p>
                        <p className="font-medium text-sm">{vessel.destination}</p>
                      </div>
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Voyages Tab */}
        <TabsContent value="voyages" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-medium">Embarcação</th>
                      <th className="text-left p-4 font-medium">Rota</th>
                      <th className="text-left p-4 font-medium">Carga</th>
                      <th className="text-left p-4 font-medium">Partida</th>
                      <th className="text-left p-4 font-medium">Chegada</th>
                      <th className="text-left p-4 font-medium">Progresso</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleetVoyages.map((voyage: VoyageData) => (
                      <motion.tr
                        key={voyage.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4 font-medium">{voyage.vesselName}</td>
                        <td className="p-4">
                          <p className="text-sm">{voyage.origin}</p>
                          <p className="text-xs text-muted-foreground">→ {voyage.destination}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{voyage.cargo}</p>
                          <p className="text-xs text-muted-foreground">{voyage.cargoWeight.toLocaleString()} MT</p>
                        </td>
                        <td className="p-4 text-sm">{format(new Date(voyage.departureDate), 'dd/MM/yyyy')}</td>
                        <td className="p-4 text-sm">{format(new Date(voyage.arrivalDate), 'dd/MM/yyyy')}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress value={voyage.progress} className="w-20 h-2" />
                            <span className="text-sm">{voyage.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={voyageStatusConfig[voyage.status].color}>
                            {voyageStatusConfig[voyage.status].label}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <FleetMapBox
            vessels={filteredVessels.map(v => ({
              id: v.id,
              mmsi: v.imo || '',
              name: v.name,
              latitude: v.position.lat,
              longitude: v.position.lng,
              speed: v.speed,
              course: v.heading,
              heading: v.heading,
              navStatus: v.status === 'operational' ? 'Under way using engine' : 'Moored',
              shipType: v.type,
              destination: v.destination,
              lastUpdate: new Date().toISOString(),
              status: v.status,
              vessel_type: v.type,
              current_location: v.destination,
            }))}
            onSelectVessel={(vessel) => {
              const found = fleetVessels.find(fv => fv.id === vessel.id || fv.name === vessel.name);
              if (found) setSelectedVessel(found);
            }}
            selectedVessel={selectedVessel ? { id: selectedVessel.id, name: selectedVessel.name } : null}
            height="600px"
            showList={true}
          />
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Insights Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="h-5 w-5 text-warning" />
                      <span className="font-medium">Otimização de Combustível</span>
                    </div>
                    <p className="text-sm">
                      MV Pacific Star: Reduzir velocidade de 15.2 para 13.5 kn economizaria 
                      $12,500 em combustível mantendo o ETA.
                    </p>
                    <Button size="sm" className="mt-3">Aplicar Recomendação</Button>
                  </div>

                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">Manutenção Preditiva</span>
                    </div>
                    <p className="text-sm">
                      MV Ocean Voyager: Motor principal apresenta padrão anômalo. 
                      Manutenção recomendada em 72h para evitar falha.
                    </p>
                    <Button size="sm" variant="destructive" className="mt-3">Agendar Manutenção</Button>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <span className="font-medium">Performance Otimizada</span>
                    </div>
                    <p className="text-sm">
                      MV Atlantic Pioneer: Operando 8% acima da média de eficiência. 
                      Economia de $45,000 este trimestre.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Alertas e Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { priority: 'high', title: 'Renovar certificados vencidos', desc: '2 certificados expirados na frota', action: 'Renovar' },
                    { priority: 'high', title: 'Inspeção PSC iminente', desc: 'MV Pacific Star - próxima semana', action: 'Preparar' },
                    { priority: 'medium', title: 'Reabastecimento necessário', desc: 'MV Ocean Voyager com 45% combustível', action: 'Planejar' },
                    { priority: 'low', title: 'Otimizar rotas Q3', desc: 'Economia potencial de 15% em combustível', action: 'Analisar' }
                  ].map((alert) => (
                    <div key={alert.title} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.priority === 'high' ? 'bg-destructive' : 
                          alert.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.desc}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">{alert.action}</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FleetCommandCenter;
