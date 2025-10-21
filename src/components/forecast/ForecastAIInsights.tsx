// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle } from "lucide-react";
import * as ort from "onnxruntime-web";

export default function ForecastAIInsights() {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    async function runModel() {
      try {
        const session = await ort.InferenceSession.create("/models/forecast.onnx");
        const input = new ort.Tensor("float32", Float32Array.from([2.5, 1.7, 28.3, 5.0]), [1, 4]);
        const output = await session.run({ input });
        setPrediction(output.result.data[0]);
      } catch (err) {
        console.error("AI Forecast Error:", err);
        setPrediction("Erro na previsão IA");
      }
    }
    runModel();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-[var(--nautilus-primary)]" /> Previsão IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prediction ? (
          <div className="text-gray-300">
            <p className="text-sm">Probabilidade de instabilidade operacional:</p>
            <h2 className="text-3xl font-bold text-[var(--nautilus-primary)]">{(prediction * 100).toFixed(2)}%</h2>
          </div>
        ) : (
          <p className="text-gray-400 flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" /> Processando previsão...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
