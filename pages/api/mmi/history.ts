import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type MMIRecord = {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Query mmi_jobs joined with mmi_components and mmi_systems to get comprehensive history
    // We'll map the job status to the required status format
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select(`
        id,
        title,
        description,
        status,
        completed_date,
        due_date,
        component_id,
        mmi_components (
          component_name,
          system_id,
          mmi_systems (
            system_name,
            vessel_id
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching MMI jobs:", jobsError);
      return res.status(500).json({ error: jobsError.message });
    }

    // Transform the data to match the expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: MMIRecord[] = (jobs || []).map((job: any) => {
      const component = job.mmi_components;
      const system = component?.mmi_systems;
      
      // Determine status based on job status and dates
      let status: "executado" | "pendente" | "atrasado" = "pendente";
      
      if (job.status === "completed") {
        status = "executado";
      } else if (job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed") {
        status = "atrasado";
      }

      return {
        id: job.id,
        vessel_name: system?.vessel_id || "N/A",
        system_name: system?.system_name || "Sistema não especificado",
        task_description: job.description || job.title || "Sem descrição",
        executed_at: job.completed_date,
        status: status
      };
    });

    return res.status(200).json(records);
  } catch (error) {
    console.error("Unexpected error in /api/mmi/history:", error);
    return res.status(500).json({ 
      error: "Erro ao buscar histórico de manutenções." 
    });
  }
}
