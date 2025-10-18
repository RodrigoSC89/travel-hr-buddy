import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SGSOIbamaRequirement, SGSOIbamaRequirementFilter } from "@/types/sgso-ibama";

/**
 * Hook to fetch SGSO IBAMA requirements from the database
 * Returns the 17 official IBAMA requirements for maritime operations
 * 
 * @param filter - Optional filter to search requirements
 * @returns Query result with IBAMA requirements data
 */
export function useSGSOIbamaRequirements(filter?: SGSOIbamaRequirementFilter) {
  return useQuery({
    queryKey: ["sgso-ibama-requirements", filter],
    queryFn: async () => {
      let query = supabase
        .from("sgso_ibama_requirements")
        .select("*")
        .order("requirement_number", { ascending: true });

      // Apply filters if provided
      if (filter?.requirement_number) {
        query = query.eq("requirement_number", filter.requirement_number);
      }

      if (filter?.search_text) {
        query = query.or(
          `requirement_title.ilike.%${filter.search_text}%,description.ilike.%${filter.search_text}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch IBAMA requirements: ${error.message}`);
      }

      return data as SGSOIbamaRequirement[];
    },
  });
}

/**
 * Hook to fetch a single SGSO IBAMA requirement by number
 * 
 * @param requirementNumber - The requirement number (1-17)
 * @returns Query result with single IBAMA requirement data
 */
export function useSGSOIbamaRequirement(requirementNumber: number) {
  return useQuery({
    queryKey: ["sgso-ibama-requirement", requirementNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sgso_ibama_requirements")
        .select("*")
        .eq("requirement_number", requirementNumber)
        .single();

      if (error) {
        throw new Error(
          `Failed to fetch IBAMA requirement ${requirementNumber}: ${error.message}`
        );
      }

      return data as SGSOIbamaRequirement;
    },
    enabled: requirementNumber >= 1 && requirementNumber <= 17,
  });
}
