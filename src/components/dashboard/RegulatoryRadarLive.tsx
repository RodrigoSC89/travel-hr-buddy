/**
 * Wave 39: Regulatory Radar Live
 * compliance_violations: entity_type, severity, status, violation_details
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Globe, Shield, TrendingUp } from 'lucide-react';

export default function RegulatoryRadarLive() {
  const { data: violations = [], isLoading } = useQuery({
    queryKey: ['regulatory-radar-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_violations')
        .select('id, entity_type, severity, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ['regulatory-radar-ncs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('id, title, severity, status, source, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const openViolations = violations.filter(v => v.status === 'open' || v.status === 'pending');
    const critical = violations.filter(v => v.severity === 'critical' || v.severity === 'high');
    const openNCs = ncs.filter(nc => nc.status === 'open');
    const entityTypes = new Set(violations.map(v => v.entity_type).filter(Boolean));

    return {
      totalViolations: violations.length,
      openViolations: openViolations.length,
      criticalItems: critical.length,
      openNCs: openNCs.length,
      entityTypes: entityTypes.size,
      complianceRate: violations.length > 0
        ? Math.round(((violations.length - openViolations.length) / violations.length) * 100)
        : 100,
    };
  }, [violations, ncs]);

  if (isLoading) return <Skeleton className="h-80" />;

  const severityColor = (sev: string | null) => {
    switch (sev) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Regulatory Radar Live
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {metrics.totalViolations} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Open', value: metrics.openViolations, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Critical', value: metrics.criticalItems, icon: Shield, color: 'text-destructive' },
            { label: 'Compliance', value: `${metrics.complianceRate}%`, icon: TrendingUp, color: 'text-success' },
            { label: 'Categories', value: metrics.entityTypes, icon: Globe, color: 'text-info' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {violations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma violação regulatória registrada.
            </p>
          ) : (
            violations.slice(0, 6).map(v => (
              <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.entity_type}</p>
                  <p className="text-xs text-muted-foreground">{v.status || 'open'}</p>
                </div>
                <Badge variant="outline" className={severityColor(v.severity)}>
                  {v.severity || 'low'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
