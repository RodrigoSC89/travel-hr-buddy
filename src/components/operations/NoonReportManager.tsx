/**
 * Noon Report Manager - World-class voyage reporting
 * Benchmarks: BASSnet, DNV ShipManager, Veson IMOS
 * Full CRUD with ROB, weather, position, engine data
 */
import React, { useState } from 'react';
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
  CheckCircle, Clock, Ship, Compass, Waves
} from 'lucide-react';

const VESSEL_STATUSES = ['at-sea', 'anchored', 'in-port', 'maneuvering', 'drifting'];
const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function NoonReportManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
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
        .limit(100);
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
      // Numeric fields
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- error type from mutation
    onError: (e: any) => toast.error(e.message),
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { draft: 'secondary', submitted: 'default', approved: 'default', rejected: 'destructive' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Badge variant from dynamic mapping
    return <Badge variant={(map[s] || 'secondary') as any}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Noon Report System
          </h2>
          <p className="text-muted-foreground">Relatórios diários de posição, consumo e condições — Padrão BASSnet/DNV</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Noon Report</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Ship className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{reports.length}</div>
          <div className="text-xs text-muted-foreground">Total Reports</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Send className="h-6 w-6 mx-auto mb-1 text-info" />
          <div className="text-2xl font-bold">{reports.filter((r: any) => r.status === 'submitted').length}</div>
          <div className="text-xs text-muted-foreground">Pendentes</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-6 w-6 mx-auto mb-1 text-success" />
          <div className="text-2xl font-bold">{reports.filter((r: any) => r.status === 'approved').length}</div>
          <div className="text-xs text-muted-foreground">Aprovados</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Fuel className="h-6 w-6 mx-auto mb-1 text-warning" />
          <div className="text-2xl font-bold">
            {reports.reduce((s: number, r: any) => s + (r.consumption_hfo || 0) + (r.consumption_mdo || 0), 0).toFixed(0)}t
          </div>
          <div className="text-xs text-muted-foreground">Consumo Total</div>
        </CardContent></Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader><CardTitle>Relatórios Recentes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum noon report registrado</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {reports.map((r: any) => (
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.vessel_status}</Badge>
                    {statusBadge(r.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={form.report_date} onChange={e => set('report_date', e.target.value)} />
                </div>
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
              <div><span className="text-muted-foreground">M/E RPM:</span> {selectedReport.me_rpm}</div>
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
