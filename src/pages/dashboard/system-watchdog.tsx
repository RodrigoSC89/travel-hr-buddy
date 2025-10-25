/**
 * PATCH 93.0 - System Watchdog Page
 * Dashboard route for system monitoring
 */

import React, { Suspense } from "react";
import { SystemWatchdog } from "@/modules/system-watchdog";
import { Loader2 } from "lucide-react";

export default function SystemWatchdogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SystemWatchdog />
    </Suspense>
  );
}
