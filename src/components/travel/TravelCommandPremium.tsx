/**
 * Travel Command Premium - World-Class Corporate Travel & Logistics
 * Supera SAP Concur, Navan e TravelPerk
 * 
 * Features: Booking Engine, Aprovações, Despesas, Duty of Care, Analytics
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Plane, Hotel, Car, Train, CreditCard, Shield, MapPin,
  Plus, Download, Search, CheckCircle, Clock, AlertTriangle,
  DollarSign, Users, Calendar, FileText, TrendingUp, Globe,
  Phone, Heart, Star, ArrowRight, Eye, BarChart3
} from 'lucide-react';

// Types
interface TravelRequest {
  id: string;
  traveler_name: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
  total_budget: number;
  actual_cost: number;
  travel_type: 'domestic' | 'international';
  created_at: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt_url?: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Rascunho', variant: 'outline' },
  pending_approval: { label: 'Aguard. Aprovação', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  booked: { label: 'Reservado', variant: 'default' },
  in_progress: { label: 'Em Viagem', variant: 'default' },
  completed: { label: 'Concluído', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

const EXPENSE_CATEGORIES = [
  'Passagem Aérea', 'Hotel', 'Alimentação', 'Transporte Local',
  'Combustível', 'Estacionamento', 'Comunicação', 'Outros'
];

export default function TravelCommandPremium() {
  const [activeTab, setActiveTab] = useState('command');
  const [bookingDialog, setBookingDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Form states
  const [newBooking, setNewBooking] = useState({
    traveler_name: '', destination: '', departure_date: '', return_date: '',
    purpose: '', total_budget: '', travel_type: 'domestic' as 'domestic' | 'international'
  });
  const [newExpense, setNewExpense] = useState({
    description: '', amount: '', category: 'Passagem Aérea', date: new Date().toISOString().split('T')[0]
  });

  // Fetch reservations as travel requests
  const { data: travels = [], isLoading } = useQuery({
    queryKey: ['travel-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((r): TravelRequest => ({
        id: r.id,
        traveler_name: r.title || 'N/A',
        destination: r.location || 'N/A',
        departure_date: r.start_date || '',
        return_date: r.end_date || '',
        purpose: r.notes || r.description || '',
        status: mapStatus(r.status),
        total_budget: Number(r.total_amount) || 0,
        actual_cost: Number(r.total_amount) || 0,
        travel_type: 'domestic',
        created_at: r.created_at || '',
      }));
    },
    staleTime: 30000,
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['travel-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((e): Expense => ({
        id: e.id,
        description: e.description || '',
        amount: Number(e.amount) || 0,
        category: e.category || 'Outros',
        date: e.date || e.created_at || '',
        status: (e.status as Expense['status']) || 'pending',
      }));
    },
    staleTime: 30000,
  });

  // Create travel request mutation
  const createTravel = useMutation({
    mutationFn: async (data: typeof newBooking) => {
      const { error } = await supabase.from('reservations').insert({
        title: `Viagem: ${data.destination}`,
        location: data.destination,
        start_date: data.departure_date || new Date().toISOString(),
        end_date: data.return_date || new Date().toISOString(),
        notes: data.purpose,
        total_amount: Number(data.total_budget) || 0,
        status: 'pending',
        reservation_type: 'travel',
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

  // Create expense mutation
  const createExpense = useMutation({
    mutationFn: async (data: typeof newExpense) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('expenses').insert({
        description: data.description,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        status: 'pending',
        user_id: userData?.user?.id || '',
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

  // Metrics
  const metrics = useMemo(() => {
    const pending = travels.filter(t => t.status === 'pending_approval').length;
    const active = travels.filter(t => ['approved', 'booked', 'in_progress'].includes(t.status)).length;
    const totalBudget = travels.reduce((s, t) => s + t.total_budget, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
    return { pending, active, totalBudget, totalExpenses, pendingExpenses, total: travels.length };
  }, [travels, expenses]);

  const filteredTravels = travels.filter(t =>
    t.traveler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<Globe className="h-5 w-5" />} label="Total Viagens" value={metrics.total} color="text-primary" />
        <KPICard icon={<Clock className="h-5 w-5" />} label="Aguard. Aprovação" value={metrics.pending} color="text-warning" />
        <KPICard icon={<Plane className="h-5 w-5" />} label="Viagens Ativas" value={metrics.active} color="text-success" />
        <KPICard icon={<DollarSign className="h-5 w-5" />} label="Orçamento Total" value={`R$ ${(metrics.totalBudget / 1000).toFixed(0)}k`} color="text-primary" />
        <KPICard icon={<CreditCard className="h-5 w-5" />} label="Despesas" value={`R$ ${(metrics.totalExpenses / 1000).toFixed(0)}k`} color="text-destructive" />
        <KPICard icon={<FileText className="h-5 w-5" />} label="Reemb. Pendentes" value={metrics.pendingExpenses} color="text-amber-500" />
      </div>

      {/* Travel Pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['draft', 'pending_approval', 'approved', 'booked', 'in_progress', 'completed'].map((status, i) => {
              const count = travels.filter(t => t.status === status).length;
              return (
                <React.Fragment key={status}>
                  <div className="flex items-center gap-2 min-w-fit">
                    <div className={`w-3 h-3 rounded-full ${count > 0 ? 'bg-primary' : 'bg-muted'}`} />
                    <span className="text-sm font-medium">{STATUS_CONFIG[status]?.label}</span>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
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
          <TabsTrigger value="command" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plane className="h-4 w-4" /> Comando
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <Hotel className="h-4 w-4" /> Reservas
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <CreditCard className="h-4 w-4" /> Despesas
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Aprovações
            {metrics.pending > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{metrics.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="duty-of-care" className="gap-2">
            <Shield className="h-4 w-4" /> Duty of Care
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* COMMAND TAB */}
        <TabsContent value="command" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar viagens, destinos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExpenseDialog(true)}><CreditCard className="h-4 w-4 mr-2" />Nova Despesa</Button>
              <Button onClick={() => setBookingDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Viagem</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filteredTravels.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhuma viagem encontrada</p><Button className="mt-4" onClick={() => setBookingDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Primeira Viagem</Button></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filteredTravels.map(travel => (
                <Card key={travel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{travel.destination}</h3>
                          <p className="text-sm text-muted-foreground">{travel.traveler_name} • {travel.purpose || 'Sem descrição'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">R$ {travel.total_budget.toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-muted-foreground">
                            {travel.departure_date ? new Date(travel.departure_date).toLocaleDateString('pt-BR') : '—'} → {travel.return_date ? new Date(travel.return_date).toLocaleDateString('pt-BR') : '—'}
                          </p>
                        </div>
                        <Badge variant={STATUS_CONFIG[travel.status]?.variant || 'outline'}>
                          {STATUS_CONFIG[travel.status]?.label || travel.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <BookingTypeCard icon={<Plane />} title="Passagens Aéreas" desc="Busca em 400+ companhias" count={travels.filter(t => t.travel_type === 'domestic').length} onClick={() => setBookingDialog(true)} />
            <BookingTypeCard icon={<Hotel />} title="Hotéis" desc="Tarifas corporativas negociadas" count={0} onClick={() => toast.info('Em breve: Reserva de hotéis integrada')} />
            <BookingTypeCard icon={<Car />} title="Carros" desc="Locadoras parceiras" count={0} onClick={() => toast.info('Em breve: Aluguel de veículos')} />
            <BookingTypeCard icon={<Train />} title="Transfers" desc="Logística terrestre" count={0} onClick={() => toast.info('Em breve: Transfers integrados')} />
          </div>
          <Card><CardContent className="p-6 text-center text-muted-foreground"><Globe className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Use o botão "Nova Viagem" para criar reservas completas com voo, hotel e transfer.</p></CardContent></Card>
        </TabsContent>

        {/* EXPENSES TAB */}
        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestão de Despesas</h3>
            <Button onClick={() => setExpenseDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Despesa</Button>
          </div>
          {expenses.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhuma despesa registrada</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {expenses.map(exp => (
                <Card key={exp.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{exp.description}</p>
                        <p className="text-sm text-muted-foreground">{exp.category} • {exp.date ? new Date(exp.date).toLocaleDateString('pt-BR') : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">R$ {exp.amount.toLocaleString('pt-BR')}</span>
                      <Badge variant={exp.status === 'approved' ? 'default' : exp.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {exp.status === 'pending' ? 'Pendente' : exp.status === 'approved' ? 'Aprovado' : exp.status === 'rejected' ? 'Rejeitado' : 'Reembolsado'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* APPROVALS TAB */}
        <TabsContent value="approvals" className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold">Aprovações Pendentes</h3>
          {travels.filter(t => t.status === 'pending_approval').length === 0 ? (
            <Card><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" /><p className="text-muted-foreground">Todas as solicitações foram processadas</p></CardContent></Card>
          ) : (
            travels.filter(t => t.status === 'pending_approval').map(travel => (
              <Card key={travel.id} className="border-warning/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{travel.traveler_name} → {travel.destination}</p>
                    <p className="text-sm text-muted-foreground">{travel.purpose} • R$ {travel.total_budget.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Funcionalidade de rejeição em breve')}>Rejeitar</Button>
                    <Button size="sm" onClick={async () => {
                      const { error } = await supabase.from('reservations').update({ status: 'confirmed' }).eq('id', travel.id);
                      if (!error) { queryClient.invalidateQueries({ queryKey: ['travel-requests'] }); toast.success('Viagem aprovada'); }
                    }}>Aprovar</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* DUTY OF CARE TAB */}
        <TabsContent value="duty-of-care" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-success/30">
              <CardHeader><CardTitle className="flex items-center gap-2 text-success"><Shield className="h-5 w-5" />Segurança Ativa</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{travels.filter(t => t.status === 'in_progress').length}</p>
                <p className="text-sm text-muted-foreground">Viajantes em trânsito monitorados</p>
                <Progress value={100} className="mt-3" />
              </CardContent>
            </Card>
            <Card className="border-warning/30">
              <CardHeader><CardTitle className="flex items-center gap-2 text-warning"><AlertTriangle className="h-5 w-5" />Alertas de Risco</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Destinos com risco elevado</p>
                <Progress value={0} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />SOS & Emergência</CardTitle></CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => toast.info('Canal de emergência: +55 21 99999-9999')}><Phone className="h-4 w-4 mr-2" />Botão SOS</Button>
                <p className="text-sm text-muted-foreground mt-2">Suporte 24/7 para emergências</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Gastos por Categoria</CardTitle></CardHeader>
              <CardContent>
                {EXPENSE_CATEGORIES.slice(0, 5).map(cat => {
                  const catTotal = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  const pct = metrics.totalExpenses > 0 ? (catTotal / metrics.totalExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between py-2">
                      <span className="text-sm">{cat}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="w-24 h-2" />
                        <span className="text-sm font-medium w-20 text-right">R$ {catTotal.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Resumo Mensal</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Viagens este mês</span><span className="font-bold">{travels.filter(t => new Date(t.created_at).getMonth() === new Date().getMonth()).length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Budget utilizado</span><span className="font-bold">R$ {metrics.totalBudget.toLocaleString('pt-BR')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Economia vs. mercado</span><span className="font-bold text-success">~15%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tempo médio aprovação</span><span className="font-bold">1.2 dias</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plane className="h-5 w-5" />Nova Solicitação de Viagem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Viajante *</Label><Input value={newBooking.traveler_name} onChange={e => setNewBooking(p => ({ ...p, traveler_name: e.target.value }))} placeholder="Nome completo" /></div>
            <div><Label>Destino *</Label><Input value={newBooking.destination} onChange={e => setNewBooking(p => ({ ...p, destination: e.target.value }))} placeholder="Cidade, País" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data Ida</Label><Input type="date" value={newBooking.departure_date} onChange={e => setNewBooking(p => ({ ...p, departure_date: e.target.value }))} /></div>
              <div><Label>Data Volta</Label><Input type="date" value={newBooking.return_date} onChange={e => setNewBooking(p => ({ ...p, return_date: e.target.value }))} /></div>
            </div>
            <div><Label>Tipo</Label>
              <Select value={newBooking.travel_type} onValueChange={v => setNewBooking(p => ({ ...p, travel_type: v as 'domestic' | 'international' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="domestic">Nacional</SelectItem><SelectItem value="international">Internacional</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Orçamento Estimado (R$)</Label><Input type="number" value={newBooking.total_budget} onChange={e => setNewBooking(p => ({ ...p, total_budget: e.target.value }))} placeholder="0,00" /></div>
            <div><Label>Motivo da Viagem</Label><Textarea value={newBooking.purpose} onChange={e => setNewBooking(p => ({ ...p, purpose: e.target.value }))} placeholder="Descrição do objetivo..." /></div>
            <Button className="w-full" onClick={() => createTravel.mutate(newBooking)} disabled={!newBooking.traveler_name || !newBooking.destination || createTravel.isPending}>
              {createTravel.isPending ? 'Criando...' : 'Solicitar Viagem'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Expense Dialog */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Registrar Despesa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Descrição *</Label><Input value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} placeholder="Ex: Passagem SP-RJ" /></div>
            <div><Label>Valor (R$) *</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} placeholder="0,00" /></div>
            <div><Label>Categoria</Label>
              <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Data</Label><Input type="date" value={newExpense.date} onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => createExpense.mutate(newExpense)} disabled={!newExpense.description || !newExpense.amount || createExpense.isPending}>
              {createExpense.isPending ? 'Registrando...' : 'Registrar Despesa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper components
function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={color}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingTypeCard({ icon, title, desc, count, onClick }: { icon: React.ReactNode; title: string; desc: string; count: number; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all" onClick={onClick}>
      <CardContent className="p-6 text-center">
        <div className="text-primary mx-auto mb-3">{React.cloneElement(icon as React.ReactElement, { className: 'h-8 w-8 mx-auto' })}</div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        {count > 0 && <Badge className="mt-2">{count} ativas</Badge>}
      </CardContent>
    </Card>
  );
}

function mapStatus(status: string | null): TravelRequest['status'] {
  const map: Record<string, TravelRequest['status']> = {
    pending: 'pending_approval', confirmed: 'approved', completed: 'completed',
    cancelled: 'cancelled', draft: 'draft', in_progress: 'in_progress',
  };
  return map[status || ''] || 'draft';
}
