// @ts-nocheck
import * as ort from "onnxruntime-web";
import mqtt from "mqtt";
import { supabase } from "@/integrations/supabase/client";

export async function runMaintenanceOrchestrator(dpData, controlData) {
  const session = await ort.InferenceSession.create("/models/nautilus_maintenance_predictor.onnx");

  const input = [
    dpData.generatorLoad || 0,
    dpData.positionError || 0,
    controlData.vibration || 0,
    controlData.temperature || 0,
    controlData.powerFluctuation || 0,
  ];

  const tensor = new ort.Tensor("float32", Float32Array.from(input), [1, 5]);
  const output = await session.run({ input });
  const risk = output.prediction.data[0];

  const classification = classifyRisk(risk);

  await supabase.from("maintenance_logs").insert({
    timestamp: new Date().toISOString(),
    ...classification,
  });

  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
  client.publish("nautilus/maintenance/alert", JSON.stringify(classification));

  return classification;
}

function classifyRisk(value) {
  if (value < 0.3) return { level: "Normal", message: "Equipamentos operando dentro dos parâmetros." };
  if (value < 0.7) return { level: "Atenção", message: "Tendência de desgaste identificada. Programar inspeção." };
  return {
    level: "Crítico",
    message: "Falha iminente detectada — iniciar procedimento de reparo preventivo IMCA M254.",
  };
}
