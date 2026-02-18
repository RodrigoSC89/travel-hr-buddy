/**
 * LivePulse - Indicador de status em tempo real
 * Benchmark: Linear, Vercel, GitHub Actions
 */

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface LivePulseProps {
  status?: "live" | "warning" | "critical" | "offline" | "syncing";
  size?: "sm" | "md" | "lg";
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  live: {
    color: "bg-success",
    ring: "ring-success/30",
    label: "Live",
    animate: true,
  },
  warning: {
    color: "bg-warning",
    ring: "ring-warning/30",
    label: "Atenção",
    animate: true,
  },
  critical: {
    color: "bg-destructive",
    ring: "ring-destructive/30",
    label: "Crítico",
    animate: true,
  },
  offline: {
    color: "bg-muted-foreground/40",
    ring: "ring-muted-foreground/10",
    label: "Offline",
    animate: false,
  },
  syncing: {
    color: "bg-info",
    ring: "ring-info/30",
    label: "Sincronizando",
    animate: true,
  },
};

const sizeConfig = {
  sm: { dot: "h-1.5 w-1.5", ring: "h-3 w-3", text: "text-[10px]" },
  md: { dot: "h-2 w-2", ring: "h-4 w-4", text: "text-xs" },
  lg: { dot: "h-2.5 w-2.5", ring: "h-5 w-5", text: "text-sm" },
};

export const LivePulse = memo(({
  status = "live",
  size = "md",
  label,
  showLabel = true,
  className,
}: LivePulseProps) => {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const displayLabel = label || config.label;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex items-center justify-center">
        {config.animate && (
          <span
            className={cn(
              "absolute inline-flex rounded-full opacity-40 animate-ping",
              sizes.ring,
              config.color
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full",
            sizes.dot,
            config.color
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("font-medium text-muted-foreground", sizes.text)}>
          {displayLabel}
        </span>
      )}
    </div>
  );
});

LivePulse.displayName = "LivePulse";
