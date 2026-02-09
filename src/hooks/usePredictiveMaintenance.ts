/**
 * usePredictiveMaintenance - Hook for AI-powered predictive maintenance
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenancePrediction {
  equipment_name: string;
  failure_probability: number;
  estimated_days_to_failure?: number;
  recommended_action: "immediate" | "scheduled" | "monitor";
  risk_factors: string[];
  impact?: string;
  preventive_cost_usd?: number;
  corrective_cost_usd?: number;
}

interface PredictionResult {
  predictions: MaintenancePrediction[];
  summary: string;
  overall_risk: "low" | "medium" | "high" | "critical";
}

export function usePredictiveMaintenance() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(async (options?: {
    equipmentId?: string;
    vesselId?: string;
    analysisType?: string;
  }) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("predictive-maintenance-ai", {
        body: {
          equipmentId: options?.equipmentId,
          vesselId: options?.vesselId,
          analysisType: options?.analysisType || "comprehensive",
        },
      });

      if (error) throw error;

      setResult(data);
      toast.success("Análise preditiva concluída", {
        description: `${data.predictions?.length || 0} equipamentos analisados`,
      });
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro na análise preditiva";
      toast.error("Erro na análise preditiva", { description: msg });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { result, isAnalyzing, analyze };
}
