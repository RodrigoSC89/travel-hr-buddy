import { supabase } from "@/integrations/supabase/client";

/**
 * Service to process price alert notification queue
 * This can be called periodically (e.g., every minute) to process pending notifications
 */
export class PriceAlertNotificationProcessor {
  private processing = false;

  /**
   * Process all pending notifications in the queue
   */
  async processQueue(): Promise<void> {
    if (this.processing) {
      console.log("Already processing notifications, skipping...");
      return;
    }

    this.processing = true;

    try {
      // Get unprocessed notifications
      const { data: notifications, error } = await supabase
        .from("price_alert_notification_queue")
        .select("*")
        .eq("processed", false)
        .order("created_at", { ascending: true })
        .limit(10); // Process in batches

      if (error) {
        console.error("Error fetching notification queue:", error);
        return;
      }

      if (!notifications || notifications.length === 0) {
        console.log("No pending notifications to process");
        return;
      }

      console.log(`Processing ${notifications.length} notifications...`);

      // Process each notification
      for (const notification of notifications) {
        try {
          await this.sendNotification(notification);

          // Mark as processed
          await supabase
            .from("price_alert_notification_queue")
            .update({
              processed: true,
              processed_at: new Date().toISOString(),
            })
            .eq("id", notification.id);

          console.log(`Notification ${notification.id} processed successfully`);
        } catch (err) {
          console.error(`Error processing notification ${notification.id}:`, err);
          // Continue with next notification
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Send a single notification via edge function
   */
  private async sendNotification(notification: any): Promise<void> {
    const { error } = await supabase.functions.invoke("send-price-alert-notification", {
      body: {
        alert_id: notification.alert_id,
        user_id: notification.user_id,
        product_name: notification.product_name,
        current_price: notification.current_price,
        target_price: notification.target_price,
        product_url: notification.product_url,
        notification_type: notification.notification_type,
      },
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Start automatic processing (poll every minute)
   */
  startAutoProcessing(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      this.processQueue();
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export const notificationProcessor = new PriceAlertNotificationProcessor();
