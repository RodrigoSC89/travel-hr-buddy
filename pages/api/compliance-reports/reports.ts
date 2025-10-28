// API endpoint for compliance reports management
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "GET") {
      const { report_id, report_type, status, scheduled_only } = req.query;

      if (report_id) {
        const { data, error } = await supabase
          .from("compliance_reports")
          .select("*")
          .eq("id", report_id)
          .single();

        if (error) {
          console.error("Error fetching report:", error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ report: data });
      }

      let query = supabase
        .from("compliance_reports")
        .select("*")
        .order("generation_date", { ascending: false });

      if (report_type) {
        query = query.eq("report_type", report_type);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (scheduled_only === "true") {
        query = query.eq("is_scheduled", true);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ reports: data });
    }

    if (req.method === "POST") {
      // Create new compliance report
      const {
        report_name,
        report_type,
        template_id,
        configuration,
        vessel_ids,
        compliance_framework,
        reporting_period_start,
        reporting_period_end,
        generated_by
      } = req.body;

      if (!report_name || !report_type || !reporting_period_start || !reporting_period_end) {
        return res.status(400).json({ 
          error: "report_name, report_type, reporting_period_start, and reporting_period_end are required" 
        });
      }

      // Generate report number
      const timestamp = Date.now();
      const report_number = `CR-${report_type.toUpperCase()}-${timestamp}`;

      const { data: report, error: reportError } = await supabase
        .from("compliance_reports")
        .insert({
          report_number,
          report_name,
          report_type,
          template_id,
          configuration: configuration || {},
          vessel_ids: vessel_ids || [],
          compliance_framework,
          reporting_period_start,
          reporting_period_end,
          generated_by,
          status: "draft"
        })
        .select()
        .single();

      if (reportError) {
        console.error("Error creating report:", reportError);
        return res.status(500).json({ error: reportError.message });
      }

      return res.status(201).json({ report });
    }

    if (req.method === "PUT") {
      // Update report status or content
      const {
        id,
        status,
        findings,
        recommendations,
        compliance_score,
        approved_by,
        approval_notes
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const updateData: any = { last_modified_at: new Date().toISOString() };
      
      if (status) {
        updateData.status = status;
        if (status === "approved") {
          updateData.approved_by = approved_by;
          updateData.approved_at = new Date().toISOString();
          updateData.approval_notes = approval_notes;
        }
      }
      
      if (findings) updateData.findings = findings;
      if (recommendations) updateData.recommendations = recommendations;
      if (compliance_score !== undefined) updateData.compliance_score = compliance_score;

      const { data, error } = await supabase
        .from("compliance_reports")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating report:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ report: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
