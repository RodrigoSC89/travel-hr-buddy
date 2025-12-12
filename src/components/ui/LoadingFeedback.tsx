/**
 * PATCH 180.0 - Loading Feedback Components
 * User-friendly loading states for slow connections
 */

import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { cn } from "@/lib/utils";
import { useSlowNetwork } from "@/components/performance/SlowNetworkOptimizer";
import { Skeleton } from "./skeleton";
import { Loader2, Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

// ===== Slow Connection Banner =====

interface SlowConnectionBannerProps {
  onRetry?: () => void;
  message?: string;
}

export const SlowConnectionBanner = memo(function({ onRetry, message }: SlowConnectionBannerProps) {
  const { quality, isSlowNetwork, isCriticallySlowNetwork } = useSlowNetwork();

  if (!isSlowNetwork) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2 text-sm",
        isCriticallySlowNetwork
          ? "bg-destructive/10 text-destructive border-b border-destructive/20"
          : "bg-warning/10 text-warning-foreground border-b border-warning/20"
      )}
    >
      <div className="flex items-center gap-2">
        <Wifi className="w-4 h-4" />
        <span>
          {message || `Conexão lenta detectada (${quality.downlink.toFixed(1)} Mbps)`}
        </span>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

// ===== Progressive Loading Indicator =====

interface ProgressiveLoadingProps {
  /** Loading stage: 0-100 */
  progress?: number;
  /** Custom message */
  message?: string;
  /** Show detailed info */
  showDetails?: boolean;
  className?: string;
}

export const ProgressiveLoading = memo(function({
  progress,
  message = "Carregando...",
  showDetails = false,
  className,
}: ProgressiveLoadingProps) {
  const { quality, isSlowNetwork } = useSlowNetwork();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate progress smoothly
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slow connection messages
  const getSlowMessage = () => {
    if (!isSlowNetwork) return null;
    if (elapsedTime > 30) return "Conexão muito lenta. Por favor, aguarde...";
    if (elapsedTime > 15) return "Carregamento lento devido à conexão";
    if (elapsedTime > 5) return "Otimizando para sua conexão...";
    return null;
  });

  const slowMessage = getSlowMessage();

  return (
    <div className={cn("flex flex-col items-center gap-4 p-8", className)}>
      {/* Spinner */}
      <div className="relative">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        {isSlowNetwork && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse" />
        )}
      </div>

      {/* Message */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {slowMessage && (
          <p className="text-xs text-muted-foreground">{slowMessage}</p>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {displayProgress}%
          </p>
        </div>
      )}

      {/* Details */}
      {showDetails && isSlowNetwork && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>📶 {quality.downlink.toFixed(1)} Mbps</span>
          <span>⏱️ {elapsedTime}s</span>
          <span>🌐 {quality.effectiveType}</span>
        </div>
      )}
    </div>
  );
}

// ===== Timeout Message =====

interface TimeoutMessageProps {
  onRetry: () => void;
  message?: string;
  className?: string;
}

export const TimeoutMessage = memo(function({ 
  onRetry, 
  message = "A solicitação demorou muito",
  className 
}: TimeoutMessageProps) {
  const { isSlowNetwork } = useSlowNetwork();

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 p-8 text-center",
      className
    )}>
      <div className="p-4 rounded-full bg-muted">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground">
          {isSlowNetwork
            ? "Sua conexão está lenta. Tente novamente ou aguarde."
            : "Por favor, verifique sua conexão e tente novamente."}
        </p>
      </div>

      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ===== Offline Message =====

interface OfflineMessageProps {
  onRetry?: () => void;
  className?: string;
}

export const OfflineMessage = memo(function({ onRetry, className }: OfflineMessageProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });
  }, []);

  if (isOnline) return null;

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 p-8 text-center bg-muted/50 rounded-lg",
      className
    )}>
      <div className="p-4 rounded-full bg-muted">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-foreground">Você está offline</h3>
        <p className="text-sm text-muted-foreground">
          Verifique sua conexão com a internet
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

// ===== Data Loading Skeleton =====

interface DataSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const DataSkeleton = memo(function({ rows = 5, columns = 4, className }: DataSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`${i}-${j}`} className="h-10" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ===== Card Loading Skeleton =====

interface CardSkeletonGridProps {
  count?: number;
  columns?: number;
  className?: string;
}

export const CardSkeletonGrid = memo(function({ 
  count = 4, 
  columns = 4,
  className 
}: CardSkeletonGridProps) {
  const { optimizations } = useSlowNetwork();
  
  // Show fewer skeletons on slow networks
  const actualCount = optimizations.reduceImageQuality 
    ? Math.min(count, optimizations.pageSize) 
    : count;

  return (
    <div 
      className={cn(
        "grid gap-6",
        className
      )}
      style={{ 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        maxWidth: "100%" 
      }}
    >
      {Array.from({ length: actualCount }).map((_, i) => (
        <div key={i} className="p-6 space-y-4 bg-card border rounded-lg">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
