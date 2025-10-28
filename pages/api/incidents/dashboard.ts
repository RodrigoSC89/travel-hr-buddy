// API endpoint for incident dashboard statistics
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "GET") {
      const { period = "daily", limit = 30 } = req.query;

      // Get dashboard statistics
      const { data: stats, error } = await supabase
        .from("incident_dashboard_stats")
        .select("*")
        .eq("stat_period", period)
        .order("stat_date", { ascending: false })
        .limit(parseInt(limit as string));

      if (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ error: error.message });
      }

      // Get current active incidents
      const { data: activeIncidents, error: activeError } = await supabase
        .from("incident_reports")
        .select("*")
        .in("status", ["pending", "under_analysis"])
        .order("severity", { ascending: true })
        .order("created_at", { ascending: false });

      if (activeError) {
        console.error("Error fetching active incidents:", activeError);
      }

      // Get critical escalations
      const { data: criticalEscalations, error: escalationError } = await supabase
        .from("incident_escalations")
        .select(`
          *,
          incident_reports!inner(id, incident_number, title, severity)
        `)
        .eq("is_active", true)
        .gte("escalation_level", 2)
        .order("escalation_level", { ascending: false });

      if (escalationError) {
        console.error("Error fetching escalations:", escalationError);
      }

      // Calculate real-time summary
      const summary = {
        total_open: activeIncidents?.length || 0,
        critical: activeIncidents?.filter(i => i.severity === "critical").length || 0,
        high: activeIncidents?.filter(i => i.severity === "high").length || 0,
        medium: activeIncidents?.filter(i => i.severity === "medium").length || 0,
        low: activeIncidents?.filter(i => i.severity === "low").length || 0,
        escalated: criticalEscalations?.length || 0
      };

      return res.status(200).json({
        statistics: stats,
        summary,
        active_incidents: activeIncidents?.slice(0, 10) || [],
        critical_escalations: criticalEscalations?.slice(0, 5) || []
      });
    }

    if (req.method === "POST") {
      // Trigger manual statistics calculation
      const { date, period } = req.body;

      if (!date || !period) {
        return res.status(400).json({ error: "date and period are required" });
      }

      // Call the statistics calculation function
      const { error } = await supabase.rpc("calculate_incident_dashboard_stats", {
        p_date: date,
        p_period: period
      });

      if (error) {
        console.error("Error calculating statistics:", error);
        return res.status(500).json({ error: error.message });
      }

      // Fetch the newly calculated stats
      const { data: stats, error: fetchError } = await supabase
        .from("incident_dashboard_stats")
        .select("*")
        .eq("stat_date", date)
        .eq("stat_period", period)
        .single();

      if (fetchError) {
        console.error("Error fetching calculated stats:", fetchError);
        return res.status(500).json({ error: fetchError.message });
      }

      return res.status(200).json({ 
        message: "Statistics calculated successfully",
        statistics: stats 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
