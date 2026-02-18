/**
 * Wave 32: Asset Integrity Matrix
 * Warranty claims tracking, spare parts criticality, equipment condition scoring
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Package, AlertTriangle, DollarSign, Wrench, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AssetIntegrityMatrix() {
  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['asset-warranties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select('id, equipment, claim_amount, status, warranty_expiry, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: spareParts = [] } = useQuery({
    queryKey: ['asset-spare-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impa_spare_parts')
        .select('id, name, impa_code, criticality, min_stock, reorder_point')
        .order('criticality', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const openClaims = warranties.filter(w => w.status === 'open' || w.status === 'pending');
    const totalClaimValue = warranties.reduce((s, w) => s + (w.claim_amount || 0), 0);
    const recoveredValue = warranties.filter(w => w.status === 'approved' || w.status === 'paid')
      .reduce((s, w) => s + (w.claim_amount || 0), 0);

    const criticalParts = spareParts.filter(p => p.criticality === 'critical' || p.criticality === 'high');
    const belowMin = spareParts.filter(p => 
      typeof p.reorder_point === 'number' && typeof p.min_stock === 'number' 
      && p.reorder_point > p.min_stock
    );

    return {
      totalWarranties: warranties.length,
      openClaims: openClaims.length,
      totalClaimValue: totalClaimValue,
      recoveredValue: recoveredValue,
      totalParts: spareParts.length,
      criticalParts: criticalParts.length,
      belowMinStock: belowMin.length,
    };
  }, [warranties, spareParts]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}K`;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Asset Integrity Matrix
          </CardTitle>
          {metrics.belowMinStock > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              {metrics.belowMinStock} abaixo mín.
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Wrench, value: metrics.openClaims, label: 'Claims Abertos', color: 'text-warning' },
            { icon: DollarSign, value: formatCurrency(metrics.totalClaimValue), label: 'Total Claims', color: 'text-primary' },
            { icon: TrendingUp, value: formatCurrency(metrics.recoveredValue), label: 'Recuperado', color: 'text-success' },
            { icon: Package, value: metrics.criticalParts, label: 'Peças Críticas', color: 'text-destructive' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Warranty Recovery Rate */}
        {metrics.totalClaimValue > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Taxa de Recuperação de Garantia</span>
              <span>{((metrics.recoveredValue / metrics.totalClaimValue) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(metrics.recoveredValue / metrics.totalClaimValue) * 100} className="h-2" />
          </div>
        )}

        {/* Critical Spare Parts Below Minimum */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Spare Parts — Estoque Crítico
          </p>
          {spareParts.filter(p => p.criticality === 'critical' || p.criticality === 'high')
            .slice(0, 5).map(part => (
            <div key={part.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
              <div className="min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">{part.name}</span>
                <span className="text-[10px] text-muted-foreground">IMPA: {part.impa_code || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-bold">Min: {part.min_stock ?? '—'}</span>
                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                  {part.criticality || 'N/A'}
                </Badge>
              </div>
            </div>
          ))}
          {metrics.belowMinStock === 0 && metrics.totalParts > 0 && (
            <p className="text-xs text-success text-center py-2">✅ Todos os estoques acima do mínimo</p>
          )}
          {metrics.totalParts === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma peça registrada</p>
          )}
        </div>

        {/* Recent Warranty Claims */}
        {warranties.length > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Últimos Claims de Garantia</p>
            {warranties.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                <span className="truncate text-foreground">{w.equipment}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">${(w.claim_amount || 0).toLocaleString()}</span>
                  <Badge variant="outline" className={`text-[10px] ${
                    w.status === 'approved' || w.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {w.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
