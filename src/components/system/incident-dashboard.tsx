import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIInsightReporter } from "@/lib/ai/insight-reporter";

const reporter = new AIInsightReporter();

export function IncidentDashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_SUPABASE_WS_URL!);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setIncidents((prev) => [data, ...prev]);
    };

    reporter.reportAnomaly({
      module: "IncidentDashboard",
      severity: "info",
      message: "Monitoramento iniciado.",
    });

    return () => ws.close();
  }, []);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>📊 Painel de Incidentes</CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum incidente ativo</p>
        ) : (
          incidents.map((i, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <span>{i.module}</span>
              <Badge variant={i.severity === "critical" ? "destructive" : "default"}>
                {i.severity.toUpperCase()}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
