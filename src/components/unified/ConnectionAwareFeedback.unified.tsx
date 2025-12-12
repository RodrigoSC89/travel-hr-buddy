/**
import { useEffect, useState } from "react";;
 * UNIFIED Connection-Aware Feedback Components
 * 
 * Componentes visuais para feedback em conexões lentas:
 * - Banner de conexão lenta
 * - Indicador de qualidade
 * - Loading adaptativo
 * 
 * PATCH 178.2 - Visual Feedback for Slow Connections
 */

import React, { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Signal, AlertTriangle, RefreshCw, CloudOff, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useConnectionQuality,
  detectConnectionQuality,
  getLoadingMessage,
  estimateLoadTime,
  type ConnectionQuality,
  type ConnectionMetrics,
} from "@/lib/unified/slow-connection.unified";

// ==================== CONNECTION BANNER ====================

export interface ConnectionBannerProps {
  className?: string;
  showOnlyWhenSlow?: boolean;
  onRetry?: () => void;
  dismissable?: boolean;
}

export const ConnectionBanner = memo(function ConnectionBanner({
  className,
  showOnlyWhenSlow = true,
  onRetry,
  dismissable = true,
}: ConnectionBannerProps) {
  const connection = useConnectionQuality();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when connection changes significantly
  useEffect(() => {
    if (connection.quality === "offline") {
      setDismissed(false);
    }
  }, [connection.quality]);

  if (dismissed) return null;
  
  if (showOnlyWhenSlow && 
      connection.quality !== "slow" && 
      connection.quality !== "offline" &&
      connection.quality !== "moderate") {
    return null;
  }

  const bannerConfig = getBannerConfig(connection.quality);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 text-sm",
        bannerConfig.bgClass,
        bannerConfig.textClass,
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        {bannerConfig.icon}
        <span>{bannerConfig.message}</span>
        {connection.effectiveBandwidth > 0 && (
          <span className="text-xs opacity-75">
            ({connection.effectiveBandwidth.toFixed(1)} Mbps)
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {onRetry && connection.quality !== "offline" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar novamente
          </Button>
        )}
        
        {dismissable && connection.quality !== "offline" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-6 px-2 text-xs"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
});
ConnectionBanner.displayName = "ConnectionBanner";

// ==================== CONNECTION BADGE ====================

export interface ConnectionBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ConnectionBadge = memo(function ConnectionBadge({
  className,
  showLabel = false,
  size = "md",
}: ConnectionBadgeProps) {
  const connection = useConnectionQuality();
  const config = getBadgeConfig(connection.quality);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      {React.cloneElement(config.icon as React.ReactElement, {
        className: sizeClasses[size],
      })}
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  );
});
ConnectionBadge.displayName = "ConnectionBadge";

// ==================== ADAPTIVE LOADER ====================

export interface AdaptiveLoaderProps {
  message?: string;
  dataSizeKb?: number;
  className?: string;
  showProgress?: boolean;
  variant?: "spinner" | "bar" | "dots";
}

export const AdaptiveLoader = memo(function AdaptiveLoader({
  message,
  dataSizeKb = 50,
  className,
  showProgress = true,
  variant = "spinner",
}: AdaptiveLoaderProps) {
  const connection = useConnectionQuality();
  const [progress, setProgress] = useState(0);
  
  const displayMessage = message || getLoadingMessage(connection);
  const estimatedMs = estimateLoadTime(dataSizeKb, connection);
  
  // Simulate progress for visual feedback
  useEffect(() => {
    if (!showProgress) return;
    
    const interval = Math.max(100, estimatedMs / 100);
    const step = 100 / (estimatedMs / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Don't go to 100% until actually complete
        return Math.min(95, prev + step);
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [estimatedMs, showProgress]);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-6", className)}>
      {/* Loader Animation */}
      {variant === "spinner" && (
        <div className="relative">
          <div
            className={cn(
              "animate-spin rounded-full border-4",
              "border-primary/20 border-t-primary",
              connection.quality === "slow" ? "h-16 w-16" : "h-12 w-12"
            )}
          />
          {connection.quality === "slow" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Signal className="h-5 w-5 text-primary animate-pulse" />
            </div>
          )}
        </div>
      )}
      
      {variant === "bar" && (
        <Progress 
          value={progress} 
          className={cn(
            "w-48",
            connection.quality === "slow" && "h-3"
          )}
        />
      )}
      
      {variant === "dots" && (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary animate-bounce",
                connection.quality === "slow" ? "h-4 w-4" : "h-3 w-3"
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: connection.quality === "slow" ? "1.5s" : "1s",
              }}
            />
          ))}
        </div>
      )}

      {/* Message */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{displayMessage}</p>
        
        {showProgress && estimatedMs > 3000 && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            Tempo estimado: ~{Math.ceil(estimatedMs / 1000)}s
          </p>
        )}
        
        {connection.quality === "slow" && (
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-xs">
            💡 Seus dados estão sendo carregados de forma otimizada para sua conexão
          </p>
        )}
      </div>
    </div>
  );
});
AdaptiveLoader.displayName = "AdaptiveLoader";

