/**
 * useAIAutomation - Hook de IA para Automações
 * Zapier, Twilio SMS/WhatsApp, Email, Webhooks
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Automation {
  id: string;
  name: string;
  type: 'zapier' | 'twilio_sms' | 'twilio_whatsapp' | 'email' | 'webhook';
  trigger: string;
  action: string;
  config: Record<string, any>;
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
  response?: any;
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
  body?: any;
}

export function useAIAutomation() {
  const queryClient = useQueryClient();
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  // Query: Listar automações
  const automationsQuery = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return getMockAutomations();
      return data?.length ? data : getMockAutomations();
    },
    staleTime: 60000,
  });

  // Query: Logs de automação
  const logsQuery = useQuery({
    queryKey: ['automation-logs'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('automation_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) return [];
      return data || [];
    },
  });

  // Mutation: Criar automação
  const createAutomationMutation = useMutation({
    mutationFn: async (automation: Omit<Automation, 'id' | 'created_at' | 'trigger_count'>) => {
      const { data, error } = await (supabase as any)
        .from('automations')
        .insert({
          ...automation,
          trigger_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('✅ Automação criada com sucesso!');
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
  });

  // Mutation: Trigger Zapier
  const triggerZapierMutation = useMutation({
    mutationFn: async (params: { webhookUrl: string; data: any }) => {
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
  });

  // Mutation: Toggle automação
  const toggleAutomationMutation = useMutation({
    mutationFn: async (params: { id: string; enabled: boolean }) => {
      const { error } = await (supabase as any)
        .from('automations')
        .update({ enabled: params.enabled })
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success(params.enabled ? '✅ Automação ativada' : '⏸️ Automação pausada');
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
    async (webhookUrl: string, data: any) => {
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
  const stats = {
    total: automationsQuery.data?.length || 0,
    active: automationsQuery.data?.filter((a: any) => a.enabled).length || 0,
    totalTriggers: automationsQuery.data?.reduce((sum: number, a: any) => sum + (a.trigger_count || 0), 0) || 0,
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

    // Refetch
    refetch: () => {
      automationsQuery.refetch();
      logsQuery.refetch();
    },
  };
}

function getMockAutomations(): Automation[] {
  return [
    {
      id: '1',
      name: 'Alerta Certificado Expirando',
      type: 'twilio_sms',
      trigger: 'certificate_expiring',
      action: 'Enviar SMS para responsável',
      config: { days_before: 30, recipients: ['gestor', 'tripulante'] },
      enabled: true,
      last_triggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      trigger_count: 45,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Sync CRM via Zapier',
      type: 'zapier',
      trigger: 'new_crew_member',
      action: 'Atualizar CRM e planilhas',
      config: { webhook_url: 'https://hooks.zapier.com/...' },
      enabled: true,
      trigger_count: 120,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Notificação de Anomalia',
      type: 'email',
      trigger: 'anomaly_detected',
      action: 'Email para equipe técnica',
      config: { recipients: ['tech@company.com'] },
      enabled: true,
      trigger_count: 15,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export default useAIAutomation;
