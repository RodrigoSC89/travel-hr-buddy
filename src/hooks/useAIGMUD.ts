/**
 * useAIGMUD - Hook de IA para Gestão de Mudanças (GMUD)
 * Fluxo de aprovação, notificações, automação
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GMUD {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'operational' | 'technical' | 'procedural' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented' | 'cancelled';
  requester_id: string;
  requester_name: string;
  vessel_id?: string;
  vessel_name?: string;
  impact_analysis?: string;
  risk_assessment?: string;
  implementation_plan?: string;
  rollback_plan?: string;
  approvers: GMUDApprover[];
  created_at: string;
  scheduled_date?: string;
  implemented_at?: string;
}

interface GMUDApprover {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
}

interface GMUDAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impactAreas: string[];
  recommendations: string[];
  requiredApprovers: string[];
  estimatedDuration: string;
  rollbackComplexity: 'simple' | 'moderate' | 'complex';
}

export function useAIGMUD() {
  const queryClient = useQueryClient();
  const [selectedGMUD, setSelectedGMUD] = useState<GMUD | null>(null);

  // Query: Listar GMUDs
  const gmudsQuery = useQuery({
    queryKey: ['gmuds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmuds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return getMockGMUDs();
      return data?.length ? data : getMockGMUDs();
    },
    staleTime: 30000,
  });

  // Mutation: Criar GMUD
  const createGMUDMutation = useMutation({
    mutationFn: async (gmudData: Partial<GMUD>) => {
      const code = `GMUD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('gmuds')
        .insert({
          ...gmudData,
          code,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmuds'] });
      toast.success('GMUD criado com sucesso!');
    },
  });

  // Mutation: Análise de impacto com IA
  const analyzeImpactMutation = useMutation({
    mutationFn: async (gmudId: string): Promise<GMUDAnalysis> => {
      const { data, error } = await supabase.functions.invoke('gmud-ai', {
        body: {
          action: 'analyze_impact',
          gmudId,
        },
      });

      if (error) throw error;
      return data.analysis as GMUDAnalysis;
    },
    onSuccess: () => {
      toast.success('Análise de impacto concluída!');
    },
  });

  // Mutation: Aprovar GMUD
  const approveGMUDMutation = useMutation({
    mutationFn: async (params: { gmudId: string; approverId: string; comments?: string }) => {
      const { data, error } = await supabase.functions.invoke('gmud-ai', {
        body: {
          action: 'approve',
          ...params,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmuds'] });
      toast.success('GMUD aprovado!');
    },
  });

  // Mutation: Enviar notificações
  const sendNotificationsMutation = useMutation({
    mutationFn: async (gmudId: string) => {
      const { data, error } = await supabase.functions.invoke('gmud-ai', {
        body: {
          action: 'send_notifications',
          gmudId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificações enviadas!');
    },
  });

  // Actions
  const createGMUD = useCallback(
    async (gmudData: Partial<GMUD>) => {
      return createGMUDMutation.mutateAsync(gmudData);
    },
    [createGMUDMutation]
  );

  const analyzeImpact = useCallback(
    async (gmudId: string) => {
      return analyzeImpactMutation.mutateAsync(gmudId);
    },
    [analyzeImpactMutation]
  );

  const approveGMUD = useCallback(
    async (gmudId: string, approverId: string, comments?: string) => {
      return approveGMUDMutation.mutateAsync({ gmudId, approverId, comments });
    },
    [approveGMUDMutation]
  );

  const sendNotifications = useCallback(
    async (gmudId: string) => {
      return sendNotificationsMutation.mutateAsync(gmudId);
    },
    [sendNotificationsMutation]
  );

  // Statistics
  const stats = {
    total: gmudsQuery.data?.length || 0,
    pending: gmudsQuery.data?.filter((g: any) => g.status === 'pending').length || 0,
    approved: gmudsQuery.data?.filter((g: any) => g.status === 'approved').length || 0,
    implemented: gmudsQuery.data?.filter((g: any) => g.status === 'implemented').length || 0,
  };

  return {
    // Data
    gmuds: gmudsQuery.data || [],
    selectedGMUD,
    stats,

    // Actions
    setSelectedGMUD,
    createGMUD,
    analyzeImpact,
    approveGMUD,
    sendNotifications,

    // Loading
    isLoading: gmudsQuery.isLoading,
    isCreating: createGMUDMutation.isPending,
    isAnalyzing: analyzeImpactMutation.isPending,

    // Refetch
    refetch: gmudsQuery.refetch,
  };
}

function getMockGMUDs(): GMUD[] {
  return [
    {
      id: '1',
      code: 'GMUD-2024-0001',
      title: 'Atualização Sistema DP',
      description: 'Atualização do firmware do sistema de posicionamento dinâmico',
      type: 'technical',
      priority: 'high',
      status: 'pending',
      requester_id: 'user1',
      requester_name: 'João Silva',
      vessel_name: 'Vessel Alpha',
      approvers: [
        { id: 'a1', name: 'Maria Santos', role: 'Gerente Técnico', status: 'pending' },
        { id: 'a2', name: 'Carlos Lima', role: 'Superintendente', status: 'pending' },
      ],
      created_at: new Date().toISOString(),
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      code: 'GMUD-2024-0002',
      title: 'Novo Procedimento de Emergência',
      description: 'Implementação de novo procedimento para situações de emergência',
      type: 'procedural',
      priority: 'critical',
      status: 'approved',
      requester_id: 'user2',
      requester_name: 'Ana Costa',
      approvers: [
        { id: 'a3', name: 'Roberto Ferreira', role: 'QHSE Manager', status: 'approved', approved_at: new Date().toISOString() },
      ],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export default useAIGMUD;
