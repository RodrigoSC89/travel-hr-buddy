/**
 * PEO-DP DPO Operations Logbook
 * Integrated with Supabase peodp_logbook_entries table
 * Full CRUD: Create, Read, Filter, Delete
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Clock, AlertTriangle, CheckCircle, Users,
  Navigation, Shield, Activity, Plus, ArrowRightLeft, Trash2, Loader2
} from 'lucide-react';

type EventSeverity = 'info' | 'warning' | 'critical';
type EventType = 'operation' | 'incident' | 'handover' | 'drill' | 'maintenance' | 'environmental';

const typeIcons: Record<EventType, typeof Clock> = {
  operation: Navigation,
  incident: AlertTriangle,
  handover: ArrowRightLeft,
  drill: Shield,
  maintenance: Activity,
  environmental: Activity,
};

const typeColors: Record<EventType, string> = {
  operation: 'bg-primary/10 text-primary border-primary/30',
  incident: 'bg-destructive/10 text-destructive border-destructive/30',
  handover: 'bg-muted text-foreground border-border',
  drill: 'bg-primary/10 text-primary border-primary/30',
  maintenance: 'bg-warning/10 text-warning border-warning/30',
  environmental: 'bg-warning/10 text-warning border-warning/30',
};

const severityBorder: Record<EventSeverity, string> = {
  info: '',
  warning: 'border-l-4 border-l-warning',
  critical: 'border-l-4 border-l-destructive',
};

const typeLabels: Record<EventType, string> = {
  operation: 'Operação',
  incident: 'Incidente',
  handover: 'Handover',
  drill: 'Drill',
  maintenance: 'Manutenção',
  environmental: 'Ambiental',
};

export function PeoDPLogbook() {
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [form, setForm] = useState({
    event_type: 'operation' as EventType,
    severity: 'info' as EventSeverity,
    dpo_name: '',
    title: '',
    description: '',
    dp_mode: '',
    thrusters_active: '',
    wind_speed: '',
    wave_height: '',
    heading: '',
    excursion: '',
  });

  // Fetch entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['peodp-logbook'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peodp_logbook_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Create entry
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('peodp_logbook_entries').insert({
        event_type: form.event_type,
        severity: form.severity,
        dpo_name: form.dpo_name,
        title: form.title,
        description: form.description,
        dp_mode: form.dp_mode || null,
        thrusters_active: form.thrusters_active ? Number(form.thrusters_active) : null,
        wind_speed: form.wind_speed ? Number(form.wind_speed) : null,
        wave_height: form.wave_height ? Number(form.wave_height) : null,
        heading: form.heading ? Number(form.heading) : null,
        excursion: form.excursion ? Number(form.excursion) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peodp-logbook'] });
      setDialogOpen(false);
      setForm({ event_type: 'operation', severity: 'info', dpo_name: '', title: '', description: '', dp_mode: '', thrusters_active: '', wind_speed: '', wave_height: '', heading: '', excursion: '' });
      toast({ title: 'Entrada registrada', description: 'Logbook atualizado com sucesso' });
    },
    onError: () => toast({ title: 'Erro', description: 'Falha ao salvar entrada', variant: 'destructive' }),
  });

  // Delete entry
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('peodp_logbook_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peodp-logbook'] });
      toast({ title: 'Entrada removida' });
    },
  });

  const filtered = filter === 'all' ? entries : entries.filter((e: Record<string, unknown>) => e.event_type === filter);
  const incidents = entries.filter((e: Record<string, unknown>) => e.event_type === 'incident').length;
  const handovers = entries.filter((e: Record<string, unknown>) => e.event_type === 'handover').length;
  const drills = entries.filter((e: Record<string, unknown>) => e.event_type === 'drill').length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                DP Operations Logbook
              </CardTitle>
              <CardDescription>Registro digital de operações DP — Persistido no Supabase</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Nova Entrada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar Evento DP</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo de Evento</Label>
                      <Select value={form.event_type} onValueChange={(v) => setForm(p => ({ ...p, event_type: v as EventType }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(typeLabels) as EventType[]).map(t => (
                            <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Severidade</Label>
                      <Select value={form.severity} onValueChange={(v) => setForm(p => ({ ...p, severity: v as EventSeverity }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>DPO</Label>
                    <Input value={form.dpo_name} onChange={e => setForm(p => ({ ...p, dpo_name: e.target.value }))} placeholder="Nome do DPO" />
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título do evento" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição detalhada" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>DP Mode</Label>
                      <Input value={form.dp_mode} onChange={e => setForm(p => ({ ...p, dp_mode: e.target.value }))} placeholder="DP2" />
                    </div>
                    <div>
                      <Label>Thrusters</Label>
                      <Input type="number" value={form.thrusters_active} onChange={e => setForm(p => ({ ...p, thrusters_active: e.target.value }))} placeholder="6" />
                    </div>
                    <div>
                      <Label>Excursion (m)</Label>
                      <Input type="number" step="0.1" value={form.excursion} onChange={e => setForm(p => ({ ...p, excursion: e.target.value }))} placeholder="0.3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Vento (kts)</Label>
                      <Input type="number" value={form.wind_speed} onChange={e => setForm(p => ({ ...p, wind_speed: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Ondas (m)</Label>
                      <Input type="number" step="0.1" value={form.wave_height} onChange={e => setForm(p => ({ ...p, wave_height: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Heading (°)</Label>
                      <Input type="number" value={form.heading} onChange={e => setForm(p => ({ ...p, heading: e.target.value }))} />
                    </div>
                  </div>
                  <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.dpo_name || createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Registrar Entrada
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Entradas</span>
            </div>
            <p className="text-xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card className={incidents > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${incidents > 0 ? 'text-destructive' : 'text-success'}`} />
              <span className="text-xs text-muted-foreground">Incidentes</span>
            </div>
            <p className={`text-xl font-bold ${incidents > 0 ? 'text-destructive' : 'text-success'}`}>{incidents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Handovers</span>
            </div>
            <p className="text-xl font-bold">{handovers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Drills</span>
            </div>
            <p className="text-xl font-bold">{drills}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos</Button>
        {(Object.keys(typeLabels) as EventType[]).map(t => (
          <Button key={t} variant={filter === t ? 'default' : 'outline'} size="sm" onClick={() => setFilter(t)} className="gap-1">
            {typeLabels[t]}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma entrada no logbook. Clique em "Nova Entrada" para registrar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry: Record<string, unknown>) => {
            const eventType = entry.event_type as EventType;
            const severity = entry.severity as EventSeverity;
            const Icon = typeIcons[eventType] || Clock;
            const time = new Date(entry.timestamp as string);
            return (
              <Card key={entry.id as string} className={`${severityBorder[severity]} hover:shadow-md transition-shadow`}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[eventType] || ''}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[eventType] || ''}`}>{typeLabels[eventType]}</Badge>
                        <span className="text-xs text-muted-foreground">• {entry.dpo_name as string}</span>
                      </div>
                      <p className="font-medium text-sm">{entry.title as string}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.description as string}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {entry.dp_mode ? <Badge variant="outline" className="text-[10px]">Mode: {String(entry.dp_mode)}</Badge> : null}
                        {entry.thrusters_active != null ? <Badge variant="outline" className="text-[10px]">Thrusters: {String(entry.thrusters_active)}/6</Badge> : null}
                        {entry.wind_speed != null ? <Badge variant="outline" className="text-[10px]">Wind: {String(entry.wind_speed)}kts</Badge> : null}
                        {entry.wave_height != null ? <Badge variant="outline" className="text-[10px]">Hs: {String(entry.wave_height)}m</Badge> : null}
                        {entry.heading != null ? <Badge variant="outline" className="text-[10px]">Hdg: {String(entry.heading)}°</Badge> : null}
                        {entry.excursion != null && <Badge variant="outline" className="text-[10px]">Excursion: {String(entry.excursion)}m</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(entry.id as string)} aria-label="Excluir entrada do logbook" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
