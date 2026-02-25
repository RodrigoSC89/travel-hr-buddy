/**
 * OperationalPulseStrip - Live animated operational pulse indicators
 * Shows real-time system heartbeat with smooth animations
 */
import { motion } from "framer-motion";
import { Activity, Ship, Users, Shield, Wrench, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PulseMetric {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  pulse?: boolean;
}

export function OperationalPulseStrip() {
  const { data: kpis } = useQuery({
    queryKey: ["dashboard-kpis-pulse"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_dashboard_kpis");
      return data as Record<string, number> | null;
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const metrics: PulseMetric[] = [
    { label: "Frota", value: kpis?.vessels_active ?? 0, icon: Ship, color: "text-primary", pulse: true },
    { label: "Tripulação", value: kpis?.crew_onboard ?? 0, icon: Users, color: "text-info" },
    { label: "Manutenção", value: kpis?.maint_pending ?? 0, icon: Wrench, color: "text-warning", pulse: (kpis?.maint_pending ?? 0) > 5 },
    { label: "Compliance", value: kpis?.compliance_score ?? 100, icon: Shield, color: "text-success" },
    { label: "Alertas", value: kpis?.incidents_open ?? 0, icon: AlertTriangle, color: "text-destructive", pulse: (kpis?.incidents_open ?? 0) > 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 px-4 py-2 bg-card/40 backdrop-blur-sm border-b border-border/20 overflow-x-auto"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Activity className="h-3.5 w-3.5 text-success" />
        </motion.div>
        <span className="font-medium">LIVE</span>
      </div>

      <div className="h-4 w-px bg-border/40" />

      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-1.5 text-xs shrink-0"
        >
          <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
          <span className="text-muted-foreground">{m.label}:</span>
          <motion.span
            key={m.value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`font-semibold tabular-nums ${m.color}`}
          >
            {m.label === "Compliance" ? `${m.value}%` : m.value}
          </motion.span>
          {m.pulse && m.value > 0 && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`h-1.5 w-1.5 rounded-full bg-current ${m.color}`}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
