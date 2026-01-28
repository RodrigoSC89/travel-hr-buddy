/**
 * ML Predictions Engine
 * Machine learning models for business forecasting
 * Phase 4: Analytics Premium
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface PredictionResult {
  prediction: number;
  confidence: number;
  lower_bound: number;
  upper_bound: number;
  factors: PredictionFactor[];
  model_version: string;
  generated_at: string;
}

export interface PredictionFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

export interface CrewDemandPrediction extends PredictionResult {
  role: string;
  vessel_type?: string;
  period: string;
  current_demand: number;
  predicted_demand: number;
  hiring_recommendation: "hire" | "maintain" | "reduce";
}

export interface MaintenancePrediction extends PredictionResult {
  equipment_id: string;
  equipment_name: string;
  failure_probability: number;
  recommended_date: string;
  cost_estimate: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface CostPrediction extends PredictionResult {
  category: string;
  current_monthly: number;
  predicted_monthly: number;
  trend: "increasing" | "stable" | "decreasing";
  anomaly_detected: boolean;
}

/**
 * ML Predictions Engine
 * Uses statistical models and time series analysis
 */
export class MLPredictionsEngine {
  private modelVersion = "1.0.0";

  /**
   * Predict crew demand for next periods
   */
  async predictCrewDemand(params: {
    role?: string;
    vessel_type?: string;
    periods?: number;
  }): Promise<CrewDemandPrediction[]> {
    try {
      // Get historical data
      const { data: historical, error } = await supabase
        .from("crew_members")
        .select("position, vessel_id, status, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by role and analyze trends
      const roleGroups = this.groupByRole(historical || []);
      const predictions: CrewDemandPrediction[] = [];

      for (const [role, data] of Object.entries(roleGroups)) {
        if (params.role && role !== params.role) continue;

        const timeSeries = this.buildTimeSeriesFromRoles(data);
        const forecast = this.exponentialSmoothing(timeSeries, params.periods || 3);

        const currentDemand = data.filter((d) => d.status === "active").length;
        const predictedDemand = Math.round(forecast.prediction);

        predictions.push({
          role,
          period: `Next ${params.periods || 3} months`,
          current_demand: currentDemand,
          predicted_demand: predictedDemand,
          prediction: predictedDemand,
          confidence: forecast.confidence,
          lower_bound: Math.round(forecast.lower_bound),
          upper_bound: Math.round(forecast.upper_bound),
        hiring_recommendation: this.getHiringRecommendation(
          currentDemand,
          predictedDemand
        ),
        factors: this.analyzeDemandFactors(data as { status: string }[]),
          model_version: this.modelVersion,
          generated_at: new Date().toISOString(),
        });
      }

      logger.info("[ML] Crew demand prediction completed", {
        count: predictions.length,
      });
      return predictions;
    } catch (error) {
      logger.error("[ML] Crew demand prediction failed", error);
      return [];
    }
  }

  /**
   * Predict equipment maintenance needs
   */
  async predictMaintenance(vesselId?: string): Promise<MaintenancePrediction[]> {
    try {
      // Get equipment and maintenance history
      let query = supabase
        .from("ai_maintenance_predictions")
        .select("*")
        .order("failure_probability", { ascending: false });

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      const predictions: MaintenancePrediction[] = (data || []).map((item) => ({
        equipment_id: item.equipment_id,
        equipment_name: item.equipment_name,
        failure_probability: item.failure_probability,
        recommended_date: item.predicted_failure_date || this.calculateMaintenanceDate(item.failure_probability),
        cost_estimate: this.estimateMaintenanceCost(item.equipment_name),
        priority: this.getPriorityFromProbability(item.failure_probability),
        prediction: item.failure_probability * 100,
        confidence: item.confidence || 0.8,
        lower_bound: (item.failure_probability - 0.1) * 100,
        upper_bound: (item.failure_probability + 0.1) * 100,
        factors: (item.risk_factors as unknown as PredictionFactor[]) || [],
        model_version: this.modelVersion,
        generated_at: new Date().toISOString(),
      }));

      return predictions;
    } catch (error) {
      logger.error("[ML] Maintenance prediction failed", error);
      return [];
    }
  }

  /**
   * Predict operational costs
   */
  async predictCosts(params: {
    category?: string;
    periods?: number;
  }): Promise<CostPrediction[]> {
    try {
      // Get payroll data as cost indicator
      const { data: payroll, error } = await supabase
        .from("crew_payroll")
        .select("base_salary, gross_pay, created_at, payment_status")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Build time series from payroll
      const monthlyTotals = new Map<string, number>();

      (payroll || []).forEach((p) => {
        if (!p.created_at) return;
        const month = p.created_at.slice(0, 7);
        const current = monthlyTotals.get(month) || 0;
        monthlyTotals.set(month, current + (p.gross_pay || p.base_salary || 0));
      });

      const timeSeries: TimeSeriesPoint[] = Array.from(monthlyTotals.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (timeSeries.length < 3) {
        return [];
      }

      const forecast = this.exponentialSmoothing(timeSeries, params.periods || 3);
      const lastValue = timeSeries[timeSeries.length - 1]?.value || 0;
      const avgValue = timeSeries.reduce((sum, p) => sum + p.value, 0) / timeSeries.length;

      const prediction: CostPrediction = {
        category: "payroll",
        current_monthly: lastValue,
        predicted_monthly: forecast.prediction,
        trend: this.determineTrend(timeSeries),
        anomaly_detected: this.detectAnomaly(timeSeries, lastValue),
        prediction: forecast.prediction,
        confidence: forecast.confidence,
        lower_bound: forecast.lower_bound,
        upper_bound: forecast.upper_bound,
        factors: [
          {
            name: "crew_count",
            impact: 0.6,
            description: "Number of active crew members",
          },
          {
            name: "overtime",
            impact: 0.2,
            description: "Average overtime hours",
          },
          {
            name: "inflation",
            impact: 0.15,
            description: "Salary adjustment for inflation",
          },
        ],
        model_version: this.modelVersion,
        generated_at: new Date().toISOString(),
      };

      return [prediction];
    } catch (error) {
      logger.error("[ML] Cost prediction failed", error);
      return [];
    }
  }

  /**
   * Predict turnover risk for crew members
   */
  async predictTurnoverRisk(): Promise<
    {
      crew_member_id: string;
      name: string;
      risk_score: number;
      risk_level: "low" | "medium" | "high";
      factors: string[];
    }[]
  > {
    try {
      const { data: crew, error } = await supabase
        .from("crew_members")
        .select("id, full_name, position, status, join_date, contract_end")
        .eq("status", "active");

      if (error) throw error;

      return (crew || []).map((member) => {
        const factors: string[] = [];
        let riskScore = 0;

        // Contract ending soon
        if (member.contract_end) {
          const daysToEnd = Math.ceil(
            (new Date(member.contract_end).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysToEnd < 30) {
            riskScore += 40;
            factors.push("Contract ending within 30 days");
          } else if (daysToEnd < 90) {
            riskScore += 20;
            factors.push("Contract ending within 90 days");
          }
        }

        // Long tenure (might be looking for change)
        if (member.join_date) {
          const tenure = Math.ceil(
            (Date.now() - new Date(member.join_date).getTime()) /
              (1000 * 60 * 60 * 24 * 365)
          );
          if (tenure > 5) {
            riskScore += 15;
            factors.push("Extended tenure (>5 years)");
          }
        }

        // Add random factor for demo
        riskScore += Math.floor(Math.random() * 20);

        return {
          crew_member_id: member.id,
          name: member.full_name,
          risk_score: Math.min(100, riskScore),
          risk_level:
            riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low",
          factors,
        };
      });
    } catch (error) {
      logger.error("[ML] Turnover prediction failed", error);
      return [];
    }
  }

  // ============ Helper Methods ============

  private groupByRole(data: { position: string | null; status: string | null }[]): Record<
    string,
    { position: string | null; status: string | null }[]
  > {
    return data.reduce(
      (acc, item) => {
        const role = item.position || "Unknown";
        if (!acc[role]) acc[role] = [];
        acc[role].push(item);
        return acc;
      },
      {} as Record<string, typeof data>
    );
  }

  private buildTimeSeriesFromRoles(
    data: { position: string | null; status: string | null; created_at?: string }[]
  ): TimeSeriesPoint[] {
    // Simplified: count active by month
    const monthCounts = new Map<string, number>();
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toISOString().slice(0, 7);

      const count = data.filter((d) => {
        if (!d.created_at) return false;
        const created = new Date(d.created_at);
        return created <= date;
      }).length;

      monthCounts.set(key, count);
    }

    return Array.from(monthCounts.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private buildTimeSeries(
    data: { created_at?: string }[]
  ): TimeSeriesPoint[] {
    const monthCounts = new Map<string, number>();
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toISOString().slice(0, 7);

      const count = data.filter((d) => {
        if (!d.created_at) return false;
        const created = new Date(d.created_at);
        return created <= date;
      }).length;

      monthCounts.set(key, count);
    }

    return Array.from(monthCounts.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private exponentialSmoothing(
    series: TimeSeriesPoint[],
    periods: number,
    alpha: number = 0.3
  ): { prediction: number; confidence: number; lower_bound: number; upper_bound: number } {
    if (series.length === 0) {
      return { prediction: 0, confidence: 0, lower_bound: 0, upper_bound: 0 };
    }

    let smoothed = series[0].value;
    const errors: number[] = [];

    for (let i = 1; i < series.length; i++) {
      const error = Math.abs(series[i].value - smoothed);
      errors.push(error);
      smoothed = alpha * series[i].value + (1 - alpha) * smoothed;
    }

    // Simple trend extension
    const trend = series.length > 1
      ? (series[series.length - 1].value - series[series.length - 2].value) / 2
      : 0;

    const prediction = smoothed + trend * periods;
    const avgError = errors.length > 0
      ? errors.reduce((a, b) => a + b, 0) / errors.length
      : prediction * 0.1;

    const confidence = Math.max(0.5, 1 - (avgError / (prediction || 1)));

    return {
      prediction,
      confidence,
      lower_bound: prediction - avgError * 2,
      upper_bound: prediction + avgError * 2,
    };
  }

  private getHiringRecommendation(
    current: number,
    predicted: number
  ): "hire" | "maintain" | "reduce" {
    const diff = predicted - current;
    const threshold = current * 0.1;

    if (diff > threshold) return "hire";
    if (diff < -threshold) return "reduce";
    return "maintain";
  }

  private analyzeDemandFactors(
    data: { status: string }[]
  ): PredictionFactor[] {
    const active = data.filter((d) => d.status === "active").length;
    const total = data.length;

    return [
      {
        name: "retention_rate",
        impact: active / total - 0.5,
        description: `Current retention: ${((active / total) * 100).toFixed(1)}%`,
      },
      {
        name: "market_trend",
        impact: 0.1,
        description: "Industry growth forecast",
      },
    ];
  }

  private calculateMaintenanceDate(probability: number): string {
    const daysUntil = Math.round((1 - probability) * 90);
    const date = new Date();
    date.setDate(date.getDate() + daysUntil);
    return date.toISOString().split("T")[0];
  }

  private estimateMaintenanceCost(equipmentName: string): number {
    // Simplified cost estimation
    const baseCosts: Record<string, number> = {
      engine: 50000,
      generator: 15000,
      pump: 5000,
      radar: 10000,
      default: 8000,
    };

    const key = Object.keys(baseCosts).find((k) =>
      equipmentName.toLowerCase().includes(k)
    );
    return baseCosts[key || "default"];
  }

  private getPriorityFromProbability(
    probability: number
  ): "low" | "medium" | "high" | "critical" {
    if (probability >= 0.8) return "critical";
    if (probability >= 0.6) return "high";
    if (probability >= 0.3) return "medium";
    return "low";
  }

  private determineTrend(
    series: TimeSeriesPoint[]
  ): "increasing" | "stable" | "decreasing" {
    if (series.length < 2) return "stable";

    const recent = series.slice(-3);
    const avgRecent = recent.reduce((s, p) => s + p.value, 0) / recent.length;
    const older = series.slice(0, -3);
    const avgOlder =
      older.length > 0
        ? older.reduce((s, p) => s + p.value, 0) / older.length
        : avgRecent;

    const change = (avgRecent - avgOlder) / (avgOlder || 1);

    if (change > 0.05) return "increasing";
    if (change < -0.05) return "decreasing";
    return "stable";
  }

  private detectAnomaly(series: TimeSeriesPoint[], current: number): boolean {
    if (series.length < 5) return false;

    const values = series.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    return Math.abs(current - mean) > 2 * std;
  }
}

// Singleton instance
export const mlPredictions = new MLPredictionsEngine();
