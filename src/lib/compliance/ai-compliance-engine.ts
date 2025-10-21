// @ts-nocheck
import * as ort from "onnxruntime-web";
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";

const modelPath = "/models/nautilus_compliance.onnx";
let session;

const RULES = [
  { id: "IMCA_M103", weight: 0.08 },
  { id: "IMCA_M109", weight: 0.06 },
  { id: "IMCA_M117", weight: 0.10 },
  { id: "IMCA_M140", weight: 0.07 },
  { id: "IMCA_M166", weight: 0.07 },
  { id: "IMCA_M190", weight: 0.05 },
  { id: "IMCA_M206", weight: 0.06 },
  { id: "IMCA_M216", weight: 0.08 },
  { id: "IMCA_M254", weight: 0.05 },
  { id: "MSF_182", weight: 0.04 },
  { id: "IMO_GUIDE", weight: 0.06 },
  { id: "MTS_GUIDE", weight: 0.06 },
  { id: "ISM_CODE", weight: 0.06 },
  { id: "ISPS_CODE", weight: 0.08 },
  { id: "NORMAM_101", weight: 0.08 }
];

export async function initComplianceEngine() {
  try {
    session = await ort.InferenceSession.create(modelPath);
    console.log("✅ AI Compliance Engine iniciado");
  } catch (err) {
    console.error("Erro ao carregar modelo ONNX:", err);
  }
}

export async function runComplianceAudit(data) {
  if (!session) await initComplianceEngine();
  const input = new ort.Tensor("float32", Float32Array.from(data), [1, data.length]);
  const results = await session.run({ input });
  const score = Object.values(results)[0][0];

  const weightedScore = RULES.reduce((acc, rule) => acc + (score * rule.weight), 0);
  const complianceLevel = weightedScore > 0.85 ? "Conforme" : weightedScore > 0.65 ? "Risco" : "Não Conforme";

  await supabase.from("compliance_audit_logs").insert({
    timestamp: new Date().toISOString(),
    score: weightedScore,
    level: complianceLevel,
  });

  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
  client.publish("nautilus/compliance/alerts", JSON.stringify({ level: complianceLevel, score: weightedScore }));

  return { score: weightedScore, complianceLevel };
}
