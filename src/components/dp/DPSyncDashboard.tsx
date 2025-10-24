// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Brain } from "lucide-react";
import { publishEvent, subscribeForecast } from "@/lib/mqtt/publisher";
import * as ort from "onnxruntime-web";
import { logger } from "@/lib/logger";

export default function DPSyncDashboard() {
  const [sync, setSync] = useState("Sincronizando...");
  const [prediction, setPrediction] = useState<number | null>(null);

  const runAIModel = async (forecast: Record<string, unknown>) => {
    try {
      const session = await ort.InferenceSession.create("/models/dp-predict.onnx");
      const input = new ort.Tensor("float32", Float32Array.from([forecast.wind || 0, forecast.wave || 0, forecast.temp || 0]), [1, 3]);
      const output = await session.run({ input });
      return output.result.data[0];
    } catch (error) {
      logger.error("❌ Failed to run AI model:", error);
      return 0;
    }
  };

  useEffect(() => {
    const client = subscribeForecast(async (data) => {
      const risk = await runAIModel(data);
      setPrediction(risk);
      if (risk > 0.8) {
        publishEvent("nautilus/dp/alert", { type: "Alerta Crítico", risk, timestamp: Date.now() });
      }
      setSync("Última sync: " + new Date().toLocaleTimeString());
    });
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-[var(--nautilus-primary)]" /> Sincronização DP ↔ Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button
            onClick={() =>
              publishEvent("nautilus/dp/manual-sync", { timestamp: new Date().toISOString() })
            }
            className="bg-[var(--nautilus-primary)] text-white"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Forçar Sincronização
          </Button>
        </div>
        <div className="text-gray-300">
          <p>{sync}</p>
          {prediction !== null && (
            <p className={`mt-2 font-semibold ${prediction > 0.8 ? "text-red-400" : "text-green-400"}`}>
              Risco previsto de perda de posição: {(prediction * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
