/**
 * Running Hours Tracker v3 - Equipment Runtime Monitor
 * v3: Utilization Analytics, Equipment Health Radar, Service Compliance, Trend Charts, CSV Export
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateSensorReading } from '@/hooks/useModuleHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Clock, Gauge, AlertTriangle, CheckCircle, TrendingUp,
  Wrench, BarChart3, RefreshCw, Activity, Download, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface EquipmentCounter {
  id: string;
  equipment_name: string;
  equipment_type: string;
  current_hours: number;
  last_service_hours: number;
  service_interval: number;
  next_service_due: number;
  hours_remaining: number;
  pct_used: number;
  status: 'ok' | 'warning' | 'overdue';
  vessel_name: string;
  last_updated: string;
}

const CHART_COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(210,70%,55%)'];

export function RunningHoursTracker() {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [newReading, setNewReading] = useState('');
  const [mainTab, setMainTab] = useState('equipment');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: counters = [], isLoading } = useQuery({
    queryKey: ['running-hours'],
    queryFn: async () => {
      const { data } = await supabase
        .from('iot_sensors')
        .select('*, vessels:vessel_id(name)')
        .eq('sensor_type', 'running_hours')
        .order('sensor_name');

      return (data || []).map((sensor: Record<string, unknown>) => {
        const currentHours = (sensor.current_value as number) || 0;
        const config = (sensor.calibration_data as Record<string, unknown>) || {};
        const lastServiceHours = (config.last_service_hours as number) || 0;
        const serviceInterval = (config.service_interval as number) || 4000;
        const nextServiceDue = lastServiceHours + serviceInterval;
        const hoursRemaining = nextServiceDue - currentHours;
        const pctUsed = Math.min(((currentHours - lastServiceHours) / serviceInterval) * 100, 100);

        return {
          id: sensor.id as string,
          equipment_name: sensor.sensor_name as string,
          equipment_type: (sensor.unit as string) || 'Motor',
          current_hours: currentHours,
          last_service_hours: lastServiceHours,
          service_interval: serviceInterval,
          next_service_due: nextServiceDue,
          hours_remaining: hoursRemaining,
          pct_used: pctUsed,
          status: hoursRemaining <= 0 ? 'overdue' : hoursRemaining <= serviceInterval * 0.1 ? 'warning' : 'ok',
          vessel_name: ((sensor.vessels as Record<string, unknown>)?.name as string) || 'N/A',
          last_updated: (sensor.last_reading_at as string) || (sensor.updated_at as string) || '',
        } as EquipmentCounter;
      });
    },
  });

  const updateReadingMutation = useUpdateSensorReading();
  const updateReading = {
    mutate: () => updateReadingMutation.mutate(
      { sensorId: selectedId, value: parseFloat(newReading) },
      { onSuccess: () => setUpdateOpen(false) }
    ),
    isPending: updateReadingMutation.isPending,
  };

  // === V3 ANALYTICS ===
  const analytics = useMemo(() => {
    const overdueCount = counters.filter(c => c.status === 'overdue').length;
    const warningCount = counters.filter(c => c.status === 'warning').length;
    const okCount = counters.filter(c => c.status === 'ok').length;
    const total = counters.length;
    const avgUtilization = total > 0 ? counters.reduce((s, c) => s + c.pct_used, 0) / total : 0;
    const totalHours = counters.reduce((s, c) => s + c.current_hours, 0);
    const complianceRate = total > 0 ? Math.round((okCount / total) * 100) : 100;

    // Status distribution
    const statusDist = [
      { name: 'OK', value: okCount },
      { name: 'Atenção', value: warningCount },
      { name: 'Vencido', value: overdueCount },
    ].filter(s => s.value > 0);

    // Equipment type distribution
    const typeMap: Record<string, { count: number; totalHours: number; overdue: number }> = {};
    counters.forEach(c => {
      if (!typeMap[c.equipment_type]) typeMap[c.equipment_type] = { count: 0, totalHours: 0, overdue: 0 };
      typeMap[c.equipment_type].count++;
      typeMap[c.equipment_type].totalHours += c.current_hours;
      if (c.status === 'overdue') typeMap[c.equipment_type].overdue++;
    });
    const typeData = Object.entries(typeMap).map(([name, d]) => ({
      name, count: d.count, avgHours: Math.round(d.totalHours / d.count), overdue: d.overdue,
    })).sort((a, b) => b.avgHours - a.avgHours);

    // Top equipment by hours
    const topEquipment = [...counters].sort((a, b) => b.current_hours - a.current_hours).slice(0, 8);

    // Health Radar
    const radarData = [
      { metric: 'Compliance', value: Math.min(100, complianceRate) },
      { metric: 'Utilização', value: Math.min(100, avgUtilization) },
      { metric: 'Cobertura', value: Math.min(100, total > 0 ? 80 : 0) },
      { metric: 'Atualização', value: Math.min(100, total > 0 ? Math.max(0, 100 - overdueCount * 15) : 0) },
      { metric: 'Diversidade', value: Math.min(100, Object.keys(typeMap).length * 20) },
    ];

    // Vessel distribution
    const vesselMap: Record<string, { count: number; overdue: number }> = {};
    counters.forEach(c => {
      if (!vesselMap[c.vessel_name]) vesselMap[c.vessel_name] = { count: 0, overdue: 0 };
      vesselMap[c.vessel_name].count++;
      if (c.status === 'overdue') vesselMap[c.vessel_name].overdue++;
    });
    const vesselData = Object.entries(vesselMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);

    return { overdueCount, warningCount, okCount, total, avgUtilization, totalHours, complianceRate, statusDist, typeData, topEquipment, radarData, vesselData };
  }, [counters]);

  const filteredCounters = useMemo(() => {
    if (!searchTerm) return counters;
    const q = searchTerm.toLowerCase();
    return counters.filter(c => c.equipment_name.toLowerCase().includes(q) || c.vessel_name.toLowerCase().includes(q) || c.equipment_type.toLowerCase().includes(q));
  }, [counters, searchTerm]);

  const statusConfig = {
    ok: { label: 'OK', color: 'bg-success/20 text-success', icon: CheckCircle },
    warning: { label: 'Atenção', color: 'bg-warning/20 text-warning', icon: AlertTriangle },
    overdue: { label: 'Vencido', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
  };

  const exportCSV = () => {
    const headers = ['Equipment', 'Type', 'Vessel', 'Current Hours', 'Last Service', 'Next Service', 'Hours Remaining', 'Status'];
    const rows = counters.map(c => [`"${c.equipment_name}"`, c.equipment_type, `"${c.vessel_name}"`, c.current_hours, c.last_service_hours, c.next_service_due, c.hours_remaining, c.status].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'running-hours.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />Running Hours Tracker <Badge variant="outline" className="text-[10px]">v3</Badge>
          </h2>
          <p className="text-muted-foreground">Equipment Health Radar · Utilization Analytics · Service Compliance</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Gauge, label: 'Equipamentos', value: analytics.total, color: 'text-primary' },
          { icon: CheckCircle, label: 'OK', value: analytics.okCount, color: 'text-success' },
          { icon: AlertTriangle, label: 'Atenção', value: analytics.warningCount, color: 'text-warning' },
          { icon: AlertTriangle, label: 'Vencidos', value: analytics.overdueCount, color: 'text-destructive' },
          { icon: Activity, label: 'Utilização', value: `${analytics.avgUtilization.toFixed(0)}%`, color: 'text-primary' },
          { icon: TrendingUp, label: 'Compliance', value: `${analytics.complianceRate}%`, color: analytics.complianceRate >= 80 ? 'text-success' : 'text-warning' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="equipment">Equipamentos ({filteredCounters.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        {/* Equipment List */}
        <TabsContent value="equipment">
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar equipamento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : filteredCounters.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Gauge className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum contador encontrado</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filteredCounters.map(counter => {
                const cfg = statusConfig[counter.status];
                return (
                  <Card key={counter.id} className={counter.status === 'overdue' ? 'border-destructive/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{counter.equipment_name}</span>
                            <Badge variant="outline">{counter.equipment_type}</Badge>
                            <Badge className={cfg.color}>{cfg.label}</Badge>
                            <span className="text-xs text-muted-foreground">{counter.vessel_name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Última: {counter.last_service_hours.toLocaleString()}h</span>
                                <span>Próxima: {counter.next_service_due.toLocaleString()}h</span>
                              </div>
                              <Progress
                                value={Math.min(counter.pct_used, 100)}
                                className={`h-2 ${counter.status === 'overdue' ? '[&>div]:bg-destructive' : counter.status === 'warning' ? '[&>div]:bg-warning' : ''}`}
                              />
                            </div>
                            <div className="text-right min-w-[100px]">
                              <p className="text-lg font-bold font-mono">{counter.current_hours.toLocaleString()}h</p>
                              <p className={`text-xs ${counter.hours_remaining <= 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                {counter.hours_remaining <= 0 ? `${Math.abs(counter.hours_remaining).toLocaleString()}h vencido` : `${counter.hours_remaining.toLocaleString()}h restantes`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-3"
                          onClick={() => { setSelectedId(counter.id); setNewReading(String(counter.current_hours)); setUpdateOpen(true); }}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* V3: Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Equipment Health Radar</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.statusDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Horas Médias por Tipo</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.typeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="hsl(var(--primary))" name="Horas Médias" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Equipamentos por Embarcação</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.vesselData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" angle={-30} textAnchor="end" height={60} />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overdue" fill="hsl(var(--destructive))" name="Vencidos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* V3: Ranking */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader><CardTitle className="text-sm">Top Equipment by Running Hours</CardTitle></CardHeader>
            <CardContent>
              {analytics.topEquipment.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Sem dados</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topEquipment.map((eq, i) => {
                    const cfg = statusConfig[eq.status];
                    return (
                      <div key={eq.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{i + 1}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{eq.equipment_name}</p>
                          <p className="text-xs text-muted-foreground">{eq.vessel_name} · {eq.equipment_type}</p>
                        </div>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                        <div className="text-right">
                          <p className="font-bold font-mono">{eq.current_hours.toLocaleString()}h</p>
                          <Progress value={eq.pct_used} className="h-1.5 w-20 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Atualizar Leitura</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nova Leitura (horas)</Label><Input type="number" value={newReading} onChange={e => setNewReading(e.target.value)} /></div>
            <Button onClick={() => updateReading.mutate()} disabled={updateReading.isPending} className="w-full">
              {updateReading.isPending ? 'Salvando...' : 'Salvar Leitura'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}