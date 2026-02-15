/**
 * Voyage P&L Manager - World-class voyage profitability tracking
 * Surpasses Veson IMOS voyage estimation module
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  DollarSign, Plus, Search, Ship, TrendingUp, TrendingDown,
  Anchor, MapPin, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const dynamicFrom = supabase.from as Function;

interface VoyageForm {
  voyage_id: string;
  vessel_name: string;
  route_description: string;
  load_port: string;
  discharge_port: string;
  cargo_type: string;
  cargo_quantity_mt: string;
  freight_rate: string;
  freight_revenue: string;
  demurrage_income: string;
  bunker_cost: string;
  port_charges: string;
  canal_dues: string;
  crew_cost: string;
  insurance_cost: string;
  agency_fees: string;
  other_expenses: string;
  voyage_days: string;
  sea_days: string;
  port_days: string;
  status: string;
}

const emptyForm: VoyageForm = {
  voyage_id: '', vessel_name: '', route_description: '', load_port: '',
  discharge_port: '', cargo_type: '', cargo_quantity_mt: '', freight_rate: '',
  freight_revenue: '', demurrage_income: '', bunker_cost: '', port_charges: '',
  canal_dues: '', crew_cost: '', insurance_cost: '', agency_fees: '',
  other_expenses: '', voyage_days: '', sea_days: '', port_days: '', status: 'estimated'
};

export function VoyagePnLManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<VoyageForm>(emptyForm);
  const queryClient = useQueryClient();

  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ['voyage-pnl'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('voyage_pnl')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (form: VoyageForm) => {
      const rev = (Number(form.freight_revenue) || 0) + (Number(form.demurrage_income) || 0);
      const exp = [form.bunker_cost, form.port_charges, form.canal_dues, form.crew_cost, form.insurance_cost, form.agency_fees, form.other_expenses]
        .reduce((s, v) => s + (Number(v) || 0), 0);
      const voyageDays = Number(form.voyage_days) || 1;
      const tce = voyageDays > 0 ? (rev - exp) / voyageDays : 0;

      const { error } = await dynamicFrom('voyage_pnl').insert({
        voyage_id: form.voyage_id || `VOY-${Date.now().toString(36).toUpperCase()}`,
        vessel_name: form.vessel_name,
        route_description: form.route_description || null,
        load_port: form.load_port || null,
        discharge_port: form.discharge_port || null,
        cargo_type: form.cargo_type || null,
        cargo_quantity_mt: Number(form.cargo_quantity_mt) || null,
        freight_rate: Number(form.freight_rate) || null,
        freight_revenue: Number(form.freight_revenue) || 0,
        demurrage_income: Number(form.demurrage_income) || 0,
        total_revenue: rev,
        bunker_cost: Number(form.bunker_cost) || 0,
        port_charges: Number(form.port_charges) || 0,
        canal_dues: Number(form.canal_dues) || 0,
        crew_cost: Number(form.crew_cost) || 0,
        insurance_cost: Number(form.insurance_cost) || 0,
        agency_fees: Number(form.agency_fees) || 0,
        other_expenses: Number(form.other_expenses) || 0,
        total_expenses: exp,
        net_profit: rev - exp,
        tce_rate: tce,
        voyage_days: Number(form.voyage_days) || null,
        sea_days: Number(form.sea_days) || null,
        port_days: Number(form.port_days) || null,
        status: form.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyage-pnl'] });
      toast.success('Voyage P&L registrado');
      setIsFormOpen(false);
      setFormData(emptyForm);
    },
    onError: () => toast.error('Erro ao registrar'),
  });

  const stats = useMemo(() => {
    const totalRev = voyages.reduce((s: number, v: Record<string, unknown>) => s + (Number(v.total_revenue) || 0), 0);
    const totalExp = voyages.reduce((s: number, v: Record<string, unknown>) => s + (Number(v.total_expenses) || 0), 0);
    const totalProfit = totalRev - totalExp;
    const avgTCE = voyages.length > 0
      ? voyages.reduce((s: number, v: Record<string, unknown>) => s + (Number(v.tce_rate) || 0), 0) / voyages.length
      : 0;
    const profitableCount = voyages.filter((v: Record<string, unknown>) => (Number(v.net_profit) || 0) > 0).length;
    const margin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

    // Chart data: top 10 voyages
    const chartData = voyages.slice(0, 10).map((v: Record<string, unknown>) => ({
      name: String(v.voyage_id || '').slice(-8),
      revenue: Number(v.total_revenue) || 0,
      expenses: Number(v.total_expenses) || 0,
      profit: Number(v.net_profit) || 0,
    }));

    return { totalRev, totalExp, totalProfit, avgTCE, profitableCount, margin, chartData, total: voyages.length };
  }, [voyages]);

  const filtered = voyages.filter((v: Record<string, unknown>) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = String(v.vessel_name || '').toLowerCase().includes(s) ||
      String(v.voyage_id || '').toLowerCase().includes(s) ||
      String(v.load_port || '').toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    estimated: { label: 'Estimado', variant: 'secondary' },
    in_progress: { label: 'Em Andamento', variant: 'default' },
    completed: { label: 'Concluído', variant: 'outline' },
    closed: { label: 'Fechado', variant: 'outline' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />Voyage P&L
          </h2>
          <p className="text-muted-foreground">Rentabilidade por viagem — TCE & Margem</p>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Viagem
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Receita Total</p>
          <p className="text-lg font-bold text-success">{fmt(stats.totalRev)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Despesas</p>
          <p className="text-lg font-bold text-destructive">{fmt(stats.totalExp)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Lucro Líquido</p>
          <p className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(stats.totalProfit)}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">TCE Médio</p>
          <p className="text-lg font-bold">{fmt(stats.avgTCE)}/dia</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Margem</p>
          <p className={`text-lg font-bold ${stats.margin >= 0 ? 'text-success' : 'text-destructive'}`}>{stats.margin.toFixed(1)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Lucrativas</p>
          <p className="text-lg font-bold">{stats.profitableCount}/{stats.total}</p>
        </CardContent></Card>
      </div>

      {/* Chart */}
      {stats.chartData.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Receita vs Despesas por Viagem</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Despesas" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar viagem..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="estimated">Estimado</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voyages List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma viagem registrada</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((v: Record<string, unknown>) => {
            const profit = Number(v.net_profit) || 0;
            const rev = Number(v.total_revenue) || 0;
            const exp = Number(v.total_expenses) || 0;
            const margin = rev > 0 ? (profit / rev) * 100 : 0;
            const isProfitable = profit >= 0;
            const sl = statusLabels[String(v.status)] || { label: String(v.status), variant: 'outline' as const };

            return (
              <Card key={String(v.id)} className={`border-l-4 ${isProfitable ? 'border-l-success' : 'border-l-destructive'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-sm">{String(v.voyage_id)}</span>
                        <Badge variant={sl.variant}>{sl.label}</Badge>
                        {v.cargo_type ? <Badge variant="outline" className="text-xs">{String(v.cargo_type)}</Badge> : null}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Embarcação</p>
                          <p className="text-sm font-medium">{String(v.vessel_name)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rota</p>
                          <p className="text-sm">{v.load_port && v.discharge_port ? `${String(v.load_port)} → ${String(v.discharge_port)}` : String(v.route_description || '—')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">TCE</p>
                          <p className="text-sm font-medium">{fmt(Number(v.tce_rate) || 0)}/dia</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dias</p>
                          <p className="text-sm">{v.voyage_days ? `${v.voyage_days}d (${v.sea_days || 0} mar / ${v.port_days || 0} porto)` : '—'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 justify-end">
                        {isProfitable ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                        <span className={`text-xl font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>{fmt(profit)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Margem: {margin.toFixed(1)}%</p>
                      <div className="flex gap-3 mt-1 text-xs">
                        <span className="text-success">↑ {fmt(rev)}</span>
                        <span className="text-destructive">↓ {fmt(exp)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Estimativa de Viagem</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Voyage ID</Label><Input value={formData.voyage_id} onChange={e => setFormData(p => ({ ...p, voyage_id: e.target.value }))} placeholder="Auto-gerado" /></div>
              <div><Label>Embarcação *</Label><Input value={formData.vessel_name} onChange={e => setFormData(p => ({ ...p, vessel_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Porto Carga</Label><Input value={formData.load_port} onChange={e => setFormData(p => ({ ...p, load_port: e.target.value }))} /></div>
              <div><Label>Porto Descarga</Label><Input value={formData.discharge_port} onChange={e => setFormData(p => ({ ...p, discharge_port: e.target.value }))} /></div>
              <div><Label>Tipo de Carga</Label><Input value={formData.cargo_type} onChange={e => setFormData(p => ({ ...p, cargo_type: e.target.value }))} /></div>
            </div>

            <h4 className="font-semibold text-sm mt-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" />Receitas (USD)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Frete</Label><Input type="number" value={formData.freight_revenue} onChange={e => setFormData(p => ({ ...p, freight_revenue: e.target.value }))} /></div>
              <div><Label>Demurrage</Label><Input type="number" value={formData.demurrage_income} onChange={e => setFormData(p => ({ ...p, demurrage_income: e.target.value }))} /></div>
              <div><Label>Freight Rate</Label><Input type="number" value={formData.freight_rate} onChange={e => setFormData(p => ({ ...p, freight_rate: e.target.value }))} placeholder="$/MT" /></div>
            </div>

            <h4 className="font-semibold text-sm mt-2 flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" />Despesas (USD)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bunker</Label><Input type="number" value={formData.bunker_cost} onChange={e => setFormData(p => ({ ...p, bunker_cost: e.target.value }))} /></div>
              <div><Label>Taxas Portuárias</Label><Input type="number" value={formData.port_charges} onChange={e => setFormData(p => ({ ...p, port_charges: e.target.value }))} /></div>
              <div><Label>Canais</Label><Input type="number" value={formData.canal_dues} onChange={e => setFormData(p => ({ ...p, canal_dues: e.target.value }))} /></div>
              <div><Label>Tripulação</Label><Input type="number" value={formData.crew_cost} onChange={e => setFormData(p => ({ ...p, crew_cost: e.target.value }))} /></div>
              <div><Label>Seguro</Label><Input type="number" value={formData.insurance_cost} onChange={e => setFormData(p => ({ ...p, insurance_cost: e.target.value }))} /></div>
              <div><Label>Agência</Label><Input type="number" value={formData.agency_fees} onChange={e => setFormData(p => ({ ...p, agency_fees: e.target.value }))} /></div>
            </div>

            <h4 className="font-semibold text-sm mt-2">Duração</h4>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Total (dias)</Label><Input type="number" value={formData.voyage_days} onChange={e => setFormData(p => ({ ...p, voyage_days: e.target.value }))} /></div>
              <div><Label>Dias no Mar</Label><Input type="number" value={formData.sea_days} onChange={e => setFormData(p => ({ ...p, sea_days: e.target.value }))} /></div>
              <div><Label>Dias no Porto</Label><Input type="number" value={formData.port_days} onChange={e => setFormData(p => ({ ...p, port_days: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending || !formData.vessel_name}>
              {saveMutation.isPending ? 'Salvando...' : 'Registrar Viagem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
