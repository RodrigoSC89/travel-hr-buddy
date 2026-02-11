import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  BellRing, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  X,
  Filter,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IntelligentNotification {
  id: string;
  type: "smart_alert" | "system_insight" | "recommendation_update" | "performance_summary";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  actionText?: string;
  actionType?: "navigate" | "configure" | "dismiss" | "learn";
  actionData?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  category?: string;
  estimatedReadTime?: string;
}

interface IntelligentNotificationCenterProps {
  onNavigate?: (module: string) => void;
}

export const IntelligentNotificationCenter: React.FC<IntelligentNotificationCenterProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<IntelligentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel("intelligent_notifications")
        .on("postgres_changes", 
          { 
            event: "INSERT", 
            schema: "public", 
            table: "intelligent_notifications",
            filter: `user_id=eq.${user.id}`
          }, 
          handleNewNotification
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load real notifications from Supabase
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intelligent_notifications not in generated types
      const mapped: IntelligentNotification[] = (data || []).map((n: any) => ({
        id: String(n.id),
        type: (n.notification_type || "system_insight") as IntelligentNotification["type"],
        priority: (n.priority || "medium") as IntelligentNotification["priority"],
        title: String(n.title || "Notificação"),
        message: String(n.message || ""),
        actionText: n.action_text ? String(n.action_text) : undefined,
        actionType: n.action_type ? String(n.action_type) as IntelligentNotification["actionType"] : undefined,
        actionData: n.action_data as Record<string, unknown> | undefined,
        isRead: Boolean(n.is_read),
        createdAt: new Date(n.created_at),
        category: n.category ? String(n.category) : undefined,
        estimatedReadTime: undefined,
      }));

      setNotifications(mapped);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase realtime payload shape
  const handleNewNotification = (payload: any) => {
    loadNotifications(); // Reload notifications
    
    toast({
      title: "Nova Notificação",
      description: String(payload.new?.title || ""),
    });
  };

  const generateIntelligentNotification = async (type: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke("intelligent-notifications", {
        body: {
          userId: user.id,
          type,
          priority: "medium",
          context: {
            currentModule: "dashboard",
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Notificação Gerada",
          description: data.notification.title,
        });
        loadNotifications();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar notificação",
        variant: "destructive",
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: "Todas Marcadas como Lidas",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notificação Dispensada",
      description: "A notificação foi removida",
    });
  };

  const handleNotificationAction = (notification: IntelligentNotification) => {
    if (notification.actionType === "navigate" && notification.actionData?.module) {
      onNavigate?.(String(notification.actionData.module));
      markAsRead(notification.id);
      toast({
        title: "Navegando",
        description: `Abrindo módulo: ${notification.actionData.module}`,
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
    case "critical": return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "high": return <BellRing className="w-4 h-4 text-warning" />;
    case "medium": return <Bell className="w-4 h-4 text-warning" />;
    default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-destructive/10 text-destructive";
    case "high": return "bg-warning/10 text-warning";
    case "medium": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    default: return "bg-primary/10 text-primary";
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
    case "unread":
      return notifications.filter(n => !n.isRead);
    case "high":
      return notifications.filter(n => n.priority === "high" || n.priority === "critical");
    default:
      return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Central de Notificações Inteligentes
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar Todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Não Lidas ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="high">
              Prioridade Alta
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação encontrada"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all duration-200 ${
                        !notification.isRead 
                          ? "border-l-4 border-l-primary bg-primary/5" 
                          : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getPriorityIcon(notification.priority)}
                              <h4 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h4>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {notification.category && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.createdAt.toLocaleString("pt-BR")}
                                </div>
                                {notification.estimatedReadTime && (
                                  <span>Leitura: {notification.estimatedReadTime}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {notification.actionText && (
                                  <Button
                                    onClick={() => handleNotificationAction(notification)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    {notification.actionText}
                                  </Button>
                                )}
                                
                                {!notification.isRead && (
                                  <Button
                                    onClick={() => markAsRead(notification.id)}
                                    size="sm"
                                    variant="ghost"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={() => dismissNotification(notification.id)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Demo buttons removed — production mode */}
      </CardContent>
    </Card>
  );
};

export default IntelligentNotificationCenter;