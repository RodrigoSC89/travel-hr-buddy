/**
 * PATCH 603 - LLM Next Inspection Predictor
 * AI-powered prediction of next inspection date and priority
 */

import { logger } from "@/lib/logger";
import { runAIContext } from "@/ai/kernel";

export interface InspectionPrediction {
  moduleName: string;
  vesselId?: string;
  predictedDate: Date;
  confidence: number; // 0-1
  priority: "critical" | "high" | "medium" | "low";
  reasoning: string;
  riskFactors: string[];
  recommendedActions: string[];
}

export class LLMNextInspectionPredictor {
  /**
   * Predict next inspection date using AI analysis
   */
  static async predictNextInspection(
    moduleName: string,
    vesselId?: string,
    historicalData?: any[]
  ): Promise<InspectionPrediction> {
    logger.info(`[LLM Inspection Predictor] Predicting next inspection for ${moduleName}...`);

    try {
      const context = this.buildPredictionContext(moduleName, vesselId, historicalData);
      
      const aiResponse = await runAIContext({
        module: "smart-scheduler",
        action: "predict_inspection",
        context: {
          prompt: this.buildPrompt(context),
          moduleName,
          vesselId,
          historicalRecords: historicalData?.length || 0
        }
      });

      const prediction = this.parseAIResponse(aiResponse, moduleName, vesselId);
      
      logger.info(`[LLM Inspection Predictor] Predicted inspection in ${this.getDaysUntil(prediction.predictedDate)} days`);
      
      return prediction;
    } catch (error) {
      logger.error("[LLM Inspection Predictor] Prediction failed:", error);
      
      // Fallback to rule-based prediction
      return this.fallbackPrediction(moduleName, vesselId, historicalData);
    }
  }

  /**
   * Batch predict multiple inspections
   */
  static async batchPredict(
    modules: Array<{ name: string; vesselId?: string; data?: any[] }>
  ): Promise<InspectionPrediction[]> {
    logger.info(`[LLM Inspection Predictor] Batch predicting ${modules.length} inspections...`);

    const predictions = await Promise.all(
      modules.map(m => this.predictNextInspection(m.name, m.vesselId, m.data))
    );

    return predictions;
  }

