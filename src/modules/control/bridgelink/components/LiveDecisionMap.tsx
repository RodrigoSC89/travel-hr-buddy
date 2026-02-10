import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Map, Activity } from "lucide-react";
import type { DPEvent } from "../types";

interface LiveDecisionMapProps {
  events: DPEvent[];
}

/**
 * Visual map of DP events with risk color coding
 * 🟢 Normal
 * 🟡 Degradação  
 * 🔴 Falha crítica
 */
export function LiveDecisionMap({ events }: LiveDecisionMapProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "normal":
      return "bg-green-500";
    case "degradation":
      return "bg-yellow-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
    case "normal":
      return <Badge className="bg-green-500">🟢 Normal</Badge>;
    case "degradation":
      return <Badge className="bg-yellow-500">🟡 Degradação</Badge>;
    case "critical":
      return <Badge className="bg-red-500">🔴 Crítico</Badge>;
    default:
      return <Badge className="bg-gray-500">❔ Desconhecido</Badge>;
    }
  };

  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-20);

  const chartData = sortedEvents.map((event) => ({
    name: new Date(event.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    risco: event.severity === "critical" ? 3 : event.severity === "degradation" ? 2 : event.severity === "normal" ? 1 : 0,
    system: event.system,
    type: event.type,
    description: event.description,
  }));

  const formatYAxis = (value: number) => {
    switch (value) {
    case 3: return "Crítico";
    case 2: return "Degradação";
    case 1: return "Normal";
    default: return "";
    }
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map className="h-6 w-6 text-blue-500" />
          Mapa de Decisão Contextual
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {events.length} eventos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 text-blue-500" />
            <p className="text-sm">Nenhum evento registrado</p>
            <p className="text-xs mt-1">Aguardando dados do DP Intelligence Center</p>
          </div>
        ) : (
          <>
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 3.5]} ticks={[1, 2, 3]} tickFormatter={formatYAxis} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-2 text-sm shadow-md">
                            <p>Sistema: {data.system}</p>
                            <p>Tipo: {data.type}</p>
                            <p>Descrição: {data.description}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="risco" stroke="rgb(59, 130, 246)" fill="rgba(59, 130, 246, 0.1)" strokeWidth={2} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Degradação</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Crítico</span>
              </div>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {sortedEvents.reverse().map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-2 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(event.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{event.system}</span>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tipo: {event.type}</span>
                        <span>{new Date(event.timestamp).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}