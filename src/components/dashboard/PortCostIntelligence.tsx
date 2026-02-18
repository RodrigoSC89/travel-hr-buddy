/**
 * Port Cost Intelligence Panel
 * Compares port costs across ports with breakdown by cost category
 * Uses port_cost_estimates for real data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Anchor, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PortCostIntelligence() {
  const { data: portCosts = [], isLoading } = useQuery({
    queryKey: ['port-cost-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('port_cost_estimates')
        .select('id, port_name, country, total_estimated, total_actual, variance_percent, port_dues, pilotage, towage, agency_fees, berth_hire, cargo_handling, currency, da_status')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Aggregate by port
  const portAgg = portCosts.reduce<Record<string, { port: string; country: string | null; totalEst: number; totalAct: number; count: number; categories: Record<string, number> }>>((acc, pc) => {
    const key = pc.port_name;
    if (!acc[key]) acc[key] = { port: key, country: pc.country, totalEst: 0, totalAct: 0, count: 0, categories: {} };
    acc[key].totalEst += pc.total_estimated || 0;
    acc[key].totalAct += pc.total_actual || 0;
    acc[key].count++;
    const cats: Record<string, number | null> = { 'Port Dues': pc.port_dues, 'Pilotage': pc.pilotage, 'Towage': pc.towage, 'Agency': pc.agency_fees, 'Berth': pc.berth_hire, 'Cargo': pc.cargo_handling };
    for (const [cat, val] of Object.entries(cats)) {
      if (val) acc[key].categories[cat] = (acc[key].categories[cat] || 0) + val;
    }
    return acc;
  }, {});

  const ports = Object.values(portAgg)
    .sort((a, b) => b.totalEst - a.totalEst)
    .slice(0, 8);

  const totalSpend = portCosts.reduce((s, p) => s + (p.total_actual || p.total_estimated || 0), 0);
  const avgVariance = portCosts.filter(p => p.variance_percent != null).length > 0
    ? Math.round(portCosts.filter(p => p.variance_percent != null).reduce((s, p) => s + (p.variance_percent || 0), 0) / portCosts.filter(p => p.variance_percent != null).length * 10) / 10
    : 0;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toFixed(0)}`;

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Anchor className="h-5 w-5 text-hub-ops" />
            Port Cost Intelligence
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{portCosts.length} estimates</Badge>
            <Badge variant={avgVariance > 5 ? 'destructive' : 'default'} className="text-xs">
              {avgVariance > 0 ? '+' : ''}{avgVariance}% variance
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{fmt(totalSpend)}</div>
            <div className="text-[10px] text-muted-foreground">Total Spend</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Anchor className="h-4 w-4 mx-auto mb-1 text-hub-ops" />
            <div className="text-lg font-bold">{ports.length}</div>
            <div className="text-[10px] text-muted-foreground">Ports</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            {avgVariance > 0 ? <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" /> : <TrendingDown className="h-4 w-4 mx-auto mb-1 text-success" />}
            <div className="text-lg font-bold">{avgVariance}%</div>
            <div className="text-[10px] text-muted-foreground">Avg Variance</div>
          </div>
        </div>

        {/* Port rankings */}
        {ports.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Anchor className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma estimativa de custo portuário
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Ports by Cost</h4>
            {ports.map((p) => {
              const maxEst = ports[0].totalEst || 1;
              const pct = Math.round((p.totalEst / maxEst) * 100);
              const variance = p.totalAct > 0 ? Math.round(((p.totalAct - p.totalEst) / Math.max(p.totalEst, 1)) * 100) : null;
              return (
                <div key={p.port} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[50%]">
                      {p.port} {p.country && <span className="text-muted-foreground">({p.country})</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{fmt(p.totalEst)}</span>
                      {variance !== null && (
                        <span className={variance > 5 ? 'text-destructive' : variance < -5 ? 'text-success' : 'text-muted-foreground'}>
                          {variance > 0 ? '+' : ''}{variance}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PortCostIntelligence;
