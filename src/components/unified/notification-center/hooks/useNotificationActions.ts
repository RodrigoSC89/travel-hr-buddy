/**
 * useNotificationActions Hook
 * 
 * Provides notification-specific actions
 */

import { useCallback } from "react";
import { useNotificationCenterContext } from "../NotificationCenterContext";
import type { UnifiedNotification } from "../../NotificationCenter.unified";

export const useNotificationActions = (notification?: UnifiedNotification) => {
  const {
    markAsRead,
    deleteNotification,
  } = useNotificationCenterContext();

  const handleMarkAsRead = useCallback(async () => {
    if (!notification) return;
    await markAsRead(notification.id);
  }, [notification, markAsRead]);

  const handleDelete = useCallback(async () => {
    if (!notification) return;
    await deleteNotification(notification.id);
  }, [notification, deleteNotification]);

  const handleAction = useCallback(() => {
    if (!notification) return;
    
    // Mark as read when action is clicked
    handleMarkAsRead();
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }, [notification, handleMarkAsRead]);

  return {
    markAsRead: handleMarkAsRead,
    delete: handleDelete,
    performAction: handleAction,
  };
};
