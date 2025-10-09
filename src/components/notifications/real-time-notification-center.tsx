import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  priority: "low" | "medium" | "high" | "urgent";
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
  const [filter, setFilter] = useState<"all" | "unread" | "priority">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Carregar notificações do banco
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Carregar notificações regulares
      const { data: regularNotifications, error: regularError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (regularError) throw regularError;

      // Carregar notificações inteligentes
      const { data: smartNotifications, error: smartError } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (smartError) throw smartError;

      setNotifications((regularNotifications || []) as Notification[]);
      setIntelligentNotifications(smartNotifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string, isIntelligent = false) => {
    try {
      const table = isIntelligent ? "intelligent_notifications" : "notifications";
      const field = isIntelligent ? "is_read" : "read";
      
      const { error } = await supabase
        .from(table)
        .update({ [field]: true })
        .eq("id", notificationId);

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
        title: "Sucesso",
        description: "Notificação marcada como lida"
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida",
        variant: "destructive"
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Marcar notificações regulares
      const { error: regularError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (regularError) throw regularError;

      // Marcar notificações inteligentes
      const { error: smartError } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (smartError) throw smartError;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setIntelligentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas",
        variant: "destructive"
      });
    }
  };

  // Executar ação de notificação inteligente
  const executeAction = async (notification: IntelligentNotification) => {
    if (!notification.action_type || !notification.action_data) return;

    try {
      // Aqui você pode implementar diferentes tipos de ações
      switch (notification.action_type) {
      case "navigate":
        navigate(notification.action_data.url);
        break;
      case "download":
        window.open(notification.action_data.downloadUrl, "_blank");
        break;
      case "external_link":
        window.open(notification.action_data.url, "_blank");
        break;
      default:}

      // Marcar como lida após executar ação
      await markAsRead(notification.id, true);
    } catch (error) {
      console.error("Error executing action:", error);
      toast({
        title: "Erro",
        description: "Não foi possível executar a ação",
        variant: "destructive"
      });
    }
  };

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscription para notificações regulares
    const regularSubscription = supabase
      .channel("notifications")
      .on("postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "notifications",
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {loadNotifications();
        }
      )
      .subscribe();

    // Subscription para notificações inteligentes
    const intelligentSubscription = supabase
      .channel("intelligent_notifications")
      .on("postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "intelligent_notifications",
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {loadNotifications();
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
    const filtered = notifs.filter(n => {
      const isRead = isIntelligent ? n.is_read : n.read;
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           n.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (filter) {
      case "unread":
        return !isRead;
      case "priority":
        return n.priority === "high" || n.priority === "urgent";
      default:
        return true;
      }
    });

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
    case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case "urgent":
      return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
    case "high":
      return <Badge variant="secondary" className="bg-orange-500 text-azure-50 text-xs">Alto</Badge>;
    case "medium":
      return <Badge variant="outline" className="text-xs">Médio</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Baixo</Badge>;
    }
  };

  const unreadRegularCount = notifications.filter(n => !n.read).length;
  const unreadIntelligentCount = intelligentNotifications.filter(n => !n.is_read).length;
  const totalUnread = unreadRegularCount + unreadIntelligentCount;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative p-2 hover:bg-accent transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow-sm"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {totalUnread > 0 && (
              <Button 
                onClick={markAllAsRead} 
                variant="ghost" 
                size="sm"
                className="text-xs h-auto p-1"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded bg-background"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-1 mt-2">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              size="sm"
              className="text-xs h-6 px-2"
            >
              Todas
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              onClick={() => setFilter("unread")}
              size="sm"
              className="text-xs h-6 px-2"
            >
              Não lidas
            </Button>
            <Button
              variant={filter === "priority" ? "default" : "ghost"}
              onClick={() => setFilter("priority")}
              size="sm"
              className="text-xs h-6 px-2"
            >
              Prioridade
            </Button>
          </div>
        </div>

        <Tabs defaultValue="regular" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="regular" className="text-xs">
                Regulares ({unreadRegularCount})
              </TabsTrigger>
              <TabsTrigger value="intelligent" className="text-xs">
                Inteligentes ({unreadIntelligentCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="regular" className="mt-0">
            <ScrollArea className="h-80">
              <div className="p-4 pt-2 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-2 border rounded">
                        <div className="animate-pulse space-y-1">
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                          <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {getFilteredNotifications(notifications).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-2 border rounded text-xs transition-all cursor-pointer hover:bg-accent/50 ${
                          !notification.read ? "border-l-2 border-l-primary bg-accent/20" : ""
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <h4 className={`font-medium truncate ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {getFilteredNotifications(notifications).length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="text-sm font-medium mb-1">Nenhuma notificação encontrada</h4>
                        <p className="text-xs text-muted-foreground">
                          {filter === "unread" 
                            ? "Todas as notificações foram lidas!" 
                            : "Você não possui notificações no momento."
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="intelligent" className="mt-0">
            <ScrollArea className="h-80">
              <div className="p-4 pt-2 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-2 border rounded">
                        <div className="animate-pulse space-y-1">
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                          <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {getFilteredNotifications(intelligentNotifications, true).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-2 border rounded text-xs transition-all ${
                          !notification.is_read ? "border-l-2 border-l-primary bg-accent/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <h4 className={`font-medium truncate ${!notification.is_read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {new Date(notification.created_at).toLocaleString("pt-BR")}
                            </p>
                            
                            <div className="flex gap-1">
                              {notification.action_type && notification.action_text && (
                                <Button 
                                  onClick={() => executeAction(notification)}
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  {notification.action_text}
                                </Button>
                              )}
                              
                              {!notification.is_read && (
                                <Button 
                                  onClick={() => markAsRead(notification.id, true)}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  Marcar como lida
                                </Button>
                              )}
                            </div>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {getFilteredNotifications(intelligentNotifications, true).length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h4 className="text-sm font-medium mb-1">Nenhuma notificação inteligente</h4>
                        <p className="text-xs text-muted-foreground">
                          As notificações inteligentes aparecerão aqui baseadas na sua atividade.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};