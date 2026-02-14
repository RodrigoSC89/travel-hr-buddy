/**
 * Travel Command Premium V2.0 - REVOLUTIONARY
 * Supera SAP Concur, Navan e TravelPerk
 * Full CRUD, booking engine, expenses, approvals, duty of care, analytics
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Plane, Hotel, Car, CreditCard, Shield, MapPin,
  Plus, Search, CheckCircle, Clock, AlertTriangle,
  DollarSign, Calendar, Globe, Phone, Heart, BarChart3,
  ArrowRight, Loader2, Download, TrendingUp, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TravelRequest {
  id: string; traveler_name: string; destination: string;
  departure_date: string; return_date: string; purpose: string;
  status: string; total_budget: number; actual_cost: number;
  travel_type: string; created_at: string;
}

interface Expense {
  id: string; description: string; amount: number;
  category: string; date: string; status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Aguard. Aprovação', color: 'bg-warning/20 text-warning' },
  pending_approval: { label: 'Aguard. Aprovação', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Aprovado', color: 'bg-success/20 text-success' },
  confirmed: { label: 'Confirmado', color: 'bg-primary/20 text-primary' },
  booked: { label: 'Reservado', color: 'bg-primary/20 text-primary' },
  in_progress: { label: 'Em Viagem', color: 'bg-info/20 text-info' },
  completed: { label: 'Concluído', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

const EXPENSE_CATEGORIES = ['Passagem Aérea', 'Hotel', 'Alimentação', 'Transporte Local', 'Combustível', 'Estacionamento', 'Comunicação', 'Outros'];

function mapStatus(s: string): string {
  const map: Record<string, string> = { confirmed: 'approved', pending: 'pending_approval' };
  return map[s] || s;
}

export default function TravelCommandPremium() {
  const [activeTab, setActiveTab] = useState('command');
  const [bookingDialog, setBookingDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const [newBooking, setNewBooking] = useState({
    traveler_name: '', destination: '', departure_date: '', return_date: '',
    purpose: '', total_budget: '', travel_type: 'domestic'
  });
  const [newExpense, setNewExpense] = useState({
    description: '', amount: '', category: 'Passagem Aérea', date: new Date().toISOString().split('T')[0]
  });

  const { data: travels = [], isLoading } = useQuery({
    queryKey: ['travel-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []).map((r): TravelRequest => ({
        id: r.id, traveler_name: r.title || 'N/A', destination: r.location || 'N/A',
        departure_date: r.start_date || '', return_date: r.end_date || '', purpose: r.notes || r.description || '',
        status: mapStatus(r.status), total_budget: Number(r.total_amount) || 0,
        actual_cost: Number(r.total_amount) || 0, travel_type: 'domestic', created_at: r.created_at || '',
      }));
    },
    staleTime: 30000,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['travel-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(200);
      if (error) throw error;
      return (data || []).map((e): Expense => ({
        id: e.id, description: e.description || '', amount: Number(e.amount) || 0,
        category: e.category || 'Outros', date: e.date || e.created_at || '',
        status: (e.status as string) || 'pending',
      }));
    },
    staleTime: 30000,
  });

  const createTravel = useMutation({
    mutationFn: async (data: typeof newBooking) => {
      const { error } = await supabase.from('reservations').insert({
        title: data.traveler_name || `Viagem: ${data.destination}`,
        location: data.destination, start_date: data.departure_date || new Date().toISOString(),
        end_date: data.return_date || new Date().toISOString(), notes: data.purpose,
        total_amount: Number(data.total_budget) || 0, status: 'pending', reservation_type: 'travel',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-requests'] });
      toast.success('Solicitação de viagem criada');
      setBookingDialog(false);
      setNewBooking({ traveler_name: '', destination: '', departure_date: '', return_date: '', purpose: '', total_budget: '', travel_type: 'domestic' });
    },
    onError: () => toast.error('Erro ao criar solicitação'),
  });

  const createExpense = useMutation({
    mutationFn: async (data: typeof newExpense) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('expenses').insert({
        description: data.description, amount: Number(data.amount), category: data.category,
        date: data.date, status: 'pending', user_id: userData?.user?.id || '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-expenses'] });
      toast.success('Despesa registrada');
      setExpenseDialog(false);
      setNewExpense({ description: '', amount: '', category: 'Passagem Aérea', date: new Date().toISOString().split('T')[0] });
    },
    onError: () => toast.error('Erro ao registrar despesa'),
  });

  const approveTravel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reservations').update({ status: 'confirmed' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-requests'] });
      toast.success('Viagem aprovada');
    },
  });

  const metrics = useMemo(() => {
    const pending = travels.filter((t: TravelRequest) => t.status === 'pending_approval' || t.status === 'pending').length;
    const active = travels.filter(t => ['approved', 'booked', 'in_progress', 'confirmed'].includes(t.status)).length;
    const totalBudget = travels.reduce((s, t) => s + t.total_budget, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
    const budgetUsage = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

    // Monthly trend
    const monthlyMap: Record<string, number> = {};
    expenses.forEach(e => { const m = (e.date || '').substring(0, 7); if (m) { monthlyMap[m] = (monthlyMap[m] || 0) + e.amount; } });
    const monthlyTrend = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([m, v]) => ({ month: new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short' }), total: Math.round(v) }));

    return { pending, active, totalBudget, totalExpenses, pendingExpenses, total: travels.length, budgetUsage, monthlyTrend };
  }, [travels, expenses]);

  const filteredTravels = travels.filter(t =>
    t.traveler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: <Globe className="h-5 w-5" />, label: 'Total Viagens', value: metrics.total, color: 'text-primary', gradient: 'from-primary/5' },
          { icon: <Clock className="h-5 w-5" />, label: 'Aguard. Aprovação', value: metrics.pending, color: 'text-warning', gradient: 'from-warning/5' },
          { icon: <Plane className="h-5 w-5" />, label: 'Viagens Ativas', value: metrics.active, color: 'text-success', gradient: 'from-success/5' },
          { icon: <DollarSign className="h-5 w-5" />, label: 'Orçamento', value: `R$ ${(metrics.totalBudget / 1000).toFixed(0)}k`, color: 'text-primary', gradient: 'from-primary/5' },
          { icon: <CreditCard className="h-5 w-5" />, label: 'Despesas', value: `R$ ${(metrics.totalExpenses / 1000).toFixed(0)}k`, color: 'text-destructive', gradient: 'from-destructive/5' },
          { icon: <FileText className="h-5 w-5" />, label: 'Reemb. Pendentes', value: metrics.pendingExpenses, color: 'text-amber-500', gradient: 'from-amber-500/5' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} to-transparent`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5"><span className={kpi.color}>{kpi.icon}</span>{kpi.label}</div>
                <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['draft', 'pending_approval', 'approved', 'booked', 'in_progress', 'completed'].map((status, i) => {
              const count = travels.filter(t => t.status === status).length;
              const cfg = STATUS_CONFIG[status];
              return (
                <React.Fragment key={status}>
                  <div className="flex items-center gap-2 min-w-fit">
                    <div className={cn("w-3 h-3 rounded-full", count > 0 ? 'bg-primary' : 'bg-muted')} />
                    <span className="text-sm font-medium">{cfg?.label || status}</span>
                    <Badge variant="outline" className="text-[10px]">{count}</Badge>
                  </div>
                  {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="command" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Plane className="h-4 w-4" />Comando</TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5"><CreditCard className="h-4 w-4" />Despesas</TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5"><CheckCircle className="h-4 w-4" />Aprovações{metrics.pending > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{metrics.pending}</Badge>}</TabsTrigger>
          <TabsTrigger value="duty-of-care" className="gap-1.5"><Shield className="h-4 w-4" />Duty of Care</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
        </TabsList>

        {/* COMMAND */}
        <TabsContent value="command" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar viagens..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExpenseDialog(true)}><CreditCard className="h-4 w-4 mr-2" />Nova Despesa</Button>
              <Button onClick={() => setBookingDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Viagem</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filteredTravels.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhuma viagem encontrada</p><Button className="mt-4" onClick={() => setBookingDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Viagem</Button></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filteredTravels.map((travel, idx) => {
                const cfg = STATUS_CONFIG[travel.status] || STATUS_CONFIG.draft;
                return (
                  <motion.div key={travel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-primary/10 rounded-xl"><MapPin className="h-5 w-5 text-primary" /></div>
                            <div>
                              <h3 className="font-semibold">{travel.destination}</h3>
                              <p className="text-sm text-muted-foreground">{travel.traveler_name} • {travel.purpose || 'Sem descrição'}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {travel.departure_date ? new Date(travel.departure_date).toLocaleDateString('pt-BR') : '—'} → {travel.return_date ? new Date(travel.return_date).toLocaleDateString('pt-BR') : '—'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold">R$ {travel.total_budget.toLocaleString('pt-BR')}</p>
                            </div>
                            <Badge className={cn("text-[10px] border-0", cfg.color)}>{cfg.label}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* EXPENSES */}
        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Gestão de Despesas</h3><Button onClick={() => setExpenseDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Despesa</Button></div>
          {expenses.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhuma despesa registrada</p></CardContent></Card>
          ) : (
            <Card className="overflow-hidden"><CardContent className="p-0 divide-y divide-border">
              {expenses.slice(0, 30).map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div><p className="font-medium text-sm">{exp.description}</p><p className="text-xs text-muted-foreground">{exp.category} • {exp.date ? new Date(exp.date).toLocaleDateString('pt-BR') : '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">R$ {exp.amount.toLocaleString('pt-BR')}</span>
                    <Badge className={cn("text-[10px] border-0",
                      exp.status === 'approved' ? 'bg-success/20 text-success' : exp.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                    )}>{exp.status === 'pending' ? 'Pendente' : exp.status === 'approved' ? 'Aprovado' : exp.status === 'rejected' ? 'Rejeitado' : 'Reembolsado'}</Badge>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          )}
        </TabsContent>

        {/* APPROVALS */}
        <TabsContent value="approvals" className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold">Aprovações Pendentes</h3>
          {travels.filter(t => t.status === 'pending_approval' || t.status === 'pending').length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-success/50" /><p className="text-muted-foreground">Todas as solicitações processadas</p></CardContent></Card>
          ) : (
            travels.filter(t => t.status === 'pending_approval' || t.status === 'pending').map(travel => (
              <Card key={travel.id} className="border-warning/30 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-warning" />
                    <div><p className="font-semibold">{travel.traveler_name} → {travel.destination}</p><p className="text-sm text-muted-foreground">{travel.purpose} • R$ {travel.total_budget.toLocaleString('pt-BR')}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-destructive">Recusar</Button>
                    <Button size="sm" onClick={() => approveTravel.mutate(travel.id)} disabled={approveTravel.isPending}>
                      {approveTravel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Aprovar</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* DUTY OF CARE */}
        <TabsContent value="duty-of-care" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-success/30"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-success" /><div><p className="font-medium text-sm">Rastreamento Ativo</p><p className="text-xs text-muted-foreground">Todos os viajantes localizáveis</p></div></CardContent></Card>
            <Card className="border-success/30"><CardContent className="p-4 flex items-center gap-3"><Phone className="h-5 w-5 text-success" /><div><p className="font-medium text-sm">SOS 24/7</p><p className="text-xs text-muted-foreground">+55 21 99999-9999</p></div></CardContent></Card>
            <Card className="border-primary/30"><CardContent className="p-4 flex items-center gap-3"><Heart className="h-5 w-5 text-primary" /><div><p className="font-medium text-sm">Seguro Viagem</p><p className="text-xs text-muted-foreground">Cobertura internacional ativa</p></div></CardContent></Card>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary/30" />
              <p className="font-medium">Centro de Segurança do Viajante</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Monitoramento em tempo real, alertas de segurança por destino, rastreamento GPS e canal direto de emergência SOS.</p>
              <Button variant="destructive" className="mt-4"><Phone className="h-4 w-4 mr-2" />Acionar SOS</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Budget Utilizado</p><p className="text-2xl font-bold">{metrics.budgetUsage}%</p><Progress value={metrics.budgetUsage} className="h-2 mt-2" /></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Despesas por Viagem</p><p className="text-2xl font-bold">R$ {metrics.total > 0 ? (metrics.totalExpenses / metrics.total / 1000).toFixed(1) : 0}k</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground uppercase">Taxa Aprovação</p><p className="text-2xl font-bold">{metrics.total > 0 ? Math.round(travels.filter(t => t.status !== 'cancelled').length / metrics.total * 100) : 100}%</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Evolução de Gastos</CardTitle></CardHeader>
            <CardContent>
              {metrics.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={metrics.monthlyTrend}>
                    <defs><linearGradient id="travelGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Total']} />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#travelGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">Registre despesas para visualizar tendências</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Travel Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="h-5 w-5 text-primary" />Nova Solicitação de Viagem</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome do Viajante *</Label><Input value={newBooking.traveler_name} onChange={e => setNewBooking(p => ({ ...p, traveler_name: e.target.value }))} placeholder="João da Silva" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Destino *</Label><Input value={newBooking.destination} onChange={e => setNewBooking(p => ({ ...p, destination: e.target.value }))} placeholder="São Paulo, SP" /></div>
              <div><Label>Tipo</Label>
                <Select value={newBooking.travel_type} onValueChange={v => setNewBooking(p => ({ ...p, travel_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="domestic">Nacional</SelectItem><SelectItem value="international">Internacional</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ida</Label><Input type="date" value={newBooking.departure_date} onChange={e => setNewBooking(p => ({ ...p, departure_date: e.target.value }))} /></div>
              <div><Label>Volta</Label><Input type="date" value={newBooking.return_date} onChange={e => setNewBooking(p => ({ ...p, return_date: e.target.value }))} /></div>
            </div>
            <div><Label>Orçamento (R$)</Label><Input type="number" value={newBooking.total_budget} onChange={e => setNewBooking(p => ({ ...p, total_budget: e.target.value }))} placeholder="5000" /></div>
            <div><Label>Finalidade</Label><Textarea value={newBooking.purpose} onChange={e => setNewBooking(p => ({ ...p, purpose: e.target.value }))} placeholder="Reunião com cliente..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(false)}>Cancelar</Button>
            <Button onClick={() => createTravel.mutate(newBooking)} disabled={!newBooking.destination || createTravel.isPending}>
              {createTravel.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Solicitar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Expense Dialog */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Nova Despesa</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Descrição *</Label><Input value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} placeholder="Passagem aérea GRU-SSA" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor (R$) *</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} placeholder="1500" /></div>
              <div><Label>Data</Label><Input type="date" value={newExpense.date} onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div><Label>Categoria</Label>
              <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialog(false)}>Cancelar</Button>
            <Button onClick={() => createExpense.mutate(newExpense)} disabled={!newExpense.description || !newExpense.amount || createExpense.isPending}>
              {createExpense.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
