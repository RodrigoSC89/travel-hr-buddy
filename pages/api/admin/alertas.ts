import { NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { withRole, AuthenticatedRequest } from "@/lib/api-auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/alertas
 * 
 * Get all audit alerts from auditoria_alertas table.
 * Requires admin role.
 * 
 * @returns Array of audit alerts ordered by creation date (newest first)
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // User is authenticated and authorized (checked by middleware)
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
    // Error logging for production monitoring
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Erro ao buscar alertas.", details: errorMessage });
  }
}

// Export handler wrapped with admin role requirement
export default withRole('admin', handler);
