import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle } from "lucide-react";

interface Notification { id: string; title: string; message: string; read: boolean; date: string; }
interface Props { open: boolean; onOpenChange: (open: boolean) => void; notifications: Notification[]; onMarkAllAsRead: () => void; onNotificationClick: (id: string) => void; }

export const NotificationsDialog = memo(function({ open, onOpenChange, notifications, onMarkAllAsRead, onNotificationClick }: Props) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações</span>
            {unread > 0 && <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}><CheckCircle className="h-4 w-4 mr-1" />Marcar todas como lidas</Button>}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} onClick={() => onNotificationClick(n.id)} className={`p-3 rounded-lg border cursor-pointer transition-colors ${n.read ? "bg-muted/30" : "bg-primary/5 border-primary/30"}`}>
                <div className="flex items-start justify-between"><p className="font-medium text-sm">{n.title}</p>{!n.read && <Badge variant="secondary" className="text-xs">Novo</Badge>}</div>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{n.date}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
