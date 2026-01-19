import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'create_budget': {
        const { 
          name,
          vessel_id,
          period_start,
          period_end,
          categories, // [{ name, amount, type }]
          total_amount,
          currency
        } = params;

        if (!name || !period_start || !total_amount) {
          return errorResponse('name, period_start, and total_amount are required', 400);
        }

        const { data: budget, error } = await supabase
          .from('budgets')
          .insert({
            name,
            vessel_id,
            period_start,
            period_end,
            categories: categories || [],
            total_amount,
            currency: currency || 'USD',
            status: 'draft',
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, budget });
      }

      case 'get_budget_status': {
        const { budget_id, vessel_id, period } = params;

        let budgetQuery = supabase.from('budgets').select('*');
        if (budget_id) budgetQuery = budgetQuery.eq('id', budget_id);
        if (vessel_id) budgetQuery = budgetQuery.eq('vessel_id', vessel_id);

        const { data: budgets, error: budgetError } = await budgetQuery;
        if (budgetError) throw budgetError;

        // Get actual expenses
        const budgetIds = budgets?.map((b: { id: string }) => b.id) || [];
        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .in('budget_id', budgetIds);

        const budgetStatus = budgets?.map((budget: any) => {
          const budgetExpenses = expenses?.filter((e: any) => e.budget_id === budget.id) || [];
          const totalSpent = budgetExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
          const remaining = (budget.total_amount || 0) - totalSpent;
          const utilizationPercent = budget.total_amount ? (totalSpent / budget.total_amount) * 100 : 0;

          // Category breakdown
          const categorySpending = (budget.categories || []).map((cat: any) => {
            const catExpenses = budgetExpenses.filter((e: any) => e.category === cat.name);
            const catSpent = catExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
            return {
              ...cat,
              spent: catSpent,
              remaining: (cat.amount || 0) - catSpent,
              utilization_percent: cat.amount ? (catSpent / cat.amount) * 100 : 0
            };
          });

          return {
            ...budget,
            total_spent: totalSpent,
            remaining,
            utilization_percent: utilizationPercent,
            is_over_budget: remaining < 0,
            category_breakdown: categorySpending
          };
        });

        return jsonResponse({ success: true, budgets: budgetStatus });
      }

      case 'forecast_spending': {
        const { budget_id } = params;

        const { data: budget, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', budget_id)
          .single();

        if (error || !budget) {
          return errorResponse('Budget not found', 404);
        }

        // Get historical spending
        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .eq('budget_id', budget_id)
          .order('date', { ascending: true });

        const totalSpent = expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
        const daysElapsed = Math.ceil((Date.now() - new Date(budget.period_start).getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((new Date(budget.period_end).getTime() - new Date(budget.period_start).getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = totalDays - daysElapsed;

        const dailyRate = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
        const projectedTotal = totalSpent + (dailyRate * daysRemaining);

        return jsonResponse({
          success: true,
          forecast: {
            budget_id,
            budget_amount: budget.total_amount,
            current_spent: totalSpent,
            daily_burn_rate: dailyRate,
            days_elapsed: daysElapsed,
            days_remaining: daysRemaining,
            projected_total: projectedTotal,
            projected_variance: budget.total_amount - projectedTotal,
            will_exceed_budget: projectedTotal > budget.total_amount
          }
        });
      }

      default:
        return errorResponse('Invalid action. Use: create_budget, get_budget_status, forecast_spending', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'budget-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
