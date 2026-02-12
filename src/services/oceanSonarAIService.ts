/**
 * PATCH 539 - Ocean Sonar AI Service
 * Routes through secure edge function proxy - NO browser-side API keys
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { SonarData, SonarAIAnalysis } from "@/types/patches-536-540";
import type { Json } from "@/integrations/supabase/types";
import { chatCompletionJSON } from "@/services/unified/openai-client.service";

export class OceanSonarAIService {
  public async analyzeSonarData(sonarData: SonarData): Promise<SonarAIAnalysis> {
    try {
      if (!sonarData || !sonarData.raw_data) {
        throw new Error("Invalid sonar data provided.");
      }

      const processedData = JSON.stringify(sonarData.raw_data);
      const analysisResult = await this.callAIModel(processedData, sonarData.scan_type || "active");
      const aiAnalysis = this.postprocessAIResult(sonarData.scan_id, analysisResult);

      await this.logDetection(sonarData, aiAnalysis);
      return aiAnalysis;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`Error analyzing sonar data: ${msg}`, { scanId: sonarData?.scan_id });
      throw new Error(`Failed to analyze sonar data: ${msg}`);
    }
  }

  private async callAIModel(data: string, scanType: string): Promise<Record<string, unknown>> {
    try {
      const result = await chatCompletionJSON<{ object_type: string; confidence: number }>(
        [{ role: "system", content: `Analyze sonar data (${scanType}): ${data}. Return JSON with object_type and confidence.` }],
        { maxTokens: 500 }
      );

      return result || { object_type: "Unknown - AI unavailable", confidence: 0.5 };
    } catch (error) {
      logger.error("Error calling AI model", error as Error);
      return { object_type: "Error", confidence: 0 };
    }
  }

  private postprocessAIResult(scanId: string, result: Record<string, unknown>): SonarAIAnalysis {
    return {
      id: crypto.randomUUID(),
      scan_id: scanId,
      patterns_detected: null,
      anomalies: null,
      zones_of_interest: null,
      confidence_score: (result.confidence as number) ?? 0.8,
      interpretation: (result.object_type as string) ?? "Unknown",
      recommendations: null,
      model_version: "ai-proxy",
      processing_time_ms: null,
      created_at: new Date().toISOString(),
    };
  }

  private async logDetection(sonarData: SonarData, aiAnalysis: SonarAIAnalysis): Promise<void> {
    try {
      const { error } = await supabase.from("sonar_detection_logs").insert([{
        scan_id: sonarData.scan_id,
        detection_type: aiAnalysis.interpretation || "unknown",
        confidence: aiAnalysis.confidence_score,
        location: sonarData.location as Json,
        status: "new",
        created_at: new Date().toISOString(),
      }]);

      if (error) logger.error(`Error logging detection: ${error.message}`);
    } catch (error) {
      logger.error("Error logging detection", error as Error);
    }
  }
}
