/**
 * MMI Orders (OS) Service
 * Service for fetching and managing work orders
 */

import { supabase } from "@/integrations/supabase/client";
import { MMIOS } from "@/types/mmi";

export interface MMIOrder {
  id: string;
  forecast_id?: string;
  vessel_name: string;
  system_name: string;
  description: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  priority: "baixa" | "normal" | "alta" | "crítica";
  technician_comment?: string;
  pdf_path?: string;
  ai_diagnosis?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  completion_rate: number;
}

/**
 * Fetch all work orders from mmi_orders table
 */
export async function fetchAllOrders(): Promise<MMIOrder[]> {
  try {
    const { data, error } = await supabase
      .from("mmi_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

/**
 * Fetch all work orders with job details (for backward compatibility)
 */
export async function fetchOrders(): Promise<MMIOS[]> {
  try {
    const { data, error } = await supabase
      .from("mmi_os")
      .select(`
        *,
        job:mmi_jobs(
          id,
          title,
          description,
          priority,
          component_name,
          vessel_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

/**
 * Fetch a single work order by ID
 */
export async function fetchOrderById(orderId: string): Promise<MMIOS | null> {
  try {
    const { data, error } = await supabase
      .from("mmi_os")
      .select(`
        *,
        job:mmi_jobs(
          id,
          title,
          description,
          priority,
          component_name,
          vessel_name
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats(): Promise<OrderStats> {
  try {
    const { data, error } = await supabase
      .from("mmi_orders")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      completion_rate: 0,
    };

    data?.forEach((order) => {
      switch (order.status) {
      case "pendente":
        stats.pending++;
        break;
      case "em_andamento":
        stats.in_progress++;
        break;
      case "concluido":
        stats.completed++;
        break;
      case "cancelado":
        stats.cancelled++;
        break;
      }
    });

    stats.completion_rate =
      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return stats;
  } catch (error) {
    console.error("Error getting order stats:", error);
    return {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      completion_rate: 0,
    };
  }
}

/**
 * Create a new work order
 */
export async function createOrder(
  order: Omit<MMIOrder, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; data?: MMIOrder; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("mmi_orders")
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing work order
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Omit<MMIOrder, "id" | "created_at" | "updated_at">>
): Promise<{ success: boolean; data?: MMIOrder; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("mmi_orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to update order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a work order
 */
export async function deleteOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("mmi_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update work order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "open" | "in_progress" | "completed" | "cancelled"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("mmi_os")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/**
 * Add technician comment to work order
 */
export async function addTechnicianComment(
  orderId: string,
  comment: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("mmi_os")
      .update({ 
        notes: comment,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding comment:", error);
    return false;
  }
}
