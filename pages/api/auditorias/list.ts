import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * API endpoint to list auditorias IMCA
 * GET /api/auditorias/list
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Query auditorias from the database
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, navio, data, norma, item_auditado, resultado, comentarios")
      .order("data", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      return res.status(500).json({ error: "Failed to fetch auditorias" });
    }

    // Return the auditorias list
    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error in /api/auditorias/list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
