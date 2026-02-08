/**
 * React Query hook for Finance Intelligence
 * Uses real Supabase tables: invoices, budgets
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FinanceInvoice {
  id: string;
  invoice_number: string | null;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  due_at: string | null;
  paid_at: string | null;
  vessel_id: string | null;
}

export interface BudgetRecord {
  id: string;
  category: string;
  year: number;
  allocated_amount: number;
  spent_amount: number | null;
  committed_amount: number | null;
  forecast_amount: number | null;
  vessel_id: string | null;
  utilization: number;
  status: string;
}

export function useFinanceInvoices() {
  return useQuery({
    queryKey: ["finance-invoices"],
    queryFn: async (): Promise<FinanceInvoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        total_amount: inv.total_amount,
        subtotal: inv.subtotal,
        tax_amount: inv.tax_amount,
        currency: inv.currency,
        status: inv.status,
        notes: inv.notes,
        created_at: inv.created_at,
        due_at: inv.due_at,
        paid_at: inv.paid_at,
        vessel_id: inv.vessel_id,
      }));
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useFinanceBudgets() {
  return useQuery({
    queryKey: ["finance-budgets"],
    queryFn: async (): Promise<BudgetRecord[]> => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("year", { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []).map(b => {
        const allocated = b.allocated_amount || 0;
        const spent = b.spent_amount || 0;
        return {
          id: b.id,
          category: b.category,
          year: b.year,
          allocated_amount: allocated,
          spent_amount: spent,
          committed_amount: b.committed_amount,
          forecast_amount: b.forecast_amount,
          vessel_id: b.vessel_id,
          utilization: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
          status: spent > allocated ? "over_budget" : spent > allocated * 0.9 ? "warning" : "on_track",
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useFinanceApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => {
      const newStatus = action === "approve" ? "approved" as const : "pending_approval" as const;
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      return { id, action };
    },
    onSuccess: ({ action }) => {
      toast.success(action === "approve" ? "Fatura aprovada" : "Fatura pendente");
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
    },
    onError: () => toast.error("Erro ao processar aprovação"),
  });
}

export function useFinanceAIAnalysis() {
  return useMutation({
    mutationFn: async (context: { summary: string }) => {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "ai_analysis", context: context.summary },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("Análise financeira AI concluída"),
    onError: () => toast.error("Erro ao gerar análise financeira"),
  });
}

export function useFinanceStats() {
  const invoicesQuery = useFinanceInvoices();
  const budgetsQuery = useFinanceBudgets();

  const invoices = invoicesQuery.data || [];
  const budgets = budgetsQuery.data || [];

  const pending = invoices.filter(i => i.status === "pending_approval" || i.status === "draft");
  const totalPending = pending.reduce((sum, i) => sum + i.total_amount, 0);
  const totalApproved = invoices.filter(i => i.status === "approved" || i.status === "paid")
    .reduce((sum, i) => sum + i.total_amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue");
  const totalOverdue = overdue.reduce((sum, i) => sum + i.total_amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);

  return {
    invoices,
    budgets,
    stats: {
      pendingCount: pending.length,
      totalPending,
      totalApproved,
      overdueCount: overdue.length,
      totalOverdue,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      totalInvoices: invoices.length,
    },
    isLoading: invoicesQuery.isLoading || budgetsQuery.isLoading,
    refetch: () => {
      invoicesQuery.refetch();
      budgetsQuery.refetch();
    },
  };
}
