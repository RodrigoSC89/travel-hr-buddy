/**
 * Inventory Criticality Dashboard v3 - World-Class
 * Stock health matrix, ROL/ROQ optimization, ABC analysis, trend charts
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, CheckCircle, XCircle, BarChart3, TrendingUp, Download, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis,
} from "recharts";

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--accent))'];

export function InventoryCriticalityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: items = [] } = useQuery({
    queryKey: ["inventory-criticality-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, name, quantity, min_quantity, criticality, category, unit_cost, status, vessel_id, impa_code")
        .order("criticality", { ascending: true })
        .limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  const analysis = useMemo(() => {
    const total = items.length;
    const critical = items.filter((i) => i.criticality === "critical" || i.criticality === "vital");
    const belowMin = items.filter((i) => i.quantity != null && i.min_quantity != null && i.quantity < i.min_quantity);
    const outOfStock = items.filter((i) => i.quantity != null && i.quantity <= 0);
    const criticalBelowMin = critical.filter((i) => i.quantity != null && i.min_quantity != null && i.quantity < i.min_quantity);
    const totalValue = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_cost || 0), 0);

    // ABC Analysis (by value)
    const itemsWithValue = items.map(i => ({
      ...i,
      totalValue: (i.quantity || 0) * (i.unit_cost || 0),
    })).sort((a, b) => b.totalValue - a.totalValue);

    const cumulativeTotal = itemsWithValue.reduce((s, i) => s + i.totalValue, 0);
    let cumSum = 0;
    const abcItems = itemsWithValue.map(i => {
      cumSum += i.totalValue;
      const pct = cumulativeTotal > 0 ? (cumSum / cumulativeTotal) * 100 : 0;
      return { ...i, abcClass: pct <= 80 ? 'A' : pct <= 95 ? 'B' : 'C' as 'A' | 'B' | 'C' };
    });
    const abcSummary = {
      A: abcItems.filter(i => i.abcClass === 'A'),
      B: abcItems.filter(i => i.abcClass === 'B'),
      C: abcItems.filter(i => i.abcClass === 'C'),
    };

    // Category distribution
    const byCriticality: Record<string, number> = {};
    items.forEach((i) => {
      const c = i.criticality || "standard";
      byCriticality[c] = (byCriticality[c] || 0) + 1;
    });

    // Category value distribution
    const byCategory: Record<string, { count: number; value: number }> = {};
    items.forEach(i => {
      const cat = i.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
      byCategory[cat].count++;
      byCategory[cat].value += (i.quantity || 0) * (i.unit_cost || 0);
    });
    const categoryChart = Object.entries(byCategory)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 8)
      .map(([name, d]) => ({ name: name.substring(0, 15), value: Math.round(d.value), count: d.count }));

    // ROL items (items needing reorder)
    const reorderItems = items
      .filter(i => i.min_quantity && i.quantity != null && i.quantity <= i.min_quantity)
      .map(i => ({
        name: (i.name || '').substring(0, 30),
        qty: i.quantity || 0,
        min: i.min_quantity || 0,
        cost: i.unit_cost || 0,
        criticality: i.criticality || 'standard',
        reorderQty: Math.max(0, (i.min_quantity || 0) * 2 - (i.quantity || 0)), // ROQ = 2x min - current
        reorderCost: Math.max(0, ((i.min_quantity || 0) * 2 - (i.quantity || 0))) * (i.unit_cost || 0),
      }))
      .sort((a, b) => {
        const critOrder: Record<string, number> = { critical: 0, vital: 1, important: 2, standard: 3 };
        return (critOrder[a.criticality] ?? 4) - (critOrder[b.criticality] ?? 4);
      })
      .slice(0, 15);

    const totalReorderCost = reorderItems.reduce((s, i) => s + i.reorderCost, 0);
    const stockHealth = total > 0 ? Math.round(((total - belowMin.length) / total) * 100) : 100;

    // Scatter data for value vs quantity
    const scatterData = items.slice(0, 100).map(i => ({
      x: i.quantity || 0,
      y: (i.unit_cost || 0),
      z: (i.quantity || 0) * (i.unit_cost || 0),
      name: (i.name || '').substring(0, 20),
    }));

    return {
      total, critical: critical.length, belowMin: belowMin.length,
      outOfStock: outOfStock.length, criticalBelowMin: criticalBelowMin.length,
      totalValue, byCriticality, criticalItems: criticalBelowMin.slice(0, 5),
      abcSummary, categoryChart, reorderItems, totalReorderCost,
      stockHealth, scatterData,
    };
  }, [items]);

  const abcPieData = [
    { name: `A (${analysis.abcSummary.A.length})`, value: analysis.abcSummary.A.reduce((s, i) => s + i.totalValue, 0) },
    { name: `B (${analysis.abcSummary.B.length})`, value: analysis.abcSummary.B.reduce((s, i) => s + i.totalValue, 0) },
    { name: `C (${analysis.abcSummary.C.length})`, value: analysis.abcSummary.C.reduce((s, i) => s + i.totalValue, 0) },
  ];

  const exportCSV = () => {
    const rows = items.map(i => [i.name, i.quantity, i.min_quantity, i.unit_cost, i.criticality, i.category, i.impa_code].join(','));
    const blob = new Blob([['Name,Qty,Min,Cost,Criticality,Category,IMPA'].join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'inventory-report.csv'; a.click();
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-warning" />Inventory Intelligence v3
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />CSV</Button>
            <Badge variant="outline" className="text-xs">{analysis.total} itens</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Stock Health", value: `${analysis.stockHealth}%`, icon: CheckCircle, color: analysis.stockHealth >= 80 ? 'text-success' : 'text-warning', bg: 'bg-success/10' },
            { label: "Críticos", value: analysis.critical, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
            { label: "Abaixo Mín.", value: analysis.belowMin, icon: XCircle, color: 'text-warning', bg: 'bg-warning/10' },
            { label: "Valor Total", value: `$${(analysis.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
            { label: "Reorder Cost", value: `$${(analysis.totalReorderCost / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-accent-foreground', bg: 'bg-accent/10' },
          ].map((kpi) => (
            <div key={kpi.label} className={`text-center p-2 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="abc" className="flex-1">ABC Analysis</TabsTrigger>
            <TabsTrigger value="reorder" className="flex-1">Reorder Queue</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Criticality bar */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Distribuição por criticidade</div>
              <div className="flex gap-1 h-5 rounded-full overflow-hidden">
                {Object.entries(analysis.byCriticality)
                  .sort((a, b) => {
                    const order: Record<string, number> = { critical: 0, vital: 1, important: 2, standard: 3, desirable: 4 };
                    return (order[a[0]] ?? 5) - (order[b[0]] ?? 5);
                  })
                  .map(([level, count]) => {
                    const colors: Record<string, string> = { critical: 'bg-destructive', vital: 'bg-warning', important: 'bg-info', standard: 'bg-success', desirable: 'bg-muted-foreground/30' };
                    return <div key={level} className={`${colors[level] || 'bg-muted'} transition-all`} style={{ flex: count }} title={`${level}: ${count}`} />;
                  })}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground"><span>Crítico</span><span>Desejável</span></div>
            </div>

            {analysis.criticalBelowMin > 0 && (
              <div className="space-y-1.5 mt-3">
                <div className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{analysis.criticalBelowMin} itens críticos abaixo do mínimo
                </div>
                {analysis.criticalItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5 border border-destructive/20">
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="text-destructive shrink-0 ml-2">{item.quantity}/{item.min_quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="abc">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={abcPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={({ name }) => name}>
                      {abcPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {[
                  { cls: 'A', items: analysis.abcSummary.A, desc: '80% do valor', color: 'text-destructive' },
                  { cls: 'B', items: analysis.abcSummary.B, desc: '15% do valor', color: 'text-warning' },
                  { cls: 'C', items: analysis.abcSummary.C, desc: '5% do valor', color: 'text-primary' },
                ].map(abc => (
                  <div key={abc.cls} className="p-2 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${abc.color}`}>Classe {abc.cls}</span>
                      <Badge variant="outline" className="text-[10px]">{abc.items.length} itens</Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{abc.desc}</div>
                    <div className="text-xs font-medium mt-1">
                      ${abc.items.reduce((s, i) => s + i.totalValue, 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reorder">
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {analysis.reorderItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Todos os itens acima do mínimo</p>
              ) : analysis.reorderItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={item.criticality === 'critical' ? 'destructive' : 'secondary'} className="text-[9px] shrink-0">
                      {item.criticality}
                    </Badge>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-destructive">{item.qty}/{item.min}</span>
                    <span className="text-primary font-medium">+{item.reorderQty}</span>
                    <span className="font-mono text-muted-foreground">${item.reorderCost.toFixed(0)}</span>
                  </div>
                </div>
              ))}
              {analysis.reorderItems.length > 0 && (
                <div className="text-xs text-right text-muted-foreground pt-1">
                  Total reorder: <span className="font-bold text-foreground">${analysis.totalReorderCost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="h-52">
              {analysis.categoryChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.categoryChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">Sem dados</p>}
            </div>
          </TabsContent>
        </Tabs>

        {analysis.total === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum item no inventário</p>
        )}
      </CardContent>
    </Card>
  );
}

export default InventoryCriticalityDashboard;
