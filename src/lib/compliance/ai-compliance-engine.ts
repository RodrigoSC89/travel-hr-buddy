/**
 * AI Compliance Engine
 * ONNX-based compliance scoring for maritime regulations (IMCA, ISM, ISPS, NORMAM)
 * Typed queries against compliance_audit_logs
 * All heavy dependencies loaded dynamically for bundle optimization
 */
import type * as ORT from "onnxruntime-web";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

const modelPath = "/models/nautilus_compliance.onnx";
let session: ORT.InferenceSession | null = null;
let ortModule: typeof ORT | null = null;

const loadORT = async (): Promise<typeof ORT> => {
  if (!ortModule) {
    ortModule = await import("onnxruntime-web");
  }
  return ortModule;
};

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
    const ort = await loadORT();
    session = await ort.InferenceSession.create(modelPath);
    logger.info("✅ AI Compliance Engine iniciado");
  } catch (err) {
    logger.error("Erro ao carregar modelo ONNX", err as Error, { modelPath });
  }
}

/**
 * Analyze incident data for compliance violations
 * Supports: DP Loss, Sensor Misalignment, ISM/ISPS Non-Compliance, ASOG/FMEA Deviations
 */
export async function runComplianceAudit(data: IncidentData | number[]) {
  const ort = await loadORT();
  if (!session) await initComplianceEngine();
  
  // Handle both array and object inputs
  const inputArray = Array.isArray(data) ? data : convertIncidentDataToArray(data);
  
  const input = new ort.Tensor("float32", Float32Array.from(inputArray), [1, inputArray.length]);
  const results = await session!.run({ input });
  const score = (Object.values(results)[0] as ORT.Tensor).data[0] as number;

  const weightedScore = RULES.reduce((acc, rule) => acc + (score * rule.weight), 0);
  const complianceLevel = weightedScore > 0.85 ? "Conforme" : weightedScore > 0.65 ? "Risco" : "Não Conforme";

  // Insert typed compliance_audit_logs entry
  await supabase.from("compliance_audit_logs").insert({
    score: weightedScore,
    level: complianceLevel,
    audit_type: "ai_onnx",
    rules_evaluated: RULES.map(r => r.id),
  });

  // Optional MQTT publishing (dynamic import)
  try {
    const mqttUrl = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>).__MQTT_URL__ as string : undefined;
    if (mqttUrl) {
      const { default: mqtt } = await import("mqtt");
      const client = mqtt.connect(mqttUrl);
      client.publish("nautilus/compliance/alerts", JSON.stringify({ level: complianceLevel, score: weightedScore }));
    }
  } catch (error) {
    logger.warn("MQTT publishing skipped", { 
      error: error instanceof Error ? error.message : String(error),
      level: complianceLevel 
    });
  }

  return { score: weightedScore, complianceLevel };
}

interface IncidentData {
  dpLoss?: boolean;
  sensorMisalignment?: boolean;
  ismNonCompliance?: boolean;
  ispsNonCompliance?: boolean;
  asogDeviations?: boolean;
  fmeaDeviations?: boolean;
}

/**
 * Convert incident object data to array format for ONNX model
 */
function convertIncidentDataToArray(data: IncidentData): number[] {
  return [
    data.dpLoss ? 0.0 : 1.0,
    data.sensorMisalignment ? 0.0 : 1.0,
    data.ismNonCompliance ? 0.0 : 1.0,
    data.ispsNonCompliance ? 0.0 : 1.0,
    data.asogDeviations ? 0.0 : 1.0,
    data.fmeaDeviations ? 0.0 : 1.0,
  ];
}
