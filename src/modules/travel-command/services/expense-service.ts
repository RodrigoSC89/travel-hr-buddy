/**
 * Expense Management Service - Enterprise Expense Tracking
 * Serviço para gestão completa de despesas de viagem
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Expense, ExpenseReport, ExpenseCategory, ExpenseStatus } from "../types/travel-types";

export interface CreateExpenseInput {
  tripId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  merchant?: string;
  paymentMethod: 'corporate_card' | 'personal_card' | 'cash' | 'other';
  receiptFile?: File;
  notes?: string;
  attendees?: string[];
  businessPurpose?: string;
}

export interface ExpenseFilters {
  status?: ExpenseStatus[];
  category?: ExpenseCategory[];
  tripId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseStats {
  totalExpenses: number;
  pendingReimbursement: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  byCategory: Record<ExpenseCategory, number>;
  averagePerTrip: number;
  complianceRate: number;
}

class ExpenseService {
  
  // ========================================
  // EXPENSE CRUD OPERATIONS
  // ========================================
  
  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");
      
      let receiptUrl: string | undefined;
      
      // Upload receipt if provided
      if (input.receiptFile) {
        receiptUrl = await this.uploadReceipt(input.receiptFile);
      }
      
      const expense: Expense = {
        id: crypto.randomUUID(),
        tripId: input.tripId,
        userId: userData.user.id,
        organizationId: '', // Would come from user's org
        category: input.category,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        exchangeRate: 1,
        amountInBaseCurrency: input.amount,
        date: input.date,
        merchant: input.merchant,
        receipt: receiptUrl ? {
          url: receiptUrl,
          fileName: input.receiptFile?.name || ''
        } : undefined,
        paymentMethod: input.paymentMethod,
        status: 'draft',
        policyCompliance: this.checkPolicyCompliance(input),
        approvalChain: [],
        allocation: [{ percentage: 100 }],
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: input.notes,
        attendees: input.attendees,
        businessPurpose: input.businessPurpose
      };
      
      // In production, save to database
      logger.info("Created expense", { id: expense.id, amount: expense.amount });
      
      return expense;
    } catch (error) {
      logger.error("Error creating expense", error);
      throw error;
    }
  }
  
  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");
      
      // Mock data - in production, query from database
      const mockExpenses: Expense[] = [
        {
          id: "1",
          userId: userData.user.id,
          organizationId: "",
          category: "meals_lunch",
          description: "Almoço durante mobilização",
          amount: 85.50,
          currency: "BRL",
          amountInBaseCurrency: 85.50,
          date: new Date(),
          merchant: "Restaurante Porto Seguro",
          paymentMethod: "corporate_card",
          status: "approved",
          policyCompliance: { status: "compliant" },
          approvalChain: [],
          allocation: [{ percentage: 100 }],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          userId: userData.user.id,
          organizationId: "",
          category: "ground_transport",
          description: "Uber aeroporto-hotel",
          amount: 45.00,
          currency: "BRL",
          amountInBaseCurrency: 45.00,
          date: new Date(),
          paymentMethod: "personal_card",
          status: "pending_approval",
          policyCompliance: { status: "compliant" },
          approvalChain: [],
          allocation: [{ percentage: 100 }],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "3",
          userId: userData.user.id,
          organizationId: "",
          category: "hotel",
          description: "Diária extra - atraso de voo",
          amount: 320.00,
          currency: "BRL",
          amountInBaseCurrency: 320.00,
          date: new Date(),
          merchant: "Hotel Macaé Business",
          paymentMethod: "personal_card",
          status: "pending_approval",
          policyCompliance: { status: "warning", issues: ["Despesa não planejada"] },
          approvalChain: [],
          allocation: [{ percentage: 100 }],
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: "Voo cancelado por mau tempo, necessário pernoite adicional"
        }
      ];
      
      // Apply filters
      let result = mockExpenses;
      
      if (filters?.status?.length) {
        result = result.filter(e => filters.status!.includes(e.status));
      }
      
      if (filters?.category?.length) {
        result = result.filter(e => filters.category!.includes(e.category));
      }
      
      if (filters?.dateFrom) {
        result = result.filter(e => e.date >= filters.dateFrom!);
      }
      
      if (filters?.dateTo) {
        result = result.filter(e => e.date <= filters.dateTo!);
      }
      
      return result;
    } catch (error) {
      logger.error("Error getting expenses", error);
      throw error;
    }
  }
  
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      logger.info("Updating expense", { id, updates: Object.keys(updates) });
      
      // In production, update in database
      // Return updated expense
      
      return {
        id,
        ...updates
      } as Expense;
    } catch (error) {
      logger.error("Error updating expense", error);
      throw error;
    }
  }
  
  async deleteExpense(id: string): Promise<void> {
    try {
      logger.info("Deleting expense", { id });
      
      // In production, delete from database
    } catch (error) {
      logger.error("Error deleting expense", error);
      throw error;
    }
  }
  
  // ========================================
  // RECEIPT MANAGEMENT
  // ========================================
  
  async uploadReceipt(file: File): Promise<string> {
    try {
      const fileName = `receipts/${Date.now()}-${file.name}`;
      
      // In production, upload to storage
      logger.info("Uploading receipt", { fileName });
      
      return `https://storage.example.com/${fileName}`;
    } catch (error) {
      logger.error("Error uploading receipt", error);
      throw error;
    }
  }
  
  async processReceiptOCR(receiptUrl: string): Promise<{
    merchant: string;
    amount: number;
    date: Date;
    items?: string[];
  }> {
    try {
      logger.info("Processing receipt OCR", { receiptUrl });
      
      // In production, call OCR service (Google Vision, AWS Textract, etc.)
      // Return extracted data
      
      return {
        merchant: "Extracted Merchant",
        amount: 0,
        date: new Date()
      };
    } catch (error) {
      logger.error("Error processing OCR", error);
      throw error;
    }
  }
  
  // ========================================
  // EXPENSE REPORTS
  // ========================================
  
  async createExpenseReport(title: string, expenseIds: string[], tripId?: string): Promise<ExpenseReport> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");
      
      const reportNumber = `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Get expenses
      const expenses = await this.getExpenses();
      const selectedExpenses = expenses.filter(e => expenseIds.includes(e.id));
      
      const totalAmount = selectedExpenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
      
      const report: ExpenseReport = {
        id: crypto.randomUUID(),
        reportNumber,
        userId: userData.user.id,
        organizationId: '',
        tripId,
        title,
        status: 'draft',
        expenses: selectedExpenses,
        totalAmount,
        currency: 'BRL',
        reimbursableAmount: selectedExpenses
          .filter(e => e.paymentMethod !== 'corporate_card')
          .reduce((sum, e) => sum + e.amountInBaseCurrency, 0),
        nonReimbursableAmount: selectedExpenses
          .filter(e => e.paymentMethod === 'corporate_card')
          .reduce((sum, e) => sum + e.amountInBaseCurrency, 0),
        approvalChain: [],
        periodStart: new Date(Math.min(...selectedExpenses.map(e => e.date.getTime()))),
        periodEnd: new Date(Math.max(...selectedExpenses.map(e => e.date.getTime()))),
        createdAt: new Date()
      };
      
      logger.info("Created expense report", { reportNumber, totalAmount });
      
      return report;
    } catch (error) {
      logger.error("Error creating expense report", error);
      throw error;
    }
  }
  
  async submitExpenseReport(reportId: string): Promise<void> {
    try {
      logger.info("Submitting expense report", { reportId });
      
      // In production:
      // 1. Validate all expenses have receipts (if required)
      // 2. Check policy compliance
      // 3. Determine approval chain
      // 4. Update status and notify
    } catch (error) {
      logger.error("Error submitting report", error);
      throw error;
    }
  }
  
  // ========================================
  // STATISTICS & ANALYTICS
  // ========================================
  
  async getExpenseStats(): Promise<ExpenseStats> {
    try {
      const expenses = await this.getExpenses();
      
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
      const pendingReimbursement = expenses
        .filter(e => e.status === 'approved' && e.paymentMethod !== 'corporate_card')
        .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const approvedThisMonth = expenses
        .filter(e => e.status === 'approved' && e.approvedAt && e.approvedAt >= thisMonth)
        .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
      
      const rejectedThisMonth = expenses
        .filter(e => e.status === 'rejected' && e.date >= thisMonth)
        .reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
      
      const byCategory = {} as Record<ExpenseCategory, number>;
      expenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amountInBaseCurrency;
      });
      
      const compliantCount = expenses.filter(e => e.policyCompliance.status === 'compliant').length;
      const complianceRate = expenses.length > 0 ? (compliantCount / expenses.length) * 100 : 100;
      
      return {
        totalExpenses,
        pendingReimbursement,
        approvedThisMonth,
        rejectedThisMonth,
        byCategory,
        averagePerTrip: totalExpenses / Math.max(1, new Set(expenses.map(e => e.tripId)).size),
        complianceRate
      };
    } catch (error) {
      logger.error("Error getting expense stats", error);
      throw error;
    }
  }
  
  // ========================================
  // POLICY COMPLIANCE
  // ========================================
  
  private checkPolicyCompliance(expense: CreateExpenseInput): { status: 'compliant' | 'warning' | 'violation'; issues?: string[] } {
    const issues: string[] = [];
    
    // Example policy checks
    const limits: Record<string, number> = {
      'meals_breakfast': 35,
      'meals_lunch': 50,
      'meals_dinner': 80,
      'parking': 50,
      'wifi': 20
    };
    
    const limit = limits[expense.category];
    if (limit && expense.amount > limit) {
      issues.push(`Valor excede o limite da política (R$ ${limit})`);
    }
    
    if (expense.amount > 25 && !expense.receiptFile) {
      issues.push('Comprovante obrigatório para valores acima de R$ 25');
    }
    
    if (issues.length > 0) {
      return { status: issues.some(i => i.includes('obrigatório')) ? 'violation' : 'warning', issues };
    }
    
    return { status: 'compliant' };
  }
  
  // ========================================
  // EXPORT & INTEGRATION
  // ========================================
  
  async exportToCSV(filters?: ExpenseFilters): Promise<string> {
    try {
      const expenses = await this.getExpenses(filters);
      
      const headers = ['Data', 'Categoria', 'Descrição', 'Valor', 'Moeda', 'Status', 'Forma de Pagamento'];
      const rows = expenses.map(e => [
        e.date.toISOString().split('T')[0],
        e.category,
        e.description,
        e.amount.toString(),
        e.currency,
        e.status,
        e.paymentMethod
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      return csv;
    } catch (error) {
      logger.error("Error exporting to CSV", error);
      throw error;
    }
  }
  
  async syncWithAccounting(): Promise<void> {
    try {
      logger.info("Syncing expenses with accounting system");
      
      // In production, integrate with QuickBooks, Xero, SAP, etc.
    } catch (error) {
      logger.error("Error syncing with accounting", error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
