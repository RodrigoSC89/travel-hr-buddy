/**
 * Signal History Component
 * Shows history of signal loss and connectivity events
 * Patch 142.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, WifiOff, Wifi, AlertTriangle, Settings } from "lucide-react";
import type { SignalEvent } from "../index";

interface SignalHistoryProps {
  events: SignalEvent[];
}

export const SignalHistory: React.FC<SignalHistoryProps> = ({ events }) => {
  const getEventIcon = (type: SignalEvent["type"]) => {
    switch (type) {
    case "connection_lost":
      return <WifiOff className="h-4 w-4 text-red-500" />;
    case "connection_restored":
      return <Wifi className="h-4 w-4 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "maintenance":
      return <Settings className="h-4 w-4 text-blue-500" />;
    default:
      return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventLabel = (type: SignalEvent["type"]) => {
    switch (type) {
    case "connection_lost":
      return "Conexão Perdida";
    case "connection_restored":
      return "Conexão Restaurada";
    case "degraded":
      return "Sinal Degradado";
    case "maintenance":
      return "Manutenção";
    default:
      return "Evento Desconhecido";
    }
  };

  const getEventColor = (type: SignalEvent["type"]) => {
    switch (type) {
    case "connection_lost":
      return "destructive";
    case "connection_restored":
      return "default";
    case "degraded":
      return "secondary";
    case "maintenance":
      return "outline";
    default:
      return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return "agora mesmo";
  });

  // Sort events by most recent first
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum evento recente
            </div>
          ) : (
            sortedEvents.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="mt-1">{getEventIcon(event.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{event.provider}</span>
                    <Badge variant={getEventColor(event.type)}>
                      {getEventLabel(event.type)}
                    </Badge>
                  </div>
                  {event.reason && (
                    <div className="text-sm text-muted-foreground mb-1">
                      {event.reason}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatTimestamp(event.timestamp)}</span>
                    {event.duration && (
                      <span>• Duração: {event.duration}min</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
