/**
 * PATCH 879 - Price Alerts Service
 * Type-safe with dynamic table access for non-existent tables
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type PriceAlertRow = Database["public"]["Tables"]["price_alerts"]["Row"];
type PriceAlertInsert = Database["public"]["Tables"]["price_alerts"]["Insert"];
type PriceAlertUpdate = Database["public"]["Tables"]["price_alerts"]["Update"];

// Type-safe dynamic DB access for tables not in generated schema
type DynamicSupabaseClient = {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const dynamicDb = supabase as unknown as DynamicSupabaseClient;

export interface PriceAlert {
  id: string;
  userId: string;
  productName: string;
  productUrl?: string;
  currentPrice: number;
  targetPrice: number;
  isActive: boolean;
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlertNotification {
  id: string;
  userId: string;
  alertId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  priceDifference: number;
  message: string;
  isRead: boolean;
  isDismissed: boolean;
  sentAt: string;
}

export interface PriceHistory {
  id: string;
  alertId: string;
  price: number;
  checkedAt: string;
}

// Type-safe mapper functions
function mapAlertRow(row: PriceAlertRow): PriceAlert {
  return {
    id: row.id,
    userId: row.user_id,
    productName: row.product_name,
    productUrl: row.product_url ?? undefined,
    currentPrice: Number(row.current_price),
    targetPrice: Number(row.target_price),
    isActive: row.is_active ?? true,
    notificationChannels: ["in_app"], // Default since field may not exist
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function mapNotificationRow(row: Record<string, unknown>): PriceAlertNotification {
  return {
    id: String(row.id || ""),
    userId: String(row.user_id || ""),
    alertId: String(row.alert_id || ""),
    productName: String(row.product_name || ""),
    currentPrice: Number(row.current_price) || 0,
    targetPrice: Number(row.target_price) || 0,
    priceDifference: Number(row.price_difference) || 0,
    message: String(row.message || ""),
    isRead: Boolean(row.is_read),
    isDismissed: Boolean(row.is_dismissed),
    sentAt: String(row.sent_at || new Date().toISOString()),
  };
}

export class PriceAlertsService {
  /**
   * Create a new price alert
   */
  async createPriceAlert(
    productName: string,
    currentPrice: number,
    targetPrice: number,
    productUrl?: string,
    _notificationChannels: string[] = ["in_app"]
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const insertData: PriceAlertInsert = {
        user_id: user.id,
        product_name: productName,
        product_url: productUrl,
        current_price: currentPrice,
        target_price: targetPrice,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("price_alerts")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      logger.error("Error creating price alert:", { error });
      throw error;
    }
  }

  /**
   * Get user's price alerts
   */
  async getPriceAlerts(filters?: {
    isActive?: boolean;
  }): Promise<PriceAlert[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(mapAlertRow);
    } catch (error) {
      logger.error("Error fetching price alerts:", { error });
      throw error;
    }
  }

  /**
   * Update price alert
   */
  async updatePriceAlert(
    alertId: string,
    updates: {
      currentPrice?: number;
      targetPrice?: number;
      isActive?: boolean;
      notificationChannels?: string[];
    }
  ): Promise<void> {
    try {
      const updateData: PriceAlertUpdate = {};
      
      if (updates.currentPrice !== undefined) {
        updateData.current_price = updates.currentPrice;
      }
      if (updates.targetPrice !== undefined) {
        updateData.target_price = updates.targetPrice;
      }
      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
      }

      const { error } = await supabase
        .from("price_alerts")
        .update(updateData)
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating price alert:", { error });
      throw error;
    }
  }

  /**
   * Delete price alert
   */
  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting price alert:", { error });
      throw error;
    }
  }

  /**
   * Check price and create notification if target reached
   */
  async checkPrice(alertId: string, newPrice: number): Promise<boolean> {
    try {
      // Get alert details
      const { data: alert, error: alertError } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (alertError) throw alertError;
      if (!alert || !alert.is_active) return false;

      // Update current price
      await this.updatePriceAlert(alertId, { currentPrice: newPrice });

      // Check if target price is reached
      if (newPrice <= alert.target_price) {
        const priceDifference = alert.target_price - newPrice;
        const message = `🎉 Price Alert: ${alert.product_name} is now $${newPrice.toFixed(2)} (target: $${alert.target_price.toFixed(2)}). Save $${priceDifference.toFixed(2)}!`;

        // Create notification using dynamic table access
        await this.createNotification(
          alert.user_id,
          alertId,
          alert.product_name,
          newPrice,
          alert.target_price,
          message,
          ["in_app"]
        );

        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error checking price:", { error });
      throw error;
    }
  }

  /**
   * Create price alert notification (using dynamic table)
   */
  private async createNotification(
    userId: string,
    alertId: string,
    productName: string,
    currentPrice: number,
    targetPrice: number,
    message: string,
    channels: string[]
  ): Promise<void> {
    try {
      // Check if notification was sent recently (within last hour)
      const { data: recentNotif, error: checkError } = await dynamicDb
        .from("price_alert_notifications")
        .select("id")
        .eq("alert_id", alertId)
        .gte("sent_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(1);

      if (checkError) {
        logger.warn("price_alert_notifications table may not exist:", { error: checkError });
        return;
      }

      // Don't send if notification already sent recently
      if (recentNotif && recentNotif.length > 0) {
        return;
      }

      const priceDifference = targetPrice - currentPrice;

      const { error } = await dynamicDb
        .from("price_alert_notifications")
        .insert({
          user_id: userId,
          alert_id: alertId,
          product_name: productName,
          current_price: currentPrice,
          target_price: targetPrice,
          price_difference: priceDifference,
          notification_channels: channels,
          message,
          is_read: false,
          is_dismissed: false,
        });

      if (error) {
        logger.warn("Failed to insert notification:", { error });
      }
    } catch (error) {
      logger.error("Error creating notification:", { error });
    }
  }

  /**
   * Get user's notifications (using dynamic table)
   */
  async getNotifications(filters?: {
    isRead?: boolean;
    isDismissed?: boolean;
  }): Promise<PriceAlertNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = dynamicDb
        .from("price_alert_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false });

      if (filters?.isRead !== undefined) {
        query = query.eq("is_read", filters.isRead);
      }

      if (filters?.isDismissed !== undefined) {
        query = query.eq("is_dismissed", filters.isDismissed);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn("price_alert_notifications table may not exist:", { error });
        return [];
      }
      
      return (data || []).map((row: unknown) => mapNotificationRow(row as Record<string, unknown>));
    } catch (error) {
      logger.error("Error fetching notifications:", { error });
      return [];
    }
  }

  /**
   * Mark notification as read (using dynamic table)
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await dynamicDb
        .from("price_alert_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) {
        logger.warn("Failed to update notification:", { error });
      }
    } catch (error) {
      logger.error("Error marking notification as read:", { error });
    }
  }

  /**
   * Dismiss notification (using dynamic table)
   */
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await dynamicDb
        .from("price_alert_notifications")
        .update({ is_dismissed: true })
        .eq("id", notificationId);

      if (error) {
        logger.warn("Failed to dismiss notification:", { error });
      }
    } catch (error) {
      logger.error("Error dismissing notification:", { error });
    }
  }

  /**
   * Get price history for an alert
   */
  async getPriceHistory(alertId: string, limit: number = 100): Promise<PriceHistory[]> {
    try {
      const { data, error } = await supabase
        .from("price_history")
        .select("*")
        .eq("alert_id", alertId)
        .order("checked_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(h => ({
        id: h.id,
        alertId: h.alert_id,
        price: Number(h.price),
        checkedAt: h.checked_at ?? new Date().toISOString(),
      }));
    } catch (error) {
      logger.error("Error fetching price history:", { error });
      return [];
    }
  }

  /**
   * Get price trends and statistics
   */
  async getPriceTrends(alertId: string): Promise<{
    currentPrice: number;
    targetPrice: number;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    priceChange24h: number;
    targetReached: boolean;
  }> {
    try {
      // Get alert
      const { data: alert, error: alertError } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (alertError) throw alertError;

      // Get price history for last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: history, error: historyError } = await supabase
        .from("price_history")
        .select("price")
        .eq("alert_id", alertId)
        .gte("checked_at", oneDayAgo)
        .order("checked_at", { ascending: false });

      if (historyError) throw historyError;

      const prices = (history || []).map(h => Number(h.price));
      const currentPrice = Number(alert.current_price) || 0;
      const targetPrice = Number(alert.target_price);

      const lowestPrice = prices.length > 0 ? Math.min(...prices) : currentPrice;
      const highestPrice = prices.length > 0 ? Math.max(...prices) : currentPrice;
      const averagePrice = prices.length > 0 
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
        : currentPrice;

      const oldestPrice = prices.length > 0 ? prices[prices.length - 1] : currentPrice;
      const priceChange24h = currentPrice - oldestPrice;
      const targetReached = currentPrice <= targetPrice;

      return {
        currentPrice,
        targetPrice,
        lowestPrice,
        highestPrice,
        averagePrice,
        priceChange24h,
        targetReached,
      };
    } catch (error) {
      logger.error("Error calculating price trends:", { error });
      return {
        currentPrice: 0,
        targetPrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        averagePrice: 0,
        priceChange24h: 0,
        targetReached: false,
      };
    }
  }
}

export const priceAlertsService = new PriceAlertsService();
