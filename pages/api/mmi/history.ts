/**
 * API Endpoint: /api/mmi/history
 * 
 * Fetches MMI maintenance history records from Supabase
 * Returns records with vessel information, system details, execution dates, and status
 */

import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * MMI Record Response Type
 */
export interface MMIRecord {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
}

/**
 * Determines the status of a job based on its completion and due date
 */
function determineStatus(job: any): "executado" | "pendente" | "atrasado" {
  if (job.status === "completed") {
    return "executado";
  } else if (job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed") {
    return "atrasado";
  } else {
    return "pendente";
  }
}

/**
 * API Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MMIRecord[] | { error: string }>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch MMI records from Supabase
    // Join mmi_jobs, mmi_components, and mmi_systems tables
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select(`
        id,
        title,
        description,
        status,
        due_date,
        completed_date,
        component:mmi_components (
          id,
          component_name,
          system:mmi_systems (
            id,
            system_name,
            vessel_id,
            vessel:vessels (
              id,
              name
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching MMI jobs:", jobsError);
      return res.status(500).json({ error: "Failed to fetch MMI records" });
    }

    // Transform data to match frontend requirements
    const records: MMIRecord[] = (jobs || []).map((job: any) => {
      const vesselName = job.component?.system?.vessel?.name || "N/A";
      const systemName = job.component?.system?.system_name || "N/A";
      const taskDescription = job.description || job.title || "";
      const executedAt = job.completed_date || null;
      const status = determineStatus(job);

      return {
        id: job.id,
        vessel_name: vesselName,
        system_name: systemName,
        task_description: taskDescription,
        executed_at: executedAt,
        status: status,
      };
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Unexpected error in /api/mmi/history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
