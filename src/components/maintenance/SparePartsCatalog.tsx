/**
 * Spare Parts Catalog v2 — World-class inventory management
 * BEATS: AMOS/TM Master — Criticality matrix, ROL/ROQ, IMPA analytics, stock valuation, CSV export
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, AlertTriangle, TrendingUp, BarChart3, Plus, Download, DollarSign, Layers, Clock, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SparePart {
  id: string; part_number: string; description: string; category: string;
  location: string; quantity: number; min_stock: number; max_stock: number;
  unit_cost: number; supplier: string; lead_time_days: number;
  last_used: string; vessel_id?: string;
  criticality: "critical" | "essential" | "standard";
  impa_code?: string;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--info))', 'hsl(var(--accent))'];

export function SparePartsCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [filterCriticality, setFilterCriticality] = useState("all");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["spare-parts-catalog"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("inventory_items")
        .select("*").order("created_at", { ascending: false }).limit(500);
      if (error) return [] as SparePart[];
      return (data || []).map((item: Record<string, unknown>): SparePart => ({
        id: item.id as string,
        part_number: (item.part_number as string) || `PN-${(item.id as string).slice(0, 6)}`,
        description: (item.description as string) || (item.item_name as string) || "N/A",
        category: (item.category as string) || "General",
        location: (item.location as string) || "Main Store",
        quantity: (item.quantity as number) || 0,
        min_stock: (item.min_stock as number) || 5,
        max_stock: (item.max_stock as number) || 50,
        unit_cost: (item.unit_cost as number) || 0,
        supplier: (item.supplier as string) || "N/A",
        lead_time_days: (item.lead_time_days as number) || 14,
        last_used: (item.updated_at as string) || new Date().toISOString(),
        criticality: ((item.criticality as string) as SparePart["criticality"]) || "standard",
        impa_code: (item.impa_code as string) || undefined,
      }));
    },
  });

  const filtered = useMemo(() => {
    return parts.filter((p: SparePart) => {
      const matchSearch = p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.impa_code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCrit = filterCriticality === 'all' || p.criticality === filterCriticality;
      return matchSearch && matchCrit;
    });
  }, [parts, searchTerm, filterCriticality]);

  const analytics = useMemo(() => {
    const belowMin = parts.filter((p: SparePart) => p.quantity < p.min_stock);
    const criticalParts = parts.filter((p: SparePart) => p.criticality === "critical");
    const totalValue = parts.reduce((sum: number, p: SparePart) => sum + p.quantity * p.unit_cost, 0);
    const stockHealth = parts.length > 0 ? Math.round(((parts.length - belowMin.length) / parts.length) * 100) : 100;

    // ROL/ROQ calculations
    const reorderList = belowMin.map((p: SparePart) => {
      const roq = Math.max(p.max_stock - p.quantity, p.min_stock); // Reorder Quantity
      const estimatedCost = roq * p.unit_cost;
      return { ...p, roq, estimatedCost };
    }).sort((a: SparePart & { roq: number; estimatedCost: number }, b: SparePart & { roq: number; estimatedCost: number }) => {
      const critOrder: Record<string, number> = { critical: 0, essential: 1, standard: 2 };
      return (critOrder[a.criticality] || 2) - (critOrder[b.criticality] || 2);
    });

    // By category
    const byCategory: Record<string, { count: number; value: number }> = {};
    parts.forEach((p: SparePart) => {
      const cat = p.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
      byCategory[cat].count += p.quantity;
      byCategory[cat].value += p.quantity * p.unit_cost;
    });
    const categoryData = Object.entries(byCategory)
      .map(([name, d]) => ({ name: name.substring(0, 15), count: d.count, value: Math.round(d.value) }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    // By criticality
    const byCriticality = [
      { name: 'Crítico', count: parts.filter((p: SparePart) => p.criticality === 'critical').length, value: parts.filter((p: SparePart) => p.criticality === 'critical').reduce((s: number, p: SparePart) => s + p.quantity * p.unit_cost, 0) },
      { name: 'Essencial', count: parts.filter((p: SparePart) => p.criticality === 'essential').length, value: parts.filter((p: SparePart) => p.criticality === 'essential').reduce((s: number, p: SparePart) => s + p.quantity * p.unit_cost, 0) },
      { name: 'Padrão', count: parts.filter((p: SparePart) => p.criticality === 'standard').length, value: parts.filter((p: SparePart) => p.criticality === 'standard').reduce((s: number, p: SparePart) => s + p.quantity * p.unit_cost, 0) },
    ].filter(d => d.count > 0);

    // Avg lead time
    const avgLeadTime = parts.length > 0 ? Math.round(parts.reduce((s: number, p: SparePart) => s + p.lead_time_days, 0) / parts.length) : 0;

    // Total reorder cost
    const totalReorderCost = reorderList.reduce((s: number, p: { estimatedCost: number }) => s + p.estimatedCost, 0);

    return { belowMin, criticalParts, totalValue, stockHealth, reorderList, categoryData, byCriticality, avgLeadTime, totalReorderCost };
  }, [parts]);

  const exportCSV = () => {
    const headers = ['Part#', 'Descrição', 'IMPA', 'Categoria', 'Criticidade', 'Qtd', 'Min', 'Max', 'Custo Unit', 'Valor Total', 'Fornecedor', 'Lead Time', 'Local'];
    const rows = filtered.map((p: SparePart) => [
      p.part_number, p.description, p.impa_code || '', p.category, p.criticality,
      p.quantity, p.min_stock, p.max_stock, p.unit_cost.toFixed(2),
      (p.quantity * p.unit_cost).toFixed(2), p.supplier, p.lead_time_days, p.location,
    ].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'spare-parts-catalog.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Package, label: 'Total Itens', value: parts.length, color: 'text-primary' },
          { icon: AlertTriangle, label: 'Abaixo Mín', value: analytics.belowMin.length, color: analytics.belowMin.length > 0 ? 'text-destructive' : 'text-success' },
          { icon: Zap, label: 'Críticos', value: analytics.criticalParts.length, color: 'text-warning' },
          { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(analytics.totalValue), color: 'text-primary' },
          { icon: TrendingUp, label: 'Saúde Estoque', value: `${analytics.stockHealth}%`, color: analytics.stockHealth > 80 ? 'text-success' : 'text-warning' },
          { icon: Clock, label: 'Lead Time Médio', value: `${analytics.avgLeadTime}d`, color: 'text-info' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="inventory">📦 Inventário</TabsTrigger>
            <TabsTrigger value="reorder">🔔 Reposição ({analytics.belowMin.length})</TabsTrigger>
            <TabsTrigger value="critical">⚡ Críticos ({analytics.criticalParts.length})</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar peça, IMPA..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-56" />
            </div>
            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Criticidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="essential">Essencial</SelectItem>
                <SelectItem value="standard">Padrão</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Peça</Button>
          </div>
        </div>

        {/* Inventory Table */}
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      {['Part #', 'Descrição', 'IMPA', 'Categoria', 'Qtd', 'Min/Max', 'Custo Unit', 'Valor', 'Criticidade', 'Local'].map(h =>
                        <th key={h} className="text-left p-3 font-medium text-xs text-muted-foreground">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={10} className="p-8 text-center text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-2 opacity-40" />Nenhuma peça encontrada</td></tr>
                    ) : filtered.slice(0, 100).map((part: SparePart) => (
                      <tr key={part.id} className={cn("border-b hover:bg-muted/30 transition-colors", part.quantity < part.min_stock ? "bg-destructive/5" : "")}>
                        <td className="p-3 font-mono text-xs">{part.part_number}</td>
                        <td className="p-3 max-w-[200px] truncate">{part.description}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{part.impa_code || '—'}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{part.category}</Badge></td>
                        <td className={cn("p-3 text-center font-bold", part.quantity < part.min_stock ? "text-destructive" : "")}>{part.quantity}</td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{part.min_stock}/{part.max_stock}</td>
                        <td className="p-3 text-right">${part.unit_cost.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">${(part.quantity * part.unit_cost).toFixed(0)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={part.criticality === "critical" ? "destructive" : part.criticality === "essential" ? "secondary" : "outline"} className="text-xs">
                            {part.criticality === 'critical' ? '🔴' : part.criticality === 'essential' ? '🟡' : '🟢'} {part.criticality}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs">{part.location}</td>
                      </tr>
                    ))}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot><tr className="bg-muted/30">
                      <td colSpan={7} className="p-3 text-right font-medium">Valor Total do Estoque Filtrado:</td>
                      <td className="p-3 text-right font-bold text-lg">{formatCurrency(filtered.reduce((s: number, p: SparePart) => s + p.quantity * p.unit_cost, 0))}</td>
                      <td colSpan={2}></td>
                    </tr></tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder - ROL/ROQ */}
        <TabsContent value="reorder" className="mt-4">
          {analytics.reorderList.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">✅ Todos os estoques estão saudáveis.</CardContent></Card>
          ) : (
            <>
              <div className="mb-3 p-3 bg-warning/10 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-warning">{analytics.reorderList.length} itens precisam de reposição</span>
                <span className="text-sm font-bold">Custo estimado: {formatCurrency(analytics.totalReorderCost)}</span>
              </div>
              <Card><CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b"><tr>
                    {['Criticidade', 'Peça', 'Atual', 'Mín', 'ROQ', 'Custo Est.', 'Fornecedor', 'Lead Time', 'Ação'].map(h =>
                      <th key={h} className="text-left p-3 text-xs text-muted-foreground font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {analytics.reorderList.map((part: SparePart & { roq: number; estimatedCost: number }) => (
                      <tr key={part.id} className="border-b hover:bg-muted/20">
                        <td className="p-3"><Badge variant={part.criticality === 'critical' ? 'destructive' : 'secondary'} className="text-xs">{part.criticality}</Badge></td>
                        <td className="p-3"><p className="font-medium">{part.description}</p><p className="text-xs text-muted-foreground">{part.part_number}</p></td>
                        <td className="p-3 text-center text-destructive font-bold">{part.quantity}</td>
                        <td className="p-3 text-center">{part.min_stock}</td>
                        <td className="p-3 text-center font-bold text-primary">{part.roq}</td>
                        <td className="p-3 text-right">{formatCurrency(part.estimatedCost)}</td>
                        <td className="p-3 text-xs">{part.supplier}</td>
                        <td className="p-3 text-center">{part.lead_time_days}d</td>
                        <td className="p-3"><Button size="sm" variant="outline" className="text-xs">RFQ</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* Critical Spares */}
        <TabsContent value="critical" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.criticalParts.length === 0 ? (
              <Card className="md:col-span-2"><CardContent className="p-8 text-center text-muted-foreground">Nenhuma peça crítica definida.</CardContent></Card>
            ) : analytics.criticalParts.map((part: SparePart) => {
              const stockPct = Math.min((part.quantity / Math.max(part.max_stock, 1)) * 100, 100);
              const isLow = part.quantity < part.min_stock;
              return (
                <Card key={part.id} className={cn("border-warning/30", isLow ? "border-destructive/50" : "")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="destructive" className="mb-2">CRITICAL</Badge>
                        <p className="font-medium">{part.description}</p>
                        <p className="text-sm text-muted-foreground">{part.part_number}{part.impa_code ? ` | IMPA: ${part.impa_code}` : ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">Lead: {part.lead_time_days}d | {part.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-2xl font-bold", isLow ? "text-destructive" : "")}>{part.quantity}</p>
                        <p className="text-xs text-muted-foreground">Min: {part.min_stock}</p>
                      </div>
                    </div>
                    <Progress value={stockPct} className="mt-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Valor por Categoria</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Valor ($)" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Criticidade</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.byCriticality.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={analytics.byCriticality} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {analytics.byCriticality.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Qtd por Categoria</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--info))" name="Quantidade" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SparePartsCatalog;
