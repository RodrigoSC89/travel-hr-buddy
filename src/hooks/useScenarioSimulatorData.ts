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
  parameters: Record<string, any>;
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

      return data.map(preset => ({
        id: preset.id,
        name: (preset.content as any)?.name || "Cenário",
        description: (preset.content as any)?.description || "",
        category: (preset.content as any)?.category || "maintenance",
        parameters: (preset.content as any)?.parameters || {},
        lastUsed: preset.updated_at ? new Date(preset.updated_at) : undefined,
        usageCount: (preset.content as any)?.usage_count || 0,
      }));
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

      return (data || []).map(decision => ({
        id: decision.id,
        scenarioId: (decision.action_payload as any)?.scenario_id || "unknown",
        scenarioName: decision.title,
        status: decision.status === "executed" ? "completed" : decision.status === "pending" ? "running" : "failed",
        startedAt: new Date(decision.created_at),
        completedAt: decision.executed_at ? new Date(decision.executed_at) : undefined,
        results: {
          riskScore: decision.confidence * 100,
          recommendations: (decision.justification_risks as any[]) || [],
          impacts: [],
          estimatedCost: (decision.action_payload as any)?.estimated_cost,
          timeToResolve: (decision.action_payload as any)?.time_to_resolve,
        },
      }));
    },
    staleTime: 30000,
  });

  // Run simulation mutation
  const runSimulation = useMutation({
    mutationFn: async (params: { presetId: string; parameters: Record<string, any> }) => {
      const preset = presets.find(p => p.id === params.presetId);
      
      const { error } = await supabase.from("ai_decisions").insert({
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
