/**
 * PATCH 536 - Coordination AI Engine Service
 * Multi-agent coordination system with priority-based task distribution
 * 
 * Uses existing agent_registry table for coordination logic.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";
import type { 
  CoordinationAgent, 
  CoordinationTask, 
  CoordinationDecision,
  AgentStatus,
  TaskStatus,
} from "@/types/patches-536-540";

type AgentRegistryRow = Database["public"]["Tables"]["agent_registry"]["Row"];
type AgentRegistryInsert = Database["public"]["Tables"]["agent_registry"]["Insert"];

function mapRegistryToAgent(row: AgentRegistryRow): CoordinationAgent {
  const capabilities = row.capabilities as { list?: string[] } | null;
  const metadata = row.metadata as Record<string, unknown> | null;
  const now = new Date().toISOString();
  
  return {
    id: row.id,
    agent_name: row.name,
    agent_type: (row.agent_id as CoordinationAgent["agent_type"]) || "analyzer",
    capabilities: capabilities?.list || [],
    status: (row.status as AgentStatus) || "idle",
    priority_level: 5,
    max_concurrent_tasks: 3,
    current_task_count: 0,
    metadata: metadata || {},
    last_heartbeat: row.last_heartbeat || now,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

class CoordinationAIService {
  /**
   * Register a new agent in the coordination system
   */
  async registerAgent(agent: Partial<CoordinationAgent> & { agent_name: string; agent_type: CoordinationAgent["agent_type"] }): Promise<CoordinationAgent | null> {
    const insert: AgentRegistryInsert = {
      agent_id: agent.agent_type,
      name: agent.agent_name,
      capabilities: { list: agent.capabilities },
      status: agent.status || "idle",
      metadata: {
        ...agent.metadata,
        priority_level: agent.priority_level,
        max_concurrent_tasks: agent.max_concurrent_tasks,
      },
    };

    const { data, error } = await supabase
      .from("agent_registry")
      .insert([insert])
      .select()
      .single();

    if (error) {
      logger.error("Error registering agent", error, { agent: agent.agent_name });
      return null;
    }

    return mapRegistryToAgent(data);
  }

  /**
   * Get all agents with optional filtering
   */
  async getAgents(filters?: { status?: AgentStatus; type?: string }): Promise<CoordinationAgent[]> {
    let query = supabase.from("agent_registry").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("agent_id", filters.type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching agents", error, { filters });
      return [];
    }

    return (data || []).map(mapRegistryToAgent);
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<boolean> {
    const { error } = await supabase
      .from("agent_registry")
      .update({ 
        status, 
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);

    if (error) {
      logger.error("Error updating agent status", error, { agentId, status });
      return false;
    }

    return true;
  }

  /**
   * Create a coordination task using ai_commands table
   */
  async createTask(task: Partial<CoordinationTask> & { task_name: string; task_type: string }): Promise<CoordinationTask | null> {
    const { data: userData } = await supabase.auth.getUser();
    
    const commandHash = `task_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`;

    const { data, error } = await supabase
      .from("ai_commands")
      .insert([{
        command_type: task.task_type,
        command_text: task.task_name,
        command_hash: commandHash,
        source_module: "coordination",
        execution_status: "pending",
        parameters: JSON.parse(JSON.stringify({
          priority: task.priority,
          required_capabilities: task.required_capabilities,
          payload: task.payload,
          timeout_seconds: task.timeout_seconds,
        })),
        user_id: userData?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error creating task", error, { taskName: task.task_name, taskType: task.task_type });
      return null;
    }

    const newTask: CoordinationTask = {
      id: data.id,
      task_name: data.command_text,
      task_type: data.command_type,
      priority: (data.parameters as Record<string, unknown>)?.priority as number || 5,
      required_capabilities: (data.parameters as Record<string, unknown>)?.required_capabilities as string[] || [],
      payload: (data.parameters as Record<string, unknown>)?.payload as Record<string, unknown> || {},
      timeout_seconds: (data.parameters as Record<string, unknown>)?.timeout_seconds as number || 300,
      status: "pending",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Auto-assign task
    await this.assignTask(newTask.id);

    return newTask;
  }

  /**
   * Get tasks with optional filtering
   */
  async getTasks(filters?: { status?: TaskStatus; priority?: number }): Promise<CoordinationTask[]> {
    let query = supabase.from("ai_commands")
      .select("*")
      .eq("source_module", "coordination");

    if (filters?.status) {
      query = query.eq("execution_status", filters.status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching tasks", error, { filters });
      return [];
    }

    return (data || []).map(row => {
      const params = row.parameters as Record<string, unknown> | null;
      return {
        id: row.id,
        task_name: row.command_text,
        task_type: row.command_type,
        priority: params?.priority as number || 5,
        required_capabilities: params?.required_capabilities as string[] || [],
        payload: params?.payload as Record<string, unknown> || {},
        timeout_seconds: params?.timeout_seconds as number || 300,
        status: row.execution_status as TaskStatus,
        assigned_agent_id: params?.assigned_agent_id as string | undefined,
        error_message: row.error_details || undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as CoordinationTask;
    });
  }

  /**
   * Assign task to best available agent
   */
  async assignTask(taskId: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      logger.error("Task not found", null, { taskId });
      return false;
    }

    const agents = await this.getAgents({ status: "idle" });
    
    if (agents.length === 0) {
      logger.info("No available agents", { taskId });
      return false;
    }

    // Filter by capabilities
    const capableAgents = agents.filter(agent => 
      task.required_capabilities.every(cap => agent.capabilities.includes(cap))
    );

    if (capableAgents.length === 0) {
      logger.info("No agents with required capabilities", { taskId, required: task.required_capabilities });
      return false;
    }

    const bestAgent = capableAgents[0];

    // Update task assignment
    const { error } = await supabase
      .from("ai_commands")
      .update({
        execution_status: "assigned",
        parameters: {
          ...task.payload,
          assigned_agent_id: bestAgent.id,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      logger.error("Error assigning task", error, { taskId, agentId: bestAgent.id });
      return false;
    }

    await this.updateAgentStatus(bestAgent.id, "busy");

    return true;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    result?: Record<string, unknown>, 
    errorMessage?: string
  ): Promise<boolean> {
    const updateData: Record<string, unknown> = {
      execution_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (result) {
      updateData.result = result;
    }

    if (errorMessage) {
      updateData.error_details = errorMessage;
    }

    const { error } = await supabase
      .from("ai_commands")
      .update(updateData)
      .eq("id", taskId);

    if (error) {
      logger.error("Error updating task", error, { taskId, status });
      return false;
    }

    return true;
  }

  /**
   * Get coordination statistics
   */
  async getStatistics(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
  }> {
    const [agents, tasks] = await Promise.all([
      this.getAgents(),
      this.getTasks(),
    ]);

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === "active" || a.status === "busy").length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === "pending").length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
      failedTasks: tasks.filter(t => t.status === "failed").length,
    };
  }

  /**
   * Get all coordination decisions (from ai_decisions table)
   */
  async getAllDecisions(limit: number = 20): Promise<CoordinationDecision[]> {
    const { data, error } = await supabase
      .from("ai_decisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching decisions", error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      task_id: row.id,
      agent_id: row.created_by || undefined,
      decision_type: row.type,
      decision_data: (row.action_payload as Record<string, unknown>) || {},
      reasoning: row.justification_reasoning || undefined,
      confidence_score: row.confidence || undefined,
      timestamp: row.created_at,
    }));
  }
}

export const coordinationAIService = new CoordinationAIService();
