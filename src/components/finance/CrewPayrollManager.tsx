/**
 * Crew Payroll Manager v2 - World-class maritime payroll
 * Multi-currency, ITF benchmarks, overtime analytics, cost breakdown charts
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Users, Calendar, Download, Plus, Search,
  Clock, TrendingUp, FileText, CheckCircle2, AlertCircle,
  CreditCard, Banknote, Wallet, BarChart3, PieChart as PieIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";

interface CrewPayroll {
  id: string; crew_member_id: string; vessel_id: string;
  payroll_period_start: string; payroll_period_end: string;
  base_salary: number; currency: string; days_onboard: number;
  overtime_hours: number; overtime_amount: number;
  bonuses: Record<string, unknown>[]; deductions: Record<string, unknown>[];
  allowances: Record<string, unknown>[]; gross_pay: number;
  net_pay: number; tax_amount: number; pension_contribution: number;
  payment_status: string; payment_date: string | null;
}

interface CrewMember { id: string; full_name: string; rank: string; }

const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-warning/20 text-warning border-warning/30", label: "Pendente", icon: Clock },
  processed: { color: "bg-primary/20 text-primary border-primary/30", label: "Processado", icon: CreditCard },
  paid: { color: "bg-success/20 text-success border-success/30", label: "Pago", icon: CheckCircle2 },
  cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelado", icon: AlertCircle },
  draft: { color: "bg-muted text-muted-foreground border-border", label: "Rascunho", icon: FileText },
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--info))'];

// ITF recommended minimums (USD/month) - 2024/2025 reference
const ITF_BENCHMARKS: Record<string, number> = {
  master: 6500, 'chief officer': 4800, 'chief engineer': 5200, '2nd officer': 3600,
  '2nd engineer': 3800, '3rd officer': 3000, '3rd engineer': 3200,
  bosun: 2200, 'able seaman': 1800, oiler: 1800, cook: 2000, steward: 1600,
};

export function CrewPayrollManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mainTab, setMainTab] = useState("records");

  const { data: payrolls = [], isLoading: payrollsLoading } = useQuery({
    queryKey: ["crew-payrolls"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("crew_payroll")
        .select("*").order("period_start", { ascending: false });
      if (error) throw error;
      return (data || []).map((p: Record<string, unknown>): CrewPayroll => ({
        id: p.id as string, crew_member_id: (p.crew_member_id as string) || '',
        vessel_id: (p.vessel_id as string) || '',
        payroll_period_start: (p.period_start as string) || '',
        payroll_period_end: (p.period_end as string) || '',
        base_salary: Number(p.base_salary) || 0, currency: (p.currency as string) || 'USD',
        days_onboard: 0, overtime_hours: Number(p.overtime_hours) || 0,
        overtime_amount: Number(p.overtime_amount) || 0,
        bonuses: [], deductions: Array.isArray(p.deductions) ? p.deductions : [],
        allowances: Array.isArray(p.allowances) ? p.allowances : [],
        gross_pay: Number(p.base_salary) + Number(p.overtime_amount) + Number(p.total_allowances),
        net_pay: Number(p.net_pay) || 0,
        tax_amount: Number(p.total_deductions) || 0, pension_contribution: 0,
        payment_status: (p.status as string) || 'draft',
        payment_date: (p.paid_at as string) || null,
      }));
    },
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-payroll-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crew_members").select("id, full_name, rank").eq("status", "active");
      if (error) throw error;
      return data as CrewMember[];
    },
  });

  const getCrewName = (id: string) => crewMembers.find(c => c.id === id)?.full_name || "N/A";
  const getCrewRank = (id: string) => crewMembers.find(c => c.id === id)?.rank || "";

  const filteredPayrolls = payrolls.filter((p: CrewPayroll) => {
    const crewName = getCrewName(p.crew_member_id).toLowerCase();
    const matchesSearch = crewName.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const pp = payrolls as CrewPayroll[];
    const totalPayroll = pp.reduce((s: number, p: CrewPayroll) => s + (p.net_pay || 0), 0);
    const pending = pp.filter((p: CrewPayroll) => p.payment_status === "pending" || p.payment_status === "draft").length;
    const paid = pp.filter((p: CrewPayroll) => p.payment_status === "paid").length;
    const avgSalary = pp.length > 0 ? pp.reduce((s: number, p: CrewPayroll) => s + (p.base_salary || 0), 0) / pp.length : 0;
    const totalOvertime = pp.reduce((s: number, p: CrewPayroll) => s + (p.overtime_amount || 0), 0);
    const totalBase = pp.reduce((s: number, p: CrewPayroll) => s + (p.base_salary || 0), 0);
    const totalDeductions = pp.reduce((s: number, p: CrewPayroll) => s + (p.tax_amount || 0), 0);
    const overtimeRatio = totalBase > 0 ? ((totalOvertime / totalBase) * 100) : 0;

    // Cost breakdown by rank
    const byRank: Record<string, { base: number; overtime: number; count: number }> = {};
    pp.forEach((p: CrewPayroll) => {
      const rank = getCrewRank(p.crew_member_id) || 'Other';
      if (!byRank[rank]) byRank[rank] = { base: 0, overtime: 0, count: 0 };
      byRank[rank].base += p.base_salary || 0;
      byRank[rank].overtime += p.overtime_amount || 0;
      byRank[rank].count++;
    });
    const rankData = Object.entries(byRank)
      .map(([rank, d]) => ({ rank: rank.substring(0, 15), base: Math.round(d.base), overtime: Math.round(d.overtime), avg: d.count > 0 ? Math.round(d.base / d.count) : 0 }))
      .sort((a, b) => b.base - a.base).slice(0, 10);

    // Monthly trend
    const monthly: Record<string, { net: number; overtime: number; count: number }> = {};
    pp.forEach((p: CrewPayroll) => {
      const m = p.payroll_period_start?.substring(0, 7) || '';
      if (!m) return;
      if (!monthly[m]) monthly[m] = { net: 0, overtime: 0, count: 0 };
      monthly[m].net += p.net_pay || 0;
      monthly[m].overtime += p.overtime_amount || 0;
      monthly[m].count++;
    });
    const monthlyTrend = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([month, d]) => ({ month: month.substring(5), net: Math.round(d.net), overtime: Math.round(d.overtime), headcount: d.count }));

    // Currency breakdown
    const byCurrency: Record<string, number> = {};
    pp.forEach((p: CrewPayroll) => {
      const c = p.currency || 'USD';
      byCurrency[c] = (byCurrency[c] || 0) + (p.net_pay || 0);
    });
    const currencyData = Object.entries(byCurrency).map(([name, value]) => ({ name, value: Math.round(value) }));

    // ITF comparison
    const itfComparison = Object.entries(byRank).map(([rank, d]) => {
      const avg = d.count > 0 ? d.base / d.count : 0;
      const itfMin = ITF_BENCHMARKS[rank.toLowerCase()] || 0;
      return { rank: rank.substring(0, 15), avgSalary: Math.round(avg), itfMinimum: itfMin, compliant: itfMin === 0 || avg >= itfMin };
    }).filter(r => r.avgSalary > 0);

    return { totalPayroll, pending, paid, avgSalary, totalOvertime, totalBase, totalDeductions, overtimeRatio, rankData, monthlyTrend, currencyData, itfComparison };
  }, [payrolls, crewMembers]);

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

  const exportCSV = () => {
    const headers = ['Tripulante', 'Cargo', 'Período', 'Base', 'HE Horas', 'HE Valor', 'Deduções', 'Líquido', 'Moeda', 'Status'];
    const rows = filteredPayrolls.map((p: CrewPayroll) => [
      getCrewName(p.crew_member_id), getCrewRank(p.crew_member_id),
      `${p.payroll_period_start}-${p.payroll_period_end}`,
      p.base_salary, p.overtime_hours, p.overtime_amount, p.tax_amount,
      p.net_pay, p.currency, p.payment_status
    ].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payroll-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />Gestão de Folha de Pagamento
          </h2>
          <p className="text-muted-foreground">Salários, horas extras, ITF compliance e analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Novo Período</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Wallet, label: 'Total Folha', value: formatCurrency(stats.totalPayroll), color: 'text-primary' },
          { icon: Clock, label: 'Pendentes', value: stats.pending, color: 'text-warning' },
          { icon: CheckCircle2, label: 'Pagos', value: stats.paid, color: 'text-success' },
          { icon: TrendingUp, label: 'Média Salário', value: formatCurrency(stats.avgSalary), color: 'text-info' },
          { icon: Banknote, label: 'Total H.E.', value: formatCurrency(stats.totalOvertime), color: 'text-warning' },
          { icon: BarChart3, label: 'Ratio H.E.', value: `${stats.overtimeRatio.toFixed(1)}%`, color: stats.overtimeRatio > 30 ? 'text-destructive' : 'text-success' },
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
          <TabsTrigger value="records">Registros</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="itf">ITF Compliance</TabsTrigger>
        </TabsList>

        {/* Records */}
        <TabsContent value="records">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar tripulante..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              {payrollsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredPayrolls.length === 0 ? (
                <div className="text-center py-12"><DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">Nenhum registro</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b">
                      {['Tripulante', 'Período', 'Base', 'Horas Extras', 'Deduções', 'Líquido', 'Status'].map(h =>
                        <th key={h} className="text-left p-3 text-xs text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredPayrolls.map((p: CrewPayroll) => {
                        const cfg = statusConfig[p.payment_status] || statusConfig.draft;
                        const StatusIcon = cfg.icon;
                        const ded = (p.tax_amount || 0) + (p.pension_contribution || 0);
                        return (
                          <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="p-3">
                              <p className="font-medium">{getCrewName(p.crew_member_id)}</p>
                              <p className="text-xs text-muted-foreground capitalize">{getCrewRank(p.crew_member_id)}</p>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {p.payroll_period_start ? format(new Date(p.payroll_period_start), "dd/MM") : '—'} — {p.payroll_period_end ? format(new Date(p.payroll_period_end), "dd/MM/yy") : '—'}
                            </td>
                            <td className="p-3 text-sm">{formatCurrency(p.base_salary, p.currency)}</td>
                            <td className="p-3 text-sm text-warning">
                              {p.overtime_hours > 0 ? <>{p.overtime_hours}h · {formatCurrency(p.overtime_amount, p.currency)}</> : '—'}
                            </td>
                            <td className="p-3 text-sm text-destructive">{ded > 0 ? `-${formatCurrency(ded, p.currency)}` : '—'}</td>
                            <td className="p-3 text-sm font-bold">{formatCurrency(p.net_pay, p.currency)}</td>
                            <td className="p-3"><Badge className={cn("border", cfg.color)}><StatusIcon className="h-3 w-3 mr-1" />{cfg.label}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot><tr className="bg-muted/30">
                      <td colSpan={5} className="p-3 text-right font-medium">Total Líquido:</td>
                      <td className="p-3 text-right font-bold text-lg">{formatCurrency(filteredPayrolls.reduce((s: number, p: CrewPayroll) => s + (p.net_pay || 0), 0))}</td>
                      <td></td>
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Custo Mensal da Folha</CardTitle></CardHeader>
              <CardContent className="h-72">
                {stats.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="net" fill="hsl(var(--primary))" name="Líquido" radius={[4,4,0,0]} />
                      <Bar dataKey="overtime" fill="hsl(var(--warning))" name="Horas Extras" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Custo por Cargo</CardTitle></CardHeader>
              <CardContent className="h-72">
                {stats.rankData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.rankData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="rank" type="category" className="text-xs" width={90} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="base" fill="hsl(var(--primary))" name="Base" stackId="a" />
                      <Bar dataKey="overtime" fill="hsl(var(--warning))" name="H.E." stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Moeda</CardTitle></CardHeader>
              <CardContent className="h-64">
                {stats.currencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={stats.currencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {stats.currencyData.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Headcount Mensal</CardTitle></CardHeader>
              <CardContent className="h-64">
                {stats.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="headcount" stroke="hsl(var(--success))" name="Tripulantes" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ITF Compliance */}
        <TabsContent value="itf">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Comparativo ITF - Salários Mínimos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.itfComparison.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de salário para comparação</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b">
                        {['Cargo', 'Salário Médio', 'Mínimo ITF', 'Diferença', 'Status'].map(h =>
                          <th key={h} className="text-left p-3 text-xs text-muted-foreground">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {stats.itfComparison.map(r => (
                          <tr key={r.rank} className="border-b border-border/30">
                            <td className="p-3 text-sm font-medium capitalize">{r.rank}</td>
                            <td className="p-3 text-sm">{formatCurrency(r.avgSalary)}</td>
                            <td className="p-3 text-sm">{r.itfMinimum > 0 ? formatCurrency(r.itfMinimum) : 'N/D'}</td>
                            <td className="p-3 text-sm">
                              {r.itfMinimum > 0 ? (
                                <span className={r.compliant ? 'text-success' : 'text-destructive'}>
                                  {r.compliant ? '+' : ''}{formatCurrency(r.avgSalary - r.itfMinimum)}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="p-3">
                              {r.itfMinimum > 0 ? (
                                <Badge variant={r.compliant ? 'default' : 'destructive'} className="text-xs">
                                  {r.compliant ? '✓ Conforme' : '⚠ Abaixo'}
                                </Badge>
                              ) : <Badge variant="secondary" className="text-xs">N/D</Badge>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    <strong>Nota:</strong> Valores de referência baseados nas recomendações ITF (International Transport Workers' Federation) para tripulação marítima. 
                    Os mínimos variam conforme acordo coletivo, bandeira e tipo de embarcação.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
