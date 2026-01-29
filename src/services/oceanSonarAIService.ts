/**
 * PATCH 539 - Ocean Sonar AI Service
 * AI-assisted sonar pattern interpretation with LLM
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { SonarData, SonarAIAnalysis } from "@/types/patches-536-540";
import type { Json } from "@/integrations/supabase/types";

export class OceanSonarAIService {
  private apiKey: string;

  constructor() {
    const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;
    this.apiKey = safeEnv.VITE_OPENAI_API_KEY || "";
    if (!this.apiKey) {
      logger.warn("Missing OpenAI API key. Sonar AI analysis will use fallback mode.");
    }
  }

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

  private async callAIModel(data: string, scanType: string): Promise<string> {
    if (!this.apiKey) {
      return JSON.stringify({ object_type: "Unknown - AI unavailable", confidence: 0.5 });
    }

    try {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });

      const completion = await client.chat.completions.create({
        messages: [{ role: "system", content: `Analyze sonar data (${scanType}): ${data}. Return JSON with object_type and confidence.` }],
        model: "gpt-3.5-turbo",
      });
      return completion.choices[0]?.message?.content || "{}";
    } catch (error) {
      logger.error("Error calling AI model", error as Error);
      return JSON.stringify({ object_type: "Error", confidence: 0 });
    }
  }

  private postprocessAIResult(scanId: string, result: string): SonarAIAnalysis {
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(result); } catch { parsed = { object_type: result }; }

    return {
      id: crypto.randomUUID(),
      scan_id: scanId,
      patterns_detected: null,
      anomalies: null,
      zones_of_interest: null,
      confidence_score: (parsed.confidence as number) ?? 0.8,
      interpretation: (parsed.object_type as string) ?? "Unknown",
      recommendations: null,
      model_version: "gpt-3.5-turbo",
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
