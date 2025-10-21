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
    <Card className="border border-[var(--nautilus-accent)]">
      <CardHeader>
        <CardTitle>Alertas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-gray-400">Nenhum alerta ativo no momento.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                {a.severity === "high" ? (
                  <AlertTriangle className="text-red-500" />
                ) : (
                  <CheckCircle2 className="text-green-500" />
                )}
                <span>{a.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
