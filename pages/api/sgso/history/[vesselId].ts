import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

/**
 * SGSO Action Plans History API Endpoint
 * 
 * GET /api/sgso/history/[vesselId]
 * Returns action plans history for a specific vessel with incident details
 * 
 * Response includes:
 * - Action plan details (corrective, preventive, recommendation)
 * - Status workflow (aberto, em_andamento, resolvido)
 * - Approval information (approver name and timestamp)
 * - Related incident information (description, category, risk level)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { vesselId },
    method,
  } = req;

  // Validate vesselId parameter
  if (typeof vesselId !== "string") {
    return res.status(400).json({ error: "Vessel ID inválido." });
  }

  // Only GET method is supported
  if (method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Query action plans with related incident data
    const { data, error } = await supabase
      .from("sgso_action_plans")
      .select(`
        id,
        corrective_action,
        preventive_action,
        recommendation,
        status,
        approved_by,
        approved_at,
        created_at,
        updated_at,
        dp_incidents (
          id,
          description,
          sgso_category,
          sgso_risk_level,
          updated_at,
          incident_date
        )
      `)
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching SGSO history:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error in SGSO history API:", error);
    return res.status(500).json({ 
      error: "Erro interno do servidor ao buscar histórico SGSO." 
    });
  }
}
