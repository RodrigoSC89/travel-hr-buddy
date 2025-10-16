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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Get the auth token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    // Verify the token and get the user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado." });
    }

    // Query auditoria_alertas table
    const { data, error } = await supabase
      .from("auditoria_alertas")
      .select("id, auditoria_id, comentario_id, descricao, criado_em")
      .order("criado_em", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    return res.status(500).json({ error: "Erro ao buscar alertas." });
  }
}
