/**
 * PATCH 140.0 - Network Status Hook
 * Provides real-time network connectivity status
 */

import { useState, useEffect } from "react";
import { syncEngine } from "@/lib/syncEngine";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  pendingChanges: number;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wasOffline: false,
    pendingChanges: 0
  });

  useEffect(() => {
    // Update pending changes count
    const updatePendingCount = async () => {
      const count = await syncEngine.getPendingCount();
      setStatus(prev => ({ ...prev, pendingChanges: count }));
    };

    updatePendingCount();

    // Handle online event
    const handleOnline = async () => {
      console.log("Network: Online");
      setStatus(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        pendingChanges: prev.pendingChanges
      }));
      
      // Update pending count
      await updatePendingCount();
    };

    // Handle offline event
    const handleOffline = () => {
      console.log("Network: Offline");
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true
      }));
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for sync progress
    const unsubscribe = syncEngine.onSyncProgress((stats) => {
      setStatus(prev => ({
        ...prev,
        pendingChanges: stats.pending
      }));
    });

    // Check status periodically
    const interval = setInterval(async () => {
      const isOnline = navigator.onLine;
      if (isOnline !== status.isOnline) {
        if (isOnline) {
          await handleOnline();
        } else {
          handleOffline();
        }
      }
      await updatePendingCount();
    }, 3000);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return status;
};
