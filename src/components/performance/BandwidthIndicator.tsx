/**
import { useEffect, useState } from "react";;
 * Bandwidth Indicator
 * Shows current connection quality to users - only visible on slow connections
 */

import React, { memo, useState, useEffect } from "react";
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { Wifi, WifiOff, SignalLow, SignalMedium, SignalHigh, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BandwidthIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

const connectionIcons = {
  "4g": SignalHigh,
  "3g": SignalMedium,
  "2g": SignalLow,
  "slow-2g": SignalLow,
  "offline": WifiOff,
};

const connectionColors = {
  "4g": "text-green-500 bg-green-500/10 border-green-500/20",
  "3g": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  "2g": "text-orange-500 bg-orange-500/10 border-orange-500/20",
  "slow-2g": "text-red-500 bg-red-500/10 border-red-500/20",
  "offline": "text-muted-foreground bg-muted border-border",
};

const connectionLabels = {
  "4g": "Conexão rápida",
  "3g": "Conexão moderada",
  "2g": "Conexão lenta - modo economia ativo",
  "slow-2g": "Conexão muito lenta - modo ultra economia",
  "offline": "Sem conexão - modo offline",
};

export const BandwidthIndicator = memo(function BandwidthIndicator({
  className,
}: BandwidthIndicatorProps) {
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();
  const [dismissed, setDismissed] = useState(false);
  const [lastConnectionType, setLastConnectionType] = useState(connectionType);

  // Reset dismissed state when connection changes significantly
  useEffect(() => {
    if (connectionType !== lastConnectionType) {
      setLastConnectionType(connectionType);
      if (isLowBandwidth && !["4g", "3g"].includes(connectionType)) {
        setDismissed(false);
      }
    }
  }, [connectionType, lastConnectionType, isLowBandwidth]);

  // Only show for slow connections
  const shouldShow = isLowBandwidth && !dismissed;

  const Icon = connectionIcons[connectionType as keyof typeof connectionIcons] || Wifi;
  const colorClass = connectionColors[connectionType as keyof typeof connectionColors] || connectionColors["4g"];
  const label = connectionLabels[connectionType as keyof typeof connectionLabels] || "Conectado";

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm shadow-lg",
            colorClass,
            className
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{label}</span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Inline indicator for headers/status bars
export const BandwidthBadge = memo(function BandwidthBadge({
  showLabel = true,
  className,
}: BandwidthIndicatorProps) {
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();

  const Icon = connectionIcons[connectionType as keyof typeof connectionIcons] || Wifi;
  const colorClass = connectionColors[connectionType as keyof typeof connectionColors] || connectionColors["4g"];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className={cn("h-3.5 w-3.5", colorClass.split(" ")[0])} />
      {showLabel && isLowBandwidth && (
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", colorClass)}>
          Modo Leve
        </span>
      )}
    </div>
  );
});

BandwidthIndicator.displayName = "BandwidthIndicator";
BandwidthBadge.displayName = "BandwidthBadge";
