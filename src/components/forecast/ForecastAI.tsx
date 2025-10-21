/**
 * ForecastAI Component
 * ONNX Runtime Web inference engine for maritime forecasting
 * Features: Client-side ML inference, offline fallback, MQTT publishing, WCAG 2.1 compliance
 */

import React, { useState, useEffect } from "react";
import * as ort from "onnxruntime-web";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, AlertCircle, CheckCircle } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

type InferenceStatus = "idle" | "loading" | "ready" | "running" | "offline" | "error";

export default function ForecastAI() {
  const [status, setStatus] = useState<InferenceStatus>("idle");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Aguardando inicialização...");

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      setStatus("loading");
      setMessage("Carregando modelo ONNX...");

      // Try to load ONNX model
      await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
      
      setStatus("ready");
      setMessage("Modelo ONNX carregado com sucesso");
    } catch (error) {
      console.warn("⚠️ ONNX model not found, using offline mode:", error);
      setStatus("offline");
      setMessage("Modo offline ativo - modelo não disponível");
    }
  };

  const runInference = async () => {
    try {
      setStatus("running");
      setMessage("Executando inferência...");

      if (status === "offline") {
        // Offline fallback with simulated prediction
        await new Promise(resolve => setTimeout(resolve, 1000));
        const simulatedConfidence = 0.75 + Math.random() * 0.2; // 75-95%
        setConfidence(simulatedConfidence);
        setMessage("Previsão simulada (modo offline)");
        
        // Publish to MQTT with QoS 1
        publishEvent(
          "nautilus/forecast/update",
          {
            forecast: simulatedConfidence,
            mode: "offline",
            timestamp: new Date().toISOString(),
          },
          1
        );
        
        setStatus("offline");
        return;
      }

      // Real ONNX inference
      const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
      
      // Sample input: [pressure, temperature, wind_speed, wave_height]
      const inputData = new Float32Array([1013.25, 22.5, 3.2, 1.5]);
      const input = new ort.Tensor("float32", inputData, [1, 4]);
      
      const results = await session.run({ input });
      const prediction = results.output.data[0] as number;
      
      setConfidence(prediction);
      setMessage("Inferência concluída com sucesso");
      
      // Publish to MQTT with QoS 1
      publishEvent(
        "nautilus/forecast/update",
        {
          forecast: prediction,
          mode: "onnx",
          timestamp: new Date().toISOString(),
        },
        1
      );
      
      setStatus("ready");
    } catch (error) {
      console.error("❌ Inference error:", error);
      setStatus("error");
      setMessage("Erro durante inferência");
    }
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return "text-green-500";
    if (conf >= 0.5) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusIcon = () => {
    switch (status) {
      case "ready":
        return <CheckCircle className="text-green-500" />;
      case "offline":
        return <AlertCircle className="text-yellow-500" />;
      case "error":
        return <AlertCircle className="text-red-500" />;
      default:
        return <Brain className="text-blue-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          {getStatusIcon()}
          <span>Motor de IA Preditiva</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message with ARIA live region */}
        <div
          className="text-sm text-gray-400"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </div>

        {/* Confidence Display */}
        {confidence !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Confiança da Previsão</span>
              <span
                className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}
                aria-label={`Confiança: ${(confidence * 100).toFixed(0)}%`}
              >
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  confidence >= 0.8
                    ? "bg-green-500"
                    : confidence >= 0.5
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${confidence * 100}%` }}
                role="progressbar"
                aria-valuenow={confidence * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={runInference}
          disabled={status === "running" || status === "loading"}
          className="w-full"
          aria-label="Executar previsão de IA"
        >
          <Play className="mr-2 h-4 w-4" aria-hidden="true" />
          {status === "running" ? "Processando..." : "Executar Previsão"}
        </Button>

        {/* Technical Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• ONNX Runtime Web 1.23.0</p>
          <p>• MQTT QoS 1 (at least once)</p>
          <p>• Tópico: nautilus/forecast/update</p>
        </div>
      </CardContent>
    </Card>
  );
}
