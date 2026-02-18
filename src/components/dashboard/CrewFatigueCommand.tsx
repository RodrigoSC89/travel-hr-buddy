/**
 * Wave 31: Crew Fatigue Command
 * MLC 2006 work/rest compliance, fatigue risk scoring, watch schedule analysis
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Moon, Clock, Users, Shield, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CrewFatigueCommand() {
  const { data: workRestRecords = [], isLoading } = useQuery({
    queryKey: ['fatigue-work-rest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mlc_work_rest_records')
        .select('id, crew_member_id, record_date, work_hours, rest_hours, has_violation, violation_type')
        .order('record_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['fatigue-crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .in('status', ['active', 'onboard'])
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const violations = workRestRecords.filter(r => r.has_violation);
    const avgWorkHours = workRestRecords.length > 0
      ? workRestRecords.reduce((s, r) => s + (r.work_hours || 0), 0) / workRestRecords.length
      : 0;
    const avgRestHours = workRestRecords.length > 0
      ? workRestRecords.reduce((s, r) => s + (r.rest_hours || 0), 0) / workRestRecords.length
      : 0;

    // Crew with violations
    const violatingCrewIds = new Set(violations.map(v => v.crew_member_id));
    const complianceRate = workRestRecords.length > 0
      ? ((workRestRecords.length - violations.length) / workRestRecords.length) * 100
      : 100;

    // Violation breakdown
    const byType: Record<string, number> = {};
    violations.forEach(v => {
      const t = v.violation_type || 'other';
      byType[t] = (byType[t] || 0) + 1;
    });

    return {
      totalRecords: workRestRecords.length,
      violations: violations.length,
      violatingCrew: violatingCrewIds.size,
      avgWorkHours: avgWorkHours.toFixed(1),
      avgRestHours: avgRestHours.toFixed(1),
      complianceRate: Math.round(complianceRate),
      byType: Object.entries(byType).sort(([,a],[,b]) => b - a).slice(0, 4),
      activeCrew: crewMembers.length,
    };
  }, [workRestRecords, crewMembers]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />
            Crew Fatigue Command
          </CardTitle>
          <Badge variant="outline" className={metrics.complianceRate >= 95
            ? 'bg-success/10 text-success border-success/20'
            : metrics.complianceRate >= 80
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }>
            {metrics.complianceRate}% MLC Compliance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, value: metrics.activeCrew, label: 'Crew Ativo', color: 'text-primary' },
            { icon: Clock, value: `${metrics.avgWorkHours}h`, label: 'Trab. Médio', color: 'text-warning' },
            { icon: Moon, value: `${metrics.avgRestHours}h`, label: 'Descanso Médio', color: 'text-success' },
            { icon: AlertTriangle, value: metrics.violations, label: 'Violações', color: 'text-destructive' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Compliance Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> MLC 2006 Reg. 2.3 Compliance</span>
            <span>{metrics.totalRecords - metrics.violations}/{metrics.totalRecords}</span>
          </div>
          <Progress value={metrics.complianceRate} className="h-2" />
        </div>

        {/* Violation Breakdown */}
        {metrics.byType.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Violações por Tipo
            </p>
            {metrics.byType.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                <span className="text-sm text-foreground capitalize">{type.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="bg-destructive/10 text-destructive text-xs">{count}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* At-Risk Crew */}
        {metrics.violatingCrew > 0 && (
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs font-medium text-destructive">
              ⚠️ {metrics.violatingCrew} tripulantes com violações de jornada
            </p>
          </div>
        )}

        {metrics.totalRecords === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro work/rest encontrado</p>
        )}
      </CardContent>
    </Card>
  );
}
