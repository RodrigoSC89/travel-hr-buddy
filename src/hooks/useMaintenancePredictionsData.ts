/**
 * Hook para dados reais de Manutenção Preditiva
 * Substitui MOCK_PREDICTIONS em PredictiveMaintenanceScheduler.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PredictedMaintenance {
  id: string;
  equipment: string;
  vessel: string;
  type: "predictive" | "preventive" | "corrective";
  priority: "critical" | "high" | "medium" | "low";
  predictedDate: Date;
  confidence: number;
  estimatedCost: number;
  partsNeeded: Array<{ name: string; quantity: number; inStock: boolean }>;
  reason: string;
  healthScore: number;
}

export function useMaintenancePredictionsData() {
  const { data: predictions = [], isLoading, refetch } = useQuery({
    queryKey: ["maintenance-predictions-data"],
    queryFn: async () => {
      // Fetch AI maintenance predictions
      const { data: aiPredictions, error: error1 } = await supabase
        .from("ai_maintenance_predictions")
        .select(`
          *,
          vessels (name)
        `)
        .order("predicted_failure_date", { ascending: true })
        .limit(20);

      if (error1) throw error1;

      // Fetch pending maintenance records
      const { data: maintenanceRecords, error: error2 } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          vessels (name)
        `)
        .in("status", ["pending", "in_progress", "scheduled"])
        .order("scheduled_date", { ascending: true })
        .limit(20);

      if (error2) throw error2;

      // Map AI predictions
      const fromAI: PredictedMaintenance[] = (aiPredictions || []).map((p: any) => ({
        id: p.id,
        equipment: p.equipment_name || "Equipamento",
        vessel: p.vessels?.name || "N/A",
        type: "predictive" as const,
        priority: mapFailureProbabilityToPriority(p.failure_probability),
        predictedDate: new Date(p.predicted_failure_date || Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: Math.round((p.confidence || 0.8) * 100),
        estimatedCost: extractCostFromRiskFactors(p.risk_factors) || 10000,
        partsNeeded: extractPartsFromRiskFactors(p.risk_factors),
        reason: p.recommended_action || "Manutenção preditiva recomendada pela IA",
        healthScore: Math.round((1 - (p.failure_probability || 0.3)) * 100),
      }));

      // Map maintenance records
      const fromRecords: PredictedMaintenance[] = (maintenanceRecords || []).map((m: any) => ({
        id: m.id,
        equipment: m.component || m.title || "Equipamento",
        vessel: m.vessels?.name || "N/A",
        type: mapMaintenanceType(m.maintenance_type),
        priority: mapPriorityString(m.priority),
        predictedDate: new Date(m.scheduled_date || m.created_at),
        confidence: m.priority === "critical" ? 95 : m.priority === "high" ? 88 : m.priority === "medium" ? 80 : 70,
        estimatedCost: m.cost_estimate || 0,
        partsNeeded: extractPartsFromDescription(m.description),
        reason: m.description || "Manutenção programada",
        healthScore: m.priority === "critical" ? 35 : m.priority === "high" ? 55 : m.priority === "medium" ? 75 : 90,
      }));

      return [...fromAI, ...fromRecords].sort(
        (a, b) => a.predictedDate.getTime() - b.predictedDate.getTime()
      );
    },
  });

  // Calculate stats
  const stats = {
    critical: predictions.filter((p) => p.priority === "critical").length,
    high: predictions.filter((p) => p.priority === "high").length,
    medium: predictions.filter((p) => p.priority === "medium").length,
    low: predictions.filter((p) => p.priority === "low").length,
    totalCost: predictions.reduce((acc, p) => acc + p.estimatedCost, 0),
    avgConfidence: predictions.length > 0
      ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)
      : 0,
    partsNeeded: predictions.flatMap((p) => p.partsNeeded).filter((p) => !p.inStock).length,
  };

  return {
    predictions,
    stats,
    isLoading,
    refetch,
  };
}

function mapFailureProbabilityToPriority(probability: number): PredictedMaintenance["priority"] {
  if (probability >= 0.8) return "critical";
  if (probability >= 0.6) return "high";
  if (probability >= 0.4) return "medium";
  return "low";
}

function mapMaintenanceType(type: string): PredictedMaintenance["type"] {
  if (!type) return "preventive";
  const t = type.toLowerCase();
  if (t.includes("predictive") || t.includes("preditiva")) return "predictive";
  if (t.includes("corrective") || t.includes("corretiva")) return "corrective";
  return "preventive";
}

function mapPriorityString(priority: string): PredictedMaintenance["priority"] {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "crítico":
      return "critical";
    case "high":
    case "alta":
    case "alto":
      return "high";
    case "medium":
    case "média":
    case "médio":
      return "medium";
    case "low":
    case "baixa":
    case "baixo":
      return "low";
    default:
      return "medium";
  }
}

function extractCostFromRiskFactors(riskFactors: any): number {
  if (!riskFactors) return 10000;
  if (typeof riskFactors === "string") {
    try {
      riskFactors = JSON.parse(riskFactors);
    } catch {
      return 10000;
    }
  }
  return riskFactors?.estimated_cost || riskFactors?.cost || 10000;
}

function extractPartsFromRiskFactors(riskFactors: any): PredictedMaintenance["partsNeeded"] {
  if (!riskFactors) return [{ name: "Peça genérica", quantity: 1, inStock: true }];
  if (typeof riskFactors === "string") {
    try {
      riskFactors = JSON.parse(riskFactors);
    } catch {
      return [{ name: "Peça genérica", quantity: 1, inStock: true }];
    }
  }
  
  if (Array.isArray(riskFactors.parts)) {
    return riskFactors.parts;
  }
  
  return [{ name: "Peça genérica", quantity: 1, inStock: true }];
}

function extractPartsFromDescription(description: string): PredictedMaintenance["partsNeeded"] {
  // Simple extraction based on common patterns
  const parts: PredictedMaintenance["partsNeeded"] = [];
  
  const commonParts = ["filtro", "óleo", "junta", "rolamento", "selo", "sensor"];
  
  commonParts.forEach((part, idx) => {
    if (description?.toLowerCase().includes(part)) {
      parts.push({
        name: part.charAt(0).toUpperCase() + part.slice(1),
        quantity: idx < 2 ? 2 : 1,
        inStock: idx < 4, // first 4 parts assumed in stock
      });
    }
  });
  
  if (parts.length === 0) {
    parts.push({ name: "Kit de manutenção", quantity: 1, inStock: true });
  }
  
  return parts;
}
