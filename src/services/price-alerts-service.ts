import { supabase } from "@/integrations/supabase/client";

export interface PriceAlert {
  id: string;
  user_id: string;
  product_name: string;
  target_price: number;
  current_price: number | null;
  product_url: string;
  route: string | null;
  travel_date: string | null;
  is_active: boolean;
  notification_email: boolean;
  notification_push: boolean;
  notification_frequency: "immediate" | "daily" | "weekly";
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
}

export interface CreatePriceAlertInput {
  product_name: string;
  target_price: number;
  current_price?: number;
  product_url: string;
  route?: string;
  travel_date?: string;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_frequency?: "immediate" | "daily" | "weekly";
}

export interface UpdatePriceAlertInput {
  product_name?: string;
  target_price?: number;
  current_price?: number;
  product_url?: string;
  route?: string;
  travel_date?: string;
  is_active?: boolean;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_frequency?: "immediate" | "daily" | "weekly";
}

export interface PriceHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
}

export interface PriceNotification {
  id: string;
  user_id: string;
  alert_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class PriceAlertsService {
  /**
   * Get all price alerts for the current user
   */
  async getAlerts(): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as any as PriceAlert[];
  }

  /**
   * Get a single price alert by ID
   */
  async getAlert(id: string): Promise<PriceAlert | null> {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any as PriceAlert;
  }

  /**
   * Create a new price alert
   */
  async createAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("price_alerts")
      .insert({
        user_id: user.id,
        product_name: input.product_name,
        target_price: input.target_price,
        current_price: input.current_price,
        product_url: input.product_url,
        route: input.route,
        travel_date: input.travel_date,
        notification_email: input.notification_email ?? true,
        notification_push: input.notification_push ?? true,
        notification_frequency: input.notification_frequency ?? "immediate",
        is_active: true
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as any as PriceAlert;
  }

  /**
   * Update an existing price alert
   */
  async updateAlert(id: string, input: UpdatePriceAlertInput): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from("price_alerts")
      .update(input as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as any as PriceAlert;
  }

  /**
   * Delete a price alert
   */
  async deleteAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Toggle alert active status
   */
  async toggleAlert(id: string, isActive: boolean): Promise<PriceAlert> {
    return this.updateAlert(id, { is_active: isActive });
  }

  /**
   * Get price history for an alert
   */
  async getPriceHistory(alertId: string): Promise<PriceHistory[]> {
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("alert_id", alertId)
      .order("checked_at", { ascending: false });

    if (error) throw error;
    return data as PriceHistory[];
  }

  /**
   * Add price history entry
   */
  async addPriceHistory(alertId: string, price: number): Promise<PriceHistory> {
    const { data, error } = await supabase
      .from("price_history")
      .insert({
        alert_id: alertId,
        price: price
      })
      .select()
      .single();

    if (error) throw error;
    return data as PriceHistory;
  }

  /**
   * Get notifications for the current user
   */
  async getNotifications(unreadOnly: boolean = false): Promise<PriceNotification[]> {
    let query = supabase
      .from("price_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PriceNotification[];
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("price_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("price_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;
  }
}

export const priceAlertsService = new PriceAlertsService();
