/**
 * Inspection Push Notification Service
 * Alerts inspectors about deadlines and pending items using Capacitor Push Notifications
 */
import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { addDays, differenceInDays, isAfter, isBefore, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface InspectionAlert {
  id: string;
  type: "deadline" | "pending" | "overdue" | "reminder";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduledAt?: Date;
  priority: "low" | "medium" | "high" | "critical";
}

interface PendingInspection {
  id: string;
  vessel_name: string;
  inspection_type: string;
  due_date: string;
  status: string;
}

class InspectionNotificationService {
  private isInitialized = false;
  private notificationIdCounter = 1000;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    if (!Capacitor.isNativePlatform()) {
      logger.info("InspectionNotificationService: Not a native platform, using web fallback");
      this.isInitialized = true;
      return true;
    }

    try {
      // Request permissions
      const localPerms = await LocalNotifications.requestPermissions();
      if (localPerms.display !== "granted") {
        logger.warn("Local notification permissions not granted");
        return false;
      }

      const pushPerms = await PushNotifications.requestPermissions();
      if (pushPerms.receive !== "granted") {
        logger.warn("Push notification permissions not granted");
      }

      // Register for push
      await PushNotifications.register();

      // Setup listeners
      this.setupListeners();
      
      this.isInitialized = true;
      logger.info("InspectionNotificationService initialized successfully");
      return true;
    } catch (error) {
      logger.error("Failed to initialize InspectionNotificationService", { error });
      return false;
    }
  }

  private setupListeners() {
    PushNotifications.addListener("registration", (token) => {
      logger.info("Push registration successful", { token: token.value?.substring(0, 20) + "..." });
      this.saveTokenToSupabase(token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      logger.error("Push registration error", { error });
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      logger.info("Push notification received", { 
        title: notification.title,
        body: notification.body 
      });
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      logger.info("Push notification action performed", { 
        actionId: action.actionId,
        notification: action.notification.title 
      });
      this.handleNotificationAction(action);
    });

    LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
      logger.info("Local notification action performed", { actionId: action.actionId });
      this.handleLocalNotificationAction(action);
    });
  }

  private async saveTokenToSupabase(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use type assertion for user_fcm_tokens table
      await (supabase as unknown as {
        from: (table: string) => {
          upsert: (data: Record<string, unknown>, options: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
        };
      }).from("user_fcm_tokens").upsert({
        user_id: user.id,
        fcm_token: token,
        device_type: Capacitor.getPlatform(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,device_type"
      });
    } catch (error) {
      logger.error("Failed to save push token", { error });
    }
  }

  private handleNotificationAction(action: { actionId: string; notification: { data?: Record<string, unknown> } }) {
    const data = action.notification.data;
    if (data?.route) {
      window.history.pushState({}, '', data.route as string);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private handleLocalNotificationAction(action: { actionId: string; notification: { extra?: Record<string, unknown> } }) {
    const data = action.notification.extra;
    if (data?.route) {
      window.history.pushState({}, '', data.route as string);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  /**
   * Schedule a local notification for inspection deadlines
   */
  async scheduleInspectionAlert(alert: InspectionAlert): Promise<boolean> {
    try {
      const notificationId = this.notificationIdCounter++;
      
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [{
            id: notificationId,
            title: alert.title,
            body: alert.body,
            schedule: alert.scheduledAt ? { at: alert.scheduledAt } : undefined,
            sound: alert.priority === "critical" ? "alarm.wav" : "default",
            smallIcon: "ic_notification",
            largeIcon: "ic_launcher",
            extra: {
              alertId: alert.id,
              type: alert.type,
              priority: alert.priority,
              route: alert.data?.route || "/inspections",
              ...alert.data
            }
          }]
        });
      } else {
        // Web fallback using browser Notification API
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(alert.title, {
            body: alert.body,
            icon: "/icons/icon.svg",
            tag: alert.id
          });
        }
      }

      // Save to database for tracking
      await this.saveNotificationToDatabase(alert);
      
      logger.info("Inspection alert scheduled", { alertId: alert.id, type: alert.type });
      return true;
    } catch (error) {
      logger.error("Failed to schedule inspection alert", { error, alertId: alert.id });
      return false;
    }
  }

  private async saveNotificationToDatabase(alert: InspectionAlert) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: alert.title,
        message: alert.body,
        type: alert.type,
        priority: alert.priority,
        status: alert.scheduledAt ? "scheduled" : "sent",
        metadata: alert.data
      });
    } catch (error) {
      logger.error("Failed to save notification to database", { error });
    }
  }

  /**
   * Check and send alerts for upcoming inspection deadlines
   */
  async checkAndAlertDeadlines(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Fetch pending inspections - use type assertion for custom tables
      const { data: inspections, error } = await (supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            in: (column: string, values: string[]) => {
              order: (column: string, options: { ascending: boolean }) => Promise<{
                data: PendingInspection[] | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      }).from("pre_ovid_inspections")
        .select("id, vessel_name, inspection_type, due_date, status")
        .in("status", ["pending", "in_progress", "scheduled"])
        .order("due_date", { ascending: true });

      if (error || !inspections) {
        logger.warn("No inspections found or error occurred", { error });
        return 0;
      }

      let alertCount = 0;
      const now = new Date();

      for (const inspection of inspections) {
        if (!inspection.due_date) continue;
        
        const dueDate = parseISO(inspection.due_date);
        const daysUntilDue = differenceInDays(dueDate, now);

        let alert: InspectionAlert | null = null;

        if (daysUntilDue < 0) {
          // Overdue
          alert = {
            id: `overdue-${inspection.id}`,
            type: "overdue",
            priority: "critical",
            title: "⚠️ Inspeção Atrasada!",
            body: `${inspection.vessel_name}: Inspeção ${inspection.inspection_type} está ${Math.abs(daysUntilDue)} dias atrasada!`,
            data: { 
              inspectionId: inspection.id, 
              route: `/pre-ovid?inspection=${inspection.id}` 
            }
          };
        } else if (daysUntilDue === 0) {
          // Due today
          alert = {
            id: `today-${inspection.id}`,
            type: "deadline",
            priority: "high",
            title: "📋 Inspeção para Hoje!",
            body: `${inspection.vessel_name}: ${inspection.inspection_type} vence hoje!`,
            data: { 
              inspectionId: inspection.id, 
              route: `/pre-ovid?inspection=${inspection.id}` 
            }
          };
        } else if (daysUntilDue <= 3) {
          // Due in 3 days
          alert = {
            id: `soon-${inspection.id}`,
            type: "reminder",
            priority: "medium",
            title: "🔔 Inspeção Próxima",
            body: `${inspection.vessel_name}: ${inspection.inspection_type} em ${daysUntilDue} dias (${format(dueDate, "dd/MM", { locale: ptBR })})`,
            data: { 
              inspectionId: inspection.id, 
              route: `/pre-ovid?inspection=${inspection.id}` 
            }
          };
        } else if (daysUntilDue === 7) {
          // Due in a week
          alert = {
            id: `week-${inspection.id}`,
            type: "reminder",
            priority: "low",
            title: "📅 Lembrete de Inspeção",
            body: `${inspection.vessel_name}: ${inspection.inspection_type} em 1 semana`,
            data: { 
              inspectionId: inspection.id, 
              route: `/pre-ovid?inspection=${inspection.id}` 
            }
          };
        }

        if (alert) {
          await this.scheduleInspectionAlert(alert);
          alertCount++;
        }
      }

      logger.info(`Checked inspection deadlines: ${alertCount} alerts sent`);
      return alertCount;
    } catch (error) {
      logger.error("Failed to check inspection deadlines", { error });
      return 0;
    }
  }

  /**
   * Send immediate alert for pending items
   */
  async alertPendingItems(items: Array<{ id: string; title: string; module: string }>): Promise<void> {
    if (items.length === 0) return;

    const alert: InspectionAlert = {
      id: `pending-${Date.now()}`,
      type: "pending",
      priority: items.length > 5 ? "high" : "medium",
      title: `📝 ${items.length} Itens Pendentes`,
      body: items.length === 1 
        ? `${items[0].module}: ${items[0].title}`
        : `${items[0].module}: ${items[0].title} e mais ${items.length - 1} itens`,
      data: { 
        items,
        route: "/inspections"
      }
    };

    await this.scheduleInspectionAlert(alert);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduled(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      }
      logger.info("All scheduled notifications cancelled");
    } catch (error) {
      logger.error("Failed to cancel scheduled notifications", { error });
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      const local = await LocalNotifications.requestPermissions();
      const push = await PushNotifications.requestPermissions();
      return local.display === "granted" && push.receive === "granted";
    } else {
      // Web
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        return result === "granted";
      }
      return false;
    }
  }
}

export const inspectionNotificationService = new InspectionNotificationService();
