/**
 * Multi-Channel Notification Dispatcher
 * Sends notifications across multiple channels based on user preferences
 */
import { supabase } from "@/integrations/supabase/client";
import { EmailIntegration } from "./email-integration";
import { TwilioIntegration } from "./twilio-integration";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  category: "alert" | "reminder" | "info" | "urgent";
  priority?: "low" | "normal" | "high" | "urgent";
  channels?: ("email" | "sms" | "whatsapp" | "push" | "in_app")[];
  data?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationResult {
  success: boolean;
  channels: {
    channel: string;
    success: boolean;
    error?: string;
  }[];
}

/**
 * Get user notification preferences
 */
async function getUserPreferences(userId: string) {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data || {
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    alerts_enabled: true,
    reminders_enabled: true,
    info_enabled: true,
    quiet_hours_enabled: false,
  };
}

/**
 * Get user contact info
 */
async function getUserContact(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("email, phone, full_name")
    .eq("id", userId)
    .single();

  return data;
}

/**
 * Check if in quiet hours
 */
function isQuietHours(prefs: any): boolean {
  if (!prefs.quiet_hours_enabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = (prefs.quiet_hours_start || "22:00").split(":").map(Number);
  const [endHour, endMin] = (prefs.quiet_hours_end || "07:00").split(":").map(Number);
  
  const quietStart = startHour * 60 + startMin;
  const quietEnd = endHour * 60 + endMin;

  if (quietStart < quietEnd) {
    return currentTime >= quietStart && currentTime < quietEnd;
  } else {
    return currentTime >= quietStart || currentTime < quietEnd;
  }
}

/**
 * Send notification across multiple channels
 */
export async function sendMultiChannelNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const results: NotificationResult["channels"] = [];
  
  try {
    // Get user preferences and contact info
    const [prefs, contact] = await Promise.all([
      getUserPreferences(payload.userId),
      getUserContact(payload.userId),
    ]);

    if (!contact) {
      return {
        success: false,
        channels: [{ channel: "all", success: false, error: "User not found" }],
      };
    }

    // Check quiet hours (skip for urgent)
    if (isQuietHours(prefs) && payload.priority !== "urgent") {
      // Schedule for later instead of sending now
      await supabase.from("scheduled_notifications").insert([{
        user_id: payload.userId,
        template_name: "custom",
        variables: JSON.parse(JSON.stringify(payload)),
        channels: payload.channels || ["in_app"],
        scheduled_for: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
      }]);
      
      return {
        success: true,
        channels: [{ channel: "scheduled", success: true }],
      };
    }

    // Determine which channels to use
    const channels = payload.channels || ["in_app", "email"];
    const categoryEnabled = 
      (payload.category === "alert" && prefs.alerts_enabled) ||
      (payload.category === "reminder" && prefs.reminders_enabled) ||
      (payload.category === "info" && prefs.info_enabled) ||
      payload.category === "urgent";

    if (!categoryEnabled) {
      return {
        success: true,
        channels: [{ channel: "none", success: true, error: "Category disabled by user" }],
      };
    }

    // Send to each enabled channel
    const promises: Promise<void>[] = [];

    // In-App notification
    if (channels.includes("in_app") && prefs.in_app_enabled) {
      promises.push(
        (async () => {
          try {
            await supabase.from("user_notifications").insert({
              user_id: payload.userId,
              title: payload.title,
              message: payload.message,
              category: payload.category,
              priority: payload.priority || "normal",
              action_url: payload.actionUrl,
              action_label: payload.actionLabel,
              metadata: payload.data,
            });
            results.push({ channel: "in_app", success: true });
          } catch (err) {
            results.push({ 
              channel: "in_app", 
              success: false, 
              error: err instanceof Error ? err.message : "Unknown error" 
            });
          }
        })()
      );
    }

    // Email
    if (channels.includes("email") && prefs.email_enabled && contact.email) {
      promises.push(
        (async () => {
          try {
            const result = await EmailIntegration.send({
              to: contact.email,
              subject: payload.title,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>${payload.title}</h2>
                  <p>${payload.message}</p>
                  ${payload.actionUrl ? `<a href="${payload.actionUrl}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">${payload.actionLabel || "Ver Detalhes"}</a>` : ""}
                  <hr style="margin: 20px 0;">
                  <p style="color: #666; font-size: 12px;">Nauti One - Sistema de Gestão Marítima</p>
                </div>
              `,
            });
            results.push({ channel: "email", success: result.success, error: result.error });
          } catch (err) {
            results.push({ 
              channel: "email", 
              success: false, 
              error: err instanceof Error ? err.message : "Unknown error" 
            });
          }
        })()
      );
    }

    // SMS
    if (channels.includes("sms") && prefs.sms_enabled && contact.phone) {
      promises.push(
        (async () => {
          try {
            const result = await TwilioIntegration.sendSMS({
              to: contact.phone!,
              message: `${payload.title}\n\n${payload.message}`,
            });
            results.push({ channel: "sms", success: result.success, error: result.error });
          } catch (err) {
            results.push({ 
              channel: "sms", 
              success: false, 
              error: err instanceof Error ? err.message : "Unknown error" 
            });
          }
        })()
      );
    }

    // WhatsApp
    if (channels.includes("whatsapp") && prefs.sms_enabled && contact.phone) {
      promises.push(
        (async () => {
          try {
            const result = await TwilioIntegration.sendWhatsApp({
              to: contact.phone!,
              message: `*${payload.title}*\n\n${payload.message}${payload.actionUrl ? `\n\n${payload.actionUrl}` : ""}`,
            });
            results.push({ channel: "whatsapp", success: result.success, error: result.error });
          } catch (err) {
            results.push({ 
              channel: "whatsapp", 
              success: false, 
              error: err instanceof Error ? err.message : "Unknown error" 
            });
          }
        })()
      );
    }

    // Push notification
    if (channels.includes("push") && prefs.push_enabled) {
      promises.push(
        (async () => {
          try {
            await supabase.functions.invoke("send-push-notification", {
              body: {
                userId: payload.userId,
                title: payload.title,
                body: payload.message,
                data: {
                  url: payload.actionUrl,
                  ...payload.data,
                },
              },
            });
            results.push({ channel: "push", success: true });
          } catch (err) {
            results.push({ 
              channel: "push", 
              success: false, 
              error: err instanceof Error ? err.message : "Unknown error" 
            });
          }
        })()
      );
    }

    await Promise.all(promises);

    const success = results.some(r => r.success);
    return { success, channels: results };

  } catch (err) {
    return {
      success: false,
      channels: [{ 
        channel: "all", 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      }],
    };
  }
}
