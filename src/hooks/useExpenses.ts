import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: 'travel' | 'accommodation' | 'meals' | 'transport' | 'equipment' | 'other';
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  amount: number;
  category: Expense['category'];
  description: string;
  date: string;
  notes?: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setExpenses(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar despesas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: ExpenseFormData) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error: createError } = await supabase
        .from('expenses')
        .insert([
          {
            ...expenseData,
            user_id: user.id,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      setExpenses((prev) => [data, ...prev]);

      toast({
        title: 'Sucesso',
        description: 'Despesa criada com sucesso',
      });

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar despesa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseFormData>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? data : exp))
      );

      toast({
        title: 'Sucesso',
        description: 'Despesa atualizada com sucesso',
      });

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar despesa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setExpenses((prev) => prev.filter((exp) => exp.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Despesa removida com sucesso',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover despesa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
};
