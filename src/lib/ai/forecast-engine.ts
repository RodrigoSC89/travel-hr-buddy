/**
 * AI Forecast Engine
 * DEBT-FIX: Removed (supabase as any) - dp_telemetry doesn't exist, using system_observations with metadata
 */

let ort: any = null;
const loadORT = async () => {
  if (!ort) { ort = await import("onnxruntime-web"); }
  return ort;
};
import { logger } from "@/lib/logger";
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

export async function runForecastAnalysis(): Promise<ForecastResult> {
  try {
    const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");

    // Use system_observations for telemetry since dp_telemetry table doesn't exist
    const { data, error } = await supabase
      .from("system_observations")
      .select("*")
      .eq("observation_type", "telemetry")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      logger.error("Supabase query error", error);
      return { status: "error", message: `Database error: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { status: "no-data", message: "No telemetry data available" };
    }

    // Extract values from metadata field
    const values = data.map((x) => {
      const meta = x.metadata as Record<string, any> | null;
      return Number(meta?.value) || 0;
    });
    const input = new ort.Tensor("float32", new Float32Array(values), [1, values.length]);

    const output = await session.run({ input });
    const prediction = Number((output as any).probabilities?.data?.[0] ?? (output as any).output?.data?.[0] ?? 0);

    const risk = classifyRisk(prediction);
    if (risk.level !== "OK") publishForecastAlert(risk);
    return { status: "success", ...risk };
  } catch (error) {
    logger.error("Forecast analysis error", error as Error);
    return { status: "error", message: error instanceof Error ? error.message : "Unknown error" };
  }
}

function classifyRisk(value: number): RiskClassification {
  if (value < 0.4) return { level: "OK", value, message: "Operação dentro do esperado" };
  if (value < 0.7) return { level: "Risco", value, message: "Risco moderado - verificar procedimentos ASOG" };
  return { level: "Crítico", value, message: "Risco crítico - ativar protocolo DP" };
}

function publishForecastAlert(risk: RiskClassification): void {
  try {
    const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "ws://localhost:1883");
    client.on("connect", () => {
      const alertData = { level: risk.level, value: risk.value, message: risk.message, timestamp: new Date().toISOString() };
      client.publish("nautilus/forecast/alert", JSON.stringify(alertData), { qos: 1 }, (err) => {
        if (err) logger.error("Failed to publish forecast alert", err as Error);
        else logger.info("Published forecast alert", { alertData });
        client.end();
      });
    });
    client.on("error", (err) => { logger.error("MQTT connection error", err as Error); client.end(); });
  } catch (error) {
    logger.error("Error publishing forecast alert", error as Error);
  }
}
