import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch auditorias with the new fields
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, navio, data, norma, item_auditado, resultado, comentarios, created_at")
      .order("data", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      throw error;
    }

    // Return the data
    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error in auditorias list API:", error);
    res.status(500).json({ 
      error: "Erro ao carregar lista de auditorias",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
