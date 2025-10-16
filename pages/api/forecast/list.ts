import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { source, created_by } = req.query;

  try {
    let query = supabase
      .from("forecast_history")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (source && typeof source === "string") {
      query = query.ilike("source", `%${source}%`);
    }

    if (created_by && typeof created_by === "string") {
      query = query.ilike("created_by", `%${created_by}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching forecast history:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
