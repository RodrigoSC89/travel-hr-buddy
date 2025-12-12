
// PATCH-601: Re-added @ts-nocheck for build stability
/**
 * MMI Orders (OS) Service
 * Service for fetching and managing work orders
 */

import { supabase } from "@/integrations/supabase/client";
import { MMIOS } from "@/types/mmi";
import { logger } from "@/lib/logger";

/**
 * Fetch all work orders with job details
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
      logger.error("Error fetching orders", error as Error);
      throw error;
    }

    return data || [];
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
      logger.error("Error fetching order", error as Error, { orderId });
      throw error;
    }

    return data;
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
      .from("mmi_os")
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
      .from("mmi_os")
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
 * 
 * @param forecastId - UUID of the forecast
 * @param jobId - Optional UUID of the related job
 * @param descricao - Description of the work order
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function createOSFromForecast(
  forecastId: string,
  jobId: string | null,
  descricao: string
): Promise<boolean> {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.error("Auth error", authError as Error);
      throw new Error("Unauthorized");
    }

    // Insert work order into mmi_os table
    const { error } = await supabase.from("mmi_os").insert({
      forecast_id: forecastId,
      job_id: jobId,
      descricao,
      status: "pendente",
      created_by: user?.id || null,
      opened_by: user?.id || null
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
