/**
 * Noon Report Manager v2 - World-class voyage reporting
 * Benchmarks: BASSnet, DNV ShipManager, Veson IMOS
 * Full CRUD + Performance Analytics + Weather Impact + Fuel Efficiency
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Navigation, Fuel, Wind, Thermometer, Anchor, Send, Plus, Eye,
  CheckCircle, Clock, Ship, Compass, Waves, TrendingUp, AlertTriangle,
  BarChart3, Download, Filter
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

const VESSEL_STATUSES = ['at-sea', 'anchored', 'in-port', 'maneuvering', 'drifting'];
const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function NoonReportManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [mainTab, setMainTab] = useState('reports');
  const [vesselFilter, setVesselFilter] = useState('all');
  const queryClient = useQueryClient();

  const defaultForm = {
    vessel_id: '', report_date: new Date().toISOString().split('T')[0], report_time: '12:00',
    latitude: '', longitude: '', course: '', speed_avg: '', speed_ordered: '',
    distance_run: '', distance_to_go: '',
    rob_hfo: '', rob_mdo: '', rob_mgo: '',
    consumption_hfo: '', consumption_mdo: '', consumption_mgo: '',
    me_rpm: '', me_power: '', me_load_percent: '',
    wind_direction: 'N', wind_force: '', sea_state: '', swell_height: '',
    air_temp: '', sea_temp: '', draft_fwd: '', draft_aft: '',
    vessel_status: 'at-sea', remarks: '',
  };
  const [form, setForm] = useState(defaultForm);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: vessels = [] } = useQuery({
    queryKey: ['noon-vessels'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['noon-reports'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('noon_reports')
        .select('*, vessels:vessel_id(name)')
        .order('report_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const payload: Record<string, any> = {
        vessel_id: f.vessel_id || null,
        report_date: f.report_date,
        report_time: f.report_time,
        vessel_status: f.vessel_status,
        wind_direction: f.wind_direction,
        remarks: f.remarks || null,
        status: 'submitted',
      };
      const nums: Record<string, string> = {
        latitude: f.latitude, longitude: f.longitude, course: f.course,
        speed_avg: f.speed_avg, speed_ordered: f.speed_ordered,
        distance_run: f.distance_run, distance_to_go: f.distance_to_go,
        rob_hfo: f.rob_hfo, rob_mdo: f.rob_mdo, rob_mgo: f.rob_mgo,
        consumption_hfo: f.consumption_hfo, consumption_mdo: f.consumption_mdo, consumption_mgo: f.consumption_mgo,
        me_rpm: f.me_rpm, me_power: f.me_power, me_load_percent: f.me_load_percent,
        wind_force: f.wind_force, sea_state: f.sea_state, swell_height: f.swell_height,
        air_temp: f.air_temp, sea_temp: f.sea_temp, draft_fwd: f.draft_fwd, draft_aft: f.draft_aft,
      };
      Object.entries(nums).forEach(([k, v]) => { if (v) payload[k] = Number(v); });
      if (payload.draft_fwd && payload.draft_aft) payload.trim = (payload.draft_aft - payload.draft_fwd).toFixed(2);

      const { error } = await (supabase.from as Function)('noon_reports').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noon-reports'] });
      toast.success('Noon Report enviado!');
      setCreateOpen(false);
      setForm(defaultForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Analytics ──
  const filteredReports = useMemo(() => {
    if (vesselFilter === 'all') return reports;
    return reports.filter((r: any) => r.vessel_id === vesselFilter);
  }, [reports, vesselFilter]);

  const analytics = useMemo(() => {
    const reps = filteredReports as any[];
    if (reps.length === 0) return null;

    const totalDistance = reps.reduce((s, r) => s + (r.distance_run || 0), 0);
    const totalFuelHFO = reps.reduce((s, r) => s + (r.consumption_hfo || 0), 0);
    const totalFuelMDO = reps.reduce((s, r) => s + (r.consumption_mdo || 0), 0);
    const totalFuelMGO = reps.reduce((s, r) => s + (r.consumption_mgo || 0), 0);
    const totalFuel = totalFuelHFO + totalFuelMDO + totalFuelMGO;
    const avgSpeed = reps.reduce((s, r) => s + (r.speed_avg || 0), 0) / reps.length;
    const fuelEfficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;

    // Speed vs Consumption scatter data
    const speedConsumption = reps
      .filter(r => r.speed_avg && (r.consumption_hfo || r.consumption_mdo))
      .map(r => ({
        speed: r.speed_avg,
        consumption: (r.consumption_hfo || 0) + (r.consumption_mdo || 0) + (r.consumption_mgo || 0),
        vessel: r.vessels?.name || 'N/A',
      }));

    // Daily fuel trend (last 30 reports)
    const fuelTrend = [...reps].reverse().slice(-30).map(r => ({
      date: r.report_date?.substring(5) || '',
      hfo: r.consumption_hfo || 0,
      mdo: r.consumption_mdo || 0,
      mgo: r.consumption_mgo || 0,
      total: (r.consumption_hfo || 0) + (r.consumption_mdo || 0) + (r.consumption_mgo || 0),
    }));

    // Weather impact
    const weatherImpact = reps
      .filter(r => r.wind_force != null && r.speed_avg)
      .reduce<Record<number, { speeds: number[]; fuel: number[] }>>((acc, r) => {
        const bf = Math.round(r.wind_force);
        if (!acc[bf]) acc[bf] = { speeds: [], fuel: [] };
        acc[bf].speeds.push(r.speed_avg);
        acc[bf].fuel.push((r.consumption_hfo || 0) + (r.consumption_mdo || 0));
        return acc;
      }, {});

    const weatherData = Object.entries(weatherImpact)
      .map(([bf, d]) => ({
        beaufort: `BF ${bf}`,
        avgSpeed: +(d.speeds.reduce((a, b) => a + b, 0) / d.speeds.length).toFixed(1),
        avgFuel: +(d.fuel.reduce((a, b) => a + b, 0) / d.fuel.length).toFixed(1),
      }))
      .sort((a, b) => parseInt(a.beaufort.slice(3)) - parseInt(b.beaufort.slice(3)));

    // ROB trend
    const robTrend = [...reps].reverse().slice(-30)
      .filter(r => r.rob_hfo || r.rob_mdo || r.rob_mgo)
      .map(r => ({
        date: r.report_date?.substring(5) || '',
        hfo: r.rob_hfo || 0,
        mdo: r.rob_mdo || 0,
        mgo: r.rob_mgo || 0,
        total: (r.rob_hfo || 0) + (r.rob_mdo || 0) + (r.rob_mgo || 0),
      }));

    // CO2 estimate (IMO factor: HFO=3.114, MDO=3.206, MGO=3.206 tCO2/tFuel)
    const co2 = totalFuelHFO * 3.114 + totalFuelMDO * 3.206 + totalFuelMGO * 3.206;

    return {
      totalReports: reps.length,
      totalDistance: Math.round(totalDistance),
      totalFuel: +totalFuel.toFixed(1),
      avgSpeed: +avgSpeed.toFixed(1),
      fuelEfficiency: +fuelEfficiency.toFixed(3),
      co2: +co2.toFixed(1),
      speedConsumption,
      fuelTrend,
      weatherData,
      robTrend,
      submitted: reps.filter(r => r.status === 'submitted').length,
      approved: reps.filter(r => r.status === 'approved').length,
    };
  }, [filteredReports]);

  const exportCSV = () => {
    const headers = ['Date', 'Vessel', 'Lat', 'Lon', 'Speed(kn)', 'Distance(nm)', 'HFO(t)', 'MDO(t)', 'MGO(t)', 'ROB_HFO', 'ROB_MDO', 'Wind', 'Sea_State', 'Status'];
    const rows = filteredReports.map((r: any) => [
      r.report_date, r.vessels?.name, r.latitude, r.longitude, r.speed_avg, r.distance_run,
      r.consumption_hfo, r.consumption_mdo, r.consumption_mgo, r.rob_hfo, r.rob_mdo,
      `${r.wind_direction} F${r.wind_force}`, r.sea_state, r.status,
    ].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'noon-reports.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { draft: 'secondary', submitted: 'default', approved: 'default', rejected: 'destructive' };
    return <Badge variant={(map[s] || 'secondary') as any}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Noon Report System
          </h2>
          <p className="text-muted-foreground">Relatórios diários — Padrão BASSnet/DNV ShipManager</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Report</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Ship, label: 'Reports', value: analytics?.totalReports || 0, color: 'text-primary' },
          { icon: Navigation, label: 'Distância (nm)', value: analytics?.totalDistance || 0, color: 'text-info' },
          { icon: TrendingUp, label: 'Vel. Média (kn)', value: analytics?.avgSpeed || 0, color: 'text-success' },
          { icon: Fuel, label: 'Consumo (t)', value: analytics?.totalFuel || 0, color: 'text-warning' },
          { icon: BarChart3, label: 'Eficiência (t/nm)', value: analytics?.fuelEfficiency || 0, color: 'text-accent-foreground' },
          { icon: Waves, label: 'CO₂ Est. (t)', value: analytics?.co2 || 0, color: 'text-destructive' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <div className="flex items-center gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="fuel">Combustível & ROB</TabsTrigger>
            <TabsTrigger value="weather">Impacto Meteorológico</TabsTrigger>
          </TabsList>
          <Select value={vesselFilter} onValueChange={setVesselFilter}>
            <SelectTrigger className="w-[180px] h-8"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Embarcação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Embarcações</SelectItem>
              {vessels.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle className="text-sm">Relatórios Recentes ({filteredReports.length})</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : filteredReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum noon report registrado</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredReports.map((r: any) => (
                    <div key={r.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedReport(r)}>
                      <div className="flex items-center gap-3">
                        <Compass className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{r.vessels?.name || 'N/A'} — {r.report_date}</div>
                          <div className="text-sm text-muted-foreground">
                            {r.latitude && r.longitude ? `${Number(r.latitude).toFixed(3)}°, ${Number(r.longitude).toFixed(3)}°` : 'Posição N/A'}
                            {r.speed_avg ? ` · ${r.speed_avg} kn` : ''}
                            {r.distance_run ? ` · ${r.distance_run} nm` : ''}
                            {r.consumption_hfo ? ` · HFO: ${r.consumption_hfo}t` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.wind_force && r.wind_force >= 6 && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning">BF {r.wind_force}</Badge>}
                        <Badge variant="outline">{r.vessel_status}</Badge>
                        {statusBadge(r.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="performance">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Velocidade vs Consumo</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.speedConsumption?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="speed" name="Velocidade (kn)" className="text-xs" />
                      <YAxis dataKey="consumption" name="Consumo (t)" className="text-xs" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={analytics.speedConsumption} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Dados insuficientes</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Eficiência por Report (t/nm)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.fuelTrend?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.fuelTrend.map(d => ({
                      ...d,
                      efficiency: d.total > 0 ? +(d.total / Math.max(1, d.total * 10)).toFixed(3) : 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" name="Consumo Total (t)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Dados insuficientes</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fuel & ROB */}
        <TabsContent value="fuel">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Consumo Diário por Tipo</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.fuelTrend?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.fuelTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="hfo" stackId="a" fill="hsl(var(--primary))" name="HFO" />
                      <Bar dataKey="mdo" stackId="a" fill="hsl(var(--warning))" name="MDO" />
                      <Bar dataKey="mgo" stackId="a" fill="hsl(var(--success))" name="MGO" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">ROB (Remaining On Board)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.robTrend?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.robTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="hfo" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" name="HFO" />
                      <Area type="monotone" dataKey="mdo" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning)/0.3)" name="MDO" />
                      <Area type="monotone" dataKey="mgo" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success)/0.3)" name="MGO" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados de ROB</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Impact */}
        <TabsContent value="weather">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Velocidade por Escala Beaufort</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.weatherData?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weatherData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="beaufort" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="avgSpeed" fill="hsl(var(--primary))" name="Vel. Média (kn)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados meteorológicos</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Consumo por Escala Beaufort</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics?.weatherData?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weatherData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="beaufort" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="avgFuel" fill="hsl(var(--warning))" name="Consumo Médio (t)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            {analytics?.weatherData && analytics.weatherData.length > 2 && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />Análise de Impacto Meteorológico
                </CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {analytics.weatherData.map(w => {
                      const bf = parseInt(w.beaufort.slice(3));
                      const severity = bf >= 7 ? 'destructive' : bf >= 5 ? 'secondary' : 'default';
                      return (
                        <div key={w.beaufort} className="p-3 border rounded-lg text-center">
                          <Badge variant={severity as any} className="mb-2">{w.beaufort}</Badge>
                          <div className="text-sm"><span className="text-muted-foreground">Vel:</span> {w.avgSpeed} kn</div>
                          <div className="text-sm"><span className="text-muted-foreground">Fuel:</span> {w.avgFuel} t/dia</div>
                          {bf >= 6 && <div className="text-[10px] text-warning mt-1">⚠ Heavy Weather</div>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Noon Report</DialogTitle></DialogHeader>
          <Tabs defaultValue="position">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="position">Posição</TabsTrigger>
              <TabsTrigger value="fuel">Combustível</TabsTrigger>
              <TabsTrigger value="engine">Motor</TabsTrigger>
              <TabsTrigger value="weather">Meteorologia</TabsTrigger>
            </TabsList>

            <TabsContent value="position" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Embarcação</Label>
                  <Select value={form.vessel_id} onValueChange={v => set('vessel_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {vessels.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Data</Label><Input type="date" value={form.report_date} onChange={e => set('report_date', e.target.value)} /></div>
                <div><Label>Latitude</Label><Input type="number" step="0.001" placeholder="-23.550" value={form.latitude} onChange={e => set('latitude', e.target.value)} /></div>
                <div><Label>Longitude</Label><Input type="number" step="0.001" placeholder="-46.633" value={form.longitude} onChange={e => set('longitude', e.target.value)} /></div>
                <div><Label>Rumo (°)</Label><Input type="number" placeholder="180" value={form.course} onChange={e => set('course', e.target.value)} /></div>
                <div><Label>Velocidade Média (kn)</Label><Input type="number" step="0.1" value={form.speed_avg} onChange={e => set('speed_avg', e.target.value)} /></div>
                <div><Label>Distância Percorrida (nm)</Label><Input type="number" step="0.1" value={form.distance_run} onChange={e => set('distance_run', e.target.value)} /></div>
                <div><Label>Distância Restante (nm)</Label><Input type="number" step="0.1" value={form.distance_to_go} onChange={e => set('distance_to_go', e.target.value)} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.vessel_status} onValueChange={v => set('vessel_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VESSEL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="fuel" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground mb-2">ROB (Remaining On Board) em toneladas</p>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>ROB HFO (t)</Label><Input type="number" step="0.1" value={form.rob_hfo} onChange={e => set('rob_hfo', e.target.value)} /></div>
                <div><Label>ROB MDO (t)</Label><Input type="number" step="0.1" value={form.rob_mdo} onChange={e => set('rob_mdo', e.target.value)} /></div>
                <div><Label>ROB MGO (t)</Label><Input type="number" step="0.1" value={form.rob_mgo} onChange={e => set('rob_mgo', e.target.value)} /></div>
                <div><Label>Consumo HFO (t)</Label><Input type="number" step="0.1" value={form.consumption_hfo} onChange={e => set('consumption_hfo', e.target.value)} /></div>
                <div><Label>Consumo MDO (t)</Label><Input type="number" step="0.1" value={form.consumption_mdo} onChange={e => set('consumption_mdo', e.target.value)} /></div>
                <div><Label>Consumo MGO (t)</Label><Input type="number" step="0.1" value={form.consumption_mgo} onChange={e => set('consumption_mgo', e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="engine" className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>M/E RPM</Label><Input type="number" step="0.1" value={form.me_rpm} onChange={e => set('me_rpm', e.target.value)} /></div>
                <div><Label>M/E Potência (kW)</Label><Input type="number" value={form.me_power} onChange={e => set('me_power', e.target.value)} /></div>
                <div><Label>M/E Carga (%)</Label><Input type="number" step="0.1" value={form.me_load_percent} onChange={e => set('me_load_percent', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Calado Proa (m)</Label><Input type="number" step="0.01" value={form.draft_fwd} onChange={e => set('draft_fwd', e.target.value)} /></div>
                <div><Label>Calado Popa (m)</Label><Input type="number" step="0.01" value={form.draft_aft} onChange={e => set('draft_aft', e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Direção do Vento</Label>
                  <Select value={form.wind_direction} onValueChange={v => set('wind_direction', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{WIND_DIRS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Força do Vento (Beaufort)</Label><Input type="number" min="0" max="12" value={form.wind_force} onChange={e => set('wind_force', e.target.value)} /></div>
                <div><Label>Estado do Mar (Douglas)</Label><Input type="number" min="0" max="9" value={form.sea_state} onChange={e => set('sea_state', e.target.value)} /></div>
                <div><Label>Ondulação (m)</Label><Input type="number" step="0.1" value={form.swell_height} onChange={e => set('swell_height', e.target.value)} /></div>
                <div><Label>Temp. Ar (°C)</Label><Input type="number" step="0.1" value={form.air_temp} onChange={e => set('air_temp', e.target.value)} /></div>
                <div><Label>Temp. Mar (°C)</Label><Input type="number" step="0.1" value={form.sea_temp} onChange={e => set('sea_temp', e.target.value)} /></div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea placeholder="Condições gerais, eventos relevantes..." value={form.remarks} onChange={e => set('remarks', e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.vessel_id}>
            <Send className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Enviando...' : 'Submeter Noon Report'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalhes — {selectedReport?.vessels?.name} ({selectedReport?.report_date})</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Posição:</span> {selectedReport.latitude}°, {selectedReport.longitude}°</div>
              <div><span className="text-muted-foreground">Rumo:</span> {selectedReport.course}°</div>
              <div><span className="text-muted-foreground">Velocidade:</span> {selectedReport.speed_avg} kn</div>
              <div><span className="text-muted-foreground">Distância:</span> {selectedReport.distance_run} nm</div>
              <div><span className="text-muted-foreground">ROB HFO:</span> {selectedReport.rob_hfo}t</div>
              <div><span className="text-muted-foreground">ROB MDO:</span> {selectedReport.rob_mdo}t</div>
              <div><span className="text-muted-foreground">Consumo HFO:</span> {selectedReport.consumption_hfo}t</div>
              <div><span className="text-muted-foreground">Consumo MDO:</span> {selectedReport.consumption_mdo}t</div>
              <div><span className="text-muted-foreground">M/E RPM:</span> {selectedReport.me_rpm}</div>
              <div><span className="text-muted-foreground">M/E Carga:</span> {selectedReport.me_load_percent}%</div>
              <div><span className="text-muted-foreground">Vento:</span> {selectedReport.wind_direction} F{selectedReport.wind_force}</div>
              <div><span className="text-muted-foreground">Mar:</span> Douglas {selectedReport.sea_state}</div>
              <div><span className="text-muted-foreground">Calado:</span> F:{selectedReport.draft_fwd}m A:{selectedReport.draft_aft}m</div>
              <div><span className="text-muted-foreground">Status:</span> {selectedReport.vessel_status}</div>
              {selectedReport.remarks && <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> {selectedReport.remarks}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
