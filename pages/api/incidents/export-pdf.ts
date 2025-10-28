// API endpoint for generating incident PDF reports
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
      // Get export history for an incident or list all exports
      const { incident_id, export_id } = req.query;

      let query = supabase
        .from("incident_reports_export")
        .select("*")
        .order("created_at", { ascending: false });

      if (export_id) {
        query = query.eq("id", export_id);
        const { data, error } = await query.single();
        if (error) {
          console.error("Error fetching export:", error);
          return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({ export: data });
      }

      if (incident_id) {
        query = query.eq("incident_id", incident_id);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Error fetching exports:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ exports: data });
    }

    if (req.method === "POST") {
      // Request a new PDF export
      const {
        incident_id,
        export_type,
        export_format,
        include_attachments,
        include_comments,
        include_timeline,
        include_analytics,
        generated_by,
        is_confidential
      } = req.body;

      if (!incident_id || !export_type) {
        return res.status(400).json({ 
          error: "incident_id and export_type are required" 
        });
      }

      // Get incident details
      const { data: incident, error: incidentError } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("id", incident_id)
        .single();

      if (incidentError || !incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      // Generate file name
      const timestamp = new Date().toISOString().split("T")[0];
      const file_name = `incident_${incident.incident_number}_${export_format || "full_report"}_${timestamp}.${export_type}`;
      const file_path = `exports/incidents/${incident_id}/${file_name}`;

      // Create export record
      const { data: exportRecord, error: exportError } = await supabase
        .from("incident_reports_export")
        .insert({
          incident_id,
          export_type: export_type || "pdf",
          export_format: export_format || "full_report",
          file_name,
          file_path,
          generated_by,
          generation_status: "pending",
          include_attachments: include_attachments !== false,
          include_comments: include_comments !== false,
          include_timeline: include_timeline !== false,
          include_analytics: include_analytics || false,
          is_confidential: is_confidential || false
        })
        .select()
        .single();

      if (exportError) {
        console.error("Error creating export record:", exportError);
        return res.status(500).json({ error: exportError.message });
      }

      // In a real implementation, trigger background job to generate PDF
      // For now, we'll mark it as processing and return the record
      await supabase
        .from("incident_reports_export")
        .update({ generation_status: "processing" })
        .eq("id", exportRecord.id);

      // Simulate PDF generation (in production, use a library like jsPDF or puppeteer)
      // This would be done in a background worker
      setTimeout(async () => {
        try {
          // Mock successful generation
          await supabase
            .from("incident_reports_export")
            .update({
              generation_status: "completed",
              generation_completed_at: new Date().toISOString(),
              file_url: `/api/incidents/download-report?export_id=${exportRecord.id}`
            })
            .eq("id", exportRecord.id);
        } catch (err) {
          console.error("Error updating export status:", err);
        }
      }, 2000);

      return res.status(201).json({ 
        export: exportRecord,
        message: "Export request submitted. Check status for completion." 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
