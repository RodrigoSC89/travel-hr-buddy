import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch incidents from the dp_incidents table
    const { data: incidents, error } = await supabase
      .from("dp_incidents")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching DP incidents:", error);
      throw error;
    }

    // Transform data to match the expected format
    const transformedIncidents = (incidents || []).map((incident: {
      id: string;
      title: string;
      summary: string;
      source: string;
      date: string;
      vessel: string;
      location: string;
      root_cause: string;
      class_dp: string;
      tags: string[];
      gpt_analysis: string | null;
    }) => ({
      id: incident.id,
      title: incident.title,
      description: incident.summary,
      source: incident.source,
      incident_date: incident.date,
      severity: determineSeverity(incident),
      vessel: incident.vessel,
      location: incident.location,
      root_cause: incident.root_cause,
      class_dp: incident.class_dp,
      tags: incident.tags,
      gpt_analysis: incident.gpt_analysis || null,
    }));

    return res.status(200).json(transformedIncidents);
  } catch (error) {
    console.error("Error in dp-incidents API:", error);
    return res.status(500).json({ 
      error: "Failed to fetch DP incidents",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function determineSeverity(incident: {
  title: string;
  root_cause: string;
  class_dp: string;
}): string {
  const criticalKeywords = ["loss of position", "drive off", "blackout"];
  const highKeywords = ["thruster failure", "reference loss", "pms"];
  
  const text = `${incident.title} ${incident.root_cause}`.toLowerCase();
  
  if (criticalKeywords.some(keyword => text.includes(keyword))) return "critical";
  if (highKeywords.some(keyword => text.includes(keyword))) return "high";
  if (incident.class_dp?.includes("3")) return "high";
  return "medium";
}
