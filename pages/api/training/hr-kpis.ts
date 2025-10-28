// API endpoint for HR training KPIs dashboard
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
      const { period = "monthly", limit = 12 } = req.query;

      // Get historical KPIs
      const { data: kpis, error } = await supabase
        .from("training_hr_kpis")
        .select("*")
        .eq("kpi_period", period)
        .order("kpi_date", { ascending: false })
        .limit(parseInt(limit as string));

      if (error) {
        console.error("Error fetching KPIs:", error);
        return res.status(500).json({ error: error.message });
      }

      // Get current real-time stats
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("*");

      const { data: certifications } = await supabase
        .from("certifications")
        .select("*")
        .gte("issued_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate real-time summary
      const summary = {
        total_active_learners: enrollments?.filter(e => e.enrollment_status === "active").length || 0,
        courses_in_progress: enrollments?.filter(e => e.enrollment_status === "active" && e.overall_progress_percentage > 0).length || 0,
        recent_completions: enrollments?.filter(e => e.enrollment_status === "completed").length || 0,
        certifications_last_30_days: certifications?.length || 0,
        avg_progress: enrollments?.reduce((sum, e) => sum + (e.overall_progress_percentage || 0), 0) / (enrollments?.length || 1)
      };

      // Get at-risk learners (no progress in 14 days)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data: atRiskLearners } = await supabase
        .from("course_enrollments")
        .select("user_id, courses(title)")
        .eq("enrollment_status", "active")
        .lt("last_accessed_at", twoWeeksAgo);

      return res.status(200).json({
        kpis,
        summary,
        at_risk_learners: atRiskLearners || [],
        at_risk_count: atRiskLearners?.length || 0
      });
    }

    if (req.method === "POST") {
      // Trigger KPI calculation
      const { date, period } = req.body;

      if (!date || !period) {
        return res.status(400).json({ error: "date and period are required" });
      }

      const { error } = await supabase.rpc("calculate_training_hr_kpis", {
        p_date: date,
        p_period: period
      });

      if (error) {
        console.error("Error calculating KPIs:", error);
        return res.status(500).json({ error: error.message });
      }

      const { data: kpis } = await supabase
        .from("training_hr_kpis")
        .select("*")
        .eq("kpi_date", date)
        .eq("kpi_period", period)
        .single();

      return res.status(200).json({ 
        message: "KPIs calculated successfully",
        kpis 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
