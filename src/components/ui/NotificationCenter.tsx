import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ship,
  Calendar,
  FileText,
  X,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  BrainCircuit,
  Shield,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "checklist_due" | "certificate_expiring" | "maintenance_due" | "compliance_alert" | 
        "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  isRead: boolean;
  is_read?: boolean;
  createdAt: Date;
  timestamp?: string;
  actionData?: unknown;
  action_url?: string;
  auto_dismiss?: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationCenterProps {
  userId?: string;
  variant?: "maritime" | "fleet" | "default";
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  className?: string;
}

/**
 * Unified NotificationCenter component
 * Consolidates maritime/notification-center.tsx and fleet/notification-center.tsx
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  userId = "default-user",
  variant = "default",
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className = ""
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const notificationChannel = supabase
      .channel("notifications-channel")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "intelligent_notifications",
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, handleNewNotification)
      .subscribe();

    // Setup maritime-specific subscriptions if variant is maritime or fleet
    let alertsChannel: unknown;
    let maintenanceChannel: unknown;

    if (variant === "maritime" || variant === "fleet") {
      alertsChannel = supabase
        .channel("maritime-alerts-notifications")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "maritime_alerts"
        }, (payload) => {
          createNotificationFromAlert(payload.new);
        })
        .subscribe();

      maintenanceChannel = supabase
        .channel("maintenance-notifications")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "maintenance_records"
        }, (payload) => {
          createNotificationFromMaintenance(payload.new);
        })
        .subscribe();
    }

    // Auto-refresh notifications
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadNotifications();
      }, refreshInterval);
    }

    return () => {
      supabase.removeChannel(notificationChannel);
      if (alertsChannel) supabase.removeChannel(alertsChannel);
      if (maintenanceChannel) supabase.removeChannel(maintenanceChannel);
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId, variant, autoRefresh, refreshInterval]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Load from intelligent_notifications table
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: Notification[] = data?.map(n => ({
        id: n.id,
        type: n.type as unknown,
        title: n.title,
        message: n.message,
        description: n.message,
        priority: n.priority as unknown,
        isRead: n.is_read,
        is_read: n.is_read,
        createdAt: new Date(n.created_at),
        timestamp: n.created_at,
        actionData: n.action_data,
        metadata: typeof n.metadata === "object" && n.metadata !== null && !Array.isArray(n.metadata)
          ? n.metadata as Record<string, unknown>
          : {}
      })) || [];

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (payload: unknown) => {
    const newNotification: Notification = {
      id: payload.new.id,
      type: payload.new.type,
      title: payload.new.title,
      message: payload.new.message,
      description: payload.new.description || payload.new.message,
      priority: payload.new.priority,
      isRead: false,
      createdAt: new Date(payload.new.created_at),
      timestamp: payload.new.created_at,
      actionData: payload.new.action_data
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    toast({
      title: newNotification.title,
      description: newNotification.message,
    });
  };

  const createNotificationFromAlert = (alert: unknown) => {
    const notification: Notification = {
      id: `alert-${alert.id}`,
      type: "compliance_alert",
      title: "Novo Alerta Marítimo",
      message: alert.message || "Um novo alerta foi criado",
      priority: alert.severity || "medium",
      isRead: false,
      createdAt: new Date(alert.created_at),
      actionData: alert
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const createNotificationFromMaintenance = (maintenance: unknown) => {
    const notification: Notification = {
      id: `maintenance-${maintenance.id}`,
      type: "maintenance_due",
      title: "Nova Manutenção Registrada",
      message: maintenance.description || "Uma nova manutenção foi registrada",
      priority: maintenance.priority || "medium",
      isRead: false,
      createdAt: new Date(maintenance.created_at),
      actionData: maintenance
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { /* Error handled silently */ }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Notificações marcadas como lidas",
        description: `${unreadIds.length} notificações foram marcadas como lidas`,
      });
    } catch (error) { /* Error handled silently */ }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) { /* Error handled silently */ }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "high":
      return <TrendingUp className="h-5 w-5 text-orange-500" />;
    case "medium":
      return <Activity className="h-5 w-5 text-yellow-500" />;
    case "low":
      return <TrendingDown className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-red-500 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-yellow-500 text-black";
    case "low":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "high") return n.priority === "high" || n.priority === "critical";
    return true;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando notificações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {variant === "maritime" && "Notificações do Sistema Marítimo"}
              {variant === "fleet" && "Notificações da Gestão de Frota"}
              {variant === "default" && "Todas as suas notificações"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">Não lidas</TabsTrigger>
              <TabsTrigger value="high">Prioridade Alta</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Sem notificações</h3>
              <p className="text-muted-foreground">
                {filter === "unread" 
                  ? "Você não tem notificações não lidas" 
                  : "Você está em dia com todas as notificações"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead
                    ? "bg-card border-border"
                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <Badge className={getPriorityBadgeColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message || notification.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleString("pt-BR")}
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Marcar como lida
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
