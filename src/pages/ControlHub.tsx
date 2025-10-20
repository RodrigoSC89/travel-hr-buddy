/**
 * Control Hub Page
 * 
 * Main dashboard page for Nautilus Control Hub
 * Displays module status, BridgeLink connectivity, and sync information
 */

import React, { useEffect, useState } from "react";
import { HubDashboard } from "@/modules/control_hub/hub_ui";
import type { SystemStatus } from "@/modules/control_hub/hub_monitor";
import type { BridgeLinkStatus } from "@/modules/control_hub/hub_bridge";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

interface DashboardData {
  modules: SystemStatus;
  bridge: BridgeLinkStatus;
  cache: {
    pending: number;
    sizeMB: number;
    isFull: boolean;
  };
  sync: {
    lastSync: Date | null;
    inProgress: boolean;
  };
}

const ControlHub: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/control-hub/status");
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      const result = await response.json();
      
      // Convert date strings back to Date objects
      const processedData = {
        ...result.data,
        sync: {
          ...result.data.sync,
          lastSync: result.data.sync.lastSync
            ? new Date(result.data.sync.lastSync)
            : null,
        },
      };

      setData(processedData);
      setError(null);
    } catch (err) {
      logger.error("Error fetching Control Hub status", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!data) return;

    try {
      setData({
        ...data,
        sync: {
          ...data.sync,
          inProgress: true,
        },
      });

      const response = await fetch("/api/control-hub/sync", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sync");
      }

      const result = await response.json();
      logger.info("Sync completed", { result });

      // Refresh status after sync
      await fetchStatus();
    } catch (err) {
      logger.error("Error syncing", err);
      setError(err instanceof Error ? err.message : "Sync failed");
      
      // Reset sync status
      if (data) {
        setData({
          ...data,
          sync: {
            ...data.sync,
            inProgress: false,
          },
        });
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando Control Hub...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar Control Hub</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <HubDashboard
        moduleStatus={data.modules}
        bridgeStatus={data.bridge}
        cacheInfo={data.cache}
        syncInfo={data.sync}
        onRefresh={handleRefresh}
        onSync={handleSync}
      />
    </div>
  );
};

export default ControlHub;
