/**
 * DP Incidents API Routes
 * Handles GET (list incidents) and POST (create incident)
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role key for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/dp-incidents
 * List all DP incidents, ordered by incident_date descending
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from("dp_incidents")
      .select("*")
      .order("incident_date", { ascending: false });

    if (error) {
      console.error("Error fetching dp_incidents:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected error in GET /api/dp-incidents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/dp-incidents
 * Create a new DP incident
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, description, source, incident_date, severity, vessel } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        error: "Missing required fields: title and description are required" 
      });
    }

    const { data, error } = await supabase
      .from("dp_incidents")
      .insert([
        {
          title,
          description,
          source,
          incident_date,
          severity,
          vessel,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting dp_incident:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error in POST /api/dp-incidents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Main handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Route to appropriate handler
  if (req.method === "GET") {
    return handleGet(req, res);
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
