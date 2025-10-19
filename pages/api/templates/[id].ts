import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

// Validação de entrada
const TemplateSchema = z.object({
  title: z.string().min(3),
  content: z.any()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
    body,
  } = req;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido." });
  }

  // Autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // PUT - Update template
  if (method === "PUT") {
    // Validação com Zod
    const parse = TemplateSchema.safeParse(body);
    if (!parse.success) {
      return res.status(400).json({ error: "Invalid body" });
    }

    const { title, content } = parse.data;

    // Atualizar apenas templates do próprio usuário
    const { data, error } = await supabase
      .from("templates")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  }

  // GET - Get single template
  if (method === "GET") {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Template not found" });
    }

    return res.status(200).json({ data });
  }

  // DELETE - Delete template
  if (method === "DELETE") {
    // Deletar apenas templates do próprio usuário
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(204).json({ success: true });
  }

  // Method not allowed
  return res.status(405).json({ error: "Método não permitido." });
}
