/**
 * PATCH 605 - LLM Emission Analyzer
 * AI-powered analysis and forecasting of emissions and ESG metrics
 */

import { logger } from "@/lib/logger";
import { runAIContext } from "@/ai/kernel";
import type { EmissionLog, EmissionsForecast, ESGMetric } from "../types";

export class LLMEmissionAnalyzer {
  /**
   * Analyze emissions data and provide insights
   */
  static async analyzeEmissions(
    emissions: EmissionLog[],
    vesselId?: string
  ): Promise<{
    insights: string[];
    recommendations: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    complianceIssues: string[];
  }> {
    logger.info(`[LLM Emission Analyzer] Analyzing ${emissions.length} emission records...`);

    try {
      const context = this.buildAnalysisContext(emissions, vesselId);
      
      const aiResponse = await runAIContext({
        module: "esg-dashboard",
        action: "analyze_emissions",
        context: {
          prompt: this.buildAnalysisPrompt(context),
          vesselId,
          recordCount: emissions.length
        }
      });

      return this.parseAnalysisResponse(aiResponse);
    } catch (error) {
      logger.error("[LLM Emission Analyzer] Analysis failed:", error);
      return this.fallbackAnalysis(emissions);
    }
  }

  /**
   * Forecast future emissions using AI
   */
  static async forecastEmissions(
    historicalEmissions: EmissionLog[],
    vesselId?: string,
    forecastPeriod: "month" | "quarter" | "year" = "month"
  ): Promise<EmissionsForecast> {
    logger.info(`[LLM Emission Analyzer] Forecasting emissions for ${forecastPeriod}...`);

    try {
      const context = this.buildForecastContext(historicalEmissions, vesselId, forecastPeriod);
      
      const aiResponse = await runAIContext({
        module: "esg-dashboard",
        action: "forecast_emissions",
        context: {
          prompt: this.buildForecastPrompt(context),
          vesselId,
          period: forecastPeriod,
          historicalDataPoints: historicalEmissions.length
        }
      });

      return this.parseForecastResponse(aiResponse, vesselId, forecastPeriod);
    } catch (error) {
      logger.error("[LLM Emission Analyzer] Forecast failed:", error);
      return this.fallbackForecast(historicalEmissions, vesselId, forecastPeriod);
    }
  }

  /**
   * Analyze ESG metrics for compliance and trends
   */
  static async analyzeESGMetrics(
    metrics: ESGMetric[],
    vesselId?: string
  ): Promise<{
    overallScore: number;
    trends: Map<string, "improving" | "stable" | "declining">;
    alerts: string[];
    opportunities: string[];
  }> {
    logger.info(`[LLM Emission Analyzer] Analyzing ${metrics.length} ESG metrics...`);

    try {
      const grouped = this.groupMetricsByType(metrics);
      const trends = new Map<string, "improving" | "stable" | "declining">();
      const alerts: string[] = [];
      const opportunities: string[] = [];

      let totalScore = 0;
      let scoreCount = 0;

      // Analyze each metric type
      for (const [metricType, metricList] of grouped.entries()) {
        if (metricList.length >= 2) {
          const trend = this.calculateTrend(metricList);
          trends.set(metricType, trend);

          // Check compliance
          const latest = metricList[0];
          if (latest.complianceStatus === "non_compliant") {
            alerts.push(`${metricType}: Non-compliant status requires immediate action`);
          } else if (latest.complianceStatus === "at_risk") {
            alerts.push(`${metricType}: At-risk status - preventive action recommended`);
          }

          // Check against targets
          if (latest.targetValue && latest.value !== latest.targetValue) {
            const gap = ((latest.value - latest.targetValue) / latest.targetValue) * 100;
            if (Math.abs(gap) > 10) {
              opportunities.push(
                `${metricType}: ${Math.abs(gap).toFixed(1)}% ${gap > 0 ? "above" : "below"} target`
              );
            }
          }

          // Calculate score contribution
          const metricScore = this.calculateMetricScore(latest);
          totalScore += metricScore;
          scoreCount++;
        }
      }

      const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;

      return {
        overallScore,
        trends,
        alerts,
        opportunities
      };
    } catch (error) {
      logger.error("[LLM Emission Analyzer] ESG metrics analysis failed:", error);
      return {
        overallScore: 0,
        trends: new Map(),
        alerts: ["Analysis failed - manual review required"],
        opportunities: []
      };
    }
  }

