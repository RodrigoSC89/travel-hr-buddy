import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ship,
  Calendar,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'checklist_due' | 'certificate_expiring' | 'maintenance_due' | 'compliance_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  actionData?: any;
}

export const NotificationCenter = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'intelligent_notifications',
        filter: `user_id=eq.${userId}`
      }, handleNewNotification)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load from intelligent_notifications table
      const { data, error } = await supabase
        .from('intelligent_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: Notification[] = data?.map(n => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        message: n.message,
        priority: n.priority as any,
        isRead: n.is_read,
        createdAt: new Date(n.created_at),
        actionData: n.action_data
      })) || [];

      // Add some mock maritime-specific notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: 'mock-1',
          type: 'checklist_due',
          title: 'Checklist de Segurança Vencido',
          message: 'O checklist diário de segurança do MV Atlantic Explorer está vencido há 2 horas.',
          priority: 'high',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          actionData: { checklistId: 'checklist-1', vesselId: 'vessel-1' }
        },
        {
          id: 'mock-2',
          type: 'certificate_expiring',
          title: 'Certificado Vencendo',
          message: 'Certificado STCW do Oficial José Silva vence em 15 dias.',
          priority: 'medium',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: 'mock-3',
          type: 'maintenance_due',
          title: 'Manutenção Programada',
          message: 'Manutenção preventiva dos motores principais agendada para amanhã.',
          priority: 'medium',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        }
      ];

      const allNotifications = [...formattedNotifications, ...mockNotifications]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (payload: any) => {
    const newNotification: Notification = {
      id: payload.new.id,
      type: payload.new.type,
      title: payload.new.title,
      message: payload.new.message,
      priority: payload.new.priority,
      isRead: false,
      createdAt: new Date(payload.new.created_at),
      actionData: payload.new.action_data
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast for high priority notifications
    if (newNotification.priority === 'high' || newNotification.priority === 'critical') {
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.priority === 'critical' ? 'destructive' : 'default'
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Only update if it's not a mock notification
      if (!notificationId.startsWith('mock-')) {
        const { error } = await supabase
          .from('intelligent_notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) throw error;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.isRead && !n.id.startsWith('mock-'))
        .map(n => n.id);

      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('intelligent_notifications')
          .update({ is_read: true })
          .in('id', unreadIds);

        if (error) throw error;
      }

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checklist_due': return <FileText className="h-4 w-4" />;
      case 'certificate_expiring': return <FileText className="h-4 w-4" />;
      case 'maintenance_due': return <Calendar className="h-4 w-4" />;
      case 'compliance_alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = (filter: string) => {
    return notifications.filter(n => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'high') return n.priority === 'high' || n.priority === 'critical';
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Central de Notificações</h2>
          <p className="text-muted-foreground">
            Alertas e notificações importantes do sistema marítimo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {unreadCount} não lidas
          </Badge>
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Não Lidas ({filteredNotifications('unread').length})
          </TabsTrigger>
          <TabsTrigger value="high">
            Alta Prioridade ({filteredNotifications('high').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                            {getPriorityIcon(notification.priority)}
                            <span className="ml-1 capitalize">{notification.priority}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.createdAt.toLocaleDateString('pt-BR')} às{' '}
                            {notification.createdAt.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="space-y-3">
            {filteredNotifications('unread').map((notification) => (
              <Card 
                key={notification.id} 
                className="cursor-pointer bg-blue-50 border-blue-200"
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {getPriorityIcon(notification.priority)}
                          <span className="ml-1 capitalize">{notification.priority}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <div className="space-y-3">
            {filteredNotifications('high').map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer border-red-200 ${
                  !notification.isRead ? 'bg-red-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {getPriorityIcon(notification.priority)}
                          <span className="ml-1 capitalize">{notification.priority}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};