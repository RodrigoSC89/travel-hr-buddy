// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wifi, Power, RefreshCw, AlertTriangle } from "lucide-react";
import { subscribeSystemStatus } from "@/lib/mqtt/publisher";

export default function SystemResilienceMonitor() {
  const [status, setStatus] = useState({ module: "Nautilus", state: "Desconhecido", time: null });

  useEffect(() => {
    const client = subscribeSystemStatus((msg) => {
      setStatus({ module: "DP-Sync", state: msg.status, time: new Date(msg.timestamp).toLocaleTimeString() });
    });
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="text-[var(--nautilus-primary)]" /> Monitor de Resiliência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-gray-300">
          <div className="flex items-center gap-2">
            <Wifi className={status.state === "online" ? "text-green-400" : "text-red-400"} />
            <span className="font-semibold">{status.module}</span>
          </div>
          <div className="flex items-center gap-2">
            {status.state === "failover" ? (
              <AlertTriangle className="text-yellow-500" />
            ) : (
              <RefreshCw className="text-blue-400 animate-spin-slow" />
            )}
            <span>{status.state.toUpperCase()}</span>
          </div>
          <span className="text-sm text-gray-500">{status.time}</span>
        </div>
      </CardContent>
    </Card>
  );
}
