import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }

    const supabase = createClient();

    // Fetch the incident
    const { data: incident, error: fetchError } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !incident) {
      console.error("Error fetching incident:", fetchError);
      return res.status(404).json({ error: "Incident not found" });
    }

    // Call the Supabase Edge Function for AI analysis
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const response = await fetch(`${supabaseUrl}/functions/v1/dp-intel-analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        incident: {
          id: incident.id,
          title: incident.title,
          description: incident.summary,
          summary: incident.summary,
          type: "DP Incident",
          location: incident.location,
          reportedAt: incident.date,
          rootCause: incident.root_cause,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", errorText);
      throw new Error(`Failed to analyze incident: ${response.statusText}`);
    }

    const analysisData = await response.json();

    // Store the analysis result back to the incident
    if (analysisData.result) {
      const { error: updateError } = await supabase
        .from("dp_incidents")
        .update({ 
          gpt_analysis: analysisData.result,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating incident with analysis:", updateError);
      }
    }

    return res.status(200).json({
      success: true,
      analysis: analysisData.result,
      message: "Análise concluída com sucesso"
    });
  } catch (error) {
    console.error("Error in dp-incidents/explain API:", error);
    return res.status(500).json({ 
      error: "Failed to explain incident",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
