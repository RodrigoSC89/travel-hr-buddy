import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  action_data?: any;
  expires_at?: string;
}

interface IntelligentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
  action_type?: string;
  action_data?: any;
  action_text?: string;
}

export const RealTimeNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [intelligentNotifications, setIntelligentNotifications] = useState<IntelligentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar notificações do banco
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Carregar notificações regulares
      const { data: regularNotifications, error: regularError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (regularError) throw regularError;

      // Carregar notificações inteligentes
      const { data: smartNotifications, error: smartError } = await supabase
        .from('intelligent_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (smartError) throw smartError;

      setNotifications((regularNotifications || []) as Notification[]);
      setIntelligentNotifications(smartNotifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notificações',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string, isIntelligent = false) => {
    try {
      const table = isIntelligent ? 'intelligent_notifications' : 'notifications';
      const field = isIntelligent ? 'is_read' : 'read';
      
      const { error } = await supabase
        .from(table)
        .update({ [field]: true })
        .eq('id', notificationId);

      if (error) throw error;

      if (isIntelligent) {
        setIntelligentNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      } else {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }

      toast({
        title: 'Sucesso',
        description: 'Notificação marcada como lida'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar como lida',
        variant: 'destructive'
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Marcar notificações regulares
      const { error: regularError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (regularError) throw regularError;

      // Marcar notificações inteligentes
      const { error: smartError } = await supabase
        .from('intelligent_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (smartError) throw smartError;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setIntelligentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas como lidas',
        variant: 'destructive'
      });
    }
  };

  // Executar ação de notificação inteligente
  const executeAction = async (notification: IntelligentNotification) => {
    if (!notification.action_type || !notification.action_data) return;

    try {
      // Aqui você pode implementar diferentes tipos de ações
      switch (notification.action_type) {
        case 'navigate':
          window.location.href = notification.action_data.url;
          break;
        case 'download':
          window.open(notification.action_data.downloadUrl, '_blank');
          break;
        case 'external_link':
          window.open(notification.action_data.url, '_blank');
          break;
        default:
          console.log('Action executed:', notification.action_type, notification.action_data);
      }

      // Marcar como lida após executar ação
      await markAsRead(notification.id, true);
    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível executar a ação',
        variant: 'destructive'
      });
    }
  };

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscription para notificações regulares
    const regularSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Notification change received:', payload);
          loadNotifications();
        }
      )
      .subscribe();

    // Subscription para notificações inteligentes
    const intelligentSubscription = supabase
      .channel('intelligent_notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'intelligent_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Intelligent notification change received:', payload);
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      regularSubscription.unsubscribe();
      intelligentSubscription.unsubscribe();
    };
  }, [user]);

  // Filtrar notificações
  const getFilteredNotifications = (notifs: any[], isIntelligent = false) => {
    let filtered = notifs.filter(n => {
      const isRead = isIntelligent ? n.is_read : n.read;
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           n.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (filter) {
        case 'unread':
          return !isRead;
        case 'priority':
          return n.priority === 'high' || n.priority === 'urgent';
        default:
          return true;
      }
    });

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-orange-500 text-white">Alto</Badge>;
      case 'medium':
        return <Badge variant="outline">Médio</Badge>;
      default:
        return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  const unreadRegularCount = notifications.filter(n => !n.read).length;
  const unreadIntelligentCount = intelligentNotifications.filter(n => !n.is_read).length;
  const totalUnread = unreadRegularCount + unreadIntelligentCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas notificações em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {totalUnread} não lidas
          </Badge>
          {totalUnread > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              size="sm"
            >
              Não lidas
            </Button>
            <Button
              variant={filter === 'priority' ? 'default' : 'outline'}
              onClick={() => setFilter('priority')}
              size="sm"
            >
              Prioridade
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">
            Notificações Regulares ({unreadRegularCount})
          </TabsTrigger>
          <TabsTrigger value="intelligent">
            Notificações Inteligentes ({unreadIntelligentCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredNotifications(notifications).map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-primary bg-accent/20' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Badge variant="default" className="bg-primary text-white">
                          Nova
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {getFilteredNotifications(notifications).length === 0 && (
                <Card className="p-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
                  <p className="text-muted-foreground">
                    {filter === 'unread' 
                      ? 'Todas as notificações foram lidas!' 
                      : 'Você não possui notificações no momento.'
                    }
                  </p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="intelligent" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredNotifications(intelligentNotifications, true).map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 transition-all ${
                    !notification.is_read ? 'border-l-4 border-l-primary bg-accent/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </p>
                        
                        {notification.action_type && notification.action_text && (
                          <Button 
                            onClick={() => executeAction(notification)}
                            size="sm"
                            className="mr-2"
                          >
                            {notification.action_text}
                          </Button>
                        )}
                        
                        {!notification.is_read && (
                          <Button 
                            onClick={() => markAsRead(notification.id, true)}
                            variant="outline"
                            size="sm"
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Badge variant="default" className="bg-primary text-white">
                          Nova
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {getFilteredNotifications(intelligentNotifications, true).length === 0 && (
                <Card className="p-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação inteligente</h3>
                  <p className="text-muted-foreground">
                    As notificações inteligentes aparecerão aqui baseadas na sua atividade.
                  </p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};