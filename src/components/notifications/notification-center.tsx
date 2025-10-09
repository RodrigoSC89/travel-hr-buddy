import React from "react";
import { Bell, Check, X, ExternalLink, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEnhancedNotifications, Notification } from "@/hooks/use-enhanced-notifications";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useEnhancedNotifications();

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClass = "h-4 w-4";
    switch (type) {
    case "success":
      return <Check className={`${iconClass} text-success`} />;
    case "warning":
      return <Bell className={`${iconClass} text-warning`} />;
    case "error":
      return <Bell className={`${iconClass} text-danger`} />;
    default:
      return <Bell className={`${iconClass} text-info`} />;
    }
  };

  const getNotificationBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
    case "success":
      return "default";
    case "warning":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse shadow-sm"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-popover-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 text-popover-foreground hover:bg-muted"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none text-popover-foreground">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs border-border text-popover-foreground hover:bg-muted"
                              onClick={() => {
                                if (notification.action?.href) {
                                  window.open(notification.action.href, "_blank");
                                }
                              }}
                            >
                              {notification.action.label}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-primary hover:bg-primary/10"
                              onClick={() => markAsRead(notification.id)}
                            >
                               Marcar lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t border-border p-2">
            <Button 
              variant="ghost" 
              className="w-full text-xs h-8 text-popover-foreground hover:bg-muted"
              onClick={() => {
              }}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};