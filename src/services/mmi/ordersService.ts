/**
 * MMI Orders Service
 * Service layer for MMI service orders (OS) operations
 */

import { supabase } from "@/integrations/supabase/client";

export interface MMIOrder {
  id: string;
  order_number: string;
  vessel_name: string;
  system_name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  technician_comment?: string;
  executed_at?: string;
  pdf_path?: string;
  ai_diagnosis?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MMIOrderFilters {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  vessel_name?: string;
}

export interface MMIOrderStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

/**
 * Fetch all MMI orders with optional filtering
 */
export async function fetchAllOrders(filters?: MMIOrderFilters): Promise<MMIOrder[]> {
  let query = supabase
    .from("mmi_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.vessel_name) {
    query = query.ilike("vessel_name", `%${filters.vessel_name}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching MMI orders:", error);
    throw new Error(`Failed to fetch MMI orders: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single order by ID
 */
export async function fetchOrderById(id: string): Promise<MMIOrder | null> {
  const { data, error } = await supabase
    .from("mmi_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data;
}

/**
 * Get aggregated statistics for MMI orders
 */
export async function getOrderStats(): Promise<MMIOrderStats> {
  const { data, error } = await supabase
    .from("mmi_orders")
    .select("status");

  if (error) {
    console.error("Error fetching order stats:", error);
    throw new Error(`Failed to fetch order stats: ${error.message}`);
  }

  const stats: MMIOrderStats = {
    total: data?.length || 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  data?.forEach((record) => {
    if (record.status === "pending") stats.pending++;
    else if (record.status === "in_progress") stats.in_progress++;
    else if (record.status === "completed") stats.completed++;
    else if (record.status === "cancelled") stats.cancelled++;
  });

  return stats;
}

/**
 * Create a new MMI order
 */
export async function createOrder(
  order: Omit<MMIOrder, "id" | "created_at" | "updated_at">
): Promise<MMIOrder> {
  const { data, error } = await supabase
    .from("mmi_orders")
    .insert(order)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing MMI order
 */
export async function updateOrder(
  id: string,
  updates: Partial<Omit<MMIOrder, "id" | "created_at" | "updated_at">>
): Promise<MMIOrder> {
  const { data, error } = await supabase
    .from("mmi_orders")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating order:", error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  return data;
}

/**
 * Delete an MMI order
 */
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from("mmi_orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting order:", error);
    throw new Error(`Failed to delete order: ${error.message}`);
  }
}
