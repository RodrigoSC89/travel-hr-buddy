/**
 * Wave 35: Bunker Intelligence
 * Fuel consumption analytics, MARPOL sulphur compliance, cost optimization
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Fuel, AlertTriangle, DollarSign, Gauge, Ship, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BunkerIntelligence() {
  const { data: bunkerOps = [], isLoading } = useQuery({
    queryKey: ['bunker-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bunker_operations')
        .select('id, fuel_type, quantity_mt, sulfur_content, total_cost, unit_price, port_name, vessel_name, operation_type, operation_date')
        .order('operation_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const totalFuel = bunkerOps.reduce((s, b) => s + (b.quantity_mt || 0), 0);
    const totalCost = bunkerOps.reduce((s, b) => s + (b.total_cost || 0), 0);
    const avgPrice = bunkerOps.length > 0
      ? bunkerOps.reduce((s, b) => s + (b.unit_price || 0), 0) / bunkerOps.length
      : 0;

    // MARPOL sulphur compliance (0.50% limit global, 0.10% ECA)
    const withSulphur = bunkerOps.filter(b => typeof b.sulfur_content === 'number');
    const nonCompliant = withSulphur.filter(b => (b.sulfur_content || 0) > 0.5);
    const ecaRisk = withSulphur.filter(b => (b.sulfur_content || 0) > 0.1 && (b.sulfur_content || 0) <= 0.5);
    const complianceRate = withSulphur.length > 0
      ? ((withSulphur.length - nonCompliant.length) / withSulphur.length) * 100
      : 100;

    // By fuel type
    const byType: Record<string, { qty: number; cost: number }> = {};
    bunkerOps.forEach(b => {
      const t = b.fuel_type || 'Unknown';
      if (!byType[t]) byType[t] = { qty: 0, cost: 0 };
      byType[t].qty += b.quantity_mt || 0;
      byType[t].cost += b.total_cost || 0;
    });

    return {
      totalFuel: Math.round(totalFuel),
      totalCost,
      avgPrice: avgPrice.toFixed(0),
      complianceRate: Math.round(complianceRate),
      nonCompliant: nonCompliant.length,
      ecaRisk: ecaRisk.length,
      byType: Object.entries(byType).sort(([,a],[,b]) => b.qty - a.qty).slice(0, 5),
      totalOps: bunkerOps.length,
    };
  }, [bunkerOps]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  const fmt = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Fuel className="h-5 w-5 text-hub-ops" />
            Bunker Intelligence
          </CardTitle>
          <Badge variant="outline" className={metrics.complianceRate >= 95
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }>
            {metrics.complianceRate}% MARPOL
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Ship, value: `${metrics.totalFuel} MT`, label: 'Total Fuel', color: 'text-primary' },
            { icon: DollarSign, value: fmt(metrics.totalCost), label: 'Custo Total', color: 'text-warning' },
            { icon: Gauge, value: `$${metrics.avgPrice}/MT`, label: 'Preço Médio', color: 'text-muted-foreground' },
            { icon: AlertTriangle, value: metrics.nonCompliant, label: 'S > 0.50%', color: 'text-destructive' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Sulphur Compliance */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>MARPOL Anexo VI — Enxofre ≤ 0.50%</span>
            <span>{metrics.complianceRate}%</span>
          </div>
          <Progress value={metrics.complianceRate} className="h-2" />
          {metrics.ecaRisk > 0 && (
            <p className="text-[10px] text-warning mt-1">⚠️ {metrics.ecaRisk} ops com S &gt; 0.10% (risco ECA)</p>
          )}
        </div>

        {/* By Fuel Type */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Consumo por Tipo de Combustível
          </p>
          {metrics.byType.map(([type, data]) => (
            <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-sm font-medium text-foreground">{type}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">{data.qty.toFixed(0)} MT</span>
                <span className="text-foreground font-medium">{fmt(data.cost)}</span>
              </div>
            </div>
          ))}
          {metrics.byType.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma operação de bunker</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
