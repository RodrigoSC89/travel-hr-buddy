/**
 * ExpirationMonitorProvider - Wraps useExpirationMonitor for authenticated users
 * Runs silently in background, showing toasts for critical expirations
 */

import { useExpirationMonitor } from "@/hooks/useExpirationMonitor";

export function ExpirationMonitorProvider() {
  useExpirationMonitor({
    enabled: true,
    notifyUser: true,
    thresholds: { info: 90, warning: 30, critical: 7 },
  });

  return null;
}
