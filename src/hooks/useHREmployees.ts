/**
 * HR Employees Hook - React Query + Supabase
 * CRUD completo para gestão de colaboradores
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HREmployee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  termination_date: string | null;
  contract_type: string | null;
  base_salary: number | null;
  status: string | null;
  turnover_risk_score: number | null;
  turnover_risk_factors: Record<string, unknown> | null;
  wellness_score: number | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  contract_type?: string;
  base_salary?: number;
  status?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
}

// GET - List all employees
export function useHREmployees(filters?: { department?: string; status?: string; search?: string }) {
  return useQuery<HREmployee[]>({
    queryKey: ['hr-employees', filters],
    queryFn: async () => {
      let query = supabase
        .from('hr_employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,position.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HREmployee[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// GET - Single employee
export function useHREmployee(id: string | null) {
  return useQuery<HREmployee | null>({
    queryKey: ['hr-employee', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('hr_employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as HREmployee;
    },
    enabled: !!id,
  });
}

// POST - Create employee
export function useCreateHREmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const { data, error } = await supabase
        .from('hr_employees')
        .insert([{
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
          cpf: input.cpf || null,
          position: input.position || 'Não definido',
          department: input.department || null,
          hire_date: input.hire_date || new Date().toISOString().split('T')[0],
          contract_type: input.contract_type || 'CLT',
          base_salary: input.base_salary || null,
          status: input.status || 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      queryClient.invalidateQueries({ queryKey: ['people-analytics-employees'] });
      toast.success('Colaborador cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao cadastrar colaborador', { description: error.message });
    },
  });
}

// PUT - Update employee
export function useUpdateHREmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEmployeeInput) => {
      const { data, error } = await supabase
        .from('hr_employees')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr-employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['people-analytics-employees'] });
      toast.success('Colaborador atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar colaborador', { description: error.message });
    },
  });
}

// DELETE - Terminate employee (soft delete via status)
export function useTerminateHREmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, terminationDate }: { id: string; terminationDate?: string }) => {
      const { data, error } = await supabase
        .from('hr_employees')
        .update({
          status: 'terminated',
          termination_date: terminationDate || new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      queryClient.invalidateQueries({ queryKey: ['people-analytics-employees'] });
      toast.success('Colaborador desligado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao desligar colaborador', { description: error.message });
    },
  });
}

// GET - Departments list
export function useHRDepartments() {
  return useQuery<string[]>({
    queryKey: ['hr-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_employees')
        .select('department')
        .not('department', 'is', null);

      if (error) throw error;
      
      const departments = [...new Set(data.map(d => d.department as string))];
      return departments.filter(Boolean).sort();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
