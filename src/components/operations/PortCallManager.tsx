/**
 * Port Call Manager v3 - World-Class Port Operations Intelligence
 * Turnaround Analytics · Port Performance KPIs · Cost Tracking · Agent Coordination
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Anchor, Plus, Search, Edit, Trash2, Calendar, Clock,
  Ship, MapPin, FileText, CheckCircle, AlertTriangle,
  Play, StopCircle, Download, Filter, BarChart3, Timer,
  DollarSign, TrendingUp, Globe
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { differenceInHours } from 'date-fns';

interface PortCallForm {
  vessel_name: string; port_name: string; port_code: string; purpose: string;
  status: string; eta: string; etd: string; ata: string; atd: string;
  berth: string; agent: string; pilot_required: boolean; tug_required: boolean;
  cargo_operations: string; notes: string;
}

const emptyForm: PortCallForm = {
  vessel_name: '', port_name: '', port_code: '', purpose: 'loading',
  status: 'planned', eta: '', etd: '', ata: '', atd: '',
  berth: '', agent: '', pilot_required: true, tug_required: false,
  cargo_operations: '', notes: ''
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];
const dynamicFrom = supabase.from as Function;

export function PortCallManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortCallForm>(emptyForm);
  const queryClient = useQueryClient();

  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ['port-calls'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('port_calls').select('*').order('eta', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (form: PortCallForm & { id?: string }) => {
      const payload = {
        vessel_name: form.vessel_name, port_name: form.port_name, port_code: form.port_code,
        purpose: form.purpose, status: form.status,
        eta: form.eta || null, etd: form.etd || null, ata: form.ata || null, atd: form.atd || null,
        berth: form.berth || null, agent: form.agent || null,
        pilot_required: form.pilot_required, tug_required: form.tug_required,
        cargo_operations: form.cargo_operations || null, notes: form.notes || null,
        call_id: `PC-${Date.now().toString(36).toUpperCase()}`,
        updated_at: new Date().toISOString(),
      };
      if (form.id) {
        const { error } = await dynamicFrom('port_calls').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await dynamicFrom('port_calls').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['port-calls'] }); toast.success(editingId ? 'Escala atualizada' : 'Escala criada'); setIsFormOpen(false); setEditingId(null); },
    onError: () => toast.error('Erro ao salvar escala'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await dynamicFrom('port_calls').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['port-calls'] }); toast.success('Escala excluída'); setIsDeleteOpen(false); },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status, extras }: { id: string; status: string; extras?: Record<string, unknown> }) => {
      const { error } = await dynamicFrom('port_calls').update({ status, ...extras, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['port-calls'] }); toast.success('Status atualizado'); },
  });

  // === ANALYTICS ===
  const analytics = useMemo(() => {
    const pc = portCalls as Record<string, unknown>[];
    const completed = pc.filter(c => c.status === 'completed' && c.ata && c.atd);

    // Avg turnaround
    const turnarounds = completed.map(c => differenceInHours(new Date(String(c.atd)), new Date(String(c.ata))));
    const avgTurnaround = turnarounds.length > 0 ? Math.round(turnarounds.reduce((s, h) => s + h, 0) / turnarounds.length) : 0;

    // ETA accuracy (how close ATA is to ETA)
    const withBoth = completed.filter(c => c.eta && c.ata);
    const etaDelays = withBoth.map(c => Math.abs(differenceInHours(new Date(String(c.ata)), new Date(String(c.eta)))));
    const avgEtaDeviation = etaDelays.length > 0 ? Math.round(etaDelays.reduce((s, h) => s + h, 0) / etaDelays.length) : 0;

    // Purpose distribution
    const purposeMap = pc.reduce<Record<string, number>>((acc, c) => { const p = String(c.purpose || 'other'); acc[p] = (acc[p] || 0) + 1; return acc; }, {});
    const purposeDist = Object.entries(purposeMap).map(([name, count]) => ({ name: purposeLabels[name] || name, count })).sort((a, b) => b.count - a.count);

    // Port ranking (most visited)
    const portMap = pc.reduce<Record<string, { count: number; avgHours: number; totalHours: number }>>((acc, c) => {
      const port = String(c.port_name || 'Unknown');
      if (!acc[port]) acc[port] = { count: 0, avgHours: 0, totalHours: 0 };
      acc[port].count++;
      if (c.ata && c.atd) {
        const hours = differenceInHours(new Date(String(c.atd)), new Date(String(c.ata)));
        acc[port].totalHours += hours;
      }
      return acc;
    }, {});
    const topPorts = Object.entries(portMap)
      .map(([port, d]) => ({ port, calls: d.count, avgHours: d.count > 0 ? Math.round(d.totalHours / d.count) : 0 }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 8);

    // Agent performance
    const agentMap = pc.reduce<Record<string, number>>((acc, c) => { const a = String(c.agent || 'Sem Agente'); acc[a] = (acc[a] || 0) + 1; return acc; }, {});
    const agentDist = Object.entries(agentMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

    // Status breakdown
    const statusMap = pc.reduce<Record<string, number>>((acc, c) => { const s = String(c.status); acc[s] = (acc[s] || 0) + 1; return acc; }, {});

    return { total: pc.length, completed: completed.length, avgTurnaround, avgEtaDeviation, purposeDist, topPorts, agentDist, statusMap };
  }, [portCalls]);

  const activeStatuses = ['planned', 'approaching', 'berthed', 'operations'];
  const filteredCalls = useMemo(() => portCalls.filter((call: Record<string, unknown>) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = String(call.vessel_name || '').toLowerCase().includes(s) || String(call.port_name || '').toLowerCase().includes(s) || String(call.call_id || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const status = String(call.status);
    const matchesTab = activeTab === 'active' ? activeStatuses.includes(status) : ['completed', 'cancelled'].includes(status);
    return matchesSearch && matchesStatus && matchesTab;
  }), [portCalls, searchTerm, statusFilter, activeTab]);

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setIsFormOpen(true); };
  const openEdit = (call: Record<string, unknown>) => {
    setEditingId(String(call.id));
    setFormData({
      vessel_name: String(call.vessel_name || ''), port_name: String(call.port_name || ''),
      port_code: String(call.port_code || ''), purpose: String(call.purpose || 'loading'),
      status: String(call.status || 'planned'), eta: String(call.eta || '').slice(0, 16),
      etd: String(call.etd || '').slice(0, 16), ata: String(call.ata || '').slice(0, 16),
      atd: String(call.atd || '').slice(0, 16), berth: String(call.berth || ''),
      agent: String(call.agent || ''), pilot_required: Boolean(call.pilot_required),
      tug_required: Boolean(call.tug_required), cargo_operations: String(call.cargo_operations || ''),
      notes: String(call.notes || ''),
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.vessel_name || !formData.port_name || !formData.eta) { toast.error('Preencha campos obrigatórios'); return; }
    saveMutation.mutate({ ...formData, id: editingId || undefined });
  };

  const handleStatusChange = (call: Record<string, unknown>, newStatus: string) => {
    const extras: Record<string, unknown> = {};
    if (newStatus === 'berthed' && !call.ata) extras.ata = new Date().toISOString();
    if (newStatus === 'completed' && !call.atd) extras.atd = new Date().toISOString();
    statusUpdateMutation.mutate({ id: String(call.id), status: newStatus, extras });
  };

  const purposeLabels: Record<string, string> = {
    loading: 'Carregamento', discharge: 'Descarga', bunkering: 'Abastecimento',
    repairs: 'Reparos', crew_change: 'Troca de Tripulação', provisions: 'Provisões', mixed: 'Misto'
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Calendar }> = {
      planned: { label: 'Planejada', variant: 'secondary', icon: Calendar },
      approaching: { label: 'Aproximando', variant: 'default', icon: Ship },
      berthed: { label: 'Atracado', variant: 'default', icon: Anchor },
      operations: { label: 'Em Operação', variant: 'default', icon: Play },
      completed: { label: 'Concluída', variant: 'outline', icon: CheckCircle },
      cancelled: { label: 'Cancelada', variant: 'destructive', icon: StopCircle },
    };
    const c = config[status] || { label: status, variant: 'outline' as const, icon: Calendar };
    const I = c.icon;
    return <Badge variant={c.variant} className="flex items-center gap-1"><I className="h-3 w-3" />{c.label}</Badge>;
  };

  const activeCount = portCalls.filter((c: Record<string, unknown>) => activeStatuses.includes(String(c.status))).length;
  const historyCount = portCalls.length - activeCount;

  const exportCSV = () => {
    const headers = ['Call ID', 'Vessel', 'Port', 'Purpose', 'Status', 'ETA', 'ETD', 'ATA', 'ATD', 'Agent'];
    const rows = portCalls.map((c: Record<string, unknown>) => [c.call_id, c.vessel_name, c.port_name, c.purpose, c.status, c.eta, c.etd, c.ata, c.atd, c.agent].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'port-calls.csv'; a.click();
    URL.revokeObjectURL(url); toast.success('CSV exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Anchor className="h-6 w-6 text-primary" />Port Call Intelligence</h2>
          <p className="text-muted-foreground">Turnaround Analytics · Port Performance · Agent Coordination</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Escala</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Anchor, label: 'Total Escalas', value: analytics.total, color: 'text-primary' },
          { icon: Ship, label: 'Ativas', value: activeCount, color: 'text-success' },
          { icon: CheckCircle, label: 'Concluídas', value: analytics.completed, color: 'text-muted-foreground' },
          { icon: Timer, label: 'Turnaround Médio', value: `${analytics.avgTurnaround}h`, color: 'text-warning' },
          { icon: Clock, label: 'Desvio ETA', value: `±${analytics.avgEtaDeviation}h`, color: analytics.avgEtaDeviation > 12 ? 'text-destructive' : 'text-success' },
          { icon: Globe, label: 'Portos', value: analytics.topPorts.length, color: 'text-accent-foreground' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativas ({activeCount})</TabsTrigger>
          <TabsTrigger value="completed">Histórico ({historyCount})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="planned">Planejada</SelectItem>
              <SelectItem value="approaching">Aproximando</SelectItem>
              <SelectItem value="berthed">Atracado</SelectItem>
              <SelectItem value="operations">Em Operação</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active/History tabs */}
        {['active', 'completed'].includes(activeTab) && (
          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : filteredCalls.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma escala encontrada</p>
                {activeTab === 'active' && <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Escala</Button>}
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {filteredCalls.map((call: Record<string, unknown>) => {
                  const turnaround = call.ata && call.atd ? differenceInHours(new Date(String(call.atd)), new Date(String(call.ata))) : null;
                  return (
                    <Card key={String(call.id)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono font-bold text-sm">{String(call.call_id || '')}</span>
                              {getStatusBadge(String(call.status))}
                              <Badge variant="outline">{purposeLabels[String(call.purpose)] || String(call.purpose)}</Badge>
                              {turnaround !== null && <Badge variant="secondary" className="text-xs"><Timer className="h-3 w-3 mr-1" />{turnaround}h turnaround</Badge>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                              <div><p className="text-xs text-muted-foreground">Embarcação</p><p className="font-medium text-sm flex items-center gap-1"><Ship className="h-3.5 w-3.5" />{String(call.vessel_name)}</p></div>
                              <div><p className="text-xs text-muted-foreground">Porto</p><p className="font-medium text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{String(call.port_name)} {call.port_code ? `(${String(call.port_code)})` : ''}</p></div>
                              <div><p className="text-xs text-muted-foreground">ETA</p><p className="font-medium text-sm">{call.eta ? new Date(String(call.eta)).toLocaleString('pt-BR') : '—'}</p></div>
                              <div><p className="text-xs text-muted-foreground">ETD</p><p className="font-medium text-sm">{call.etd ? new Date(String(call.etd)).toLocaleString('pt-BR') : '—'}</p></div>
                            </div>
                              {call.cargo_operations ? <p className="text-xs bg-muted p-2 rounded mb-2">📦 {String(call.cargo_operations)}</p> : null}
                            <div className="flex gap-2 flex-wrap">
                              {Boolean(call.pilot_required) && <Badge variant="secondary" className="text-xs">Piloto</Badge>}
                              {Boolean(call.tug_required) && <Badge variant="secondary" className="text-xs">Rebocador</Badge>}
                              {call.agent ? <Badge variant="outline" className="text-xs">{'👤 ' + String(call.agent)}</Badge> : null}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 ml-4">
                            {String(call.status) === 'planned' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'approaching')}><Ship className="h-3 w-3 mr-1" />Aproximar</Button>}
                            {String(call.status) === 'approaching' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'berthed')}><Anchor className="h-3 w-3 mr-1" />Atracar</Button>}
                            {String(call.status) === 'berthed' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'operations')}><Play className="h-3 w-3 mr-1" />Operar</Button>}
                            {String(call.status) === 'operations' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(call, 'completed')}><CheckCircle className="h-3 w-3 mr-1" />Concluir</Button>}
                            <Button size="sm" variant="ghost" onClick={() => openEdit(call)}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeletingId(String(call.id)); setIsDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Portos Mais Visitados</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topPorts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="port" width={100} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="calls" name="Escalas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Propósito</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={analytics.purposeDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analytics.purposeDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Turnaround Médio por Porto (horas)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.topPorts.filter(p => p.avgHours > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topPorts.filter(p => p.avgHours > 0)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="port" className="text-xs" angle={-30} textAnchor="end" height={60} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="avgHours" name="Horas Médias" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Dados insuficientes</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Coordenação de Agentes</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.agentDist}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" angle={-20} textAnchor="end" height={50} />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" name="Escalas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Editar Escala' : 'Nova Escala'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Embarcação *</Label><Input value={formData.vessel_name} onChange={e => setFormData(p => ({ ...p, vessel_name: e.target.value }))} /></div>
              <div><Label>Porto *</Label><Input value={formData.port_name} onChange={e => setFormData(p => ({ ...p, port_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código Porto</Label><Input value={formData.port_code} onChange={e => setFormData(p => ({ ...p, port_code: e.target.value }))} placeholder="BRSSZ" /></div>
              <div>
                <Label>Propósito</Label>
                <Select value={formData.purpose} onValueChange={v => setFormData(p => ({ ...p, purpose: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(purposeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ETA *</Label><Input type="datetime-local" value={formData.eta} onChange={e => setFormData(p => ({ ...p, eta: e.target.value }))} /></div>
              <div><Label>ETD</Label><Input type="datetime-local" value={formData.etd} onChange={e => setFormData(p => ({ ...p, etd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Berço</Label><Input value={formData.berth} onChange={e => setFormData(p => ({ ...p, berth: e.target.value }))} /></div>
              <div><Label>Agente</Label><Input value={formData.agent} onChange={e => setFormData(p => ({ ...p, agent: e.target.value }))} /></div>
            </div>
            <div><Label>Operações de Carga</Label><Textarea value={formData.cargo_operations} onChange={e => setFormData(p => ({ ...p, cargo_operations: e.target.value }))} /></div>
            <div><Label>Notas</Label><Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent><DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Deseja excluir esta escala portuária?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate(deletingId)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
