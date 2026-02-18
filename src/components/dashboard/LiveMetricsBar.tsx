/**
 * Live Metrics Bar v2 - Real-time data from Supabase
 * Animated counters, pulse indicators, and live status
 */
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ship, Users, AlertTriangle, CheckCircle, Activity,
  Anchor, Radio, Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LiveMetric {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'error' | 'info';
}

function LiveMetricsBarComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['live-metrics-bar'],
    queryFn: async () => {
      const [vessels, crew, alerts, maintenance, voyages, compliance] = await Promise.all([
        supabase.from('vessels').select('id, status', { count: 'exact', head: false }).limit(500),
        supabase.from('crew_members').select('id', { count: 'exact', head: true }),
        supabase.from('soc_alerts').select('id', { count: 'exact', head: true }).is('resolved_at', null),
        supabase.from('mmi_maintenance_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('voyage_plans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('compliance_items').select('id, status', { count: 'exact', head: false }).limit(500),
      ]);

      const totalVessels = vessels.count ?? vessels.data?.length ?? 0;
      const activeVessels = vessels.data?.filter(v => v.status === 'active').length ?? 0;
      const totalCompliance = compliance.count ?? compliance.data?.length ?? 0;
      const compliantItems = compliance.data?.filter(c => c.status === 'compliant' || c.status === 'completed').length ?? 0;
      const complianceRate = totalCompliance > 0 ? Math.round((compliantItems / totalCompliance) * 100) : 100;

      return {
        vessels: totalVessels,
        activeVessels,
        crew: crew.count ?? 0,
        openAlerts: alerts.count ?? 0,
        pendingMaint: maintenance.count ?? 0,
        activeVoyages: voyages.count ?? 0,
        complianceRate,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const metrics = useMemo<LiveMetric[]>(() => {
    if (!data) return [];
    return [
      {
        id: 'vessels',
        label: 'Frota',
        value: `${data.activeVessels}/${data.vessels}`,
        icon: <Ship className="h-3 w-3" />,
        status: data.activeVessels > 0 ? 'success' : 'info',
      },
      {
        id: 'crew',
        label: 'Tripulantes',
        value: data.crew,
        icon: <Users className="h-3 w-3" />,
        status: 'success',
      },
      {
        id: 'voyages',
        label: 'Viagens',
        value: data.activeVoyages,
        icon: <Anchor className="h-3 w-3" />,
        status: data.activeVoyages > 0 ? 'success' : 'info',
      },
      {
        id: 'alerts',
        label: 'Alertas',
        value: data.openAlerts,
        icon: <AlertTriangle className="h-3 w-3" />,
        status: data.openAlerts > 5 ? 'error' : data.openAlerts > 0 ? 'warning' : 'success',
      },
      {
        id: 'maintenance',
        label: 'Manutenção',
        value: data.pendingMaint,
        icon: <Wrench className="h-3 w-3" />,
        status: data.pendingMaint > 10 ? 'warning' : 'success',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        value: `${data.complianceRate}%`,
        icon: <CheckCircle className="h-3 w-3" />,
        status: data.complianceRate >= 95 ? 'success' : data.complianceRate >= 80 ? 'warning' : 'error',
      },
    ];
  }, [data]);

  const statusColors: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    info: 'text-muted-foreground',
  };

  if (isLoading) {
    return (
      <div className="bg-card/95 backdrop-blur border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/95 backdrop-blur border-b border-border/50 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="flex items-center gap-2 text-sm whitespace-nowrap"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
          >
            <div className={statusColors[metric.status]}>
              {metric.icon}
            </div>
            <span className="text-muted-foreground hidden sm:inline font-medium text-xs">{metric.label}:</span>
            <span className="font-bold text-foreground tabular-nums">{metric.value}</span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/50 shrink-0 font-semibold">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            LIVE
          </Badge>
        </motion.div>
      </div>
    </div>
  );
}

export const LiveMetricsBar = memo(LiveMetricsBarComponent);
