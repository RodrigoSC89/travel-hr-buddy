/**
 * Bunker Management v2 - World-class fuel operations
 * MARPOL Annex VI compliance + sulfur alerts + cost analytics + ROB tracking
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Fuel, Plus, Search, Ship, Droplets, DollarSign, TrendingUp, FileText, AlertTriangle, Download, BarChart3, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const FUEL_TYPES = ['VLSFO', 'HFO', 'MGO', 'MDO', 'LSMGO'] as const;
const QUALITY_STATUS = { pending: 'Pendente', passed: 'Aprovado', failed: 'Reprovado' };
const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];
const SULFUR_LIMIT_GLOBAL = 0.5; // MARPOL 2020
const SULFUR_LIMIT_ECA = 0.1; // ECA zones

const dynamicFrom = supabase.from as Function;

interface BunkerForm {
  vessel_name: string; port_name: string; operation_type: string; fuel_type: string;
  quantity_mt: string; unit_price: string; supplier: string; bdn_number: string;
  rob_before: string; rob_after: string; density: string; sulfur_content: string;
  viscosity: string; temperature: string; sample_number: string; quality_status: string;
  operation_date: string; notes: string;
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
  const [mainTab, setMainTab] = useState('operations');
  const queryClient = useQueryClient();

  const { data: bunkers = [], isLoading } = useQuery({
    queryKey: ['bunker-operations'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('bunker_operations')
        .select('*')
        .order('operation_date', { ascending: false })
        .limit(500);
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
        vessel_name: form.vessel_name, port_name: form.port_name,
        operation_type: form.operation_type, fuel_type: form.fuel_type,
        quantity_mt: qty, unit_price: price, total_cost: qty * price,
        supplier: form.supplier || null, bdn_number: form.bdn_number || null,
        rob_before: Number(form.rob_before) || null, rob_after: Number(form.rob_after) || null,
        density: Number(form.density) || null, sulfur_content: Number(form.sulfur_content) || null,
        viscosity: Number(form.viscosity) || null, temperature: Number(form.temperature) || null,
        sample_number: form.sample_number || null, quality_status: form.quality_status,
        operation_date: form.operation_date || new Date().toISOString(), notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bunker-operations'] });
      toast.success('Operação de bunker registrada');
      setIsFormOpen(false); setFormData(emptyForm);
    },
    onError: () => toast.error('Erro ao registrar operação'),
  });

  const stats = useMemo(() => {
    const b = bunkers as Record<string, unknown>[];
    const totalQty = b.reduce((s, x) => s + (Number(x.quantity_mt) || 0), 0);
    const totalCost = b.reduce((s, x) => s + (Number(x.total_cost) || 0), 0);
    const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const byType = FUEL_TYPES.map(ft => ({
      name: ft,
      qty: b.filter(x => x.fuel_type === ft).reduce((s, x) => s + (Number(x.quantity_mt) || 0), 0),
      cost: b.filter(x => x.fuel_type === ft).reduce((s, x) => s + (Number(x.total_cost) || 0), 0),
    })).filter(t => t.qty > 0);

    // Sulfur compliance
    const withSulfur = b.filter(x => x.sulfur_content);
    const nonCompliant = withSulfur.filter(x => Number(x.sulfur_content) > SULFUR_LIMIT_GLOBAL);
    const ecaViolations = withSulfur.filter(x => Number(x.sulfur_content) > SULFUR_LIMIT_ECA);
    const complianceRate = withSulfur.length > 0 ? Math.round(((withSulfur.length - nonCompliant.length) / withSulfur.length) * 100) : 100;

    // Price trend (monthly)
    const monthly = b.reduce<Record<string, { qty: number; cost: number; count: number }>>((acc, x) => {
      const m = String(x.operation_date || '').substring(0, 7);
      if (!m) return acc;
      if (!acc[m]) acc[m] = { qty: 0, cost: 0, count: 0 };
      acc[m].qty += Number(x.quantity_mt) || 0;
      acc[m].cost += Number(x.total_cost) || 0;
      acc[m].count++;
      return acc;
    }, {});
    const priceTrend = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, d]) => ({
        month: month.substring(5),
        avgPrice: d.qty > 0 ? +(d.cost / d.qty).toFixed(0) : 0,
        volume: +d.qty.toFixed(0),
        cost: +d.cost.toFixed(0),
      }));

    // Supplier ranking
    const bySup = b.reduce<Record<string, { qty: number; cost: number; ops: number }>>((acc, x) => {
      const sup = String(x.supplier || 'Desconhecido');
      if (!acc[sup]) acc[sup] = { qty: 0, cost: 0, ops: 0 };
      acc[sup].qty += Number(x.quantity_mt) || 0;
      acc[sup].cost += Number(x.total_cost) || 0;
      acc[sup].ops++;
      return acc;
    }, {});
    const suppliers = Object.entries(bySup)
      .map(([name, d]) => ({ name, ...d, avgPrice: d.qty > 0 ? +(d.cost / d.qty).toFixed(0) : 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // Quality stats
    const qPassed = b.filter(x => x.quality_status === 'passed').length;
    const qFailed = b.filter(x => x.quality_status === 'failed').length;
    const qPending = b.filter(x => x.quality_status === 'pending').length;

    return { totalQty, totalCost, avgPrice, byType, count: b.length, complianceRate, nonCompliant: nonCompliant.length, ecaViolations: ecaViolations.length, priceTrend, suppliers, qPassed, qFailed, qPending };
  }, [bunkers]);

  const filtered = bunkers.filter((b: Record<string, unknown>) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = String(b.vessel_name || '').toLowerCase().includes(s) ||
      String(b.port_name || '').toLowerCase().includes(s) ||
      String(b.supplier || '').toLowerCase().includes(s);
    const matchFuel = fuelFilter === 'all' || b.fuel_type === fuelFilter;
    return matchSearch && matchFuel;
  });

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const exportCSV = () => {
    const headers = ['Date', 'Vessel', 'Port', 'Fuel', 'Qty(MT)', 'Price/MT', 'Total', 'Sulfur%', 'Supplier', 'BDN', 'Quality'];
    const rows = filtered.map((b: Record<string, unknown>) =>
      [b.operation_date, b.vessel_name, b.port_name, b.fuel_type, b.quantity_mt, b.unit_price, b.total_cost, b.sulfur_content, b.supplier, b.bdn_number, b.quality_status].join(',')
    );
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bunker-operations.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6 text-primary" />Gestão de Bunker
          </h2>
          <p className="text-muted-foreground">MARPOL Annex VI · Rastreamento completo de combustível</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button onClick={() => { setFormData(emptyForm); setIsFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Operação</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Droplets, label: 'Volume Total', value: `${stats.totalQty.toFixed(0)} MT`, color: 'text-primary' },
          { icon: DollarSign, label: 'Custo Total', value: fmt(stats.totalCost), color: 'text-warning' },
          { icon: TrendingUp, label: 'Preço Médio', value: `${fmt(stats.avgPrice)}/MT`, color: 'text-success' },
          { icon: Gauge, label: 'Compliance S%', value: `${stats.complianceRate}%`, color: stats.complianceRate < 100 ? 'text-destructive' : 'text-success' },
          { icon: AlertTriangle, label: 'Violações S%', value: stats.nonCompliant, color: stats.nonCompliant > 0 ? 'text-destructive' : 'text-muted-foreground' },
          { icon: FileText, label: 'Operações', value: stats.count, color: 'text-accent-foreground' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="analytics">Custos & Tendências</TabsTrigger>
          <TabsTrigger value="compliance">Compliance MARPOL</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <div className="flex gap-3 flex-wrap mb-4">
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
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Carregando...</div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center"><Fuel className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhuma operação</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b">
                      {['Data', 'Embarcação', 'Porto', 'Tipo', 'Qtd (MT)', 'Preço/MT', 'Total', 'S%', 'Qualidade'].map(h =>
                        <th key={h} className="text-left p-3 text-xs text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filtered.slice(0, 50).map((b: Record<string, unknown>) => {
                        const sulfur = Number(b.sulfur_content) || 0;
                        const sulfurAlert = sulfur > SULFUR_LIMIT_GLOBAL;
                        return (
                          <tr key={String(b.id)} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="p-3 text-sm">{b.operation_date ? new Date(String(b.operation_date)).toLocaleDateString('pt-BR') : '—'}</td>
                            <td className="p-3 text-sm font-medium">{String(b.vessel_name)}</td>
                            <td className="p-3 text-sm">{String(b.port_name)}</td>
                            <td className="p-3"><Badge variant="outline" className="text-xs">{String(b.fuel_type)}</Badge></td>
                            <td className="p-3 text-right text-sm font-medium">{Number(b.quantity_mt).toFixed(1)}</td>
                            <td className="p-3 text-right text-sm">{fmt(Number(b.unit_price) || 0)}</td>
                            <td className="p-3 text-right text-sm font-bold">{fmt(Number(b.total_cost) || 0)}</td>
                            <td className="p-3 text-center text-sm">
                              {sulfur > 0 ? (
                                <span className={sulfurAlert ? 'text-destructive font-bold' : ''}>{sulfur.toFixed(2)}%{sulfurAlert && ' ⚠'}</span>
                              ) : '—'}
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant={String(b.quality_status) === 'passed' ? 'default' : String(b.quality_status) === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                                {QUALITY_STATUS[String(b.quality_status) as keyof typeof QUALITY_STATUS] || String(b.quality_status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Preço Médio Mensal (USD/MT)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {stats.priceTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" name="Preço Médio" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Volume Mensal (MT)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {stats.priceTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" name="Volume (MT)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Tipo</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={stats.byType} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {stats.byType.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Custo Mensal (USD)</CardTitle></CardHeader>
              <CardContent className="h-64">
                {stats.priceTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="cost" stroke="hsl(var(--warning))" fill="hsl(var(--warning)/0.2)" name="Custo (USD)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MARPOL Compliance */}
        <TabsContent value="compliance">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className={stats.complianceRate < 100 ? 'border-destructive/50' : 'border-success/50'}>
              <CardContent className="p-6 text-center">
                <Gauge className={`h-10 w-10 mx-auto mb-3 ${stats.complianceRate < 100 ? 'text-destructive' : 'text-success'}`} />
                <div className="text-3xl font-bold">{stats.complianceRate}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Conformidade Global (≤0.50% S)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className={`h-10 w-10 mx-auto mb-3 ${stats.nonCompliant > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div className="text-3xl font-bold">{stats.nonCompliant}</div>
                <div className="text-sm text-muted-foreground">Violações MARPOL (S% &gt; 0.50)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Ship className="h-10 w-10 mx-auto mb-3 text-warning" />
                <div className="text-3xl font-bold">{stats.ecaViolations}</div>
                <div className="text-sm text-muted-foreground">Violações ECA (S% &gt; 0.10)</div>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Qualidade de Amostras</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg bg-success/5">
                  <div className="text-2xl font-bold text-success">{stats.qPassed}</div>
                  <div className="text-xs text-muted-foreground">Aprovadas</div>
                </div>
                <div className="p-4 border rounded-lg bg-destructive/5">
                  <div className="text-2xl font-bold text-destructive">{stats.qFailed}</div>
                  <div className="text-xs text-muted-foreground">Reprovadas</div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/20">
                  <div className="text-2xl font-bold">{stats.qPending}</div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader><CardTitle className="text-sm">Ranking de Fornecedores</CardTitle></CardHeader>
            <CardContent>
              {stats.suppliers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de fornecedores</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b">
                      {['#', 'Fornecedor', 'Operações', 'Volume (MT)', 'Custo Total', 'Preço Médio/MT'].map(h =>
                        <th key={h} className="text-left p-3 text-xs text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {stats.suppliers.map((sup, i) => (
                        <tr key={sup.name} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="p-3 text-sm font-bold">{i + 1}</td>
                          <td className="p-3 text-sm font-medium">{sup.name}</td>
                          <td className="p-3 text-sm">{sup.ops}</td>
                          <td className="p-3 text-sm font-medium">{sup.qty.toFixed(0)} MT</td>
                          <td className="p-3 text-sm">{fmt(sup.cost)}</td>
                          <td className="p-3 text-sm font-bold">{fmt(sup.avgPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <div>
                <Label>Teor Enxofre %</Label>
                <Input type="number" step="0.01" value={formData.sulfur_content} onChange={e => setFormData(p => ({ ...p, sulfur_content: e.target.value }))}
                  className={Number(formData.sulfur_content) > SULFUR_LIMIT_GLOBAL ? 'border-destructive' : ''} />
                {Number(formData.sulfur_content) > SULFUR_LIMIT_GLOBAL && <p className="text-[10px] text-destructive mt-1">⚠ Acima do limite MARPOL (0.50%)</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ROB Antes (MT)</Label><Input type="number" value={formData.rob_before} onChange={e => setFormData(p => ({ ...p, rob_before: e.target.value }))} /></div>
              <div><Label>ROB Após (MT)</Label><Input type="number" value={formData.rob_after} onChange={e => setFormData(p => ({ ...p, rob_after: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fornecedor</Label><Input value={formData.supplier} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} /></div>
              <div><Label>BDN Nº</Label><Input value={formData.bdn_number} onChange={e => setFormData(p => ({ ...p, bdn_number: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Densidade</Label><Input type="number" step="0.001" value={formData.density} onChange={e => setFormData(p => ({ ...p, density: e.target.value }))} /></div>
              <div><Label>Viscosidade</Label><Input type="number" value={formData.viscosity} onChange={e => setFormData(p => ({ ...p, viscosity: e.target.value }))} /></div>
              <div><Label>Temperatura (°C)</Label><Input type="number" value={formData.temperature} onChange={e => setFormData(p => ({ ...p, temperature: e.target.value }))} /></div>
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
