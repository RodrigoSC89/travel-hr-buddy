import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to list forecast history with optional filters
 * GET /api/forecast/list
 * 
 * Query parameters:
 * - source: Filter by forecast source
 * - created_by: Filter by creator
 * - created_at: Filter by date (YYYY-MM-DD format)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  
  // Extract query parameters
  const { source, created_by, created_at } = req.query;

  // Build query with filters
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

  if (created_at && typeof created_at === "string") {
    // Filter by date (match the full day)
    const startDate = new Date(created_at);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(created_at);
    endDate.setHours(23, 59, 59, 999);
    
    query = query
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching forecast history:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data || []);
}
