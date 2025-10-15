import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch forecasts ordered by created_at descending
    const { data, error } = await supabase
      .from("ai_jobs_forecasts")
      .select("id, forecast_summary, source, created_by, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching forecasts:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
