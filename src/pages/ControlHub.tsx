import React, { useState, useEffect } from "react";
import { BridgeLink } from "@/core/BridgeLink";

/**
 * Control Hub – Central Nautilus One monitoring panel
 * Monitors events between modules (MMI, DP Intelligence, FMEA, etc.)
 * Provides real-time telemetry dashboard for system health monitoring
 */

interface LogEntry {
  message: string;
  time: string;
  module?: string;
  [key: string]: unknown;
}

export default function ControlHub() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Subscribe to all nautilus events
    const unsubscribe = BridgeLink.on("nautilus:event", (data) => {
      const logEntry: LogEntry = {
        ...(data as object),
        time: new Date().toISOString(),
      };
      
      setLogs((prev) => [...prev, logEntry]);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-green-400 mb-3">
        ⚓ Nautilus Control Hub – Telemetria Ativa
      </h1>
      
      <div className="border border-green-700 rounded-lg p-4 bg-black text-green-400 font-mono text-sm h-[500px] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-green-500">🟢 Aguardando eventos...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1 hover:bg-green-950 px-2 py-1 rounded">
              <span className="text-gray-500">[{log.time}]</span>{" "}
              {log.module && <span className="text-yellow-400">[{log.module}]</span>}{" "}
              <span className="text-green-300">{log.message}</span>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Terminal-style monitoring panel • Events update in real-time
      </div>
    </div>
  );
}
