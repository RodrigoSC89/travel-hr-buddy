/**
 * PATCH 536 - Coordination AI Engine Service
 * Multi-agent coordination system with priority-based task distribution
 * Type-safe implementation using DB adapters
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type {
  CoordinationAgent,
  CoordinationTask,
  CoordinationDecision,
  AgentType,
  AgentStatus,
  TaskStatus,
} from "@/types/patches-536-540";
import type { Json } from "@/integrations/supabase/types";

// Type adapters for DB <-> Local type conversion
type DbAgent = {
  id: string;
  agent_name: string;
  agent_type: string;
  capabilities: Json;
  status: string;
  priority_level: number;
  max_concurrent_tasks: number;
  current_task_count: number;
  metadata: Json;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
};

type DbTask = {
  id: string;
  task_name: string;
  task_type: string;
  priority: number;
  required_capabilities: Json;
  status: string;
  assigned_agent_id: string | null;
  payload: Json;
  result: Json | null;
  error_message: string | null;
  timeout_seconds: number;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type DbDecision = {
  id: string;
  task_id: string | null;
  agent_id: string | null;
  decision_type: string;
  decision_data: Json;
  reasoning: string | null;
  confidence_score: number | null;
  timestamp: string;
};

// Adapters
const toAgent = (db: DbAgent): CoordinationAgent => ({
  ...db,
  agent_type: db.agent_type as AgentType,
  capabilities: (db.capabilities as string[]) || [],
  status: db.status as AgentStatus,
  metadata: (db.metadata as Record<string, unknown>) || {},
  last_heartbeat: db.last_heartbeat || new Date().toISOString(),
});

const toTask = (db: DbTask): CoordinationTask => ({
  ...db,
  status: db.status as TaskStatus,
  required_capabilities: (db.required_capabilities as string[]) || [],
  payload: (db.payload as Record<string, unknown>) || {},
  result: db.result as Record<string, unknown> | undefined,
  error_message: db.error_message || undefined,
  assigned_agent_id: db.assigned_agent_id || undefined,
  started_at: db.started_at || undefined,
  completed_at: db.completed_at || undefined,
  created_by: db.created_by || undefined,
});

const toDecision = (db: DbDecision): CoordinationDecision => ({
  ...db,
  task_id: db.task_id || undefined,
  agent_id: db.agent_id || undefined,
  decision_data: (db.decision_data as Record<string, unknown>) || {},
  reasoning: db.reasoning || undefined,
  confidence_score: db.confidence_score || undefined,
});

class CoordinationAIService {
  /**
   * Register a new agent in the coordination system
   */
  async registerAgent(agent: Omit<CoordinationAgent, "id" | "created_at" | "updated_at" | "last_heartbeat" | "current_task_count">): Promise<CoordinationAgent | null> {
    const { data, error } = await supabase
      .from("coordination_agents")
      .insert([{
        agent_name: agent.agent_name,
        agent_type: agent.agent_type,
        capabilities: agent.capabilities,
        status: agent.status || "idle",
        priority_level: agent.priority_level || 5,
        max_concurrent_tasks: agent.max_concurrent_tasks || 3,
        metadata: agent.metadata || {},
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error registering agent", error, { agent: agent.agent_name });
      return null;
    }

    return data ? toAgent(data as unknown as DbAgent) : null;
  }

  /**
   * Get all agents with optional filtering
   */
  async getAgents(filters?: { status?: AgentStatus; type?: AgentType }): Promise<CoordinationAgent[]> {
    let query = supabase.from("coordination_agents").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("agent_type", filters.type);
    }

    const { data, error } = await query.order("priority_level", { ascending: false });

    if (error) {
      logger.error("Error fetching agents", error, { filters });
      return [];
    }

    return (data || []).map((d) => toAgent(d as unknown as DbAgent));
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<boolean> {
    const { error } = await supabase
      .from("coordination_agents")
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
   * Create a new coordination task
   */
  async createTask(task: Omit<CoordinationTask, "id" | "created_at" | "updated_at" | "status">): Promise<CoordinationTask | null> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("coordination_tasks")
      .insert([{
        task_name: task.task_name,
        task_type: task.task_type,
        priority: task.priority || 5,
        required_capabilities: task.required_capabilities,
        payload: task.payload || {},
        timeout_seconds: task.timeout_seconds || 300,
        created_by: userData?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error creating task", error, { taskName: task.task_name, taskType: task.task_type });
      return null;
    }

    // Auto-assign task to available agent
    await this.assignTask(data.id);

    return data ? toTask(data as unknown as DbTask) : null;
  }

  /**
   * Get tasks with optional filtering
   */
  async getTasks(filters?: { status?: TaskStatus; priority?: number }): Promise<CoordinationTask[]> {
    let query = supabase.from("coordination_tasks").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.gte("priority", filters.priority);
    }

    const { data, error } = await query.order("priority", { ascending: false }).order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching tasks", error, { filters });
      return [];
    }

    return (data || []).map((d) => toTask(d as unknown as DbTask));
  }

  /**
   * Assign task to best available agent based on capabilities and load
   */
  async assignTask(taskId: string): Promise<boolean> {
    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("coordination_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      logger.error("Error fetching task", taskError as Error, { taskId });
      return false;
    }

    // Find best agent
    const { data: agentsRaw } = await supabase
      .from("coordination_agents")
      .select("*")
      .in("status", ["idle", "active"])
      .order("priority_level", { ascending: false });

    if (!agentsRaw || agentsRaw.length === 0) {
      logger.info("No available agents", { taskId });
      return false;
    }

    const agents = agentsRaw.map((d) => toAgent(d as unknown as DbAgent));

    // Filter agents by capabilities
    const capableAgents = agents.filter((agent) => {
      const requiredCaps = (task.required_capabilities as string[]) || [];
      const agentCaps = agent.capabilities || [];
      return requiredCaps.every((cap: string) => agentCaps.includes(cap));
    });

    if (capableAgents.length === 0) {
      logger.info("No agents with required capabilities", { taskId, requiredCapabilities: task.required_capabilities });
      return false;
    }

    // Select agent with lowest current task count
    const bestAgent = capableAgents.reduce((prev, curr) => {
      if (curr.current_task_count < curr.max_concurrent_tasks) {
        return (curr.current_task_count < prev.current_task_count) ? curr : prev;
      }
      return prev;
    });

    // Assign task
    const { error: assignError } = await supabase
      .from("coordination_tasks")
      .update({
        assigned_agent_id: bestAgent.id,
        status: "assigned",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (assignError) {
      logger.error("Error assigning task", assignError, { taskId, agentId: bestAgent.id });
      return false;
    }

    // Update agent task count
    await supabase
      .from("coordination_agents")
      .update({
        current_task_count: (bestAgent.current_task_count || 0) + 1,
        status: "busy",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bestAgent.id);

    // Log decision
    await this.logDecision({
      task_id: taskId,
      agent_id: bestAgent.id,
      decision_type: "task_assignment",
      decision_data: {
        agent_name: bestAgent.agent_name,
        agent_type: bestAgent.agent_type,
        priority: task.priority,
      },
      reasoning: `Assigned to ${bestAgent.agent_name} based on capabilities match and availability`,
      confidence_score: 85,
    });

    return true;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    result?: Record<string, any>, 
    error?: string
  ): Promise<boolean> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (result) {
      updateData.result = result;
    }

    if (error) {
      updateData.error_message = error;
    }

    const { data: task, error: updateError } = await supabase
      .from("coordination_tasks")
      .update(updateData)
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      logger.error("Error updating task", updateError, { taskId, status });
      return false;
    }

    // If task is completed or failed, update agent task count
    if ((status === "completed" || status === "failed") && task.assigned_agent_id) {
      const { data: agentRaw } = await supabase
        .from("coordination_agents")
        .select("*")
        .eq("id", task.assigned_agent_id)
        .single();

      if (agentRaw) {
        const agent = toAgent(agentRaw as unknown as DbAgent);
        const newCount = Math.max(0, (agent.current_task_count || 0) - 1);
        await supabase
          .from("coordination_agents")
          .update({
            current_task_count: newCount,
            status: newCount === 0 ? "idle" : "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", agent.id);
      }
    }

    return true;
  }

  /**
   * Log a coordination decision
   */
  async logDecision(decision: Omit<CoordinationDecision, "id" | "timestamp">): Promise<boolean> {
    const { error } = await supabase
      .from("coordination_decisions")
      .insert([{
        task_id: decision.task_id,
        agent_id: decision.agent_id,
        decision_type: decision.decision_type,
        decision_data: decision.decision_data || {},
        reasoning: decision.reasoning,
        confidence_score: decision.confidence_score,
      }]);

    if (error) {
      logger.error("Error logging decision", error, { taskId: decision.task_id, agentId: decision.agent_id });
      return false;
    }

    return true;
  }

  /**
   * Get decisions for a task
   */
  async getTaskDecisions(taskId: string): Promise<CoordinationDecision[]> {
    const { data, error } = await supabase
      .from("coordination_decisions")
      .select("*")
      .eq("task_id", taskId)
      .order("timestamp", { ascending: false });

    if (error) {
      logger.error("Error fetching decisions", error, { taskId });
      return [];
    }

    return (data || []).map((d) => toDecision(d as unknown as DbDecision));
  }

  /**
   * Get all decisions with pagination
   */
  async getAllDecisions(limit = 50, offset = 0): Promise<CoordinationDecision[]> {
    const { data, error } = await supabase
      .from("coordination_decisions")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error fetching all decisions", error, { limit, offset });
      return [];
    }

    return (data || []).map((d) => toDecision(d as unknown as DbDecision));
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
      activeAgents: agents.filter((a) => a.status === "active" || a.status === "busy").length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      failedTasks: tasks.filter((t) => t.status === "failed").length,
    };
  }

  /**
   * Link coordination task with mission
   */
  async linkToMission(taskId: string, missionId: string): Promise<boolean> {
    const { error } = await supabase
      .from("coordination_mission_links")
      .insert([{
        mission_id: missionId,
        coordination_task_id: taskId,
        integration_status: "linked",
      }]);

    if (error) {
      logger.error("Error linking to mission", error, { taskId, missionId });
      return false;
    }

    return true;
  }
}

export const coordinationAIService = new CoordinationAIService();
