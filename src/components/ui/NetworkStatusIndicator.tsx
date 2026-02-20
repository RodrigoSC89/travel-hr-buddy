/**
 * NetworkStatusIndicator - Real-time connectivity feedback
 * Shows offline/degraded/online status with maritime context
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectionQuality = "offline" | "poor" | "fair" | "good" | "excellent";

function getConnectionQuality(): ConnectionQuality {
  if (!navigator.onLine) return "offline";

  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
  if (!conn) return "good";

  const type = conn.effectiveType;
  const downlink = conn.downlink ?? 10;

  if (type === "2g" || downlink < 0.5) return "poor";
  if (type === "3g" || downlink < 2) return "fair";
  if (downlink < 10) return "good";
  return "excellent";
}

const qualityConfig: Record<ConnectionQuality, {
  icon: React.ElementType;
  label: string;
  color: string;
  show: boolean;
}> = {
  offline: {
    icon: WifiOff,
    label: "Sem conexão",
    color: "text-destructive bg-destructive/10 border-destructive/20",
    show: true,
  },
  poor: {
    icon: SignalLow,
    label: "Conexão fraca",
    color: "text-warning bg-warning/10 border-warning/20",
    show: true,
  },
  fair: {
    icon: SignalMedium,
    label: "Conexão moderada",
    color: "text-warning bg-warning/10 border-warning/20",
    show: true,
  },
  good: {
    icon: Signal,
    label: "Online",
    color: "text-primary bg-primary/10 border-primary/20",
    show: false,
  },
  excellent: {
    icon: Wifi,
    label: "Excelente",
    color: "text-primary bg-primary/10 border-primary/20",
    show: false,
  },
};

interface NetworkStatusIndicatorProps {
  className?: string;
  showWhenGood?: boolean;
  compact?: boolean;
}

export function NetworkStatusIndicator({
  className,
  showWhenGood = false,
  compact = false,
}: NetworkStatusIndicatorProps) {
  const [quality, setQuality] = useState<ConnectionQuality>(getConnectionQuality);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const update = () => {
      const prev = quality;
      const next = getConnectionQuality();
      setQuality(next);

      // Show "reconnected" briefly
      if ((prev === "offline" || prev === "poor") && (next === "good" || next === "excellent")) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 3000);
      }
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const conn = (navigator as Navigator & { connection?: { addEventListener?: (type: string, fn: () => void) => void } }).connection;
    conn?.addEventListener?.("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [quality]);

  const config = qualityConfig[quality];
  const shouldShow = showWhenGood || config.show || justReconnected;
  const Icon = justReconnected ? Wifi : config.icon;
  const displayQuality = justReconnected ? "excellent" : quality;
  const displayConfig = justReconnected ? qualityConfig.excellent : config;
  const displayLabel = justReconnected ? "Conexão restaurada" : displayConfig.label;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
            displayConfig.color,
            className
          )}
          role="status"
          aria-live="polite"
        >
          <Icon className={cn("shrink-0", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          {!compact && <span>{displayLabel}</span>}
          {displayQuality === "offline" && !compact && (
            <span className="opacity-70">• Modo offline ativo</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NetworkStatusIndicator;
