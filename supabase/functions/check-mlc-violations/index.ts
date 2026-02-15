import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MLC_LIMITS = {
  MAX_WORK_HOURS_DAY: 14,
  MAX_WORK_HOURS_WEEK: 72,
  MIN_REST_HOURS_DAY: 10,
  MIN_REST_HOURS_WEEK: 77,
  MAX_CONTINUOUS_WORK: 14,
  MIN_CONTINUOUS_REST: 6,
};

interface Violation {
  crew_member_id: string;
  date: string;
  type: string;
  description: string;
  severity: "warning" | "critical";
  regulation: string;
  value: number;
  limit: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { crew_member_id, month, vessel_id } = await req.json().catch(() => ({
      crew_member_id: null, month: null, vessel_id: null,
    }));

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().slice(0, 10);

    let query = supabase
      .from("mlc_work_rest_records")
      .select("*, crew:crew_members(full_name, vessel_id)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (crew_member_id) query = query.eq("crew_member_id", crew_member_id);
    if (vessel_id) query = query.eq("vessel_id", vessel_id);

    const { data: records, error } = await query;
    if (error) throw error;

    const violations: Violation[] = [];

    // Group by crew member
    const byCrewMember = new Map<string, any[]>();
    for (const record of (records || [])) {
      const id = record.crew_member_id;
      if (!byCrewMember.has(id)) byCrewMember.set(id, []);
      byCrewMember.get(id)!.push(record);
    }

    for (const [crewId, crewRecords] of byCrewMember) {
      // Daily checks
      for (const record of crewRecords) {
        // Max work hours per day
        if (record.work_hours > MLC_LIMITS.MAX_WORK_HOURS_DAY) {
          violations.push({
            crew_member_id: crewId,
            date: record.date,
            type: "max_work_day",
            description: `Trabalhou ${record.work_hours}h em um dia (máx: ${MLC_LIMITS.MAX_WORK_HOURS_DAY}h)`,
            severity: "critical",
            regulation: "MLC Reg. 2.3 / STCW A-VIII/1",
            value: record.work_hours,
            limit: MLC_LIMITS.MAX_WORK_HOURS_DAY,
          });
        }

        // Min rest hours per day
        if (record.rest_hours < MLC_LIMITS.MIN_REST_HOURS_DAY) {
          violations.push({
            crew_member_id: crewId,
            date: record.date,
            type: "min_rest_day",
            description: `Descansou apenas ${record.rest_hours}h em um dia (mín: ${MLC_LIMITS.MIN_REST_HOURS_DAY}h)`,
            severity: "critical",
            regulation: "MLC Reg. 2.3",
            value: record.rest_hours,
            limit: MLC_LIMITS.MIN_REST_HOURS_DAY,
          });
        }
      }

      // Weekly checks (group by ISO week)
      const weeklyMap = new Map<string, { work: number; rest: number; dates: string[] }>();
      for (const record of crewRecords) {
        const d = new Date(record.date);
        const week = `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
        if (!weeklyMap.has(week)) weeklyMap.set(week, { work: 0, rest: 0, dates: [] });
        const w = weeklyMap.get(week)!;
        w.work += Number(record.work_hours) || 0;
        w.rest += Number(record.rest_hours) || 0;
        w.dates.push(record.date);
      }

      for (const [week, data] of weeklyMap) {
        if (data.dates.length >= 7) {
          if (data.work > MLC_LIMITS.MAX_WORK_HOURS_WEEK) {
            violations.push({
              crew_member_id: crewId,
              date: data.dates[0],
              type: "max_work_week",
              description: `Trabalhou ${data.work.toFixed(1)}h na semana ${week} (máx: ${MLC_LIMITS.MAX_WORK_HOURS_WEEK}h)`,
              severity: "critical",
              regulation: "MLC Reg. 2.3",
              value: data.work,
              limit: MLC_LIMITS.MAX_WORK_HOURS_WEEK,
            });
          }
          if (data.rest < MLC_LIMITS.MIN_REST_HOURS_WEEK) {
            violations.push({
              crew_member_id: crewId,
              date: data.dates[0],
              type: "min_rest_week",
              description: `Descansou apenas ${data.rest.toFixed(1)}h na semana ${week} (mín: ${MLC_LIMITS.MIN_REST_HOURS_WEEK}h)`,
              severity: "critical",
              regulation: "MLC Reg. 2.3",
              value: data.rest,
              limit: MLC_LIMITS.MIN_REST_HOURS_WEEK,
            });
          }
        }
      }
    }

    // Update has_violation flag on records
    for (const v of violations) {
      await supabase
        .from("mlc_work_rest_records")
        .update({ has_violation: true })
        .eq("crew_member_id", v.crew_member_id)
        .eq("date", v.date);
    }

    const summary = {
      month: targetMonth,
      totalRecords: records?.length || 0,
      crewMembersChecked: byCrewMember.size,
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === "critical").length,
      warningViolations: violations.filter(v => v.severity === "warning").length,
      violationsByType: {
        max_work_day: violations.filter(v => v.type === "max_work_day").length,
        min_rest_day: violations.filter(v => v.type === "min_rest_day").length,
        max_work_week: violations.filter(v => v.type === "max_work_week").length,
        min_rest_week: violations.filter(v => v.type === "min_rest_week").length,
      },
      violations,
      checkedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