  /**
   * Build prediction context from historical data
   */
  private static buildPredictionContext(
    moduleName: string,
    vesselId: string | undefined,
    historicalData?: any[]
  ): any {
    if (!historicalData || historicalData.length === 0) {
      return {
        moduleName,
        vesselId,
        hasHistory: false,
        dataPoints: 0
      };
    }

    // Analyze historical patterns
    const scores = historicalData.map(d => d.score).filter(s => s != null);
    const avgScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : null;

    const dates = historicalData
      .map(d => new Date(d.data || d.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    let avgInterval = null;
    if (dates.length >= 2) {
      let totalDays = 0;
      for (let i = 1; i < dates.length; i++) {
        totalDays += Math.floor(
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      avgInterval = totalDays / (dates.length - 1);
    }

    const lastInspection = dates.length > 0 ? dates[dates.length - 1] : null;
    const daysSinceLastInspection = lastInspection
      ? Math.floor((new Date().getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Count findings
    const totalFindings = historicalData.reduce((sum, d) => 
      sum + (d.findings?.length || 0), 0
    );

    return {
      moduleName,
      vesselId,
      hasHistory: true,
      dataPoints: historicalData.length,
      avgScore,
      avgInterval,
      lastInspection: lastInspection?.toISOString(),
      daysSinceLastInspection,
      totalFindings,
      avgFindingsPerInspection: historicalData.length > 0 
        ? totalFindings / historicalData.length 
        : 0
    };
  }

  /**
   * Build AI prompt for prediction
   */
  private static buildPrompt(context: any): string {
    return `
You are an expert maritime inspection scheduling AI. Analyze the following data and predict when the next inspection should occur.

**Module:** ${context.moduleName}
**Vessel ID:** ${context.vesselId || "All vessels"}
**Historical Data:**
- Data points: ${context.dataPoints}
- Average score: ${context.avgScore?.toFixed(1) || "N/A"}
- Average inspection interval: ${context.avgInterval ? Math.floor(context.avgInterval) + " days" : "N/A"}
- Days since last inspection: ${context.daysSinceLastInspection || "N/A"}
- Total findings: ${context.totalFindings || 0}
- Average findings per inspection: ${context.avgFindingsPerInspection?.toFixed(1) || "N/A"}

Based on this data, provide:
1. **Predicted Days Until Next Inspection** (integer)
2. **Confidence Level** (0-100%)
3. **Priority** (Critical, High, Medium, Low)
4. **Reasoning** (brief explanation)
5. **Risk Factors** (list of concerns)
6. **Recommended Actions** (list of preparatory steps)

Respond in JSON format:
{
  "daysUntilInspection": number,
  "confidence": number,
  "priority": "critical" | "high" | "medium" | "low",
  "reasoning": "string",
  "riskFactors": ["string"],
  "recommendedActions": ["string"]
}

Consider:
- Regulatory compliance intervals
- Historical patterns and trends
- Severity of past findings
- Industry best practices for ${context.moduleName}
`;
  }

  /**
   * Parse AI response into structured prediction
   */
  private static parseAIResponse(
    aiResponse: any,
    moduleName: string,
    vesselId?: string
  ): InspectionPrediction {
    try {
      const data = aiResponse?.prediction || aiResponse || {};
      
      const daysUntil = data.daysUntilInspection || 30;
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + daysUntil);

      return {
        moduleName,
        vesselId,
        predictedDate,
        confidence: (data.confidence || 70) / 100,
        priority: this.normalizePriority(data.priority),
        reasoning: data.reasoning || "AI-based prediction using historical patterns",
        riskFactors: data.riskFactors || [],
        recommendedActions: data.recommendedActions || []
      };
    } catch (error) {
      logger.error("[LLM Inspection Predictor] Failed to parse AI response:", error);
      throw error;
    }
  }

  /**
   * Fallback prediction using rules
   */
  private static fallbackPrediction(
    moduleName: string,
    vesselId?: string,
    historicalData?: any[]
  ): InspectionPrediction {
    logger.info("[LLM Inspection Predictor] Using fallback prediction...");

    // Default intervals by module type
    const defaultIntervals: Record<string, number> = {
      "PSC": 180, // 6 months
      "MLC": 365, // 1 year
      "LSA": 90,  // 3 months
      "FFA": 180, // 6 months
      "IMCA": 365, // 1 year
      "SGSO": 90  // 3 months
    };

    let daysUntil = defaultIntervals[moduleName] || 90;
    let priority: "critical" | "high" | "medium" | "low" = "medium";

    // Adjust based on historical data
    if (historicalData && historicalData.length > 0) {
      const recentAudit = historicalData[0];
      const score = recentAudit.score || 70;

      // Lower scores = sooner inspection
      if (score < 60) {
        daysUntil = Math.floor(daysUntil * 0.5);
        priority = "critical";
      } else if (score < 70) {
        daysUntil = Math.floor(daysUntil * 0.7);
        priority = "high";
      } else if (score >= 90) {
        daysUntil = Math.floor(daysUntil * 1.2);
        priority = "low";
      }
    }

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysUntil);

    return {
      moduleName,
      vesselId,
      predictedDate,
      confidence: 0.6,
      priority,
      reasoning: `Rule-based prediction using standard ${moduleName} inspection interval`,
      riskFactors: historicalData && historicalData.length > 0 
        ? ["Historical data available but AI prediction unavailable"]
        : ["No historical data available"],
      recommendedActions: [
        `Schedule ${moduleName} inspection`,
        "Review previous findings",
        "Ensure crew availability"
      ]
    };
  }

  /**
   * Normalize priority string
   */
  private static normalizePriority(priority: any): "critical" | "high" | "medium" | "low" {
    const normalized = (priority || "medium").toString().toLowerCase();
    if (normalized.includes("critical")) return "critical";
    if (normalized.includes("high")) return "high";
    if (normalized.includes("low")) return "low";
    return "medium";
  }

  /**
   * Get days until a date
   */
  private static getDaysUntil(date: Date): number {
    return Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }
}
