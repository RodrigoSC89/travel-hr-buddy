/**
 * Custom Hook: useSpaceWeather
 * 
 * React hook para monitorar space weather status via Edge Function ou Hybrid Service.
 * 
 * Features:
 * - Auto-refresh (configurável)
 * - Cache
 * - Error handling
 * - Loading states
 * - Retry logic
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, loading, error, refresh } = useSpaceWeather({
 *     latitude: -22.9,
 *     longitude: -43.2,
 *     hours: 6,
 *     refreshInterval: 5 * 60 * 1000, // 5 min
 *   });
 * 
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return <div>Status: {status.status}</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

export interface SpaceWeatherStatus {
  // Summary
  status: "GREEN" | "AMBER" | "RED";
  dp_gate: "PROCEED" | "CAUTION" | "HOLD";
  timestamp: string;
  
  // Space weather
  kp: number;
  kp_risk: "LOW" | "MODERATE" | "HIGH";
  
  // GNSS
  worst_pdop: number;
  avg_pdop: number;
  pdop_quality: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";
  
  // Details
  reasons: string[];
  recommendations: string[];
  
  // Optional timeline
  pdop_timeline?: Array<{
    time: string;
    pdop: number;
    hdop: number;
    vdop: number;
    satellites: number;
  }>;
  
  // Metadata
  data_source: "DP_ASOG" | "TYPESCRIPT" | "ERROR";
  location: {
    latitude: number;
    longitude: number;
    altitude_m: number;
  });
  analysis_window_hours: number;
}

export interface UseSpaceWeatherOptions {
  /** Latitude do observador */
  latitude: number;
  
  /** Longitude do observador */
  longitude: number;
  
  /** Altitude em metros (default: 0) */
  altitude?: number;
  
  /** Janela de análise em horas (default: 6) */
  hours?: number;
  
  /** Intervalo de auto-refresh em ms (default: 5 min, 0 = desabilita) */
  refreshInterval?: number;
  
  /** Endpoint (default: '/functions/v1/space-weather-status') */
  endpoint?: string;
  
  /** Modo (default: 'status') */
  mode?: "status" | "kp" | "pdop";
  
  /** Habilitar auto-refresh (default: true) */
  enabled?: boolean;
  
  /** Callback quando status muda */
  onStatusChange?: (status: SpaceWeatherStatus) => void;
  
  /** Callback quando ocorre erro */
  onError?: (error: Error) => void;
}

export interface UseSpaceWeatherResult {
  /** Status atual */
  status: SpaceWeatherStatus | null;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Última atualização */
  lastUpdate: Date | null;
  
  /** Força refresh manual */
  refresh: () => Promise<void>;
  
  /** Limpa dados */
  clear: () => void;
  
  /** Verifica se está em critical state (RED) */
  isCritical: boolean;
  
  /** Verifica se precisa atenção (AMBER) */
  needsAttention: boolean;
  
  /** Verifica se está OK (GREEN) */
  isOk: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSpaceWeather(options: UseSpaceWeatherOptions): UseSpaceWeatherResult {
  const {
    latitude,
    longitude,
    altitude = 0,
    hours = 6,
    refreshInterval = 5 * 60 * 1000, // 5 min default
    endpoint = "/functions/v1/space-weather-status",
    mode = "status",
    enabled = true,
    onStatusChange,
    onError,
  } = options;

  // State
  const [status, setStatus] = useState<SpaceWeatherStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Refs (pra evitar re-render em callbacks)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch function
  const fetchStatus = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Build URL
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        alt: altitude.toString(),
        hours: hours.toString(),
        mode,
      });

      const url = `${endpoint}?${params.toString()}`;

      // Fetch
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SpaceWeatherStatus = await response.json();

      // Update state
      setStatus(data);
      setLastUpdate(new Date());
      setError(null);

      // Callback
      if (onStatusChange) {
        onStatusChange(data);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      if (onError && err instanceof Error) {
        onError(err);
      }

      console.error("[useSpaceWeather] Error fetching status:", err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, altitude, hours, mode, endpoint, enabled, onStatusChange, onError]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Clear data
  const clear = useCallback(() => {
    setStatus(null);
    setError(null);
    setLastUpdate(null);
    setLoading(false);
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    // Initial fetch
    fetchStatus();

    // Setup interval (if refreshInterval > 0)
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStatus();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, refreshInterval, fetchStatus, clear]);

  // Computed properties
  const isCritical = status?.status === "RED";
  const needsAttention = status?.status === "AMBER";
  const isOk = status?.status === "GREEN";

  return {
    status,
    loading,
    error,
    lastUpdate,
    refresh,
    clear,
    isCritical,
    needsAttention,
    isOk,
  };
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook simplificado: só retorna se DP operations podem prosseguir
 */
export function useDPGateStatus(latitude: number, longitude: number, hours = 6) {
  const { status, loading, error } = useSpaceWeather({
    latitude,
    longitude,
    hours,
    refreshInterval: 5 * 60 * 1000,
  });

  return {
    canProceed: status?.dp_gate === "PROCEED",
    needsCaution: status?.dp_gate === "CAUTION",
    mustHold: status?.dp_gate === "HOLD",
    status: status?.dp_gate || "UNKNOWN",
    loading,
    error,
  });
}

/**
 * Hook pra monitorar só Kp
 */
export function useKpIndex(refreshInterval = 10 * 60 * 1000) {
  const { status, loading, error, lastUpdate } = useSpaceWeather({
    latitude: 0,
    longitude: 0,
    mode: "kp",
    refreshInterval,
  });

  return {
    kp: status?.kp || null,
    risk: status?.kp_risk || null,
    loading,
    error,
    lastUpdate,
  });
}

/**
 * Hook pra monitorar PDOP timeline
 */
export function usePDOPTimeline(
  latitude: number,
  longitude: number,
  hours = 6,
  refreshInterval = 10 * 60 * 1000
) {
  const { status, loading, error, lastUpdate } = useSpaceWeather({
    latitude,
    longitude,
    hours,
    mode: "pdop",
    refreshInterval,
  });

  return {
    timeline: status?.pdop_timeline || [],
    worstPDOP: status?.worst_pdop || null,
    avgPDOP: status?.avg_pdop || null,
    quality: status?.pdop_quality || null,
    loading,
    error,
    lastUpdate,
  });
}
