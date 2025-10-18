import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
  } = req;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido." });
  }

  // PUT - Update template
  if (method === "PUT") {
    const { title, content } = body;

    if (!title || !content) {
      return res.status(400).json({ error: "Título e conteúdo são obrigatórios." });
    }

    const { data, error } = await supabase
      .from("templates")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  }

  // DELETE - Delete template
  if (method === "DELETE") {
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  // Method not allowed
  return res.status(405).json({ error: "Método não permitido." });
}
