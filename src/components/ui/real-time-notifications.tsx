import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  Users,
  Ship,
  Shield,
  Zap,
  Target,
  Settings
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  module: string;
  isRead: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "Certificação Próxima do Vencimento",
    message: "Certificado STCW do Oficial João Silva vence em 15 dias",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    module: "hr",
    isRead: false,
    action: {
      label: "Ver Detalhes",
      callback: () => console.log("Navigate to HR module")
    }
  },
  {
    id: "2",
    type: "success",
    title: "IA Detectou Economia",
    message: "Otimização automática economizou R$ 15.000 em rotações",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    module: "analytics",
    isRead: false
  },
  {
    id: "3",
    type: "info",
    title: "Nova Embarcação Adicionada",
    message: "MV Ocean Pioneer foi registrada no sistema",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    module: "maritime",
    isRead: true
  },
  {
    id: "4",
    type: "warning",
    title: "Sistema IoT Offline",
    message: "Sensor de temperatura do Porto de Santos está offline",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    module: "iot",
    isRead: false,
    action: {
      label: "Verificar",
      callback: () => console.log("Navigate to IoT module")
    }
  },
  {
    id: "5",
    type: "success",
    title: "Blockchain Verificado",
    message: "Documento de manifesto foi certificado com sucesso",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    module: "blockchain",
    isRead: true
  }
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => 
    filter === "all" || !n.isRead
  );

  const getIcon = (type: string) => {
    switch (type) {
    case "warning": return AlertTriangle;
    case "success": return CheckCircle;
    case "error": return AlertTriangle;
    default: return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
    case "warning": return "text-yellow-500";
    case "success": return "text-green-500";
    case "error": return "text-red-500";
    default: return "text-blue-500";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldShowNotification = Math.random() < 0.1; // 10% de chance a cada 30s
      
      if (shouldShowNotification) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.7 ? "warning" : "info",
          title: "Nova Atualização do Sistema",
          message: "Dados atualizados em tempo real",
          timestamp: new Date(),
          module: "system",
          isRead: false
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(filter === "all" ? "unread" : "all")}
                >
                  {filter === "all" ? "Não lidas" : "Todas"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full mt-2"
              >
                Marcar todas como lidas
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.isRead ? "bg-blue-50 border-blue-200" : "bg-background"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-4 w-4 mt-1 ${getIconColor(notification.type)}`} />
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.module}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                              </div>
                              
                              {notification.action && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.action?.callback();
                                  }}
                                  className="text-xs"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};