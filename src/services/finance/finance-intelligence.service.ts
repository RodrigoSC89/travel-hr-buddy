/**
 * Finance Intelligence Service
 * Service layer for financial overview, approvals, budgets, and cost optimization
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type FinanceAction = "financial_overview" | "approval_pipeline" | "budget_analysis" | "cost_optimization" | "ai_analysis";

export interface FinancialOverview {
  totalExpenses: number;
  totalInvoiced: number;
  pendingInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  activeContracts: number;
  totalBudgeted: number;
  expensesByCategory: Record<string, number>;
  cashFlowHealth: string;
}

export interface ApprovalPipeline {
  totalPending: number;
  totalAmount: number;
  byPriority: { high: number; medium: number; low: number };
  items: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    requestedBy: string;
    requestedAt: string;
    priority: string;
  }>;
  avgApprovalTime: string;
}

export interface BudgetAnalysis {
  budgetId: string;
  vesselId: string;
  name: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: string;
}

export class FinanceIntelligenceService {
  async getFinancialOverview(): Promise<FinancialOverview> {
    try {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "financial_overview" },
      });
      if (error) throw error;
      return data.overview;
    } catch (error) {
      logger.error("Error fetching financial overview", error as Error);
      throw error;
    }
  }

  async getApprovalPipeline(): Promise<ApprovalPipeline> {
    try {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "approval_pipeline" },
      });
      if (error) throw error;
      return data.pipeline;
    } catch (error) {
      logger.error("Error fetching approval pipeline", error as Error);
      throw error;
    }
  }

  async getBudgetAnalysis(): Promise<{ budgets: BudgetAnalysis[]; summary: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "budget_analysis" },
      });
      if (error) throw error;
      return { budgets: data.budgets, summary: data.summary };
    } catch (error) {
      logger.error("Error fetching budget analysis", error as Error);
      throw error;
    }
  }

  async getCostOptimization(): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "cost_optimization" },
      });
      if (error) throw error;
      return data.optimization;
    } catch (error) {
      logger.error("Error fetching cost optimization", error as Error);
      throw error;
    }
  }

  async runAIAnalysis(): Promise<{ analysis: string; summary: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("finance-intelligence", {
        body: { action: "ai_analysis" },
      });
      if (error) throw error;
      return { analysis: data.analysis, summary: data.summary };
    } catch (error) {
      logger.error("Error running finance AI analysis", error as Error);
      throw error;
    }
  }
}

export const financeIntelligenceService = new FinanceIntelligenceService();
