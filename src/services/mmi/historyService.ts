import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

export interface MMIHistory {
  id: string;
  vessel_name: string | null;
  system_name: string | null;
  task_description: string | null;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado" | null;
  created_at: string;
}

export interface MMIHistoryFilters {
  status?: string;
}

/**
 * Fetch MMI history records from Supabase
 * @param filters Optional filters to apply
 * @returns Array of MMI history records
 */
export async function fetchMMIHistory(
  filters?: MMIHistoryFilters
): Promise<MMIHistory[]> {
  try {
    let query = supabase
      .from("mmi_history")
      .select(`
        id,
        vessel_name,
        system_name,
        task_description,
        executed_at,
        status,
        created_at
      `)
      .order("executed_at", { ascending: false });

    // Apply status filter if provided
    if (filters?.status && filters.status !== "todos") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching MMI history:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchMMIHistory:", error);
    throw error;
  }
}

/**
 * Get statistics for MMI history
 * @returns Statistics object
 */
export async function getMMIHistoryStats() {
  try {
    const { data, error } = await supabase
      .from("mmi_history")
      .select("status");

    if (error) {
      console.error("Error fetching MMI history stats:", error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      executado: data?.filter((item) => item.status === "executado").length || 0,
      pendente: data?.filter((item) => item.status === "pendente").length || 0,
      atrasado: data?.filter((item) => item.status === "atrasado").length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error in getMMIHistoryStats:", error);
    throw error;
  }
}
