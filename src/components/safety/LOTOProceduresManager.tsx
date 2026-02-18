/**
 * LOTO Procedures Manager — Wave 5 QHSE Quick Win
 * Lock Out / Tag Out digital workflow integrated with PTW
 * BEATS: ToolKitX (LOTO + PTW integration)
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Lock, Unlock, ShieldCheck, Plus, AlertTriangle } from 'lucide-react';

const ENERGY_SOURCES = ['electrical', 'hydraulic', 'pneumatic', 'thermal', 'chemical', 'gravitational'];
const ISOLATION_METHODS = ['valve', 'breaker', 'disconnect', 'blank_flange', 'lock'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  locked: 'bg-red-500/20 text-red-400',
  verified: 'bg-blue-500/20 text-blue-400',
  released: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-muted text-muted-foreground',
};

export function LOTOProceduresManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: procedures = [], isLoading } = useQuery({
    queryKey: ['loto-procedures'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('loto_procedures')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await (supabase.from as Function)('loto_procedures').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loto-procedures'] });
      toast.success('LOTO procedure criada');
      setCreateOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, field }: { id: string; status: string; field?: Record<string, unknown> }) => {
      const { error } = await (supabase.from as Function)('loto_procedures')
        .update({ status, ...field, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loto-procedures'] });
      toast.success('Status atualizado');
    },
  });

  const activeCount = procedures.filter((p: Record<string, unknown>) => p.status === 'locked').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            LOTO — Lock Out / Tag Out
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} equipamentos bloqueados • {procedures.length} total
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Nova LOTO</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Procedura LOTO</DialogTitle></DialogHeader>
            <CreateLOTOForm onSubmit={(f) => createMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {['pending', 'locked', 'verified', 'released', 'cancelled'].map(s => (
          <Card key={s}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground capitalize">{s}</p>
              <p className="text-xl font-bold">{procedures.filter((p: Record<string, unknown>) => p.status === s).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Procedures List */}
      <div className="space-y-2">
        {procedures.map((proc: Record<string, unknown>) => (
          <Card key={proc.id as string}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {proc.status === 'locked' ? <Lock className="h-5 w-5 text-destructive" /> : <Unlock className="h-5 w-5 text-green-500" />}
                  <div>
                    <p className="font-medium">{proc.equipment_name as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {proc.energy_source as string} • {proc.isolation_method as string} • Lock #{proc.lock_number as string || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ponto: {proc.isolation_point as string} {proc.locked_by ? `• Bloqueado por: ${proc.locked_by}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[proc.status as string]}>{proc.status as string}</Badge>
                  {proc.status === 'pending' && (
                    <Button size="sm" variant="destructive" onClick={() => updateStatusMutation.mutate({
                      id: proc.id as string, status: 'locked', field: { locked_at: new Date().toISOString() }
                    })}>
                      <Lock className="h-3 w-3 mr-1" /> Lock
                    </Button>
                  )}
                  {proc.status === 'locked' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({
                      id: proc.id as string, status: 'verified', field: { verified_at: new Date().toISOString() }
                    })}>
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verificar
                    </Button>
                  )}
                  {proc.status === 'verified' && (
                    <Button size="sm" variant="default" onClick={() => updateStatusMutation.mutate({
                      id: proc.id as string, status: 'released', field: { released_at: new Date().toISOString() }
                    })}>
                      <Unlock className="h-3 w-3 mr-1" /> Release
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {procedures.length === 0 && !isLoading && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma procedura LOTO registrada</CardContent></Card>
        )}
      </div>
    </div>
  );
}

function CreateLOTOForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    equipment_name: '', equipment_tag: '', energy_source: 'electrical',
    isolation_point: '', isolation_method: 'breaker', lock_number: '', locked_by: '',
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Equipamento</Label><Input value={form.equipment_name} onChange={e => setForm(f => ({ ...f, equipment_name: e.target.value }))} /></div>
        <div><Label>Tag</Label><Input value={form.equipment_tag} onChange={e => setForm(f => ({ ...f, equipment_tag: e.target.value }))} /></div>
        <div>
          <Label>Fonte Energia</Label>
          <Select value={form.energy_source} onValueChange={v => setForm(f => ({ ...f, energy_source: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ENERGY_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Método Isolamento</Label>
          <Select value={form.isolation_method} onValueChange={v => setForm(f => ({ ...f, isolation_method: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ISOLATION_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Ponto de Isolamento</Label><Input value={form.isolation_point} onChange={e => setForm(f => ({ ...f, isolation_point: e.target.value }))} /></div>
        <div><Label>Nº do Cadeado</Label><Input value={form.lock_number} onChange={e => setForm(f => ({ ...f, lock_number: e.target.value }))} /></div>
      </div>
      <div><Label>Bloqueado por</Label><Input value={form.locked_by} onChange={e => setForm(f => ({ ...f, locked_by: e.target.value }))} /></div>
      <Button className="w-full" onClick={() => onSubmit({ ...form, status: 'pending' })}>
        <AlertTriangle className="h-4 w-4 mr-2" /> Criar LOTO Procedure
      </Button>
    </div>
  );
}
