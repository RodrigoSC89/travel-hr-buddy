import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Settings, 
  Shield, 
  Users, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  RotateCcw
} from "lucide-react";

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "urgent";
  is_read: boolean;
  created_at: string;
  action_type?: string;
  action_data?: any;
  metadata?: any;
}

export const EnhancedNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "urgent">("all");
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []).map(item => ({
        ...item,
        type: (item.type as "info" | "warning" | "error" | "success") || "info",
        priority: (item.priority as "low" | "medium" | "high" | "urgent") || "medium"
      })));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      toast({
        title: "Marcado como lido",
        description: "Notificação marcada como lida"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao marcar como lida",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao marcar todas como lidas",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Removida",
        description: "Notificação removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover notificação",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "error":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-success" />;
    default:
      return <Bell className="w-4 h-4 text-info" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent":
      return "bg-destructive text-destructive-foreground";
    case "high":
      return "bg-warning text-warning-foreground";
    case "medium":
      return "bg-info text-info-foreground";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
    case "unread":
      return !notif.is_read;
    case "high":
      return notif.priority === "high";
    case "urgent":
      return notif.priority === "urgent";
    default:
      return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    loadNotifications();

    // Subscription para notificações em tempo real
    const subscription = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intelligent_notifications"
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Central de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Central de Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} não lidas
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Gerencie suas notificações do sistema e mantenha-se atualizado
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadNotifications()}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          {["all", "unread", "high", "urgent"].map(filterType => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType as any)}
            >
              {filterType === "all" && "Todas"}
              {filterType === "unread" && "Não lidas"}
              {filterType === "high" && "Alta prioridade"}
              {filterType === "urgent" && "Urgente"}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  !notification.is_read 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-background border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <Badge 
                        className={getPriorityColor(notification.priority)}
                      >
                        {notification.priority}
                      </Badge>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString("pt-BR")}
                      </span>
                      {notification.action_type && (
                        <span className="flex items-center gap-1">
                          <Settings className="w-3 h-3" />
                          {notification.action_type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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