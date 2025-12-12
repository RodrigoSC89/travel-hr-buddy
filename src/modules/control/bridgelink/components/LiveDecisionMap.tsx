import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Map, Activity } from "lucide-react";
import type { DPEvent } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LiveDecisionMapProps {
  events: DPEvent[];
}

/**
 * Visual map of DP events with risk color coding
 * 🟢 Normal
 * 🟡 Degradação  
 * 🔴 Falha crítica
 */
export const LiveDecisionMap = memo(function({ events }: LiveDecisionMapProps) {
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
  });

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
  });

  // Prepare chart data from events
  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-20); // Show last 20 events

  const chartData = {
    labels: sortedEvents.map((event) =>
      new Date(event.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Nível de Risco",
        data: sortedEvents.map((event) => {
          switch (event.severity) {
          case "critical":
            return 3;
          case "degradation":
            return 2;
          case "normal":
            return 1;
          default:
            return 0;
          }
        }),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: sortedEvents.map((event) => {
          switch (event.severity) {
          case "critical":
            return "rgb(239, 68, 68)";
          case "degradation":
            return "rgb(234, 179, 8)";
          case "normal":
            return "rgb(34, 197, 94)";
          default:
            return "rgb(156, 163, 175)";
          }
        }),
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { dataIndex: number }) {
            const event = sortedEvents[context.dataIndex];
            return [
              `Sistema: ${event.system}`,
              `Tipo: ${event.type}`,
              `Descrição: ${event.description}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3.5,
        ticks: {
          stepSize: 1,
          callback: function (value: number | string) {
            switch (value) {
            case 3:
              return "Crítico";
            case 2:
              return "Degradação";
            case 1:
              return "Normal";
            default:
              return "";
            }
          },
        },
      },
    },
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
              <Line data={chartData} options={chartOptions} />
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
});
