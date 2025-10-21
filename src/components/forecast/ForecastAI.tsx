// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as ort from "onnxruntime-web";
import { publishEvent } from "@/lib/mqtt/publisher";
import { Activity, Cpu, WifiOff } from "lucide-react";

export default function ForecastAI() {
  const [status, setStatus] = useState("Inicializando...");
  const [forecast, setForecast] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
        const input = new ort.Tensor("float32", new Float32Array([1, 0.75, 1013, 3.2]), [1, 4]);
        const results = await session.run({ input });
        setForecast(results.output.data[0]);
        setStatus("Previsão atualizada");
        publishEvent("nautilus/forecast/update", { forecast: results.output.data[0] });
      } catch (err) {
        console.warn("Falha ao carregar modelo ONNX:", err);
        setOffline(true);
        setStatus("Modo offline");
      }
    };
    loadModel();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {offline ? (
            <WifiOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
          ) : (
            <Cpu className="h-5 w-5 text-blue-500" aria-hidden="true" />
          )}
          AI Forecast Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {offline ? (
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Activity className="h-4 w-4" aria-hidden="true" />
            <p>Operando em modo offline. Previsões locais desativadas.</p>
          </div>
        ) : (
          <div 
            className="text-sm"
            role="status"
            aria-live="polite"
          >
            <span className="font-semibold">{status}:</span>{" "}
            {forecast ? `${forecast.toFixed(2)} unidades` : "Carregando..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
