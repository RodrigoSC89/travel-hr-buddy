// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { subscribeAlerts } from "@/lib/mqtt/publisher";

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const client = subscribeAlerts((data) => setAlerts((prev) => [data, ...prev].slice(0, 5)));
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum alerta ativo no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                {a.severity === "high" ? (
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm flex-1">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
