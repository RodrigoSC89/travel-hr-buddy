import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// MLC 2006 Requirements
const MLC_REQUIREMENTS = {
  minRestIn24h: 10,
  minRestIn7Days: 77,
  maxWorkIn24h: 14,
  maxWorkIn7Days: 72,
  minRestPeriods: 2,
  minRestPeriodLength: 6,
  maxIntervalBetweenPeriods: 14,
};

interface MLCCheckRequest {
  organization_id: string;
  vessel_id?: string;
  crew_member_id?: string;
  start_date: string;
  end_date: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: MLCCheckRequest = await req.json();

    // Fetch rest hours records
    let query = supabase
      .from("mlc_rest_hours")
      .select("*")
      .eq("organization_id", requestData.organization_id)
      .gte("record_date", requestData.start_date)
      .lte("record_date", requestData.end_date)
      .order("record_date", { ascending: true });

    if (requestData.vessel_id) {
      query = query.eq("vessel_id", requestData.vessel_id);
    }
    if (requestData.crew_member_id) {
      query = query.eq("crew_member_id", requestData.crew_member_id);
    }

    const { data: restHours, error: restError } = await query;
    if (restError) throw restError;

    // Fetch crew members for context
    const { data: crewMembers, error: crewError } = await supabase
      .from("crew_members")
      .select("id, full_name, rank")
      .eq("organization_id", requestData.organization_id)
      .eq("status", "active");

    if (crewError) throw crewError;

    const getCrewName = (id: string) => {
      const crew = crewMembers?.find((c: any) => c.id === id);
      return crew?.full_name || "Unknown";
    };

    // Analyze compliance
    const violations: any[] = [];
    const crewCompliance: Record<string, any> = {};

    // Group by crew member
    const crewRecords: Record<string, any[]> = {};
    for (const record of restHours || []) {
      if (!crewRecords[record.crew_member_id]) {
        crewRecords[record.crew_member_id] = [];
      }
      crewRecords[record.crew_member_id].push(record);
    }

    // Analyze each crew member
    for (const [crewId, records] of Object.entries(crewRecords)) {
      const crewViolations: any[] = [];
      let totalRestHours = 0;
      let totalWorkHours = 0;
      let compliantDays = 0;

      for (const record of records) {
        totalRestHours += record.total_rest_hours || 0;
        totalWorkHours += record.total_work_hours || 0;

        // Check 24-hour rest requirement
        if (record.total_rest_hours < MLC_REQUIREMENTS.minRestIn24h) {
          crewViolations.push({
            date: record.record_date,
            type: "insufficient_rest_24h",
            requirement: `Minimum ${MLC_REQUIREMENTS.minRestIn24h}h rest in 24h`,
            actual: `${record.total_rest_hours}h`,
            severity: "high",
          });
        }

        // Check 24-hour work limit
        if (record.total_work_hours > MLC_REQUIREMENTS.maxWorkIn24h) {
          crewViolations.push({
            date: record.record_date,
            type: "excessive_work_24h",
            requirement: `Maximum ${MLC_REQUIREMENTS.maxWorkIn24h}h work in 24h`,
            actual: `${record.total_work_hours}h`,
            severity: "high",
          });
        }

        // Check rest period structure
        const restPeriods = record.rest_periods || [];
        if (restPeriods.length > MLC_REQUIREMENTS.minRestPeriods) {
          crewViolations.push({
            date: record.record_date,
            type: "too_many_rest_periods",
            requirement: `Maximum ${MLC_REQUIREMENTS.minRestPeriods} rest periods`,
            actual: `${restPeriods.length} periods`,
            severity: "medium",
          });
        }

        // Check minimum rest period length
        const hasMinPeriod = restPeriods.some((p: any) => 
          (p.duration_hours || 0) >= MLC_REQUIREMENTS.minRestPeriodLength
        );
        if (restPeriods.length > 0 && !hasMinPeriod) {
          crewViolations.push({
            date: record.record_date,
            type: "no_minimum_rest_period",
            requirement: `At least one rest period ≥ ${MLC_REQUIREMENTS.minRestPeriodLength}h`,
            actual: "No qualifying period",
            severity: "high",
          });
        }

        if (record.compliant) {
          compliantDays++;
        }
      }

      // Check 7-day rolling compliance
      if (records.length >= 7) {
        for (let i = 6; i < records.length; i++) {
          const weekRecords = records.slice(i - 6, i + 1);
          const weekRest = weekRecords.reduce((sum, r) => sum + (r.total_rest_hours || 0), 0);
          const weekWork = weekRecords.reduce((sum, r) => sum + (r.total_work_hours || 0), 0);

          if (weekRest < MLC_REQUIREMENTS.minRestIn7Days) {
            crewViolations.push({
              date: records[i].record_date,
              type: "insufficient_rest_7days",
              requirement: `Minimum ${MLC_REQUIREMENTS.minRestIn7Days}h rest in 7 days`,
              actual: `${weekRest.toFixed(1)}h`,
              severity: "critical",
            });
          }

          if (weekWork > MLC_REQUIREMENTS.maxWorkIn7Days) {
            crewViolations.push({
              date: records[i].record_date,
              type: "excessive_work_7days",
              requirement: `Maximum ${MLC_REQUIREMENTS.maxWorkIn7Days}h work in 7 days`,
              actual: `${weekWork.toFixed(1)}h`,
              severity: "critical",
            });
          }
        }
      }

      const complianceRate = records.length > 0 
        ? ((compliantDays / records.length) * 100).toFixed(1)
        : 100;

      crewCompliance[crewId] = {
        crew_member_id: crewId,
        full_name: getCrewName(crewId),
        total_records: records.length,
        compliant_days: compliantDays,
        compliance_rate: Number(complianceRate),
        average_rest_hours: records.length > 0 ? (totalRestHours / records.length).toFixed(1) : 0,
        average_work_hours: records.length > 0 ? (totalWorkHours / records.length).toFixed(1) : 0,
        violations: crewViolations,
        violation_count: crewViolations.length,
        critical_violations: crewViolations.filter(v => v.severity === "critical").length,
        high_violations: crewViolations.filter(v => v.severity === "high").length,
      };

      violations.push(...crewViolations.map(v => ({
        ...v,
        crew_member_id: crewId,
        crew_name: getCrewName(crewId),
      })));
    }

