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
  actionData?: any;
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
      // For demo purposes, we'll generate some mock notifications
      const mockNotifications: IntelligentNotification[] = [
        {
          id: "1",
          type: "smart_alert",
          priority: "high",
          title: "Oportunidade de Economia Detectada",
          message: "Identificamos uma oportunidade de economizar R$ 2.400 em viagens corporativas baseado no seu padrão de uso.",
          actionText: "Ver Detalhes",
          actionType: "navigate",
          actionData: { module: "travel" },
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          category: "Economia",
          estimatedReadTime: "1min"
        },
        {
          id: "2",
          type: "system_insight",
          priority: "medium",
          title: "Certificados Expiram em Breve",
          message: "Você tem 3 certificados que expiram nos próximos 30 dias. Renovar agora evitará problemas de compliance.",
          actionText: "Gerenciar Certificados",
          actionType: "navigate",
          actionData: { module: "hr" },
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          category: "Compliance",
          estimatedReadTime: "30s"
        },
        {
          id: "3",
          type: "recommendation_update",
          priority: "low",
          title: "Novas Recomendações Disponíveis",
          message: "Baseado na sua atividade recente, temos 5 novas recomendações para otimizar seu fluxo de trabalho.",
          actionText: "Ver Recomendações",
          actionType: "navigate",
          actionData: { module: "dashboard" },
          isRead: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          category: "Produtividade",
          estimatedReadTime: "2min"
        },
        {
          id: "4",
          type: "performance_summary",
          priority: "medium",
          title: "Relatório Semanal de Performance",
          message: "Sua eficiência aumentou 15% esta semana! Veja as métricas completas e continue melhorando.",
          actionText: "Ver Relatório",
          actionType: "navigate",
          actionData: { module: "analytics" },
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          category: "Performance",
          estimatedReadTime: "3min"
        }
      ];

      setNotifications(mockNotifications);
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

  const handleNewNotification = (payload: Record<string, unknown>) => {
    loadNotifications(); // Reload notifications
    
    toast({
      title: "Nova Notificação",
      description: payload.new.title,
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
      onNavigate?.(notification.actionData.module);
      markAsRead(notification.id);
      toast({
        title: "Navegando",
        description: `Abrindo módulo: ${notification.actionData.module}`,
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
    case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "high": return <BellRing className="w-4 h-4 text-orange-500" />;
    case "medium": return <Bell className="w-4 h-4 text-yellow-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
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

        {/* Demo buttons for testing */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3">Gerar Notificações de Teste</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => generateIntelligentNotification("smart_alert")}
              size="sm"
              variant="outline"
            >
              Alerta Inteligente
            </Button>
            <Button
              onClick={() => generateIntelligentNotification("system_insight")}
              size="sm"
              variant="outline"
            >
              Insight do Sistema
            </Button>
            <Button
              onClick={() => generateIntelligentNotification("recommendation_update")}
              size="sm"
              variant="outline"
            >
              Atualização de Recomendação
            </Button>
            <Button
              onClick={() => generateIntelligentNotification("performance_summary")}
              size="sm"
              variant="outline"
            >
              Resumo de Performance
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentNotificationCenter;