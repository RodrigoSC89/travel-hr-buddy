import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { subscribeDPAlerts } from "@/lib/mqtt/publisher";

interface DPAlert {
  type?: string;
  timestamp?: number;
  risk?: number;
  [key: string]: unknown;
}

export default function DPAlertFeed() {
  const [alerts, setAlerts] = useState<DPAlert[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeDPAlerts((msg) =>
      setAlerts((prev) => [msg as DPAlert, ...prev].slice(0, 10))
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" /> Últimos Alertas DP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {alerts.length === 0
          ? "Sem alertas recentes."
          : alerts.map((a, i) => (
            <div key={i} className="border-b border-border pb-2">
              <p>{a.type || "Alerta"}</p>
              <p className="text-xs text-muted-foreground">
                {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "N/A"} — Risco: {a.risk ? (a.risk * 100).toFixed(1) : "0"}%
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
