// API endpoint for incident escalation management
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "GET") {
      // Get escalations for an incident or all active escalations
      const { incident_id, active_only } = req.query;

      let query = supabase
        .from("incident_escalations")
        .select(`
          *,
          incident_reports!inner(id, incident_number, title, severity, status)
        `)
        .order("created_at", { ascending: false });

      if (incident_id) {
        query = query.eq("incident_id", incident_id);
      }

      if (active_only === "true") {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching escalations:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ escalations: data });
    }

    if (req.method === "POST") {
      // Create new escalation
      const {
        incident_id,
        escalation_level,
        escalation_reason,
        escalation_type,
        escalated_to,
        escalated_to_role,
        escalated_by,
        notification_method
      } = req.body;

      if (!incident_id || !escalation_level || !escalation_reason) {
        return res.status(400).json({ 
          error: "incident_id, escalation_level, and escalation_reason are required" 
        });
      }

      // Create escalation record
      const { data: escalation, error: escalationError } = await supabase
        .from("incident_escalations")
        .insert({
          incident_id,
          escalation_level,
          escalation_reason,
          escalation_type: escalation_type || "manual",
          escalated_to,
          escalated_to_role,
          escalated_by,
          notification_method: notification_method || "email",
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (escalationError) {
        console.error("Error creating escalation:", escalationError);
        return res.status(500).json({ error: escalationError.message });
      }

      // Update incident workflow state
      await supabase
        .from("incident_workflow_states")
        .insert({
          incident_id,
          workflow_stage: "escalated",
          escalation_level,
          required_actions: ["immediate_review", "assign_resolution_team"],
          changed_by: escalated_by,
          change_reason: `Escalated: ${escalation_reason}`
        });

      // Create incident comment
      await supabase
        .from("incident_comments")
        .insert({
          incident_id,
          comment_text: `Incident escalated to level ${escalation_level}. Reason: ${escalation_reason}`,
          comment_type: "escalation",
          created_by: escalated_by
        });

      return res.status(201).json({ escalation });
    }

    if (req.method === "PUT") {
      // Update escalation (acknowledge, respond, or resolve)
      const {
        id,
        acknowledged,
        acknowledged_by,
        response_text,
        is_active,
        resolved_at
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const updateData: any = {};
      
      if (acknowledged !== undefined) {
        updateData.acknowledged = acknowledged;
        if (acknowledged) {
          updateData.acknowledged_at = new Date().toISOString();
          if (acknowledged_by) updateData.acknowledged_by = acknowledged_by;
        }
      }
      
      if (response_text) updateData.response_text = response_text;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (resolved_at) updateData.resolved_at = resolved_at;

      const { data, error } = await supabase
        .from("incident_escalations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating escalation:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ escalation: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
