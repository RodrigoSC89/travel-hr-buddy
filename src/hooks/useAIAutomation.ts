/**
 * useAIAutomation - Hook de IA para Automações
 * Zapier, Twilio SMS/WhatsApp, Email, Webhooks
 * PATCH: Removed mock fallbacks and as any casts - Fixed insert types
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type ScheduledTaskInsert = Database['public']['Tables']['scheduled_tasks']['Insert'];

interface Automation {
  id: string;
  name: string;
  type: 'zapier' | 'twilio_sms' | 'twilio_whatsapp' | 'email' | 'webhook';
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  enabled: boolean;
  last_triggered?: string;
  trigger_count: number;
  created_at: string;
}

interface AutomationLog {
  id: string;
  automation_id: string;
  automation_name: string;
  status: 'success' | 'failed' | 'pending';
  trigger_event: string;
  response?: unknown;
  error?: string;
  executed_at: string;
}

interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  type: 'sms' | 'whatsapp' | 'email';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface WebhookPayload {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

interface AutomationStats {
  total: number;
  active: number;
  totalTriggers: number;
  recentLogs: AutomationLog[];
}

export interface UseAIAutomationReturn {
  automations: Automation[];
  logs: AutomationLog[];
  selectedAutomation: Automation | null;
  stats: AutomationStats;
  setSelectedAutomation: (automation: Automation | null) => void;
  createAutomation: (automation: Omit<Automation, 'id' | 'created_at' | 'trigger_count'>) => Promise<Automation>;
  sendSMS: (to: string | string[], message: string, priority?: 'low' | 'normal' | 'high' | 'urgent') => Promise<unknown>;
  sendWhatsApp: (to: string | string[], message: string) => Promise<unknown>;
  sendEmail: (to: string | string[], subject: string, message: string) => Promise<unknown>;
  triggerZapier: (webhookUrl: string, data: unknown) => Promise<unknown>;
  triggerWebhook: (payload: WebhookPayload) => Promise<unknown>;
  toggleAutomation: (id: string, enabled: boolean) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
  isEmpty: boolean;
  refetch: () => void;
}

export function useAIAutomation(): UseAIAutomationReturn {
  const queryClient = useQueryClient();
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  // Query: Listar automações - usando scheduled_tasks como source
  const automationsQuery = useQuery({
    queryKey: ['automations'],
    queryFn: async (): Promise<Automation[]> => {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn('[useAIAutomation] Error fetching automations', { error: error.message });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform scheduled_tasks into Automation format
      return data.map((task) => ({
        id: task.id,
        name: task.task_name || 'Automation',
        type: inferAutomationType(task.task_type || ''),
        trigger: task.schedule_type || 'manual',
        action: task.task_type || 'custom',
        config: typeof task.task_config === 'object' && task.task_config ? task.task_config as Record<string, unknown> : {},
        enabled: task.is_active || false,
        last_triggered: task.last_executed_at || undefined,
        trigger_count: task.execution_count || 0,
        created_at: task.created_at || new Date().toISOString(),
      }));
    },
    staleTime: 60000,
  });

  // Query: Logs de automação - usando access_logs
  const logsQuery = useQuery({
    queryKey: ['automation-logs'],
    queryFn: async (): Promise<AutomationLog[]> => {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('module_accessed', 'automation')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        logger.warn('[useAIAutomation] Error fetching logs', { error: error.message });
        return [];
      }

      if (!data) return [];

      return data.map((log) => ({
        id: log.id,
        automation_id: String(log.details || 'unknown'),
        automation_name: log.action || 'Unknown',
        status: log.result === 'success' ? 'success' : log.result === 'failure' ? 'failed' : 'pending',
        trigger_event: log.action || 'manual',
        response: log.details,
        executed_at: log.timestamp,
      }));
    },
  });

  // Mutation: Criar automação
  const createAutomationMutation = useMutation({
    mutationFn: async (automation: Omit<Automation, 'id' | 'created_at' | 'trigger_count'>): Promise<Automation> => {
      const { data: user } = await supabase.auth.getUser();
      const { data: orgs } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.user?.id || '').limit(1).single();
      
      const orgId = orgs?.organization_id;
      if (!orgId) {
        throw new Error('Organization not found for user');
      }
      
      const insertPayload: ScheduledTaskInsert = {
        task_name: automation.name,
        task_type: automation.type,
        schedule_type: automation.trigger || 'manual',
        task_config: automation.config as Database['public']['Tables']['scheduled_tasks']['Insert']['task_config'],
        is_active: automation.enabled,
        execution_count: 0,
        organization_id: orgId,
      };
      
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.task_name,
        type: automation.type,
        trigger: automation.trigger,
        action: automation.action,
        config: automation.config,
        enabled: data.is_active || false,
        trigger_count: 0,
        created_at: data.created_at || new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('✅ Automação criada com sucesso!');
    },
    onError: (error) => {
      logger.error('[useAIAutomation] Create automation failed', error);
      toast.error('Erro ao criar automação');
    },
  });

  // Mutation: Enviar notificação
  const sendNotificationMutation = useMutation({
    mutationFn: async (payload: NotificationPayload) => {
      const { data, error } = await supabase.functions.invoke('automation-notifications', {
        body: {
          action: 'send_notification',
          ...payload,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, payload) => {
      toast.success(`📤 ${payload.type.toUpperCase()} enviado!`);
    },
    onError: (error) => {
      logger.error('[useAIAutomation] Send notification failed', error);
      toast.error('Erro ao enviar notificação');
    },
  });

  // Mutation: Trigger Zapier
  const triggerZapierMutation = useMutation({
    mutationFn: async (params: { webhookUrl: string; data: unknown }) => {
      const { data, error } = await supabase.functions.invoke('automation-notifications', {
        body: {
          action: 'trigger_zapier',
          ...params,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('⚡ Zapier acionado!');
    },
    onError: (error) => {
      logger.error('[useAIAutomation] Zapier trigger failed', error);
      toast.error('Erro ao acionar Zapier');
    },
  });

  // Mutation: Webhook genérico
  const triggerWebhookMutation = useMutation({
    mutationFn: async (payload: WebhookPayload) => {
      const { data, error } = await supabase.functions.invoke('automation-notifications', {
        body: {
          action: 'trigger_webhook',
          ...payload,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('🔗 Webhook executado!');
    },
    onError: (error) => {
      logger.error('[useAIAutomation] Webhook trigger failed', error);
      toast.error('Erro ao executar webhook');
    },
  });

  // Mutation: Toggle automação
  const toggleAutomationMutation = useMutation({
    mutationFn: async (params: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('scheduled_tasks')
        .update({ is_active: params.enabled })
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success(params.enabled ? '✅ Automação ativada' : '⏸️ Automação pausada');
    },
    onError: (error) => {
      logger.error('[useAIAutomation] Toggle automation failed', error);
      toast.error('Erro ao alterar automação');
    },
  });

  // Actions
  const createAutomation = useCallback(
    async (automation: Omit<Automation, 'id' | 'created_at' | 'trigger_count'>) => {
      return createAutomationMutation.mutateAsync(automation);
    },
    [createAutomationMutation]
  );

  const sendSMS = useCallback(
    async (to: string | string[], message: string, priority?: 'low' | 'normal' | 'high' | 'urgent') => {
      return sendNotificationMutation.mutateAsync({ to, message, type: 'sms', priority });
    },
    [sendNotificationMutation]
  );

  const sendWhatsApp = useCallback(
    async (to: string | string[], message: string) => {
      return sendNotificationMutation.mutateAsync({ to, message, type: 'whatsapp' });
    },
    [sendNotificationMutation]
  );

  const sendEmail = useCallback(
    async (to: string | string[], subject: string, message: string) => {
      return sendNotificationMutation.mutateAsync({ to, subject, message, type: 'email' });
    },
    [sendNotificationMutation]
  );

  const triggerZapier = useCallback(
    async (webhookUrl: string, data: unknown) => {
      return triggerZapierMutation.mutateAsync({ webhookUrl, data });
    },
    [triggerZapierMutation]
  );

  const triggerWebhook = useCallback(
    async (payload: WebhookPayload) => {
      return triggerWebhookMutation.mutateAsync(payload);
    },
    [triggerWebhookMutation]
  );

  const toggleAutomation = useCallback(
    async (id: string, enabled: boolean) => {
      return toggleAutomationMutation.mutateAsync({ id, enabled });
    },
    [toggleAutomationMutation]
  );

  // Statistics
  const stats: AutomationStats = {
    total: automationsQuery.data?.length || 0,
    active: automationsQuery.data?.filter((a) => a.enabled).length || 0,
    totalTriggers: automationsQuery.data?.reduce((sum, a) => sum + (a.trigger_count || 0), 0) || 0,
    recentLogs: logsQuery.data?.slice(0, 10) || [],
  };

  return {
    // Data
    automations: automationsQuery.data || [],
    logs: logsQuery.data || [],
    selectedAutomation,
    stats,

    // Actions
    setSelectedAutomation,
    createAutomation,
    sendSMS,
    sendWhatsApp,
    sendEmail,
    triggerZapier,
    triggerWebhook,
    toggleAutomation,

    // Loading
    isLoading: automationsQuery.isLoading,
    isSending: sendNotificationMutation.isPending,

    // Status flags
    isEmpty: (automationsQuery.data?.length || 0) === 0,

    // Refetch
    refetch: () => {
      automationsQuery.refetch();
      logsQuery.refetch();
    },
  };
}

function inferAutomationType(taskType: string): Automation['type'] {
  const type = taskType.toLowerCase();
  if (type.includes('sms')) return 'twilio_sms';
  if (type.includes('whatsapp')) return 'twilio_whatsapp';
  if (type.includes('email')) return 'email';
  if (type.includes('zapier')) return 'zapier';
  return 'webhook';
}

export default useAIAutomation;
