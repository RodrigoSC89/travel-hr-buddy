import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Regulation {
  id: string;
  reg_code: string;
  title: string;
  description?: string;
  authority: string;
  category: string;
  subcategory?: string;
  effective_date?: string;
  revision_date?: string;
  compliance_deadline?: string;
  is_mandatory: boolean;
  applies_to?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  documentation_required?: string[];
  penalties?: string;
  related_regulations?: string[];
  source_url?: string;
  full_text?: string;
  reg_status: string;
  ai_summary?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateRegulationInput {
  reg_code: string;
  title: string;
  description?: string;
  authority: string;
  category: string;
  subcategory?: string;
  effective_date?: string;
  revision_date?: string;
  compliance_deadline?: string;
  is_mandatory?: boolean;
  applies_to?: Record<string, unknown>;
  requirements?: Record<string, unknown>;
  documentation_required?: string[];
  penalties?: string;
  related_regulations?: string[];
  source_url?: string;
  full_text?: string;
  reg_status?: string;
  ai_summary?: Record<string, unknown>;
}

// Mock data for when table doesn't exist yet
const mockRegulations: Regulation[] = [
  {
    id: '1',
    reg_code: 'MLC-2006',
    title: 'Maritime Labour Convention 2006',
    description: 'Convenção internacional sobre condições de trabalho marítimo',
    authority: 'ILO',
    category: 'labor',
    is_mandatory: true,
    reg_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    reg_code: 'STCW-2010',
    title: 'Standards of Training, Certification and Watchkeeping',
    description: 'Padrões de treinamento e certificação para marítimos',
    authority: 'IMO',
    category: 'safety',
    is_mandatory: true,
    reg_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    reg_code: 'SOLAS-2020',
    title: 'Safety of Life at Sea Convention',
    description: 'Convenção internacional sobre segurança da vida no mar',
    authority: 'IMO',
    category: 'safety',
    is_mandatory: true,
    reg_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useRegulations(filters?: { category?: string; authority?: string; status?: string }) {
  return useQuery({
    queryKey: ['regulations', filters],
    queryFn: async () => {
      // Use mock data until table is created in Supabase
      let result = [...mockRegulations];
      if (filters?.category) result = result.filter(r => r.category === filters.category);
      if (filters?.authority) result = result.filter(r => r.authority === filters.authority);
      if (filters?.status) result = result.filter(r => r.reg_status === filters.status);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegulation(id: string) {
  return useQuery({
    queryKey: ['regulation', id],
    queryFn: async () => {
      const mock = mockRegulations.find(r => r.id === id);
      return mock || null;
    },
    enabled: !!id,
  });
}

export function useCreateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRegulationInput) => {
      // For now, simulate creation
      const newReg: Regulation = {
        id: crypto.randomUUID(),
        ...input,
        is_mandatory: input.is_mandatory ?? true,
        reg_status: input.reg_status ?? 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newReg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      toast.success('Regulamentação criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar regulamentação: ${error.message}`);
    },
  });
}

export function useUpdateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateRegulationInput> & { id: string }) => {
      const existing = mockRegulations.find(r => r.id === id);
      if (!existing) throw new Error('Regulation not found');
      return { ...existing, ...input, updated_at: new Date().toISOString() };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      queryClient.invalidateQueries({ queryKey: ['regulation', variables.id] });
      toast.success('Regulamentação atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar regulamentação: ${error.message}`);
    },
  });
}

export function useDeleteRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      toast.success('Regulamentação excluída com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir regulamentação: ${error.message}`);
    },
  });
}
