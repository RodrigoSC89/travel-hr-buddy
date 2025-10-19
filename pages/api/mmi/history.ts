import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/mmi/history
 * 
 * Fetches MMI maintenance history with automatic status determination:
 * - executado: job.status === "completed"
 * - atrasado: due_date < now && status !== "completed"
 * - pendente: default state (not completed and not overdue)
 * 
 * Joins mmi_jobs, mmi_components, mmi_systems, and vessels tables
 * to provide complete history records for frontend consumption.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();
    const { status, vesselId } = req.query;

    // Build the query with all necessary joins
    const query = supabase
      .from("mmi_jobs")
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        completed_date,
        created_at,
        updated_at,
        component:mmi_components(
          id,
          component_name,
          system:mmi_systems(
            id,
            system_name,
            vessel:vessels(
              id,
              name
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (vesselId && typeof vesselId === "string") {
      // We need to filter by vessel through the component->system->vessel relationship
      // This is handled client-side due to Supabase limitations on nested filtering
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Error fetching MMI history:", error);
      return res.status(500).json({ error: error.message });
    }

    // Transform the data to match MMIHistory interface with automatic status determination
    const now = new Date();
    const history = (jobs || []).map((job: any) => {
      // Determine status automatically
      let determinedStatus: "executado" | "pendente" | "atrasado";
      
      if (job.status === "completed") {
        determinedStatus = "executado";
      } else if (job.due_date && new Date(job.due_date) < now) {
        determinedStatus = "atrasado";
      } else {
        determinedStatus = "pendente";
      }

      // Extract nested data safely
      const component = job.component || {};
      const system = component.system || {};
      const vessel = system.vessel || {};

      return {
        id: job.id,
        vessel_id: vessel.id || null,
        system_name: system.system_name || "Sistema não especificado",
        task_description: job.description || job.title || "",
        executed_at: job.completed_date || null,
        status: determinedStatus,
        created_at: job.created_at,
        updated_at: job.updated_at,
        vessel: vessel.id ? {
          id: vessel.id,
          name: vessel.name,
        } : null,
      };
    });

    // Apply status filter if provided
    let filteredHistory = history;
    if (status && typeof status === "string" && status !== "all") {
      filteredHistory = history.filter((h: any) => h.status === status);
    }

    // Apply vessel filter if provided
    if (vesselId && typeof vesselId === "string") {
      filteredHistory = filteredHistory.filter((h: any) => h.vessel_id === vesselId);
    }

    return res.status(200).json(filteredHistory);
  } catch (error) {
    console.error("Unexpected error in MMI history API:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}
