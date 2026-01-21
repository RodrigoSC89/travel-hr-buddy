/**
 * Hook for Employees/Colaboradores CRUD operations with Supabase
 * Uses crew_members table with proper typing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Colaborador } from '../types';

interface EmployeeInsert {
  full_name: string;
  email?: string;
  phone?: string;
  rank?: string;
  position?: string;
  nationality?: string;
  status?: string;
}

export function useEmployeesDB() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['employees-db'],
    queryFn: async (): Promise<Colaborador[]> => {
      try {
        const { data, error } = await supabase
          .from('crew_members')
          .select('id, full_name, email, phone, rank, position, nationality, status, created_at')
          .order('full_name')
          .limit(200);

        if (error) throw error;

        if (data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            nome: row.full_name || '',
            email: row.email || '',
            telefone: row.phone || '',
            cargo: row.rank || row.position || '',
            departamento: 'Operações',
            unidade: 'Escritório Central',
            dataAdmissao: row.created_at?.split('T')[0] || '2020-01-01',
            status: row.status === 'active' ? 'ativo' as const : 'desligado' as const,
            salario: 10000,
            gestorDireto: '',
            tipoContrato: 'CLT' as const,
            documentos: [],
            formacoes: []
          }));
        }
        return [];
      } catch (error) {
        console.warn('[useEmployeesDB] Fetch failed:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<Colaborador, 'id'>) => {
      const insertData: EmployeeInsert = {
        full_name: employee.nome,
        email: employee.email,
        phone: employee.telefone,
        rank: employee.cargo,
        status: employee.status === 'ativo' ? 'active' : 'inactive'
      };

      const { data, error } = await supabase
        .from('crew_members')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees-db'] });
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('Colaborador criado com sucesso');
    },
    onError: (error) => {
      console.error('Create employee error:', error);
      toast.error('Erro ao criar colaborador');
    }
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const updateData: Partial<EmployeeInsert> = {};
      
      if (updates.nome) updateData.full_name = updates.nome;
      if (updates.email) updateData.email = updates.email;
      if (updates.telefone) updateData.phone = updates.telefone;
      if (updates.cargo) updateData.rank = updates.cargo;
      if (updates.status) updateData.status = updates.status === 'ativo' ? 'active' : 'inactive';

      const { data, error } = await supabase
        .from('crew_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees-db'] });
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('Colaborador atualizado');
    },
    onError: (error) => {
      console.error('Update employee error:', error);
      toast.error('Erro ao atualizar colaborador');
    }
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees-db'] });
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      toast.success('Colaborador removido');
    },
    onError: (error) => {
      console.error('Delete employee error:', error);
      toast.error('Erro ao remover colaborador');
    }
  });

  return {
    employees: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee
  };
}
