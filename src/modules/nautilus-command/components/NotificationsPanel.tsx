/**
 * Notifications Panel - Painel de notificações com ações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bell, X, CheckCheck, Filter, Settings, 
  AlertOctagon, AlertTriangle, Info, Clock,
  MoreVertical, Trash2, Eye, Archive
} from "lucide-react";

interface Notification {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  module: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onSettingsClick: () => void;
  onFilterClick: () => void;
}

export function NotificationsPanel({
  notifications,
  onMarkAllRead,
  onDismiss,
  onSettingsClick,
  onFilterClick
}: NotificationsPanelProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "critical") return n.type === "critical";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === "critical").length;

  const getIcon = (type: string) => {
    switch (type) {
    case "critical": return <AlertOctagon className="h-4 w-4 text-red-500" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
    case "critical": return "border-l-red-500 bg-red-50/50 dark:bg-red-950/20";
    case "warning": return "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20";
    default: return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  const handleMarkAllRead = () => {
    onMarkAllRead();
    toast.success("Todas as notificações marcadas como lidas");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-orange-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-base">Notificações</span>
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Filter className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  Todas
                  {filter === "all" && <Badge className="ml-2 h-4 px-1">✓</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>
                  Não lidas ({unreadCount})
                  {filter === "unread" && <Badge className="ml-2 h-4 px-1">✓</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("critical")}>
                  Críticas ({criticalCount})
                  {filter === "critical" && <Badge className="ml-2 h-4 px-1">✓</Badge>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSettingsClick}>
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 mt-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {criticalCount} Críticas
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px]">
            {unreadCount} Não lidas
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {notifications.length} Total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <AnimatePresence>
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-3 rounded-lg border-l-4 ${getStyle(notification.type)} ${
                      !notification.read ? "ring-1 ring-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {notification.module}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="default" className="text-[10px] h-4 px-1">
                              Nova
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => toast.info("Ver detalhes")}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-destructive"
                              onClick={() => onDismiss(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
