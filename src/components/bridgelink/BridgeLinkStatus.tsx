import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Wifi, ShieldCheck } from "lucide-react";
import { subscribeBridgeLinkStatus } from "@/lib/mqtt/publisher";

export default function BridgeLinkStatus() {
  const [status, setStatus] = useState({ online: false, latency: 0, lastSync: "—" });

  useEffect(() => {
    const client = subscribeBridgeLinkStatus((data) => setStatus(data));
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Status de Comunicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Metric label="Online" value={status.online ? "Conectado" : "Offline"} color={status.online ? "green" : "red"} />
        <Metric label="Latência" value={`${status.latency.toFixed(1)} ms`} color="blue" />
        <Metric label="Última Sincronização" value={status.lastSync} color="gray" />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className={`text-${color}-400 font-semibold`}>{value}</p>
    </div>
  );
}
