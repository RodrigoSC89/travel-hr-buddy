// API endpoint for incident workflow management
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
      // Get workflow states for an incident
      const { incident_id } = req.query;

      if (!incident_id) {
        return res.status(400).json({ error: "incident_id is required" });
      }

      const { data, error } = await supabase
        .from("incident_workflow_states")
        .select("*")
        .eq("incident_id", incident_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workflow states:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ workflow_states: data });
    }

    if (req.method === "POST") {
      // Create new workflow state
      const {
        incident_id,
        workflow_stage,
        assigned_team,
        escalation_level,
        required_actions,
        changed_by,
        change_reason
      } = req.body;

      if (!incident_id || !workflow_stage) {
        return res.status(400).json({ error: "incident_id and workflow_stage are required" });
      }

      // Calculate SLA deadline based on severity
      const { data: incident } = await supabase
        .from("incident_reports")
        .select("severity")
        .eq("id", incident_id)
        .single();

      let sla_hours = 48; // default
      if (incident?.severity === "critical") sla_hours = 4;
      else if (incident?.severity === "high") sla_hours = 12;
      else if (incident?.severity === "medium") sla_hours = 24;

      const sla_deadline = new Date();
      sla_deadline.setHours(sla_deadline.getHours() + sla_hours);

      const { data, error } = await supabase
        .from("incident_workflow_states")
        .insert({
          incident_id,
          workflow_stage,
          assigned_team,
          escalation_level: escalation_level || 0,
          required_actions: required_actions || [],
          sla_deadline: sla_deadline.toISOString(),
          sla_status: "on_track",
          changed_by,
          change_reason
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating workflow state:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ workflow_state: data });
    }

    if (req.method === "PUT") {
      // Update workflow state
      const {
        id,
        workflow_stage,
        completed_actions,
        sla_status,
        stage_completed_at
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const updateData: any = {};
      if (workflow_stage) updateData.workflow_stage = workflow_stage;
      if (completed_actions) updateData.completed_actions = completed_actions;
      if (sla_status) updateData.sla_status = sla_status;
      if (stage_completed_at) updateData.stage_completed_at = stage_completed_at;

      const { data, error } = await supabase
        .from("incident_workflow_states")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating workflow state:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ workflow_state: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
