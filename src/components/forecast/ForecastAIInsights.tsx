import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle } from "lucide-react";
let ort: any = null;
const loadORT = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
};

export default function ForecastAIInsights() {
  const [prediction, setPrediction] = useState<number | string | null>(null);

  useEffect(() => {
    async function runModel() {
      try {
        const ortLib = await loadORT();
        const session = await ortLib.InferenceSession.create("/models/forecast.onnx");
        const input = new ortLib.Tensor("float32", Float32Array.from([2.5, 1.7, 28.3, 5.0]), [1, 4]);
        const output = await session.run({ input });
        const value = output.result.data[0];
        setPrediction(typeof value === 'bigint' ? Number(value) : value);
      } catch (err) {
        console.error("AI Forecast Error:", err);
        setPrediction("Erro na previsão IA");
      }
    }
    runModel();
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center space-x-2">
          <Brain className="text-primary" />
          <span>Previsão IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prediction !== null ? (
          typeof prediction === "number" ? (
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Probabilidade de instabilidade</p>
                <p className="text-2xl font-bold text-foreground">{(prediction * 100).toFixed(1)}%</p>
              </div>
            </div>
          ) : (
            <p className="text-destructive">{prediction}</p>
          )
        ) : (
          <p className="text-muted-foreground">Carregando modelo...</p>
        )}
      </CardContent>
    </Card>
  );
}
