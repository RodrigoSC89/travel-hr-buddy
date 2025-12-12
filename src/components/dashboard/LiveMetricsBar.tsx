/**
 * Live Metrics Bar - Versão otimizada
 * PATCH 900: Removidos intervals excessivos
 */

import { memo, memo, memo, useMemo, useState } from "react";;;
import { Badge } from "@/components/ui/badge";
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Anchor,
  Radio
} from "lucide-react";

interface LiveMetric {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  status?: "success" | "warning" | "error";
}

function LiveMetricsBarComponent() {
  // Dados estáticos - não precisa de intervals constantes
  const metrics = useMemo<LiveMetric[]>(() => [
    {
      id: "vessels",
      label: "Embarcações",
      value: 47,
      icon: <Ship className="h-3 w-3" />,
      status: "success"
    },
    {
      id: "crew",
      label: "Tripulantes",
      value: 1284,
      icon: <Users className="h-3 w-3" />,
      status: "success"
    },
    {
      id: "alerts",
      label: "Alertas",
      value: 3,
      icon: <AlertTriangle className="h-3 w-3" />,
      status: "warning"
    },
    {
      id: "compliance",
      label: "Compliance",
      value: "98%",
      icon: <CheckCircle className="h-3 w-3" />,
      status: "success"
    },
    {
      id: "operations",
      label: "Operações",
      value: 156,
      icon: <Activity className="h-3 w-3" />,
      status: "success"
    },
    {
      id: "ports",
      label: "Portos",
      value: 12,
      icon: <Anchor className="h-3 w-3" />,
      status: "success"
    },
  ], []);

  const getStatusColor = (status?: string) => {
    switch (status) {
    case "success": return "text-emerald-400";
    case "warning": return "text-amber-400";
    case "error": return "text-red-400";
    default: return "text-slate-300";
    }
  };

  return (
    <div className="bg-card/95 backdrop-blur border-b border-border/50 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <div className={getStatusColor(metric.status)}>
              {metric.icon}
            </div>
            <span className="text-slate-300 dark:text-slate-300 hidden sm:inline font-medium">{metric.label}:</span>
            <span className="font-bold text-foreground">{metric.value}</span>
          </div>
        ))}
        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shrink-0 font-semibold">
          <Radio className="h-2.5 w-2.5 mr-1" />
          LIVE
        </Badge>
      </div>
    </div>
  );
}

export const LiveMetricsBar = memo(LiveMetricsBarComponent);
