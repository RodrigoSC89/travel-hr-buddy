/**
 * Finance Hub Tests
 * Tests for financial transaction management, invoices, and budgets
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFinanceData } from '@/modules/finance-hub/hooks/useFinanceData';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Finance Hub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFinanceData Hook', () => {
    describe('Data Loading', () => {
      it('should load financial transactions from Supabase', async () => {
        const mockTransactions = [
          {
            id: '1',
            transaction_type: 'income',
            amount: 1000,
            currency: 'USD',
            status: 'completed',
            transaction_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            transaction_type: 'expense',
            amount: 500,
            currency: 'USD',
            status: 'completed',
            transaction_date: '2025-01-02',
            created_at: '2025-01-02'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockTransactions,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.transactions).toHaveLength(2);
        expect(result.current.transactions[0].transaction_type).toBe('income');
      });

      it('should load budget categories', async () => {
        const mockCategories = [
          {
            id: '1',
            name: 'Operations',
            category_type: 'expense',
            is_active: true,
            budget_allocated: 10000
          },
          {
            id: '2',
            name: 'Revenue',
            category_type: 'income',
            is_active: true,
            budget_allocated: 50000
          }
        ];

        const mockEq = vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCategories,
            error: null
          })
        });

        const mockSelect = vi.fn().mockReturnValue({
          eq: mockEq
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockSelect).toHaveBeenCalled();
      });

      it('should load invoices', async () => {
        const mockInvoices = [
          {
            id: '1',
            invoice_number: 'INV-001',
            invoice_type: 'sales',
            status: 'pending',
            total_amount: 5000,
            currency: 'USD',
            issue_date: '2025-01-01',
            created_at: '2025-01-01'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockInvoices,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockSelect).toHaveBeenCalled();
      });

      it('should handle errors when loading data', async () => {
        const mockError = { message: 'Database connection error' };

        (supabase.from as any).mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: mockError
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(mockError.message);
      });
    });

    describe('Financial Summary Calculation', () => {
      it('should calculate total income correctly', async () => {
        const mockTransactions = [
          {
            id: '1',
            transaction_type: 'income',
            amount: 1000,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            transaction_type: 'income',
            amount: 2000,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-02',
            created_at: '2025-01-02'
          }
        ];

        const mockFrom = vi.fn().mockImplementation((table: string) => {
          if (table === 'financial_transactions') {
            return {
              select: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: mockTransactions,
                    error: null
                  })
                })
              })
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              }),
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          };
        });

        (supabase.from as any) = mockFrom;

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.summary?.totalIncome).toBe(3000);
      });

      it('should calculate total expenses correctly', async () => {
        const mockTransactions = [
          {
            id: '1',
            transaction_type: 'expense',
            amount: 500,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            transaction_type: 'expense',
            amount: 300,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-02',
            created_at: '2025-01-02'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockTransactions,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.summary?.totalExpenses).toBe(800);
      });

      it('should calculate net profit correctly', async () => {
        const mockTransactions = [
          {
            id: '1',
            transaction_type: 'income',
            amount: 5000,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            transaction_type: 'expense',
            amount: 2000,
            status: 'completed',
            currency: 'USD',
            transaction_date: '2025-01-02',
            created_at: '2025-01-02'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockTransactions,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.summary?.netProfit).toBe(3000);
      });

      it('should count pending invoices', async () => {
        const mockInvoices = [
          {
            id: '1',
            invoice_number: 'INV-001',
            status: 'pending',
            invoice_type: 'sales',
            total_amount: 1000,
            currency: 'USD',
            issue_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            invoice_number: 'INV-002',
            status: 'sent',
            invoice_type: 'sales',
            total_amount: 2000,
            currency: 'USD',
            issue_date: '2025-01-02',
            created_at: '2025-01-02'
          },
          {
            id: '3',
            invoice_number: 'INV-003',
            status: 'paid',
            invoice_type: 'sales',
            total_amount: 3000,
            currency: 'USD',
            issue_date: '2025-01-03',
            created_at: '2025-01-03'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockInvoices,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.summary?.pendingInvoices).toBe(2);
      });

      it('should count overdue invoices', async () => {
        const mockInvoices = [
          {
            id: '1',
            invoice_number: 'INV-001',
            status: 'overdue',
            invoice_type: 'sales',
            total_amount: 1000,
            currency: 'USD',
            issue_date: '2025-01-01',
            created_at: '2025-01-01'
          },
          {
            id: '2',
            invoice_number: 'INV-002',
            status: 'overdue',
            invoice_type: 'sales',
            total_amount: 2000,
            currency: 'USD',
            issue_date: '2025-01-02',
            created_at: '2025-01-02'
          }
        ];

        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockInvoices,
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.summary?.overdueInvoices).toBe(2);
      });
    });

    describe('CRUD Operations - Transactions', () => {
      it('should create a new transaction', async () => {
        const newTransaction = {
          transaction_type: 'income' as const,
          amount: 1000,
          currency: 'USD',
          description: 'Test income',
          status: 'pending'
        };

        const mockTransaction = {
          id: '123',
          ...newTransaction,
          transaction_date: '2025-01-01',
          created_at: '2025-01-01'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: mockTransaction,
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({
          single: mockSingle
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: mockSelect
        });

        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.createTransaction(newTransaction);
        });

        expect(mockInsert).toHaveBeenCalledWith([newTransaction]);
      });

      it('should update an existing transaction', async () => {
        const updates = {
          amount: 1500,
          status: 'completed'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: { id: '123', ...updates },
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({
          single: mockSingle
        });

        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect
        });

        const mockUpdate = vi.fn().mockReturnValue({
          eq: mockEq
        });

        (supabase.from as any).mockReturnValue({
          update: mockUpdate,
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.updateTransaction('123', updates);
        });

        expect(mockUpdate).toHaveBeenCalledWith(updates);
        expect(mockEq).toHaveBeenCalledWith('id', '123');
      });

      it('should handle transaction creation errors', async () => {
        const newTransaction = {
          transaction_type: 'income' as const,
          amount: 1000,
          currency: 'USD'
        };

        const mockError = { message: 'Validation error' };

        (supabase.from as any).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError
              })
            })
          }),
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await expect(
          result.current.createTransaction(newTransaction)
        ).rejects.toThrow();
      });
    });

    describe('CRUD Operations - Invoices', () => {
      it('should create a new invoice', async () => {
        const newInvoice = {
          invoice_number: 'INV-TEST-001',
          invoice_type: 'sales' as const,
          status: 'draft',
          total_amount: 5000,
          currency: 'USD',
          issue_date: '2025-01-01'
        };

        const mockInvoice = {
          id: '456',
          ...newInvoice,
          created_at: '2025-01-01'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: mockInvoice,
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({
          single: mockSingle
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: mockSelect
        });

        (supabase.from as any).mockReturnValue({
          insert: mockInsert,
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.createInvoice(newInvoice);
        });

        expect(mockInsert).toHaveBeenCalledWith([newInvoice]);
      });

      it('should update an existing invoice', async () => {
        const updates = {
          status: 'paid',
          paid_date: '2025-01-10'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: { id: '456', ...updates },
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({
          single: mockSingle
        });

        const mockEq = vi.fn().mockReturnValue({
          select: mockSelect
        });

        const mockUpdate = vi.fn().mockReturnValue({
          eq: mockEq
        });

        (supabase.from as any).mockReturnValue({
          update: mockUpdate,
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.updateInvoice('456', updates);
        });

        expect(mockUpdate).toHaveBeenCalledWith(updates);
        expect(mockEq).toHaveBeenCalledWith('id', '456');
      });

      it('should handle invoice creation errors', async () => {
        const newInvoice = {
          invoice_number: 'INV-TEST-001',
          invoice_type: 'sales' as const,
          total_amount: 5000,
          currency: 'USD'
        };

        const mockError = { message: 'Duplicate invoice number' };

        (supabase.from as any).mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError
              })
            })
          }),
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }),
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await expect(
          result.current.createInvoice(newInvoice)
        ).rejects.toThrow();
      });
    });

    describe('Data Refresh', () => {
      it('should allow manual data refresh', async () => {
        const mockSelect = vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        });

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        const { result } = renderHook(() => useFinanceData());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const callCountBefore = mockSelect.mock.calls.length;

        await act(async () => {
          await result.current.refreshData();
        });

        expect(mockSelect.mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });
  });

  describe('Data Persistence', () => {
    it('should persist transactions in Supabase', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1' },
            error: null
          })
        })
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useFinanceData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const transaction = {
        transaction_type: 'expense' as const,
        amount: 100,
        currency: 'USD'
      };

      await act(async () => {
        await result.current.createTransaction(transaction);
      });

      expect(supabase.from).toHaveBeenCalledWith('financial_transactions');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should persist invoices in Supabase', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1' },
            error: null
          })
        })
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useFinanceData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invoice = {
        invoice_number: 'INV-001',
        invoice_type: 'sales' as const,
        total_amount: 1000,
        currency: 'USD',
        status: 'draft',
        issue_date: '2025-01-01'
      };

      await act(async () => {
        await result.current.createInvoice(invoice);
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
