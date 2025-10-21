// @ts-nocheck
import * as ort from "onnxruntime-web";
import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/mqtt/publisher";

export interface DPTelemetryData {
  windSpeed?: number;
  currentSpeed?: number;
  mode?: string;
  load?: number;
  generatorLoad?: number;
  positionError?: number;
}

export interface DPAdvice {
  level: string;
  message: string;
}

export async function runDPAdvisor(currentData: DPTelemetryData): Promise<DPAdvice> {
  try {
    const session = await ort.InferenceSession.create("/models/nautilus_dp_advisor.onnx");

    const inputData = [
      currentData.windSpeed || 0,
      currentData.currentSpeed || 0,
      currentData.mode === "AUTO" ? 1 : 0,
      currentData.load || 0,
      currentData.generatorLoad || 0,
      currentData.positionError || 0,
    ];

    const tensor = new ort.Tensor("float32", Float32Array.from(inputData), [1, 6]);
    const output = await session.run({ input: tensor });
    const result = output.recommendations.data[0];

    const advice = classifyAdvice(result);

    // Publish advice to MQTT channel
    publishEvent("nautilus/dp/advice", advice);

    // Log to Supabase for audit trail
    await supabase.from("dp_advisor_logs").insert({
      timestamp: new Date().toISOString(),
      ...advice,
    });

    return advice;
  } catch (error) {
    console.error("Error running DP Advisor:", error);
    // Return a safe fallback advice
    return {
      level: "Error",
      message: "Não foi possível processar a recomendação DP no momento.",
    };
  }
}

function classifyAdvice(value: number): DPAdvice {
  if (value < 0.4) {
    return { level: "OK", message: "Sistema DP dentro dos limites." };
  }
  if (value < 0.7) {
    return {
      level: "Risco",
      message: "Risco crescente — revisar thrust allocation e referência ativa.",
    };
  }
  return {
    level: "Crítico",
    message: "Alerta de perda de posição! Verificar sensores de heading e standby thrusters.",
  };
}
