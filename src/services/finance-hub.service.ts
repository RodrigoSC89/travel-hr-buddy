/**
 * PATCH 384: Finance Hub - CRUD + Reports Service
 * Complete financial management with transactions, budgets, and reporting
 * PATCH 881: Removed @ts-nocheck - Uses in-memory store for tables not in schema
 */

import { logger } from "@/lib/logger";

export interface Transaction {
  id: string;
  transaction_id: string;
  type: "income" | "expense" | "transfer";
  category_id?: string | null;
  category_name?: string | null;
  amount: number;
  currency: string;
  description?: string | null;
  date: string;
  payment_method?: string | null;
  reference_number?: string | null;
  vendor?: string | null;
  project_id?: string | null;
  department?: string | null;
  status: "pending" | "completed" | "cancelled";
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  parent_category_id?: string | null;
  color?: string | null;
  icon?: string | null;
  budget_limit?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  name: string;
  category_id?: string | null;
  amount: number;
  spent: number;
  remaining: number;
  period: "monthly" | "quarterly" | "yearly" | "custom";
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "exceeded";
  alert_threshold?: number | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceReport {
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  transactions_count: number;
  by_category: CategorySummary[];
  by_month: MonthSummary[];
  top_expenses: Transaction[];
  budget_utilization: BudgetUtilization[];
  generated_at: string;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface MonthSummary {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface BudgetUtilization {
  budget_id: string;
  budget_name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization_percentage: number;
  status: string;
}

interface TransactionFilters {
  type?: string[];
  category_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string[];
  department?: string;
}

interface BudgetFilters {
  category_id?: string;
  period?: string;
  status?: string[];
}

// In-memory store (since finance_transactions table is not in generated schema)
const transactionStore: Map<string, Transaction> = new Map();
const categoryStore: Map<string, Category> = new Map();
const budgetStore: Map<string, Budget> = new Map();

// Initialize with sample categories
const sampleCategories: Category[] = [
  { id: "cat-1", name: "Salaries", type: "expense", is_active: true, created_at: new Date().toISOString() },
  { id: "cat-2", name: "Fuel", type: "expense", is_active: true, created_at: new Date().toISOString() },
  { id: "cat-3", name: "Maintenance", type: "expense", is_active: true, created_at: new Date().toISOString() },
  { id: "cat-4", name: "Charter Revenue", type: "income", is_active: true, created_at: new Date().toISOString() },
];

sampleCategories.forEach(c => categoryStore.set(c.id, c));

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export class FinanceHubService {
  // Transaction CRUD
  static async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    let transactions = Array.from(transactionStore.values());

    if (filters?.type?.length) {
      transactions = transactions.filter(t => filters.type!.includes(t.type));
    }
    if (filters?.category_id) {
      transactions = transactions.filter(t => t.category_id === filters.category_id);
    }
    if (filters?.start_date) {
      transactions = transactions.filter(t => t.date >= filters.start_date!);
    }
    if (filters?.end_date) {
      transactions = transactions.filter(t => t.date <= filters.end_date!);
    }
    if (filters?.status?.length) {
      transactions = transactions.filter(t => filters.status!.includes(t.status));
    }
    if (filters?.department) {
      transactions = transactions.filter(t => t.department === filters.department);
    }

    // Add category names
    return transactions.map(t => ({
      ...t,
      category_name: t.category_id ? categoryStore.get(t.category_id)?.name : null,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getTransaction(id: string): Promise<Transaction | null> {
    const txn = transactionStore.get(id);
    if (!txn) return null;
    return {
      ...txn,
      category_name: txn.category_id ? categoryStore.get(txn.category_id)?.name : null,
    };
  }

  static async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const id = generateId();
    const transactionId = `txn_${id}`;
    const now = new Date().toISOString();

    const newTransaction: Transaction = {
      id,
      transaction_id: transactionId,
      type: transaction.type || "expense",
      category_id: transaction.category_id,
      category_name: transaction.category_id ? categoryStore.get(transaction.category_id)?.name : null,
      amount: transaction.amount || 0,
      currency: transaction.currency || "USD",
      description: transaction.description,
      date: transaction.date || now,
      payment_method: transaction.payment_method,
      reference_number: transaction.reference_number,
      vendor: transaction.vendor,
      project_id: transaction.project_id,
      department: transaction.department,
      status: transaction.status || "completed",
      created_by: transaction.created_by,
      created_at: now,
      updated_at: now,
      metadata: transaction.metadata,
    };

    transactionStore.set(id, newTransaction);

    // Update budget if applicable
    if (transaction.category_id && transaction.type === "expense") {
      await this.updateBudgetSpent(transaction.category_id, transaction.amount || 0);
    }

    return newTransaction;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const oldTransaction = transactionStore.get(id);
    if (!oldTransaction) {
      throw new Error("Transaction not found");
    }

    const updated: Transaction = {
      ...oldTransaction,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    transactionStore.set(id, updated);

    // Update budget if amount or category changed
    if (oldTransaction.type === "expense" && (updates.amount !== undefined || updates.category_id !== undefined)) {
      if (oldTransaction.category_id) {
        await this.updateBudgetSpent(oldTransaction.category_id, -(oldTransaction.amount || 0));
      }
      if (updated.category_id) {
        await this.updateBudgetSpent(updated.category_id, updated.amount || 0);
      }
    }

    return updated;
  }

  static async deleteTransaction(id: string): Promise<void> {
    const transaction = transactionStore.get(id);

    if (transaction && transaction.category_id && transaction.type === "expense") {
      await this.updateBudgetSpent(transaction.category_id, -(transaction.amount || 0));
    }

    transactionStore.delete(id);
  }

  // Category Management
  static async getCategories(type?: "income" | "expense"): Promise<Category[]> {
    let categories = Array.from(categoryStore.values()).filter(c => c.is_active);

    if (type) {
      categories = categories.filter(c => c.type === type);
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createCategory(category: Partial<Category>): Promise<Category> {
    const id = generateId();
    const now = new Date().toISOString();

    const newCategory: Category = {
      id,
      name: category.name || "Unnamed Category",
      type: category.type || "expense",
      parent_category_id: category.parent_category_id,
      color: category.color,
      icon: category.icon,
      budget_limit: category.budget_limit,
      is_active: true,
      created_at: now,
    };

    categoryStore.set(id, newCategory);
    return newCategory;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const existing = categoryStore.get(id);
    if (!existing) {
      throw new Error("Category not found");
    }

    const updated: Category = { ...existing, ...updates };
    categoryStore.set(id, updated);
    return updated;
  }

  static async deleteCategory(id: string): Promise<void> {
    const existing = categoryStore.get(id);
    if (existing) {
      categoryStore.set(id, { ...existing, is_active: false });
    }
  }

  // Budget Management
  static async getBudgets(filters?: BudgetFilters): Promise<Budget[]> {
    let budgets = Array.from(budgetStore.values());

    if (filters?.category_id) {
      budgets = budgets.filter(b => b.category_id === filters.category_id);
    }
    if (filters?.period) {
      budgets = budgets.filter(b => b.period === filters.period);
    }
    if (filters?.status?.length) {
      budgets = budgets.filter(b => filters.status!.includes(b.status));
    }

    return budgets.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }

  static async createBudget(budget: Partial<Budget>): Promise<Budget> {
    const id = generateId();
    const now = new Date().toISOString();

    const newBudget: Budget = {
      id,
      name: budget.name || "Unnamed Budget",
      category_id: budget.category_id,
      amount: budget.amount || 0,
      spent: 0,
      remaining: budget.amount || 0,
      period: budget.period || "monthly",
      start_date: budget.start_date || now,
      end_date: budget.end_date || now,
      status: "active",
      alert_threshold: budget.alert_threshold,
      created_by: budget.created_by,
      created_at: now,
      updated_at: now,
    };

    budgetStore.set(id, newBudget);
    return newBudget;
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const existing = budgetStore.get(id);
    if (!existing) {
      throw new Error("Budget not found");
    }

    const updated: Budget = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    budgetStore.set(id, updated);
    return updated;
  }

  static async updateBudgetSpent(categoryId: string, amount: number): Promise<void> {
    const budgets = await this.getBudgets({
      category_id: categoryId,
      status: ["active"],
    });

    for (const budget of budgets) {
      const now = new Date();
      const startDate = new Date(budget.start_date);
      const endDate = new Date(budget.end_date);

      if (now >= startDate && now <= endDate) {
        const newSpent = (budget.spent || 0) + amount;
        const newRemaining = budget.amount - newSpent;
        
        let status: Budget["status"] = budget.status;
        if (newSpent >= budget.amount) {
          status = "exceeded";
        }

        await this.updateBudget(budget.id, {
          spent: newSpent,
          remaining: newRemaining,
          status,
        });
      }
    }
  }

  // Financial Reports
  static async generateMonthlyReport(month: number, year: number): Promise<FinanceReport> {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    return this.generateReport(startDate, endDate);
  }

  static async generateReport(
    startDate: string,
    endDate: string,
    filters?: { category_id?: string; department?: string }
  ): Promise<FinanceReport> {
    const transactions = await this.getTransactions({
      start_date: startDate,
      end_date: endDate,
      category_id: filters?.category_id,
      department: filters?.department,
      status: ["completed"],
    });

    const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const categoryMap = new Map<string, CategorySummary>();
    for (const txn of transactions) {
      if (txn.category_id && txn.category_name) {
        const existing = categoryMap.get(txn.category_id) || {
          category_id: txn.category_id,
          category_name: txn.category_name,
          total_amount: 0,
          transaction_count: 0,
          percentage: 0,
        };
        existing.total_amount += txn.amount;
        existing.transaction_count += 1;
        categoryMap.set(txn.category_id, existing);
      }
    }

    const byCategory = Array.from(categoryMap.values());
    const totalAmount = byCategory.reduce((sum, c) => sum + c.total_amount, 0);
    byCategory.forEach(c => {
      c.percentage = totalAmount > 0 ? Math.round((c.total_amount / totalAmount) * 100) : 0;
    });

    // Group by month
    const monthMap = new Map<string, MonthSummary>();
    for (const txn of transactions) {
      const date = new Date(txn.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const existing = monthMap.get(key) || {
        month: date.toLocaleString("default", { month: "long" }),
        year: date.getFullYear(),
        income: 0,
        expenses: 0,
        net: 0,
      };

      if (txn.type === "income") existing.income += txn.amount;
      else if (txn.type === "expense") existing.expenses += txn.amount;
      existing.net = existing.income - existing.expenses;
      monthMap.set(key, existing);
    }

    const topExpenses = transactions.filter(t => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 10);

    const budgets = await this.getBudgets({ status: ["active"] });
    const budgetUtilization: BudgetUtilization[] = budgets.map(b => ({
      budget_id: b.id,
      budget_name: b.name,
      allocated: b.amount,
      spent: b.spent || 0,
      remaining: b.remaining || 0,
      utilization_percentage: b.amount > 0 ? Math.round(((b.spent || 0) / b.amount) * 100) : 0,
      status: b.status,
    }));

    return {
      period_start: startDate,
      period_end: endDate,
      total_income: Math.round(income * 100) / 100,
      total_expenses: Math.round(expenses * 100) / 100,
      net_profit: Math.round((income - expenses) * 100) / 100,
      transactions_count: transactions.length,
      by_category: byCategory.sort((a, b) => b.total_amount - a.total_amount),
      by_month: Array.from(monthMap.values()),
      top_expenses: topExpenses,
      budget_utilization: budgetUtilization,
      generated_at: new Date().toISOString(),
    };
  }

  // CSV Export
  static async exportTransactionsToCSV(filters?: TransactionFilters): Promise<string> {
    const transactions = await this.getTransactions(filters);
    let csv = "Date,Type,Category,Amount,Currency,Description,Vendor,Payment Method,Status,Reference\n";

    for (const txn of transactions) {
      csv += `"${txn.date}","${txn.type}","${txn.category_name || "N/A"}",`;
      csv += `${txn.amount},"${txn.currency}","${txn.description || ""}",`;
      csv += `"${txn.vendor || ""}","${txn.payment_method || ""}",`;
      csv += `"${txn.status}","${txn.reference_number || ""}"\n`;
    }

    return csv;
  }

  static exportReportToCSV(report: FinanceReport): string {
    let csv = "Financial Report\n\n";
    csv += `Period:,${report.period_start} to ${report.period_end}\n`;
    csv += `Total Income:,${report.total_income}\n`;
    csv += `Total Expenses:,${report.total_expenses}\n`;
    csv += `Net Profit:,${report.net_profit}\n`;
    csv += `Transactions:,${report.transactions_count}\n\n`;

    csv += "By Category\nCategory,Amount,Count,Percentage\n";
    for (const cat of report.by_category) {
      csv += `"${cat.category_name}",${cat.total_amount},${cat.transaction_count},${cat.percentage}%\n`;
    }

    csv += "\nBy Month\nMonth,Year,Income,Expenses,Net\n";
    for (const month of report.by_month) {
      csv += `"${month.month}",${month.year},${month.income},${month.expenses},${month.net}\n`;
    }

    csv += "\nBudget Utilization\nBudget,Allocated,Spent,Remaining,Utilization %,Status\n";
    for (const budget of report.budget_utilization) {
      csv += `"${budget.budget_name}",${budget.allocated},${budget.spent},${budget.remaining},${budget.utilization_percentage}%,"${budget.status}"\n`;
    }

    return csv;
  }

  // Dashboard Statistics
  static async getDashboardStats(period = 30): Promise<{
    total_income: number;
    total_expenses: number;
    net_profit: number;
    transactions_count: number;
    active_budgets: number;
    budgets_exceeded: number;
    avg_transaction_value: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const transactions = await this.getTransactions({
      start_date: startDate.toISOString(),
      status: ["completed"],
    });

    const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    const budgets = await this.getBudgets({ status: ["active", "exceeded"] });
    const budgetsExceeded = budgets.filter(b => b.status === "exceeded").length;

    return {
      total_income: Math.round(income * 100) / 100,
      total_expenses: Math.round(expenses * 100) / 100,
      net_profit: Math.round((income - expenses) * 100) / 100,
      transactions_count: transactions.length,
      active_budgets: budgets.filter(b => b.status === "active").length,
      budgets_exceeded: budgetsExceeded,
      avg_transaction_value: transactions.length > 0 ? Math.round((expenses / transactions.length) * 100) / 100 : 0,
    };
  }

  // Permission Check (simplified - in production would check Supabase)
  static async checkPermission(
    _userId: string,
    _action: "read" | "create" | "update" | "delete",
    _resource: "transaction" | "category" | "budget" | "report"
  ): Promise<boolean> {
    // In production, this would query user_permissions table
    // For now, return true for all authenticated users
    return true;
  }
}
