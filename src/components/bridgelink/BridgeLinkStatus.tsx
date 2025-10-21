// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Wifi, ShieldCheck } from "lucide-react";
import { subscribeBridgeStatus } from "@/lib/mqtt/publisher";

export default function BridgeLinkStatus() {
  const [status, setStatus] = useState({ online: false, latency: 0, lastSync: "—" });

  useEffect(() => {
    const client = subscribeBridgeStatus((data) => setStatus(data));
    return () => client.disconnect();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="text-[var(--nautilus-primary)]" /> Status de Comunicação
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <Metric label="Online" value={status.online ? "Conectado" : "Offline"} color={status.online ? "green" : "red"} />
        <Metric label="Latência" value={`${status.latency.toFixed(1)} ms`} color="blue" />
        <Metric label="Última Sync" value={status.lastSync} color="teal" />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-${color}-400 font-semibold`}>{value}</p>
    </div>
  );
}
