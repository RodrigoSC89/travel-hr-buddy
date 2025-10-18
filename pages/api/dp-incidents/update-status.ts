import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * API Route to update the plan status for a DP incident
 * POST /api/dp-incidents/update-status
 * Body: { id: string, status: string }
 */
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
      return res.status(400).json({ error: "ID do incidente é obrigatório." });
    }

    if (!status) {
      return res.status(400).json({ error: "Status é obrigatório." });
    }

    // Validate status value
    const validStatuses = ["pendente", "em andamento", "concluído"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Status inválido. Valores permitidos: pendente, em andamento, concluído" 
      });
    }

    // Update the incident status
    const { data, error } = await supabase
      .from("dp_incidents")
      .update({
        plan_status: status,
        plan_updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating plan status:", error);
      return res.status(500).json({ 
        error: "Erro ao atualizar status do plano.",
        details: error.message 
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Incidente não encontrado." });
    }

    res.status(200).json({ 
      ok: true, 
      message: "Status atualizado com sucesso.",
      data: data[0]
    });
  } catch (error) {
    console.error("Unexpected error updating plan status:", error);
    res.status(500).json({ 
      error: "Erro interno ao atualizar status do plano.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
