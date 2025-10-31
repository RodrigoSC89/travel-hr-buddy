// @ts-nocheck
/**
 * PATCH 536 - Coordination AI Engine Service
 * Multi-agent coordination system with priority-based task distribution
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  CoordinationAgent,
  CoordinationTask,
  CoordinationDecision,
  AgentType,
  AgentStatus,
  TaskStatus,
} from "@/types/patches-536-540";

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
      console.error("Error registering agent:", error);
      return null;
    }

    return data;
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
      console.error("Error fetching agents:", error);
      return [];
    }

    return data || [];
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
      console.error("Error updating agent status:", error);
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
      console.error("Error creating task:", error);
      return null;
    }

    // Auto-assign task to available agent
    await this.assignTask(data.id);

    return data;
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
      console.error("Error fetching tasks:", error);
      return [];
    }

    return data || [];
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
      console.error("Error fetching task:", taskError);
      return false;
    }

    // Find best agent
    const { data: agents } = await supabase
      .from("coordination_agents")
      .select("*")
      .in("status", ["idle", "active"])
      .order("priority_level", { ascending: false });

    if (!agents || agents.length === 0) {
      console.log("No available agents");
      return false;
    }

    // Filter agents by capabilities
    const capableAgents = agents.filter((agent: CoordinationAgent) => {
      const requiredCaps = task.required_capabilities || [];
      const agentCaps = agent.capabilities || [];
      return requiredCaps.every((cap: string) => agentCaps.includes(cap));
    });

    if (capableAgents.length === 0) {
      console.log("No agents with required capabilities");
      return false;
    }

    // Select agent with lowest current task count
    const bestAgent = capableAgents.reduce((prev: CoordinationAgent, curr: CoordinationAgent) => {
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
      console.error("Error assigning task:", assignError);
      return false;
    }

    // Update agent task count
    await supabase
      .from("coordination_agents")
      .update({
        current_task_count: bestAgent.current_task_count + 1,
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
      console.error("Error updating task:", updateError);
      return false;
    }

    // If task is completed or failed, update agent task count
    if ((status === "completed" || status === "failed") && task.assigned_agent_id) {
      const { data: agent } = await supabase
        .from("coordination_agents")
        .select("*")
        .eq("id", task.assigned_agent_id)
        .single();

      if (agent) {
        const newCount = Math.max(0, agent.current_task_count - 1);
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
      console.error("Error logging decision:", error);
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
      console.error("Error fetching decisions:", error);
      return [];
    }

    return data || [];
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
      console.error("Error fetching all decisions:", error);
      return [];
    }

    return data || [];
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
      console.error("Error linking to mission:", error);
      return false;
    }

    return true;
  }
}

export const coordinationAIService = new CoordinationAIService();
