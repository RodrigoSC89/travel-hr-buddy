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
  const { auditoriaId } = req.query;

  if (!auditoriaId || typeof auditoriaId !== "string") {
    return res.status(400).json({ error: "ID da auditoria é obrigatório" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("auditoria_comentarios")
        .select("*")
        .eq("auditoria_id", auditoriaId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return res.status(200).json(data || []);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      return res.status(500).json({ error: "Erro ao buscar comentários" });
    }
  }

  if (req.method === "POST") {
    try {
      const { comentario } = req.body;

      if (!comentario || typeof comentario !== "string") {
        return res.status(400).json({ error: "Comentário é obrigatório" });
      }

      // TODO: Get actual user_id from session/auth
      const user_id = "system"; // Replace with actual user ID from auth

      const { data, error } = await supabase
        .from("auditoria_comentarios")
        .insert({
          auditoria_id: auditoriaId,
          comentario,
          user_id,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
      return res.status(500).json({ error: "Erro ao criar comentário" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
