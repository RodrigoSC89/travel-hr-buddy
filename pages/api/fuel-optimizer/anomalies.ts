// API endpoint for fuel consumption anomaly detection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "GET") {
      const { vessel_id, status = "open", severity } = req.query;

      let query = supabase
        .from("fuel_consumption_anomalies")
        .select(`
          *,
          vessels!inner(id, name)
        `)
        .order("detected_at", { ascending: false });

      if (vessel_id) {
        query = query.eq("vessel_id", vessel_id);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (severity) {
        query = query.eq("severity", severity);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Error fetching anomalies:", error);
        return res.status(500).json({ error: error.message });
      }

      // Get summary statistics
      const { data: stats } = await supabase
        .from("fuel_consumption_anomalies")
        .select("status, severity")
        .eq("status", "open");

      const summary = {
        total_open: stats?.length || 0,
        critical: stats?.filter(a => a.severity === "critical").length || 0,
        high: stats?.filter(a => a.severity === "high").length || 0,
        medium: stats?.filter(a => a.severity === "medium").length || 0,
        low: stats?.filter(a => a.severity === "low").length || 0
      };

      return res.status(200).json({ anomalies: data, summary });
    }

    if (req.method === "PUT") {
      // Update anomaly status or add resolution
      const {
        id,
        status,
        investigated_by,
        resolution_notes,
        corrective_actions,
        requires_maintenance
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        if (status === "resolved") {
          updateData.resolved_at = new Date().toISOString();
        }
      }
      
      if (investigated_by) updateData.investigated_by = investigated_by;
      if (resolution_notes) updateData.resolution_notes = resolution_notes;
      if (corrective_actions) updateData.corrective_actions = corrective_actions;
      if (requires_maintenance !== undefined) updateData.requires_maintenance = requires_maintenance;

      const { data, error } = await supabase
        .from("fuel_consumption_anomalies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating anomaly:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ anomaly: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
