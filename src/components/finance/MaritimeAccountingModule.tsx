/**
 * Maritime Accounting Module — GL, AP, AR, Journal Entries
 * Fecha o gap #4: Finance Accounting (GL/AP/AR)
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, ArrowDownCircle, ArrowUpCircle, FileText, Download,
  DollarSign, TrendingUp, TrendingDown, Calculator, Layers
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { getMaritimeChartOfAccounts, generateJournalEntries, type ChartOfAccount, type JournalEntry } from '@/lib/maritime/market-intelligence';

const COLORS = ['hsl(var(--primary))', 'hsl(210,70%,55%)', 'hsl(160,60%,45%)', 'hsl(35,80%,55%)', 'hsl(280,60%,55%)', 'hsl(0,70%,55%)'];

export function MaritimeAccountingModule() {
  const [tab, setTab] = useState('gl');
  const coa = useMemo(() => getMaritimeChartOfAccounts(), []);

  // Fetch real financial data
  const { data: invoices = [] } = useQuery({
    queryKey: ['accounting-invoices'],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('id, amount, status, invoice_type, created_at, metadata').order('created_at', { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['accounting-expenses'],
    queryFn: async () => {
      const { data } = await supabase.from('expenses').select('id, amount, category, status, created_at, description').order('created_at', { ascending: false }).limit(200);
      return data || [];
    },
  });

  // Compute AP/AR from real data
  const arData = useMemo(() => {
    const receivables = invoices.filter((i: any) => i.status === 'pending' || i.status === 'sent');
    const total = receivables.reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0);
    const aging = {
      current: receivables.filter((i: any) => {
        const days = Math.ceil((Date.now() - new Date(i.created_at).getTime()) / 86400000);
        return days <= 30;
      }).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0),
      d30_60: receivables.filter((i: any) => {
        const days = Math.ceil((Date.now() - new Date(i.created_at).getTime()) / 86400000);
        return days > 30 && days <= 60;
      }).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0),
      d60_90: receivables.filter((i: any) => {
        const days = Math.ceil((Date.now() - new Date(i.created_at).getTime()) / 86400000);
        return days > 60 && days <= 90;
      }).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0),
      over90: receivables.filter((i: any) => {
        const days = Math.ceil((Date.now() - new Date(i.created_at).getTime()) / 86400000);
        return days > 90;
      }).reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0),
    };
    return { total, count: receivables.length, aging };
  }, [invoices]);

  const apData = useMemo(() => {
    const payables = expenses.filter((e: any) => e.status === 'pending' || e.status === 'approved');
    const total = payables.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const byCategory: Record<string, number> = {};
    payables.forEach((e: any) => {
      const cat = String(e.category || 'Other');
      byCategory[cat] = (byCategory[cat] || 0) + (Number(e.amount) || 0);
    });
    return { total, count: payables.length, byCategory };
  }, [expenses]);

  const agingChart = [
    { name: '0-30d', value: arData.aging.current },
    { name: '30-60d', value: arData.aging.d30_60 },
    { name: '60-90d', value: arData.aging.d60_90 },
    { name: '90d+', value: arData.aging.over90 },
  ];

  const apChart = Object.entries(apData.byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // Group COA by type
  const coaByType = useMemo(() => {
    const groups: Record<string, ChartOfAccount[]> = {};
    coa.forEach(a => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type]!.push(a);
    });
    return groups;
  }, [coa]);

  const typeLabels: Record<string, string> = { asset: 'Ativos', liability: 'Passivos', equity: 'Patrimônio', revenue: 'Receitas', expense: 'Despesas' };
  const typeIcons: Record<string, React.ReactNode> = {
    asset: <TrendingUp className="h-4 w-4 text-success" />,
    liability: <TrendingDown className="h-4 w-4 text-destructive" />,
    revenue: <ArrowDownCircle className="h-4 w-4 text-primary" />,
    expense: <ArrowUpCircle className="h-4 w-4 text-warning" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Maritime Accounting
          </h3>
          <p className="text-sm text-muted-foreground">Razão Geral (GL) • Contas a Receber (AR) • Contas a Pagar (AP) • Lançamentos automáticos</p>
        </div>
        <Badge variant="outline" className="text-xs">IFRS / Maritime Standard</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDownCircle className="h-3.5 w-3.5" /> Contas a Receber</p>
          <p className="text-2xl font-bold text-success">${arData.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{arData.count} faturas pendentes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpCircle className="h-3.5 w-3.5" /> Contas a Pagar</p>
          <p className="text-2xl font-bold text-destructive">${apData.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{apData.count} despesas pendentes</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Net Position</p>
          <p className={`text-2xl font-bold ${arData.total - apData.total >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${(arData.total - apData.total).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">AR - AP</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Plano de Contas</p>
          <p className="text-2xl font-bold">{coa.length}</p>
          <p className="text-xs text-muted-foreground">contas marítimas</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="gl" className="gap-1"><BookOpen className="h-3.5 w-3.5" /> Razão (GL)</TabsTrigger>
          <TabsTrigger value="ar" className="gap-1"><ArrowDownCircle className="h-3.5 w-3.5" /> AR</TabsTrigger>
          <TabsTrigger value="ap" className="gap-1"><ArrowUpCircle className="h-3.5 w-3.5" /> AP</TabsTrigger>
          <TabsTrigger value="journal" className="gap-1"><FileText className="h-3.5 w-3.5" /> Lançamentos</TabsTrigger>
        </TabsList>

        {/* GL - Chart of Accounts */}
        <TabsContent value="gl" className="mt-4 space-y-4">
          {Object.entries(coaByType).map(([type, accounts]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {typeIcons[type]} {typeLabels[type] || type} ({accounts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left py-2 px-4">Código</th><th className="text-left py-2 px-4">Conta</th>
                    <th className="text-left py-2 px-4">Categoria</th><th className="text-right py-2 px-4">Moeda</th>
                  </tr></thead>
                  <tbody>
                    {accounts.map(a => (
                      <tr key={a.code} className="border-b hover:bg-muted/20">
                        <td className="py-2 px-4 font-mono text-xs">{a.code}</td>
                        <td className="py-2 px-4 font-medium">{a.name}</td>
                        <td className="py-2 px-4 text-xs text-muted-foreground">{a.category}</td>
                        <td className="py-2 px-4 text-right text-xs">{a.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AR - Aging */}
        <TabsContent value="ar" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">AR Aging Analysis</CardTitle></CardHeader>
              <CardContent>
                {arData.total === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Sem faturas pendentes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={agingChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" name="Amount" radius={[4,4,0,0]}>
                        <Cell fill="hsl(160,60%,45%)" />
                        <Cell fill="hsl(35,80%,55%)" />
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(0,70%,55%)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Receivables Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(arData.aging).map(([key, value]) => {
                  const labels: Record<string, string> = { current: '0-30 dias', d30_60: '30-60 dias', d60_90: '60-90 dias', over90: '90+ dias' };
                  const pct = arData.total > 0 ? (value / arData.total) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{labels[key]}</span>
                        <span className="font-medium">${value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AP - By Category */}
        <TabsContent value="ap" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">AP by Category</CardTitle></CardHeader>
              <CardContent>
                {apChart.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Sem despesas pendentes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={apChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {apChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Payables Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {apChart.map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {cat.name}
                      </span>
                      <span className="font-medium">${cat.value.toLocaleString()}</span>
                    </div>
                    <Progress value={apData.total > 0 ? (cat.value / apData.total) * 100 : 0} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Journal Entries - Auto mapping */}
        <TabsContent value="journal" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lançamentos Automáticos</CardTitle>
              <CardDescription>O sistema gera automaticamente lançamentos contábeis a partir de eventos operacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4">Evento Operacional</th>
                  <th className="text-left py-3 px-4">Débito</th>
                  <th className="text-left py-3 px-4">Crédito</th>
                  <th className="text-center py-3 px-4">Auto</th>
                </tr></thead>
                <tbody>
                  {[
                    { event: 'Compra de Bunker', debit: '6000 - Bunker Costs', credit: '2010 - AP Bunkers', auto: true },
                    { event: 'Fatura de Frete', debit: '1100 - AR Freight', credit: '4000 - Freight Revenue', auto: true },
                    { event: 'Port Disbursement', debit: '6010 - Port Charges', credit: '2020 - AP Port', auto: true },
                    { event: 'Folha de Tripulação', debit: '5000 - Crew Wages', credit: '2100 - Wages Payable', auto: true },
                    { event: 'TC Hire Recebido', debit: '1000 - Cash', credit: '4010 - TC Revenue', auto: true },
                    { event: 'Demurrage Invoice', debit: '1110 - AR Demurrage', credit: '4020 - Demurrage Rev', auto: true },
                    { event: 'Spare Parts Purchase', debit: '1300 - Inventory', credit: '2000 - AP Trade', auto: true },
                    { event: 'Insurance Premium', debit: '5030 - Insurance', credit: '2200 - Accrued Exp', auto: true },
                    { event: 'Depreciation', debit: '7000 - Depreciation', credit: '1500 - Vessels (NBV)', auto: false },
                    { event: 'Drydock Amortization', debit: '7010 - DD Amortization', credit: '1510 - DD Deferred', auto: false },
                  ].map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="py-3 px-4 font-medium">{row.event}</td>
                      <td className="py-3 px-4 text-xs font-mono">{row.debit}</td>
                      <td className="py-3 px-4 text-xs font-mono">{row.credit}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={row.auto ? 'default' : 'outline'} className="text-[10px]">
                          {row.auto ? '⚡ Auto' : '✋ Manual'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaritimeAccountingModule;
