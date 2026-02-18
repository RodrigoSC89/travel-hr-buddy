/**
 * Wave 23: Fuel Efficiency Analytics
 * Real-time fuel consumption analysis with MARPOL compliance tracking
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Fuel, TrendingDown, Droplets, AlertTriangle, Gauge } from 'lucide-react';

export default function FuelEfficiencyAnalytics() {
  const { data: bunkerOps = [] } = useQuery({
    queryKey: ['fuel-efficiency-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bunker_operations')
        .select('id, vessel_id, fuel_type, quantity_mt, sulfur_content, operation_date, operation_type')
        .order('operation_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['fuel-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, status')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const analytics = useMemo(() => {
    const totalConsumption = bunkerOps.reduce((sum, op) => sum + (op.quantity_mt || 0), 0);
    const sulphurOps = bunkerOps.filter(o => o.sulfur_content != null);
    const avgSulphur = sulphurOps.length > 0
      ? sulphurOps.reduce((sum, op) => sum + (op.sulfur_content || 0), 0) / sulphurOps.length
      : 0;

    const fuelTypes: Record<string, number> = {};
    bunkerOps.forEach(op => {
      const type = op.fuel_type || 'Unknown';
      fuelTypes[type] = (fuelTypes[type] || 0) + (op.quantity_mt || 0);
    });

    const nonCompliant = bunkerOps.filter(op => (op.sulfur_content || 0) > 0.5).length;
    const ecaViolations = bunkerOps.filter(op => (op.sulfur_content || 0) > 0.1).length;

    const monthlyData: Record<string, number> = {};
    bunkerOps.forEach(op => {
      if (op.operation_date) {
        const month = op.operation_date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + (op.quantity_mt || 0);
      }
    });
    const sortedMonths = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

    const vesselConsumption: Record<string, number> = {};
    bunkerOps.forEach(op => {
      if (op.vessel_id) {
        vesselConsumption[op.vessel_id] = (vesselConsumption[op.vessel_id] || 0) + (op.quantity_mt || 0);
      }
    });
    const topConsumers = Object.entries(vesselConsumption)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([vesselId, qty]) => ({
        vesselId,
        name: vessels.find(v => v.id === vesselId)?.name || 'Unknown',
        quantity: qty,
      }));

    return { totalConsumption, avgSulphur, fuelTypes, nonCompliant, ecaViolations, sortedMonths, topConsumers, totalOps: bunkerOps.length };
  }, [bunkerOps, vessels]);

  const complianceRate = analytics.totalOps > 0
    ? ((analytics.totalOps - analytics.nonCompliant) / analytics.totalOps * 100) : 100;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Fuel Efficiency Analytics</CardTitle>
          </div>
          <Badge variant={complianceRate >= 95 ? 'default' : 'destructive'} className="text-xs">
            MARPOL {complianceRate.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Droplets className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Consumo</p>
            <p className="text-lg font-bold">{(analytics.totalConsumption / 1000).toFixed(1)}k MT</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Gauge className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Avg Sulphur</p>
            <p className="text-lg font-bold">{analytics.avgSulphur.toFixed(3)}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <TrendingDown className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Operações</p>
            <p className="text-lg font-bold">{analytics.totalOps}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-destructive mb-1" />
            <p className="text-xs text-muted-foreground">ECA Alerts</p>
            <p className="text-lg font-bold">{analytics.ecaViolations}</p>
          </div>
        </div>

        {/* Fuel Type Distribution */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Fuel Type Mix</p>
          <div className="space-y-2">
            {Object.entries(analytics.fuelTypes).slice(0, 5).map(([type, qty]) => {
              const pct = analytics.totalConsumption > 0 ? (qty / analytics.totalConsumption) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-xs w-20 truncate">{type}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-14 text-right">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        {analytics.sortedMonths.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Consumo Mensal (MT)</p>
            <div className="flex items-end gap-1 h-20">
              {analytics.sortedMonths.map(([month, qty]) => {
                const maxQty = Math.max(...analytics.sortedMonths.map(m => m[1] as number));
                const height = maxQty > 0 ? ((qty as number) / maxQty) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/80 rounded-t transition-all min-h-[2px]" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-muted-foreground">{month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Consumers */}
        {analytics.topConsumers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Consumidores</p>
            <div className="space-y-1.5">
              {analytics.topConsumers.map((v, i) => (
                <div key={v.vesselId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-medium">{v.name}</span>
                  </div>
                  <span className="font-mono">{v.quantity.toFixed(0)} MT</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.totalOps === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma operação de bunker registrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
