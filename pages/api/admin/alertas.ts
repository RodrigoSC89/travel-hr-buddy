import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify the user's session using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Perfil não encontrado." });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado." });
    }

    // Fetch alerts from auditoria_alertas table
    const { data, error } = await supabase
      .from("auditoria_alertas")
      .select("id, auditoria_id, comentario_id, descricao, criado_em")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Error fetching auditoria_alertas:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected error in /api/admin/alertas:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
