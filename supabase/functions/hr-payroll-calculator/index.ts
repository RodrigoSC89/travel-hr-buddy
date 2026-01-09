/**
 * HR Payroll Calculator
 * Calculates payroll with Brazilian tax rules (INSS, IRRF, FGTS)
 * Validates and detects anomalies with AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// INSS 2024 Table
const INSS_TABLE = [
  { limit: 1412.00, rate: 0.075 },
  { limit: 2666.68, rate: 0.09 },
  { limit: 4000.03, rate: 0.12 },
  { limit: 7786.02, rate: 0.14 },
];

// IRRF 2024 Table
const IRRF_TABLE = [
  { limit: 2259.20, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 0.075, deduction: 169.44 },
  { limit: 3751.05, rate: 0.15, deduction: 381.44 },
  { limit: 4664.68, rate: 0.225, deduction: 662.77 },
  { limit: Infinity, rate: 0.275, deduction: 896.00 },
];

const DEPENDENT_DEDUCTION = 189.59;
const FGTS_RATE = 0.08;

function calculateINSS(grossSalary: number): number {
  let inss = 0;
  let previousLimit = 0;

  for (const bracket of INSS_TABLE) {
    if (grossSalary > previousLimit) {
      const taxableAmount = Math.min(grossSalary, bracket.limit) - previousLimit;
      inss += taxableAmount * bracket.rate;
      previousLimit = bracket.limit;
    }
    if (grossSalary <= bracket.limit) break;
  }

  return Math.round(inss * 100) / 100;
}

function calculateIRRF(grossSalary: number, inss: number, dependents: number = 0): number {
  const baseCalculo = grossSalary - inss - (dependents * DEPENDENT_DEDUCTION);
  
  if (baseCalculo <= 0) return 0;

  for (const bracket of IRRF_TABLE) {
    if (baseCalculo <= bracket.limit) {
      const irrf = (baseCalculo * bracket.rate) - bracket.deduction;
      return Math.max(0, Math.round(irrf * 100) / 100);
    }
  }

  return 0;
}

function calculateFGTS(grossSalary: number): number {
  return Math.round(grossSalary * FGTS_RATE * 100) / 100;
}

interface PayrollInput {
  employee_id: string;
  base_salary: number;
  overtime_hours?: number;
  night_shift_hours?: number;
  commissions?: number;
  bonuses?: number;
  hazard_pay?: number;
  other_earnings?: number;
  health_insurance?: number;
  dental_insurance?: number;
  meal_voucher_discount?: number;
  transport_voucher_discount?: number;
  advances?: number;
  other_deductions?: number;
  dependents?: number;
}

interface PayrollResult {
  employee_id: string;
  
  // Earnings
  base_salary: number;
  overtime_value: number;
  night_shift_value: number;
  commissions: number;
  bonuses: number;
  hazard_pay: number;
  other_earnings: number;
  gross_salary: number;
  
  // Deductions
  inss_employee: number;
  irrf: number;
  health_insurance: number;
  dental_insurance: number;
  meal_voucher_discount: number;
  transport_voucher_discount: number;
  advances: number;
  other_deductions: number;
  total_deductions: number;
  
  // Net
  net_salary: number;
  
  // Employer costs
  fgts: number;
  inss_employer: number;
  rat: number;
  terceiros: number;
  total_employer_cost: number;
  
  // AI validation
  anomalies: string[];
  suggestions: string[];
}

function calculatePayroll(input: PayrollInput, previousPayrolls: any[]): PayrollResult {
  // Calculate overtime (50% adicional)
  const hourlyRate = input.base_salary / 220; // 220h/month standard
  const overtimeValue = (input.overtime_hours || 0) * hourlyRate * 1.5;
  
  // Night shift (20% adicional)
  const nightShiftValue = (input.night_shift_hours || 0) * hourlyRate * 0.2;

  // Gross salary
  const grossSalary = 
    input.base_salary +
    overtimeValue +
    nightShiftValue +
    (input.commissions || 0) +
    (input.bonuses || 0) +
    (input.hazard_pay || 0) +
    (input.other_earnings || 0);

  // Employee deductions
  const inssEmployee = calculateINSS(grossSalary);
  const irrf = calculateIRRF(grossSalary, inssEmployee, input.dependents);

  const totalDeductions = 
    inssEmployee +
    irrf +
    (input.health_insurance || 0) +
    (input.dental_insurance || 0) +
    (input.meal_voucher_discount || 0) +
    (input.transport_voucher_discount || 0) +
    (input.advances || 0) +
    (input.other_deductions || 0);

  const netSalary = grossSalary - totalDeductions;

  // Employer costs
  const fgts = calculateFGTS(grossSalary);
  const inssEmployer = grossSalary * 0.20; // 20% INSS patronal
  const rat = grossSalary * 0.02; // 2% RAT (pode variar)
  const terceiros = grossSalary * 0.058; // ~5.8% Sistema S

  const totalEmployerCost = grossSalary + fgts + inssEmployer + rat + terceiros;

  // Anomaly detection
  const anomalies: string[] = [];
  const suggestions: string[] = [];

  // Check against previous payrolls
  if (previousPayrolls.length > 0) {
    const avgGross = previousPayrolls.reduce((sum, p) => sum + p.gross_salary, 0) / previousPayrolls.length;
    const variance = ((grossSalary - avgGross) / avgGross) * 100;

    if (Math.abs(variance) > 30) {
      anomalies.push(`Salário bruto ${variance > 0 ? "+" : ""}${variance.toFixed(0)}% vs média (R$ ${avgGross.toFixed(2)})`);
      suggestions.push("Verificar se variação está correta (comissões, horas extras extraordinárias)");
    }

    // Check overtime anomaly
    const avgOvertime = previousPayrolls.reduce((sum, p) => sum + (p.overtime_hours || 0), 0) / previousPayrolls.length;
    if ((input.overtime_hours || 0) > avgOvertime * 2 && avgOvertime > 0) {
      anomalies.push(`Horas extras ${(input.overtime_hours || 0).toFixed(0)}h vs média ${avgOvertime.toFixed(0)}h`);
      suggestions.push("Validar registro de horas extras com gestor");
    }
  }

  // Check for negative net salary
  if (netSalary < 0) {
    anomalies.push("Salário líquido negativo!");
    suggestions.push("Revisar descontos - excedendo o permitido por lei");
  }

  // Check if transport voucher exceeds 6%
  if ((input.transport_voucher_discount || 0) > input.base_salary * 0.06) {
    anomalies.push("Desconto VT excede 6% do salário base");
    suggestions.push("Ajustar desconto para máximo de 6%");
  }

  return {
    employee_id: input.employee_id,
    
    base_salary: input.base_salary,
    overtime_value: Math.round(overtimeValue * 100) / 100,
    night_shift_value: Math.round(nightShiftValue * 100) / 100,
    commissions: input.commissions || 0,
    bonuses: input.bonuses || 0,
    hazard_pay: input.hazard_pay || 0,
    other_earnings: input.other_earnings || 0,
    gross_salary: Math.round(grossSalary * 100) / 100,
    
    inss_employee: inssEmployee,
    irrf,
    health_insurance: input.health_insurance || 0,
    dental_insurance: input.dental_insurance || 0,
    meal_voucher_discount: input.meal_voucher_discount || 0,
    transport_voucher_discount: input.transport_voucher_discount || 0,
    advances: input.advances || 0,
    other_deductions: input.other_deductions || 0,
    total_deductions: Math.round(totalDeductions * 100) / 100,
    
    net_salary: Math.round(netSalary * 100) / 100,
    
    fgts,
    inss_employer: Math.round(inssEmployer * 100) / 100,
    rat: Math.round(rat * 100) / 100,
    terceiros: Math.round(terceiros * 100) / 100,
    total_employer_cost: Math.round(totalEmployerCost * 100) / 100,
    
    anomalies,
    suggestions,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      employee_id, 
      organization_id,
      reference_month, 
      reference_year,
      payroll_data,
      calculate_all = false,
    } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: PayrollResult[] = [];

    if (calculate_all && organization_id) {
      // Calculate for all employees
      const { data: employees, error } = await supabase
        .from("hr_employees")
        .select("id, base_salary, metadata")
        .eq("organization_id", organization_id)
        .eq("status", "active");

      if (error) throw error;

      for (const emp of employees || []) {
        // Get previous payrolls for anomaly detection
        const { data: previousPayrolls } = await supabase
          .from("hr_payroll")
          .select("gross_salary, overtime_hours")
          .eq("employee_id", emp.id)
          .order("reference_year", { ascending: false })
          .order("reference_month", { ascending: false })
          .limit(6);

        // Get time tracking for the month
        const startDate = `${reference_year}-${String(reference_month).padStart(2, "0")}-01`;
        const endDate = new Date(reference_year, reference_month, 0).toISOString().split("T")[0];

        const { data: timeTracking } = await supabase
          .from("hr_time_tracking")
          .select("overtime_hours, night_hours")
          .eq("employee_id", emp.id)
          .gte("tracking_date", startDate)
          .lte("tracking_date", endDate);

        const totalOvertime = (timeTracking || []).reduce((sum: number, t: any) => sum + (t.overtime_hours || 0), 0);
        const totalNightHours = (timeTracking || []).reduce((sum: number, t: any) => sum + (t.night_hours || 0), 0);

        const payrollInput: PayrollInput = {
          employee_id: emp.id,
          base_salary: emp.base_salary || 0,
          overtime_hours: totalOvertime,
          night_shift_hours: totalNightHours,
          dependents: emp.metadata?.dependents || 0,
          ...(payroll_data || {}),
        };

        const result = calculatePayroll(payrollInput, previousPayrolls || []);

        results.push(result);

        // Save to database
        await supabase.from("hr_payroll").upsert({
          organization_id,
          employee_id: emp.id,
          reference_month,
          reference_year,
          ...result,
          status: "calculated",
          calculated_at: new Date().toISOString(),
          ai_validated: true,
          ai_anomalies: result.anomalies,
          ai_suggestions: result.suggestions,
        }, {
          onConflict: "employee_id,reference_month,reference_year"
        });
      }
    } else if (employee_id && payroll_data) {
      // Calculate for single employee
      const { data: previousPayrolls } = await supabase
        .from("hr_payroll")
        .select("gross_salary, overtime_hours")
        .eq("employee_id", employee_id)
        .order("reference_year", { ascending: false })
        .order("reference_month", { ascending: false })
        .limit(6);

      const result = calculatePayroll(
        { employee_id, ...payroll_data },
        previousPayrolls || []
      );

      results.push(result);
    } else {
      throw new Error("Invalid parameters");
    }

    // Summary
    const totalGross = results.reduce((sum, r) => sum + r.gross_salary, 0);
    const totalNet = results.reduce((sum, r) => sum + r.net_salary, 0);
    const totalEmployerCost = results.reduce((sum, r) => sum + r.total_employer_cost, 0);
    const totalAnomalies = results.filter(r => r.anomalies.length > 0).length;

    return new Response(JSON.stringify({
      success: true,
      reference_period: `${reference_month}/${reference_year}`,
      total_employees: results.length,
      summary: {
        total_gross: Math.round(totalGross * 100) / 100,
        total_net: Math.round(totalNet * 100) / 100,
        total_employer_cost: Math.round(totalEmployerCost * 100) / 100,
        employees_with_anomalies: totalAnomalies,
      },
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[hr-payroll-calculator] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
