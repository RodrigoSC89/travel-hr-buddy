import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SGSOIbamaRequirement } from "@/types/sgso";

/**
 * Hook to fetch SGSO IBAMA requirements
 * Returns the 17 official IBAMA SGSO requirements
 */
export const useSGSOIbamaRequirements = () => {
  return useQuery({
    queryKey: ["sgso-ibama-requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sgso_ibama_requirements")
        .select("*")
        .order("requirement_number", { ascending: true });

      if (error) {
        throw error;
      }

      return data as SGSOIbamaRequirement[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - these requirements don't change often
  });
};

/**
 * Hook to fetch a single SGSO IBAMA requirement by number
 */
export const useSGSOIbamaRequirement = (requirementNumber: number) => {
  return useQuery({
    queryKey: ["sgso-ibama-requirement", requirementNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sgso_ibama_requirements")
        .select("*")
        .eq("requirement_number", requirementNumber)
        .single();

      if (error) {
        throw error;
      }

      return data as SGSOIbamaRequirement;
    },
    enabled: requirementNumber >= 1 && requirementNumber <= 17,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
