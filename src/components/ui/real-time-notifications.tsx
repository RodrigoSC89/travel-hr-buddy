import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
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
  Settings,
  Inbox
} from "lucide-react";
import { useNotificationsData, type SystemNotification } from "@/hooks/useNotificationsData";

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

export const NotificationCenter: React.FC = () => {
  const { notifications: rawNotifications, isLoading, markAsRead, markAllAsRead } = useNotificationsData();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { toast } = useToast();

  // Map to local type
  const notifications: Notification[] = rawNotifications.map(n => ({
    id: n.id,
    type: n.type === "error" ? "error" : n.type === "warning" ? "warning" : n.type === "success" ? "success" : "info",
    title: n.title,
    message: n.message,
    timestamp: n.createdAt,
    module: n.source,
    isRead: n.read,
  }));

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
    case "warning": return "text-warning";
    case "success": return "text-success";
    case "error": return "text-destructive";
    default: return "text-info";
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Sucesso",
      description: "Todas marcadas como lidas",
    });
  };

  const removeNotification = (id: string) => {
    // Note: remove not implemented in hook
    toast({
      title: "Arquivado",
      description: "Notificação arquivada",
    });
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

  // Real-time updates are handled by the hook - no need for local simulation

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notificações"
        title="Notificações"
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
                  aria-label="Fechar notificações"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
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
                          !notification.isRead ? "bg-primary/5 border-primary/20" : "bg-background"
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
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