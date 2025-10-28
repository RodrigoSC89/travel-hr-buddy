import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Represents a financial transaction in the system
 */
export interface FinancialTransaction {
  id: string;
  transaction_type: "income" | "expense" | "transfer" | "adjustment";
  category_id?: string;
  amount: number;
  currency: string;
  description?: string;
  transaction_date: string;
  payment_method?: string;
  vendor_supplier?: string;
  status: string;
  created_at: string;
}

/**
 * Represents a budget category for organizing transactions
 */
export interface BudgetCategory {
  id: string;
  name: string;
  category_type: "income" | "expense" | "both";
  description?: string;
  budget_allocated?: number;
  budget_period?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
}

/**
 * Represents an invoice document
 */
export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: "sales" | "purchase" | "expense" | "credit_note" | "debit_note";
  status: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  vendor_supplier?: string;
  customer_name?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
}

/**
 * Summary of financial data including totals and counts
 */
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoices: number;
  overdueInvoices: number;
  transactionCount: number;
}

/**
 * Custom hook for managing financial data from Supabase
 * Fetches transactions, categories, invoices, and calculates financial summaries
 * 
 * @returns {Object} Financial data and methods
 * @returns {FinancialTransaction[]} transactions - List of financial transactions
 * @returns {BudgetCategory[]} categories - List of budget categories
 * @returns {Invoice[]} invoices - List of invoices
 * @returns {FinancialSummary | null} summary - Financial summary data
 * @returns {boolean} loading - Loading state
 * @returns {string | null} error - Error message if any
 * @returns {Function} refreshData - Function to refresh all data
 * @returns {Function} createTransaction - Function to create a new transaction
 * @returns {Function} updateTransaction - Function to update a transaction
 * @returns {Function} createInvoice - Function to create a new invoice
 * @returns {Function} updateInvoice - Function to update an invoice
 * 
 * @example
 * const { summary, transactions, loading } = useFinanceData();
 * if (!loading) {
 *   console.log('Net Profit:', summary?.netProfit);
 * }
 */
export const useFinanceData = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all financial data from Supabase including transactions, categories, and invoices
   * @private
   */
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .limit(100);

      if (transactionsError) throw transactionsError;
      setTransactions((transactionsData as any[]) || []);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("budget_categories" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (categoriesError) throw categoriesError;
      setCategories((categoriesData as any[]) || []);

      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices" as any)
        .select("*")
        .order("issue_date", { ascending: false })
        .limit(50);

      if (invoicesError) throw invoicesError;
      setInvoices((invoicesData as any[]) || []);

      // Calculate summary
      calculateSummary((transactionsData as any[]) || [], (invoicesData as any[]) || []);

    } catch (err: any) {
      console.error("Error loading financial data:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load financial data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate financial summary from transactions and invoices data
   * @param {FinancialTransaction[]} transactionsData - Array of transactions
   * @param {Invoice[]} invoicesData - Array of invoices
   * @private
   */
  const calculateSummary = (
    transactionsData: FinancialTransaction[],
    invoicesData: Invoice[]
  ) => {
    const totalIncome = transactionsData
      .filter(t => t.transaction_type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactionsData
      .filter(t => t.transaction_type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingInvoices = invoicesData.filter(
      i => i.status === "pending" || i.status === "sent"
    ).length;

    const overdueInvoices = invoicesData.filter(
      i => i.status === "overdue"
    ).length;

    setSummary({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      pendingInvoices,
      overdueInvoices,
      transactionCount: transactionsData.length
    });
  };

  /**
   * Create a new financial transaction
   * @param {Partial<FinancialTransaction>} transaction - Transaction data
   * @returns {Promise<FinancialTransaction>} Created transaction
   * @throws {Error} If transaction creation fails
   */
  const createTransaction = async (transaction: Partial<FinancialTransaction>) => {
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert([transaction as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction created successfully"
      });

      await loadFinancialData();
      return data;
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
      throw err;
    }
  };

  /**
   * Update an existing financial transaction
   * @param {string} id - Transaction ID
   * @param {Partial<FinancialTransaction>} updates - Fields to update
   * @returns {Promise<FinancialTransaction>} Updated transaction
   * @throws {Error} If transaction update fails
   */
  const updateTransaction = async (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction updated successfully"
      });

      await loadFinancialData();
      return data;
    } catch (err: any) {
      console.error("Error updating transaction:", err);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
      throw err;
    }
  };

  /**
   * Create a new invoice
   * @param {Partial<Invoice>} invoice - Invoice data
   * @returns {Promise<Invoice>} Created invoice
   * @throws {Error} If invoice creation fails
   */
  const createInvoice = async (invoice: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from("invoices" as any)
        .insert([invoice as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice created successfully"
      });

      await loadFinancialData();
      return data;
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
      throw err;
    }
  };

  /**
   * Update an existing invoice
   * @param {string} id - Invoice ID
   * @param {Partial<Invoice>} updates - Fields to update
   * @returns {Promise<Invoice>} Updated invoice
   * @throws {Error} If invoice update fails
   */
  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from("invoices" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice updated successfully"
      });

      await loadFinancialData();
      return data;
    } catch (err: any) {
      console.error("Error updating invoice:", err);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadFinancialData();
  }, []);

  return {
    transactions,
    categories,
    invoices,
    summary,
    loading,
    error,
    refreshData: loadFinancialData,
    createTransaction,
    updateTransaction,
    createInvoice,
    updateInvoice
  };
};
