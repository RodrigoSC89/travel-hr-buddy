/**
 * DP Incidents AI Explanation API
 * Analyzes an incident using AI and stores the analysis
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { explainIncidentWithAI } from "@/lib/ai/dp-intelligence";

// Create Supabase client with service role key for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/dp-incidents/explain
 * Run AI analysis on a DP incident and store the result
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required field: id" });
    }

    // Fetch the incident
    const { data: incident, error: fetchError } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !incident) {
      console.error("Error fetching incident:", fetchError);
      return res.status(404).json({ error: "Incidente não encontrado" });
    }

    // Run AI analysis
    const analysis = await explainIncidentWithAI(incident.description);

    // Store the analysis back in the database
    const { error: updateError } = await supabase
      .from("dp_incidents")
      .update({ gpt_analysis: analysis })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating incident with analysis:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    console.error("Unexpected error in POST /api/dp-incidents/explain:", error);
    return res.status(500).json({ 
      error: "Failed to analyze incident: " + (error instanceof Error ? error.message : "Unknown error")
    });
  }
}
