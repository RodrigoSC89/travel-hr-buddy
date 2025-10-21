/**
 * ForecastAI Component - Local AI Inference Engine
 * 
 * Implements ONNX Runtime Web for client-side machine learning inference,
 * eliminating backend dependencies. Features:
 * - Client-side inference (no backend required)
 * - Automatic offline fallback when model unavailable
 * - MQTT publishing to nautilus/forecast/update topic
 * - Status updates via aria-live="polite" regions
 */

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, Zap, AlertCircle } from "lucide-react";
import * as ort from "onnxruntime-web";
import { publishEvent } from "@/lib/mqtt/publisher";

type ForecastStatus = "loading" | "ready" | "error" | "offline";

export default function ForecastAI() {
  const [status, setStatus] = useState<ForecastStatus>("loading");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Inicializando modelo ONNX...");

  useEffect(() => {
    async function runInference() {
      try {
        // Attempt to load ONNX model
        const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
        
        // Sample input: [weather_condition, sea_state, pressure, wind_speed]
        // Values normalized between 0-1 for weather (1=good), 0-1 for sea (0.75=moderate)
        // pressure in hPa/1000, wind in m/s
        const input = new ort.Tensor(
          "float32", 
          new Float32Array([1, 0.75, 1013, 3.2]), 
          [1, 4]
        );
        
        const results = await session.run({ input });
        const forecastValue = results.output.data[0] as number;
        
        setPrediction(forecastValue);
        setStatus("ready");
        setMessage("Modelo carregado com sucesso");
        
        // Publish to MQTT with QoS 1 for reliable delivery
        publishEvent("nautilus/forecast/update", { 
          forecast: forecastValue,
          timestamp: new Date().toISOString(),
          source: "onnx-runtime-web"
        }, 1);
        
      } catch (err) {
        console.warn("⚠️ ONNX model not available, using offline fallback:", err);
        
        // Offline fallback mode - generate synthetic prediction
        const fallbackPrediction = 0.85;
        setPrediction(fallbackPrediction);
        setStatus("offline");
        setMessage("Modo offline - modelo ONNX não disponível");
        
        // Still publish to MQTT even in offline mode
        publishEvent("nautilus/forecast/update", { 
          forecast: fallbackPrediction,
          timestamp: new Date().toISOString(),
          source: "offline-fallback"
        }, 1);
      }
    }

    runInference();
  }, []);

  // Determine color based on prediction confidence
  const getConfidenceColor = (value: number | null) => {
    if (value === null) return "text-gray-400";
    if (value >= 0.8) return "text-green-400";
    if (value >= 0.5) return "text-yellow-400";
    return "text-red-400";
  };

  // Determine icon based on status
  const StatusIcon = () => {
    switch (status) {
      case "loading":
        return <Zap className="h-6 w-6 text-blue-400 animate-pulse" aria-hidden="true" />;
      case "ready":
        return <Brain className="h-6 w-6 text-purple-400" aria-hidden="true" />;
      case "offline":
        return <AlertCircle className="h-6 w-6 text-yellow-400" aria-hidden="true" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <StatusIcon />
          <span>AI Inference Engine</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status message with live region for screen readers */}
        <div 
          className="text-sm text-gray-400"
          role="status"
          aria-live="polite"
        >
          {message}
        </div>

        {/* Prediction display */}
        {prediction !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Confiabilidade da Previsão</span>
              <span 
                className={`text-2xl font-bold ${getConfidenceColor(prediction)}`}
                aria-label={`Confiabilidade: ${(prediction * 100).toFixed(1)} por cento`}
              >
                {(prediction * 100).toFixed(1)}%
              </span>
            </div>

            {/* Visual indicator bar */}
            <div 
              className="w-full bg-gray-700 rounded-full h-2"
              role="progressbar"
              aria-valuenow={prediction * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Barra de confiabilidade da previsão"
            >
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  prediction >= 0.8 ? "bg-green-400" :
                  prediction >= 0.5 ? "bg-yellow-400" :
                  "bg-red-400"
                }`}
                style={{ width: `${prediction * 100}%` }}
              />
            </div>

            {/* Model status badge */}
            <div className="flex items-center gap-2 text-xs">
              <span 
                className={`px-2 py-1 rounded ${
                  status === "ready" ? "bg-purple-900/50 text-purple-300" :
                  status === "offline" ? "bg-yellow-900/50 text-yellow-300" :
                  "bg-gray-800 text-gray-400"
                }`}
              >
                {status === "ready" ? "🧠 ONNX Runtime" : 
                 status === "offline" ? "📡 Modo Offline" : 
                 "⏳ Carregando..."}
              </span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
