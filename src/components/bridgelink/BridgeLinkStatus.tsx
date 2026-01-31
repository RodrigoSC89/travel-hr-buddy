import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { subscribeBridgeLinkStatus } from "@/lib/mqtt/publisher";

export default function BridgeLinkStatus() {
  const [status, setStatus] = useState({ online: false, latency: 0, lastSync: "—" });

  useEffect(() => {
    // subscribeBridgeLinkStatus retorna função de cleanup (não mata o cliente)
    const unsubscribe = subscribeBridgeLinkStatus((data) => {
      setStatus({
        online: (data.online as boolean) ?? false,
        latency: (data.latency as number) ?? 0,
        lastSync: (data.lastSync as string) ?? new Date().toLocaleTimeString()
      });
    });

    return () => {
      unsubscribe();
    };
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
        <Metric 
          label="Online" 
          value={status.online ? "Conectado" : "Aguardando..."} 
          variant={status.online ? "success" : "warning"} 
        />
        <Metric 
          label="Latência" 
          value={`${status.latency.toFixed(1)} ms`} 
          variant="info" 
        />
        <Metric 
          label="Última Sincronização" 
          value={status.lastSync} 
          variant="default" 
        />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, variant }: { 
  label: string; 
  value: string; 
  variant: "success" | "warning" | "info" | "default" 
}) {
  const colorMap = {
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    default: "text-muted-foreground"
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className={`font-semibold ${colorMap[variant]}`}>{value}</p>
    </div>
  );
}
