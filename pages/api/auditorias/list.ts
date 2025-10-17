import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all audits ordered by date (newest first)
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("data", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching audits:", error);
      return res.status(500).json({ error: "Failed to fetch audits" });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
