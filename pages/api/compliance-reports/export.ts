// API endpoint for compliance report export
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
      const { report_id, export_id } = req.query;

      if (export_id) {
        const { data, error } = await supabase
          .from("compliance_report_exports")
          .select("*")
          .eq("id", export_id)
          .single();

        if (error) {
          console.error("Error fetching export:", error);
          return res.status(500).json({ error: error.message });
        }

        // Increment download count
        await supabase
          .from("compliance_report_exports")
          .update({
            download_count: (data.download_count || 0) + 1,
            last_downloaded_at: new Date().toISOString()
          })
          .eq("id", export_id);

        return res.status(200).json({ export: data });
      }

      if (report_id) {
        const { data, error } = await supabase
          .from("compliance_report_exports")
          .select("*")
          .eq("report_id", report_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching exports:", error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ exports: data });
      }

      return res.status(400).json({ error: "report_id or export_id is required" });
    }

    if (req.method === "POST") {
      // Request new export
      const {
        report_id,
        export_format,
        include_attachments = true,
        include_charts = true,
        include_summary = true,
        generated_by
      } = req.body;

      if (!report_id || !export_format) {
        return res.status(400).json({ error: "report_id and export_format are required" });
      }

      // Get report details
      const { data: report, error: reportError } = await supabase
        .from("compliance_reports")
        .select("*")
        .eq("id", report_id)
        .single();

      if (reportError || !report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Generate file name
      const timestamp = new Date().toISOString().split("T")[0];
      const file_name = `${report.report_number}_${timestamp}.${export_format}`;
      const file_path = `exports/compliance/${report_id}/${file_name}`;

      // Create export record
      const { data: exportRecord, error: exportError } = await supabase
        .from("compliance_report_exports")
        .insert({
          report_id,
          export_format,
          file_name,
          file_path,
          generated_by,
          generation_status: "pending",
          include_attachments,
          include_charts,
          include_summary
        })
        .select()
        .single();

      if (exportError) {
        console.error("Error creating export:", exportError);
        return res.status(500).json({ error: exportError.message });
      }

      // Simulate export generation (in production, use background worker)
      setTimeout(async () => {
        try {
          await supabase
            .from("compliance_report_exports")
            .update({
              generation_status: "completed",
              generation_completed_at: new Date().toISOString(),
              generation_duration_seconds: 5,
              file_url: `/api/compliance-reports/download?export_id=${exportRecord.id}`
            })
            .eq("id", exportRecord.id);
        } catch (err) {
          console.error("Error updating export status:", err);
        }
      }, 2000);

      // Update report export tracking
      await supabase
        .from("compliance_reports")
        .update({
          last_exported_at: new Date().toISOString(),
          export_count: (report.export_count || 0) + 1,
          exported_formats: Array.from(new Set([...(report.exported_formats || []), export_format]))
        })
        .eq("id", report_id);

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
