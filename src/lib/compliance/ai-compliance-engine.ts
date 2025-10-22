// @ts-nocheck
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";

const modelPath = "/models/nautilus_compliance.onnx";
let session: ort.InferenceSession | null = null;

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

/**
 * Analyze incident data for compliance violations
 * Supports: DP Loss, Sensor Misalignment, ISM/ISPS Non-Compliance, ASOG/FMEA Deviations
 */
export async function runComplianceAudit(data: any) {
  if (!session) await initComplianceEngine();
  
  // Handle both array and object inputs
  let inputArray = Array.isArray(data) ? data : convertIncidentDataToArray(data);
  
  const input = new ort.Tensor("float32", Float32Array.from(inputArray), [1, inputArray.length]);
  const results = await session!.run({ input });
  const score = (Object.values(results)[0] as any)[0] as number;

  const weightedScore = RULES.reduce((acc, rule) => acc + (score * rule.weight), 0);
  const complianceLevel = weightedScore > 0.85 ? "Conforme" : weightedScore > 0.65 ? "Risco" : "Não Conforme";

  await (supabase as any).from("compliance_audit_logs").insert({
    timestamp: new Date().toISOString(),
    score: weightedScore,
    level: complianceLevel,
  });

  // Optional MQTT publishing
  try {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    if (mqttUrl) {
      const client = mqtt.connect(mqttUrl);
      client.publish("nautilus/compliance/alerts", JSON.stringify({ level: complianceLevel, score: weightedScore }));
    }
  } catch (error) {
    console.warn("MQTT publishing skipped:", error);
  }

  return { score: weightedScore, complianceLevel };
}

/**
 * Convert incident object data to array format for ONNX model
 */
function convertIncidentDataToArray(data) {
  return [
    data.dpLoss ? 0.0 : 1.0,
    data.sensorMisalignment ? 0.0 : 1.0,
    data.ismNonCompliance ? 0.0 : 1.0,
    data.ispsNonCompliance ? 0.0 : 1.0,
    data.asogDeviations ? 0.0 : 1.0,
    data.fmeaDeviations ? 0.0 : 1.0,
  ];
}
