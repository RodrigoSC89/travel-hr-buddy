/**
 * Crew Travel & Logistics Manager v3
 * BEATS: Compas/Stena — Full travel lifecycle, internal quotation engine, zero external APIs
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plane, CreditCard, Calendar, MapPin, Plus, Globe, DollarSign, TrendingUp, Download, Search, Clock, Users, BarChart3, AlertTriangle, Hotel, Bus, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FlightRouteCatalog } from './travel/FlightRouteCatalog';
import { ApprovedHotelsCatalog } from './travel/ApprovedHotelsCatalog';
import { TransferProvidersCatalog } from './travel/TransferProvidersCatalog';
import { QuotationEngine } from './travel/QuotationEngine';

type TravelType = 'embarkation' | 'disembarkation' | 'crew_change' | 'training' | 'medical' | 'repatriation';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Planejado', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'Em Trânsito', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Concluído', color: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_LABELS: Record<TravelType, string> = {
  embarkation: 'Embarque', disembarkation: 'Desembarque', crew_change: 'Troca',
  training: 'Treinamento', medical: 'Médico', repatriation: 'Repatriação',
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--info))', 'hsl(var(--accent))'];

export function CrewTravelManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [mainTab, setMainTab] = useState('travels');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    crew_member_id: '', travel_type: 'embarkation' as TravelType,
    origin: '', destination: '', departure_date: '', arrival_date: '',
    flight_number: '', airline: '', hotel_name: '', hotel_nights: '0',
    estimated_cost: '0', transfer_details: '',
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
        .order('created_at', { ascending: false })
        .limit(500);
      return data || [];
    },
  });

  const createTravel = useMutation({
    mutationFn: async () => {
      const crew = crewMembers.find(c => c.id === form.crew_member_id);
      const cost = Number(form.estimated_cost) || 0;
      const hotelCost = (Number(form.hotel_nights) || 0) * 120; // avg $120/night
      const totalCost = cost + hotelCost;
      const { error } = await supabase.from('action_items').insert({
        title: `${TYPE_LABELS[form.travel_type]} — ${crew?.full_name || 'N/A'}`,
        description: `${form.origin} → ${form.destination} | ${form.airline} ${form.flight_number}${form.hotel_name ? ` | Hotel: ${form.hotel_name} (${form.hotel_nights}n)` : ''}${form.transfer_details ? ` | Transfer: ${form.transfer_details}` : ''}`,
        source_module: 'crew_travel',
        assigned_to: form.crew_member_id,
        assigned_to_name: crew?.full_name || '',
        start_date: form.departure_date || null,
        due_date: form.arrival_date || null,
        status: 'pending',
        priority: form.travel_type === 'repatriation' ? 'critical' : form.travel_type === 'medical' ? 'high' : 'medium',
        comments: [{ type: form.travel_type, cost: totalCost, airline: form.airline, flight: form.flight_number, hotel: form.hotel_name, hotelNights: form.hotel_nights }] as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Viagem registrada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['crew-travels'] });
      setCreateOpen(false);
      setForm({ crew_member_id: '', travel_type: 'embarkation', origin: '', destination: '', departure_date: '', arrival_date: '', flight_number: '', airline: '', hotel_name: '', hotel_nights: '0', estimated_cost: '0', transfer_details: '' });
    },
    onError: () => toast.error('Erro ao registrar viagem'),
  });

  const filtered = useMemo(() => {
    return travels.filter(t => {
      const matchSearch = !searchTerm || (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [travels, searchTerm, statusFilter]);

  const analytics = useMemo(() => {
    const total = travels.length;
    const upcoming = travels.filter(t => t.status === 'pending').length;
    const inTransit = travels.filter(t => t.status === 'in_progress').length;
    const completed = travels.filter(t => t.status === 'completed').length;

    // Extract costs from comments
    const withCost = travels.map(t => {
      const meta = Array.isArray(t.comments) ? t.comments[0] : null;
      return { ...t, cost: (meta as any)?.cost || 0, type: (meta as any)?.type || 'embarkation' };
    });
    const totalCost = withCost.reduce((s, t) => s + t.cost, 0);

    // By type
    const byType = Object.entries(TYPE_LABELS).map(([key, label]) => ({
      name: label,
      count: withCost.filter(t => t.type === key).length,
      cost: withCost.filter(t => t.type === key).reduce((s, t) => s + t.cost, 0),
    })).filter(d => d.count > 0);

    // Upcoming 7 days
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 86400000);
    const urgent = travels.filter(t => {
      if (t.status !== 'pending') return false;
      const d = t.start_date ? new Date(t.start_date) : null;
      return d && d >= now && d <= next7;
    });

    // Monthly volume
    const monthly = travels.reduce<Record<string, number>>((acc, t) => {
      const m = (t.start_date || t.created_at || '').substring(0, 7);
      if (m) acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const monthlyData = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, count]) => ({ month: month.substring(5), count }));

    return { total, upcoming, inTransit, completed, totalCost, byType, urgent, monthlyData };
  }, [travels]);

  const exportCSV = () => {
    const headers = ['Título', 'Descrição', 'Status', 'Partida', 'Chegada', 'Prioridade'];
    const rows = filtered.map(t => [t.title, t.description, t.status, t.start_date, t.due_date, t.priority].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crew-travel.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />Crew Travel & Logistics
          </h2>
          <p className="text-muted-foreground">Gestão completa de viagens e logística de tripulação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Viagem</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Plane, label: 'Total Viagens', value: analytics.total, color: 'text-primary' },
          { icon: Calendar, label: 'Próximas', value: analytics.upcoming, color: 'text-info' },
          { icon: Globe, label: 'Em Trânsito', value: analytics.inTransit, color: 'text-warning' },
          { icon: Users, label: 'Concluídas', value: analytics.completed, color: 'text-success' },
          { icon: DollarSign, label: 'Custo Est.', value: `$${(analytics.totalCost / 1000).toFixed(0)}k`, color: 'text-warning' },
          { icon: AlertTriangle, label: 'Urgentes (7d)', value: analytics.urgent.length, color: analytics.urgent.length > 0 ? 'text-destructive' : 'text-muted-foreground' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="travels">Viagens</TabsTrigger>
          <TabsTrigger value="flights"><Plane className="h-3 w-3 mr-1" />Rotas Aéreas</TabsTrigger>
          <TabsTrigger value="hotels"><Hotel className="h-3 w-3 mr-1" />Hotéis</TabsTrigger>
          <TabsTrigger value="transfers"><Bus className="h-3 w-3 mr-1" />Transfers</TabsTrigger>
          <TabsTrigger value="quotations"><FileText className="h-3 w-3 mr-1" />Cotações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="urgent">Urgentes ({analytics.urgent.length})</TabsTrigger>
        </TabsList>

        {/* Travels List */}
        <TabsContent value="travels">
          <div className="flex gap-3 flex-wrap mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma viagem encontrada</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map(travel => {
                const status = travel.status || 'pending';
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                const meta = Array.isArray(travel.comments) ? travel.comments[0] as any : null;
                const isUrgent = travel.start_date && new Date(travel.start_date) <= new Date(Date.now() + 3 * 86400000) && status === 'pending';
                return (
                  <Card key={travel.id} className={`hover:border-primary/30 transition-colors ${isUrgent ? 'border-warning/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{travel.title}</span>
                            <Badge className={cfg.color}>{cfg.label}</Badge>
                            {travel.priority === 'critical' && <Badge variant="destructive" className="text-[10px]">Crítico</Badge>}
                            {isUrgent && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning"><Clock className="h-3 w-3 mr-1" />Urgente</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> {travel.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span><Calendar className="h-3 w-3 inline mr-1" />{travel.start_date ? new Date(travel.start_date).toLocaleDateString('pt-BR') : '—'} → {travel.due_date ? new Date(travel.due_date).toLocaleDateString('pt-BR') : '—'}</span>
                            {meta?.cost > 0 && <span><DollarSign className="h-3 w-3 inline" />${meta.cost}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Internal Catalogs */}
        <TabsContent value="flights"><FlightRouteCatalog /></TabsContent>
        <TabsContent value="hotels"><ApprovedHotelsCatalog /></TabsContent>
        <TabsContent value="transfers"><TransferProvidersCatalog /></TabsContent>
        <TabsContent value="quotations"><QuotationEngine /></TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Viagens por Tipo</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byType}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Viagens" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Tipo</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={analytics.byType} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.byType.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Volume Mensal de Viagens</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--info))" name="Viagens" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Urgent */}
        <TabsContent value="urgent">
          {analytics.urgent.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Nenhuma viagem urgente nos próximos 7 dias</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {analytics.urgent.map(travel => {
                const daysUntil = travel.start_date ? Math.ceil((new Date(travel.start_date).getTime() - Date.now()) / 86400000) : 0;
                return (
                  <Card key={travel.id} className="border-warning/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="font-semibold">{travel.title}</span>
                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning">{daysUntil === 0 ? 'HOJE' : daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{travel.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="h-5 w-5" /> Nova Viagem</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tripulante</Label>
              <Select value={form.crew_member_id} onValueChange={v => setForm(p => ({...p, crew_member_id: v}))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{crewMembers.map(cm => <SelectItem key={cm.id} value={cm.id}>{cm.full_name} — {cm.rank}</SelectItem>)}</SelectContent>
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
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Hotel</Label><Input value={form.hotel_name} onChange={e => setForm(p => ({...p, hotel_name: e.target.value}))} placeholder="Ibis Singapore" /></div>
              <div><Label>Noites</Label><Input type="number" min="0" value={form.hotel_nights} onChange={e => setForm(p => ({...p, hotel_nights: e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Custo Estimado (USD)</Label><Input type="number" min="0" value={form.estimated_cost} onChange={e => setForm(p => ({...p, estimated_cost: e.target.value}))} /></div>
              <div><Label>Transfer</Label><Input value={form.transfer_details} onChange={e => setForm(p => ({...p, transfer_details: e.target.value}))} placeholder="Van porto → aeroporto" /></div>
            </div>
            <Button onClick={() => createTravel.mutate()} disabled={!form.crew_member_id || createTravel.isPending} className="w-full">
              {createTravel.isPending ? 'Salvando...' : 'Registrar Viagem'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
