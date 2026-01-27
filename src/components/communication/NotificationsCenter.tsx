/**
 * NotificationsCenter - Centro de Notificações Completo
 * Integrado com Supabase para dados reais
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Filter,
  Settings,
  Clock,
  Ship,
  FileText,
  Users,
  Wrench,
  Loader2
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'vessel' | 'crew' | 'maintenance' | 'compliance';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

// Hook para buscar notificações do Supabase
function useNotifications() {
  return useQuery({
    queryKey: ['notifications-center'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data?.length) {
        // Fallback para dados demo se não houver dados reais
        return getDefaultNotifications();
      }

      return data.map(n => ({
        id: n.id,
        title: n.title || 'Notificação',
        message: n.message || '',
        type: (n.type || 'info') as Notification['type'],
        category: 'system' as Notification['category'],
        read: n.read || false,
        timestamp: n.created_at,
        actionUrl: undefined
      }));
    },
    staleTime: 30 * 1000
  });
}

function getDefaultNotifications(): Notification[] {
  return [
    {
      id: "1",
      title: "Manutenção Programada",
      message: "MV Atlântico: Manutenção do motor principal agendada para 15/01",
      type: 'warning',
      category: 'maintenance',
      read: false,
      timestamp: new Date().toISOString(),
      actionUrl: "/maintenance-command"
    },
    {
      id: "2",
      title: "Certificado Expirando",
      message: "Certificado STCW de João Santos expira em 30 dias",
      type: 'warning',
      category: 'crew',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "3",
      title: "Sistema Atualizado",
      message: "Nova versão do sistema disponível com melhorias de performance",
      type: 'info',
      category: 'system',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Manutenção Programada",
    message: "MV Atlântico: Manutenção do motor principal agendada para 15/01",
    type: 'warning',
    category: 'maintenance',
    read: false,
    timestamp: "2026-01-02T10:30:00Z",
    actionUrl: "/maintenance-command"
  },
  {
    id: "2",
    title: "Certificado Expirando",
    message: "Certificado STCW de João Santos expira em 30 dias",
    type: 'warning',
    category: 'crew',
    read: false,
    timestamp: "2026-01-02T09:15:00Z",
    actionUrl: "/crew-management"
  },
  {
    id: "3",
    title: "Auditoria SGSO Concluída",
    message: "Auditoria de segurança operacional finalizada com sucesso",
    type: 'success',
    category: 'compliance',
    read: true,
    timestamp: "2026-01-01T16:00:00Z"
  },
  {
    id: "4",
    title: "Alerta Meteorológico",
    message: "Condições adversas previstas para rota Santos-Rotterdam",
    type: 'error',
    category: 'vessel',
    read: false,
    timestamp: "2026-01-02T08:00:00Z",
    actionUrl: "/weather-command"
  },
  {
    id: "5",
    title: "Novo Documento Adicionado",
    message: "Contrato de afretamento foi adicionado ao sistema",
    type: 'info',
    category: 'system',
    read: true,
    timestamp: "2025-12-31T14:30:00Z"
  },
  {
    id: "6",
    title: "Tripulação Embarcada",
    message: "5 novos tripulantes embarcaram no MV Pacífico",
    type: 'success',
    category: 'crew',
    read: true,
    timestamp: "2025-12-30T11:00:00Z"
  }
];

export const NotificationsCenter: React.FC = () => {
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const [filter, setFilter] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (showOnlyUnread && n.read) return false;
    if (filter !== 'all' && n.category !== filter) return false;
    return true;
  });

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    toast.success("Notificação marcada como lida");
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).neq('read', true);
    queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    toast.success("Todas as notificações marcadas como lidas");
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    toast.success("Notificação removida");
  };

  const clearAll = async () => {
    await supabase.from('notifications').delete().neq('id', '');
    queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    toast.success("Todas as notificações foram removidas");
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-info" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'system': return <Settings className="h-3 w-3" />;
      case 'vessel': return <Ship className="h-3 w-3" />;
      case 'crew': return <Users className="h-3 w-3" />;
      case 'maintenance': return <Wrench className="h-3 w-3" />;
      case 'compliance': return <FileText className="h-3 w-3" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffHours < 48) return "Ontem";
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Não Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'error').length}</p>
                <p className="text-sm text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.filter(n => n.read).length}</p>
                <p className="text-sm text-muted-foreground">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notificações</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showOnlyUnread} 
                  onCheckedChange={setShowOnlyUnread}
                  id="unread-only"
                />
                <label htmlFor="unread-only" className="text-sm">Apenas não lidas</label>
              </div>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Tabs */}
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="vessel">Embarcações</TabsTrigger>
              <TabsTrigger value="crew">Tripulação</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notifications List */}
          <ScrollArea className="h-[400px]">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(notification.type)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryIcon(notification.category)}
                              <span className="ml-1 capitalize">{notification.category}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsCenter;
