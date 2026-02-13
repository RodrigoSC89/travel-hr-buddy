/**
 * Connection Indicator Component
 * PATCH 834: Visual feedback for network status
 * PATCH iOS PWA v14: Removed offline blocking - navigator.onLine unreliable
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { useBandwidthOptimizer } from '@/lib/performance/low-bandwidth-optimizer';
import { cn } from '@/lib/utils';

interface ConnectionIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showAlways?: boolean;
  showSpeed?: boolean;
}

export function ConnectionIndicator({
  position = 'bottom-left',
  showAlways = false,
  showSpeed = true,
}: ConnectionIndicatorProps) {
  const { connectionType, config } = useBandwidthOptimizer();
  const [visible, setVisible] = useState(false);
  const [downlink, setDownlink] = useState<number | null>(null);

  useEffect(() => {
    const connection = (navigator as unknown as Record<string, unknown>).connection as { downlink: number; addEventListener: (e: string, cb: () => void) => void; removeEventListener: (e: string, cb: () => void) => void } | undefined;
    if (connection) {
      setDownlink(connection.downlink);
      
      const handleChange = () => {
        setDownlink(connection.downlink);
      };
      
      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  // PATCH iOS PWA v14: Never show offline indicator, only slow connection warnings
  useEffect(() => {
    if (showAlways) {
      setVisible(true);
      return;
    }

    // Only show for slow connections, NEVER for "offline"
    const shouldShow = ['2g', 'slow-2g', '3g'].includes(connectionType);
    setVisible(shouldShow);

    // Auto-hide after delay
    if (!shouldShow) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connectionType, showAlways]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4" />;
      case '3g':
        return <SignalMedium className="h-4 w-4" />;
      case '4g':
      default:
        return <SignalHigh className="h-4 w-4" />;
    }
  };

  const getConnectionLabel = () => {
    switch (connectionType) {
      case 'slow-2g':
        return 'Muito lento';
      case '2g':
        return 'Lento';
      case '3g':
        return 'Moderado';
      case '4g':
      default:
        return 'Rápido';
    }
  };

  const getConnectionColor = () => {
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 'bg-warning/10 text-warning border-warning/20';
      case '3g':
        return 'bg-info/10 text-info border-info/20';
      case '4g':
      default:
        return 'bg-success/10 text-success border-success/20';
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
          'fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm',
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

// Compact badge version - PATCH iOS PWA v14: Never show offline badge
export function ConnectionBadge({ className }: { className?: string }) {
  const { connectionType } = useBandwidthOptimizer();
  
  // Only show for slow connections, never for "offline"
  const isSlowConnection = ['2g', 'slow-2g', '3g'].includes(connectionType);

  if (!isSlowConnection) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs',
      'bg-warning/10 text-warning',
      className
    )}>
      <SignalLow className="h-3 w-3" />
      <span>Conexão lenta</span>
    </div>
  );
}

// Hook to check if features should be disabled - PATCH iOS PWA v14: Never return offline message
export function useSlowConnectionWarning() {
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();
  
  // Only show warning for slow connections, never for "offline"
  const isSlowConnection = ['2g', 'slow-2g', '3g'].includes(connectionType);
  const showWarning = isLowBandwidth && isSlowConnection;
  const warningMessage = 'Conexão lenta detectada. O carregamento pode demorar mais.';

  return { showWarning, warningMessage, connectionType };
}
