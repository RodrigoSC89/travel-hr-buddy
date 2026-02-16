/**
 * Bunker Management - World-class fuel operations tracking
 * Surpasses DNV ShipManager & BASSnet bunker modules
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Fuel, Plus, Search, Ship, Droplets, DollarSign, Thermometer, FlaskConical, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FUEL_TYPES = ['VLSFO', 'HFO', 'MGO', 'MDO', 'LSMGO'] as const;
const QUALITY_STATUS = { pending: 'Pendente', passed: 'Aprovado', failed: 'Reprovado' };
const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

const dynamicFrom = supabase.from as Function;

interface BunkerForm {
  vessel_name: string;
  port_name: string;
  operation_type: string;
  fuel_type: string;
  quantity_mt: string;
  unit_price: string;
  supplier: string;
  bdn_number: string;
  rob_before: string;
  rob_after: string;
  density: string;
  sulfur_content: string;
  viscosity: string;
  temperature: string;
  sample_number: string;
  quality_status: string;
  operation_date: string;
  notes: string;
}

const emptyForm: BunkerForm = {
  vessel_name: '', port_name: '', operation_type: 'receiving', fuel_type: 'VLSFO',
  quantity_mt: '', unit_price: '', supplier: '', bdn_number: '', rob_before: '',
  rob_after: '', density: '', sulfur_content: '', viscosity: '', temperature: '',
  sample_number: '', quality_status: 'pending', operation_date: '', notes: ''
};

export function BunkerManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BunkerForm>(emptyForm);
  const queryClient = useQueryClient();

  const { data: bunkers = [], isLoading } = useQuery({
    queryKey: ['bunker-operations'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('bunker_operations')
        .select('*')
        .order('operation_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (form: BunkerForm) => {
      const qty = Number(form.quantity_mt) || 0;
      const price = Number(form.unit_price) || 0;
      const { error } = await dynamicFrom('bunker_operations').insert({
        vessel_name: form.vessel_name,
        port_name: form.port_name,
        operation_type: form.operation_type,
        fuel_type: form.fuel_type,
        quantity_mt: qty,
        unit_price: price,
        total_cost: qty * price,
        supplier: form.supplier || null,
        bdn_number: form.bdn_number || null,
        rob_before: Number(form.rob_before) || null,
        rob_after: Number(form.rob_after) || null,
        density: Number(form.density) || null,
        sulfur_content: Number(form.sulfur_content) || null,
        viscosity: Number(form.viscosity) || null,
        temperature: Number(form.temperature) || null,
        sample_number: form.sample_number || null,
        quality_status: form.quality_status,
        operation_date: form.operation_date || new Date().toISOString(),
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bunker-operations'] });
      toast.success('Operação de bunker registrada');
      setIsFormOpen(false);
      setFormData(emptyForm);
    },
    onError: () => toast.error('Erro ao registrar operação'),
  });

  const stats = useMemo(() => {
    const totalQty = bunkers.reduce((s: number, b: Record<string, unknown>) => s + (Number(b.quantity_mt) || 0), 0);
    const totalCost = bunkers.reduce((s: number, b: Record<string, unknown>) => s + (Number(b.total_cost) || 0), 0);
    const avgPrice = bunkers.length > 0 ? totalCost / totalQty : 0;
    const byType = FUEL_TYPES.map(ft => ({
      name: ft,
      value: bunkers.filter((b: Record<string, unknown>) => b.fuel_type === ft)
        .reduce((s: number, b: Record<string, unknown>) => s + (Number(b.quantity_mt) || 0), 0)
    })).filter(t => t.value > 0);
    return { totalQty, totalCost, avgPrice, byType, count: bunkers.length };
  }, [bunkers]);

  const filtered = bunkers.filter((b: Record<string, unknown>) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = String(b.vessel_name || '').toLowerCase().includes(s) ||
      String(b.port_name || '').toLowerCase().includes(s) ||
      String(b.supplier || '').toLowerCase().includes(s);
    const matchFuel = fuelFilter === 'all' || b.fuel_type === fuelFilter;
    return matchSearch && matchFuel;
  });

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6 text-primary" />Gestão de Bunker
          </h2>
          <p className="text-muted-foreground">Operações de combustível — MARPOL Annex VI</p>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nova Operação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><Droplets className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Recebido</p><p className="text-xl font-bold">{stats.totalQty.toFixed(1)} MT</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-warning/10 rounded-lg"><DollarSign className="h-5 w-5 text-warning" /></div>
          <div><p className="text-xs text-muted-foreground">Custo Total</p><p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg"><TrendingUp className="h-5 w-5 text-success" /></div>
          <div><p className="text-xs text-muted-foreground">Preço Médio</p><p className="text-xl font-bold">{formatCurrency(stats.avgPrice)}/MT</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg"><FileText className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-xs text-muted-foreground">Operações</p><p className="text-xl font-bold">{stats.count}</p></div>
        </CardContent></Card>
      </div>

      {/* Charts */}
      {stats.byType.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Consumo por Tipo</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byType}><CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" /><YAxis className="text-xs" />
                  <Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={stats.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byType.map((entry, i) => <Cell key={`cell-${entry.name}-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={fuelFilter} onValueChange={setFuelFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Combustível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Fuel className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma operação de bunker</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b">
                  <th className="text-left p-3 text-xs text-muted-foreground">Data</th>
                  <th className="text-left p-3 text-xs text-muted-foreground">Embarcação</th>
                  <th className="text-left p-3 text-xs text-muted-foreground">Porto</th>
                  <th className="text-center p-3 text-xs text-muted-foreground">Tipo</th>
                  <th className="text-right p-3 text-xs text-muted-foreground">Qtd (MT)</th>
                  <th className="text-right p-3 text-xs text-muted-foreground">Preço/MT</th>
                  <th className="text-right p-3 text-xs text-muted-foreground">Total</th>
                  <th className="text-center p-3 text-xs text-muted-foreground">S%</th>
                  <th className="text-center p-3 text-xs text-muted-foreground">Qualidade</th>
                </tr></thead>
                <tbody>
                  {filtered.slice(0, 50).map((b: Record<string, unknown>) => (
                    <tr key={String(b.id)} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-3 text-sm">{b.operation_date ? new Date(String(b.operation_date)).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="p-3 text-sm font-medium">{String(b.vessel_name)}</td>
                      <td className="p-3 text-sm">{String(b.port_name)}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{String(b.fuel_type)}</Badge></td>
                      <td className="p-3 text-right text-sm font-medium">{Number(b.quantity_mt).toFixed(1)}</td>
                      <td className="p-3 text-right text-sm">{formatCurrency(Number(b.unit_price) || 0)}</td>
                      <td className="p-3 text-right text-sm font-bold">{formatCurrency(Number(b.total_cost) || 0)}</td>
                      <td className="p-3 text-center text-sm">{b.sulfur_content ? `${Number(b.sulfur_content).toFixed(2)}%` : '—'}</td>
                      <td className="p-3 text-center">
                        <Badge variant={String(b.quality_status) === 'passed' ? 'default' : String(b.quality_status) === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                          {QUALITY_STATUS[String(b.quality_status) as keyof typeof QUALITY_STATUS] || String(b.quality_status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Operação de Bunker</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Embarcação *</Label><Input value={formData.vessel_name} onChange={e => setFormData(p => ({ ...p, vessel_name: e.target.value }))} /></div>
              <div><Label>Porto *</Label><Input value={formData.port_name} onChange={e => setFormData(p => ({ ...p, port_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo Combustível</Label>
                <Select value={formData.fuel_type} onValueChange={v => setFormData(p => ({ ...p, fuel_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="datetime-local" value={formData.operation_date} onChange={e => setFormData(p => ({ ...p, operation_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Quantidade (MT) *</Label><Input type="number" value={formData.quantity_mt} onChange={e => setFormData(p => ({ ...p, quantity_mt: e.target.value }))} /></div>
              <div><Label>Preço/MT (USD)</Label><Input type="number" value={formData.unit_price} onChange={e => setFormData(p => ({ ...p, unit_price: e.target.value }))} /></div>
              <div><Label>Teor Enxofre %</Label><Input type="number" step="0.01" value={formData.sulfur_content} onChange={e => setFormData(p => ({ ...p, sulfur_content: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ROB Antes (MT)</Label><Input type="number" value={formData.rob_before} onChange={e => setFormData(p => ({ ...p, rob_before: e.target.value }))} /></div>
              <div><Label>ROB Após (MT)</Label><Input type="number" value={formData.rob_after} onChange={e => setFormData(p => ({ ...p, rob_after: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fornecedor</Label><Input value={formData.supplier} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} /></div>
              <div><Label>BDN Nº</Label><Input value={formData.bdn_number} onChange={e => setFormData(p => ({ ...p, bdn_number: e.target.value }))} /></div>
            </div>
            <div><Label>Notas</Label><Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending || !formData.vessel_name || !formData.port_name || !formData.quantity_mt}>
              {saveMutation.isPending ? 'Salvando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
