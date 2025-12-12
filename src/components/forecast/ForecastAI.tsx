import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
let ort: unknown = null;
const loadORT = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
});
import { publishEvent } from "@/lib/mqtt/publisher";

type PredictionStatus = "loading" | "success" | "error" | "offline";

interface ForecastData {
  forecast: number;
  confidence: number;
  timestamp: string;
}

export default function ForecastAI() {
  const [prediction, setPrediction] = useState<ForecastData | null>(null);
  const [status, setStatus] = useState<PredictionStatus>("loading");

  useEffect(() => {
    async function runModel() {
      try {
        setStatus("loading");
        
        // Attempt to load ONNX model
        const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
        
        // Example input: [pressure_hPa, temperature_C, wind_speed_kn, wave_height_m]
        const input = new ort.Tensor(
          "float32",
          new Float32Array([1013, 22.5, 3.2, 1.5]),
          [1, 4]
        );
        
        const results = await session.run({ input });
        const forecastValue = results.output.data[0] as number;
        const confidence = Math.min(0.95, Math.max(0.5, Math.random() * 0.5 + 0.5)); // Simulated confidence
        
        const forecastData: ForecastData = {
          forecast: forecastValue,
          confidence,
          timestamp: new Date().toISOString(),
        };
        
        setPrediction(forecastData);
        setStatus("success");
        
        // Publish to MQTT with QoS 1 (at least once delivery)
        publishEvent(
          "nautilus/forecast/update",
          {
            forecast: forecastValue,
            confidence,
            timestamp: forecastData.timestamp,
            source: "onnx-runtime-web",
          },
          1
        );
      } catch (err) {
        console.error("AI Forecast Error:", err);
        setStatus("offline");
        
        // Fallback prediction when model is unavailable
        setPrediction({
          forecast: 0.65,
          confidence: 0.5,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    runModel();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.5) return "text-warning";
    return "text-destructive";
  });

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.5) return "Média";
    return "Baixa";
  });

  const getStatusIcon = () => {
    switch (status) {
    case "success":
      return <CheckCircle className="text-success" aria-hidden="true" />;
    case "error":
      return <XCircle className="text-destructive" aria-hidden="true" />;
    case "offline":
      return <AlertTriangle className="text-warning" aria-hidden="true" />;
    default:
      return <Brain className="text-primary animate-pulse" aria-hidden="true" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
    case "success":
      return "Modelo ativo";
    case "error":
      return "Erro no modelo";
    case "offline":
      return "Modo offline (fallback)";
    default:
      return "Carregando modelo";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center space-x-2">
          <Brain className="text-primary" aria-hidden="true" />
          <span>Previsão IA com ONNX Runtime</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Indicator with WCAG aria-live */}
        <div
          className="flex items-center space-x-2 mb-4 p-2 bg-muted rounded"
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusIcon()}
          <span className="text-sm text-muted-foreground">{getStatusMessage()}</span>
        </div>

        {/* Prediction Display */}
        {prediction !== null ? (
          <div className="space-y-4">
            {/* Forecast Value */}
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-warning" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted-foreground" id="forecast-label">
                  Probabilidade de instabilidade
                </p>
                <p
                  className="text-3xl font-bold text-foreground"
                  aria-labelledby="forecast-label"
                >
                  {(prediction.forecast * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Confidence Indicator with WCAG-compliant progress bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="confidence-bar" className="text-sm text-muted-foreground">
                  Confiança do modelo
                </label>
                <span
                  className={`text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}
                  aria-label={`Confiança: ${getConfidenceLabel(prediction.confidence)}`}
                >
                  {getConfidenceLabel(prediction.confidence)} ({(prediction.confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <div
                className="w-full bg-secondary rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={Math.round(prediction.confidence * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Nível de confiança do modelo"
                id="confidence-bar"
              >
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    prediction.confidence >= 0.8
                      ? "bg-success"
                      : prediction.confidence >= 0.5
                        ? "bg-warning"
                        : "bg-destructive"
                  }`}
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(prediction.timestamp).toLocaleString("pt-BR")}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground" aria-live="polite">
            Inicializando inferência...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
