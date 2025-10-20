import React, { useState, useEffect } from "react";
import { BridgeLink } from "@/core/BridgeLink";

/**
 * Control Hub – Painel central do Nautilus One
 * Monitora eventos entre módulos (MMI, DP Intelligence, FMEA, etc.)
 */
export default function ControlHub() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsub = BridgeLink.on("nautilus:event", (data) => {
      setLogs((prev) => [...prev, { ...data, time: new Date().toISOString() }]);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-4 text-sm font-mono bg-gray-900 text-green-400">
      <h1 className="text-lg mb-3">⚓ Nautilus Control Hub – Telemetria Ativa</h1>
      <div className="border border-green-700 rounded p-2 h-[500px] overflow-y-auto">
        {logs.length === 0 ? (
          <div>🟢 Aguardando eventos...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i}>[{log.time}] {log.message}</div>
          ))
        )}
      </div>
    </div>
  );
}
