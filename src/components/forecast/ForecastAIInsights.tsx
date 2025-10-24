import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle } from "lucide-react";
import * as ort from "onnxruntime-web";

export default function ForecastAIInsights() {
  const [prediction, setPrediction] = useState<number | string | null>(null);

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
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Brain className="text-purple-400" />
          <span>Previsão IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prediction !== null ? (
          typeof prediction === "number" ? (
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Probabilidade de instabilidade</p>
                <p className="text-2xl font-bold text-white">{(prediction * 100).toFixed(1)}%</p>
              </div>
            </div>
          ) : (
            <p className="text-red-400">{prediction}</p>
          )
        ) : (
          <p className="text-gray-400">Carregando modelo...</p>
        )}
      </CardContent>
    </Card>
  );
}
