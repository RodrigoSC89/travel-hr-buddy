/**
 * Wave 23: Cargo Performance Dashboard
 * Real-time cargo operations analysis with revenue tracking
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, DollarSign, TrendingUp, BarChart3, Ship } from 'lucide-react';

export default function CargoPerformanceDashboard() {
  const { data: voyages = [] } = useQuery({
    queryKey: ['cargo-perf-voyages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_plans')
        .select('id, voyage_number, status, origin_port, destination_port, vessel_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: pnlData = [] } = useQuery({
    queryKey: ['cargo-perf-pnl'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_pnl')
        .select('id, voyage_id, tce_rate, total_revenue, total_expenses, net_profit, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const analytics = useMemo(() => {
    const statusDist: Record<string, number> = {};
    voyages.forEach(v => {
      const s = v.status || 'unknown';
      statusDist[s] = (statusDist[s] || 0) + 1;
    });

    const avgTCE = pnlData.length > 0
      ? pnlData.reduce((s, p) => s + (p.tce_rate || 0), 0) / pnlData.length
      : 0;
    const totalRevenue = pnlData.reduce((s, p) => s + (p.total_revenue || 0), 0);
    const totalExpenses = pnlData.reduce((s, p) => s + (p.total_expenses || 0), 0);
    const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    const routes: Record<string, number> = {};
    voyages.forEach(v => {
      if (v.origin_port && v.destination_port) {
        const route = `${v.origin_port} → ${v.destination_port}`;
        routes[route] = (routes[route] || 0) + 1;
      }
    });
    const topRoutes = Object.entries(routes).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const tceTrend = pnlData
      .filter(p => p.tce_rate && p.created_at)
      .slice(0, 10)
      .reverse()
      .map(p => ({ tce: p.tce_rate || 0, date: p.created_at?.substring(0, 10) || '' }));

    return { statusDist, avgTCE, totalRevenue, totalExpenses, avgMargin, topRoutes, tceTrend, totalVoyages: voyages.length };
  }, [voyages, pnlData]);

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500',
    in_progress: 'bg-primary',
    active: 'bg-primary',
    underway: 'bg-primary',
    planned: 'bg-accent',
    cancelled: 'bg-destructive',
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Cargo & Revenue Performance</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {analytics.totalVoyages} voyages
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Avg TCE/day</p>
            <p className="text-lg font-bold">${analytics.avgTCE.toFixed(0)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold">${(analytics.totalRevenue / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Avg Margin</p>
            <p className="text-lg font-bold">{analytics.avgMargin.toFixed(1)}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Ship className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Voyages</p>
            <p className="text-lg font-bold">{analytics.totalVoyages}</p>
          </div>
        </div>

        {/* Voyage Status */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Voyage Status</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(analytics.statusDist).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2.5 py-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-muted-foreground'}`} />
                <span className="text-xs capitalize">{status.replace(/_/g, ' ')}</span>
                <span className="text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TCE Trend */}
        {analytics.tceTrend.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">TCE Trend ($/day)</p>
            <div className="flex items-end gap-1 h-16">
              {analytics.tceTrend.map((point, i) => {
                const maxTce = Math.max(...analytics.tceTrend.map(p => p.tce));
                const height = maxTce > 0 ? (point.tce / maxTce) * 100 : 0;
                return (
                  <div key={i} className="flex-1">
                    <div className="w-full bg-primary/80 rounded-t transition-all min-h-[2px]" style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Routes */}
        {analytics.topRoutes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Routes</p>
            <div className="space-y-1.5">
              {analytics.topRoutes.map(([route, count], i) => (
                <div key={route} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-medium truncate max-w-[200px]">{route}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{count}x</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.totalVoyages === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma viagem registrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
