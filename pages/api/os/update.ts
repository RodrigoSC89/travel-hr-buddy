import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/os/update
 * Updates the status of a work order
 * Validates required fields and enforces valid status values
 * Automatically sets completed_at timestamp when marking orders as completed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, status } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Validate status values
    const validStatuses = ["pendente", "em andamento", "concluída", "cancelada"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const supabase = createClient();

    // Prepare update data
    const updateData: { status: string; completed_at?: string } = { status };
    
    // Set completed_at timestamp when marking as completed
    if (status === "concluída") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("mmi_orders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}
