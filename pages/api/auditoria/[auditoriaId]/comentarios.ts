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
    return res.status(400).json({ error: "auditoriaId é obrigatório" });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("auditoria_comentarios")
        .select("id, comentario, user_id, created_at")
        .eq("auditoria_id", auditoriaId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      res.status(200).json(data || []);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      res.status(500).json({ error: "Erro ao buscar comentários." });
    }
  } else if (req.method === "POST") {
    try {
      const { comentario } = req.body;

      if (!comentario || typeof comentario !== "string" || !comentario.trim()) {
        return res.status(400).json({ error: "comentario é obrigatório" });
      }

      // In a real application, you would get the user_id from the authenticated session
      // For now, we'll use a placeholder
      const user_id = req.headers.authorization || "system";

      const { data, error } = await supabase
        .from("auditoria_comentarios")
        .insert([
          {
            auditoria_id: auditoriaId,
            comentario: comentario.trim(),
            user_id: user_id,
          },
        ])
        .select();

      if (error) throw error;

      res.status(201).json(data?.[0] || {});
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
      res.status(500).json({ error: "Erro ao criar comentário." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
