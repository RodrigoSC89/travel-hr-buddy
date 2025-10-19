import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/mmi/forecast/all
 * Fetches all MMI forecasts from the database, ordered by creation date (newest first)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("mmi_forecasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forecasts:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}
