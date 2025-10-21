/**
 * ForecastAI Component
 * Local AI Inference Engine using ONNX Runtime
 */

import { useState, useEffect } from "react";
import * as ort from "onnxruntime-web";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Activity, AlertCircle } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

export default function ForecastAI() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "offline">("idle");
  const [forecast, setForecast] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    setStatus("loading");
    setError(null);
    
    try {
      // Try to load the ONNX model
      await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
      console.log("✅ ONNX model loaded successfully");
      setStatus("ready");
    } catch (err) {
      console.warn("⚠️ Model not available, using offline mode:", err);
      setStatus("offline");
      setError("Modelo ONNX não disponível. Usando modo offline.");
    }
  };

  const runInference = async () => {
    if (status !== "ready") {
      setError("Modelo não está pronto. Execute em modo offline ou aguarde o carregamento.");
      return;
    }

    try {
      setStatus("loading");
      
      // Sample input data: [weather_condition, sea_state, pressure, wind_speed]
      const inputData = new Float32Array([1, 0.75, 1013, 3.2]);
      const input = new ort.Tensor("float32", inputData, [1, 4]);
      
      const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
      const results = await session.run({ input });
      
      const forecastValue = results.output.data[0] as number;
      setForecast(forecastValue);
      
      // Publish to MQTT
      publishEvent("nautilus/forecast/update", { 
        forecast: forecastValue,
        timestamp: new Date().toISOString()
      }, 1);
      
      setStatus("ready");
      setError(null);
    } catch (err) {
      console.error("❌ Inference error:", err);
      setError("Erro ao executar inferência. Tente novamente.");
      setStatus("ready");
    }
  };

  const runOfflineMode = () => {
    // Simulate offline forecast
    const simulatedForecast = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    setForecast(simulatedForecast);
    
    // Publish to MQTT
    publishEvent("nautilus/forecast/update", { 
      forecast: simulatedForecast,
      mode: "offline",
      timestamp: new Date().toISOString()
    }, 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" aria-hidden="true" />
          <CardTitle>Forecast AI Engine</CardTitle>
        </div>
        <CardDescription>
          Inferência local com ONNX Runtime Web
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div 
          className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          role="status"
          aria-live="polite"
        >
          <Activity 
            className={`h-5 w-5 ${
              status === "ready" ? "text-green-500" : 
                status === "loading" ? "text-yellow-500 animate-pulse" : 
                  status === "offline" ? "text-orange-500" : 
                    "text-gray-500"
            }`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium">
            Status: {
              status === "ready" ? "Pronto" :
                status === "loading" ? "Carregando..." :
                  status === "offline" ? "Modo Offline" :
                    "Inicializando"
            }
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Forecast Result */}
        {forecast !== null && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Previsão de Confiabilidade:</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {(forecast * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={runInference}
            disabled={status === "loading"}
            className="flex-1"
          >
            {status === "loading" ? "Processando..." : "Executar Inferência"}
          </Button>
          
          {status === "offline" && (
            <Button 
              onClick={runOfflineMode}
              variant="outline"
              className="flex-1"
            >
              Modo Offline
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
