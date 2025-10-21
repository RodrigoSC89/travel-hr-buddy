// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Wrench } from "lucide-react";
import { runMaintenanceOrchestrator } from "@/lib/ai/maintenance-orchestrator";

export default function MaintenanceDashboard() {
  const [status, setStatus] = useState({ level: "Carregando", message: "Analisando dados de telemetria..." });

  useEffect(() => {
    const interval = setInterval(async () => {
      const dpData = await fetch("/api/dp/telemetry").then((r) => r.json());
      const controlData = await fetch("/api/control/telemetry").then((r) => r.json());
      const result = await runMaintenanceOrchestrator(dpData, controlData);
      setStatus(result);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const icon =
    status.level === "Normal"
      ? <CheckCircle className="text-green-400 w-8 h-8" />
      : status.level === "Atenção"
      ? <AlertTriangle className="text-yellow-400 w-8 h-8" />
      : <Wrench className="text-red-500 w-8 h-8" />;

  return (
    <Card className="border-cyan-900 bg-gray-950">
      <CardHeader>
        <CardTitle className="text-cyan-400">Maintenance Orchestrator — Previsão de Falhas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {icon}
        <p className="mt-2 text-center text-sm text-gray-300">{status.message}</p>
        <p className="text-xs text-gray-500 mt-1">Status: {status.level}</p>
      </CardContent>
    </Card>
  );
}
