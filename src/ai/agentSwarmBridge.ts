/**
 * PATCH 227 - Agent Swarm Bridge
 * Coordination bridge for multiple AI agents (LLMs, copilots, sensors, drones)
 * Handles registration, task distribution, parallel execution, and result consolidation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Agent Types
export type AgentType = "llm" | "copilot" | "sensor" | "drone" | "analyzer" | "executor" | "coordinator";
export type AgentStatus = "registered" | "active" | "idle" | "busy" | "offline" | "error" | "deregistered";
export type TaskStatus = "pending" | "assigned" | "processing" | "completed" | "failed" | "timeout";

// Agent Interface
export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  capabilities: string[];
  status: AgentStatus;
  maxConcurrentTasks?: number;
  currentTasks?: number;
  metadata?: Record<string, any>;
}

// Task Interface
export interface SwarmTask {
  id: string;
  type: string;
  payload: any;
  requiredCapabilities: string[];
  priority: number;
  timeout?: number;
  assignedAgentId?: string;
  status: TaskStatus;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

// Task Distribution Result
export interface DistributionResult {
  taskId: string;
  assignedTo: string;
  agentType: AgentType;
  success: boolean;
  error?: string;
}

// Consolidated Result
export interface ConsolidatedResult {
  taskIds: string[];
  results: any[];
  successful: number;
  failed: number;
  totalProcessingTimeMs: number;
  consolidatedData: any;
  errors: string[];
}

/**
 * In-memory agent registry
 */
class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  register(agent: Agent): void {
    this.agents.set(agent.id, {
      ...agent,
      status: "registered",
      currentTasks: 0,
    });
  }

  deregister(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = "deregistered";
    }
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === "active" || agent.status === "idle"
    );
  }

  findCapableAgents(requiredCapabilities: string[]): Agent[] {
    return this.getActiveAgents().filter(agent =>
      requiredCapabilities.every(cap => agent.capabilities.includes(cap))
    );
  }

  updateStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
    }
  }

  incrementTaskCount(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentTasks = (agent.currentTasks || 0) + 1;
      if (agent.currentTasks >= (agent.maxConcurrentTasks || 5)) {
        agent.status = "busy";
      } else {
        agent.status = "active";
      }
    }
  }

  decrementTaskCount(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent && agent.currentTasks) {
      agent.currentTasks = Math.max(0, agent.currentTasks - 1);
      if (agent.currentTasks === 0) {
        agent.status = "idle";
      } else {
        agent.status = "active";
      }
    }
  }
}

const registry = new AgentRegistry();

/**
 * Register a new agent to the swarm
 */
