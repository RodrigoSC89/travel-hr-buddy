/**
 * Wave 33: Fleet ROI Command
 * Autonomous fleet optimization ROI, TCE benchmarking, cost-per-day analysis
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Ship, BarChart3, Target, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FleetROICommand() {
  const { data: voyagePnL = [], isLoading } = useQuery({
    queryKey: ['fleet-roi-pnl'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_pnl')
        .select('id, vessel_id, voyage_id, tce_rate, total_revenue, total_expenses, net_profit, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['fleet-roi-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, status')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const totalRevenue = voyagePnL.reduce((s, v) => s + (v.total_revenue || 0), 0);
    const totalCosts = voyagePnL.reduce((s, v) => s + (v.total_expenses || 0), 0);
    const totalProfit = voyagePnL.reduce((s, v) => s + (v.net_profit || 0), 0);
    const avgTCE = voyagePnL.length > 0
      ? voyagePnL.reduce((s, v) => s + (v.tce_rate || 0), 0) / voyagePnL.length
      : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Per-vessel performance
    const byVessel: Record<string, { revenue: number; costs: number; voyages: number }> = {};
    voyagePnL.forEach(v => {
      const vid = v.vessel_id || 'unknown';
      if (!byVessel[vid]) byVessel[vid] = { revenue: 0, costs: 0, voyages: 0 };
      byVessel[vid].revenue += v.total_revenue || 0;
      byVessel[vid].costs += v.total_expenses || 0;
      byVessel[vid].voyages += 1;
    });

    const vesselPerformance = Object.entries(byVessel)
      .map(([id, data]) => {
        const vessel = vessels.find(v => v.id === id);
        return {
          name: vessel?.name || 'Embarcação',
          ...data,
          roi: data.costs > 0 ? ((data.revenue - data.costs) / data.costs) * 100 : 0,
        };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      avgTCE: Math.round(avgTCE),
      profitMargin: Math.round(profitMargin),
      totalVoyages: voyagePnL.length,
      vesselPerformance,
      activeVessels: vessels.filter(v => v.status === 'active' || v.status === 'operational').length,
    };
  }, [voyagePnL, vessels]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  const fmt = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-success" />
            Fleet ROI Command
          </CardTitle>
          <Badge variant="outline" className={metrics.profitMargin >= 10
            ? 'bg-success/10 text-success border-success/20'
            : metrics.profitMargin >= 0
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }>
            {metrics.profitMargin}% margem
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: DollarSign, value: fmt(metrics.totalRevenue), label: 'Receita', color: 'text-success' },
            { icon: BarChart3, value: fmt(metrics.totalCosts), label: 'Custos', color: 'text-destructive' },
            { icon: Target, value: `$${metrics.avgTCE}`, label: 'TCE Médio', color: 'text-primary' },
            { icon: Ship, value: metrics.totalVoyages, label: 'Viagens', color: 'text-muted-foreground' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Profit indicator */}
        <div className="text-center p-3 rounded-xl bg-muted/50">
          <Zap className={`h-5 w-5 mx-auto mb-1 ${metrics.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} />
          <div className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(Math.abs(metrics.totalProfit))}
          </div>
          <p className="text-xs text-muted-foreground">{metrics.totalProfit >= 0 ? 'Lucro Total' : 'Prejuízo Total'}</p>
        </div>

        {/* Vessel ROI Ranking */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">ROI por Embarcação (Top 5)</p>
          {metrics.vesselPerformance.map((v, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-sm font-medium text-foreground truncate">{v.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16">
                  <Progress value={Math.min(Math.max(v.roi, 0), 100)} className="h-1.5" />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${v.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {v.roi.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          {metrics.vesselPerformance.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado P&L disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
