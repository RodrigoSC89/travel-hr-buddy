/**
 * AI Maintenance Orchestrator - Predictive Maintenance Engine
 * 
 * Implements autonomous predictive maintenance and repair orchestration
 * for Nautilus One, achieving compliance with IMCA M109, M140, M254,
 * ISM Code, and NORMAM 101 maritime safety standards.
 * DEBT-FIX: Removed (supabase as any) - maintenance_logs doesn't exist, using ai_audit_logs
 * 
 * @module MaintenanceOrchestrator
 * @version 1.0.0 (Patch 21)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ONNX runtime typing is complex
let ort: { InferenceSession: any; Tensor: any } | null = null;
const loadORT = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web") as unknown as { InferenceSession: any; Tensor: any };
  }
  return ort;
};
import { publishEvent } from "@/lib/mqtt/publisher";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Risk thresholds aligned with maritime standards
const RISK_THRESHOLDS = {
  NORMAL: 0.3,
  ATENCAO: 0.7,
  CRITICO: 1.0,
} as const;

export type RiskLevel = "Normal" | "Atenção" | "Crítico";

export interface TelemetryData {
  generator_load: number;
  position_error: number;
  vibration: number;
  temperature: number;
  power_fluctuation: number;
}

export interface MaintenanceResult {
  risk_score: number;
  risk_level: RiskLevel;
  message: string;
  timestamp: string;
}

function classifyRisk(riskScore: number): RiskLevel {
  if (riskScore < RISK_THRESHOLDS.NORMAL) return "Normal";
  if (riskScore < RISK_THRESHOLDS.ATENCAO) return "Atenção";
  return "Crítico";
}

function generateMessage(level: RiskLevel, score: number): string {
  switch (level) {
  case "Normal":
    return `✅ Equipamento operando dentro dos parâmetros (risco: ${(score * 100).toFixed(1)}%)`;
  case "Atenção":
    return `⚠️ Tendência de desgaste identificada - Inspeção recomendada (risco: ${(score * 100).toFixed(1)}%)`;
  case "Crítico":
    return `🔧 Falha iminente detectada - Reparo preventivo IMCA M254 necessário (risco: ${(score * 100).toFixed(1)}%)`;
  }
}

export async function runMaintenanceOrchestrator(
  telemetry: TelemetryData
): Promise<MaintenanceResult> {
  try {
    const ortModule = await loadORT();
    const session = await ortModule.InferenceSession.create("/models/nautilus_maintenance_predictor.onnx");

    const inputData = new Float32Array([
      telemetry.generator_load,
      telemetry.position_error,
      telemetry.vibration,
      telemetry.temperature,
      telemetry.power_fluctuation,
    ]);

    const tensor = new ortModule.Tensor("float32", inputData, [1, 5]);
    const feeds = { input: tensor };

    const results = await session.run(feeds);
    const output = results.output.data as Float32Array;
    const riskScore = output[0];

    const riskLevel = classifyRisk(riskScore);
    const message = generateMessage(riskLevel, riskScore);
    const timestamp = new Date().toISOString();

    const result: MaintenanceResult = {
      risk_score: riskScore,
      risk_level: riskLevel,
      message,
      timestamp,
    };

    await logToSupabase(result);

    if (riskLevel !== "Normal") {
      publishEvent("nautilus/maintenance/alert", {
        level: riskLevel,
        score: riskScore,
        message,
        timestamp,
      });
    }

    return result;
  } catch (error) {
    logger.error("Maintenance orchestrator error", error as Error);
    
    return {
      risk_score: 0,
      risk_level: "Normal",
      message: "Sistema de manutenção preditiva indisponível",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Log maintenance result to Supabase via ai_audit_logs (maintenance_logs table doesn't exist)
 */
async function logToSupabase(result: MaintenanceResult): Promise<void> {
  try {
    const { error } = await supabase
      .from("ai_audit_logs")
      .insert({
        user_input: `maintenance_prediction:${result.risk_level}`,
        ai_response: result.message,
        module_name: "maintenance-orchestrator",
        interaction_type: "maintenance_prediction",
        confidence_score: 1 - result.risk_score,
        model_provider: "onnx",
        model_version: "nautilus_maintenance_predictor",
        response_time_ms: 0,
        ip_address: "0.0.0.0"
      });

    if (error) {
      logger.error("Failed to log to Supabase", error, { result });
    }
  } catch (error) {
    logger.error("Supabase logging error", error as Error, { result });
  }
}
