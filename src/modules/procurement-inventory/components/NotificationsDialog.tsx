import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Package,
  Brain,
  Info,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "alert" | "success" | "info" | "ai";
  read: boolean;
  date: Date;
}

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (id: string) => void;
}

export default function NotificationsDialog({
  open,
  onOpenChange,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationsDialogProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "ai":
      return <Brain className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} novas
                </Badge>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read
                      ? "bg-muted/30 hover:bg-muted/50"
                      : "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                  }`}
                  onClick={() => onNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-medium text-sm truncate ${
                          notification.read ? "text-muted-foreground" : ""
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.date, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
