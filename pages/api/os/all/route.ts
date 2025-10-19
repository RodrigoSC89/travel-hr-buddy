import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/os/all
 * Lists all work orders sorted by creation date (newest first)
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch all orders sorted by creation date (newest first)
    const { data: orders, error: fetchError } = await supabase
      .from("mmi_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Database error:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    return res.status(200).json({ success: true, orders: orders || [] });
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to fetch orders",
      details: errorMessage,
    });
  }
}
