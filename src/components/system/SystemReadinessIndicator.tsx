/**
import { useMemo, useCallback } from "react";;
 * System Readiness Indicator
 * Shows overall system health and readiness status
 */

import React, { memo, useMemo } from "react";
import { CheckCircle2, AlertCircle, Wifi, WifiOff, Database, Shield, Zap } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SystemStatus {
  name: string;
  status: "operational" | "degraded" | "offline";
  icon: React.ReactNode;
}

export const SystemReadinessIndicator = memo(function SystemReadinessIndicator() {
  const { online, quality } = useNetworkStatus();

  const systems = useMemo<SystemStatus[]>(() => [
    {
      name: "Rede",
      status: !online ? "offline" : quality === "slow" ? "degraded" : "operational",
      icon: online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />
    },
    {
      name: "Banco de Dados",
      status: online ? "operational" : "degraded",
      icon: <Database className="h-3 w-3" />
    },
    {
      name: "Segurança",
      status: "operational",
      icon: <Shield className="h-3 w-3" />
    },
    {
      name: "Performance",
      status: quality === "slow" ? "degraded" : "operational",
      icon: <Zap className="h-3 w-3" />
    }
  ], [online, quality]);

  const overallStatus = useMemo(() => {
    if (systems.some(s => s.status === "offline")) return "offline";
    if (systems.some(s => s.status === "degraded")) return "degraded";
    return "operational";
  }, [systems]);

  const statusColor = {
    operational: "text-green-500 bg-green-500/10",
    degraded: "text-yellow-500 bg-yellow-500/10",
    offline: "text-red-500 bg-red-500/10"
  };

  const statusLabel = {
    operational: "Operacional",
    degraded: "Degradado",
    offline: "Offline"
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-default",
            statusColor[overallStatus]
          )}>
            {overallStatus === "operational" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{statusLabel[overallStatus]}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-48">
          <div className="space-y-2">
            <p className="font-medium text-sm">Status do Sistema</p>
            {systems.map((system) => (
              <div key={system.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {system.icon}
                  <span>{system.name}</span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 rounded",
                  statusColor[system.status]
                )}>
                  {statusLabel[system.status]}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default SystemReadinessIndicator;
