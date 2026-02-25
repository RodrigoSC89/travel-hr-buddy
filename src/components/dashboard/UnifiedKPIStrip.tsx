/**
 * UnifiedKPIStrip - Real-time KPI strip using useDashboardKPIs RPC
 * Displays critical fleet metrics with animated counters
 */
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { motion } from "framer-motion";
import { Ship, Users, Wrench, Shield, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIChip {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Ship;
  color: string;
  alert?: boolean;
}

function KPIItem({ chip, index }: { chip: KPIChip; index: number }) {
  const Icon = chip.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card/60 backdrop-blur-sm min-w-[120px]",
        chip.alert ? "border-destructive/30 bg-destructive/5" : "border-border/40"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", chip.color)} />
      <div className="flex flex-col">
        <span className="text-sm font-bold font-mono tabular-nums leading-none">
          {chip.value}{chip.suffix}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{chip.label}</span>
      </div>
    </motion.div>
  );
}

export function UnifiedKPIStrip() {
  const { kpis, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-28 rounded-lg bg-muted/30 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  const chips: KPIChip[] = [
    { label: "Frota Ativa", value: kpis.active_vessels, suffix: `/${kpis.total_vessels}`, icon: Ship, color: "text-primary" },
    { label: "Tripulação", value: kpis.active_crew, suffix: `/${kpis.total_crew}`, icon: Users, color: "text-info" },
    { label: "Manutenções", value: kpis.pending_maintenance, icon: Wrench, color: "text-warning", alert: kpis.overdue_maintenance > 0 },
    { label: "Certs Expirando", value: kpis.expiring_certificates_30d, icon: Shield, color: "text-accent-foreground", alert: kpis.expiring_certificates_30d > 3 },
    { label: "Incidentes", value: kpis.open_incidents, icon: AlertTriangle, color: "text-destructive", alert: kpis.open_incidents > 0 },
    { label: "Prontidão", value: kpis.operational_readiness, suffix: "%", icon: Activity, color: kpis.operational_readiness >= 80 ? "text-success" : "text-warning" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
      {chips.map((chip, i) => (
        <KPIItem key={chip.label} chip={chip} index={i} />
      ))}
    </div>
  );
}
