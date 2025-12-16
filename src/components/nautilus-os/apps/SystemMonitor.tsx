import React from "react";
import { Activity, Zap, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SystemMonitor() {
  const systemMetrics = [
    { label: "Status", value: "Operacional", icon: Activity, variant: "default" as const },
    { label: "Uptime", value: "48h 32m", icon: Clock, variant: "secondary" as const },
    { label: "Performance", value: "98%", icon: Zap, variant: "default" as const },
    { label: "Segurança", value: "Alto", icon: Shield, variant: "default" as const },
  ];

  return (
    <div className="space-y-3">
      {systemMetrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30"
        >
          <div className="flex items-center gap-2">
            <metric.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{metric.label}</span>
          </div>
          <Badge variant={metric.variant}>{metric.value}</Badge>
        </div>
      ))}
    </div>
  );
}
