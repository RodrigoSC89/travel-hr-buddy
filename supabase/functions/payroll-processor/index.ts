import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayrollCalculation {
  crew_member_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  currency: string;
  days_onboard: number;
  overtime_hours: number;
  overtime_rate: number;
  allowances: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  allotments: Array<{ beneficiary: string; amount: number; bank_details?: any }>;
}

// Currency conversion rates (in production, use real-time API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  PHP: 55.80,
  INR: 83.10,
  IDR: 15650,
  CNY: 7.24,
  SGD: 1.34,
  AED: 3.67,
  BRL: 4.97
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...data } = await req.json();

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: "User has no organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "calculate_payroll":
        return await calculatePayroll(supabase, profile.organization_id, data);
      
      case "create_period":
        return await createPayrollPeriod(supabase, profile.organization_id, data);
      
      case "process_period":
        return await processPayrollPeriod(supabase, profile.organization_id, data.period_id);
      
      case "get_summary":
        return await getPayrollSummary(supabase, profile.organization_id, data.period_id);
      
      case "convert_currency":
        return await convertCurrency(data.amount, data.from_currency, data.to_currency);
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("Payroll processor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function calculatePayroll(
  supabase: any,
  organizationId: string,
  calc: PayrollCalculation
): Promise<Response> {
  // Get crew member details
  const { data: crewMember } = await supabase
    .from("crew_members")
    .select("*")
    .eq("id", calc.crew_member_id)
    .single();

  if (!crewMember) {
    return new Response(
      JSON.stringify({ error: "Crew member not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Calculate components
  const dailyRate = calc.base_salary / 30;  // Assuming monthly salary
  const basicPay = dailyRate * calc.days_onboard;
  
  const overtimeAmount = calc.overtime_hours * calc.overtime_rate;
  
  const totalAllowances = calc.allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = calc.deductions.reduce((sum, d) => sum + d.amount, 0);
  const totalAllotments = calc.allotments.reduce((sum, a) => sum + a.amount, 0);
  
  // Tax calculation (simplified - in production use jurisdiction-specific rules)
  const taxableIncome = basicPay + overtimeAmount + totalAllowances;
  const taxRate = getTaxRate(crewMember.nationality, taxableIncome, calc.currency);
  const taxAmount = taxableIncome * taxRate;
  
  // Calculate pension (if applicable)
  const pensionRate = 0.05;  // 5% pension contribution
  const pensionContribution = basicPay * pensionRate;
  
  // Gross and net
  const grossPay = basicPay + overtimeAmount + totalAllowances;
  const netPay = grossPay - totalDeductions - taxAmount - pensionContribution - totalAllotments;

  // Store payroll record
  const { data: payrollRecord, error } = await supabase
    .from("crew_payroll")
    .insert({
      organization_id: organizationId,
      crew_member_id: calc.crew_member_id,
      vessel_id: crewMember.vessel_id,
      payroll_period_start: calc.period_start,
      payroll_period_end: calc.period_end,
      base_salary: calc.base_salary,
      currency: calc.currency,
      days_onboard: calc.days_onboard,
      overtime_hours: calc.overtime_hours,
      overtime_rate: calc.overtime_rate,
      overtime_amount: overtimeAmount,
      allowances: calc.allowances,
      deductions: calc.deductions,
      allotments: calc.allotments,
      tax_amount: taxAmount,
      pension_contribution: pensionContribution,
      gross_pay: grossPay,
      net_pay: netPay,
      payment_status: "calculated"
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payroll record: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      payroll_id: payrollRecord.id,
      breakdown: {
        basic_pay: round2(basicPay),
        overtime_amount: round2(overtimeAmount),
        total_allowances: round2(totalAllowances),
        gross_pay: round2(grossPay),
        deductions: {
          tax: round2(taxAmount),
          pension: round2(pensionContribution),
          other: round2(totalDeductions),
          allotments: round2(totalAllotments)
        },
        net_pay: round2(netPay),
        currency: calc.currency
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function createPayrollPeriod(
  supabase: any,
  organizationId: string,
  data: { period_name: string; period_start: string; period_end: string; currency: string }
): Promise<Response> {
  const { data: period, error } = await supabase
    .from("payroll_periods")
    .insert({
      organization_id: organizationId,
      period_name: data.period_name,
      period_start: data.period_start,
      period_end: data.period_end,
      currency: data.currency,
      status: "draft"
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payroll period: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, period }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processPayrollPeriod(
  supabase: any,
  organizationId: string,
  periodId: string
): Promise<Response> {
  // Get all payroll records for this period
  const { data: payrolls } = await supabase
    .from("crew_payroll")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("payment_status", "calculated");

  if (!payrolls || payrolls.length === 0) {
    return new Response(
      JSON.stringify({ error: "No payroll records to process" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Calculate totals
  interface PayrollTotals { gross: number; net: number; deductions: number; taxes: number }
  interface PayrollRecord { gross_pay?: number; net_pay?: number; tax_amount?: number; pension_contribution?: number }
  const totals = payrolls.reduce((acc: PayrollTotals, p: PayrollRecord) => ({
    gross: acc.gross + (p.gross_pay || 0),
    net: acc.net + (p.net_pay || 0),
    deductions: acc.deductions + (p.tax_amount || 0) + (p.pension_contribution || 0),
    taxes: acc.taxes + (p.tax_amount || 0)
  }), { gross: 0, net: 0, deductions: 0, taxes: 0 });

  // Update period status
  const { error: periodError } = await supabase
    .from("payroll_periods")
    .update({
      status: "processing",
      total_gross: totals.gross,
      total_net: totals.net,
      total_deductions: totals.deductions,
      total_taxes: totals.taxes,
      processed_at: new Date().toISOString()
    })
    .eq("id", periodId);

  // Mark individual payrolls as pending payment
  await supabase
    .from("crew_payroll")
    .update({ payment_status: "pending" })
    .eq("organization_id", organizationId)
    .eq("payment_status", "calculated");

  return new Response(
    JSON.stringify({
      success: true,
      processed_count: payrolls.length,
      totals: {
        gross: round2(totals.gross),
        net: round2(totals.net),
        deductions: round2(totals.deductions),
        taxes: round2(totals.taxes)
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getPayrollSummary(
  supabase: any,
  organizationId: string,
  periodId?: string
): Promise<Response> {
  let query = supabase
    .from("crew_payroll")
    .select(`
      *,
      crew_members (full_name, rank, position)
    `)
    .eq("organization_id", organizationId);

  if (periodId) {
    // Filter by period dates
    const { data: period } = await supabase
      .from("payroll_periods")
      .select("*")
      .eq("id", periodId)
      .single();
    
    if (period) {
      query = query
        .gte("payroll_period_start", period.period_start)
        .lte("payroll_period_end", period.period_end);
    }
  }

  const { data: payrolls } = await query;

  // Group by status
  const byStatus = (payrolls || []).reduce((acc: Record<string, number>, p: { payment_status: string }) => {
    acc[p.payment_status] = (acc[p.payment_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate totals
  const totals = (payrolls || []).reduce((acc: { gross: number; net: number; count: number }, p: { gross_pay?: number; net_pay?: number }) => ({
    gross: acc.gross + (p.gross_pay || 0),
    net: acc.net + (p.net_pay || 0),
    count: acc.count + 1
  }), { gross: 0, net: 0, count: 0 });

  return new Response(
    JSON.stringify({
      payrolls,
      summary: {
        total_records: totals.count,
        total_gross: round2(totals.gross),
        total_net: round2(totals.net),
        by_status: byStatus
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<Response> {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;

  return new Response(
    JSON.stringify({
      original_amount: amount,
      original_currency: fromCurrency,
      converted_amount: round2(convertedAmount),
      target_currency: toCurrency,
      exchange_rate: round2(toRate / fromRate)
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function getTaxRate(nationality: string, income: number, currency: string): number {
  // Simplified tax calculation
  // In production, use jurisdiction-specific rules
  
  // Flag state exemptions (many seafarers are tax-exempt)
  const taxExemptFlags = ["PA", "LR", "MH", "BS", "MT"];  // Panama, Liberia, etc.
  
  // For now, apply a simplified progressive rate
  const annualIncome = income * 12;
  
  if (annualIncome < 10000) return 0;
  if (annualIncome < 30000) return 0.10;
  if (annualIncome < 60000) return 0.15;
  if (annualIncome < 100000) return 0.20;
  return 0.25;
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}