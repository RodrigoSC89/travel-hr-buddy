import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check } from "lucide-react";
import { priceAlertsService, PriceNotification } from "@/services/price-alerts-service";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<PriceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await priceAlertsService.getNotifications(showUnreadOnly);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [showUnreadOnly]);

  useEffect(() => {
    // Real-time updates for notifications
    const channel = supabase
      .channel("price-notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "price_notifications"
        },
        (payload) => {
          console.log("Notification change:", payload);
          loadNotifications();
          
          // Show toast for new notifications
          if (payload.eventType === "INSERT") {
            toast.info("Nova notificação de alerta de preço!", {
              description: (payload.new as any).message
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showUnreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await priceAlertsService.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await priceAlertsService.markAllNotificationsAsRead();
      toast.success("Todas as notificações foram marcadas como lidas");
      loadNotifications();
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Todas" : "Não Lidas"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <Check className="w-4 h-4 mr-1" />
                Marcar Todas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {showUnreadOnly ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.is_read ? "bg-background" : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm flex-1">{notification.message}</p>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
