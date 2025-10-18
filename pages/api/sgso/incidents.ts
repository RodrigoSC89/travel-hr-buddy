import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET - List incidents
    if (req.method === "GET") {
      const { data: incidents, error } = await supabase
        .from("safety_incidents")
        .select(`
          id,
          incident_number,
          incident_type,
          severity,
          status,
          incident_date,
          location,
          description,
          vessel_id,
          vessels (
            name
          ),
          created_at,
          updated_at
        `)
        .order("incident_date", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching incidents:", error);
        return res.status(500).json({ error: error.message });
      }

      // Transform data to match the expected format
      const transformedIncidents = incidents?.map((incident: {
        id: string;
        incident_number: string;
        incident_type: string;
        severity: string;
        status: string;
        incident_date: string;
        location?: string;
        description: string;
        vessel_id?: string;
        vessels?: { name: string };
        created_at: string;
        updated_at: string;
      }) => ({
        id: incident.id,
        incident_number: incident.incident_number,
        type: incident.incident_type,
        severity: incident.severity,
        status: incident.status,
        reported_at: incident.incident_date,
        location: incident.location,
        description: incident.description,
        vessel: incident.vessels?.name || "N/A",
        vessel_id: incident.vessel_id,
        created_at: incident.created_at,
        updated_at: incident.updated_at
      })) || [];

      return res.status(200).json(transformedIncidents);
    }

    // POST - Create new incident
    if (req.method === "POST") {
      const { 
        type, 
        description, 
        severity, 
        reported_at,
        location,
        vessel_id,
        organization_id
      } = req.body;

      // Validate required fields
      if (!type || !description || !severity || !reported_at) {
        return res.status(400).json({ 
          error: "Missing required fields: type, description, severity, reported_at" 
        });
      }

      // Generate incident number
      const timestamp = Date.now();
      const incidentNumber = `INC-${timestamp}`;

      const { data, error } = await supabase
        .from("safety_incidents")
        .insert([
          {
            incident_number: incidentNumber,
            incident_type: type,
            severity,
            description,
            incident_date: reported_at,
            location,
            vessel_id,
            organization_id,
            status: "reported"
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating incident:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    }

    // PUT - Update incident
    if (req.method === "PUT") {
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Incident ID is required" });
      }

      // Map frontend fields to database fields
      const dbUpdates: Record<string, string> = {};
      if (updates.type) dbUpdates.incident_type = updates.type;
      if (updates.severity) dbUpdates.severity = updates.severity;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.reported_at) dbUpdates.incident_date = updates.reported_at;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.vessel_id) dbUpdates.vessel_id = updates.vessel_id;
      if (updates.status) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from("safety_incidents")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating incident:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }

    // DELETE - Delete incident
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Incident ID is required" });
      }

      const { error } = await supabase
        .from("safety_incidents")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting incident:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in incidents API:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
