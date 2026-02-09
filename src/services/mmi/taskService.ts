/**
 * MMI Task Service
 * Automatic task and work order creation from AI forecasts
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { MMITask, AIForecast } from "@/types/mmi";

// Dynamic supabase for tables not in schema
const dynamicFrom = supabase.from as Function;

interface CreateTaskFromForecastInput {
  forecast: AIForecast;
  system_name: string;
  vessel_id?: string;
  component_name: string;
  created_by?: string;
}

/**
 * Create a maintenance task from an AI forecast
 */
export async function createTaskFromForecast(
  input: CreateTaskFromForecastInput
): Promise<MMITask | null> {
  try {
    const { forecast, system_name, vessel_id, component_name, created_by } = input;

    // Generate task title
    const title = `${system_name} - ${component_name}`;

    // Generate detailed description from forecast
    const description = `
🔧 Intervenção: ${forecast.next_intervention}

📊 Justificativa Técnica:
${forecast.reasoning}

⚠️ Impacto de Não Execução:
${forecast.impact}

⏱️ Horímetro Atual: ${forecast.hourometer_current}h

📋 Histórico de Manutenções:
${forecast.maintenance_history.map((h) => `• ${h.date}: ${h.action}`).join("\n")}
    `.trim();

    // Get current user if not provided
    let userId = created_by;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // Create task
    const { data: task, error } = await dynamicFrom("mmi_tasks")
      .insert({
        title,
        description,
        forecast_date: forecast.suggested_date,
        vessel_id,
        system_name,
        status: "pendente",
        priority: forecast.priority,
        ai_reasoning: forecast.reasoning,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating task", error as Error, { title, systemName: system_name });
      throw error;
    }

    logger.info("Task created successfully", { taskId: task.id, title });
    return task as MMITask;
  } catch (error) {
    logger.error("Error in createTaskFromForecast", error as Error, { systemName: input.system_name, componentName: input.component_name });
    return null;
  }
}

/**
 * Fetch all tasks with optional filters
 */
export async function fetchTasks(filters?: {
  status?: string;
  priority?: string;
  vessel_id?: string;
}): Promise<MMITask[]> {
  try {
    let query = dynamicFrom("mmi_tasks")
      .select(`
        *,
        vessel:vessels(id, name)
      `)
      .order("forecast_date", { ascending: true });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters?.vessel_id) {
      query = query.eq("vessel_id", filters.vessel_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as MMITask[];
  } catch (error) {
    logger.error("Error fetching tasks", error as Error, { filters });
    return [];
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: "pendente" | "em_andamento" | "concluido" | "cancelado"
): Promise<boolean> {
  try {
    const { error } = await dynamicFrom("mmi_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    logger.error("Error updating task status", error as Error, { taskId, status });
    return false;
  }
}

/**
 * Assign task to a user
 */
export async function assignTask(taskId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await dynamicFrom("mmi_tasks")
      .update({ assigned_to: userId, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    logger.error("Error assigning task", error as Error, { taskId, userId });
    return false;
  }
}

/**
 * Create a work order (OS) from a task
 */
export async function createWorkOrderFromTask(taskId: string): Promise<{ os_number: string; id: string } | null> {
  try {
    // Fetch the task details
    const { data: task, error: taskError } = await dynamicFrom("mmi_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      throw taskError || new Error("Task not found");
    }

    // Find or create a corresponding mmi_job
    const { data: existingJob } = await dynamicFrom("mmi_jobs")
      .select("id")
      .eq("title", task.title)
      .maybeSingle();

    let jobId = existingJob?.id;

    if (!jobId) {
      // Create a new job
      const { data: newJob, error: jobError } = await dynamicFrom("mmi_jobs")
        .insert({
          title: task.title,
          status: "pending",
          priority: task.priority,
          due_date: task.forecast_date,
          component_name: task.system_name,
          vessel_name: task.vessel?.name || "Unknown",
          suggestion_ia: task.ai_reasoning,
          can_postpone: task.priority !== "critical",
        })
        .select("id")
        .single();

      if (jobError || !newJob) {
        throw jobError || new Error("Failed to create job");
      }

      jobId = newJob.id;
    }

    // Generate OS number (format: OS-YYYYNNNN)
    const year = new Date().getFullYear();
    const { count } = await dynamicFrom("mmi_os")
      .select("*", { count: "exact", head: true })
      .like("os_number", `OS-${year}%`);

    const nextNumber = (count || 0) + 1;
    const osNumber = `OS-${year}${nextNumber.toString().padStart(4, "0")}`;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Create work order
    const { data: workOrder, error: osError } = await dynamicFrom("mmi_os")
      .insert({
        job_id: jobId,
        os_number: osNumber,
        status: "open",
        opened_by: user?.id || task.created_by,
        notes: task.description,
      })
      .select("id, os_number")
      .single();

    if (osError || !workOrder) {
      throw osError || new Error("Failed to create work order");
    }

    // Update task status
    await updateTaskStatus(taskId, "em_andamento");

    return {
      os_number: workOrder.os_number,
      id: workOrder.id,
    };
  } catch (error) {
    logger.error("Error creating work order from task", error as Error, { taskId });
    return null;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await dynamicFrom("mmi_tasks")
      .delete()
      .eq("id", taskId);

    if (error) throw error;

    return true;
  } catch (error) {
    logger.error("Error deleting task", error as Error, { taskId });
    return false;
  }
}
