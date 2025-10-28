// API endpoint for channel health monitoring
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "GET") {
      const { channel_id } = req.query;

      // Get real-time channel activity
      let activityQuery = supabase
        .from("channel_activity_realtime")
        .select(`
          *,
          communication_channels!inner(id, name, channel_type, is_active)
        `)
        .order("last_updated_at", { ascending: false });

      if (channel_id) {
        activityQuery = activityQuery.eq("channel_id", channel_id);
      }

      const { data: activity, error: activityError } = await activityQuery;

      if (activityError) {
        console.error("Error fetching channel activity:", activityError);
        return res.status(500).json({ error: activityError.message });
      }

      // Get recent health metrics
      let metricsQuery = supabase
        .from("channel_health_metrics")
        .select("*")
        .order("last_health_check", { ascending: false })
        .limit(10);

      if (channel_id) {
        metricsQuery = metricsQuery.eq("channel_id", channel_id);
      }

      const { data: metrics, error: metricsError } = await metricsQuery;

      if (metricsError) {
        console.error("Error fetching health metrics:", metricsError);
      }

      return res.status(200).json({
        activity: activity || [],
        metrics: metrics || [],
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === "POST") {
      // Update channel health status
      const {
        channel_id,
        status,
        latency_ms,
        active_connections,
        websocket_connections,
        message_delivery_rate
      } = req.body;

      if (!channel_id || !status) {
        return res.status(400).json({ error: "channel_id and status are required" });
      }

      // Call the health update function
      const { error } = await supabase.rpc("update_channel_health", {
        p_channel_id: channel_id,
        p_status: status,
        p_latency_ms: latency_ms || 0,
        p_active_connections: active_connections || 0
      });

      if (error) {
        console.error("Error updating channel health:", error);
        return res.status(500).json({ error: error.message });
      }

      // Get updated activity
      const { data: activity } = await supabase
        .from("channel_activity_realtime")
        .select("*")
        .eq("channel_id", channel_id)
        .single();

      return res.status(200).json({ 
        message: "Channel health updated",
        activity 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
