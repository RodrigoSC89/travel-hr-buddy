/**
 * Wave 36: Predictive Crew Turnover
 * Contract expiry forecasting, retention risk scoring, headcount analytics
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, AlertTriangle, Clock, TrendingUp, Calendar, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, parseISO } from 'date-fns';

export default function PredictiveCrewTurnover() {
  const { data: crewMembers = [], isLoading } = useQuery({
    queryKey: ['crew-turnover'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, position, status, contract_end, contract_start, experience_years, vessel_id')
        .in('status', ['active', 'onboard', 'on_leave'])
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const now = new Date();
    const withContract = crewMembers.filter(c => c.contract_end);

    // Risk categories
    const critical: typeof crewMembers = []; // < 30 days
    const warning: typeof crewMembers = [];  // 30-90 days
    const upcoming: typeof crewMembers = []; // 90-180 days
    const expired: typeof crewMembers = [];

    withContract.forEach(c => {
      const daysLeft = differenceInDays(parseISO(c.contract_end!), now);
      if (daysLeft < 0) expired.push(c);
      else if (daysLeft <= 30) critical.push(c);
      else if (daysLeft <= 90) warning.push(c);
      else if (daysLeft <= 180) upcoming.push(c);
    });

    // Average tenure
    const withStart = crewMembers.filter(c => c.contract_start);
    const avgTenure = withStart.length > 0
      ? withStart.reduce((s, c) => s + differenceInDays(now, parseISO(c.contract_start!)), 0) / withStart.length
      : 0;

    // By rank distribution
    const byRank: Record<string, number> = {};
    crewMembers.forEach(c => {
      const r = c.rank || c.position || 'Other';
      byRank[r] = (byRank[r] || 0) + 1;
    });

    const retentionRate = crewMembers.length > 0
      ? ((crewMembers.length - expired.length) / crewMembers.length) * 100
      : 100;

    return {
      totalCrew: crewMembers.length,
      expired: expired.length,
      critical: critical.length,
      warning: warning.length,
      upcoming: upcoming.length,
      avgTenureDays: Math.round(avgTenure),
      retentionRate: Math.round(retentionRate),
      criticalList: [...expired, ...critical].slice(0, 5),
      topRanks: Object.entries(byRank).sort(([,a],[,b]) => b - a).slice(0, 4),
    };
  }, [crewMembers]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-hub-command" />
            Predictive Crew Turnover
          </CardTitle>
          <Badge variant="outline" className={metrics.retentionRate >= 90
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-warning/10 text-warning border-warning/20'
          }>
            {metrics.retentionRate}% retenção
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, value: metrics.totalCrew, label: 'Efetivo', color: 'text-primary' },
            { icon: AlertTriangle, value: metrics.expired + metrics.critical, label: 'Urgente', color: 'text-destructive' },
            { icon: Clock, value: metrics.warning, label: '30-90d', color: 'text-warning' },
            { icon: Calendar, value: `${Math.round(metrics.avgTenureDays / 30)}m`, label: 'Tenure Méd.', color: 'text-muted-foreground' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Retention gauge */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Taxa de Retenção</span>
            <span>{metrics.totalCrew - metrics.expired}/{metrics.totalCrew}</span>
          </div>
          <Progress value={metrics.retentionRate} className="h-2" />
        </div>

        {/* Risk pipeline */}
        <div className="flex items-center gap-1 text-xs">
          {[
            { label: 'Expirado', count: metrics.expired, cls: 'bg-destructive text-destructive-foreground' },
            { label: '< 30d', count: metrics.critical, cls: 'bg-destructive/80 text-destructive-foreground' },
            { label: '30-90d', count: metrics.warning, cls: 'bg-warning text-warning-foreground' },
            { label: '90-180d', count: metrics.upcoming, cls: 'bg-primary/60 text-primary-foreground' },
          ].map((seg, i) => seg.count > 0 && (
            <Badge key={i} className={`${seg.cls} text-[10px]`}>{seg.label}: {seg.count}</Badge>
          ))}
        </div>

        {/* Critical crew list */}
        {metrics.criticalList.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Contratos Urgentes
            </p>
            {metrics.criticalList.map(c => {
              const daysLeft = c.contract_end ? differenceInDays(parseISO(c.contract_end), new Date()) : 0;
              return (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{c.full_name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.rank || c.position}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${daysLeft < 0
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-warning/10 text-warning'
                  }`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d expirado` : `${daysLeft}d restantes`}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Rank distribution */}
        <div className="border-t border-border/50 pt-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Distribuição por Posto
          </p>
          <div className="flex flex-wrap gap-1">
            {metrics.topRanks.map(([rank, count]) => (
              <Badge key={rank} variant="outline" className="text-[10px]">{rank}: {count}</Badge>
            ))}
          </div>
        </div>

        {metrics.totalCrew === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum tripulante ativo</p>
        )}
      </CardContent>
    </Card>
  );
}
