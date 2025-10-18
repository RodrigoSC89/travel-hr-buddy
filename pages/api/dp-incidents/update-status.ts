import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, status } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Validate status value
    const validStatuses = ["pendente", "em andamento", "concluído"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Status inválido. Valores permitidos: pendente, em andamento, concluído" 
      });
    }

    // Update incident with new status and timestamp
    const { data, error } = await supabase
      .from("dp_incidents")
      .update({
        plan_status: status,
        plan_updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating plan status:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Incidente não encontrado" });
    }

    return res.status(200).json({ 
      ok: true,
      incident: data
    });

  } catch (error) {
    console.error("Error in update-status endpoint:", error);
    return res.status(500).json({ 
      error: "Erro ao atualizar status do plano",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
