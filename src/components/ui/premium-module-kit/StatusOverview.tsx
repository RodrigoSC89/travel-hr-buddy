/**
 * Status Overview - Visão geral de status do sistema
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, AlertTriangle, XCircle, Clock, 
  Activity, type LucideIcon 
} from "lucide-react";

export interface StatusItem {
  id: string;
  label: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  uptime?: number;
  lastCheck?: Date | string;
  details?: string;
}

interface StatusOverviewProps {
  title?: string;
  items: StatusItem[];
  showUptime?: boolean;
  compact?: boolean;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Operacional",
    badge: "success" as const,
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Degradado",
    badge: "warning" as const,
  },
  down: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Offline",
    badge: "destructive" as const,
  },
  maintenance: {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Manutenção",
    badge: "secondary" as const,
  },
};

export function StatusOverview({
  title = "Status do Sistema",
  items,
  showUptime = true,
  compact = false
}: StatusOverviewProps) {
  const operationalCount = items.filter(i => i.status === "operational").length;
  const overallHealth = (operationalCount / items.length) * 100;

  const formatLastCheck = (lastCheck?: Date | string) => {
    if (!lastCheck) return "—";
    const date = new Date(lastCheck);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {operationalCount}/{items.length} ativos
            </span>
            <div className="w-24">
              <Progress 
                value={overallHealth} 
                className={`h-2 ${
                  overallHealth === 100 ? "[&>div]:bg-emerald-500" :
                  overallHealth >= 80 ? "[&>div]:bg-amber-500" :
                  "[&>div]:bg-red-500"
                }`}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={compact ? "space-y-2" : "space-y-3"}>
          {items.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between ${
                  compact ? "py-1" : "p-3 rounded-lg border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.details && !compact && (
                      <p className="text-xs text-muted-foreground">{item.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {showUptime && item.uptime !== undefined && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="text-sm font-medium">{item.uptime}%</p>
                    </div>
                  )}
                  {!compact && item.lastCheck && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Verificado</p>
                      <p className="text-sm">{formatLastCheck(item.lastCheck)}</p>
                    </div>
                  )}
                  <Badge variant={config.badge === "warning" ? "secondary" : config.badge}>
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
