import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Missing required fields: id, status" });
    }

    // Validate status values
    const validStatuses = ["pendente", "em andamento", "concluída", "cancelada"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const updateData: { status: string; completed_at?: string } = { status };
    
    // Set completed_at timestamp if status is 'concluída'
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
    console.error("Error in POST /api/os/update:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
