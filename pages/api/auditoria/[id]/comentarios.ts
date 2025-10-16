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
  const {
    query: { id: auditoriaId },
    method,
    body,
  } = req;

  if (typeof auditoriaId !== "string") {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (method === "GET") {
    const { data, error } = await supabase
      .from("auditoria_comentarios")
      .select("id, comentario, created_at, user_id")
      .eq("auditoria_id", auditoriaId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === "POST") {
    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id;

    if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
    if (!body.comentario || !body.comentario.trim()) {
      return res.status(400).json({ error: "Comentário vazio." });
    }

    const { error } = await supabase.from("auditoria_comentarios").insert({
      auditoria_id: auditoriaId,
      comentario: body.comentario,
      user_id: userId,
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ sucesso: true });
  }

  return res.status(405).json({ error: "Método não permitido." });
}
