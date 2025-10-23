import { useEffect, useState } from "react";
import { getBridgeLinkData } from "../services/bridge-link-api";
import type { DPEvent, RiskAlert } from "../types";

interface UseBridgeLinkDataReturn {
  dpEvents: DPEvent[];
  riskAlerts: RiskAlert[];
  systemStatus: string;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage BridgeLink data
 * Integrates with DP Intelligence Center and SGSO systems
 */
export function useBridgeLinkData(): UseBridgeLinkDataReturn {
  const [dpEvents, setDpEvents] = useState<DPEvent[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<string>("Normal");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBridgeLinkData();
      
      setDpEvents(data.dpEvents);
      setRiskAlerts(data.riskAlerts);
      setSystemStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Erro ao buscar dados do BridgeLink:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    dpEvents,
    riskAlerts,
    systemStatus,
    loading,
    error,
    refetch: fetchData,
  };
}
