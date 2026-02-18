/**
 * SituationRoom - Executive Threat Matrix & Mission Readiness
 * Military-grade operational awareness panel
 */
import React, { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Target, Crosshair, TrendingUp, TrendingDown,
  Clock, AlertTriangle, CheckCircle2, XCircle, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatItem {
  id: string;
  category: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  icon: React.ElementType;
}

const levelConfig = {
  critical: { color: 'bg-destructive', text: 'text-destructive', label: 'CRÍTICO', ring: 'ring-destructive/30' },
  high: { color: 'bg-warning', text: 'text-warning', label: 'ALTO', ring: 'ring-warning/30' },
  medium: { color: 'bg-info', text: 'text-info', label: 'MÉDIO', ring: 'ring-info/30' },
  low: { color: 'bg-success', text: 'text-success', label: 'BAIXO', ring: 'ring-success/30' },
};

const ReadinessGauge = memo(({ value, label }: { value: number; label: string }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? 'text-success' : value >= 70 ? 'text-warning' : 'text-destructive';
  const strokeColor = value >= 90 ? 'stroke-success' : value >= 70 ? 'stroke-warning' : 'stroke-destructive';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.3" />
        <motion.circle
          cx="40" cy="40" r="36"
          fill="none"
          className={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="38" textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="700">
          {value}%
        </text>
        <text x="40" y="50" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="500">
          {label}
        </text>
      </svg>
    </div>
  );
});
ReadinessGauge.displayName = 'ReadinessGauge';

export const SituationRoom = memo(() => {
  const { data } = useQuery({
    queryKey: ['situation-room'],
    queryFn: async () => {
      const [openAlerts, openNCs, pendingMaint, expiringCerts, overdueTasks, activeVoyages] = await Promise.all([
        supabase.from('soc_alerts').select('id, severity', { count: 'exact' }).is('resolved_at', null),
        supabase.from('non_conformities').select('id, severity', { count: 'exact' }).in('status', ['open', 'in_progress']),
        supabase.from('mmi_maintenance_jobs').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('certificates').select('id').lt('expiry_date', new Date(Date.now() + 30 * 86400000).toISOString()).gt('expiry_date', new Date().toISOString()),
        supabase.from('maintenance_tasks').select('id', { count: 'exact' }).eq('status', 'overdue'),
        supabase.from('voyage_plans').select('id', { count: 'exact' }).eq('status', 'active'),
      ]);

      const criticalAlerts = openAlerts.data?.filter(a => a.severity === 'critical').length ?? 0;
      const highAlerts = openAlerts.data?.filter(a => a.severity === 'high').length ?? 0;
      const criticalNCs = openNCs.data?.filter(n => n.severity === 'critical').length ?? 0;

      return {
        totalAlerts: openAlerts.count ?? 0,
        criticalAlerts,
        highAlerts,
        totalNCs: openNCs.count ?? 0,
        criticalNCs,
        pendingMaint: pendingMaint.count ?? 0,
        expiringCerts: expiringCerts.data?.length ?? 0,
        overdueTasks: overdueTasks.count ?? 0,
        activeVoyages: activeVoyages.count ?? 0,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const threats = useMemo<ThreatItem[]>(() => {
    if (!data) return [];
    return [
      {
        id: 'alerts',
        category: 'Alertas Abertos',
        level: data.criticalAlerts > 0 ? 'critical' : data.highAlerts > 0 ? 'high' : data.totalAlerts > 0 ? 'medium' : 'low',
        count: data.totalAlerts,
        icon: AlertTriangle,
      },
      {
        id: 'ncs',
        category: 'Não Conformidades',
        level: data.criticalNCs > 0 ? 'critical' : data.totalNCs > 3 ? 'high' : data.totalNCs > 0 ? 'medium' : 'low',
        count: data.totalNCs,
        icon: XCircle,
      },
      {
        id: 'maint',
        category: 'Manutenção Pendente',
        level: (data.overdueTasks ?? 0) > 0 ? 'high' : data.pendingMaint > 5 ? 'medium' : 'low',
        count: data.pendingMaint,
        icon: Clock,
      },
      {
        id: 'certs',
        category: 'Certificados Expirando',
        level: data.expiringCerts > 5 ? 'high' : data.expiringCerts > 0 ? 'medium' : 'low',
        count: data.expiringCerts,
        icon: ShieldAlert,
      },
    ];
  }, [data]);

  // Overall readiness
  const readiness = useMemo(() => {
    if (!data) return { fleet: 85, safety: 90, compliance: 88 };
    const safetyPenalty = (data.criticalAlerts * 15) + (data.highAlerts * 5) + (data.totalNCs * 3);
    const compliancePenalty = (data.expiringCerts * 4) + (data.criticalNCs * 10);
    const fleetPenalty = (data.pendingMaint * 2) + ((data.overdueTasks ?? 0) * 8);
    return {
      safety: Math.max(0, Math.min(100, 100 - safetyPenalty)),
      compliance: Math.max(0, Math.min(100, 100 - compliancePenalty)),
      fleet: Math.max(0, Math.min(100, 100 - fleetPenalty)),
    };
  }, [data]);

  const overallThreat = useMemo(() => {
    const hasCritical = threats.some(t => t.level === 'critical');
    const hasHigh = threats.some(t => t.level === 'high');
    if (hasCritical) return { level: 'DEFCON 1', color: 'bg-destructive/10 text-destructive border-destructive/20', pulse: true };
    if (hasHigh) return { level: 'DEFCON 2', color: 'bg-warning/10 text-warning border-warning/20', pulse: true };
    return { level: 'DEFCON 5', color: 'bg-success/10 text-success border-success/20', pulse: false };
  }, [threats]);

  return (
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          Situation Room
          <Badge variant="outline" className={cn("ml-auto text-[10px] font-mono", overallThreat.color)}>
            {overallThreat.pulse && (
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
              </span>
            )}
            {overallThreat.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Gauges */}
        <div className="flex justify-around">
          <ReadinessGauge value={readiness.safety} label="SAFETY" />
          <ReadinessGauge value={readiness.compliance} label="COMPLIANCE" />
          <ReadinessGauge value={readiness.fleet} label="FLEET" />
        </div>

        {/* Threat Matrix */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            <Target className="h-3 w-3" />
            Threat Matrix
          </div>
          {threats.map((threat, index) => {
            const config = levelConfig[threat.level];
            const Icon = threat.icon;
            return (
              <motion.div
                key={threat.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border border-border/30",
                  "hover:bg-muted/30 transition-colors"
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className={cn("p-1.5 rounded-md", `${config.color}/10`)}>
                  <Icon className={cn("h-3.5 w-3.5", config.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{threat.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tabular-nums">{threat.count}</span>
                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4", `${config.color}/10 ${config.text} border-transparent`)}>
                    {config.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Missions */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Viagens Ativas</span>
          </div>
          <span className="text-lg font-bold text-primary tabular-nums">{data?.activeVoyages ?? 0}</span>
        </div>
      </CardContent>
    </Card>
  );
});
SituationRoom.displayName = 'SituationRoom';

export default SituationRoom;
