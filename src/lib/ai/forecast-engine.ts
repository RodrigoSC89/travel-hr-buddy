/**
 * AI Forecast Engine
 * Uses ONNX models to predict operational failures based on telemetry data
 * @module forecast-engine
 */

import * as ort from "onnxruntime-web";
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";

export interface ForecastResult {
  status: string;
  level?: string;
  value?: number;
  message?: string;
}

export interface RiskClassification {
  level: "OK" | "Risco" | "Crítico";
  value: number;
  message?: string;
}

/**
 * Run forecast analysis using ONNX model and telemetry data
 * @returns Forecast result with risk classification
 */
export async function runForecastAnalysis(): Promise<ForecastResult> {
  try {
    // Load ONNX model
    const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
    
    // Query last 100 telemetry readings from Supabase
    const { data, error } = await (supabase as any)
      .from("dp_telemetry")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("❌ Supabase query error:", error);
      return { 
        status: "error", 
        message: `Database error: ${error.message}` 
      };
    }

    if (!data || data.length === 0) {
      return { 
        status: "no-data",
        message: "No telemetry data available" 
      };
    }

    // Prepare input tensor from telemetry values
    const rows = (data as any[]) || [];
    const values = rows.map((x: any) => Number(x.value) || 0);
    const input = new ort.Tensor("float32", new Float32Array(values), [1, values.length]);

    // Run inference
    const output = await session.run({ input });
    
    // Extract prediction probability
    const prediction = Number((output as any).probabilities?.data?.[0] ?? (output as any).output?.data?.[0] ?? 0);

    // Classify risk level
    const risk = classifyRisk(prediction);

    // Publish MQTT alert if risk is detected
    if (risk.level !== "OK") {
      publishForecastAlert(risk);
    }

    return {
      status: "success",
      ...risk
    };
  } catch (error) {
    console.error("❌ Forecast analysis error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Classify risk level based on prediction value
 * @param value Prediction probability (0-1)
 * @returns Risk classification
 */
function classifyRisk(value: number): RiskClassification {
  if (value < 0.4) {
    return { 
      level: "OK", 
      value,
      message: "Operação dentro do esperado"
    };
  }
  if (value < 0.7) {
    return { 
      level: "Risco", 
      value,
      message: "Risco moderado - verificar procedimentos ASOG"
    };
  }
  return { 
    level: "Crítico", 
    value,
    message: "Risco crítico - ativar protocolo DP"
  };
}

/**
 * Publish forecast alert to MQTT broker
 * @param risk Risk classification data
 */
function publishForecastAlert(risk: RiskClassification): void {
  try {
    const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "ws://localhost:1883");
    
    client.on("connect", () => {
      const alertData = {
        level: risk.level,
        value: risk.value,
        message: risk.message,
        timestamp: new Date().toISOString()
      };
      
      client.publish("nautilus/forecast/alert", JSON.stringify(alertData), { qos: 1 }, (err) => {
        if (err) {
          console.error("❌ Failed to publish forecast alert:", err);
        } else {
          console.log("✅ Published forecast alert:", alertData);
        }
        client.end();
      });
    });

    client.on("error", (err) => {
      console.error("❌ MQTT connection error:", err);
      client.end();
    });
  } catch (error) {
    console.error("❌ Error publishing forecast alert:", error);
  }
}
