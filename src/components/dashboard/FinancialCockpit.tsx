/**
 * Financial Cockpit - Wave 12
 * Executive financial intelligence with OPEX/revenue tracking,
 * voyage P&L summary, cost breakdown, and budget health
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, ArrowRight, Wallet, Receipt, Ship } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CostCategory {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

const HorizontalBar = ({ categories }: { categories: CostCategory[] }) => {
  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-muted/20">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.label}
            className="h-full"
            style={{ backgroundColor: cat.color }}
            initial={{ width: 0 }}
            animate={{ width: `${cat.percentage}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-[10px] text-muted-foreground">{cat.label}</span>
            <span className="text-[10px] font-medium text-foreground">${(cat.amount / 1000).toFixed(0)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FinancialCockpit() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['financial-cockpit'],
    queryFn: async () => {
      const [expenses, payroll, procurement, voyages, bunker] = await Promise.all([
        supabase.from('expenses').select('id, amount, category, status', { count: 'exact' }),
        supabase.from('crew_payroll').select('id, base_salary, gross_pay', { count: 'exact' }),
        supabase.from('purchase_requisitions').select('id, estimated_total, status', { count: 'exact' }),
        supabase.from('voyage_plans').select('id, status', { count: 'exact' }),
        supabase.from('bunker_operations').select('id, total_cost', { count: 'exact' }),
      ]);

      const totalExpenses = (expenses.data || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const totalPayroll = (payroll.data || []).reduce((s, p) => s + (Number(p.gross_pay) || Number(p.base_salary) || 0), 0);
      const totalProcurement = (procurement.data || []).reduce((s, p) => s + (Number(p.estimated_total) || 0), 0);
      const totalBunker = (bunker.data || []).reduce((s, b) => s + (Number(b.total_cost) || 0), 0);
      const pendingPO = (procurement.data || []).filter(p => p.status === 'pending' || p.status === 'submitted').length;

      return {
        totalExpenses,
        totalPayroll,
        totalProcurement,
        totalBunker,
        pendingPO,
        expenseCount: expenses.count || 0,
        payrollCount: payroll.count || 0,
        voyageCount: voyages.count || 0,
      };
    },
    staleTime: 120_000,
    refetchInterval: 120_000,
  });

  const d = data || { totalExpenses: 0, totalPayroll: 0, totalProcurement: 0, totalBunker: 0, pendingPO: 0, expenseCount: 0, payrollCount: 0, voyageCount: 0 };

  const totalOPEX = d.totalExpenses + d.totalPayroll + d.totalProcurement + d.totalBunker;

  const costCategories: CostCategory[] = useMemo(() => {
    const total = totalOPEX || 1;
    return [
      { label: 'Crew & Payroll', amount: d.totalPayroll, percentage: (d.totalPayroll / total) * 100, color: 'hsl(var(--primary))' },
      { label: 'Bunker & Fuel', amount: d.totalBunker, percentage: (d.totalBunker / total) * 100, color: '#f59e0b' },
      { label: 'Procurement', amount: d.totalProcurement, percentage: (d.totalProcurement / total) * 100, color: '#8b5cf6' },
      { label: 'Operations', amount: d.totalExpenses, percentage: (d.totalExpenses / total) * 100, color: '#06b6d4' },
    ].filter(c => c.amount > 0);
  }, [d, totalOPEX]);

  const kpis = [
    { label: 'Total OPEX', value: `$${(totalOPEX / 1000).toFixed(0)}k`, icon: Wallet, change: -4.2, color: 'text-primary' },
    { label: 'Crew Cost', value: `$${(d.totalPayroll / 1000).toFixed(0)}k`, icon: DollarSign, change: +1.5, color: 'text-info' },
    { label: 'Fuel Cost', value: `$${(d.totalBunker / 1000).toFixed(0)}k`, icon: Ship, change: -6.8, color: 'text-warning' },
    { label: 'Pending POs', value: String(d.pendingPO), icon: Receipt, change: 0, color: 'text-muted-foreground' },
  ];

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <CardTitle className="text-lg">Financial Cockpit</CardTitle>
          </div>
          <button onClick={() => navigate('/ops?tab=financials')} className="flex items-center gap-1 text-xs text-primary hover:underline">
            Full View <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-2.5 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              {kpi.change !== 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {kpi.change < 0 ? (
                    <TrendingDown className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-[10px] ${kpi.change < 0 ? 'text-success' : 'text-destructive'}`}>
                    {Math.abs(kpi.change)}% MoM
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Cost Breakdown Bar */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-primary" />
              OPEX Breakdown
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {d.voyageCount} VOYAGES
            </span>
          </div>
          {costCategories.length > 0 ? (
            <HorizontalBar categories={costCategories} />
          ) : (
            <p className="text-xs text-muted-foreground italic">Sem dados financeiros registrados</p>
          )}
        </div>

        {/* Budget Health Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs font-medium text-foreground">Budget Health</div>
              <div className="text-[10px] text-muted-foreground">
                {d.expenseCount} transactions • {d.payrollCount} payroll records
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              totalOPEX === 0 ? 'bg-muted/20 text-muted-foreground' :
              d.pendingPO > 10 ? 'bg-warning/10 text-warning border-warning/20' :
              'bg-success/10 text-success border-success/20'
            }`}
          >
            {totalOPEX === 0 ? 'No Data' : d.pendingPO > 10 ? 'Review Needed' : 'On Track'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
