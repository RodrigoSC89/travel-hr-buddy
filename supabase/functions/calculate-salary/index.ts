import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalculateSalaryRequest {
  crew_member_id: string;
  month: number; // 1-12
  year: number;
  include_benefits?: boolean;
  include_deductions?: boolean;
}

interface SalaryCalculation {
  base_salary: number;
  overtime_hours: number;
  overtime_pay: number;
  sea_service_days: number;
  sea_allowance: number;
  benefits: {
    type: string;
    amount: number;
  }[];
  deductions: {
    type: string;
    amount: number;
  }[];
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  currency: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const params: CalculateSalaryRequest = await req.json();

    if (!params.crew_member_id || !params.month || !params.year) {
      return new Response(
        JSON.stringify({ error: "crew_member_id, month, and year are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get crew member with contract
    const { data: crewMember, error: crewError } = await adminSupabase
      .from("crew_members")
      .select(`
        id, name, position, rank, organization_id,
        contracts:crew_contracts(
          id, base_salary, currency, overtime_rate, sea_allowance_per_day,
          status, start_date, end_date
        )
      `)
      .eq("id", params.crew_member_id)
      .single();

    if (crewError || !crewMember) {
      return new Response(
        JSON.stringify({ error: "Crew member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user has permission
    const { data: userOrg } = await adminSupabase
      .from("organization_users")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", crewMember.organization_id)
      .single();

    if (!userOrg || !["admin", "manager", "hr_manager", "finance"].includes(userOrg.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active contract
    const activeContract = (crewMember.contracts as any[])?.find(
      (c: any) => c.status === "active"
    );

    if (!activeContract) {
      return new Response(
        JSON.stringify({ error: "No active contract found for this crew member" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 0);

    // Get time entries for the month
    const { data: timeEntries } = await adminSupabase
      .from("crew_time_entries")
      .select("*")
      .eq("crew_member_id", params.crew_member_id)
      .gte("work_date", startDate.toISOString().split("T")[0])
      .lte("work_date", endDate.toISOString().split("T")[0]);

    // Calculate overtime and sea service
    let overtimeHours = 0;
    let seaServiceDays = 0;
    
    if (timeEntries) {
      for (const entry of timeEntries) {
        if (entry.hours_worked > 8) {
          overtimeHours += entry.hours_worked - 8;
        }
        if (entry.is_at_sea) {
          seaServiceDays++;
        }
      }
    }

    // Get benefits
    const { data: benefitsData } = await adminSupabase
      .from("crew_benefits")
      .select("benefit_type, amount")
      .eq("crew_member_id", params.crew_member_id)
      .eq("is_active", true);

    // Get deductions
    const { data: deductionsData } = await adminSupabase
      .from("crew_deductions")
      .select("deduction_type, amount, is_percentage")
      .eq("crew_member_id", params.crew_member_id)
      .eq("is_active", true);

    // Calculate salary
    const baseSalary = activeContract.base_salary || 0;
    const overtimeRate = activeContract.overtime_rate || 1.5;
    const hourlyRate = baseSalary / 176; // Average hours per month
    const overtimePay = overtimeHours * hourlyRate * overtimeRate;
    const seaAllowance = seaServiceDays * (activeContract.sea_allowance_per_day || 0);

    const benefits = (benefitsData || []).map((b: any) => ({
      type: b.benefit_type,
      amount: b.amount,
    }));
    const totalBenefits = benefits.reduce((sum: number, b: any) => sum + b.amount, 0);

    const grossSalary = baseSalary + overtimePay + seaAllowance + totalBenefits;

    // Calculate deductions
    const deductions = (deductionsData || []).map((d: any) => ({
      type: d.deduction_type,
      amount: d.is_percentage ? (grossSalary * d.amount / 100) : d.amount,
    }));
    const totalDeductions = deductions.reduce((sum: number, d: any) => sum + d.amount, 0);

    const netSalary = grossSalary - totalDeductions;

    const calculation: SalaryCalculation = {
      base_salary: baseSalary,
      overtime_hours: overtimeHours,
      overtime_pay: Math.round(overtimePay * 100) / 100,
      sea_service_days: seaServiceDays,
      sea_allowance: seaAllowance,
      benefits: params.include_benefits !== false ? benefits : [],
      deductions: params.include_deductions !== false ? deductions : [],
      gross_salary: Math.round(grossSalary * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      net_salary: Math.round(netSalary * 100) / 100,
      currency: activeContract.currency || "USD",
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          crew_member: {
            id: crewMember.id,
            name: crewMember.name,
            position: crewMember.position,
            rank: crewMember.rank,
          },
          period: {
            month: params.month,
            year: params.year,
          },
          calculation,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("calculate-salary error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
