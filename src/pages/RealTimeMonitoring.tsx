import React from "react";
import { RealTimeSystemMonitor } from "@/components/monitoring/real-time-system-monitor";
import { Activity } from "lucide-react";

const RealTimeMonitoring = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Monitoramento Tempo Real</h1>
          <p className="text-muted-foreground">
            Dashboard completo de sistema
          </p>
        </div>
      </div>
      <RealTimeSystemMonitor />
    </div>
  );
};

export default RealTimeMonitoring;