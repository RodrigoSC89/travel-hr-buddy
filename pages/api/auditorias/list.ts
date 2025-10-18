import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();

  try {
    // Fetch all audits from auditorias_imca table
    const { data: auditorias, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("data", { ascending: false });

    if (error) {
      console.error("Error fetching audits:", error);
      return res.status(500).json({ error: "Failed to fetch audits" });
    }

    // Extract unique fleet names
    const uniqueNavios = [...new Set(auditorias?.map((a) => a.navio) || [])];

    // Get cron job status (simplified)
    const cronStatus = "Active";

    return res.status(200).json({
      auditorias: auditorias || [],
      frota: uniqueNavios,
      cronStatus,
    });
  } catch (error) {
    console.error("Error in auditorias list API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