// ==================== OFFLINE FALLBACK ====================

export interface OfflineFallbackProps {
  cachedAt?: Date;
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const OfflineFallback = memo(function OfflineFallback({
  cachedAt,
  onRetry,
  children,
  className,
}: OfflineFallbackProps) {
  const connection = useConnectionQuality();

  if (connection.isOnline) {
    return <>{children}</>;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <div className="relative">
        <CloudOff className="h-16 w-16 text-muted-foreground/50" />
        <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-1">
          <WifiOff className="h-4 w-4 text-destructive-foreground" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Sem conexão</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Você está offline. Mostrando dados salvos localmente.
        </p>
        
        {cachedAt && (
          <p className="text-xs text-muted-foreground/70">
            Última atualização: {cachedAt.toLocaleString("pt-BR")}
          </p>
        )}
      </div>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar reconectar
        </Button>
      )}
      
      {children && (
        <div className="w-full mt-4 opacity-75">
          {children}
        </div>
      )}
    </div>
  );
});
OfflineFallback.displayName = "OfflineFallback";

// ==================== HELPER FUNCTIONS ====================

function getBannerConfig(quality: ConnectionQuality) {
  switch (quality) {
  case "offline":
    return {
      bgClass: "bg-destructive",
      textClass: "text-destructive-foreground",
      icon: <WifiOff className="h-4 w-4" />,
      message: "Sem conexão com a internet",
    };
  case "slow":
    return {
      bgClass: "bg-amber-500",
      textClass: "text-amber-950",
      icon: <AlertTriangle className="h-4 w-4" />,
      message: "Conexão lenta detectada. Carregando de forma otimizada...",
    };
  case "moderate":
    return {
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-900",
      icon: <Signal className="h-4 w-4" />,
      message: "Conexão moderada",
    };
  case "good":
    return {
      bgClass: "bg-green-100",
      textClass: "text-green-900",
      icon: <Wifi className="h-4 w-4" />,
      message: "Conexão boa",
    };
  case "excellent":
    return {
      bgClass: "bg-green-500",
      textClass: "text-white",
      icon: <Zap className="h-4 w-4" />,
      message: "Conexão excelente",
    };
  }
}

function getBadgeConfig(quality: ConnectionQuality) {
  switch (quality) {
  case "offline":
    return {
      bgClass: "bg-destructive/10",
      textClass: "text-destructive",
      borderClass: "border-destructive/30",
      icon: <WifiOff />,
      label: "Offline",
    };
  case "slow":
    return {
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-600",
      borderClass: "border-amber-500/30",
      icon: <Signal />,
      label: "Lenta",
    };
  case "moderate":
    return {
      bgClass: "bg-yellow-500/10",
      textClass: "text-yellow-600",
      borderClass: "border-yellow-500/30",
      icon: <Wifi />,
      label: "Moderada",
    };
  case "good":
    return {
      bgClass: "bg-green-500/10",
      textClass: "text-green-600",
      borderClass: "border-green-500/30",
      icon: <Wifi />,
      label: "Boa",
    };
  case "excellent":
    return {
      bgClass: "bg-green-600/10",
      textClass: "text-green-700",
      borderClass: "border-green-600/30",
      icon: <Zap />,
      label: "Excelente",
    };
  }
}

// ==================== EXPORTS ====================

export {
  getBannerConfig,
  getBadgeConfig,
};
