/**
 * Compliance Notifications Hook - Phase 7
 * Provides methods to send compliance notifications via edge function
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/lib/utils/production-logger";

export type ComplianceNotificationType = 
  | "deadline_warning" 
  | "critical_alert" 
  | "nc_opened" 
  | "audit_reminder" 
  | "certificate_expiring";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface ComplianceNotificationData {
  title: string;
  description: string;
  dueDate?: string;
  module?: string;
  itemId?: string;
  daysRemaining?: number;
}

export interface NotificationChannels {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface SendNotificationOptions {
  type: ComplianceNotificationType;
  priority: NotificationPriority;
  data: ComplianceNotificationData;
  channels?: NotificationChannels;
}

export function useComplianceNotifications() {
  const { user } = useAuth();

  const sendNotification = useCallback(
    async (options: SendNotificationOptions) => {
      if (!user) {
        logger.debug("No user logged in, cannot send notification");
        return { success: false, error: "No user" };
      }

      const {
        type,
        priority,
        data,
        channels = { email: true, push: true, inApp: true },
      } = options;

      try {
        const { data: result, error } = await supabase.functions.invoke(
          "compliance-smart-notifications",
          {
            body: {
              userId: user.id,
              type,
              priority,
              data,
              channels,
            },
          }
        );

        if (error) throw error;

        console.log("[Compliance Notification] Sent:", result);
        return { success: true, result };
      } catch (error) {
        console.error("[Compliance Notification] Error:", error);
        return { success: false, error };
      }
    },
    [user]
  );

  const sendDeadlineWarning = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate: string;
      daysRemaining: number;
      module: string;
    }) => {
      return sendNotification({
        type: "deadline_warning",
        priority: data.daysRemaining <= 3 ? "critical" : data.daysRemaining <= 7 ? "high" : "medium",
        data,
      });
    },
    [sendNotification]
  );

  const sendCriticalAlert = useCallback(
    async (data: { title: string; description: string; module?: string }) => {
      return sendNotification({
        type: "critical_alert",
        priority: "critical",
        data,
      });
    },
    [sendNotification]
  );

  const sendNCOpened = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate?: string;
      itemId: string;
      module: string;
    }) => {
      return sendNotification({
        type: "nc_opened",
        priority: "high",
        data,
      });
    },
    [sendNotification]
  );

  const sendAuditReminder = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate: string;
      module: string;
    }) => {
      return sendNotification({
        type: "audit_reminder",
        priority: "medium",
        data,
      });
    },
    [sendNotification]
  );

  const sendCertificateExpiring = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate: string;
      daysRemaining: number;
      itemId?: string;
    }) => {
      return sendNotification({
        type: "certificate_expiring",
        priority: data.daysRemaining <= 7 ? "critical" : "high",
        data,
      });
    },
    [sendNotification]
  );

  return {
    sendNotification,
    sendDeadlineWarning,
    sendCriticalAlert,
    sendNCOpened,
    sendAuditReminder,
    sendCertificateExpiring,
  };
}
