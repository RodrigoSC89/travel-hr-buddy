/**
 * Voyage Simulator Hook - What-if scenario analysis
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VoyageScenario {
  name: string;
  fuelPriceChange: number; // percentage
  weatherDelay: number; // hours
  portCongestion: number; // hours
  speedReduction: number; // percentage
  cargoVariation: number; // percentage
}

export interface SimulationResult {
  id: string;
  vessel_id?: string;
  simulation_name: string;
  origin_port: string;
  destination_port: string;
  scenarios: VoyageScenario[];
  ai_analysis?: string;
  recommended_scenario?: number;
  estimated_profit?: number;
  estimated_fuel_cost?: number;
  estimated_duration_hours?: number;
  risk_factors: any[];
  status: string;
  created_at: string;
}

export function useVoyageSimulator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const simulations = useQuery({
    queryKey: ["voyage-simulations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voyage_simulations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        scenarios: Array.isArray(d.scenarios) ? d.scenarios : [],
        risk_factors: Array.isArray(d.risk_factors) ? d.risk_factors : [],
      })) as SimulationResult[];
    },
  });

  const createSimulation = useMutation({
    mutationFn: async (input: {
      vessel_id?: string;
      simulation_name: string;
      origin_port: string;
      destination_port: string;
      scenarios: VoyageScenario[];
    }) => {
      // Save simulation
      const { data, error } = await supabase
        .from("voyage_simulations")
        .insert({
          vessel_id: input.vessel_id,
          simulation_name: input.simulation_name,
          origin_port: input.origin_port,
          destination_port: input.destination_port,
          scenarios: input.scenarios as any,
          status: "analyzing",
        })
        .select()
        .single();

      if (error) throw error;

      // Call AI for analysis
      try {
        const { data: aiResult, error: aiError } = await supabase.functions.invoke("voyage-simulator-ai", {
          body: {
            simulation_id: data.id,
            origin: input.origin_port,
            destination: input.destination_port,
            scenarios: input.scenarios,
          },
        });

        if (!aiError && aiResult) {
          await supabase.from("voyage_simulations").update({
            ai_analysis: aiResult.analysis,
            recommended_scenario: aiResult.recommended,
            estimated_profit: aiResult.estimated_profit,
            estimated_fuel_cost: aiResult.estimated_fuel_cost,
            estimated_duration_hours: aiResult.estimated_duration,
            risk_factors: aiResult.risk_factors || [],
            status: "completed",
          }).eq("id", data.id);
        }
      } catch {
        // AI is optional, simulation still saved
        await supabase.from("voyage_simulations").update({ status: "completed" }).eq("id", data.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voyage-simulations"] });
      toast({ title: "Simulação criada", description: "Análise de cenários concluída" });
    },
    onError: () => toast({ title: "Erro ao criar simulação", variant: "destructive" }),
  });

  const deleteSimulation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("voyage_simulations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voyage-simulations"] });
      toast({ title: "Simulação excluída" });
    },
    onError: () => toast({ title: "Erro ao excluir simulação", variant: "destructive" }),
  });

  return {
    simulations: simulations.data || [],
    isLoading: simulations.isLoading,
    createSimulation,
    deleteSimulation,
    refetch: simulations.refetch,
  };
}
