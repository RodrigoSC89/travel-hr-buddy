import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * ResilienceMonitor - System operational status tracking
 * Monitors uptime and active monitoring state
 */
export default function ResilienceMonitor() {
  const [status, setStatus] = useState({
    operational: true,
    uptime: 99.8,
    monitoring: true,
  });

  useEffect(() => {
    // Simulate status updates
    const interval = setInterval(() => {
      setStatus({
        operational: Math.random() > 0.1, // 90% uptime
        uptime: 95 + Math.random() * 5, // 95-100%
        monitoring: true,
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
          <Activity className="h-5 w-5" />
          Resilience Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status Operacional</span>
            <div className="flex items-center gap-2">
              {status.operational ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Online</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">Degraded</span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Uptime</span>
            <span className="text-sm font-mono text-blue-400">
              {status.uptime.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monitoramento Ativo</span>
            <div className="flex items-center gap-2">
              {status.monitoring ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-green-400">Ativo</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">Inativo</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
