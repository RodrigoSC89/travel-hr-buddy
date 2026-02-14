/**
 * Spend Analytics Dashboard - Revolutionary Procurement Intelligence
 * Real-time spend analysis, category breakdown, supplier performance, savings tracking
 */
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart,
  ArrowUpRight, ArrowDownRight, Target, Zap, Award, Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export default function SpendAnalyticsDashboard() {
  // Fetch expenses for spend analysis
  const { data: expenses = [] } = useQuery({
    queryKey: ['spend-analytics-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, category, date, status, description, created_at')
        .order('date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['spend-analytics-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, company_name, rating, total_value, total_orders, lead_time_days, category')
        .eq('is_active', true)
        .order('total_value', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch RFQs
  const { data: rfqs = [] } = useQuery({
    queryKey: ['spend-analytics-rfqs'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('rfq_requests')
        .select('id, budget_estimate, status, category, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) return [];
      return data || [];
    },
    staleTime: 30000,
  });

  const analytics = useMemo(() => {
    const totalSpend = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const approvedSpend = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.amount || 0), 0);
    const pendingSpend = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount || 0), 0);

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = e.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0);
    });
    const categoryData = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value: Math.round(value) }));

    // Monthly trend
    const monthlyMap: Record<string, number> = {};
    expenses.forEach(e => {
      const d = e.date || e.created_at;
      if (!d) return;
      const month = d.substring(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + Number(e.amount || 0);
    });
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, total]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        total: Math.round(total),
      }));

    // Top suppliers by value
    const topSuppliers = suppliers.slice(0, 6).map(s => ({
      name: s.company_name?.substring(0, 20) || 'N/A',
      value: Math.round(Number(s.total_value) || 0),
      orders: Number(s.total_orders) || 0,
      rating: Number(s.rating) || 0,
      leadTime: Number(s.lead_time_days) || 0,
    }));

    // RFQ status distribution
    const rfqStatusMap: Record<string, number> = {};
    rfqs.forEach((r: Record<string, unknown>) => {
      const s = String(r.status || 'draft');
      rfqStatusMap[s] = (rfqStatusMap[s] || 0) + 1;
    });
    const rfqStatusData = Object.entries(rfqStatusMap).map(([name, value]) => ({ name, value }));

    // Savings calculation (approved vs budget estimate on RFQs)
    const totalBudgeted = rfqs.reduce((s: number, r: Record<string, unknown>) => s + Number(r.budget_estimate || 0), 0);
    const savingsPercent = totalBudgeted > 0 ? Math.round(((totalBudgeted - approvedSpend) / totalBudgeted) * 100) : 0;

    return {
      totalSpend, approvedSpend, pendingSpend,
      categoryData, monthlyTrend, topSuppliers, rfqStatusData,
      totalBudgeted, savingsPercent,
      avgOrderValue: suppliers.length > 0 ? Math.round(totalSpend / Math.max(suppliers.length, 1)) : 0,
      totalOrders: expenses.length,
      supplierCount: suppliers.length,
    };
  }, [expenses, suppliers, rfqs]);

  const formatCurrency = (v: number) => `R$ ${(v / 1000).toFixed(v >= 1000000 ? 0 : 1)}k`;

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="h-5 w-5 text-primary" /></div>
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                  <ArrowUpRight className="h-3 w-3 mr-1" />+12%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Spend Total</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(analytics.totalSpend)}</p>
              <p className="text-xs text-muted-foreground mt-1">{analytics.totalOrders} transações</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-success/10 rounded-lg"><Target className="h-5 w-5 text-success" /></div>
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">{analytics.savingsPercent}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Savings Rate</p>
              <p className="text-2xl font-bold mt-1">{analytics.savingsPercent}%</p>
              <p className="text-xs text-muted-foreground mt-1">vs orçamento estimado</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-warning/10 rounded-lg"><Package className="h-5 w-5 text-warning" /></div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(analytics.avgOrderValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{analytics.supplierCount} fornecedores</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-destructive/10 rounded-lg"><Zap className="h-5 w-5 text-destructive" /></div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendente Aprovação</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(analytics.pendingSpend)}</p>
              <p className="text-xs text-muted-foreground mt-1">aguardando processo</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />Evolução Mensal de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.monthlyTrend}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Total']} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#spendGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                Registre despesas para visualizar tendências
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <RechartsPie>
                    <Pie data={analytics.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {analytics.categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {analytics.categoryData.slice(0, 6).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs truncate flex-1">{cat.name}</span>
                      <span className="text-xs font-semibold">R$ {(cat.value / 1000).toFixed(1)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Sem dados de categorias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />Top Fornecedores por Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topSuppliers.length > 0 ? (
            <div className="space-y-3">
              {analytics.topSuppliers.map((supplier, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{supplier.name}</span>
                      <span className="text-sm font-bold">R$ {(supplier.value / 1000).toFixed(1)}k</span>
                    </div>
                    <Progress value={analytics.topSuppliers[0]?.value > 0 ? (supplier.value / analytics.topSuppliers[0].value) * 100 : 0} className="h-2" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{supplier.orders} pedidos</span>
                    <Badge variant="outline" className="text-[10px]">⭐ {supplier.rating.toFixed(1)}</Badge>
                    <span>{supplier.leadTime}d</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-6">
              Cadastre fornecedores para ver performance
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