  /**
   * Build context for emission analysis
   */
  private static buildAnalysisContext(emissions: EmissionLog[], vesselId?: string) {
    // Aggregate emissions by type
    const byType = new Map<string, number>();
    emissions.forEach(e => {
      byType.set(e.emissionType, (byType.get(e.emissionType) || 0) + e.amount);
    });

    // Calculate averages
    const avgFuelConsumption = emissions
      .filter(e => e.fuelConsumed)
      .reduce((sum, e) => sum + (e.fuelConsumed || 0), 0) / emissions.length;

    const avgDistance = emissions
      .filter(e => e.distanceTraveled)
      .reduce((sum, e) => sum + (e.distanceTraveled || 0), 0) / emissions.length;

    // Get CII ratings
    const ciiRatings = emissions
      .filter(e => e.ciiRating)
      .map(e => e.ciiRating);

    return {
      vesselId,
      totalRecords: emissions.length,
      emissionsByType: Object.fromEntries(byType),
      avgFuelConsumption,
      avgDistance,
      ciiRatings,
      timeRange: {
        start: emissions[emissions.length - 1]?.measurementDate,
        end: emissions[0]?.measurementDate
      }
    };
  }

  /**
   * Build AI prompt for analysis
   */
  private static buildAnalysisPrompt(context: any): string {
    return `
Analyze the following maritime emissions data and provide comprehensive insights:

**Vessel ID:** ${context.vesselId || "Fleet-wide"}
**Total Records:** ${context.totalRecords}
**Emissions by Type:**
${Object.entries(context.emissionsByType).map(([type, amount]) => `- ${type}: ${amount} tonnes`).join("\n")}

**Average Fuel Consumption:** ${context.avgFuelConsumption?.toFixed(2) || "N/A"} tonnes
**Average Distance:** ${context.avgDistance?.toFixed(2) || "N/A"} nautical miles
**CII Ratings:** ${context.ciiRatings?.join(", ") || "N/A"}

Provide:
1. **Key Insights** - Important observations about emission patterns
2. **Recommendations** - Actionable steps to reduce emissions
3. **Risk Level** - Overall environmental compliance risk (low/medium/high/critical)
4. **Compliance Issues** - Any regulatory concerns

Respond in JSON format:
{
  "insights": ["string"],
  "recommendations": ["string"],
  "riskLevel": "low|medium|high|critical",
  "complianceIssues": ["string"]
}
`;
  }

  /**
   * Parse AI analysis response
   */
  private static parseAnalysisResponse(aiResponse: any): any {
    try {
      const data = aiResponse?.analysis || aiResponse || {};
      return {
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        riskLevel: data.riskLevel || "medium",
        complianceIssues: data.complianceIssues || []
      };
    } catch (error) {
      logger.error("[LLM Emission Analyzer] Failed to parse analysis response:", error);
      throw error;
    }
  }

  /**
   * Build context for emissions forecast
   */
  private static buildForecastContext(
    emissions: EmissionLog[],
    vesselId: string | undefined,
    period: string
  ) {
    // Calculate trends
    const recentEmissions = emissions.slice(0, Math.min(30, emissions.length));
    const olderEmissions = emissions.slice(30, Math.min(60, emissions.length));

    const recentTotal = recentEmissions.reduce((sum, e) => sum + e.amount, 0);
    const olderTotal = olderEmissions.length > 0 
      ? olderEmissions.reduce((sum, e) => sum + e.amount, 0) 
      : recentTotal;

    const trend = olderTotal > 0 ? ((recentTotal - olderTotal) / olderTotal) * 100 : 0;

    return {
      vesselId,
      period,
      dataPoints: emissions.length,
      recentAverage: recentTotal / recentEmissions.length,
      trend,
      emissionsByType: this.aggregateByType(recentEmissions)
    };
  }

  /**
   * Build AI prompt for forecast
   */
  private static buildForecastPrompt(context: any): string {
    return `
Forecast maritime emissions for the next ${context.period} based on historical data:

**Data Points:** ${context.dataPoints}
**Recent Average:** ${context.recentAverage?.toFixed(2)} tonnes per record
**Trend:** ${context.trend > 0 ? "+" : ""}${context.trend.toFixed(1)}%

**Recent Emissions by Type:**
${Object.entries(context.emissionsByType).map(([type, amount]) => `- ${type}: ${amount} tonnes`).join("\n")}

Provide forecasted emissions for CO2, SOx, NOx, and total GHG, along with confidence level and factors affecting the forecast.

Respond in JSON format:
{
  "predictedEmissions": {
    "co2": number,
    "sox": number,
    "nox": number,
    "total_ghg": number
  },
  "confidence": number (0-100),
  "factors": ["string"],
  "recommendations": ["string"]
}
`;
  }

