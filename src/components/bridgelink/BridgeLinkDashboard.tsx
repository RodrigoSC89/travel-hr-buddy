// @ts-nocheck
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCcw } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

export default function BridgeLinkDashboard() {
  const [log, setLog] = useState([]);

  const triggerSync = () => {
    publishEvent("nautilus/bridgelink/manual-sync", { triggeredAt: new Date().toISOString() });
    setLog((prev) => [`Sincronização manual iniciada às ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-primary" /> Painel de Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button onClick={triggerSync} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCcw className="mr-2 h-4 w-4" /> Forçar Sincronização
          </Button>
        </div>
        <div className="border-t pt-2 text-sm text-gray-400">
          {log.length === 0 ? "Sem eventos registrados." : log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      </CardContent>
    </Card>
  );
}
