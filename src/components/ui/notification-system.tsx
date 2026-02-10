import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Filter,
  Settings,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  vessel?: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "critical";
}

const typeStyles = {
  alert: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  info: "bg-info/10 text-info border-info/20"
};

const typeIcons = {
  alert: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info
};

const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500"
};

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem = ({ className }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");

  // Load real notifications from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("intelligent_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          setNotifications(data.map((n: any) => ({
            id: n.id,
            type: n.priority === "critical" ? "alert" as const : n.priority === "high" ? "warning" as const : n.type === "success" ? "success" as const : "info" as const,
            title: n.title || "Notificação",
            message: n.message || "",
            vessel: n.vessel_name || undefined,
            timestamp: new Date(n.created_at),
            read: n.is_read || false,
            priority: n.priority || "medium",
          })));
        }
      } catch { /* empty state shown */ }
    };
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === "critical" && !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter === "critical") return notification.priority === "critical";
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return "Agora";
  };

  // Removed random notification generation - real notifications come from Supabase
  // This prevents UI flickering from random state updates

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-azure-600/20 transition-colors"
      >
        <Bell size={20} className="text-azure-50" />
        {unreadCount > 0 && (
          <Badge 
            className={cn(
              "absolute -top-1 -right-1 min-w-[20px] h-5 text-xs flex items-center justify-center",
              criticalCount > 0 ? "bg-danger" : "bg-warning"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-card border border-border rounded-xl shadow-nautical z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-depth">
              <div className="flex items-center justify-between text-azure-50">
                <h3 className="font-semibold">Notificações</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-azure-50 hover:bg-azure-600/20"
                  >
                    Marcar como lidas
                  </Button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-azure-600/20 rounded text-azure-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 mt-3">
                {["all", "unread", "critical"].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as typeof filter)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                      filter === filterType
                        ? "bg-azure-600/20 text-azure-50"
                        : "text-azure-50/80 hover:bg-azure-600/15"
                    )}
                  >
                    {filterType === "all" && "Todas"}
                    {filterType === "unread" && "Não lidas"}
                    {filterType === "critical" && "Críticas"}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = typeIcons[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.read && "bg-accent/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          typeStyles[notification.type]
                        )}>
                          <Icon size={16} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                priorityColors[notification.priority]
                              )} />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              {notification.vessel && (
                                <span className="bg-accent px-2 py-1 rounded">
                                  {notification.vessel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-accent/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                }}
              >
                <Settings size={16} className="mr-2" />
                Ver todas as notificações
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};