  /**
   * Parse forecast response
   */
  private static parseForecastResponse(
    aiResponse: any,
    vesselId: string | undefined,
    period: string
  ): EmissionsForecast {
    try {
      const data = aiResponse?.forecast || aiResponse || {};
      return {
        vesselId,
        period,
        predictedEmissions: data.predictedEmissions || {
          co2: 0,
          sox: 0,
          nox: 0,
          total_ghg: 0
        },
        confidence: (data.confidence || 60) / 100,
        factors: data.factors || [],
        recommendations: data.recommendations || []
      };
    } catch (error) {
      logger.error("[LLM Emission Analyzer] Failed to parse forecast response:", error);
      throw error;
    }
  }

  /**
   * Fallback analysis using rules
   */
  private static fallbackAnalysis(emissions: EmissionLog[]): any {
    const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
    const avgEmissions = totalEmissions / emissions.length;

    return {
      insights: [
        `Total emissions: ${totalEmissions.toFixed(2)} tonnes`,
        `Average per record: ${avgEmissions.toFixed(2)} tonnes`,
        `${emissions.length} emission records analyzed`
      ],
      recommendations: [
        "Implement fuel efficiency measures",
        "Consider alternative fuels",
        "Optimize voyage planning"
      ],
      riskLevel: avgEmissions > 100 ? "high" : avgEmissions > 50 ? "medium" : "low",
      complianceIssues: []
    };
  }

  /**
   * Fallback forecast using simple projection
   */
  private static fallbackForecast(
    emissions: EmissionLog[],
    vesselId: string | undefined,
    period: string
  ): EmissionsForecast {
    const recent = emissions.slice(0, 10);
    const avgCO2 = recent.reduce((sum, e) => sum + (e.emissionType === "co2" ? e.amount : 0), 0) / recent.length;

    return {
      vesselId,
      period,
      predictedEmissions: {
        co2: avgCO2 * 30, // Simple projection
        sox: avgCO2 * 0.02,
        nox: avgCO2 * 0.05,
        total_ghg: avgCO2 * 1.1
      },
      confidence: 0.5,
      factors: ["Historical average projection", "No AI analysis available"],
      recommendations: ["Collect more data for accurate forecasting"]
    };
  }

  /**
   * Aggregate emissions by type
   */
  private static aggregateByType(emissions: EmissionLog[]): Record<string, number> {
    const result: Record<string, number> = {};
    emissions.forEach(e => {
      result[e.emissionType] = (result[e.emissionType] || 0) + e.amount;
    });
    return result;
  }

  /**
   * Group metrics by type
   */
  private static groupMetricsByType(metrics: ESGMetric[]): Map<string, ESGMetric[]> {
    const grouped = new Map<string, ESGMetric[]>();
    metrics.forEach(m => {
      if (!grouped.has(m.metricType)) {
        grouped.set(m.metricType, []);
      }
      grouped.get(m.metricType)?.push(m);
    });

    // Sort each group by date
    grouped.forEach(list => {
      list.sort((a, b) => b.measurementDate.getTime() - a.measurementDate.getTime());
    });

    return grouped;
  }

  /**
   * Calculate trend for a metric type
   */
  private static calculateTrend(metrics: ESGMetric[]): "improving" | "stable" | "declining" {
    if (metrics.length < 2) return "stable";

    const recent = metrics[0].value;
    const older = metrics[metrics.length - 1].value;
    const change = ((recent - older) / older) * 100;

    if (Math.abs(change) < 5) return "stable";
    
    // For most metrics, higher is better (except emissions-related)
    const isEmissionMetric = metrics[0].metricType.includes("carbon") || 
                            metrics[0].metricType.includes("emission");
    
    if (isEmissionMetric) {
      return change < 0 ? "improving" : "declining";
    } else {
      return change > 0 ? "improving" : "declining";
    }
  }

  /**
   * Calculate score for a metric (0-100)
   */
  private static calculateMetricScore(metric: ESGMetric): number {
    let score = 50; // Base score

    // Adjust based on compliance status
    switch (metric.complianceStatus) {
      case "compliant":
        score = 90;
        break;
      case "at_risk":
        score = 60;
        break;
      case "non_compliant":
        score = 30;
        break;
      case "pending":
        score = 50;
        break;
    }

    // Adjust based on target achievement
    if (metric.targetValue && metric.value) {
      const achievement = (metric.value / metric.targetValue) * 100;
      if (achievement >= 90 && achievement <= 110) {
        score += 10; // Bonus for meeting target
      }
    }

    return Math.max(0, Math.min(100, score));
  }
}
