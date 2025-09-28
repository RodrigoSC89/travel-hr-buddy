import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSystem {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  is_read: boolean;
  auto_dismiss?: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationSystem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Setup real-time subscription for alerts
    const alertsChannel = supabase
      .channel('maritime-alerts-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maritime_alerts'
        },
        (payload) => {
          console.log('New alert received:', payload);
          createNotificationFromAlert(payload.new);
        }
      )
      .subscribe();

    // Setup real-time subscription for maintenance
    const maintenanceChannel = supabase
      .channel('maintenance-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_records'
        },
        (payload) => {
          console.log('New maintenance record:', payload);
          createNotificationFromMaintenance(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, []);

  const loadNotifications = () => {
    // Load mock notifications - in production this would come from a notifications table
    const mockNotifications: NotificationSystem[] = [
      {
        id: '1',
        title: 'Sistema de IA Detectou Anomalia',
        description: 'Vibração anômala detectada no MV Atlântico Explorer. Recomenda-se inspeção imediata.',
        type: 'warning',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        is_read: false,
        action_url: '/fleet/alerts'
      },
      {
        id: '2',
        title: 'Manutenção Programada Concluída',
        description: 'Manutenção preventiva do MV Pacífico Star foi concluída com sucesso.',
        type: 'success',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        is_read: false
      },
      {
        id: '3',
        title: 'Certificado Próximo ao Vencimento',
        description: 'Certificado STCW do Capitão Silva vence em 30 dias.',
        type: 'warning',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        is_read: true
      },
      {
        id: '4',
        title: 'Nova Embarcação Registrada',
        description: 'MV Mediterrâneo foi adicionada à frota com sucesso.',
        type: 'info',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        is_read: true
      },
      {
        id: '5',
        title: 'Alerta Meteorológico Crítico',
        description: 'Tempestade categoria 3 detectada na rota do MV Índico Pioneer.',
        type: 'error',
        priority: 'critical',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        is_read: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    setIsLoading(false);
  };

  const createNotificationFromAlert = (alert: any) => {
    const notification: NotificationSystem = {
      id: `alert-${alert.id}`,
      title: `Alerta ${alert.severity.toUpperCase()}: ${alert.title}`,
      description: alert.description,
      type: alert.severity === 'critical' || alert.severity === 'emergency' ? 'error' : 'warning',
      priority: alert.severity === 'emergency' ? 'critical' : alert.severity,
      timestamp: new Date().toISOString(),
      is_read: false,
      action_url: '/fleet/alerts',
      metadata: { alert_id: alert.id, vessel_id: alert.vessel_id }
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show system toast for critical alerts
    if (alert.severity === 'critical' || alert.severity === 'emergency') {
      toast({
        title: "🚨 Alerta Crítico",
        description: notification.description,
        variant: "destructive"
      });
    }
  };

  const createNotificationFromMaintenance = (maintenance: any) => {
    const notification: NotificationSystem = {
      id: `maintenance-${maintenance.id}`,
      title: `Nova Manutenção Agendada`,
      description: `${maintenance.title} foi agendada para ${new Date(maintenance.scheduled_date).toLocaleDateString('pt-BR')}`,
      type: 'info',
      priority: maintenance.priority,
      timestamp: new Date().toISOString(),
      is_read: false,
      action_url: '/fleet/maintenance',
      metadata: { maintenance_id: maintenance.id, vessel_id: maintenance.vessel_id }
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);
    
    toast({
      title: "Notificações Marcadas",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    toast({
      title: "Notificação Removida",
      description: "A notificação foi removida com sucesso",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'info': return <Bell className="h-5 w-5 text-info" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationBorderColor = (type: string, priority: string) => {
    if (priority === 'critical') return 'border-l-4 border-l-destructive';
    
    switch (type) {
      case 'error': return 'border-l-4 border-l-destructive';
      case 'warning': return 'border-l-4 border-l-warning';
      case 'success': return 'border-l-4 border-l-success';
      case 'info': return 'border-l-4 border-l-info';
      default: return 'border-l-4 border-l-muted';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'critical') return notification.priority === 'critical';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold text-warning">{unreadCount}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-destructive">
                  {notifications.filter(n => n.priority === 'critical').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sistema IA</p>
                <p className="text-2xl font-bold text-success">Ativo</p>
              </div>
              <BrainCircuit className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Central de Notificações
          </h2>
          <p className="text-muted-foreground">
            Alertas inteligentes e notificações do sistema marítimo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Todas Lidas
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadNotifications}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não Lidas ({unreadCount})
            </Button>
            <Button 
              variant={filter === 'critical' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('critical')}
            >
              Críticas ({notifications.filter(n => n.priority === 'critical').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span>Carregando notificações...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação encontrada'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-lg transition-all duration-300 ${
                !notification.is_read ? 'bg-muted/30' : ''
              } ${getNotificationBorderColor(notification.type, notification.priority)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        
                        {notification.priority === 'critical' && (
                          <Badge variant="destructive" className="text-xs">
                            CRÍTICO
                          </Badge>
                        )}
                        
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        
                        <Badge variant="outline" className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {!notification.is_read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar Lida
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;