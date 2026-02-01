/**
 * PATCH OPS-V7 FINAL — Offline Status Banner
 * 
 * Banner global que mostra status de conectividade
 * ONLINE | OFFLINE | SYNCING | DEGRADED
 */

import React from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useOfflineStatus, ConnectionStatus } from "@/providers/OfflineStatusProvider";
import { cn } from "@/lib/utils";

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
}

const STATUS_CONFIGS: Record<ConnectionStatus, StatusConfig> = {
  ONLINE: {
    icon: <Wifi className="h-4 w-4" />,
    label: "Conectado",
    description: "Sistema operacional",
    bgClass: "bg-green-500/10 border-green-500/30",
    textClass: "text-green-400",
  },
  OFFLINE: {
    icon: <WifiOff className="h-4 w-4" />,
    label: "Offline",
    description: "Trabalhando com dados locais",
    bgClass: "bg-red-500/10 border-red-500/30",
    textClass: "text-red-400",
  },
  SYNCING: {
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    label: "Sincronizando",
    description: "Enviando alterações pendentes...",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    textClass: "text-blue-400",
  },
  DEGRADED: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Conexão Instável",
    description: "Latência alta detectada",
    bgClass: "bg-amber-500/10 border-amber-500/30",
    textClass: "text-amber-400",
  },
};

interface OfflineStatusBannerProps {
  showWhenOnline?: boolean;
  variant?: "minimal" | "full";
  className?: string;
}

export function OfflineStatusBanner({
  showWhenOnline = false,
  variant = "minimal",
  className,
}: OfflineStatusBannerProps) {
  const { status, pendingActions, latencyMs, lastOnline, checkConnection } = useOfflineStatus();
  
  // Não mostrar quando online e showWhenOnline é false
  if (status === "ONLINE" && !showWhenOnline) {
    return null;
  }

  const config = STATUS_CONFIGS[status];

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm",
          config.bgClass,
          config.textClass,
          className
        )}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
        {pendingActions > 0 && (
          <span className="text-xs opacity-75">
            ({pendingActions} pendente{pendingActions > 1 ? "s" : ""})
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 border-b backdrop-blur-sm",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          <span className="font-medium">{config.label}</span>
          <span className="text-xs opacity-75 ml-2">{config.description}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs">
        {latencyMs && (
          <span className="opacity-75">
            Latência: {latencyMs}ms
          </span>
        )}
        
        {pendingActions > 0 && (
          <span>
            {pendingActions} ação pendente{pendingActions > 1 ? "s" : ""}
          </span>
        )}
        
        {lastOnline && status === "OFFLINE" && (
          <span className="opacity-75">
            Última conexão: {formatTimeAgo(lastOnline)}
          </span>
        )}
        
        <button
          onClick={() => checkConnection()}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          title="Verificar conexão"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Verificar</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Componente compacto para uso em headers
 */
export function OfflineStatusIndicator({ className }: { className?: string }) {
  const { status, pendingActions } = useOfflineStatus();
  const config = STATUS_CONFIGS[status];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
        config.bgClass,
        config.textClass,
        className
      )}
      title={`${config.label}: ${config.description}`}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
      {pendingActions > 0 && (
        <span className="bg-current/20 px-1.5 py-0.5 rounded-full text-[10px]">
          {pendingActions}
        </span>
      )}
    </div>
  );
}

/**
 * Hook para verificar se uma ação pode ser executada
 */
export function useCanPerformAction(requireOnline = false) {
  const { status, isOnline } = useOfflineStatus();
  
  if (requireOnline) {
    return status === "ONLINE";
  }
  
  // Em modo offline/degraded, ações são enfileiradas
  return true;
}

// Helper function
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "agora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  return `${Math.floor(seconds / 86400)}d atrás`;
}

export default OfflineStatusBanner;
