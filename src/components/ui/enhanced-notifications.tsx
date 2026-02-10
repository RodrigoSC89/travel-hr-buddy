import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Calendar,
  Users,
  Ship,
  FileText,
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Eye,
  Archive,
  Filter,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "success" | "warning" | "error" | "info";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  metadata?: {
    module?: string;
    vessel?: string;
    deadline?: Date;
    progress?: number;
    value?: number;
    trend?: "up" | "down" | "stable";
  };
  actions?: {
    label: string;
    action: () => void;
    variant?: "default" | "destructive" | "outline";
  }[];
}

interface EnhancedNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedNotifications: React.FC<EnhancedNotificationsProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load real notifications from Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await supabase
          .from("intelligent_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          const mapped: Notification[] = data.map((n: any) => ({
            id: n.id,
            title: n.title || "Notificação",
            description: n.message || n.description || "",
            type: n.priority === "critical" ? "error" : n.priority === "high" ? "warning" : n.type === "success" ? "success" : "info",
            priority: n.priority || "medium",
            category: n.category || "Sistema",
            timestamp: new Date(n.created_at),
            read: n.is_read || false,
            actionable: !!n.action_type,
            metadata: { module: n.source_module, vessel: n.vessel_name },
          }));
          setNotifications(mapped);
        }
        // If no data, notifications stays empty — honest empty state
      } catch {
        // Silently fail — empty state is shown
      }
    };

    loadNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "success": return <CheckCircle className="w-5 h-5 text-success" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "error": return <AlertTriangle className="w-5 h-5 text-destructive" />;
    case "info": return <Info className="w-5 h-5 text-info" />;
    default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string): React.ComponentType<{ className?: string }> => {
    switch (category.toLowerCase()) {
    case "certificações": return Users;
    case "performance": return TrendingUp;
    case "auditorias": return FileText;
    case "sistema": return Settings;
    case "frota": return Ship;
    case "segurança": return Shield;
    case "financeiro": return DollarSign;
    default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent": return "bg-red-500 text-white";
    case "high": return "bg-orange-500 text-white";
    case "medium": return "bg-blue-500 text-white";
    case "low": return "bg-gray-500 text-white";
    default: return "bg-gray-500 text-white";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas"
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
    case "unread": return !notification.read;
    case "urgent": return notification.priority === "urgent" || notification.priority === "high";
    default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === "urgent").length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10060] bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 sm:right-6 top-0 sm:top-20 w-full sm:w-96 h-full sm:h-auto sm:max-h-[calc(100vh-8rem)] bg-background border-l sm:border-2 border-primary/20 sm:rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Notificações</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {unreadCount} não lidas {urgentCount > 0 && `• ${urgentCount} urgentes`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 p-0"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="text-xs"
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === "urgent" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setFilter("urgent")}
              className="text-xs"
            >
              Urgentes ({urgentCount})
            </Button>
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full text-xs"
            >
              <Eye className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => {
                  const CategoryIcon = getCategoryIcon(notification.category);
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-200 cursor-pointer ${
                        !notification.read 
                          ? "bg-primary/5 border-primary/30 shadow-sm" 
                          : "bg-background border-border/30"
                      } hover:shadow-md hover:scale-[1.02]`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getTypeIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className={`font-semibold text-sm ${
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              } line-clamp-1`}>
                                {notification.title}
                              </h3>
                              
                              <div className="flex items-center gap-1">
                                <Badge className={`text-xs px-2 py-1 ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="w-6 h-6 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {notification.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                <span>{notification.category}</span>
                              </Badge>
                              
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {notification.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                            
                            {notification.metadata?.progress && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progresso</span>
                                  <span>{notification.metadata.progress}%</span>
                                </div>
                                <Progress value={notification.metadata.progress} className="h-2" />
                              </div>
                            )}
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant || "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.action();
                                    }}
                                    className="text-xs h-7"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {filter === "unread" 
                    ? "Nenhuma notificação não lida" 
                    : filter === "urgent"
                      ? "Nenhuma notificação urgente"
                      : "Nenhuma notificação encontrada"
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default EnhancedNotifications;