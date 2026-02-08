/**
 * ActionPlanWithNotifications - Planos de Ação com notificações automáticas
 * Integra Email, SMS, WhatsApp (Twilio) e Zapier
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ClipboardList,
  Send,
  Mail,
  MessageSquare,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  User,
  Calendar,
  Loader2,
  Zap,
  Bell,
  TrendingUp,
} from 'lucide-react';

interface ActionPlan {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  responsible_id?: string | null;
  responsible_name?: string | null;
  responsible_email?: string | null;
  due_date?: string | null;
  status?: string | null;
  notification_sent?: boolean | null;
  escalation_sent?: boolean | null;
  created_at?: string | null;
  completed_at?: string | null;
  vessel_id?: string | null;
  vessel_name?: string | null;
  source_module?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  completion_date?: string | null;
}

interface NotificationConfig {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  zapier: boolean;
  escalation_hours: number;
}

interface ActionPlanWithNotificationsProps {
  vesselId?: string;
  category?: string;
  onActionComplete?: () => void;
}

export function ActionPlanWithNotifications({
  vesselId,
  category,
  onActionComplete,
}: ActionPlanWithNotificationsProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyConfig, setNotifyConfig] = useState<NotificationConfig>({
    email: true,
    sms: false,
    whatsapp: false,
    zapier: false,
    escalation_hours: 24,
  });

  // Fetch action plans
  const { data: actionPlans, isLoading } = useQuery({
    queryKey: ['action-plans', vesselId, category],
    queryFn: async () => {
      let query = supabase
        .from('action_items')
        .select('*')
        .order('due_date', { ascending: true });

      if (vesselId) query = query.eq('vessel_id', vesselId);
      if (category) query = query.eq('source_module', category);

      const { data, error } = await query;

      if (error) return [];
      return data || [];
    },
    staleTime: 30000,
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (params: { planId: string; config: NotificationConfig }) => {
      const { data, error } = await supabase.functions.invoke('responsibility-matrix-dispatch', {
        body: {
          action: 'notify',
          actionPlanId: params.planId,
          channels: {
            email: params.config.email,
            sms: params.config.sms,
            whatsapp: params.config.whatsapp,
            zapier: params.config.zapier,
          },
          escalationHours: params.config.escalation_hours,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificações enviadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      setIsNotifyOpen(false);
    },
    onError: () => {
      toast.error('Erro ao enviar notificações');
    },
  });

  // Complete action mutation
  const completeActionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_items')
        .update({
          status: 'completed',
          completion_date: new Date().toISOString(),
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ação marcada como concluída!');
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      onActionComplete?.();
    },
  });

  // Stats
  const stats = {
    total: actionPlans?.length || 0,
    pending: actionPlans?.filter((p: any) => p.status === 'pending').length || 0,
    overdue: actionPlans?.filter((p: any) => p.status === 'overdue' || (p.due_date && new Date(p.due_date) < new Date())).length || 0,
    completed: actionPlans?.filter((p: any) => p.status === 'completed').length || 0,
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Crítica</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary">Média</Badge>;
      case 'low':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'completed';
    
    if (isOverdue || status === 'overdue') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Atrasado
        </Badge>
      );
    }

    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-success text-success-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Concluído
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Em Andamento
          </Badge>
        );
      case 'escalated':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Escalado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
    }
  };

  const handleNotify = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setIsNotifyOpen(true);
  };

  const handleSendNotification = () => {
    if (!selectedPlan) return;
    sendNotificationMutation.mutate({ planId: selectedPlan.id, config: notifyConfig });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-warning/10">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-destructive/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Atrasados</p>
              <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-success/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Taxa de Conclusão</span>
          <span className="text-sm text-muted-foreground">{completionRate.toFixed(0)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </Card>

      {/* Action Plans List */}
      <div className="space-y-3">
        {actionPlans?.map((plan: any) => (
          <Card
            key={plan.id}
            className={`p-4 ${
              plan.status === 'overdue' || new Date(plan.due_date) < new Date()
                ? 'border-destructive/50 bg-destructive/5'
                : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityBadge(plan.priority)}
                  {getStatusBadge(plan.status, plan.due_date)}
                  {plan.notification_sent && (
                    <Badge variant="outline" className="text-xs">
                      <Bell className="h-3 w-3 mr-1" />
                      Notificado
                    </Badge>
                  )}
                  {plan.escalation_sent && (
                    <Badge variant="destructive" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Escalado
                    </Badge>
                  )}
                </div>

                <h4 className="font-medium">{plan.title}</h4>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {plan.responsible_name || 'Não atribuído'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(plan.due_date).toLocaleDateString('pt-BR')}
                  </span>
                  {plan.vessel_name && (
                    <span className="flex items-center gap-1">
                      🚢 {plan.vessel_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNotify(plan)}
                  disabled={plan.status === 'completed'}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Notificar
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => completeActionMutation.mutate(plan.id)}
                  disabled={plan.status === 'completed' || completeActionMutation.isPending}
                >
                  {completeActionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Concluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notification Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Configurar Notificação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedPlan && (
              <Card className="p-3 bg-muted/50">
                <p className="font-medium">{selectedPlan.title}</p>
                <p className="text-sm text-muted-foreground">
                  Responsável: {selectedPlan.responsible_name || selectedPlan.responsible_email || 'Não atribuído'}
                </p>
              </Card>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium">Canais de Notificação</Label>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Email</span>
                </div>
                <Switch
                  checked={notifyConfig.email}
                  onCheckedChange={(v) => setNotifyConfig({ ...notifyConfig, email: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>SMS (Twilio)</span>
                </div>
                <Switch
                  checked={notifyConfig.sms}
                  onCheckedChange={(v) => setNotifyConfig({ ...notifyConfig, sms: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>WhatsApp (Twilio)</span>
                </div>
                <Switch
                  checked={notifyConfig.whatsapp}
                  onCheckedChange={(v) => setNotifyConfig({ ...notifyConfig, whatsapp: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>Zapier Webhook</span>
                </div>
                <Switch
                  checked={notifyConfig.zapier}
                  onCheckedChange={(v) => setNotifyConfig({ ...notifyConfig, zapier: v })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Escalação automática após (horas)</Label>
              <Select
                value={String(notifyConfig.escalation_hours)}
                onValueChange={(v) => setNotifyConfig({ ...notifyConfig, escalation_hours: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="72">72 horas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se não houver resposta, o backup será notificado automaticamente.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={sendNotificationMutation.isPending}
            >
              {sendNotificationMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Notificações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock data
function getMockActionPlans(): ActionPlan[] {
  return [
    {
      id: '1',
      title: 'Renovar certificado STCW - João Silva',
      description: 'Certificado STCW expira em 30 dias. Agendar renovação urgente.',
      category: 'compliance',
      priority: 'high',
      responsible_id: 'u1',
      responsible_name: 'Maria Santos',
      responsible_email: 'maria@company.com',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      notification_sent: true,
      escalation_sent: false,
      created_at: new Date().toISOString(),
      vessel_name: 'MV Atlantic Star',
    },
    {
      id: '2',
      title: 'Corrigir não-conformidade PSC #47',
      description: 'Deficiência identificada: extintores de incêndio vencidos no convés principal.',
      category: 'safety',
      priority: 'critical',
      responsible_id: 'u2',
      responsible_name: 'Carlos Lima',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'overdue',
      notification_sent: true,
      escalation_sent: true,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      vessel_name: 'MV Pacific Dawn',
    },
    {
      id: '3',
      title: 'Manutenção preventiva - Motor Auxiliar #2',
      description: 'Manutenção de 5000h programada conforme manual do fabricante.',
      category: 'maintenance',
      priority: 'medium',
      responsible_id: 'u3',
      responsible_name: 'Chief Engineer',
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      notification_sent: false,
      escalation_sent: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Treinamento SOPEP concluído',
      description: 'Treinamento de resposta a derramamento de óleo realizado com toda a tripulação.',
      category: 'training',
      priority: 'low',
      responsible_id: 'u4',
      responsible_name: 'Safety Officer',
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      notification_sent: true,
      escalation_sent: false,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export default ActionPlanWithNotifications;
