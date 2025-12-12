/**
import { useEffect, useState } from "react";;
 * Connection Indicator Component
 * PATCH 834: Visual feedback for network status
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { cn } from "@/lib/utils";

interface ConnectionIndicatorProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showAlways?: boolean;
  showSpeed?: boolean;
}

export function ConnectionIndicator({
  position = "bottom-left",
  showAlways = false,
  showSpeed = true,
}: ConnectionIndicatorProps) {
  const { connectionType, config } = useBandwidthOptimizer();
  const [visible, setVisible] = useState(false);
  const [downlink, setDownlink] = useState<number | null>(null);

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      setDownlink(connection.downlink);
      
      const handleChange = () => {
        setDownlink(connection.downlink);
      };
      
      connection.addEventListener("change", handleChange);
      return () => connection.removeEventListener("change", handleChange);
    }
  }, []);

  // Show indicator on slow connections or always
  useEffect(() => {
    if (showAlways) {
      setVisible(true);
      return;
    }

    const shouldShow = ["2g", "slow-2g", "offline", "3g"].includes(connectionType);
    setVisible(shouldShow);

    // Auto-hide after delay on fast connections
    if (!shouldShow) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connectionType, showAlways]);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const getConnectionIcon = () => {
    switch (connectionType) {
    case "offline":
      return <WifiOff className="h-4 w-4" />;
    case "slow-2g":
    case "2g":
      return <SignalLow className="h-4 w-4" />;
    case "3g":
      return <SignalMedium className="h-4 w-4" />;
    case "4g":
    default:
      return <SignalHigh className="h-4 w-4" />;
    }
  };

  const getConnectionLabel = () => {
    switch (connectionType) {
    case "offline":
      return "Offline";
    case "slow-2g":
      return "Muito lento";
    case "2g":
      return "Lento";
    case "3g":
      return "Moderado";
    case "4g":
    default:
      return "Rápido";
    }
  };

  const getConnectionColor = () => {
    switch (connectionType) {
    case "offline":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "slow-2g":
    case "2g":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "3g":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "4g":
    default:
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm",
          positionClasses[position],
          getConnectionColor()
        )}
      >
        {getConnectionIcon()}
        <span>{getConnectionLabel()}</span>
        {showSpeed && downlink !== null && (
          <span className="opacity-70">
            {downlink.toFixed(1)} Mbps
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Compact badge version
export function ConnectionBadge({ className }: { className?: string }) {
  const { connectionType } = useBandwidthOptimizer();
  
  const isSlowConnection = ["2g", "slow-2g", "3g"].includes(connectionType);
  const isOffline = connectionType === "offline";

  if (!isSlowConnection && !isOffline) return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
      isOffline 
        ? "bg-red-500/10 text-red-500" 
        : "bg-yellow-500/10 text-yellow-500",
      className
    )}>
      {isOffline ? <WifiOff className="h-3 w-3" /> : <SignalLow className="h-3 w-3" />}
      <span>{isOffline ? "Offline" : "Conexão lenta"}</span>
    </div>
  );
}

// Hook to check if features should be disabled
export function useSlowConnectionWarning() {
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();
  
  const showWarning = isLowBandwidth;
  const warningMessage = connectionType === "offline"
    ? "Você está offline. Algumas funcionalidades podem estar limitadas."
    : "Conexão lenta detectada. O carregamento pode demorar mais.";

  return { showWarning, warningMessage, connectionType };
}
