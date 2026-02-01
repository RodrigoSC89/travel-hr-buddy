/**
 * PATCH OPS-V7 FINAL — Offline Status Provider
 * 
 * Gerencia status de conectividade para operação marítima
 * Estados: ONLINE | OFFLINE | SYNCING | DEGRADED
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConnectionStatus = "ONLINE" | "OFFLINE" | "SYNCING" | "DEGRADED";

interface OfflineStatusContextType {
  status: ConnectionStatus;
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastOnline: Date | null;
  latencyMs: number | null;
  
  // Actions
  checkConnection: () => Promise<void>;
  addPendingAction: () => void;
  removePendingAction: () => void;
  setSyncing: (syncing: boolean) => void;
}

const OfflineStatusContext = createContext<OfflineStatusContextType | null>(null);

interface OfflineStatusProviderProps {
  children: ReactNode;
  checkInterval?: number; // ms, default 30s
}

export function OfflineStatusProvider({ 
  children, 
  checkInterval = 30000 
}: OfflineStatusProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>("ONLINE");
  const [pendingActions, setPendingActions] = useState(0);
  const [lastOnline, setLastOnline] = useState<Date | null>(new Date());
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Verifica conexão com Supabase
   */
  const checkConnection = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Tentar uma query leve no Supabase
      const { error } = await supabase
        .from("vessels")
        .select("id")
        .limit(1)
        .maybeSingle();

      const latency = Date.now() - startTime;
      setLatencyMs(latency);

      if (error) {
        // Erro de conexão ou permissão
        if (error.message?.includes("network") || error.message?.includes("fetch")) {
          setStatus("OFFLINE");
        } else {
          // Conexão ok mas com erro de dados
          setStatus("DEGRADED");
        }
        return;
      }

      // Sucesso - verificar latência
      setLastOnline(new Date());
      
      if (latency > 3000) {
        setStatus("DEGRADED");
      } else if (isSyncing || pendingActions > 0) {
        setStatus("SYNCING");
      } else {
        setStatus("ONLINE");
      }
    } catch {
      setStatus("OFFLINE");
      setLatencyMs(null);
    }
  }, [isSyncing, pendingActions]);

  /**
   * Listener de eventos de rede do browser
   */
  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setStatus("OFFLINE");
      setLatencyMs(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check inicial
    checkConnection();

    // Check periódico
    const interval = setInterval(checkConnection, checkInterval);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection, checkInterval]);

  /**
   * Atualiza status quando syncing muda
   */
  useEffect(() => {
    if (isSyncing && status === "ONLINE") {
      setStatus("SYNCING");
    } else if (!isSyncing && status === "SYNCING" && pendingActions === 0) {
      setStatus("ONLINE");
    }
  }, [isSyncing, status, pendingActions]);

  const addPendingAction = useCallback(() => {
    setPendingActions(prev => prev + 1);
  }, []);

  const removePendingAction = useCallback(() => {
    setPendingActions(prev => Math.max(0, prev - 1));
  }, []);

  const setSyncingState = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  const value: OfflineStatusContextType = {
    status,
    isOnline: status === "ONLINE" || status === "SYNCING",
    isSyncing,
    pendingActions,
    lastOnline,
    latencyMs,
    checkConnection,
    addPendingAction,
    removePendingAction,
    setSyncing: setSyncingState,
  };

  return (
    <OfflineStatusContext.Provider value={value}>
      {children}
    </OfflineStatusContext.Provider>
  );
}

/**
 * Hook para usar o status de offline
 */
export function useOfflineStatus() {
  const context = useContext(OfflineStatusContext);
  
  if (!context) {
    // Fallback para quando o provider não está disponível
    return {
      status: "ONLINE" as ConnectionStatus,
      isOnline: true,
      isSyncing: false,
      pendingActions: 0,
      lastOnline: new Date(),
      latencyMs: null,
      checkConnection: async () => {},
      addPendingAction: () => {},
      removePendingAction: () => {},
      setSyncing: () => {},
    };
  }
  
  return context;
}

export default OfflineStatusProvider;
