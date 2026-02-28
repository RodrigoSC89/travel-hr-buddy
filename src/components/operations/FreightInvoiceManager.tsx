/**
 * Freight Invoice Manager v3 - vs Veson IMOS
 * v3: Revenue Analytics, Aging Report, Payment Trends, AR Radar, DSO Tracking
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, FileText, Send, CheckCircle, Clock, AlertTriangle,
  Plus, Download, Filter, Loader2, TrendingUp, BarChart3, Gauge
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import { differenceInDays, format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  type: string;
  vessel_name: string;
  voyage_ref: string;
  counterparty: string;
  currency: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  notes: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  sent: "bg-primary/20 text-primary",
  acknowledged: "bg-accent/20 text-accent-foreground",
  disputed: "bg-destructive/20 text-destructive",
  paid: "bg-success/20 text-success",
  overdue: "bg-destructive/20 text-destructive",
};

const typeLabels: Record<string, string> = {
  freight: "Freight", demurrage: "Demurrage", despatch: "Despatch",
  hire: "Hire Statement", bunker: "Bunker", port_disbursement: "Port DA",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(210,70%,55%)", "hsl(280,60%,55%)"];

export function FreightInvoiceManager() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mainTab, setMainTab] = useState("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["freight-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error || !data) return [];

      return data.map((inv): Invoice => ({
        id: inv.id,
        invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 6)}`,
        type: (inv.metadata as Record<string, unknown>)?.invoice_type as string || "freight",
        vessel_name: (inv.metadata as Record<string, unknown>)?.vessel_name as string || "N/A",
        voyage_ref: inv.erp_reference || "",
        counterparty: (inv.metadata as Record<string, unknown>)?.counterparty as string || "N/A",
        currency: inv.currency || "USD",
        amount: Number(inv.subtotal) || 0,
        tax_amount: Number(inv.tax_amount) || 0,
        total_amount: Number(inv.total_amount) || 0,
        status: inv.status || "draft",
        issue_date: inv.issued_at?.slice(0, 10) || inv.created_at?.slice(0, 10) || "",
        due_date: inv.due_at?.slice(0, 10) || "",
        payment_terms: inv.payment_terms || "30 days",
        notes: inv.notes || "",
      }));
    },
  });

  const filtered = useMemo(() => {
    let result = filterStatus === "all" ? invoices : invoices.filter(i => i.status === filterStatus);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(i => i.invoice_number.toLowerCase().includes(q) || i.vessel_name.toLowerCase().includes(q) || i.counterparty.toLowerCase().includes(q));
    }
    return result;
  }, [invoices, filterStatus, searchTerm]);

  // === V3 ANALYTICS ===
  const analytics = useMemo(() => {
    const totalReceivable = invoices.filter(i => ["sent", "pending", "overdue"].includes(i.status)).reduce((s, i) => s + i.total_amount, 0);
    const totalDisputed = invoices.filter(i => i.status === "disputed").reduce((s, i) => s + i.total_amount, 0);
    const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);
    const totalRevenue = invoices.reduce((s, i) => s + i.total_amount, 0);

    // Type distribution
    const typeDist = Object.entries(typeLabels).map(([key, label]) => {
      const typeInvs = invoices.filter(i => i.type === key);
      return { name: label, count: typeInvs.length, value: typeInvs.reduce((s, i) => s + i.total_amount, 0) };
    }).filter(t => t.count > 0);

    // Status pipeline
    const statusPipeline = ['draft', 'pending', 'sent', 'acknowledged', 'paid', 'disputed', 'overdue'].map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      count: invoices.filter(i => i.status === s).length,
      value: invoices.filter(i => i.status === s).reduce((sum, i) => sum + i.total_amount, 0),
    })).filter(s => s.count > 0);

    // Monthly revenue trend
    const monthly: Record<string, { revenue: number; count: number; paid: number }> = {};
    invoices.forEach(inv => {
      const m = inv.issue_date?.substring(0, 7);
      if (!m) return;
      if (!monthly[m]) monthly[m] = { revenue: 0, count: 0, paid: 0 };
      monthly[m].revenue += inv.total_amount;
      monthly[m].count++;
      if (inv.status === 'paid') monthly[m].paid += inv.total_amount;
    });
    const revenueTrend = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([m, d]) => ({ month: m.substring(5), revenue: Math.round(d.revenue), paid: Math.round(d.paid), count: d.count }));

    // Aging buckets
    const now = new Date();
    const aging = { current: 0, '30d': 0, '60d': 0, '90d': 0, '90plus': 0 };
    invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).forEach(inv => {
      const days = inv.due_date ? differenceInDays(now, new Date(inv.due_date)) : 0;
      if (days <= 0) aging.current += inv.total_amount;
      else if (days <= 30) aging['30d'] += inv.total_amount;
      else if (days <= 60) aging['60d'] += inv.total_amount;
      else if (days <= 90) aging['90d'] += inv.total_amount;
      else aging['90plus'] += inv.total_amount;
    });
    const agingData = [
      { bucket: 'Corrente', value: Math.round(aging.current) },
      { bucket: '1-30d', value: Math.round(aging['30d']) },
      { bucket: '31-60d', value: Math.round(aging['60d']) },
      { bucket: '61-90d', value: Math.round(aging['90d']) },
      { bucket: '90+d', value: Math.round(aging['90plus']) },
    ];

    // DSO (Days Sales Outstanding)
    const paidInvs = invoices.filter(i => i.status === 'paid' && i.issue_date && i.due_date);
    const avgDSO = paidInvs.length > 0 ? Math.round(paidInvs.reduce((s, i) => s + Math.abs(differenceInDays(new Date(i.due_date), new Date(i.issue_date))), 0) / paidInvs.length) : 30;

    // AR Health Radar
    const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
    const disputeRate = totalRevenue > 0 ? 100 - (totalDisputed / totalRevenue) * 100 : 100;
    const overdueInvs = invoices.filter(i => i.status === 'overdue');
    const onTimeRate = invoices.length > 0 ? Math.max(0, 100 - (overdueInvs.length / invoices.length) * 100) : 100;
    
    const radarData = [
      { metric: 'Cobrança', value: Math.min(100, collectionRate) },
      { metric: 'Sem Disputa', value: Math.min(100, disputeRate) },
      { metric: 'Pontualidade', value: Math.min(100, onTimeRate) },
      { metric: 'Volume', value: Math.min(100, (invoices.length / 50) * 100) },
      { metric: 'DSO Score', value: Math.min(100, Math.max(0, 100 - avgDSO)) },
      { metric: 'Diversidade', value: Math.min(100, typeDist.length * 25) },
    ];

    // Top counterparties
    const cpMap: Record<string, { revenue: number; count: number }> = {};
    invoices.forEach(inv => {
      const cp = inv.counterparty || 'N/A';
      if (!cpMap[cp]) cpMap[cp] = { revenue: 0, count: 0 };
      cpMap[cp].revenue += inv.total_amount;
      cpMap[cp].count++;
    });
    const topCounterparties = Object.entries(cpMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    return { totalReceivable, totalDisputed, totalPaid, totalRevenue, typeDist, statusPipeline, revenueTrend, agingData, avgDSO, radarData, topCounterparties, collectionRate };
  }, [invoices]);

  const exportCSV = () => {
    const headers = ['Invoice #', 'Type', 'Vessel', 'Counterparty', 'Currency', 'Amount', 'Status', 'Issue Date', 'Due Date'];
    const rows = filtered.map(i => [i.invoice_number, i.type, `"${i.vessel_name}"`, `"${i.counterparty}"`, i.currency, i.total_amount, i.status, i.issue_date, i.due_date].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'freight-invoices.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Carregando faturas...</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />Freight Invoice Manager <Badge variant="outline" className="text-[10px]">v3</Badge>
          </h2>
          <p className="text-muted-foreground">Revenue Analytics · Aging Report · AR Health · DSO Tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Invoice</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          { icon: FileText, label: 'Total Invoices', value: invoices.length, color: 'text-primary' },
          { icon: DollarSign, label: 'Revenue', value: `$${(analytics.totalRevenue / 1e6).toFixed(2)}M`, color: 'text-primary' },
          { icon: Clock, label: 'Receivable', value: `$${(analytics.totalReceivable / 1000).toFixed(0)}k`, color: 'text-warning' },
          { icon: CheckCircle, label: 'Collected', value: `$${(analytics.totalPaid / 1e6).toFixed(2)}M`, color: 'text-success' },
          { icon: AlertTriangle, label: 'Disputed', value: `$${(analytics.totalDisputed / 1000).toFixed(0)}k`, color: 'text-destructive' },
          { icon: Gauge, label: 'Collection %', value: `${analytics.collectionRate.toFixed(0)}%`, color: analytics.collectionRate >= 70 ? 'text-success' : 'text-warning' },
          { icon: TrendingUp, label: 'Avg DSO', value: `${analytics.avgDSO}d`, color: analytics.avgDSO <= 45 ? 'text-success' : 'text-warning' },
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
          <TabsTrigger value="invoices">Invoices ({filtered.length})</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
          <TabsTrigger value="counterparties">Counterparties</TabsTrigger>
        </TabsList>

        {/* Invoice List */}
        <TabsContent value="invoices">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {['draft', 'pending', 'sent', 'disputed', 'paid', 'overdue'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3">Invoice #</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Vessel</th>
                    <th className="text-left py-2 px-3">Counterparty</th>
                    <th className="text-right py-2 px-3">Amount</th>
                    <th className="text-center py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Due Date</th>
                    <th className="text-center py-2 px-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma fatura encontrada</td></tr>
                    ) : filtered.map(inv => (
                      <tr key={inv.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-3 font-mono text-xs">{inv.invoice_number}</td>
                        <td className="py-2 px-3"><Badge variant="outline" className="text-xs">{typeLabels[inv.type] || inv.type}</Badge></td>
                        <td className="py-2 px-3 text-sm">{inv.vessel_name}</td>
                        <td className="py-2 px-3 text-sm">{inv.counterparty}</td>
                        <td className="py-2 px-3 text-right font-mono">{inv.currency} {inv.total_amount.toLocaleString()}</td>
                        <td className="py-2 px-3 text-center"><Badge className={statusColors[inv.status] || "bg-muted"}>{inv.status}</Badge></td>
                        <td className="py-2 px-3 text-xs">{inv.due_date}</td>
                        <td className="py-2 px-3 text-center"><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedInvoice(inv)}><Send className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* V3: Revenue Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">AR Health Radar</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue por Tipo</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {analytics.typeDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tendência Mensal de Revenue</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Faturado" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="paid" fill="hsl(var(--success))" name="Pago" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-16">Sem dados</p>}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pipeline de Status</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.statusPipeline} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={90} className="text-xs" />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Valor" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* V3: Aging Report */}
        <TabsContent value="aging">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Aging Buckets (AR)</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.agingData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="bucket" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" name="AR" radius={[4, 4, 0, 0]}>
                      {analytics.agingData.map((_, i) => (
                        <Cell key={i} fill={['hsl(var(--success))', 'hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(35,80%,55%)', 'hsl(var(--destructive))'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-sm font-semibold">Aging Summary</h3>
                {analytics.agingData.map((bucket, i) => {
                  const total = analytics.agingData.reduce((s, b) => s + b.value, 0);
                  const pct = total > 0 ? (bucket.value / total) * 100 : 0;
                  const colors = ['text-success', 'text-primary', 'text-warning', 'text-orange-500', 'text-destructive'];
                  return (
                    <div key={bucket.bucket}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`font-medium ${colors[i]}`}>{bucket.bucket}</span>
                        <span className="font-bold">${(bucket.value / 1000).toFixed(0)}k ({pct.toFixed(0)}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">DSO Médio: <span className="font-bold text-foreground">{analytics.avgDSO} dias</span></p>
                  <p className="text-xs text-muted-foreground">Collection Rate: <span className="font-bold text-foreground">{analytics.collectionRate.toFixed(0)}%</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* V3: Counterparties */}
        <TabsContent value="counterparties">
          <Card>
            <CardHeader><CardTitle className="text-sm">Top Counterparties by Revenue</CardTitle></CardHeader>
            <CardContent>
              {analytics.topCounterparties.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Sem dados</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topCounterparties.map((cp, i) => (
                    <div key={cp.name} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">#{i + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cp.name}</p>
                        <p className="text-xs text-muted-foreground">{cp.count} invoices</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(cp.revenue / 1000).toFixed(0)}k</p>
                        <Progress value={analytics.totalRevenue > 0 ? (cp.revenue / analytics.totalRevenue) * 100 : 0} className="h-1.5 w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)}>
          <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />{selectedInvoice.invoice_number}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tipo:</span> {typeLabels[selectedInvoice.type] || selectedInvoice.type}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[selectedInvoice.status]}>{selectedInvoice.status}</Badge></div>
                <div><span className="text-muted-foreground">Embarcação:</span> {selectedInvoice.vessel_name}</div>
                <div><span className="text-muted-foreground">Contraparte:</span> {selectedInvoice.counterparty}</div>
                <div><span className="text-muted-foreground">Valor:</span> {selectedInvoice.currency} {selectedInvoice.total_amount.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Vencimento:</span> {selectedInvoice.due_date}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Fechar</Button>
                <Button onClick={() => { toast.success("Invoice enviada para processamento"); setSelectedInvoice(null); }}><Send className="h-4 w-4 mr-1" />Processar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FreightInvoiceManager;