export async function registerAgent(agent: Agent): Promise<{ success: boolean; error?: string }> {
  logger.info(`[AgentSwarmBridge] Registering agent: ${agent.name} (${agent.type})`);

  try {
    // Add to local registry
    registry.register(agent);

    // Log to database
    await logAgentMetrics({
      agent_id: agent.id,
      agent_type: agent.type,
      agent_name: agent.name,
      status: "registered",
      capabilities: agent.capabilities,
      metadata: agent.metadata || {},
    });

    logger.info(`[AgentSwarmBridge] Agent ${agent.name} registered successfully`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[AgentSwarmBridge] Failed to register agent:", error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Deregister an agent from the swarm
 */
export async function deregisterAgent(agentId: string): Promise<{ success: boolean }> {
  logger.info(`[AgentSwarmBridge] Deregistering agent: ${agentId}`);

  try {
    registry.deregister(agentId);

    await logAgentMetrics({
      agent_id: agentId,
      agent_type: "coordinator", // Default type for deregistration
      agent_name: agentId,
      status: "deregistered",
      capabilities: [],
      metadata: {},
    });

    return { success: true };
  } catch (error) {
    logger.error("[AgentSwarmBridge] Failed to deregister agent:", error);
    return { success: false };
  }
}

/**
 * Distribute a sub-task to an available agent
 */
export async function distributeTask(task: SwarmTask): Promise<DistributionResult> {
  logger.info(`[AgentSwarmBridge] Distributing task: ${task.id}`);

  try {
    // Find capable agents
    const capableAgents = registry.findCapableAgents(task.requiredCapabilities);

    if (capableAgents.length === 0) {
      logger.warn(`[AgentSwarmBridge] No capable agents found for task ${task.id}`);
      return {
        taskId: task.id,
        assignedTo: "none",
        agentType: "coordinator",
        success: false,
        error: "No capable agents available",
      });
    }

    // Select agent with least current tasks (simple load balancing)
    const selectedAgent = capableAgents.reduce((prev, curr) =>
      (curr.currentTasks || 0) < (prev.currentTasks || 0) ? curr : prev
    );

    // Assign task
    task.assignedAgentId = selectedAgent.id;
    task.status = "assigned";
    task.startTime = new Date();

    registry.incrementTaskCount(selectedAgent.id);

    // Log task assignment
    await logAgentMetrics({
      agent_id: selectedAgent.id,
      agent_type: selectedAgent.type,
      agent_name: selectedAgent.name,
      status: selectedAgent.status,
      capabilities: selectedAgent.capabilities,
      task_id: task.id,
      task_payload: task.payload,
      task_status: "assigned",
      metadata: {},
    });

    logger.info(`[AgentSwarmBridge] Task ${task.id} assigned to ${selectedAgent.name}`);

    return {
      taskId: task.id,
      assignedTo: selectedAgent.id,
      agentType: selectedAgent.type,
      success: true,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("[AgentSwarmBridge] Failed to distribute task:", error);
    return {
      taskId: task.id,
      assignedTo: "error",
      agentType: "coordinator",
      success: false,
      error: errorMsg,
    });
  }
}

/**
 * Execute multiple tasks in parallel and collect results
 */
export async function executeParallel(tasks: SwarmTask[]): Promise<SwarmTask[]> {
  logger.info(`[AgentSwarmBridge] Executing ${tasks.length} tasks in parallel`);

  try {
    // Distribute all tasks
    const distributions = await Promise.all(
      tasks.map(task => distributeTask(task))
    );

    // Simulate parallel execution
    const executionPromises = tasks.map(async (task, index) => {
      const distribution = distributions[index];
      
      if (!distribution.success) {
        task.status = "failed";
        task.error = distribution.error;
        return task;
      }

      try {
        // Simulate agent processing
        task.status = "processing";
        const result = await simulateAgentProcessing(task, distribution.assignedTo);
        
        task.status = "completed";
        task.result = result;
        task.endTime = new Date();

        // Log completion
        const agent = registry.getAgent(distribution.assignedTo);
        if (agent) {
          registry.decrementTaskCount(agent.id);
          
          const processingTime = task.endTime.getTime() - (task.startTime?.getTime() || 0);
          
          await logAgentMetrics({
            agent_id: agent.id,
            agent_type: agent.type,
            agent_name: agent.name,
            status: agent.status,
            capabilities: agent.capabilities,
            task_id: task.id,
            task_status: "completed",
            result_data: result,
            processing_time_ms: processingTime,
            metadata: {},
          });
        }

        return task;
      } catch (error) {
        task.status = "failed";
        task.error = error instanceof Error ? error.message : String(error);
        task.endTime = new Date();

        // Release agent
        if (task.assignedAgentId) {
          registry.decrementTaskCount(task.assignedAgentId);
        }

        return task;
      }
    });

    const results = await Promise.all(executionPromises);
    logger.info(`[AgentSwarmBridge] Parallel execution completed: ${results.length} tasks`);
    
    return results;
  } catch (error) {
    logger.error("[AgentSwarmBridge] Error in parallel execution:", error);
    throw error;
  }
}

/**
 * Consolidate results from multiple agents
 */
export async function consolidateResults(tasks: SwarmTask[]): Promise<ConsolidatedResult> {
  logger.info(`[AgentSwarmBridge] Consolidating results from ${tasks.length} tasks`);

  const successful = tasks.filter(t => t.status === "completed").length;
  const failed = tasks.filter(t => t.status === "failed").length;
  const results = tasks.filter(t => t.result).map(t => t.result);
  const errors = tasks.filter(t => t.error).map(t => t.error!);

  const totalProcessingTimeMs = tasks.reduce((sum, task) => {
    if (task.startTime && task.endTime) {
      return sum + (task.endTime.getTime() - task.startTime.getTime());
    }
    return sum;
  }, 0);

  // Simple consolidation strategy: merge all results
  const consolidatedData = {
    summary: {
      totalTasks: tasks.length,
      successful,
      failed,
      averageProcessingTimeMs: totalProcessingTimeMs / tasks.length,
    },
    results: results,
    errors: errors,
    metadata: {
      consolidatedAt: new Date().toISOString(),
      strategy: "merge",
    },
  };

  logger.info(`[AgentSwarmBridge] Consolidation complete: ${successful} successful, ${failed} failed`);

  return {
    taskIds: tasks.map(t => t.id),
    results,
    successful,
    failed,
    totalProcessingTimeMs,
    consolidatedData,
    errors,
  };
}

/**
 * Get agent status
 */
export function getAgentStatus(agentId: string): Agent | undefined {
  return registry.getAgent(agentId);
}

/**
 * Get all active agents
 */
export function getActiveAgents(): Agent[] {
  return registry.getActiveAgents();
}

/**
 * Simulate agent processing (placeholder for real implementation)
 */
async function simulateAgentProcessing(task: SwarmTask, agentId: string): Promise<any> {
  // Simulate processing delay based on task complexity
  const delay = Math.random() * 1000 + 500; // 500-1500ms
  await new Promise(resolve => setTimeout(resolve, delay));

  // Return simulated result
  return {
    taskId: task.id,
    agentId,
    processedAt: new Date().toISOString(),
    output: {
      status: "success",
      data: `Processed by agent ${agentId}`,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    },
  };
}

/**
 * Log agent metrics to database
 */
async function logAgentMetrics(metrics: {
  agent_id: string;
  agent_type: AgentType;
  agent_name: string;
  status: AgentStatus;
  capabilities: string[];
  task_id?: string;
  task_payload?: any;
  task_status?: TaskStatus;
  result_data?: any;
  processing_time_ms?: number;
  metadata: Record<string, any>;
}): Promise<void> {
  try {
    const { error } = await supabase.from("agent_swarm_metrics").insert({
      agent_id: metrics.agent_id,
      agent_type: metrics.agent_type,
      agent_name: metrics.agent_name,
      status: metrics.status,
      capabilities: metrics.capabilities,
      task_id: metrics.task_id || null,
      task_payload: metrics.task_payload || null,
      task_status: metrics.task_status || null,
      result_data: metrics.result_data || null,
      processing_time_ms: metrics.processing_time_ms || null,
      last_active_at: new Date().toISOString(),
      metadata: metrics.metadata,
    });

    if (error) {
      logger.error("[AgentSwarmBridge] Failed to log metrics:", error);
    }
  } catch (error) {
    logger.error("[AgentSwarmBridge] Error logging metrics:", error);
  }
}

/**
 * Convenience function to orchestrate a complete swarm operation
 */
export async function orchestrateSwarm(
  tasks: SwarmTask[]
): Promise<ConsolidatedResult> {
  logger.info(`[AgentSwarmBridge] Orchestrating swarm with ${tasks.length} tasks`);

  const executedTasks = await executeParallel(tasks);
  const consolidatedResult = await consolidateResults(executedTasks);

  return consolidatedResult;
}
