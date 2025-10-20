/**
 * Control Hub - Real-time Telemetry Dashboard
 * 
 * Centralized monitoring interface for all Nautilus system events.
 * Displays live event logs with timestamps and provides system metrics.
 */

import React, { useState, useEffect } from "react";
import { BridgeLink } from "@/core/BridgeLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  message: string;
  time: string;
  source?: string;
  data?: any;
}

export default function ControlHub() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalEvents: 0,
    status: 'operational' as 'operational' | 'warning' | 'critical',
    lastEventTime: null as string | null,
  });

  useEffect(() => {
    // Subscribe to all nautilus events
    const unsubscribe = BridgeLink.on("nautilus:event", (event) => {
      const newLog: LogEntry = {
        message: event.data?.message || 'Event received',
        time: event.timestamp,
        source: event.data?.source,
        data: event.data,
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
      
      setSystemMetrics((prev) => ({
        totalEvents: prev.totalEvents + 1,
        status: 'operational',
        lastEventTime: event.timestamp,
      }));
    });

    // Send initial event
    BridgeLink.emit("nautilus:event", {
      message: "Control Hub initialized",
      source: "ControlHub",
    });

    return () => unsubscribe();
  }, []);

  const handleTestEvent = () => {
    BridgeLink.emit("nautilus:event", {
      message: `Test event triggered at ${new Date().toLocaleTimeString()}`,
      source: "ControlHub",
      type: "test",
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSystemMetrics({
      totalEvents: 0,
      status: 'operational',
      lastEventTime: null,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚓ Nautilus Control Hub</h1>
          <p className="text-muted-foreground mt-1">
            Telemetria em Tempo Real - Sistema Operacional
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestEvent} variant="outline">
            🧪 Gerar Evento de Teste
          </Button>
          <Button onClick={handleClearLogs} variant="outline">
            🗑️ Limpar Logs
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemMetrics.status)}`}></div>
              <span className="text-2xl font-bold capitalize">{systemMetrics.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Último Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics.lastEventTime 
                ? new Date(systemMetrics.lastEventTime).toLocaleTimeString()
                : '--:--:--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>📡 Log de Eventos em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Aguardando eventos...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-2 hover:bg-gray-900 p-1 rounded">
                  <span className="text-gray-500">[{new Date(log.time).toLocaleTimeString()}]</span>
                  {log.source && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {log.source}
                    </Badge>
                  )}
                  <span className="ml-2">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Sobre o Control Hub</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            O Control Hub é o painel central de telemetria do Nautilus One, fornecendo
            monitoramento em tempo real de todos os eventos do sistema.
          </p>
          <ul>
            <li>
              <strong>BridgeLink:</strong> Sistema de comunicação entre módulos sem dependências backend
            </li>
            <li>
              <strong>Eventos em Tempo Real:</strong> Todos os módulos podem emitir eventos que aparecem aqui
            </li>
            <li>
              <strong>Métricas do Sistema:</strong> Status operacional e estatísticas de eventos
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Para emitir eventos de outros módulos, use:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              BridgeLink.emit("nautilus:event", &#123; message: "...", source: "ModuleName" &#125;)
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
