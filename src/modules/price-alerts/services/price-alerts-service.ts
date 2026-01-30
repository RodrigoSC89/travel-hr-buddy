// @ts-nocheck
/**
 * PATCH 484 - Price Alerts Service
 * Monitor prices, create alerts, and send multi-channel notifications
 */

import { supabase } from "@/integrations/supabase/client";

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

export class PriceAlertsService {
  /**
   * Create a new price alert
   */
  async createPriceAlert(
    productName: string,
    currentPrice: number,
    targetPrice: number,
    productUrl?: string,
    notificationChannels: string[] = ["in_app"]
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: user.id,
          product_name: productName,
          product_url: productUrl,
          current_price: currentPrice,
          target_price: targetPrice,
          is_active: true,
          notification_channels: notificationChannels
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating price alert:", error);
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

      return (data || []).map(a => ({
        id: a.id,
        userId: a.user_id,
        productName: a.product_name,
        productUrl: a.product_url,
        currentPrice: a.current_price,
        targetPrice: a.target_price,
        isActive: a.is_active,
        notificationChannels: a.notification_channels || ["in_app"],
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));
    } catch (error) {
      console.error("Error fetching price alerts:", error);
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
  ) {
    try {
      const updateData: any = {};
      
      if (updates.currentPrice !== undefined) {
        updateData.current_price = updates.currentPrice;
      }
      if (updates.targetPrice !== undefined) {
        updateData.target_price = updates.targetPrice;
      }
      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
      }
      if (updates.notificationChannels !== undefined) {
        updateData.notification_channels = updates.notificationChannels;
      }

      const { error } = await supabase
        .from("price_alerts")
        .update(updateData)
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating price alert:", error);
      throw error;
    }
  }

  /**
   * Delete price alert
   */
  async deletePriceAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting price alert:", error);
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

      // Update current price (this will trigger record_price_check function)
      await this.updatePriceAlert(alertId, { currentPrice: newPrice });

      // Check if target price is reached
      if (newPrice <= alert.target_price) {
        const priceDifference = alert.target_price - newPrice;
        const message = `🎉 Price Alert: ${alert.product_name} is now $${newPrice.toFixed(2)} (target: $${alert.target_price.toFixed(2)}). Save $${priceDifference.toFixed(2)}!`;

        // Create notification
        await this.createNotification(
          alert.user_id,
          alertId,
          alert.product_name,
          newPrice,
          alert.target_price,
          message,
          alert.notification_channels || ["in_app"]
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking price:", error);
      throw error;
    }
  }

  /**
   * Create price alert notification
   */
  private async createNotification(
    userId: string,
    alertId: string,
    productName: string,
    currentPrice: number,
    targetPrice: number,
    message: string,
    channels: string[]
  ) {
    try {
      // Check if notification was sent recently (within last hour)
      const { data: recentNotif, error: checkError } = await supabase
        .from("price_alert_notifications")
        .select("id")
        .eq("alert_id", alertId)
        .gte("sent_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(1);

      if (checkError) throw checkError;

      // Don't send if notification already sent recently
      if (recentNotif && recentNotif.length > 0) {
        return;
      }

      const priceDifference = targetPrice - currentPrice;

      const { error } = await supabase
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
          is_dismissed: false
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(filters?: {
    isRead?: boolean;
    isDismissed?: boolean;
  }): Promise<PriceAlertNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
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

      if (error) throw error;

      return (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        alertId: n.alert_id,
        productName: n.product_name,
        currentPrice: n.current_price,
        targetPrice: n.target_price,
        priceDifference: n.price_difference,
        message: n.message,
        isRead: n.is_read,
        isDismissed: n.is_dismissed,
        sentAt: n.sent_at
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("price_alert_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Dismiss notification
   */
  async dismissNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from("price_alert_notifications")
        .update({ is_dismissed: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error dismissing notification:", error);
      throw error;
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
        price: h.price,
        checkedAt: h.checked_at
      }));
    } catch (error) {
      console.error("Error fetching price history:", error);
      throw error;
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

      const prices = (history || []).map(h => h.price);
      const currentPrice = alert.current_price || 0;
      const targetPrice = alert.target_price;

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
        targetReached
      };
    } catch (error) {
      console.error("Error calculating price trends:", error);
      throw error;
    }
  }
}

export const priceAlertsService = new PriceAlertsService();
