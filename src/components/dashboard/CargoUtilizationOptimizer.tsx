/**
 * Wave 40: Cargo Utilization Optimizer
 * Stowage plans + cargo operations analytics with correct schema fields
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, BarChart3, Anchor } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CargoUtilizationOptimizer() {
  const { data: stowagePlans = [], isLoading } = useQuery({
    queryKey: ['cargo-utilization-optimizer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stowage_plans')
        .select('id, vessel_id, total_cargo_mt, gm, status, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: cargoOps = [] } = useQuery({
    queryKey: ['cargo-ops-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cargo_operations')
        .select('id, operation_type, status, utilization_percent, port')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const totalWeight = stowagePlans.reduce((sum, s) => sum + (Number(s.total_cargo_mt) || 0), 0);
    const avgGM = stowagePlans.length > 0
      ? stowagePlans.reduce((sum, s) => sum + (Number(s.gm) || 0), 0) / stowagePlans.length
      : 0;
    const approved = stowagePlans.filter(s => s.status === 'approved' || s.status === 'active');
    const opTypes = new Set(cargoOps.map(c => c.operation_type).filter(Boolean));
    const completedOps = cargoOps.filter(c => c.status === 'completed' || c.status === 'discharged');
    const avgUtil = cargoOps.length > 0
      ? cargoOps.reduce((sum, c) => sum + (Number(c.utilization_percent) || 0), 0) / cargoOps.length
      : 0;

    return {
      totalPlans: stowagePlans.length,
      totalWeight: Math.round(totalWeight),
      avgGM: avgGM.toFixed(2),
      approvalRate: stowagePlans.length > 0 ? Math.round((approved.length / stowagePlans.length) * 100) : 0,
      opTypes: opTypes.size,
      completionRate: cargoOps.length > 0 ? Math.round((completedOps.length / cargoOps.length) * 100) : 0,
      avgUtilization: Math.round(avgUtil),
    };
  }, [stowagePlans, cargoOps]);

  if (isLoading) return <Skeleton className="h-80" />;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Cargo Utilization Optimizer
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {metrics.totalPlans} plans
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Cargo (MT)', value: metrics.totalWeight.toLocaleString(), icon: Anchor, color: 'text-info' },
            { label: 'Avg GM (m)', value: metrics.avgGM, icon: BarChart3, color: 'text-warning' },
            { label: 'Avg Utilization', value: `${metrics.avgUtilization}%`, icon: Package, color: 'text-success' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Stowage Approval</span>
              <span className="font-medium">{metrics.approvalRate}%</span>
            </div>
            <Progress value={metrics.approvalRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Cargo Ops Completion</span>
              <span className="font-medium">{metrics.completionRate}%</span>
            </div>
            <Progress value={metrics.completionRate} className="h-2" />
          </div>
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto">
          {stowagePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum plano de estiva registrado.</p>
          ) : (
            stowagePlans.slice(0, 5).map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/30">
                <div>
                  <p className="text-sm font-medium">{plan.total_cargo_mt} MT</p>
                  <p className="text-xs text-muted-foreground">GM: {plan.gm}m</p>
                </div>
                <Badge variant="outline" className={
                  plan.status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }>
                  {plan.status || 'draft'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
