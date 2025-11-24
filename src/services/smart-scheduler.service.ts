// PATCH 597: Smart Scheduler Service
import { supabase } from "@/integrations/supabase/client";
import type { 
  ScheduledTask, 
  TaskFilter, 
  TaskGenerationRequest,
  TaskGenerationResponse 
} from '@/types/smart-scheduler';

export class SmartSchedulerService {
  /**
   * Fetch tasks with optional filters
   */
  static async getTasks(filter?: TaskFilter): Promise<ScheduledTask[]> {
    let query = supabase
      .from('scheduled_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (filter?.module) {
      query = query.eq('module', filter.module);
    }
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.priority) {
      query = query.eq('priority', filter.priority);
    }
    if (filter?.assigned_to) {
      query = query.eq('assigned_to', filter.assigned_to);
    }
    if (filter?.vessel_id) {
      query = query.eq('vessel_id', filter.vessel_id);
    }
    if (filter?.date_from) {
      query = query.gte('due_date', filter.date_from);
    }
    if (filter?.date_to) {
      query = query.lte('due_date', filter.date_to);
    }
    if (filter?.ai_generated !== undefined) {
      query = query.eq('ai_generated', filter.ai_generated);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new task
   */
  static async createTask(task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Mark task as completed
   */
  static async completeTask(id: string): Promise<ScheduledTask> {
    return this.updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Generate tasks using AI based on historical data
   */
  static async generateTasks(request: TaskGenerationRequest): Promise<TaskGenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-scheduled-tasks', {
      body: request,
    });

    if (error) {
      console.error('Error generating tasks:', error);
      throw error;
    }

    return data as TaskGenerationResponse;
  }

  /**
   * Mark overdue tasks
   */
  static async markOverdueTasks(): Promise<void> {
    const { error } = await supabase.rpc('mark_overdue_tasks');

    if (error) {
      console.error('Error marking overdue tasks:', error);
      throw error;
    }
  }

  /**
   * Generate recurring tasks
   */
  static async generateRecurringTasks(): Promise<void> {
    const { error } = await supabase.rpc('generate_recurring_tasks');

    if (error) {
      console.error('Error generating recurring tasks:', error);
      throw error;
    }
  }

  /**
   * Get task statistics by module
   */
  static async getTaskStatsByModule() {
    const tasks = await this.getTasks();
    
    const statsByModule = tasks.reduce((acc, task) => {
      if (!acc[task.module]) {
        acc[task.module] = {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          overdue: 0,
        };
      }
      
      acc[task.module].total++;
      acc[task.module][task.status]++;
      
      return acc;
    }, {} as Record<string, any>);

    return statsByModule;
  }
}
