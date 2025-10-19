import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * API endpoint to create work orders (OS - Ordem de Serviço) from forecasts
 * 
 * POST /api/os/create
 * 
 * Request body:
 * {
 *   forecast_id: string (UUID),
 *   vessel_name: string,
 *   system_name: string,
 *   description: string,
 *   priority: 'baixa' | 'normal' | 'alta' | 'critica'
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the auth token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    // Verify the token and get the user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    // Parse request body
    const {
      forecast_id,
      vessel_name,
      system_name,
      description,
      priority = "normal",
    } = req.body;

    // Validate required fields
    if (!vessel_name || !system_name) {
      return res.status(400).json({
        error: "Campos obrigatórios: vessel_name, system_name",
      });
    }

    // Validate priority
    const validPriorities = ["baixa", "normal", "alta", "critica"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: `Prioridade inválida. Use: ${validPriorities.join(", ")}`,
      });
    }

    // Insert the work order into mmi_orders table
    const { data, error } = await supabase
      .from("mmi_orders")
      .insert([
        {
          forecast_id,
          vessel_name,
          system_name,
          description,
          priority,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating work order:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in OS create endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to create work order",
      details: errorMessage,
    });
  }
}
