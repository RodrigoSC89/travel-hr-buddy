/**
 * Sensor-to-Logbook Auto-fill Manager — Wave 5 DMS Enhancement
 * Configure IoT sensor mappings for automatic logbook entry population
 * BEATS: Anschütz eLog (automated data collection)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Cpu, Plus, Zap, Book, Activity } from 'lucide-react';

const SENSOR_TYPES = ['temperature', 'pressure', 'flow_rate', 'rpm', 'power', 'level'];
const LOGBOOK_TYPES = ['engine_log', 'deck_log', 'orb', 'grb'];

export function SensorLogbookManager() {
  const [addOpen, setAddOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: mappings = [] } = useQuery({
    queryKey: ['sensor-logbook-mappings'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('sensor_logbook_mappings')
        .select('*')
        .order('logbook_type');
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await (supabase.from as Function)('sensor_logbook_mappings').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensor-logbook-mappings'] });
      toast.success('Mapeamento criado');
      setAddOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await (supabase.from as Function)('sensor_logbook_mappings')
        .update({ auto_fill_enabled: enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensor-logbook-mappings'] }),
  });

  const activeCount = mappings.filter((m: Record<string, unknown>) => m.auto_fill_enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Sensor → Logbook Auto-fill
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeCount}/{mappings.length} mapeamentos ativos
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Novo Mapeamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mapear Sensor → Logbook</DialogTitle></DialogHeader>
            <CreateMappingForm onSubmit={(f) => createMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {LOGBOOK_TYPES.map(lt => {
          const ltMappings = mappings.filter((m: Record<string, unknown>) => m.logbook_type === lt);
          if (ltMappings.length === 0) return null;
          return (
            <Card key={lt}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  {lt.replace('_', ' ').toUpperCase()}
                  <Badge variant="outline">{ltMappings.length} sensores</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ltMappings.map((m: Record<string, unknown>) => (
                  <div key={m.id as string} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{m.sensor_type as string} → {m.logbook_field as string}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.last_reading !== null ? `Última: ${m.last_reading}` : 'Sem leitura'}
                          {m.threshold_min !== null && ` | Min: ${m.threshold_min}`}
                          {m.threshold_max !== null && ` | Max: ${m.threshold_max}`}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={m.auto_fill_enabled as boolean}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: m.id as string, enabled: v })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {mappings.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum mapeamento sensor → logbook configurado</CardContent></Card>
        )}
      </div>
    </div>
  );
}

function CreateMappingForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    sensor_type: 'temperature', logbook_type: 'engine_log', logbook_field: '',
    threshold_min: '', threshold_max: '', conversion_formula: '',
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo Sensor</Label>
          <Select value={form.sensor_type} onValueChange={v => setForm(f => ({ ...f, sensor_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SENSOR_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Logbook</Label>
          <Select value={form.logbook_type} onValueChange={v => setForm(f => ({ ...f, logbook_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LOGBOOK_TYPES.map(l => <SelectItem key={l} value={l}>{l.replace('_', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Campo do Logbook</Label><Input value={form.logbook_field} onChange={e => setForm(f => ({ ...f, logbook_field: e.target.value }))} placeholder="Ex: exhaust_temp_cyl_1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Threshold Min</Label><Input type="number" value={form.threshold_min} onChange={e => setForm(f => ({ ...f, threshold_min: e.target.value }))} /></div>
        <div><Label>Threshold Max</Label><Input type="number" value={form.threshold_max} onChange={e => setForm(f => ({ ...f, threshold_max: e.target.value }))} /></div>
      </div>
      <div><Label>Fórmula Conversão (opcional)</Label><Input value={form.conversion_formula} onChange={e => setForm(f => ({ ...f, conversion_formula: e.target.value }))} placeholder="Ex: value * 1.8 + 32" /></div>
      <Button className="w-full" onClick={() => onSubmit({
        sensor_type: form.sensor_type,
        logbook_type: form.logbook_type,
        logbook_field: form.logbook_field,
        threshold_min: form.threshold_min ? Number(form.threshold_min) : null,
        threshold_max: form.threshold_max ? Number(form.threshold_max) : null,
        conversion_formula: form.conversion_formula || null,
        auto_fill_enabled: true,
        vessel_id: null, // Will be set by context
      })}>Criar Mapeamento</Button>
    </div>
  );
}
