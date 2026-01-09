/**
 * HR Turnover Prediction AI
 * Analyzes employee data to predict turnover risk
 * Uses ML factors: salary, tenure, performance, engagement
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TurnoverFactors {
  salary_factor: number;
  tenure_factor: number;
  performance_factor: number;
  engagement_factor: number;
  manager_factor: number;
  workload_factor: number;
  growth_factor: number;
}

interface PredictionResult {
  employee_id: string;
  employee_name: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  factors: TurnoverFactors;
  top_risk_factors: string[];
  recommended_actions: string[];
  predicted_departure_window: string;
}

// Market salary benchmarks by position (simplified)
const MARKET_SALARIES: Record<string, number> = {
  "Analista": 5500,
  "Coordenador": 9000,
  "Gerente": 14000,
  "Diretor": 25000,
  "Desenvolvedor": 8000,
  "Designer": 6000,
  "Engenheiro": 12000,
  default: 5000,
};

function calculateTurnoverRisk(
  employee: any,
  reviews: any[],
  timeTracking: any[],
  vacations: any[]
): PredictionResult {
  const factors: TurnoverFactors = {
    salary_factor: 0,
    tenure_factor: 0,
    performance_factor: 0,
    engagement_factor: 0,
    manager_factor: 0,
    workload_factor: 0,
    growth_factor: 0,
  };

  const topRiskFactors: string[] = [];
  const recommendedActions: string[] = [];

  // 1. SALARY FACTOR (0-100)
  const positionKey = Object.keys(MARKET_SALARIES).find(k => 
    employee.position?.toLowerCase().includes(k.toLowerCase())
  ) || "default";
  const marketSalary = MARKET_SALARIES[positionKey];
  const salaryDiff = ((marketSalary - (employee.base_salary || 0)) / marketSalary) * 100;
  
  if (salaryDiff > 20) {
    factors.salary_factor = 90;
    topRiskFactors.push(`Salário ${salaryDiff.toFixed(0)}% abaixo do mercado`);
    recommendedActions.push(`Revisar salário (sugestão: +${Math.min(salaryDiff, 30).toFixed(0)}%)`);
  } else if (salaryDiff > 10) {
    factors.salary_factor = 60;
    topRiskFactors.push(`Salário ${salaryDiff.toFixed(0)}% abaixo do mercado`);
  } else if (salaryDiff > 0) {
    factors.salary_factor = 30;
  } else {
    factors.salary_factor = 10;
  }

  // 2. TENURE FACTOR (0-100) - Risk is higher for 1-3 years
  const hireDate = new Date(employee.hire_date);
  const tenureMonths = Math.floor((Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (tenureMonths >= 12 && tenureMonths <= 36) {
    factors.tenure_factor = 70; // Peak turnover period
    topRiskFactors.push("Período crítico de turnover (1-3 anos)");
    recommendedActions.push("Conversa sobre plano de carreira");
  } else if (tenureMonths < 12) {
    factors.tenure_factor = 50;
  } else if (tenureMonths > 60) {
    factors.tenure_factor = 20;
  } else {
    factors.tenure_factor = 40;
  }

  // 3. PERFORMANCE FACTOR (0-100)
  const recentReview = reviews[0];
  if (recentReview) {
    const overallScore = recentReview.overall_score || 3;
    if (overallScore >= 4.5) {
      factors.performance_factor = 60; // High performers are at risk of leaving
      topRiskFactors.push("Alto desempenho - risco de ofertas externas");
      recommendedActions.push("Programa de retenção de talentos");
    } else if (overallScore >= 3.5) {
      factors.performance_factor = 30;
    } else {
      factors.performance_factor = 50;
      topRiskFactors.push("Baixo desempenho - possível desmotivação");
      recommendedActions.push("PDI urgente com acompanhamento");
    }
  } else {
    factors.performance_factor = 50;
    recommendedActions.push("Agendar avaliação de desempenho");
  }

  // 4. ENGAGEMENT FACTOR (0-100) - Based on vacation usage
  const pendingVacations = vacations.filter(v => v.status === "pending");
  const expiredVacations = pendingVacations.filter(v => {
    const expiry = new Date(v.acquisition_end);
    const daysToExpiry = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry < 60;
  });

  if (expiredVacations.length > 0) {
    factors.engagement_factor = 70;
    topRiskFactors.push("Férias próximas de vencer - possível burnout");
    recommendedActions.push("Incentivar uso de férias imediato");
  } else {
    factors.engagement_factor = 30;
  }

  // 5. WORKLOAD FACTOR (0-100) - Based on overtime
  const recentTimeTracking = timeTracking.slice(0, 30);
  const totalOvertime = recentTimeTracking.reduce((sum, t) => sum + (t.overtime_hours || 0), 0);
  
  if (totalOvertime > 40) {
    factors.workload_factor = 80;
    topRiskFactors.push(`${totalOvertime.toFixed(0)}h extras no mês - sobrecarga`);
    recommendedActions.push("Redistribuir demandas da equipe");
  } else if (totalOvertime > 20) {
    factors.workload_factor = 50;
  } else {
    factors.workload_factor = 20;
  }

  // 6. GROWTH FACTOR (0-100)
  // Check if employee had promotions (simplified - check for salary increases)
  if (tenureMonths > 24 && !employee.metadata?.last_promotion) {
    factors.growth_factor = 75;
    topRiskFactors.push("Sem promoção nos últimos 2 anos");
    recommendedActions.push("Avaliar para promoção/mudança de cargo");
  } else {
    factors.growth_factor = 25;
  }

  // 7. MANAGER FACTOR (placeholder - would need manager data)
  factors.manager_factor = 40; // Default moderate

  // Calculate overall risk score (weighted average)
  const weights = {
    salary: 0.25,
    tenure: 0.10,
    performance: 0.15,
    engagement: 0.15,
    manager: 0.15,
    workload: 0.10,
    growth: 0.10,
  };

  const riskScore = 
    factors.salary_factor * weights.salary +
    factors.tenure_factor * weights.tenure +
    factors.performance_factor * weights.performance +
    factors.engagement_factor * weights.engagement +
    factors.manager_factor * weights.manager +
    factors.workload_factor * weights.workload +
    factors.growth_factor * weights.growth;

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical";
  let departureWindow: string;

  if (riskScore >= 80) {
    riskLevel = "critical";
    departureWindow = "30-60 dias";
  } else if (riskScore >= 60) {
    riskLevel = "high";
    departureWindow = "60-90 dias";
  } else if (riskScore >= 40) {
    riskLevel = "medium";
    departureWindow = "3-6 meses";
  } else {
    riskLevel = "low";
    departureWindow = "improvável";
  }

  return {
    employee_id: employee.id,
    employee_name: employee.full_name,
    risk_score: Math.round(riskScore * 100) / 100,
    risk_level: riskLevel,
    factors,
    top_risk_factors: topRiskFactors.slice(0, 3),
    recommended_actions: recommendedActions.slice(0, 3),
    predicted_departure_window: departureWindow,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_id, organization_id, analyze_all = false } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let employees: any[] = [];

    if (analyze_all && organization_id) {
      // Analyze all employees in organization
      const { data, error } = await supabase
        .from("hr_employees")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("status", "active");

      if (error) throw error;
      employees = data || [];
    } else if (employee_id) {
      // Analyze single employee
      const { data, error } = await supabase
        .from("hr_employees")
        .select("*")
        .eq("id", employee_id)
        .single();

      if (error) throw error;
      if (data) employees = [data];
    } else {
      throw new Error("Either employee_id or organization_id with analyze_all is required");
    }

    const predictions: PredictionResult[] = [];

    for (const employee of employees) {
      // Fetch related data
      const [reviewsResult, timeTrackingResult, vacationsResult] = await Promise.all([
        supabase
          .from("hr_performance_reviews")
          .select("*")
          .eq("employee_id", employee.id)
          .order("period_end", { ascending: false })
          .limit(3),
        supabase
          .from("hr_time_tracking")
          .select("*")
          .eq("employee_id", employee.id)
          .order("tracking_date", { ascending: false })
          .limit(30),
        supabase
          .from("hr_vacations")
          .select("*")
          .eq("employee_id", employee.id)
          .order("acquisition_end", { ascending: false })
          .limit(5),
      ]);

      const prediction = calculateTurnoverRisk(
        employee,
        reviewsResult.data || [],
        timeTrackingResult.data || [],
        vacationsResult.data || []
      );

      predictions.push(prediction);

      // Save prediction to database
      await supabase.from("hr_turnover_predictions").insert({
        organization_id: employee.organization_id,
        employee_id: employee.id,
        prediction_date: new Date().toISOString().split("T")[0],
        risk_score: prediction.risk_score,
        risk_level: prediction.risk_level,
        salary_factor: prediction.factors.salary_factor,
        tenure_factor: prediction.factors.tenure_factor,
        performance_factor: prediction.factors.performance_factor,
        engagement_factor: prediction.factors.engagement_factor,
        manager_factor: prediction.factors.manager_factor,
        workload_factor: prediction.factors.workload_factor,
        growth_factor: prediction.factors.growth_factor,
        top_risk_factors: prediction.top_risk_factors,
        recommended_actions: prediction.recommended_actions,
        predicted_departure_window: prediction.predicted_departure_window,
        model_version: "1.0.0",
      });

      // Update employee with risk score
      await supabase.from("hr_employees").update({
        turnover_risk_score: prediction.risk_score,
        turnover_risk_factors: {
          factors: prediction.factors,
          top_factors: prediction.top_risk_factors,
        },
        last_ai_analysis: new Date().toISOString(),
      }).eq("id", employee.id);
    }

    // Sort by risk score descending
    predictions.sort((a, b) => b.risk_score - a.risk_score);

    return new Response(JSON.stringify({
      success: true,
      total_analyzed: predictions.length,
      critical_count: predictions.filter(p => p.risk_level === "critical").length,
      high_count: predictions.filter(p => p.risk_level === "high").length,
      predictions,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[hr-turnover-prediction] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
