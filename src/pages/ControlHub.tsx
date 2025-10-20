/**
 * Control Hub - Nautilus Telemetry and Monitoring Dashboard
 * 
 * Central operational dashboard that displays real-time events and logs from all modules
 * Monitors system activity via BridgeLink event bus
 */

import React, { useState, useEffect } from "react";
import { BridgeLink } from "@/core/BridgeLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  message: string;
  time: string;
  type: string;
  data?: any;
}

export default function ControlHub() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Subscribe to nautilus events
    const unsubscribe = BridgeLink.on("nautilus:event", (eventData) => {
      const newLog: LogEntry = {
        message: eventData.data?.message || "Event received",
        time: eventData.timestamp || new Date().toISOString(),
        type: eventData.type || "nautilus:event",
        data: eventData.data,
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
    });

    // Emit initial event to show system is active
    BridgeLink.emit("nautilus:event", {
      message: "⚓ Control Hub initialized and monitoring",
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
    BridgeLink.emit("nautilus:event", {
      message: "🧹 Logs cleared by user",
    });
  };

  const testEvent = () => {
    BridgeLink.emit("nautilus:event", {
      message: "🧪 Test event triggered from Control Hub",
      source: "ControlHub",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="border-green-700 bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-400 font-mono flex items-center gap-2">
                ⚓ Nautilus Control Hub
                {isActive && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                    ATIVO
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-green-500/70 font-mono">
                Telemetria em Tempo Real – Monitoramento de Eventos do Sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={testEvent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-sm"
              >
                🧪 Testar Evento
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono text-sm"
              >
                🧹 Limpar
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-green-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-400 font-mono">
                    Total de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-300 font-mono">
                    {logs.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-green-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-400 font-mono">
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-300 font-mono">
                    ✓ Operacional
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-green-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-400 font-mono">
                    Último Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-300 font-mono">
                    {logs[0] ? new Date(logs[0].time).toLocaleTimeString() : "--:--:--"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-green-700">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 font-mono">
                  📡 Log de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded border border-green-700 bg-gray-950 p-4">
                  {logs.length === 0 ? (
                    <div className="text-center text-green-500/50 font-mono py-8">
                      Aguardando eventos...
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono text-sm">
                      {logs.map((log, i) => (
                        <div
                          key={i}
                          className="border-b border-green-900/30 pb-2 hover:bg-green-950/30 px-2 py-1 rounded"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 text-xs whitespace-nowrap">
                              [{new Date(log.time).toLocaleTimeString()}]
                            </span>
                            <span className="text-green-400 flex-1">{log.message}</span>
                          </div>
                          {log.data && log.data.source && (
                            <div className="text-green-600/60 text-xs ml-20 mt-1">
                              Source: {log.data.source}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
