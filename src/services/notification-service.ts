/**
 * Notification Service
 * Central service for sending notifications via multiple channels
 * Nauti One v4.0
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type NotificationChannel = "in_app" | "email" | "push" | "sms";
export type NotificationCategory = "alert" | "reminder" | "info" | "urgent" | "marketing";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  email_subject?: string;
  email_body_html?: string;
  email_body_text?: string;
  sms_body?: string;
  variables?: { name: string; description: string; required: boolean }[];
  is_active: boolean;
  priority: NotificationPriority;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  alerts_enabled: boolean;
  reminders_enabled: boolean;
  info_enabled: boolean;
  marketing_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  quiet_hours_timezone: string;
  digest_enabled: boolean;
  digest_frequency: "daily" | "weekly";
}

export interface SendNotificationOptions {
  userId: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

class NotificationServiceClass {
  /**
   * Send notification using a predefined template
   */
  async sendFromTemplate(
    userId: string,
    templateName: string,
    variables: Record<string, string>,
    overrideChannels?: NotificationChannel[]
  ): Promise<boolean> {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("name", templateName)
        .eq("is_active", true)
        .single();

      if (templateError || !template) {
        logger.warn(`Template not found: ${templateName}`);
        return false;
      }

      // Get user preferences
      const prefs = await this.getUserPreferences(userId);

      // Check category preference
      if (!this.isCategoryEnabled(template.category as NotificationCategory, prefs)) {
        logger.info(`Category ${template.category} disabled for user ${userId}`);
        return false;
      }

      // Check quiet hours
      if (prefs.quiet_hours_enabled && this.isQuietHours(prefs)) {
        await this.scheduleNotification(userId, templateName, variables, template.channels as NotificationChannel[]);
        return true;
      }

      // Render template
      const rendered = this.renderTemplate(template, variables);
      const channels = overrideChannels || (template.channels as NotificationChannel[]);

      // Send via enabled channels
      const promises: Promise<void>[] = [];

      if (channels.includes("in_app") && prefs.in_app_enabled) {
        promises.push(this.sendInApp(userId, rendered));
      }

      if (channels.includes("email") && prefs.email_enabled) {
        promises.push(this.queueEmail(userId, rendered));
      }

      if (channels.includes("push") && prefs.push_enabled) {
        promises.push(this.sendPush(userId, rendered));
      }

      if (channels.includes("sms") && prefs.sms_enabled) {
        promises.push(this.sendSMS(userId, rendered));
      }

      await Promise.allSettled(promises);
      return true;
    } catch (error) {
      logger.error("Error sending notification from template", error as Error);
      return false;
    }
  }

  /**
   * Send a direct notification (without template)
   */
  async send(options: SendNotificationOptions): Promise<boolean> {
    try {
      const prefs = await this.getUserPreferences(options.userId);
      const channels = options.channels || ["in_app"];

      if (channels.includes("in_app") && prefs.in_app_enabled) {
        await this.sendInApp(options.userId, {
          title: options.title,
          message: options.message,
          category: options.category || "info",
          priority: options.priority || "normal",
          action_url: options.actionUrl,
          action_label: options.actionLabel,
          resource_type: options.resourceType,
          resource_id: options.resourceId,
          metadata: options.metadata,
        });
      }

      return true;
    } catch (error) {
      logger.error("Error sending notification", error as Error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(userId: string, content: Record<string, unknown>): Promise<void> {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

    await supabase.from("user_notifications").insert([{
      user_id: userId,
      organization_id: orgMember?.organization_id,
      title: content.title as string,
      message: content.message as string,
      category: content.category as string,
      priority: content.priority as string,
      action_url: content.action_url as string | null,
      action_label: content.action_label as string | null,
      resource_type: content.resource_type as string | null,
      resource_id: content.resource_id as string | null,
      metadata: JSON.parse(JSON.stringify(content.metadata || {})),
    }]);

    logger.info(`In-app notification sent to user ${userId}`);
  }

  /**
   * Queue email for sending
   */
  private async queueEmail(userId: string, content: Record<string, unknown>): Promise<void> {
    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (!profile?.email) {
      logger.warn(`No email found for user ${userId}`);
      return;
    }

    await supabase.from("email_queue").insert({
      to_email: profile.email,
      to_name: profile.full_name,
      subject: content.email_subject as string || content.title as string,
      html_body: content.email_body_html as string || this.generateEmailHtml(content),
      text_body: content.email_body_text as string || content.message as string,
      priority: content.priority as string,
    });

    logger.info(`Email queued for user ${userId}`);
  }

  /**
   * Send push notification
   */
  private async sendPush(userId: string, content: Record<string, unknown>): Promise<void> {
    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    // Call edge function to send push
    await supabase.functions.invoke("send-push-notification", {
      body: {
        subscriptions,
        notification: {
          title: content.title,
          body: content.message,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          data: {
            url: content.action_url,
          },
        },
      },
    });

    logger.info(`Push notification sent to user ${userId}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(userId: string, content: Record<string, unknown>): Promise<void> {
    // Get user phone
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", userId)
      .single();

    if (!profile?.phone) {
      logger.warn(`No phone found for user ${userId}`);
      return;
    }

    // Call SMS edge function
    await supabase.functions.invoke("send-alert-sms", {
      body: {
        to: profile.phone,
        message: content.sms_body || content.message,
        priority: content.priority,
      },
    });

    logger.info(`SMS sent to user ${userId}`);
  }

  /**
   * Schedule notification for later (quiet hours)
   */
  private async scheduleNotification(
    userId: string,
    templateName: string,
    variables: Record<string, string>,
    channels: NotificationChannel[]
  ): Promise<void> {
    const prefs = await this.getUserPreferences(userId);
    const scheduledFor = this.getNextAvailableTime(prefs);

    await supabase.from("scheduled_notifications").insert({
      user_id: userId,
      template_name: templateName,
      variables,
      channels,
      scheduled_for: scheduledFor.toISOString(),
    });

    logger.info(`Notification scheduled for ${scheduledFor.toISOString()}`);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      return data as unknown as NotificationPreferences;
    }

    // Return defaults
    return {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      alerts_enabled: true,
      reminders_enabled: true,
      info_enabled: true,
      marketing_enabled: false,
      quiet_hours_enabled: false,
      quiet_hours_timezone: "America/Sao_Paulo",
      digest_enabled: false,
      digest_frequency: "daily",
    };
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    return !error;
  }

  /**
   * Render template with variables
   */
  private renderTemplate(
    template: Record<string, unknown>,
    variables: Record<string, string>
  ): Record<string, unknown> {
    const render = (text: string | null | undefined): string => {
      if (!text) return "";
      let result = text;
      for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
      }
      return result;
    };

    return {
      title: render(template.title as string),
      message: render(template.message as string),
      email_subject: render(template.email_subject as string),
      email_body_html: render(template.email_body_html as string),
      email_body_text: render(template.email_body_text as string),
      sms_body: render(template.sms_body as string),
      category: template.category,
      priority: template.priority,
    };
  }

  /**
   * Check if category is enabled for user
   */
  private isCategoryEnabled(
    category: NotificationCategory,
    prefs: NotificationPreferences
  ): boolean {
    switch (category) {
      case "alert":
      case "urgent":
        return prefs.alerts_enabled;
      case "reminder":
        return prefs.reminders_enabled;
      case "info":
        return prefs.info_enabled;
      case "marketing":
        return prefs.marketing_enabled;
      default:
        return true;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const [startHour, startMin] = prefs.quiet_hours_start.split(":").map(Number);
    const [endHour, endMin] = prefs.quiet_hours_end.split(":").map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight quiet hours (e.g., 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  /**
   * Get next available time after quiet hours
   */
  private getNextAvailableTime(prefs: NotificationPreferences): Date {
    if (!prefs.quiet_hours_end) {
      return new Date();
    }

    const [endHour, endMin] = prefs.quiet_hours_end.split(":").map(Number);
    const next = new Date();
    next.setHours(endHour, endMin, 0, 0);

    if (next <= new Date()) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Generate basic email HTML
   */
  private generateEmailHtml(content: Record<string, unknown>): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${content.title}</h1>
    </div>
    <div class="content">
      <p>${content.message}</p>
      ${content.action_url ? `<a href="${content.action_url}" class="button">${content.action_label || "Ver Detalhes"}</a>` : ""}
    </div>
    <div class="footer">
      <p>Nauti One - Sistema de Gestão Marítima</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    return !error;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    return !error;
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("user_notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    return count || 0;
  }

  /**
   * Get recent notifications for user
   */
  async getNotifications(
    userId: string,
    options: { limit?: number; unreadOnly?: boolean } = {}
  ): Promise<unknown[]> {
    let query = supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(options.limit || 50);

    if (options.unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data } = await query;
    return data || [];
  }
}

export const NotificationService = new NotificationServiceClass();
