/**
 * Maintenance Cost Trend - Budget vs Actual with trend analysis
 * Shows maintenance spending over time with variance alerts
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';

export function MaintenanceCostTrend() {
  const { data: costData, isLoading } = useQuery({
    queryKey: ['maintenance-cost-trend'],
    queryFn: async () => {
      // Get work orders with costs
      const { data: workOrders } = await supabase
        .from('pms_work_orders')
        .select('id, actual_cost, estimated_cost, status, created_at, actual_end')
        .order('created_at', { ascending: false })
        .limit(200);

      // Get drydock budgets
      const { data: drydocks } = await supabase
        .from('drydock_projects')
        .select('id, budget_usd, spent_usd, status, start_date');

      return { workOrders: workOrders || [], drydocks: drydocks || [] };
    },
    staleTime: 120000,
  });

  const monthlyData = useMemo(() => {
    if (!costData) return [];
    const { workOrders } = costData;
    
    // Group by month (last 6 months)
    const months: { month: string; budget: number; actual: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthKey = format(monthStart, 'yyyy-MM');
      const label = format(monthStart, 'MMM');

      const monthWOs = workOrders.filter(wo => {
        const woDate = wo.created_at ? format(new Date(wo.created_at), 'yyyy-MM') : null;
        return woDate === monthKey;
      });

      const budget = monthWOs.reduce((s, wo) => s + (Number(wo.estimated_cost) || 0), 0);
      const actual = monthWOs.reduce((s, wo) => s + (Number(wo.actual_cost) || 0), 0);

      months.push({ month: label, budget, actual, count: monthWOs.length });
    }
    return months;
  }, [costData]);

  const totalBudget = monthlyData.reduce((s, d) => s + d.budget, 0);
  const totalActual = monthlyData.reduce((s, d) => s + d.actual, 0);
  const variance = totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0;
  const isOverBudget = variance > 0;

  // Drydock summary
  const drydockBudget = (costData?.drydocks || []).reduce((s, d) => s + (Number(d.budget_usd) || 0), 0);
  const drydockSpent = (costData?.drydocks || []).reduce((s, d) => s + (Number(d.spent_usd) || 0), 0);

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-hub-maintenance" />
            Maintenance Cost Trend
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`text-xs ${isOverBudget ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20'}`}
          >
            {isOverBudget ? <AlertTriangle className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}% variance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, color: 'text-muted-foreground' },
            { label: 'Actual', value: `$${(totalActual / 1000).toFixed(0)}K`, color: isOverBudget ? 'text-destructive' : 'text-success' },
            { label: 'Drydock', value: `$${(drydockSpent / 1000).toFixed(0)}K`, color: 'text-primary' },
            { label: 'DD Budget', value: `$${(drydockBudget / 1000).toFixed(0)}K`, color: 'text-muted-foreground' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {monthlyData.some(d => d.budget > 0 || d.actual > 0) ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'budget' ? 'Orçado' : 'Real']}
                />
                <Bar dataKey="budget" fill="hsl(var(--muted-foreground) / 0.3)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" radius={[2, 2, 0, 0]}>
                  {monthlyData.map((entry, i) => (
                    <Cell 
                      key={i} 
                      fill={entry.actual > entry.budget ? 'hsl(var(--destructive))' : 'hsl(var(--success))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Sem dados de custo nos últimos 6 meses</p>
            <p className="text-xs">Registre custos nas Ordens de Serviço</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MaintenanceCostTrend;
