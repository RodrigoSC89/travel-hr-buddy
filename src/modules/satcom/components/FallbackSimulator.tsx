/**
 * Fallback Simulator Component
 * Simulates and tests fallback scenarios for offline connectivity
 * Patch 142.1 - Enhanced with actual simulation controls
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, StopCircle, RotateCw, Power, XCircle, CheckCircle } from "lucide-react";
import type { SatcomConnection } from "../index";
import type { SimulationEvent } from "../simulator";

interface FallbackSimulatorProps {
  connections: SatcomConnection[];
  onDisconnect?: (connectionId: string) => void;
  onReconnect?: (connectionId: string) => void;
  simulationEvents?: SimulationEvent[];
  onClearEvents?: () => void;
}

export const FallbackSimulator: React.FC<FallbackSimulatorProps> = ({ 
  connections,
  onDisconnect,
  onReconnect,
  simulationEvents = [],
  onClearEvents,
}) => {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  const handleDisconnect = () => {
    if (selectedConnection && onDisconnect) {
      onDisconnect(selectedConnection);
    }
  };

  const handleReconnect = () => {
    if (selectedConnection && onReconnect) {
      onReconnect(selectedConnection);
    }
  };

  const handleReset = () => {
    setSelectedConnection(null);
    if (onClearEvents) {
      onClearEvents();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-5 w-5" />
          Simulador de Fallback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Selecione uma Conexão</div>
          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                  selectedConnection === conn.id
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent"
                }`}
                onClick={() => setSelectedConnection(conn.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      conn.status === "connected"
                        ? "bg-green-500"
                        : conn.status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium">{conn.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {conn.provider}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {conn.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDisconnect}
            disabled={!selectedConnection || connections.find(c => c.id === selectedConnection)?.status === "disconnected"}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Desconectar
          </Button>
          <Button
            onClick={handleReconnect}
            disabled={!selectedConnection || connections.find(c => c.id === selectedConnection)?.status === "connected"}
            variant="default"
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Reconectar
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {simulationEvents.length > 0 && (
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Log de Simulação
            </div>
            {simulationEvents.map((event, index) => (
              <div key={index} className="text-xs font-mono">
                <span className="text-muted-foreground">
                  [{new Date(event.timestamp).toLocaleTimeString('pt-BR')}]
                </span>{' '}
                <span className={
                  event.type === "disconnect" ? "text-red-500" :
                  event.type === "fallback_activated" ? "text-orange-500" :
                  "text-green-500"
                }>
                  {event.message}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Este simulador testa o comportamento do sistema em cenários de perda de
          conectividade, garantindo failover automático para conexões de backup.
        </div>
      </CardContent>
    </Card>
  );
};
