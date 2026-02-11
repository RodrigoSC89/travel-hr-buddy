/**
 * Procurement CRUD Hook - P1 Fix
 * Real CRUD operations for Suppliers, Inventory Items, and RFQ Requests
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

// ==================== INTERFACES ====================

export interface SupplierInput {
  company_name: string;
  trading_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  city?: string;
  country?: string;
  category?: string[];
  is_approved?: boolean;
  is_active?: boolean;
  rating?: number;
}

export interface InventoryItemInput {
  name: string;
  item_code?: string;
  category?: string;
  current_stock: number;
  minimum_stock?: number;
  maximum_stock?: number;
  unit_cost?: number;
  location?: string;
}

export interface RFQInput {
  title: string;
  category?: string;
  delivery_port?: string;
  budget_estimate?: number;
  deadline?: string;
  currency?: string;
  status?: string;
}

// ==================== HOOK ====================

export function useProcurementCRUD() {
  const queryClient = useQueryClient();
  const { toast: shadcnToast } = useToast();

  // ==================== SUPPLIER MUTATIONS ====================

  const createSupplier = useMutation({
    mutationFn: async (supplier: SupplierInput) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          company_name: supplier.company_name,
          trading_name: supplier.trading_name || null,
          contact_name: supplier.contact_name || null,
          contact_email: supplier.contact_email || null,
          contact_phone: supplier.contact_phone || null,
          website: supplier.website || null,
          city: supplier.city || null,
          country: supplier.country || null,
          category: supplier.category || [],
          is_approved: supplier.is_approved ?? false,
          is_active: supplier.is_active ?? true,
          rating: supplier.rating || 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      shadcnToast({
        title: '✅ Fornecedor Criado',
        description: 'Fornecedor cadastrado com sucesso.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar fornecedor: ${error.message}`);
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<SupplierInput>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor atualizado');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor removido');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  // ==================== INVENTORY MUTATIONS ====================

  const createInventoryItem = useMutation({
    mutationFn: async (item: InventoryItemInput) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          name: item.name,
          item_code: item.item_code || `ITM-${Date.now()}`,
          category: item.category || 'general',
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock || 0,
          maximum_stock: item.maximum_stock || 1000,
          unit_cost: item.unit_cost || 0,
          location: item.location || 'Warehouse',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      shadcnToast({
        title: '✅ Item Criado',
        description: 'Item de inventário cadastrado.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar item: ${error.message}`);
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InventoryItemInput>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item atualizado');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar item: ${error.message}`);
    },
  });

  const deleteInventoryItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item removido');
    },
    onError: (error) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    },
  });

  // ==================== RFQ MUTATIONS ====================

  const createRFQ = useMutation({
    mutationFn: async (rfq: RFQInput) => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .insert([{
          rfq_number: `RFQ-${Date.now()}`,
          title: rfq.title,
          category: rfq.category || 'spare_parts',
          delivery_port: rfq.delivery_port || null,
          budget_estimate: rfq.budget_estimate || 0,
          deadline: rfq.deadline || null,
          currency: rfq.currency || 'BRL',
          status: rfq.status || 'draft',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      shadcnToast({
        title: '✅ RFQ Criado',
        description: 'Requisição de cotação criada.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar RFQ: ${error.message}`);
    },
  });

  const updateRFQ = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<RFQInput>) => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      toast.success('RFQ atualizado');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar RFQ: ${error.message}`);
    },
  });

  const deleteRFQ = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rfq_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      toast.success('RFQ removido');
    },
    onError: (error) => {
      toast.error(`Erro ao remover RFQ: ${error.message}`);
    },
  });

  // ==================== EXPORT UTILITY ====================

  const exportData = async (type: 'suppliers' | 'inventory' | 'rfq') => {
    let data: Record<string, unknown>[] = [];
    let filename = '';

    switch (type) {
      case 'suppliers':
        const { data: suppliers } = await supabase.from('suppliers').select('*');
        data = suppliers || [];
        filename = 'suppliers';
        break;
      case 'inventory':
        const { data: inventory } = await supabase.from('inventory_items').select('*');
        data = inventory || [];
        filename = 'inventory';
        break;
      case 'rfq':
        const { data: rfqs } = await supabase.from('rfq_requests').select('*');
        data = rfqs || [];
        filename = 'rfq-requests';
        break;
    }

    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação concluída');
  };

  return {
    // Supplier mutations
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Inventory mutations
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // RFQ mutations
    createRFQ,
    updateRFQ,
    deleteRFQ,
    
    // Export
    exportData,
    
    // Loading states
    isCreatingSupplier: createSupplier.isPending,
    isCreatingItem: createInventoryItem.isPending,
    isCreatingRFQ: createRFQ.isPending,
  };
}

export default useProcurementCRUD;
