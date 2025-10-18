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

  const { vesselId } = req.query;

  if (!vesselId || typeof vesselId !== "string") {
    return res.status(400).json({ error: "vesselId é obrigatório." });
  }

  try {
    const { data, error } = await supabase
      .from("sgso_action_plans")
      .select(`
        *,
        dp_incidents (
          description,
          updated_at,
          sgso_category,
          sgso_risk_level,
          title,
          date
        )
      `)
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching SGSO action plans:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error in SGSO history endpoint:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
