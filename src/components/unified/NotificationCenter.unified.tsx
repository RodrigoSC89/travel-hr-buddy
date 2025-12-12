/**
 * UNIFIED NotificationCenter Component
 * 
 * Consolidates:
 * - src/components/notifications/NotificationCenter.tsx (Panel + Bell)
 * - src/components/notifications/enhanced-notification-center.tsx (Full page)
 * - src/components/notifications/real-time-notification-center.tsx (Popover)
 * - src/components/ui/NotificationCenter.tsx (Configurable variants)
 * - src/components/communication/notification-center.tsx
 * - src/components/ui/real-time-notifications.tsx
 * - src/components/fleet/notification-center.tsx (deprecated re-export)
 * - src/components/maritime/notification-center.tsx (deprecated re-export)
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  AlertCircle,
  Wrench,
  Users,
  Shield,
  Zap,
  ChevronRight,
  Clock,
  Trash2,
  RotateCcw,
  Search,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nullToUndefined } from "@/lib/type-helpers";

// ============================================
// TYPES
// ============================================

export type NotificationCategory = 
  | "safety" 
  | "maintenance" 
  | "crew" 
  | "compliance" 
  | "system" 
  | "performance" 
  | "alert";

export type NotificationPriority = "urgent" | "high" | "normal" | "medium" | "low" | "critical";

export type NotificationType = 
  | "checklist_due" 
  | "certificate_expiring" 
  | "maintenance_due" 
  | "compliance_alert"
  | "info" 
  | "warning" 
  | "error" 
  | "success";

export interface UnifiedNotification {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  isRead?: boolean;
  is_read?: boolean;
  createdAt: Date;
  created_at?: string;
  timestamp?: Date;
  actionUrl?: string;
  actionLabel?: string;
  action_type?: string;
  action_data?: any;
  metadata?: Record<string, any>;
  auto_dismiss?: boolean;
}

export type NotificationVariant = "panel" | "popover" | "page" | "card" | "default";
export type NotificationMode = "maritime" | "fleet" | "default";

export interface NotificationCenterProps {
  // Display mode
  variant?: NotificationVariant;
  mode?: NotificationMode;
  
  // Panel variant props
  open?: boolean;
  onClose?: () => void;
  
  // Data options
  userId?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxNotifications?: number;
  
  // Style
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  safety: <Shield className="w-4 h-4" />,
  maintenance: <Wrench className="w-4 h-4" />,
  crew: <Users className="w-4 h-4" />,
  compliance: <Check className="w-4 h-4" />,
  system: <Zap className="w-4 h-4" />,
  performance: <Activity className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
};

const priorityColors: Record<NotificationPriority, string> = {
  urgent: "bg-destructive text-destructive-foreground",
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  normal: "bg-primary text-primary-foreground",
  medium: "bg-primary/80 text-primary-foreground",
  low: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, React.ReactNode> = {
  error: <AlertTriangle className="w-4 h-4 text-destructive" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  success: <Check className="w-4 h-4 text-success" />,
  info: <Info className="w-4 h-4 text-info" />,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const normalizeNotification = (n: any): UnifiedNotification => ({
  id: n.id,
  title: n.title,
  message: n.message || n.description || "",
  type: n.type as NotificationType,
  category: n.category as NotificationCategory,
  priority: (n.priority || "normal") as NotificationPriority,
  read: n.read ?? n.is_read ?? n.isRead ?? false,
  isRead: n.read ?? n.is_read ?? n.isRead ?? false,
  is_read: n.read ?? n.is_read ?? n.isRead ?? false,
  createdAt: n.createdAt ? new Date(n.createdAt) : new Date(n.created_at || n.timestamp || Date.now()),
  created_at: n.created_at,
  timestamp: n.timestamp ? new Date(n.timestamp) : undefined,
  actionUrl: nullToUndefined(n.actionUrl || n.action_url),
  actionLabel: nullToUndefined(n.actionLabel || n.action_text),
  action_type: nullToUndefined(n.action_type),
  action_data: n.action_data || n.actionData,
  metadata: typeof n.metadata === "object" && n.metadata !== null && !Array.isArray(n.metadata)
    ? n.metadata as Record<string, any>
    : {},
  auto_dismiss: n.auto_dismiss,
});

const getPriorityIcon = (priority: NotificationPriority) => {
  switch (priority) {
  case "critical":
  case "urgent":
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  case "high":
    return <TrendingUp className="h-4 w-4 text-warning" />;
  case "normal":
  case "medium":
    return <Activity className="h-4 w-4 text-primary" />;
  case "low":
    return <TrendingDown className="h-4 w-4 text-muted-foreground" />;
  default:
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

interface NotificationItemProps {
  notification: UnifiedNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const isRead = notification.read || notification.isRead || notification.is_read;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "relative p-3 rounded-lg border transition-colors",
        isRead
          ? "bg-muted/30 border-border"
          : "bg-card border-primary/20 shadow-sm"
      )}
      onClick={() => !isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            priorityColors[notification.priority]
          )}
        >
          {notification.category
            ? categoryIcons[notification.category]
            : notification.type
              ? typeIcons[notification.type] || <Bell className="w-4 h-4" />
              : getPriorityIcon(notification.priority)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-sm",
                isRead ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              <Badge className={cn("text-xs", priorityColors[notification.priority])}>
                {notification.priority}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {!compact && (
            <p
              className={cn(
                "text-xs mt-1",
                isRead ? "text-muted-foreground/70" : "text-muted-foreground"
              )}
            >
              {notification.message}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(notification.createdAt, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.actionLabel || "Ver mais"}
                <ChevronRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute top-3 right-10 w-2 h-2 bg-primary rounded-full" />
      )}
    </motion.div>
  );
};

// ============================================
// MAIN HOOK
// ============================================

export function useUnifiedNotifications(userId?: string, autoRefresh = true, refreshInterval = 30000) {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const effectiveUserId = userId || user?.id;

  const loadNotifications = useCallback(async () => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load from intelligent_notifications table
      const { data, error } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications = (data || []).map(normalizeNotification);
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, isRead: true, is_read: true }
            : n
        )
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida",
        variant: "destructive",
      });
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("user_id", effectiveUserId)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true, is_read: true }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas",
        variant: "destructive",
      });
    }
  }, [effectiveUserId, toast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      toast({
        title: "Removida",
        description: "Notificação removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover notificação",
        variant: "destructive",
      });
    }
  }, [toast]);

  const clearAll = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      const { error } = await supabase
        .from("intelligent_notifications")
        .delete()
        .eq("user_id", effectiveUserId);

      if (error) throw error;

      setNotifications([]);

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram removidas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar notificações",
        variant: "destructive",
      });
    }
  }, [effectiveUserId, toast]);

  useEffect(() => {
    loadNotifications();

    if (!effectiveUserId) return;

    // Real-time subscription
    const subscription = supabase
      .channel("notifications_unified")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intelligent_notifications",
          filter: `user_id=eq.${effectiveUserId}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    // Auto-refresh
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(loadNotifications, refreshInterval);
    }

    return () => {
      subscription.unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [effectiveUserId, autoRefresh, refreshInterval, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead && !n.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

// ============================================
// PANEL VARIANT
// ============================================

interface PanelVariantProps {
  open: boolean;
  onClose: () => void;
  notifications: UnifiedNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const PanelVariant: React.FC<PanelVariantProps> = ({
  open,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Notificações</h2>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
                      : "Tudo em dia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications list */}
            <ScrollArea className="h-[calc(100vh-140px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Bell className="w-12 h-12 mb-4 opacity-20" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={onMarkAsRead}
                        onDelete={onDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  className="w-full"
                >
                  Limpar todas
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// POPOVER VARIANT
// ============================================

interface PopoverVariantProps {
  notifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
}

const PopoverVariant: React.FC<PopoverVariantProps> = ({
  notifications,
  unreadCount,
  loading,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
  showSearch = true,
  showFilters = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    const isRead = n.read || n.isRead || n.is_read;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
    case "unread":
      return !isRead;
    case "priority":
      return n.priority === "high" || n.priority === "urgent" || n.priority === "critical";
    default:
      return true;
    }
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="relative p-2 h-9 w-9 cursor-pointer hover:bg-accent transition-colors"
          aria-label="Abrir notificações"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow-sm pointer-events-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 z-[110] bg-popover border-border shadow-xl"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Notificações</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onRefresh} className="h-6 w-6 p-0">
                <RefreshCw className="h-3 w-3" />
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={onMarkAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar lidas
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded bg-background"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex gap-1 mt-2">
              {["all", "unread", "priority"].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "ghost"}
                  onClick={() => setFilter(filterType)}
                  size="sm"
                  className="text-xs h-6 px-2"
                >
                  {filterType === "all" && "Todas"}
                  {filterType === "unread" && "Não lidas"}
                  {filterType === "priority" && "Prioridade"}
                </Button>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="h-80">
          <div className="p-4 pt-2 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-2 border rounded">
                    <div className="animate-pulse space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="text-sm font-medium mb-1">Nenhuma notificação</h4>
                <p className="text-xs text-muted-foreground">
                  {filter === "unread"
                    ? "Todas as notificações foram lidas!"
                    : "Você não possui notificações no momento."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  compact
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// ============================================
// PAGE/CARD VARIANT
// ============================================

interface PageVariantProps {
  notifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  showFilters?: boolean;
  mode?: NotificationMode;
  className?: string;
}

const PageVariant: React.FC<PageVariantProps> = ({
  notifications,
  unreadCount,
  loading,
  filter,
  setFilter,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
  showFilters = true,
  mode = "default",
  className,
}) => {
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read && !n.isRead && !n.is_read;
    if (filter === "high") return n.priority === "high" || n.priority === "urgent" || n.priority === "critical";
    return true;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando notificações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {mode === "maritime" && "Notificações do Sistema Marítimo"}
              {mode === "fleet" && "Notificações da Gestão de Frota"}
              {mode === "default" && "Todas as suas notificações"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">Não lidas</TabsTrigger>
              <TabsTrigger value="high">Prioridade Alta</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Check className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Sem notificações</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "Você não tem notificações não lidas"
                  : "Você está em dia com todas as notificações"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  variant = "default",
  mode = "default",
  open = false,
  onClose,
  userId,
  showFilters = true,
  showSearch = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useUnifiedNotifications(userId, autoRefresh, refreshInterval);

  // Panel variant
  if (variant === "panel") {
    return (
      <PanelVariant
        open={open}
        onClose={onClose || (() => {})}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onClearAll={clearAll}
      />
    );
  }

  // Popover variant
  if (variant === "popover") {
    return (
      <PopoverVariant
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onRefresh={loadNotifications}
        showSearch={showSearch}
        showFilters={showFilters}
      />
    );
  }

  // Page/Card variant (default)
  return (
    <PageVariant
      notifications={notifications}
      unreadCount={unreadCount}
      loading={loading}
      filter={filter}
      setFilter={setFilter}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onDelete={deleteNotification}
      onRefresh={loadNotifications}
      showFilters={showFilters}
      mode={mode}
      className={className}
    />
  );
};

// ============================================
// NOTIFICATION BELL COMPONENT
// ============================================

export interface NotificationBellProps {
  variant?: "panel" | "popover";
  userId?: string;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  variant = "panel",
  userId,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useUnifiedNotifications(userId);

  if (variant === "popover") {
    return <NotificationCenter variant="popover" userId={userId} className={className} />;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative p-2 rounded-lg hover:bg-muted transition-colors",
          className
        )}
        aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ""}`}
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <NotificationCenter
        variant="panel"
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
      />
    </>
  );
};

// ============================================
// REAL-TIME NOTIFICATION CENTER (Alias)
// ============================================

export const RealTimeNotificationCenter: React.FC<Omit<NotificationCenterProps, "variant">> = (props) => (
  <NotificationCenter {...props} variant="popover" />
);

// ============================================
// ENHANCED NOTIFICATION CENTER (Alias)
// ============================================

export const EnhancedNotificationCenter: React.FC<Omit<NotificationCenterProps, "variant">> = (props) => (
  <NotificationCenter {...props} variant="page" />
);

// ============================================
// DEFAULT EXPORT
// ============================================

export default NotificationCenter;
