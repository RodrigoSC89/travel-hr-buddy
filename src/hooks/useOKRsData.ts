/**
 * Hook para dados de OKRs (Objectives & Key Results)
 * Nota: Tabela OKRs não existe ainda - retorna empty state
 */
import { useQuery } from "@tanstack/react-query";

export interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  status: "on_track" | "at_risk" | "behind" | "achieved";
}

export interface OKR {
  id: string;
  objective: string;
  owner: string;
  level: "company" | "team" | "individual";
  quarter: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "achieved";
  key_results: KeyResult[];
  children?: OKR[];
}

export function useOKRsData() {
  return useQuery({
    queryKey: ["hr-okrs"],
    queryFn: async (): Promise<OKR[]> => {
      // OKRs table does not exist in current schema
      // Return empty array - component should show Empty State
      return [];
    },
    staleTime: Infinity, // No need to refetch since we know it's empty
  });
}
