/**
 * Voyage TCE Performance Tracker
 * Time Charter Equivalent analysis per voyage
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Ship } from 'lucide-react';

export function VoyageTCEPerformance() {
  const { data: voyagePnl = [] } = useQuery({
    queryKey: ['voyage-tce-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_pnl')
        .select('id, voyage_id, total_revenue, total_expenses, net_profit, tce_rate, voyage_days, vessel_id, vessel_name, load_port, discharge_port, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = React.useMemo(() => {
    const totalVoyages = voyagePnl.length;
    const avgTCE = totalVoyages > 0
      ? voyagePnl.reduce((sum, v) => sum + Number(v.tce_rate || 0), 0) / totalVoyages
      : 0;

    const totalRevenue = voyagePnl.reduce((sum, v) => sum + Number(v.total_revenue || 0), 0);
    const totalCosts = voyagePnl.reduce((sum, v) => sum + Number(v.total_expenses || 0), 0);
    const totalProfit = voyagePnl.reduce((sum, v) => sum + Number(v.net_profit || 0), 0);
    const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    const topVoyages = [...voyagePnl]
      .sort((a, b) => Number(b.tce_rate || 0) - Number(a.tce_rate || 0))
      .slice(0, 5)
      .map(v => ({
        name: v.vessel_name || '—',
        route: `${v.load_port || '?'} → ${v.discharge_port || '?'}`,
        tce: Number(v.tce_rate || 0),
        profit: Number(v.net_profit || 0),
        days: Number(v.voyage_days || 0),
      }));

    const profitable = voyagePnl.filter(v => Number(v.net_profit || 0) > 0).length;
    const lossmaking = voyagePnl.filter(v => Number(v.net_profit || 0) < 0).length;

    return { totalVoyages, avgTCE, totalRevenue, totalCosts, totalProfit, margin, topVoyages, profitable, lossmaking };
  }, [voyagePnl]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Voyage TCE Performance
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {metrics.totalVoyages} voyages
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
          <div className="text-xs text-muted-foreground mb-1">Average TCE/Day</div>
          <div className="text-3xl font-bold text-primary">{formatCurrency(metrics.avgTCE)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Margin: <span className={metrics.margin >= 0 ? 'text-success' : 'text-destructive'}>{metrics.margin}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/30">
            <div className="text-sm font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="text-[10px] text-muted-foreground">Revenue</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <div className="text-sm font-bold">{formatCurrency(metrics.totalCosts)}</div>
            <div className="text-[10px] text-muted-foreground">Costs</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <div className={`text-sm font-bold ${metrics.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(metrics.totalProfit)}
            </div>
            <div className="text-[10px] text-muted-foreground">Net P&L</div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <Badge variant="outline" className="text-success border-success/20">
            ✅ {metrics.profitable} profitable
          </Badge>
          {metrics.lossmaking > 0 && (
            <Badge variant="outline" className="text-destructive border-destructive/20">
              ❌ {metrics.lossmaking} loss
            </Badge>
          )}
        </div>

        {metrics.topVoyages.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">🏆 Top TCE Performers</h4>
            {metrics.topVoyages.map((v, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <Ship className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{v.name}</span>
                  <span className="text-muted-foreground truncate max-w-[100px]">{v.route}</span>
                </div>
                <span className="font-bold text-success">{formatCurrency(v.tce)}/d</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VoyageTCEPerformance;
