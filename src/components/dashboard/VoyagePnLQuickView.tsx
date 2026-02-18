/**
 * Voyage P&L Quick View - Real-time voyage profitability summary
 * Shows active voyages with TCE, revenue, costs and margins
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Ship, Anchor } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface VoyagePnL {
  id: string;
  voyage_number: string;
  vessel_name: string;
  revenue: number;
  costs: number;
  tce: number;
  margin_pct: number;
  status: string;
}

export function VoyagePnLQuickView() {
  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ['voyage-pnl-quick'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voyage_pnl')
        .select('id, voyage_id, total_revenue, total_expenses, tce_rate, net_profit, created_at')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;

      // Get voyage details
      const voyageIds = (data || []).map(d => d.voyage_id).filter(Boolean) as string[];
      let voyageMap: Record<string, { voyage_number: string; status: string }> = {};
      if (voyageIds.length > 0) {
        const { data: vData } = await supabase
          .from('voyage_plans')
          .select('id, voyage_number, status')
          .in('id', voyageIds);
        if (vData) {
          voyageMap = Object.fromEntries(vData.map(v => [v.id, { voyage_number: v.voyage_number || 'N/A', status: v.status || 'unknown' }]));
        }
      }

      return (data || []).map(d => ({
        id: d.id,
        voyage_number: voyageMap[d.voyage_id || '']?.voyage_number || `V-${d.id.slice(0, 6)}`,
        vessel_name: '',
        revenue: Number(d.total_revenue) || 0,
        costs: Number(d.total_expenses) || 0,
        tce: Number(d.tce_rate) || 0,
        margin_pct: d.total_revenue ? ((Number(d.net_profit) || 0) / Number(d.total_revenue)) * 100 : 0,
        status: voyageMap[d.voyage_id || '']?.status || 'active',
      })) as VoyagePnL[];
    },
    staleTime: 60000,
  });

  const totalRevenue = voyages.reduce((s, v) => s + v.revenue, 0);
  const totalCosts = voyages.reduce((s, v) => s + v.costs, 0);
  const avgTCE = voyages.length > 0 ? voyages.reduce((s, v) => s + v.tce, 0) / voyages.length : 0;
  const avgMargin = voyages.length > 0 ? voyages.reduce((s, v) => s + v.margin_pct, 0) / voyages.length : 0;

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            Voyage P&L Summary
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {voyages.length} viagens
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: 'text-success' },
            { label: 'Costs', value: `$${(totalCosts / 1000).toFixed(0)}K`, color: 'text-destructive' },
            { label: 'Avg TCE', value: `$${avgTCE.toFixed(0)}/d`, color: 'text-primary' },
            { label: 'Margin', value: `${avgMargin.toFixed(1)}%`, color: avgMargin > 0 ? 'text-success' : 'text-destructive' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Voyage List */}
        <div className="space-y-2">
          {voyages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Anchor className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Nenhum P&L de viagem registrado</p>
              <p className="text-xs">Crie viagens no Ops Hub para ver resultados aqui</p>
            </div>
          ) : (
            voyages.map(v => {
              const profit = v.revenue - v.costs;
              const isProfitable = profit >= 0;
              return (
                <div key={v.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{v.voyage_number}</p>
                      <p className="text-[10px] text-muted-foreground">TCE: ${v.tce.toFixed(0)}/day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                        {isProfitable ? '+' : ''}${(profit / 1000).toFixed(1)}K
                      </p>
                      <p className="text-[10px] text-muted-foreground">{v.margin_pct.toFixed(1)}%</p>
                    </div>
                    {isProfitable ? (
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default VoyagePnLQuickView;
