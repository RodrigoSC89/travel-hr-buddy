// PATCH 227 - Agent Swarm Bridge
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Agent {
  agent_id: string;
  name: string;
  capabilities: string[];
  status: "idle" | "active" | "offline" | "error";
  last_heartbeat?: string;
  metadata?: Record<string, any>;
}

export interface SwarmTask {
  task_id: string;
  task_name: string;
  payload: any;
  assigned_agents: string[];
}

export interface TaskResult {
  agent_id: string;
  task_id: string;
  result: any;
  duration_ms: number;
  success: boolean;
}

// Register a new agent
export async function registerAgent(agent: Omit<Agent, "id" | "created_at" | "updated_at">): Promise<string> {
  const { data, error } = await supabase
    .from("agent_registry")
    .insert({
      agent_id: agent.agent_id,
      name: agent.name,
      capabilities: agent.capabilities,
      status: agent.status || "idle",
      last_heartbeat: new Date().toISOString(),
      metadata: agent.metadata || {}
    })
    .select("agent_id")
    .single();

  if (error) {
    logger.error("Failed to register agent", { error, agent_id: agent.agent_id });
    throw error;
  }
  
  logger.info(`Agent registered: ${agent.agent_id}`, { name: agent.name });
  return data.agent_id;
}

// List all agents
export async function listAgents(status?: string) {
  let query = supabase
    .from("agent_registry")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    logger.error("Failed to list agents", { error, status });
    throw error;
  }
  return data;
}

// Distribute task to multiple agents in parallel
export async function distributeTask(task: SwarmTask): Promise<TaskResult[]> {
  const results: TaskResult[] = [];
  const startTime = Date.now();

  // Execute tasks in parallel
  const promises = task.assigned_agents.map(async (agentId) => {
    const taskStartTime = Date.now();
    
    try {
      // Update agent status
      await supabase
        .from("agent_registry")
        .update({ status: "active", last_heartbeat: new Date().toISOString() })
        .eq("agent_id", agentId);

      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      const duration = Date.now() - taskStartTime;
      
      // Update metrics
      await updateAgentMetrics(agentId, true, duration);

      // Update agent status back to idle
      await supabase
        .from("agent_registry")
        .update({ status: "idle" })
        .eq("agent_id", agentId);

      return {
        agent_id: agentId,
        task_id: task.task_id,
        result: { status: "completed", data: task.payload },
        duration_ms: duration,
        success: true
      };
    } catch (error: any) {
      logger.error("Agent task failed", { agent_id: agentId, task_id: task.task_id, error });
      await updateAgentMetrics(agentId, false, Date.now() - taskStartTime);
      
      await supabase
        .from("agent_registry")
        .update({ status: "error" })
        .eq("agent_id", agentId);

      return {
        agent_id: agentId,
        task_id: task.task_id,
        result: { error: error.message },
        duration_ms: Date.now() - taskStartTime,
        success: false
      };
    }
  });

  const taskResults = await Promise.all(promises);
  return taskResults;
}

// Update agent metrics
async function updateAgentMetrics(agentId: string, success: boolean, durationMs: number) {
  const { data: existing } = await supabase
    .from("agent_swarm_metrics")
    .select("*")
    .eq("agent_id", agentId)
    .single();

  if (existing) {
    const newTaskCount = existing.task_count + 1;
    const newSuccessCount = existing.success_count + (success ? 1 : 0);
    const newErrorCount = existing.error_count + (success ? 0 : 1);
    const newAvgResponseTime = Math.round(
      (existing.avg_response_time_ms * existing.task_count + durationMs) / newTaskCount
    );

    await supabase
      .from("agent_swarm_metrics")
      .update({
        task_count: newTaskCount,
        success_count: newSuccessCount,
        error_count: newErrorCount,
        avg_response_time_ms: newAvgResponseTime,
        last_task_at: new Date().toISOString()
      })
      .eq("agent_id", agentId);
  } else {
    await supabase.from("agent_swarm_metrics").insert({
      agent_id: agentId,
      task_count: 1,
      success_count: success ? 1 : 0,
      error_count: success ? 0 : 1,
      avg_response_time_ms: durationMs,
      last_task_at: new Date().toISOString()
    });
  }
}

// Get agent metrics
export async function getAgentMetrics(agentId?: string) {
  let query = supabase.from("agent_swarm_metrics").select("*");
  
  if (agentId) {
    query = query.eq("agent_id", agentId);
  }

  const { data, error } = await query;
  if (error) {
    logger.error("Failed to get agent metrics", { error, agent_id: agentId });
    throw error;
  }
  return data;
}

// Consolidate results from multiple agents
export function consolidateResults(results: TaskResult[]): any {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    avg_duration_ms: Math.round(
      results.reduce((sum, r) => sum + r.duration_ms, 0) / results.length
    ),
    results: successful.map(r => r.result),
    errors: failed.map(r => r.result)
  });
}
