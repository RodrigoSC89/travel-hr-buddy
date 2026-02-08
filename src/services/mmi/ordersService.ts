/**
 * MMI Orders (OS) Service
 * Service for fetching and managing work orders
 * Uses maintenance_tasks as canonical table (mmi_os not in typed schema)
 */

import { supabase } from "@/integrations/supabase/client";
import type { MMIOS } from "@/types/mmi";
import { logger } from "@/lib/logger";

/**
 * Fetch all work orders from maintenance_tasks
 */
export async function fetchOrders(): Promise<MMIOS[]> {
  try {
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching orders", error as Error);
      throw error;
    }

    // Map maintenance_tasks to MMIOS interface
    return (data || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status || "open",
      priority: task.priority || "medium",
      component_name: task.component_name,
      vessel_id: task.vessel_id,
      assigned_to: task.assigned_to,
      created_at: task.created_at,
      updated_at: task.updated_at,
      notes: task.notes,
    })) as MMIOS[];
  } catch (error) {
    logger.error("Failed to fetch orders", error as Error);
    return [];
  }
}

/**
 * Fetch a single work order by ID
 */
export async function fetchOrderById(orderId: string): Promise<MMIOS | null> {
  try {
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching order", error as Error, { orderId });
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status || "open",
      priority: data.priority || "medium",
      component_name: data.component_name,
      vessel_id: data.vessel_id,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      notes: data.notes,
    } as MMIOS;
  } catch (error) {
    logger.error("Failed to fetch order", error as Error, { orderId });
    return null;
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
      .from("maintenance_tasks")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error("Error updating order status", error as Error, { orderId, status });
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
      .from("maintenance_tasks")
      .update({ 
        notes: comment,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error("Error adding comment", error as Error, { orderId, commentLength: comment.length });
    return false;
  }
}

/**
 * Create work order (OS) from forecast
 */
export async function createOSFromForecast(
  forecastId: string,
  jobId: string | null,
  descricao: string
): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error("Auth error", authError as Error);
      throw new Error("Unauthorized");
    }

    const { error } = await supabase.from("maintenance_tasks").insert({
      title: `OS - ${descricao.substring(0, 50)}`,
      description: descricao,
      status: "pending",
      priority: "medium",
      assigned_to: user?.id || null,
      created_by: user?.id || null,
    });

    if (error) {
      logger.error("Error creating OS", error as Error, { forecastId, jobId });
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    logger.error("Failed to create OS from forecast", error as Error, { forecastId, jobId });
    return false;
  }
}
