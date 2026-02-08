/**
 * PATCH 484 - Price Alerts Service
 * DEBT-FIX: Removed (supabase as any) - price_alerts exists (requires product_url),
 * price_alert_notifications → price_notifications
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

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
  message: string;
  isRead: boolean;
  sentAt: string;
}

export interface PriceHistory {
  id: string;
  alertId: string;
  price: number;
  checkedAt: string;
}

export class PriceAlertsService {
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
          product_url: productUrl || "",
          current_price: currentPrice,
          target_price: targetPrice,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      logger.error("Error creating price alert:", error);
      throw error;
    }
  }

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
        productUrl: a.product_url || undefined,
        currentPrice: a.current_price || 0,
        targetPrice: a.target_price,
        isActive: a.is_active,
        notificationChannels: ["in_app"],
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));
    } catch (error) {
      logger.error("Error fetching price alerts:", error);
      throw error;
    }
  }

  async updatePriceAlert(
    alertId: string,
    updates: {
      currentPrice?: number;
      targetPrice?: number;
      isActive?: boolean;
    }
  ) {
    try {
      const updateData: Record<string, any> = {};
      
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
      logger.error("Error updating price alert:", error);
      throw error;
    }
  }

  async deletePriceAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting price alert:", error);
      throw error;
    }
  }

  async checkPrice(alertId: string, newPrice: number): Promise<boolean> {
    try {
      const { data: alert, error: alertError } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (alertError) throw alertError;
      if (!alert || !alert.is_active) return false;

      await this.updatePriceAlert(alertId, { currentPrice: newPrice });

      if (newPrice <= alert.target_price) {
        const message = `🎉 Price Alert: ${alert.product_name} is now $${newPrice.toFixed(2)} (target: $${alert.target_price.toFixed(2)})`;

        await this.createNotification(
          alert.user_id,
          alertId,
          message
        );

        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error checking price:", error);
      throw error;
    }
  }

  /**
   * Create price notification using price_notifications table (typed)
   */
  private async createNotification(
    userId: string,
    alertId: string,
    message: string
  ) {
    try {
      // Check if notification was sent recently (within last hour)
      const { data: recentNotif, error: checkError } = await supabase
        .from("price_notifications")
        .select("id")
        .eq("alert_id", alertId)
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(1);

      if (checkError) throw checkError;

      if (recentNotif && recentNotif.length > 0) {
        return;
      }

      const { error } = await supabase
        .from("price_notifications")
        .insert({
          user_id: userId,
          alert_id: alertId,
          message,
          is_read: false,
        });

      if (error) throw error;
    } catch (error) {
      logger.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotifications(filters?: {
    isRead?: boolean;
  }): Promise<PriceAlertNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from("price_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters?.isRead !== undefined) {
        query = query.eq("is_read", filters.isRead);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        alertId: n.alert_id,
        message: n.message,
        isRead: n.is_read,
        sentAt: n.created_at
      }));
    } catch (error) {
      logger.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("price_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async dismissNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from("price_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error dismissing notification:", error);
      throw error;
    }
  }

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
      logger.error("Error fetching price history:", error);
      throw error;
    }
  }

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
      const { data: alert, error: alertError } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (alertError) throw alertError;

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
      logger.error("Error calculating price trends:", error);
      throw error;
    }
  }
}

export const priceAlertsService = new PriceAlertsService();
