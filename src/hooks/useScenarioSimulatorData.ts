/**
 * Hook para dados reais de Simulador de Cenários
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: "maintenance" | "compliance" | "crew" | "weather" | "emergency";
  parameters: Record<string, unknown>;
  lastUsed?: Date;
  usageCount: number;
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  scenarioName: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  results: {
    riskScore: number;
    recommendations: string[];
    impacts: Array<{
      area: string;
      level: "low" | "medium" | "high" | "critical";
      description: string;
    }>;
    estimatedCost?: number;
    timeToResolve?: number;
  };
}

export function useScenarioSimulatorData() {
  const queryClient = useQueryClient();

  // Fetch scenario presets from ai_memory or create defaults
  const { data: presets = [], isLoading: loadingPresets } = useQuery({
    queryKey: ["scenario-presets"],
    queryFn: async (): Promise<ScenarioPreset[]> => {
      const { data, error } = await supabase
        .from("ai_memory")
        .select("*")
        .eq("memory_type", "scenario_preset")
        .order("updated_at", { ascending: false });

      if (error || !data || data.length === 0) {
        // Return default presets
        return [
          {
            id: "maintenance",
            name: "Falha de Manutenção",
            description: "Simula falha em equipamento crítico",
            category: "maintenance",
            parameters: { equipment: "Main Engine", severity: "high" },
            usageCount: 15,
          },
          {
            id: "weather",
            name: "Tempestade Severa",
            description: "Simula condições climáticas adversas",
            category: "weather",
            parameters: { windSpeed: 60, waveHeight: 8 },
            usageCount: 12,
          },
          {
            id: "compliance",
            name: "Auditoria PSC",
            description: "Prepara para inspeção Port State Control",
            category: "compliance",
            parameters: { port: "Santos", focus: "ISM" },
            usageCount: 20,
          },
          {
            id: "crew",
            name: "Emergência Médica",
            description: "Simula emergência médica a bordo",
            category: "crew",
            parameters: { crewMember: "random", severity: "critical" },
            usageCount: 8,
          },
          {
            id: "emergency",
            name: "Abandono de Embarcação",
            description: "Drill de evacuação completo",
            category: "emergency",
            parameters: { scenario: "fire", participants: "all" },
            usageCount: 6,
          },
        ];
      }

      return data.map(preset => {
        const content = preset.content as Record<string, unknown> | null;
        return {
          id: preset.id,
          name: (content?.name as string) || "Cenário",
          description: (content?.description as string) || "",
          category: (content?.category as ScenarioPreset["category"]) || "maintenance",
          parameters: (content?.parameters as Record<string, unknown>) || {},
          lastUsed: preset.updated_at ? new Date(preset.updated_at) : undefined,
          usageCount: (content?.usage_count as number) || 0,
        };
      });
    },
    staleTime: 60000,
  });

  // Fetch simulation history
  const { data: simulations = [], isLoading: loadingSimulations } = useQuery({
    queryKey: ["scenario-simulations"],
    queryFn: async (): Promise<SimulationResult[]> => {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .eq("type", "simulation")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(decision => {
        const actionPayload = decision.action_payload as Record<string, unknown> | null;
        const justificationRisks = decision.justification_risks as string[] | null;
        return {
          id: decision.id,
          scenarioId: (actionPayload?.scenario_id as string) || "unknown",
          scenarioName: decision.title,
          status: decision.status === "executed" ? "completed" as const : decision.status === "pending" ? "running" as const : "failed" as const,
          startedAt: new Date(decision.created_at),
          completedAt: decision.executed_at ? new Date(decision.executed_at) : undefined,
          results: {
            riskScore: decision.confidence * 100,
            recommendations: justificationRisks || [],
            impacts: [],
            estimatedCost: actionPayload?.estimated_cost as number | undefined,
            timeToResolve: actionPayload?.time_to_resolve as number | undefined,
          },
        };
      });
    },
    staleTime: 30000,
  });

  // Run simulation mutation
  const runSimulation = useMutation({
    mutationFn: async (params: { presetId: string; parameters: Record<string, unknown> }) => {
      const preset = presets.find(p => p.id === params.presetId);
      
      const { error } = await (supabase.from as Function)("ai_decisions").insert({
        type: "simulation",
        title: preset?.name || "Simulação",
        description: preset?.description || "Simulação de cenário",
        confidence: 0.85,
        confidence_level: "high",
        impact: "medium",
        status: "pending",
        justification_reasoning: "Simulação iniciada pelo usuário",
        action_payload: {
          scenario_id: params.presetId,
          parameters: params.parameters,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenario-simulations"] });
    },
  });

  return {
    presets,
    simulations,
    isLoading: loadingPresets || loadingSimulations,
    runSimulation: runSimulation.mutate,
    isRunning: runSimulation.isPending,
  };
}
