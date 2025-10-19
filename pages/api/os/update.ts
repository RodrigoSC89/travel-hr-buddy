import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

interface UpdateOrderRequest {
  id: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
}

/**
 * POST /api/os/update
 * Updates order status with comprehensive validation
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

    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body: UpdateOrderRequest = req.body;
    const { id, status } = body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({
        error: "Missing required fields: id, status",
      });
    }

    // Validate status value
    const validStatuses = ["pendente", "em_andamento", "concluido", "cancelado"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update order status
    const { data, error: updateError } = await supabase
      .from("mmi_orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ success: true, order: data });
  } catch (error: unknown) {
    console.error("Error updating order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to update order",
      details: errorMessage,
    });
  }
}
