/**
 * ControlHub - Painel Central de Telemetria
 * 
 * Dashboard de monitoramento em tempo real que exibe eventos do BridgeLink,
 * estatísticas do sistema e status dos módulos.
 * 
 * @module ControlHub
 * @version 1.0.0 (Core Alpha)
 */

import React, { useState, useEffect } from "react";
import { BridgeLink, BridgeLinkEvent } from "@/core/BridgeLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ControlHub() {
  const [events, setEvents] = useState<BridgeLinkEvent[]>([]);
  const [stats, setStats] = useState(BridgeLink.getStats());
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Subscribe to all event types
    const unsubscribers = [
      BridgeLink.on("mmi:forecast:update", handleEvent),
      BridgeLink.on("mmi:job:created", handleEvent),
      BridgeLink.on("dp:incident:reported", handleEvent),
      BridgeLink.on("dp:intelligence:alert", handleEvent),
      BridgeLink.on("fmea:risk:identified", handleEvent),
      BridgeLink.on("asog:procedure:activated", handleEvent),
      BridgeLink.on("wsog:checklist:completed", handleEvent),
      BridgeLink.on("ai:analysis:complete", handleEvent),
      BridgeLink.on("system:module:loaded", handleEvent),
      BridgeLink.on("telemetry:log", handleEvent),
    ];

    // Load initial history
    setEvents(BridgeLink.getHistory(100));

    // Emit system loaded event
    BridgeLink.emit("system:module:loaded", "ControlHub", {
      timestamp: Date.now(),
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const handleEvent = (event: BridgeLinkEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 100));
    setStats(BridgeLink.getStats());
  };

  const clearLogs = () => {
    BridgeLink.clearHistory();
    setEvents([]);
    setStats(BridgeLink.getStats());
  };

  const getEventColor = (type: string): string => {
    if (type.startsWith("mmi:")) return "bg-blue-500";
    if (type.startsWith("dp:")) return "bg-red-500";
    if (type.startsWith("fmea:")) return "bg-orange-500";
    if (type.startsWith("asog:") || type.startsWith("wsog:")) return "bg-green-500";
    if (type.startsWith("ai:")) return "bg-purple-500";
    if (type.startsWith("system:")) return "bg-gray-500";
    return "bg-slate-500";
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">⚓ ControlHub</h1>
          <p className="text-muted-foreground">
            Centro de Telemetria e Monitoramento em Tempo Real
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          Core Alpha v1.0.0
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Eventos</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tipos de Eventos</CardDescription>
            <CardTitle className="text-3xl">{stats.eventTypes}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Listeners Ativos</CardDescription>
            <CardTitle className="text-3xl">{stats.activeListeners}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tamanho do Log</CardDescription>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Event Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📡 Stream de Eventos em Tempo Real</CardTitle>
              <CardDescription>
                Monitoramento de todos os eventos do BridgeLink
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoScroll ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
              >
                {autoScroll ? "🔄 Auto-scroll ON" : "⏸️ Auto-scroll OFF"}
              </Button>
              <Button variant="destructive" size="sm" onClick={clearLogs}>
                🗑️ Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum evento registrado. Aguardando eventos do sistema...
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${getEventColor(event.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          📤 {event.source}
                        </span>
                      </div>
                      <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Listener Stats */}
      <Card>
        <CardHeader>
          <CardTitle>👂 Estatísticas de Listeners</CardTitle>
          <CardDescription>Listeners ativos por tipo de evento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.listenersByType.map(({ type, count }) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <span className="text-sm font-mono">{type}</span>
                <Badge>{count}</Badge>
              </div>
            ))}
            {stats.listenersByType.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-4">
                Nenhum listener registrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
