/**
 * PATCH 140.0 - Offline Banner Component
 * Displays network status and sync information
 */

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff, Wifi, CloudOff, Cloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncEngine } from "@/lib/syncEngine";
import { toast } from "sonner";
import { useState } from "react";;;
import { logger } from "@/lib/logger";

export const OfflineBanner = () => {
  const { isOnline, wasOffline, pendingChanges } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  // Don't show banner if online and no pending changes
  if (isOnline && !wasOffline && pendingChanges === 0) {
    return null;
  }

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    setIsSyncing(true);
    try {
      await syncEngine.pushLocalChanges();
    } catch (error) {
      logger.error("Manual sync failed:", error);
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-sm font-medium transition-all duration-300 ${
        isOnline
          ? "bg-green-600 text-white"
          : "bg-yellow-600 text-white"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 flex-shrink-0" />
              <span>Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 flex-shrink-0" />
              <span>You are offline</span>
            </>
          )}
          
          {pendingChanges > 0 && (
            <div className="flex items-center gap-2 text-sm opacity-90">
              <CloudOff className="h-4 w-4" />
              <span>{pendingChanges} pending changes</span>
            </div>
          )}
        </div>

        {isOnline && pendingChanges > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4" />
                Sync now
              </>
            )}
          </Button>
        )}

        {!isOnline && (
          <div className="text-sm opacity-90">
            Changes will sync automatically when online
          </div>
        )}
      </div>
    </div>
  );
};
