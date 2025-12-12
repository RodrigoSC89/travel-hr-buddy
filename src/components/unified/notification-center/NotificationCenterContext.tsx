/**
import { useContext, useCallback } from "react";;
 * Notification Center Context
 * 
 * Provides state management for notifications
 */

import React, { createContext, useContext } from "react";
import type {
  UnifiedNotification,
  NotificationCategory,
  NotificationPriority,
} from "../NotificationCenter.unified";

interface NotificationCenterContextValue {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Filters
  filterByCategory: (category: NotificationCategory | null) => void;
  filterByPriority: (priority: NotificationPriority | null) => void;
  filterByRead: (read: boolean | null) => void;
  clearFilters: () => void;
  
  // Settings
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | undefined>(undefined);

export const useNotificationCenterContext = memo(() => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "useNotificationCenterContext must be used within NotificationCenterProvider"
    );
  });
  return context;
});

export default NotificationCenterContext;
