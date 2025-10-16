import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { navio, data, norma, itemAuditado, resultado, comentarios, userId } = req.body;

  // Validate required fields
  if (!navio || !data || !norma || !itemAuditado || !resultado) {
    return res.status(400).json({ 
      error: "Campos obrigatórios faltando: navio, data, norma, itemAuditado, resultado" 
    });
  }

  try {
    // Use the userId from the request body or a default/authenticated user
    const auditUserId = userId || "00000000-0000-0000-0000-000000000000"; // Placeholder - should come from auth

    const { data: auditData, error } = await supabase
      .from("auditorias_imca")
      .insert({
        user_id: auditUserId,
        title: `Auditoria ${norma} - ${navio}`,
        description: `Item: ${itemAuditado}`,
        navio,
        data,
        norma,
        item_auditado: itemAuditado,
        resultado,
        comentarios,
        status: "completed",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar auditoria:", error);
      return res.status(500).json({ error: "Erro ao criar auditoria", details: error.message });
    }

    res.status(201).json({ 
      success: true, 
      message: "Auditoria registrada com sucesso!",
      data: auditData 
    });
  } catch (error) {
    console.error("Erro inesperado ao criar auditoria:", error);
    res.status(500).json({ error: "Erro inesperado ao criar auditoria" });
  }
}
