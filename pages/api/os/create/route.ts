import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

interface CreateOrderRequest {
  forecast_id: string;
  vessel_name: string;
  system_name: string;
  description: string;
  priority: "baixa" | "normal" | "alta" | "crítica";
}

/**
 * POST /api/os/create
 * Creates a work order (Ordem de Serviço) from an AI forecast
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
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

    const body: CreateOrderRequest = req.body;
    const { forecast_id, vessel_name, system_name, description, priority } =
      body;

    // Validate required fields
    if (!forecast_id || !vessel_name || !system_name || !description) {
      return res.status(400).json({
        error:
          "Missing required fields: forecast_id, vessel_name, system_name, description",
      });
    }

    // Validate priority value
    const validPriorities = ["baixa", "normal", "alta", "crítica"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
      });
    }

    // Insert order into database
    const { data, error: insertError } = await supabase
      .from("mmi_orders")
      .insert([
        {
          forecast_id,
          vessel_name,
          system_name,
          description,
          priority: priority || "normal",
          created_by: user?.id || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true, order: data });
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to create order",
      details: errorMessage,
    });
  }
}
