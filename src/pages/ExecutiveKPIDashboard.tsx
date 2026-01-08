/**
 * Executive Dashboard - Consolidated KPIs
 * Real-time operational metrics, crew wellness, and IoT monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Heart,
  Thermometer,
  Navigation,
  RefreshCw,
  Shield,
  Clock,
  MapPin,
  Gauge,
  Anchor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface CrewWellnessData {
  name: string;
  wellness: number;
  burnout: number;
  status: 'healthy' | 'at-risk' | 'critical';
}

interface SensorSummary {
  total: number;
  anomalies: number;
  critical: number;
  online: number;
}

interface VesselStatus {
  id: string;
  name: string;
  status: 'at-sea' | 'in-port' | 'maintenance';
  location: string;
  nextPort: string;
  eta: string;
  fuelLevel: number;
}

const WELLNESS_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function ExecutiveKPIDashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [crewWellness, setCrewWellness] = useState<CrewWellnessData[]>([]);
  const [sensorSummary, setSensorSummary] = useState<SensorSummary | null>(null);
  const [vessels, setVessels] = useState<VesselStatus[]>([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState<number>(0);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: sensors } = await supabase
        .from('equipment_sensors')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      const anomalySensors = sensors?.filter(s => s.is_anomaly) || [];
      const criticalSensors = anomalySensors.filter(s => s.sensor_status === 'critical');
      const onlineSensors = sensors?.filter(s => s.sensor_status === 'online') || [];

      setSensorSummary({
        total: sensors?.length || 0,
        anomalies: anomalySensors.length,
        critical: criticalSensors.length,
        online: onlineSensors.length,
      });

      const { data: checkins } = await supabase
        .from('crew_health_checkins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const crewMap = new Map<string, CrewWellnessData>();
      checkins?.forEach(c => {
        const name = c.crew_member_name || 'Unknown';
        if (!crewMap.has(name)) {
          const mood = c.mood ?? 3;
          const sleep = c.sleep_quality ?? 3;
          const energy = c.energy_level ?? 3;
          const physical = c.physical_health ?? 3;
          const social = c.social_interaction ?? 3;
          const stress = c.stress_level ?? 3;
          const wellness = ((mood + sleep + energy + physical + social) / 5) * 20;
          const burnout = (stress / 5) * 100;
          crewMap.set(name, {
            name,
            wellness: Math.round(wellness),
            burnout: Math.round(burnout),
            status: wellness < 40 ? 'critical' : wellness < 60 ? 'at-risk' : 'healthy'
          });
        }
      });
      setCrewWellness(Array.from(crewMap.values()));

      const { data: vesselsData } = await supabase
        .from('vessels')
        .select('*')
        .limit(10);

      const vesselStatuses: VesselStatus[] = (vesselsData || []).map(v => ({
        id: v.id,
        name: v.name,
        status: Math.random() > 0.7 ? 'in-port' : 'at-sea',
        location: 'Atlantic Ocean',
        nextPort: 'Rotterdam',
        eta: '3d 12h',
        fuelLevel: Math.floor(Math.random() * 40) + 60,
      }));
      setVessels(vesselStatuses);

      const healthyCrew = Array.from(crewMap.values()).filter(c => c.status === 'healthy').length;
      const totalCrew = crewMap.size;
      const avgWellness = Array.from(crewMap.values()).reduce((sum, c) => sum + c.wellness, 0) / (totalCrew || 1);

      setKpis([
        { label: 'Embarcações', value: vesselsData?.length || 0, trend: 'stable', icon: Ship, color: 'text-blue-500' },
        { label: 'Tripulação', value: totalCrew, change: Math.round(healthyCrew / (totalCrew || 1) * 100), trend: 'up', icon: Users, color: 'text-emerald-500' },
        { label: 'Alertas', value: criticalSensors.length + anomalySensors.length, trend: 'down', icon: AlertTriangle, color: criticalSensors.length > 0 ? 'text-destructive' : 'text-amber-500' },
        { label: 'Wellness', value: `${Math.round(avgWellness)}%`, trend: avgWellness >= 60 ? 'up' : 'down', icon: Heart, color: avgWellness >= 60 ? 'text-emerald-500' : 'text-amber-500' },
        { label: 'Sensores', value: `${onlineSensors.length}/${sensors?.length || 0}`, trend: 'stable', icon: Activity, color: 'text-blue-500' },
        { label: 'Compliance', value: '94%', change: 2, trend: 'up', icon: Shield, color: 'text-emerald-500' },
      ]);

      setRealtimeAlerts(criticalSensors.length);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ title: 'Erro', description: 'Falha ao carregar dados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('executive-kpi-dashboard')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'equipment_sensors',
        filter: 'is_anomaly=eq.true'
      }, (payload) => {
        setRealtimeAlerts(prev => prev + 1);
        toast({
          title: '⚠️ Nova Anomalia',
          description: `${payload.new.equipment_name}: ${payload.new.sensor_type}`,
          variant: 'destructive',
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const wellnessDistribution = [
    { name: 'Saudável', value: crewWellness.filter(c => c.status === 'healthy').length },
    { name: 'Em Risco', value: crewWellness.filter(c => c.status === 'at-risk').length },
    { name: 'Crítico', value: crewWellness.filter(c => c.status === 'critical').length },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gauge className="h-8 w-8 text-primary" />
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground mt-1">KPIs operacionais consolidados</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" /> {lastUpdate.toLocaleTimeString()}
          </span>
          <Button onClick={fetchDashboardData} disabled={loading} size="sm">
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          {realtimeAlerts > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" /> {realtimeAlerts}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              </div>
              {kpi.trend && (
                <div className={cn("flex items-center gap-1 text-xs mt-2",
                  kpi.trend === 'up' ? "text-emerald-500" : kpi.trend === 'down' ? "text-destructive" : "text-muted-foreground"
                )}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : kpi.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-rose-500" /> Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wellnessDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {wellnessDistribution.map((_, index) => (
                      <Cell key={index} fill={WELLNESS_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {crewWellness.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <Badge variant={c.status === 'healthy' ? 'default' : c.status === 'at-risk' ? 'secondary' : 'destructive'}>{c.wellness}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="h-4 w-4 text-amber-500" /> Sensores IoT
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sensorSummary && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{sensorSummary.online}</p>
                  <p className="text-xs">Online</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{sensorSummary.anomalies}</p>
                  <p className="text-xs">Anomalias</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-destructive">{sensorSummary.critical}</p>
                  <p className="text-xs">Críticos</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{sensorSummary.total}</p>
                  <p className="text-xs">Total</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ship className="h-4 w-4 text-blue-500" /> Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vessels.slice(0, 3).map((v, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{v.name}</span>
                    <Badge variant={v.status === 'at-sea' ? 'default' : 'secondary'} className="text-xs">
                      {v.status === 'at-sea' ? 'Navegando' : 'Porto'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.nextPort}</span>
                    <span>ETA: {v.eta}</span>
                  </div>
                  <Progress value={v.fuelLevel} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4" /> Acesso Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { href: '/telemetria', icon: Thermometer, label: 'IoT Telemetria', color: 'text-amber-500' },
              { href: '/crew-wellness', icon: Heart, label: 'Crew Wellness', color: 'text-rose-500' },
              { href: '/route-optimizer', icon: Navigation, label: 'Route Optimizer', color: 'text-blue-500' },
              { href: '/tracking', icon: Ship, label: 'Vessel Tracking', color: 'text-emerald-500' },
              { href: '/compliance-hub', icon: Shield, label: 'Compliance', color: 'text-purple-500' },
              { href: '/reports-command', icon: Activity, label: 'Relatórios', color: 'text-cyan-500' },
            ].map((item, i) => (
              <Button key={i} variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <a href={item.href}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                  <span className="text-xs">{item.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
