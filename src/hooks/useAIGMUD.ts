/**
 * useAIGMUD - Hook de IA para Gestão de Mudanças (GMUD)
 * Fluxo de aprovação, notificações, automação
 * PATCH: Removed mock fallbacks and as any casts
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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

interface GMUDStats {
  total: number;
  pending: number;
  approved: number;
  implemented: number;
}

export interface UseAIGMUDReturn {
  gmuds: GMUD[];
  selectedGMUD: GMUD | null;
  stats: GMUDStats;
  setSelectedGMUD: (gmud: GMUD | null) => void;
  createGMUD: (gmudData: Partial<GMUD>) => Promise<GMUD>;
  analyzeImpact: (gmudId: string) => Promise<GMUDAnalysis>;
  approveGMUD: (gmudId: string, approverId: string, comments?: string) => Promise<void>;
  sendNotifications: (gmudId: string) => Promise<void>;
  isLoading: boolean;
  isCreating: boolean;
  isAnalyzing: boolean;
  isEmpty: boolean;
  refetch: () => void;
}

export function useAIGMUD(): UseAIGMUDReturn {
  const queryClient = useQueryClient();
  const [selectedGMUD, setSelectedGMUD] = useState<GMUD | null>(null);

  // Query: Listar GMUDs - usando action_items como source
  const gmudsQuery = useQuery({
    queryKey: ['gmuds'],
    queryFn: async (): Promise<GMUD[]> => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*, vessel:vessels(name)')
        .eq('source_module', 'gmud')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn('[useAIGMUD] Error fetching GMUDs', { error: error.message });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((item) => ({
        id: item.id,
        code: `GMUD-${new Date(item.created_at || '').getFullYear()}-${item.id.slice(0, 4).toUpperCase()}`,
        title: item.title,
        description: item.description || '',
        type: inferGMUDType(item.priority),
        priority: (item.priority as GMUD['priority']) || 'medium',
        status: mapStatusToGMUD(item.status),
        requester_id: item.created_by || '',
        requester_name: item.assigned_to_name || 'Unknown',
        vessel_id: item.vessel_id || undefined,
        vessel_name: (item.vessel as { name?: string })?.name || undefined,
        approvers: parseApprovers(item.comments),
        created_at: item.created_at || new Date().toISOString(),
        scheduled_date: item.due_date || undefined,
        implemented_at: item.completion_date || undefined,
      }));
    },
    staleTime: 30000,
  });

  // Mutation: Criar GMUD
  const createGMUDMutation = useMutation({
    mutationFn: async (gmudData: Partial<GMUD>): Promise<GMUD> => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('action_items')
        .insert({
          title: gmudData.title || 'Nova GMUD',
          description: gmudData.description,
          source_module: 'gmud',
          priority: gmudData.priority || 'medium',
          status: 'pending',
          vessel_id: gmudData.vessel_id,
          created_by: user.user?.id,
          due_date: gmudData.scheduled_date,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        code: `GMUD-${new Date().getFullYear()}-${data.id.slice(0, 4).toUpperCase()}`,
        title: data.title,
        description: data.description || '',
        type: gmudData.type || 'operational',
        priority: gmudData.priority || 'medium',
        status: 'draft',
        requester_id: user.user?.id || '',
        requester_name: user.user?.email || 'Unknown',
        approvers: [],
        created_at: data.created_at || new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmuds'] });
      toast.success('GMUD criado com sucesso!');
    },
    onError: (error) => {
      logger.error('[useAIGMUD] Create GMUD failed', error);
      toast.error('Erro ao criar GMUD');
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
    onError: (error) => {
      logger.error('[useAIGMUD] Analyze impact failed', error);
      toast.error('Erro ao analisar impacto');
    },
  });

  // Mutation: Aprovar GMUD
  const approveGMUDMutation = useMutation({
    mutationFn: async (params: { gmudId: string; approverId: string; comments?: string }) => {
      const { error } = await supabase
        .from('action_items')
        .update({ 
          status: 'in_progress',
          comments: JSON.stringify([{
            approverId: params.approverId,
            status: 'approved',
            comments: params.comments,
            approved_at: new Date().toISOString(),
          }]),
        })
        .eq('id', params.gmudId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmuds'] });
      toast.success('GMUD aprovado!');
    },
    onError: (error) => {
      logger.error('[useAIGMUD] Approve GMUD failed', error);
      toast.error('Erro ao aprovar GMUD');
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
    onError: (error) => {
      logger.error('[useAIGMUD] Send notifications failed', error);
      toast.error('Erro ao enviar notificações');
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
  const stats: GMUDStats = {
    total: gmudsQuery.data?.length || 0,
    pending: gmudsQuery.data?.filter((g) => g.status === 'pending').length || 0,
    approved: gmudsQuery.data?.filter((g) => g.status === 'approved').length || 0,
    implemented: gmudsQuery.data?.filter((g) => g.status === 'implemented').length || 0,
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

    // Status flags
    isEmpty: (gmudsQuery.data?.length || 0) === 0,

    // Refetch
    refetch: gmudsQuery.refetch,
  };
}

function inferGMUDType(priority: string | null): GMUD['type'] {
  if (priority === 'critical') return 'emergency';
  if (priority === 'high') return 'technical';
  return 'operational';
}

function mapStatusToGMUD(status: string | null): GMUD['status'] {
  switch (status) {
    case 'pending': return 'pending';
    case 'in_progress': return 'approved';
    case 'completed': return 'implemented';
    case 'cancelled': return 'cancelled';
    default: return 'draft';
  }
}

function parseApprovers(comments: unknown): GMUDApprover[] {
  if (!comments) return [];
  try {
    const parsed = typeof comments === 'string' ? JSON.parse(comments) : comments;
    if (Array.isArray(parsed)) {
      return parsed.map((c, i) => ({
        id: c.approverId || String(i),
        name: c.name || 'Approver',
        role: c.role || 'Reviewer',
        status: c.status || 'pending',
        comments: c.comments,
        approved_at: c.approved_at,
      }));
    }
  } catch {
    // Invalid JSON, return empty
  }
  return [];
}

export default useAIGMUD;
