/**
import { useCallback, useEffect, useMemo, useState } from "react";;
 * Notification Center Provider
 * 
 * Manages state and actions for notifications
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NotificationCenterContext from "./NotificationCenterContext";
import type {
  UnifiedNotification,
  NotificationCategory,
  NotificationPriority,
} from "../NotificationCenter.unified";

interface NotificationCenterProviderProps {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  children: React.ReactNode;
}

export const NotificationCenterProvider: React.FC<NotificationCenterProviderProps> = ({
  userId,
  autoRefresh: initialAutoRefresh = true,
  refreshInterval: initialRefreshInterval = 30000, // 30 seconds
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [refreshInterval, setRefreshInterval] = useState(initialRefreshInterval);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | null>(null);
  const [readFilter, setReadFilter] = useState<boolean | null>(null);

  const effectiveUserId = userId || user?.id;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (categoryFilter && notif.category !== categoryFilter) return false;
      if (priorityFilter && notif.priority !== priorityFilter) return false;
      if (readFilter !== null) {
        const isRead = notif.read || notif.isRead || notif.is_read || false;
        if (isRead !== readFilter) return false;
      }
      return true;
  });
  }, [notifications, categoryFilter, priorityFilter, readFilter]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(
      (n) => !(n.read || n.isRead || n.is_read)
    ).length;
  }, [notifications]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!effectiveUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      const mappedNotifications: UnifiedNotification[] = (data || []).map((n) => ({
        id: n.id,
        title: n.title || "",
        message: n.message || "",
        type: n.type,
        category: n.category,
        priority: n.priority || "normal",
        read: n.is_read || false,
        createdAt: new Date(n.created_at),
        actionUrl: n.action_url,
        actionLabel: n.action_label,
        metadata: n.metadata,
      }));

      setNotifications(mappedNotifications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load notifications";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  // Load on mount and setup refresh
  useEffect(() => {
    loadNotifications();

    if (autoRefresh && refreshInterval > 0) {
      const intervalId = setInterval(loadNotifications, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [loadNotifications, autoRefresh, refreshInterval]);

  // Real-time subscription
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${effectiveUserId}`,
        },
        (payload) => {
          const newNotif: UnifiedNotification = {
            id: payload.new.id,
            title: payload.new.title || "",
            message: payload.new.message || "",
            type: payload.new.type,
            category: payload.new.category,
            priority: payload.new.priority || "normal",
            read: payload.new.is_read || false,
            createdAt: new Date(payload.new.created_at),
            actionUrl: payload.new.action_url,
            actionLabel: payload.new.action_label,
            metadata: payload.new.metadata,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          
          // Show toast for high/urgent priority
          if (["high", "urgent", "critical"].includes(newNotif.priority)) {
            toast({
              title: newNotif.title,
              description: newNotif.message,
              variant: newNotif.priority === "critical" ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    });
  }, [effectiveUserId, toast]);

  // Mark as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, read: true, isRead: true, is_read: true } : n
          )
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", effectiveUserId)
        .eq("is_read", false);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  }, [effectiveUserId, toast]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await supabase.from("notifications").delete().eq("id", id);

        setNotifications((prev) => prev.filter((n) => n.id !== id));

        toast({
          title: "Deleted",
          description: "Notification deleted",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Delete all
  const deleteAll = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      await supabase
        .from("notifications")
        .delete()
        .eq("user_id", effectiveUserId);

      setNotifications([]);

      toast({
        title: "Cleared",
        description: "All notifications deleted",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  }, [effectiveUserId, toast]);

  // Refresh
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Filter methods
  const filterByCategory = useCallback((category: NotificationCategory | null) => {
    setCategoryFilter(category);
  }, []);

  const filterByPriority = useCallback((priority: NotificationPriority | null) => {
    setPriorityFilter(priority);
  }, []);

  const filterByRead = useCallback((read: boolean | null) => {
    setReadFilter(read);
  }, []);

  const clearFilters = useCallback(() => {
    setCategoryFilter(null);
    setPriorityFilter(null);
    setReadFilter(null);
  }, []);

  const contextValue = {
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    refresh,
    filterByCategory,
    filterByPriority,
    filterByRead,
    clearFilters,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
  };

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      {children}
    </NotificationCenterContext.Provider>
  );
};
