/**
 * AI Maintenance Orchestrator - Predictive Maintenance Engine
 * 
 * Implements autonomous predictive maintenance and repair orchestration
 * for Nautilus One, achieving compliance with IMCA M109, M140, M254,
 * ISM Code, and NORMAM 101 maritime safety standards.
 * 
 * @module MaintenanceOrchestrator
 * @version 1.0.0 (Patch 21)
 */

import * as ort from "onnxruntime-web";
import { publishEvent } from "@/lib/mqtt/publisher";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

// Risk thresholds aligned with maritime standards
const RISK_THRESHOLDS = {
  NORMAL: 0.3,      // Equipment operating within parameters
  ATENCAO: 0.7,     // Wear trend identified, inspection recommended
  CRITICO: 1.0,     // Imminent failure detected, IMCA M254 preventive repair required
} as const;

export type RiskLevel = "Normal" | "Atenção" | "Crítico";

export interface TelemetryData {
  generator_load: number;      // 0-100%
  position_error: number;      // meters
  vibration: number;           // mm/s
  temperature: number;         // °C
  power_fluctuation: number;   // %
}

export interface MaintenanceResult {
  risk_score: number;
  risk_level: RiskLevel;
  message: string;
  timestamp: string;
}

/**
 * Classify risk level based on ONNX model output
 */
function classifyRisk(riskScore: number): RiskLevel {
  if (riskScore < RISK_THRESHOLDS.NORMAL) return "Normal";
  if (riskScore < RISK_THRESHOLDS.ATENCAO) return "Atenção";
  return "Crítico";
}

/**
 * Generate maintenance message based on risk level
 */
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

/**
 * Run AI-powered predictive maintenance analysis
 * 
 * @param telemetry - Five telemetry parameters for analysis
 * @returns Maintenance result with risk assessment
 */
export async function runMaintenanceOrchestrator(
  telemetry: TelemetryData
): Promise<MaintenanceResult> {
  try {
    // Load ONNX model
    const session = await ort.InferenceSession.create("/models/nautilus_maintenance_predictor.onnx");

    // Prepare input tensor (5 features)
    const inputData = new Float32Array([
      telemetry.generator_load,
      telemetry.position_error,
      telemetry.vibration,
      telemetry.temperature,
      telemetry.power_fluctuation,
    ]);

    const tensor = new ort.Tensor("float32", inputData, [1, 5]);
    const feeds = { input: tensor };

    // Run inference
    const results = await session.run(feeds);
    const output = results.output.data as Float32Array;
    const riskScore = output[0];

    // Classify risk
    const riskLevel = classifyRisk(riskScore);
    const message = generateMessage(riskLevel, riskScore);
    const timestamp = new Date().toISOString();

    const result: MaintenanceResult = {
      risk_score: riskScore,
      risk_level: riskLevel,
      message,
      timestamp,
    };

    // Log to Supabase
    await logToSupabase(result);

    // Publish MQTT alert for critical/warning conditions
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
    logger.error("❌ Maintenance orchestrator error:", error);
    
    // Fallback result
    return {
      risk_score: 0,
      risk_level: "Normal",
      message: "Sistema de manutenção preditiva indisponível",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Log maintenance result to Supabase
 */
async function logToSupabase(result: MaintenanceResult): Promise<void> {
  try {
    const supabase = createClient();
    
    const { error } = await (supabase as any)
      .from("maintenance_logs")
      .insert({
        timestamp: result.timestamp,
        level: result.risk_level,
        message: result.message,
      });

    if (error) {
      logger.error("❌ Failed to log to Supabase:", error);
    }
  } catch (error) {
    logger.error("❌ Supabase logging error:", error);
  }
}
