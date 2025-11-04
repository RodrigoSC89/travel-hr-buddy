import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { History, Clock, AlertTriangle } from "lucide-react";

export default function PEODPLogs() {
  const logs = [
    {
      id: 1,
      type: "simulation",
      scenario: "Falha de DP",
      date: "2025-10-28",
      duration: "15 min",
      score: 92,
      participants: 12
    },
    {
      id: 2,
      type: "real_event",
      scenario: "Perda de posição temporária",
      date: "2025-10-15",
      duration: "8 min",
      score: null,
      participants: null
    },
    {
      id: 3,
      type: "simulation",
      scenario: "Incêndio - Praça de Máquinas",
      date: "2025-10-10",
      duration: "20 min",
      score: 88,
      participants: 15
    }
  ];

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={History}
        title="Logs PEO-DP"
        description="Histórico de simulações e eventos reais"
        gradient="purple"
        badges={[
          { icon: History, label: "Histórico Completo" },
          { icon: Clock, label: "Timeline" }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Registro de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{log.scenario}</h3>
                      <Badge variant={log.type === 'real_event' ? 'destructive' : 'secondary'}>
                        {log.type === 'real_event' ? 'Evento Real' : 'Simulação'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.date} • {log.duration}
                      </span>
                      {log.score && (
                        <span className="flex items-center gap-1 text-green-600">
                          Score: {log.score}%
                        </span>
                      )}
                      {log.participants && (
                        <span>
                          {log.participants} participantes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
