// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Compass, Wind } from "lucide-react";
import { runDPAdvisor, type DPAdvice } from "@/lib/ai/dp-advisor-engine";

export default function DPAdvisorPanel() {
  const [advice, setAdvice] = useState<DPAdvice>({
    level: "Carregando",
    message: "Inicializando IA...",
  });

  useEffect(() => {
    // Initial run
    runAdvisor();

    // Update every 30 seconds
    const interval = setInterval(async () => {
      await runAdvisor();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function runAdvisor() {
    try {
      // Fetch telemetry data from API
      const telemetry = await fetch("/api/dp/telemetry").then((r) => r.json());
      const result = await runDPAdvisor(telemetry);
      setAdvice(result);
    } catch (error) {
      console.error("Error running DP advisor:", error);
      // Set a fallback state if fetching telemetry fails
      setAdvice({
        level: "Offline",
        message: "Aguardando dados de telemetria...",
      });
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
    case "OK":
      return "text-green-400";
    case "Risco":
      return "text-yellow-400";
    case "Crítico":
      return "text-red-500";
    case "Error":
      return "text-orange-400";
    default:
      return "text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Compass className="w-5 h-5" /> DP Advisor — Otimização em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <Wind className="w-8 h-8 mb-2 text-cyan-300" />
          <p className={`text-lg ${getLevelColor(advice.level)}`}>{advice.message}</p>
          <p className="text-xs mt-1 text-gray-400">Status: {advice.level}</p>
        </div>
      </CardContent>
    </Card>
  );
}
