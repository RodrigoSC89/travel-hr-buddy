/**
 * Crew Productivity Pulse - Wave 22
 * Real-time crew assignment and productivity metrics
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Anchor, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CrewProductivityPulse() {
  const { data: crew = [] } = useQuery({
    queryKey: ['cpp-crew'],
    queryFn: async () => {
      const { data } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status, vessel_id, nationality')
        .order('full_name');
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: certs = [] } = useQuery({
    queryKey: ['cpp-certs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('crew_certifications')
        .select('crew_member_id, expiry_date')
        .not('expiry_date', 'is', null)
        .limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const active = crew.filter((c) => c.status === 'active' || c.status === 'onboard');
    const assigned = crew.filter((c) => c.vessel_id);
    const unassigned = crew.filter((c) => !c.vessel_id);

    // Cert health
    const now = Date.now();
    const expiringSoon = new Set<string>();
    certs.forEach((c) => {
      if (!c.expiry_date) return;
      const daysLeft = (new Date(c.expiry_date).getTime() - now) / 86400000;
      if (daysLeft < 90 && daysLeft > 0) expiringSoon.add(c.crew_member_id || '');
    });

    // Rank distribution
    const ranks = new Map<string, number>();
    crew.forEach((c) => {
      const rank = c.rank || 'Unknown';
      ranks.set(rank, (ranks.get(rank) || 0) + 1);
    });
    const topRanks = Array.from(ranks.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      total: crew.length,
      active: active.length,
      assigned: assigned.length,
      unassigned: unassigned.length,
      certAlerts: expiringSoon.size,
      utilizationRate: crew.length > 0 ? Math.round(assigned.length / crew.length * 100) : 0,
      topRanks,
    };
  }, [crew, certs]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Crew Productivity Pulse
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${metrics.utilizationRate >= 80 ? 'bg-success/10 text-success' : metrics.utilizationRate >= 50 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
            {metrics.utilizationRate}% utilização
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: metrics.total, icon: Users, color: 'text-foreground' },
            { label: 'Ativos', value: metrics.active, icon: UserCheck, color: 'text-success' },
            { label: 'Designados', value: metrics.assigned, icon: Anchor, color: 'text-primary' },
            { label: 'Disponíveis', value: metrics.unassigned, icon: UserX, color: 'text-warning' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-2 rounded-lg bg-muted/30"
            >
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Utilization bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Taxa de Utilização</span>
            <span className="font-medium">{metrics.utilizationRate}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${metrics.utilizationRate >= 80 ? 'bg-success' : metrics.utilizationRate >= 50 ? 'bg-warning' : 'bg-destructive'}`}
              initial={{ width: 0 }}
              animate={{ width: `${metrics.utilizationRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Cert alerts */}
        {metrics.certAlerts > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 text-warning text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{metrics.certAlerts} tripulantes com certificados expirando em 90 dias</span>
          </div>
        )}

        {/* Rank distribution */}
        {metrics.topRanks.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium">Distribuição por Cargo</span>
            {metrics.topRanks.map(([rank, count], i) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs w-24 truncate text-muted-foreground">{rank}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / Math.max(metrics.total, 1)) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
                <span className="text-[10px] font-medium w-6 text-right">{count}</span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
