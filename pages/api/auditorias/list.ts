import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch auditorias with the relevant fields
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, navio, data, norma, resultado, item_auditado, comentarios, created_at")
      .order("data", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      return res.status(500).json({ error: "Failed to fetch auditorias" });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
