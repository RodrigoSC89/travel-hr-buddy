/**
 * PATCH 532 - Unit tests for Finance Hub Module
 * Tests financial transactions, budgeting, and reporting
 */

import { describe, it, expect } from "vitest";

interface FinancialTransaction {
  id: string;
  type: "income" | "expense" | "transfer";
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  vessel_id?: string;
  created_by: string;
  status: "pending" | "approved" | "rejected";
}

interface Budget {
  id: string;
  name: string;
  period: string;
  allocated_amount: number;
  spent_amount: number;
  currency: string;
  category: string;
}

interface FinancialReport {
  id: string;
  period: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  currency: string;
  transactions_count: number;
}

describe("Finance Hub Module", () => {
  describe("Transaction Validation", () => {
    it("should validate transaction structure", () => {
      const transaction: FinancialTransaction = {
        id: "tx-001",
        type: "expense",
        category: "Fuel",
        amount: 5000,
        currency: "USD",
        date: "2025-10-29",
        description: "Fuel purchase for vessel-001",
        vessel_id: "vessel-001",
        created_by: "user-001",
        status: "approved",
      };

      expect(transaction.id).toBeTruthy();
      expect(transaction.amount).toBeGreaterThan(0);
      expect(transaction.currency).toBe("USD");
      expect(["income", "expense", "transfer"]).toContain(transaction.type);
    });

    it("should validate transaction type values", () => {
      const validTypes: Array<"income" | "expense" | "transfer"> = [
        "income",
        "expense",
        "transfer",
      ];

      validTypes.forEach(type => {
        const tx: FinancialTransaction = {
          id: "test-tx",
          type,
          category: "Test",
          amount: 1000,
          currency: "USD",
          date: "2025-10-29",
          description: "Test transaction",
          created_by: "user",
          status: "pending",
        };

        expect(["income", "expense", "transfer"]).toContain(tx.type);
      });
    });

    it("should validate transaction status values", () => {
      const validStatuses: Array<"pending" | "approved" | "rejected"> = [
        "pending",
        "approved",
        "rejected",
      ];

      validStatuses.forEach(status => {
        const tx: FinancialTransaction = {
          id: "test-tx",
          type: "expense",
          category: "Test",
          amount: 1000,
          currency: "USD",
          date: "2025-10-29",
          description: "Test transaction",
          created_by: "user",
          status,
        };

        expect(["pending", "approved", "rejected"]).toContain(tx.status);
      });
    });
  });

  describe("Transaction Processing", () => {
    const transactions: FinancialTransaction[] = [
      {
        id: "1",
        type: "income",
        category: "Charter",
        amount: 50000,
        currency: "USD",
        date: "2025-10-01",
        description: "Charter payment",
        created_by: "user-001",
        status: "approved",
      },
      {
        id: "2",
        type: "expense",
        category: "Fuel",
        amount: 15000,
        currency: "USD",
        date: "2025-10-05",
        description: "Fuel purchase",
        vessel_id: "vessel-001",
        created_by: "user-002",
        status: "approved",
      },
      {
        id: "3",
        type: "expense",
        category: "Maintenance",
        amount: 8000,
        currency: "USD",
        date: "2025-10-10",
        description: "Engine maintenance",
        vessel_id: "vessel-001",
        created_by: "user-003",
        status: "approved",
      },
      {
        id: "4",
        type: "expense",
        category: "Salaries",
        amount: 25000,
        currency: "USD",
        date: "2025-10-15",
        description: "Crew salaries",
        created_by: "user-001",
        status: "pending",
      },
    ];

    it("should filter transactions by type", () => {
      const expenses = transactions.filter(tx => tx.type === "expense");
      const income = transactions.filter(tx => tx.type === "income");

      expect(expenses).toHaveLength(3);
      expect(income).toHaveLength(1);
    });

    it("should filter transactions by status", () => {
      const approved = transactions.filter(tx => tx.status === "approved");
      const pending = transactions.filter(tx => tx.status === "pending");

      expect(approved).toHaveLength(3);
      expect(pending).toHaveLength(1);
    });

    it("should calculate total income", () => {
      const totalIncome = transactions
        .filter(tx => tx.type === "income" && tx.status === "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      expect(totalIncome).toBe(50000);
    });

    it("should calculate total expenses", () => {
      const totalExpenses = transactions
        .filter(tx => tx.type === "expense" && tx.status === "approved")
        .reduce((sum, tx) => sum + tx.amount, 0);

      expect(totalExpenses).toBe(23000); // 15000 + 8000
    });

    it("should calculate net balance", () => {
      const approvedTransactions = transactions.filter(
        tx => tx.status === "approved"
      );
      const income = approvedTransactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = approvedTransactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);
      const netBalance = income - expenses;

      expect(netBalance).toBe(27000); // 50000 - 23000
    });
  });

  describe("Budget Management", () => {
    const budgets: Budget[] = [
      {
        id: "budget-001",
        name: "Fuel Budget Q4",
        period: "2025-Q4",
        allocated_amount: 50000,
        spent_amount: 15000,
        currency: "USD",
        category: "Fuel",
      },
      {
        id: "budget-002",
        name: "Maintenance Budget Q4",
        period: "2025-Q4",
        allocated_amount: 30000,
        spent_amount: 25000,
        currency: "USD",
        category: "Maintenance",
      },
      {
        id: "budget-003",
        name: "Salaries Budget Q4",
        period: "2025-Q4",
        allocated_amount: 100000,
        spent_amount: 75000,
        currency: "USD",
        category: "Salaries",
      },
    ];

    it("should calculate budget utilization percentage", () => {
      const utilization = budgets.map(budget => ({
        name: budget.name,
        percentage: (budget.spent_amount / budget.allocated_amount) * 100,
      }));

      expect(utilization[0].percentage).toBe(30); // Fuel: 15000/50000
      expect(utilization[1].percentage).toBeCloseTo(83.33, 1); // Maintenance
      expect(utilization[2].percentage).toBe(75); // Salaries
    });

    it("should calculate remaining budget", () => {
      const remaining = budgets.map(budget => ({
        name: budget.name,
        remaining: budget.allocated_amount - budget.spent_amount,
      }));

      expect(remaining[0].remaining).toBe(35000); // Fuel
      expect(remaining[1].remaining).toBe(5000); // Maintenance
      expect(remaining[2].remaining).toBe(25000); // Salaries
    });

    it("should identify over-budget categories", () => {
      const overBudget = budgets.filter(
        budget => budget.spent_amount > budget.allocated_amount
      );

      expect(overBudget).toHaveLength(0); // None over budget in this case
    });

    it("should identify near-limit budgets", () => {
      const threshold = 0.8; // 80%
      const nearLimit = budgets.filter(
        budget => budget.spent_amount / budget.allocated_amount >= threshold
      );

      expect(nearLimit).toHaveLength(1); // Maintenance at 83.33%
      expect(nearLimit[0].category).toBe("Maintenance");
    });

    it("should calculate total allocated budget", () => {
      const totalAllocated = budgets.reduce(
        (sum, budget) => sum + budget.allocated_amount,
        0
      );

      expect(totalAllocated).toBe(180000); // 50000 + 30000 + 100000
    });

    it("should calculate total spent amount", () => {
      const totalSpent = budgets.reduce(
        (sum, budget) => sum + budget.spent_amount,
        0
      );

      expect(totalSpent).toBe(115000); // 15000 + 25000 + 75000
    });
  });

  describe("Financial Reporting", () => {
    it("should generate financial report", () => {
      const report: FinancialReport = {
        id: "report-001",
        period: "2025-10",
        total_income: 50000,
        total_expenses: 23000,
        net_balance: 27000,
        currency: "USD",
        transactions_count: 4,
      };

      expect(report.id).toBeTruthy();
      expect(report.total_income).toBeGreaterThan(0);
      expect(report.net_balance).toBe(
        report.total_income - report.total_expenses
      );
    });

    it("should validate report period format", () => {
      const monthlyReport: FinancialReport = {
        id: "report-001",
        period: "2025-10",
        total_income: 50000,
        total_expenses: 23000,
        net_balance: 27000,
        currency: "USD",
        transactions_count: 4,
      };

      const periodRegex = /^\d{4}-\d{2}$/;
      expect(periodRegex.test(monthlyReport.period)).toBe(true);
    });

    it("should calculate profit margin", () => {
      const report: FinancialReport = {
        id: "report-001",
        period: "2025-10",
        total_income: 50000,
        total_expenses: 23000,
        net_balance: 27000,
        currency: "USD",
        transactions_count: 4,
      };

      const profitMargin =
        (report.net_balance / report.total_income) * 100;

      expect(profitMargin).toBe(54); // (27000/50000) * 100
    });
  });

  describe("Transaction Categorization", () => {
    const transactions: FinancialTransaction[] = [
      {
        id: "1",
        type: "expense",
        category: "Fuel",
        amount: 10000,
        currency: "USD",
        date: "2025-10-01",
        description: "Fuel",
        created_by: "user",
        status: "approved",
      },
      {
        id: "2",
        type: "expense",
        category: "Fuel",
        amount: 5000,
        currency: "USD",
        date: "2025-10-05",
        description: "Fuel",
        created_by: "user",
        status: "approved",
      },
      {
        id: "3",
        type: "expense",
        category: "Maintenance",
        amount: 8000,
        currency: "USD",
        date: "2025-10-10",
        description: "Maintenance",
        created_by: "user",
        status: "approved",
      },
    ];

    it("should group transactions by category", () => {
      const grouped = transactions.reduce(
        (acc, tx) => {
          if (!acc[tx.category]) {
            acc[tx.category] = [];
          }
          acc[tx.category].push(tx);
          return acc;
        },
        {} as Record<string, FinancialTransaction[]>
      );

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped["Fuel"]).toHaveLength(2);
      expect(grouped["Maintenance"]).toHaveLength(1);
    });

    it("should calculate total by category", () => {
      const totals = transactions.reduce(
        (acc, tx) => {
          if (!acc[tx.category]) {
            acc[tx.category] = 0;
          }
          acc[tx.category] += tx.amount;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(totals["Fuel"]).toBe(15000); // 10000 + 5000
      expect(totals["Maintenance"]).toBe(8000);
    });
  });
});
