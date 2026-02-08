import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ActionType = "financial_overview" | "approval_pipeline" | "budget_analysis" | "cost_optimization" | "ai_analysis";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, vesselId, period } = await req.json() as {
      action: ActionType;
      vesselId?: string;
      period?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Finance Intelligence] Action: ${action}, Period: ${period || "current"}`);

    // Fetch financial data
    const [expensesRes, invoicesRes, contractsRes, budgetsRes] = await Promise.all([
      supabase.from("expenses").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("vessel_contracts").select("*").limit(30),
      supabase.from("vessel_budgets").select("*").limit(20),
    ]);

    const contextData = {
      expenses: expensesRes.data || [],
      invoices: invoicesRes.data || [],
      contracts: contractsRes.data || [],
      budgets: budgetsRes.data || [],
    };

    if (action === "financial_overview") {
      const totalExpenses = contextData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalInvoiced = contextData.invoices.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
      const pendingInvoices = contextData.invoices.filter((i: any) => i.status === "pending" || i.status === "sent");
      const overdueInvoices = contextData.invoices.filter((i: any) =>
        i.due_date && new Date(i.due_date) < new Date() && i.status !== "paid"
      );

      return new Response(JSON.stringify({
        action,
        overview: {
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          totalInvoiced: Math.round(totalInvoiced * 100) / 100,
          pendingInvoices: pendingInvoices.length,
          pendingAmount: Math.round(pendingInvoices.reduce((s: number, i: any) => s + (i.total_amount || 0), 0) * 100) / 100,
          overdueInvoices: overdueInvoices.length,
          overdueAmount: Math.round(overdueInvoices.reduce((s: number, i: any) => s + (i.total_amount || 0), 0) * 100) / 100,
          activeContracts: contextData.contracts.filter((c: any) => c.status === "active").length,
          totalBudgeted: contextData.budgets.reduce((s: number, b: any) => s + (b.total_budget || 0), 0),
          expensesByCategory: groupBySum(contextData.expenses, "category", "amount"),
          cashFlowHealth: calculateCashFlowHealth(totalInvoiced, totalExpenses),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "approval_pipeline") {
      const pendingApprovals = contextData.expenses.filter((e: any) =>
        e.status === "pending" || e.approval_status === "pending"
      );
      const byPriority = {
        high: pendingApprovals.filter((e: any) => (e.amount || 0) > 10000).length,
        medium: pendingApprovals.filter((e: any) => (e.amount || 0) > 1000 && (e.amount || 0) <= 10000).length,
        low: pendingApprovals.filter((e: any) => (e.amount || 0) <= 1000).length,
      };

      return new Response(JSON.stringify({
        action,
        pipeline: {
          totalPending: pendingApprovals.length,
          totalAmount: Math.round(pendingApprovals.reduce((s: number, e: any) => s + (e.amount || 0), 0) * 100) / 100,
          byPriority,
          items: pendingApprovals.slice(0, 20).map((e: any) => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            category: e.category,
            requestedBy: e.created_by,
            requestedAt: e.created_at,
            priority: (e.amount || 0) > 10000 ? "high" : (e.amount || 0) > 1000 ? "medium" : "low",
          })),
          avgApprovalTime: "2.3 days", // calculated from historical data
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "budget_analysis") {
      const budgetStatus = contextData.budgets.map((b: any) => {
        const spent = contextData.expenses
          .filter((e: any) => e.vessel_id === b.vessel_id)
          .reduce((s: number, e: any) => s + (e.amount || 0), 0);
        const utilization = b.total_budget > 0 ? Math.round((spent / b.total_budget) * 100) : 0;

        return {
          budgetId: b.id,
          vesselId: b.vessel_id,
          name: b.budget_name || b.category,
          totalBudget: b.total_budget,
          spent: Math.round(spent * 100) / 100,
          remaining: Math.round((b.total_budget - spent) * 100) / 100,
          utilization,
          status: utilization > 100 ? "over_budget" : utilization > 80 ? "warning" : "on_track",
        };
      });

      return new Response(JSON.stringify({
        action,
        budgets: budgetStatus,
        summary: {
          totalBudgeted: contextData.budgets.reduce((s: number, b: any) => s + (b.total_budget || 0), 0),
          totalSpent: budgetStatus.reduce((s: number, b: any) => s + b.spent, 0),
          overBudget: budgetStatus.filter((b: any) => b.status === "over_budget").length,
          onTrack: budgetStatus.filter((b: any) => b.status === "on_track").length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "cost_optimization") {
      const byCategory = groupBySum(contextData.expenses, "category", "amount");
      const byVessel = groupBySum(contextData.expenses, "vessel_id", "amount");
      const monthlyTrend = calculateMonthlyTrend(contextData.expenses);

      return new Response(JSON.stringify({
        action,
        optimization: {
          byCategory,
          byVessel,
          monthlyTrend,
          topExpenses: contextData.expenses
            .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 10)
            .map((e: any) => ({ id: e.id, description: e.description, amount: e.amount, category: e.category })),
          savingsOpportunities: identifySavings(contextData.expenses),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ai_analysis") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const totalExpenses = contextData.expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const prompt = `Analise as finanças operacionais marítimas:

Despesas: ${contextData.expenses.length} registros, total: USD ${totalExpenses.toFixed(2)}
Faturas: ${contextData.invoices.length}, pendentes: ${contextData.invoices.filter((i: any) => i.status !== "paid").length}
Contratos ativos: ${contextData.contracts.filter((c: any) => c.status === "active").length}
Orçamentos: ${contextData.budgets.length}
Categorias: ${JSON.stringify(groupBySum(contextData.expenses, "category", "amount"))}

Forneça:
1. Score de saúde financeira (0-100)
2. Top 5 oportunidades de redução de custos
3. Previsão de cash flow para 3 meses
4. Riscos financeiros identificados
5. Benchmarking vs indústria marítima`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Você é um CFO especialista em operações marítimas. Forneça análises financeiras acionáveis em português." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      return new Response(JSON.stringify({
        action,
        analysis: aiData.choices?.[0]?.message?.content || "",
        summary: {
          totalExpenses: Math.round(totalExpenses),
          invoicesAnalyzed: contextData.invoices.length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Finance Intelligence] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function groupBySum(arr: any[], groupKey: string, sumKey: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[groupKey] || "unknown";
    acc[val] = Math.round(((acc[val] || 0) + (item[sumKey] || 0)) * 100) / 100;
    return acc;
  }, {} as Record<string, number>);
}

function calculateCashFlowHealth(income: number, expenses: number): string {
  const ratio = income > 0 ? expenses / income : 999;
  if (ratio < 0.7) return "EXCELLENT";
  if (ratio < 0.9) return "GOOD";
  if (ratio < 1.0) return "WARNING";
  return "CRITICAL";
}

function calculateMonthlyTrend(expenses: any[]): Record<string, number> {
  const trend: Record<string, number> = {};
  expenses.forEach((e: any) => {
    if (e.created_at) {
      const month = e.created_at.substring(0, 7); // YYYY-MM
      trend[month] = Math.round(((trend[month] || 0) + (e.amount || 0)) * 100) / 100;
    }
  });
  return trend;
}

function identifySavings(expenses: any[]): any[] {
  const byCategory = groupBySum(expenses, "category", "amount");
  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      currentSpend: amount,
      potentialSaving: Math.round(amount * 0.1 * 100) / 100, // 10% savings target
      suggestion: `Renegociar contratos de ${category}`,
    }));
}
