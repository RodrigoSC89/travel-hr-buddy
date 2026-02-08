/**
 * Procurement Data Hook
 * Real-time data from Supabase for procurement management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Vendors Hook
export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('performance_score', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendors', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: {
      name: string;
      email?: string;
      phone?: string;
      contact_person?: string;
      address?: string;
      payment_terms?: string;
    }) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendor])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Fornecedor criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar fornecedor', { description: error.message });
    },
  });
}

// Purchase Orders Hook
export function usePurchaseOrders(filters?: { status?: string; vesselId?: string }) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status as 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled');
      }

      if (filters?.vesselId) {
        query = query.eq('vessel_id', filters.vesselId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (po: {
      vessel_id?: string;
      supplier_id?: string;
      supplier_name?: string;
      items?: Record<string, unknown>[];
      total_amount: number;
      currency?: string;
      delivery_port?: string;
      delivery_date?: string;
      notes?: string;
    }) => {
      const year = new Date().getFullYear();
      const seqNum = Date.now() % 9000 + 1000;
      const po_number = `PO-${year}-${seqNum}`;

      const insertData = {
        po_number,
        status: 'draft' as const,
        vessel_id: po.vessel_id,
        supplier_id: po.supplier_id,
        supplier_name: po.supplier_name,
        items: po.items ? JSON.parse(JSON.stringify(po.items)) : null,
        total_amount: po.total_amount,
        currency: po.currency || 'USD',
        delivery_port: po.delivery_port,
        delivery_date: po.delivery_date,
        notes: po.notes,
      };

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([insertData] as unknown as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Pedido de compra criado');
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido', { description: error.message });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: {
        status?: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
        approved_by?: string;
        approved_at?: string;
        notes?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Pedido atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pedido', { description: error.message });
    },
  });
}

// Invoices Hook
export function useInvoices(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status as 'draft' | 'pending_approval' | 'approved' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'disputed');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: {
      invoice_number: string;
      total_amount: number;
      currency?: string;
      issue_date?: string;
      due_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoice, status: 'draft' as const }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura criada');
    },
    onError: (error) => {
      toast.error('Erro ao criar fatura', { description: error.message });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: {
        status?: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'disputed';
        approved_by?: string;
        approved_at?: string;
        paid_at?: string;
        notes?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar fatura', { description: error.message });
    },
  });
}

// Budgets Hook
export function useBudgets(year?: number) {
  return useQuery({
    queryKey: ['budgets', year],
    queryFn: async () => {
      let query = supabase
        .from('budgets')
        .select('*')
        .order('category', { ascending: true });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBudgetSummary(year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['budget-summary', currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('year', currentYear);

      if (error) throw error;

      const budgets = data || [];
      
      const summary = {
        totalAllocated: budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0),
        totalSpent: budgets.reduce((acc, b) => acc + (b.spent_amount || 0), 0),
        totalCommitted: budgets.reduce((acc, b) => acc + (b.committed_amount || 0), 0),
        totalForecast: budgets.reduce((acc, b) => acc + (b.forecast_amount || b.allocated_amount || 0), 0),
        byCategory: budgets.reduce((acc, b) => {
          acc[b.category] = {
            allocated: b.allocated_amount || 0,
            spent: b.spent_amount || 0,
            committed: b.committed_amount || 0,
            forecast: b.forecast_amount || b.allocated_amount || 0,
          };
          return acc;
        }, {} as Record<string, { allocated: number; spent: number; committed: number; forecast: number }>),
      };

      return summary;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Expenses Hook
export function useExpenses(filters?: { category?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Cost Predictions Hook
export function useCostPredictions() {
  return useQuery({
    queryKey: ['cost-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Savings Opportunities Hook
export function useSavingsOpportunities() {
  return useQuery({
    queryKey: ['savings-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_opportunities')
        .select('*')
        .order('potential_savings', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Financial Dashboard Stats
export function useFinancialDashboardStats() {
  return useQuery({
    queryKey: ['financial-dashboard-stats'],
    queryFn: async () => {
      const [
        { data: transactions },
        { data: invoices },
        { data: pos },
        { data: budgets }
      ] = await Promise.all([
        supabase.from('financial_transactions').select('*').limit(100),
        supabase.from('invoices').select('status, total_amount').limit(200),
        supabase.from('purchase_orders').select('status, total_amount').limit(200),
        supabase.from('budgets').select('*').eq('year', new Date().getFullYear())
      ]);

      const totalIncome = transactions?.filter(t => (t.amount || 0) > 0).reduce((acc, t) => acc + (t.amount || 0), 0) || 0;
      const totalExpenses = transactions?.filter(t => (t.amount || 0) < 0).reduce((acc, t) => acc + Math.abs(t.amount || 0), 0) || 0;

      const pendingInvoices = invoices?.filter(i => i.status === 'pending_approval' || i.status === 'draft').length || 0;
      const approvedInvoices = invoices?.filter(i => i.status === 'approved' || i.status === 'paid').length || 0;

      const pendingPOs = pos?.filter(p => p.status === 'pending').length || 0;
      const totalPOValue = pos?.reduce((acc, p) => acc + (p.total_amount || 0), 0) || 0;

      const totalBudget = budgets?.reduce((acc, b) => acc + (b.allocated_amount || 0), 0) || 0;
      const totalSpent = budgets?.reduce((acc, b) => acc + (b.spent_amount || 0), 0) || 0;

      return {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        pendingInvoices,
        approvedInvoices,
        pendingPOs,
        totalPOValue,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
