import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { id, status } = req.body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ error: "ID e status são obrigatórios." });
    }

    // Validate status value
    const validStatuses = ["pendente", "em andamento", "concluído"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const supabase = createClient();

    // Update the incident's plan status
    const { error } = await supabase
      .from("dp_incidents")
      .update({
        plan_status: status,
        plan_updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating plan status:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Unexpected error in update-status:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
