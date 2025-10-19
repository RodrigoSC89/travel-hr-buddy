import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

interface MMIHistoryRecord {
  id: string;
  vessel_name: string;
  system_name: string;
  component_name: string;
  task_description: string;
  executed_at: string | null;
  due_date: string | null;
  status: "executado" | "pendente" | "atrasado";
  priority: string;
}

function determineStatus(job: any): "executado" | "pendente" | "atrasado" {
  if (job.status === "completed") {
    return "executado";
  } else if (job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed") {
    return "atrasado";
  } else {
    return "pendente";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch MMI jobs with related component, system, and vessel information
    const { data: jobs, error } = await supabase
      .from("mmi_jobs")
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        completed_date,
        component_id,
        mmi_components!inner (
          id,
          component_name,
          system_id,
          mmi_systems!inner (
            id,
            system_name,
            vessel_id,
            vessels!left (
              id,
              name
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching MMI history:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!jobs || jobs.length === 0) {
      return res.status(200).json([]);
    }

    // Transform the data to match frontend requirements
    const records: MMIHistoryRecord[] = jobs.map((job: any) => {
      const component = job.mmi_components;
      const system = component?.mmi_systems;
      const vessel = system?.vessels;

      return {
        id: job.id,
        vessel_name: vessel?.name || "N/A",
        system_name: system?.system_name || "N/A",
        component_name: component?.component_name || "N/A",
        task_description: job.description || job.title,
        executed_at: job.completed_date,
        due_date: job.due_date,
        status: determineStatus(job),
        priority: job.priority,
      };
    });

    return res.status(200).json(records);
  } catch (error: unknown) {
    console.error("Error in MMI history endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ 
      error: "Failed to fetch MMI history",
      details: errorMessage 
    });
  }
}
