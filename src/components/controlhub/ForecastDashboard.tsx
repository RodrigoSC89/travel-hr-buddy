// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge, TrendingUp } from "lucide-react";
import { runForecastAnalysis } from "@/lib/ai/forecast-engine";

export default function ForecastDashboard() {
  const [forecast, setForecast] = useState({ level: "Carregando", value: 0 });

  useEffect(() => {
    // Run initial analysis
    runForecastAnalysis().then(setForecast).catch(() => {
      setForecast({ level: "Erro", value: 0 });
    });

    // Set up interval for periodic updates
    const interval = setInterval(async () => {
      const result = await runForecastAnalysis();
      setForecast(result);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-blue-400">
          <TrendingUp /> Forecast Global — AI Predictive Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Gauge className="w-10 h-10 mx-auto mb-3" />
        <p className="text-2xl font-bold">{(forecast.value * 100).toFixed(1)}%</p>
        <p
          className={`mt-1 text-sm ${
            forecast.level === "OK"
              ? "text-green-400"
              : forecast.level === "Risco"
              ? "text-yellow-400"
              : forecast.level === "Crítico"
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {forecast.level === "OK"
            ? "Operação estável"
            : forecast.level === "Risco"
            ? "Risco detectado — verifique ASOG"
            : forecast.level === "Crítico"
            ? "Alerta crítico — acionar protocolo DP"
            : forecast.level === "Sem Dados"
            ? "Aguardando dados de telemetria"
            : forecast.level === "Carregando"
            ? "Carregando previsões..."
            : "Erro ao carregar previsões"}
        </p>
      </CardContent>
    </Card>
  );
}
