/**
 * SATCOM Status Component
 * Displays current status of all satellite connections
 * Patch 142.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, Signal, Clock } from "lucide-react";
import type { SatcomConnection } from "../index";

interface SatcomStatusProps {
  connections: SatcomConnection[];
}

export const SatcomStatus: React.FC<SatcomStatusProps> = ({ connections }) => {
  const getStatusColor = (status: SatcomConnection["status"]) => {
    switch (status) {
    case "connected":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "disconnected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: SatcomConnection["status"]) => {
    switch (status) {
    case "connected":
      return "Conectado";
    case "degraded":
      return "Degradado";
    case "disconnected":
      return "Desconectado";
    default:
      return "Desconhecido";
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-green-500";
    if (strength >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  const getTimeSince = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          Status da Conectividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(conn.status)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{conn.name}</div>
                    <Badge variant="outline">{conn.provider}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getStatusLabel(conn.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Sinal</div>
                  <div className={`font-medium ${getSignalColor(conn.signalStrength)}`}>
                    <Signal className="h-4 w-4 inline mr-1" />
                    {conn.signalStrength.toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Latência</div>
                  <div className="font-medium">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {conn.latency.toFixed(0)}ms
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Banda</div>
                  <div className="font-medium">{formatBandwidth(conn.bandwidth)}</div>
                </div>
              </div>

              <div className="text-right text-xs text-muted-foreground ml-6">
                {getTimeSince(conn.lastSeen)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
