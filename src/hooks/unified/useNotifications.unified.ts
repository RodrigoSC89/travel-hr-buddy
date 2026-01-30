/**
 * UNIFIED Notifications Hook
 * 
 * Unifica:
 * - src/hooks/use-notifications.ts (Capacitor/mobile)
 * - src/hooks/use-enhanced-notifications.ts (Database-backed)
 * - src/lib/notifications/smart-notifications.ts
 * 
 * Features:
 * - Notificações em tempo real via Supabase
 * - Suporte a push notifications (Capacitor)
 * - Categorização e priorização
 * - Persistência em banco de dados
 * - Auto-refresh configurável
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/unified/logger.unified";

// ==================== TYPES ====================

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent" | "critical";
export type NotificationCategory = 
  | "safety" 
  | "maintenance" 
  | "crew" 
  | "compliance" 
  | "system" 
  | "performance" 
  | "alert"
  | "certificate"
  | "price"
  | "general";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  read: boolean;
  timestamp: Date;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  persistentId?: string;
  autoDismiss?: boolean;
  expiresAt?: string;
}

export interface NotificationAction {
  label: string;
  href: string;
}

export interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxNotifications?: number;
  enablePush?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  add: (notification: Omit<Notification, "id" | "timestamp" | "createdAt" | "read">) => void;
  scheduleLocalNotification: (options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }) => Promise<void>;
}

// ==================== HELPER FUNCTIONS ====================

function normalizeType(type?: string | null): NotificationType {
  if (type === "success" || type === "warning" || type === "error" || type === "info") {
    return type;
  }
  return "info";
}

function normalizePriority(priority?: string | null): NotificationPriority {
  const validPriorities: NotificationPriority[] = ["low", "normal", "high", "urgent", "critical"];
  if (priority && validPriorities.includes(priority as NotificationPriority)) {
    return priority as NotificationPriority;
  }
  return "normal";
}

function normalizeCategory(category?: string | null): NotificationCategory {
  const validCategories: NotificationCategory[] = [
    "safety", "maintenance", "crew", "compliance", "system", 
    "performance", "alert", "certificate", "price", "general"
  ];
  if (category && validCategories.includes(category as NotificationCategory)) {
    return category as NotificationCategory;
  }
  return "general";
}

// ==================== MAIN HOOK ====================

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    maxNotifications = 100,
    enablePush = true,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const { user } = useAuth();
  const isMountedRef = useRef(true);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  // Initialize push notifications for mobile
  useEffect(() => {
    if (!enablePush || !Capacitor.isNativePlatform()) return;

    const initPushNotifications = async () => {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const localPermissions = await LocalNotifications.requestPermissions();
        
        if (localPermissions.display === "granted") {
          setPermissionGranted(true);
          
          await PushNotifications.requestPermissions();
          await PushNotifications.register();

          PushNotifications.addListener("pushNotificationReceived", (notification) => {
            logger.info("Push received", { notification });
            // Convert to our format and add
            add({
              title: notification.title || "Nova Notificação",
              message: notification.body || "",
              type: "info",
              priority: "normal",
              category: "system",
            });
          });
        }
      } catch (err) {
        logger.error("Failed to initialize push notifications", err);
      }
    };

    initPushNotifications();
  }, [enablePush]);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch from intelligent_notifications
      const { data: intelligentData, error: intelligentError } = await supabase
        .from("intelligent_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(maxNotifications);

      if (intelligentError) throw intelligentError;

      // Also fetch from employee_notifications for compatibility
      const { data: employeeData, error: employeeError } = await supabase
        .from("employee_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(maxNotifications);

      if (employeeError) throw employeeError;

      if (!isMountedRef.current) return;

      // Combine and deduplicate
      const combined: Notification[] = [];
      const seenIds = new Set<string>();

      // Process intelligent_notifications
      (intelligentData || []).forEach((n: any) => {
        if (!seenIds.has(n.id)) {
          seenIds.add(n.id);
          combined.push({
            id: n.id,
            persistentId: n.id,
            title: n.title,
            message: n.message,
            type: normalizeType(n.type),
            priority: normalizePriority(n.priority),
            category: normalizeCategory(n.category),
            read: n.is_read || false,
            timestamp: new Date(n.created_at),
            createdAt: n.created_at,
            actionUrl: n.action_url,
            actionLabel: n.action_label,
            metadata: n.metadata,
            autoDismiss: n.auto_dismiss,
            expiresAt: n.expires_at,
          });
        }
      });

      // Process employee_notifications
      (employeeData || []).forEach((n: any) => {
        if (!seenIds.has(n.id)) {
          seenIds.add(n.id);
          combined.push({
            id: n.id,
            persistentId: n.id,
            title: n.title,
            message: n.message,
            type: normalizeType(n.type),
            priority: "normal",
            category: "general",
            read: n.is_read || false,
            timestamp: new Date(n.created_at),
            createdAt: n.created_at,
            actionUrl: n.action_url,
          });
        }
      });

      // Sort by timestamp descending
      combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(combined.slice(0, maxNotifications));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      logger.error("Failed to fetch notifications", err);
      setError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, maxNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "intelligent_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as any;
          const newNotification: Notification = {
            id: n.id,
            persistentId: n.id,
            title: n.title,
            message: n.message,
            type: normalizeType(n.type),
            priority: normalizePriority(n.priority),
            category: normalizeCategory(n.category),
            read: false,
            timestamp: new Date(n.created_at),
            createdAt: n.created_at,
            actionUrl: n.action_url,
            actionLabel: n.action_label,
          };

          setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, maxNotifications]);

  // Auto-refresh
  useEffect(() => {
    fetchNotifications();

    if (!autoRefresh) return;

    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, autoRefresh, refreshInterval]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ==================== ACTIONS ====================

  const markAsRead = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.read) return;

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    if (notification.persistentId) {
      // Try both tables
      await Promise.all([
        supabase
          .from("intelligent_notifications")
          .update({ is_read: true })
          .eq("id", notification.persistentId),
        supabase
          .from("employee_notifications")
          .update({ is_read: true })
          .eq("id", notification.persistentId),
      ]);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(n => !n.read && n.persistentId)
      .map(n => n.persistentId!);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (unreadIds.length > 0) {
      await Promise.all([
        supabase
          .from("intelligent_notifications")
          .update({ is_read: true })
          .in("id", unreadIds),
        supabase
          .from("employee_notifications")
          .update({ is_read: true })
          .in("id", unreadIds),
      ]);
    }
  }, [notifications]);

  const remove = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(prev => prev.filter(n => n.id !== id));

    if (notification?.persistentId) {
      await Promise.all([
        supabase
          .from("intelligent_notifications")
          .delete()
          .eq("id", notification.persistentId),
        supabase
          .from("employee_notifications")
          .delete()
          .eq("id", notification.persistentId),
      ]);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    const persistentIds = notifications
      .filter(n => n.persistentId)
      .map(n => n.persistentId!);

    setNotifications([]);

    if (persistentIds.length > 0) {
      await Promise.all([
        supabase
          .from("intelligent_notifications")
          .delete()
          .in("id", persistentIds),
        supabase
          .from("employee_notifications")
          .delete()
          .in("id", persistentIds),
      ]);
    }
  }, [notifications]);

  const add = useCallback((notification: Omit<Notification, "id" | "timestamp" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));
  }, [maxNotifications]);

  const scheduleLocalNotification = useCallback(async (options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }) => {
    if (!permissionGranted || !Capacitor.isNativePlatform()) return;

    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      
      await LocalNotifications.schedule({
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id,
          schedule: options.schedule ? { at: options.schedule } : undefined,
          sound: "default",
          attachments: undefined,
          actionTypeId: "",
          extra: {},
        }],
      });
    } catch (err) {
      logger.error("Failed to schedule local notification", err);
    }
  }, [permissionGranted]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    permissionGranted,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
    refresh: fetchNotifications,
    add,
    scheduleLocalNotification,
  };
}

// ==================== LEGACY EXPORTS ====================

// Alias for backward compatibility
export const useEnhancedNotifications = useNotifications;
export const useSmartNotifications = useNotifications;

export default useNotifications;