    // Calculate overall compliance
    const totalRecords = restHours?.length || 0;
    const compliantRecords = restHours?.filter((r: any) => r.compliant).length || 0;
    const overallComplianceRate = totalRecords > 0 
      ? ((compliantRecords / totalRecords) * 100).toFixed(1)
      : 100;

    // Generate PSC readiness assessment
    const criticalViolations = violations.filter(v => v.severity === "critical").length;
    const highViolations = violations.filter(v => v.severity === "high").length;
    
    let pscReadiness = "GREEN";
    let pscRisk = "Low";
    if (criticalViolations > 0) {
      pscReadiness = "RED";
      pscRisk = "High - Detention possible";
    } else if (highViolations > 5) {
      pscReadiness = "AMBER";
      pscRisk = "Medium - Deficiencies likely";
    } else if (highViolations > 0) {
      pscReadiness = "YELLOW";
      pscRisk = "Low-Medium - Minor observations possible";
    }

    const response = {
      analysis_period: {
        start_date: requestData.start_date,
        end_date: requestData.end_date,
      },
      summary: {
        total_records: totalRecords,
        compliant_records: compliantRecords,
        overall_compliance_rate: Number(overallComplianceRate),
        total_violations: violations.length,
        critical_violations: criticalViolations,
        high_violations: highViolations,
        crew_analyzed: Object.keys(crewCompliance).length,
      },
      psc_readiness: {
        status: pscReadiness,
        risk_level: pscRisk,
        recommendations: criticalViolations > 0 ? [
          "Immediate action required to address critical violations",
          "Review and adjust work schedules",
          "Ensure accurate record keeping",
          "Brief Master on potential PSC concerns",
        ] : highViolations > 0 ? [
          "Address high-priority violations within 7 days",
          "Review rest hour scheduling practices",
          "Verify record accuracy",
        ] : [
          "Maintain current compliance practices",
          "Continue regular monitoring",
        ],
      },
      mlc_requirements: MLC_REQUIREMENTS,
      crew_compliance: Object.values(crewCompliance),
      violations: violations.slice(0, 50), // Limit to 50 most recent
      by_violation_type: {
        insufficient_rest_24h: violations.filter(v => v.type === "insufficient_rest_24h").length,
        excessive_work_24h: violations.filter(v => v.type === "excessive_work_24h").length,
        insufficient_rest_7days: violations.filter(v => v.type === "insufficient_rest_7days").length,
        excessive_work_7days: violations.filter(v => v.type === "excessive_work_7days").length,
        too_many_rest_periods: violations.filter(v => v.type === "too_many_rest_periods").length,
        no_minimum_rest_period: violations.filter(v => v.type === "no_minimum_rest_period").length,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const err = error as Error;
    console.error("MLC compliance check error:", err);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
