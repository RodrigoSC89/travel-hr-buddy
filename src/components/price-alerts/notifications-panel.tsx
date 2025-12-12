import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellRing, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { PriceNotification } from "@/services/price-alerts-service";

interface NotificationsPanelProps {
  notifications: PriceNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  loading?: boolean;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  loading = false,
}) => {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={loading}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              You'll be notified when prices change
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read
                      ? "bg-background"
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleonMarkAsRead}
                        disabled={loading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
