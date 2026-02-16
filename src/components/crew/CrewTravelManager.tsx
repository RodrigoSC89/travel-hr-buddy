/**
 * Crew Travel & Logistics Manager
 * BEATS: Compas/Stena (Travel Booking, Crew Change Planning)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plane, CreditCard, Calendar, MapPin, Plus, Globe } from 'lucide-react';

type TravelType = 'embarkation' | 'disembarkation' | 'crew_change' | 'training' | 'medical' | 'repatriation';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Planejado', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'Em Trânsito', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Concluído', color: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_LABELS: Record<TravelType, string> = {
  embarkation: 'Embarque', disembarkation: 'Desembarque', crew_change: 'Troca de Tripulação',
  training: 'Treinamento', medical: 'Médico', repatriation: 'Repatriação',
};

export function CrewTravelManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    crew_member_id: '', travel_type: 'embarkation' as TravelType,
    origin: '', destination: '', departure_date: '', arrival_date: '',
    flight_number: '', airline: '', hotel_name: '', hotel_nights: '0',
    estimated_cost: '0',
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['travel-crew'],
    queryFn: async () => {
      const { data } = await supabase.from('crew_members').select('id, full_name, rank, nationality').order('full_name');
      return data || [];
    },
  });

  const { data: travels = [], isLoading } = useQuery({
    queryKey: ['crew-travels'],
    queryFn: async () => {
      const { data } = await supabase
        .from('action_items')
        .select('*')
        .eq('source_module', 'crew_travel')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createTravel = useMutation({
    mutationFn: async () => {
      const crew = crewMembers.find(c => c.id === form.crew_member_id);
      const { error } = await supabase.from('action_items').insert({
        title: `${TYPE_LABELS[form.travel_type]} — ${crew?.full_name || 'N/A'}`,
        description: `${form.origin} → ${form.destination} | ${form.airline} ${form.flight_number}`,
        source_module: 'crew_travel',
        assigned_to: form.crew_member_id,
        assigned_to_name: crew?.full_name || '',
        start_date: form.departure_date || null,
        due_date: form.arrival_date || null,
        status: 'pending',
        priority: form.travel_type === 'repatriation' ? 'critical' : 'medium',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Viagem registrada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['crew-travels'] });
      setCreateOpen(false);
    },
    onError: () => toast.error('Erro ao registrar viagem'),
  });

  const totalCost = parseFloat(form.estimated_cost) || 0; // simplified
  const upcomingCount = travels.filter(t => t.status === 'pending').length;
  const inTransitCount = travels.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Viagens', value: travels.length, icon: Plane, color: 'text-primary' },
          { label: 'Próximas', value: upcomingCount, icon: Calendar, color: 'text-info' },
          { label: 'Em Trânsito', value: inTransitCount, icon: Globe, color: 'text-warning' },
          { label: 'Tripulantes', value: crewMembers.length, icon: CreditCard, color: 'text-success' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-4 flex items-center gap-3">
            <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
            <div><p className="text-xs text-muted-foreground">{kpi.label}</p><p className="text-xl font-bold">{kpi.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Viagens & Logística</h3>
        <Button onClick={() => setCreateOpen(true)} size="sm" aria-label="Nova viagem"><Plus className="h-4 w-4 mr-1" /> Nova Viagem</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-trvl-${i}`} className="h-16 w-full" />)}</div>
      ) : travels.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma viagem registrada</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {travels.map(travel => {
            const status = travel.status || 'pending';
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            return (
              <Card key={travel.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{travel.title}</span>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {travel.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {travel.start_date ? new Date(travel.start_date).toLocaleDateString('pt-BR') : '—'} → {travel.due_date ? new Date(travel.due_date).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="h-5 w-5" /> Nova Viagem</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tripulante</Label>
              <Select value={form.crew_member_id} onValueChange={v => setForm(p => ({...p, crew_member_id: v}))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{crewMembers.map(cm => (<SelectItem key={cm.id} value={cm.id}>{cm.full_name} — {cm.rank}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.travel_type} onValueChange={v => setForm(p => ({...p, travel_type: v as TravelType}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Origem</Label><Input value={form.origin} onChange={e => setForm(p => ({...p, origin: e.target.value}))} placeholder="GRU" /></div>
              <div><Label>Destino</Label><Input value={form.destination} onChange={e => setForm(p => ({...p, destination: e.target.value}))} placeholder="SIN" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Partida</Label><Input type="date" value={form.departure_date} onChange={e => setForm(p => ({...p, departure_date: e.target.value}))} /></div>
              <div><Label>Chegada</Label><Input type="date" value={form.arrival_date} onChange={e => setForm(p => ({...p, arrival_date: e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cia Aérea</Label><Input value={form.airline} onChange={e => setForm(p => ({...p, airline: e.target.value}))} placeholder="LATAM" /></div>
              <div><Label>Voo</Label><Input value={form.flight_number} onChange={e => setForm(p => ({...p, flight_number: e.target.value}))} placeholder="LA8084" /></div>
            </div>
            <Button onClick={() => createTravel.mutate()} disabled={!form.crew_member_id || createTravel.isPending} className="w-full" aria-label="Registrar viagem">
              {createTravel.isPending ? 'Salvando...' : 'Registrar Viagem'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
