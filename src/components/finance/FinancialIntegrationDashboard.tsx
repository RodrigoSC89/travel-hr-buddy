/**
 * Financial Integration Dashboard
 * Hire statement reconciliation, cash flow projection per vessel,
 * budget deviation alerts, P&L comparison
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  BarChart3, ArrowUpRight, ArrowDownRight, Wallet
} from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

// Cash Flow Projection per Vessel
function CashFlowProjection() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['finance-cashflow'],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
      const { data } = await fromUntyped('expenses')
        .select('id, amount, category, created_at, vessel_id, status')
        .gte('created_at', sixMonthsAgo)
        .order('created_at', { ascending: true })
        .limit(500);
      return (data || []) as Array<{
        id: string; amount: number; category: string;
        created_at: string; vessel_id: string; status: string;
      }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['finance-invoices'],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
      const { data } = await fromUntyped('invoices')
        .select('id, total_amount, created_at, vessel_id, status')
        .gte('created_at', sixMonthsAgo)
        .order('created_at', { ascending: true })
        .limit(500);
      return (data || []) as Array<{
        id: string; total_amount: number; created_at: string;
        vessel_id: string; status: string;
      }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const chartData = useMemo(() => {
    const months: Record<string, { month: string; receita: number; despesa: number; saldo: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const key = format(startOfMonth(d), 'yyyy-MM');
      months[key] = { month: format(d, 'MMM/yy', { locale: pt }), receita: 0, despesa: 0, saldo: 0 };
    }
    for (const inv of invoices) {
      const key = format(new Date(inv.created_at), 'yyyy-MM');
      if (months[key]) months[key].receita += Number(inv.total_amount || 0);
    }
    for (const exp of expenses) {
      const key = format(new Date(exp.created_at), 'yyyy-MM');
      if (months[key]) months[key].despesa += Number(exp.amount || 0);
    }
    return Object.values(months).map(m => ({ ...m, saldo: m.receita - m.despesa }));
  }, [expenses, invoices]);

  const totalReceita = chartData.reduce((s, d) => s + d.receita, 0);
  const totalDespesa = chartData.reduce((s, d) => s + d.despesa, 0);
  const saldo = totalReceita - totalDespesa;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Fluxo de Caixa — 6 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Receita', value: totalReceita, icon: ArrowUpRight, color: 'text-green-500' },
            { label: 'Despesa', value: totalDespesa, icon: ArrowDownRight, color: 'text-destructive' },
            { label: 'Saldo', value: saldo, icon: Wallet, color: saldo >= 0 ? 'text-green-500' : 'text-destructive' },
          ].map(m => (
            <div key={m.label} className="bg-muted/30 rounded-lg p-2 text-center">
              <m.icon className={`h-3 w-3 mx-auto mb-1 ${m.color}`} />
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="text-sm font-bold">${(m.value / 1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
            <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Budget Deviation Monitor
function BudgetDeviationMonitor() {
  const { data: expenses = [] } = useQuery({
    queryKey: ['budget-deviation'],
    queryFn: async () => {
      const thisMonth = startOfMonth(new Date()).toISOString();
      const { data } = await fromUntyped('expenses')
        .select('id, amount, category, vessel_id')
        .gte('created_at', thisMonth)
        .limit(500);
      return (data || []) as Array<{ id: string; amount: number; category: string; vessel_id: string }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const categorySpend = useMemo(() => {
    const cats: Record<string, { spent: number; budget: number }> = {
      maintenance: { spent: 0, budget: 50000 },
      fuel: { spent: 0, budget: 120000 },
      crew: { spent: 0, budget: 80000 },
      provisions: { spent: 0, budget: 25000 },
      insurance: { spent: 0, budget: 40000 },
      port: { spent: 0, budget: 35000 },
    };
    for (const e of expenses) {
      const cat = (e.category || 'other').toLowerCase();
      if (cats[cat]) cats[cat].spent += Number(e.amount || 0);
      else {
        if (!cats['other']) cats['other'] = { spent: 0, budget: 20000 };
        cats['other'].spent += Number(e.amount || 0);
      }
    }
    return Object.entries(cats).map(([name, v]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      spent: v.spent,
      budget: v.budget,
      deviation: v.budget > 0 ? ((v.spent - v.budget) / v.budget * 100) : 0,
      overBudget: v.spent > v.budget,
    }));
  }, [expenses]);

  const overBudgetCount = categorySpend.filter(c => c.overBudget).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Desvio Orçamentário — Mês Atual
          </CardTitle>
          {overBudgetCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {overBudgetCount} acima do budget
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {categorySpend.map(cat => (
          <div key={cat.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>{cat.name}</span>
              <span className={cat.overBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                ${(cat.spent / 1000).toFixed(1)}k / ${(cat.budget / 1000).toFixed(0)}k
                {cat.overBudget && <span className="ml-1">({cat.deviation.toFixed(0)}%↑)</span>}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${cat.overBudget ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Hire Statement Reconciliation
function HireReconciliation() {
  const { data: hireStatements = [] } = useQuery({
    queryKey: ['hire-reconciliation'],
    queryFn: async () => {
      const { data } = await fromUntyped('tc_hire_statements')
        .select('id, vessel_id, period_from, period_to, gross_hire, deductions, net_hire, status')
        .order('period_to', { ascending: false })
        .limit(20);
      return (data || []) as Array<{
        id: string; vessel_id: string; period_from: string; period_to: string;
        gross_hire: number; deductions: number; net_hire: number; status: string;
      }>;
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: relatedInvoices = [] } = useQuery({
    queryKey: ['hire-invoices'],
    queryFn: async () => {
      const { data } = await fromUntyped('invoices')
        .select('id, total_amount, status, reference_type')
        .eq('reference_type', 'hire_statement')
        .limit(50);
      return (data || []) as Array<{ id: string; total_amount: number; status: string; reference_type: string }>;
    },
    staleTime: 1000 * 60 * 15,
  });

  const totalHire = hireStatements.reduce((s, h) => s + Number(h.net_hire || 0), 0);
  const totalInvoiced = relatedInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const gap = totalHire - totalInvoiced;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Reconciliação Hire vs Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground">Net Hire</div>
            <div className="text-sm font-bold">${(totalHire / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground">Faturado</div>
            <div className="text-sm font-bold">${(totalInvoiced / 1000).toFixed(0)}k</div>
          </div>
          <div className={`rounded-lg p-2 text-center ${Math.abs(gap) > 1000 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
            <div className="text-xs text-muted-foreground">Gap</div>
            <div className={`text-sm font-bold ${Math.abs(gap) > 1000 ? 'text-destructive' : 'text-green-500'}`}>
              ${(gap / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {hireStatements.slice(0, 8).map(hs => (
            <div key={hs.id} className="flex items-center justify-between text-xs p-1.5 bg-muted/20 rounded">
              <span>
                {hs.period_from ? format(new Date(hs.period_from), 'dd/MM') : '?'} — {hs.period_to ? format(new Date(hs.period_to), 'dd/MM/yy') : '?'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${Number(hs.net_hire || 0).toLocaleString()}</span>
                <Badge variant={hs.status === 'reconciled' ? 'outline' : 'secondary'} className="text-[9px]">
                  {hs.status || 'pendente'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Financial Integration Dashboard
export function FinancialIntegrationDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Integração Financeira Avançada</h3>
      </div>
      <Tabs defaultValue="cashflow" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="cashflow" className="text-xs">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">Desvio Budget</TabsTrigger>
          <TabsTrigger value="hire" className="text-xs">Reconciliação Hire</TabsTrigger>
        </TabsList>
        <TabsContent value="cashflow"><CashFlowProjection /></TabsContent>
        <TabsContent value="budget"><BudgetDeviationMonitor /></TabsContent>
        <TabsContent value="hire"><HireReconciliation /></TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialIntegrationDashboard;
