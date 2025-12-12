import { useEffect, useState, useCallback } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { subscribeDPAlerts } from "@/lib/mqtt/publisher";

export default function DPAlertFeed() {
  const [alerts, setAlerts] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const client = subscribeDPAlerts((msg) =>
      setAlerts((prev) => [msg, ...prev].slice(0, 10))
    );
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" /> Últimos Alertas DP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-300">
        {alerts.length === 0
          ? "Sem alertas recentes."
          : alerts.map((a, i) => (
            <div key={i} className="border-b border-gray-700 pb-2">
              <p>{a.type as string}</p>
              <p className="text-xs text-gray-500">
                {new Date(a.timestamp as number).toLocaleTimeString()} — Risco: {((a.risk as number) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
