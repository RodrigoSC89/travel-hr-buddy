// @ts-nocheck
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCcw } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

export default function BridgeLinkDashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    publishEvent("nautilus/bridgelink/manual-sync", {
      timestamp: new Date().toISOString(),
      triggered_by: "manual",
    });
    
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] Manual sync triggered`]);
    
    setTimeout(() => {
      setIsSyncing(false);
      setLogs((prev) => [...prev, `[${timestamp}] Sync completed`]);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Painel de Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleManualSync} 
          disabled={isSyncing}
          className="w-full"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar Manualmente"}
        </Button>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Log de Eventos</h4>
          <div className="bg-muted rounded-md p-3 max-h-40 overflow-y-auto text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento registrado</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
