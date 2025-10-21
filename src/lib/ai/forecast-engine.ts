// @ts-nocheck
import * as ort from "onnxruntime-web";
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";

export async function runForecastAnalysis() {
  const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
  const { data } = await supabase.from("dp_telemetry").select("*").order("timestamp", { ascending: false }).limit(100);

  if (!data?.length) return { level: "Sem Dados", value: 0 };

  const input = new ort.Tensor("float32", data.map((x) => x.value), [1, data.length]);
  const output = await session.run({ input });
  const prediction = output.probabilities.data[0];

  const risk = classifyRisk(prediction);

  if (risk.level !== "OK") {
    const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
    client.publish("nautilus/forecast/alert", JSON.stringify(risk));
  }

  return risk;
}

function classifyRisk(value) {
  if (value < 0.4) return { level: "OK", value };
  if (value < 0.7) return { level: "Risco", value };
  return { level: "Crítico", value };
}
