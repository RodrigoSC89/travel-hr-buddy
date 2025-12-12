/**
 * PATCH 538 - useCoordination Hook
 * React hook for coordination engine with reactive state management
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  coordinationEngine, 
  Agent, 
  CoordinationAction, 
  CoordinationRule,
  AIRecommendation,
  AgentState,
  AgentType
} from "@/lib/coordination/logic";
import { supabase } from "@/integrations/supabase/client";
import { subscribeTopic, publishEvent } from "@/lib/mqtt/publisher";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

export interface UseCoordinationOptions {
  enableMQTT?: boolean;
  enableSupabase?: boolean;
  autoExecute?: boolean;
  executionInterval?: number;
}

export function useCoordination(options: UseCoordinationOptions = {}) {
  const {
    enableMQTT = false,
    enableSupabase = false,
    autoExecute = false,
    executionInterval = 5000
  } = options;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [actions, setActions] = useState<CoordinationAction[]>([]);
  const [rules, setRules] = useState<CoordinationRule[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Subscribe to engine updates
  useEffect(() => {
    const unsubscribe = coordinationEngine.subscribe((updatedAgents) => {
      setAgents(updatedAgents);
      setRules(coordinationEngine.getRules());
    });

    // Initial load
    setAgents(coordinationEngine.getAgents());
    setRules(coordinationEngine.getRules());

    return unsubscribe;
  }, []);

  // MQTT Integration
  useEffect(() => {
    if (!enableMQTT) return;

    const client = subscribeTopic("nautilus/coordination/agents", (data) => {
      try {
        if (data.action === "update" && data.agentId && data.updates) {
          coordinationEngine.updateAgent(data.agentId as string, data.updates);
        } else if (data.action === "register" && data.agent) {
          coordinationEngine.registerAgent(data.agent as Agent);
        }
      } catch (error) {
        logger.error("Error processing MQTT message:", error);
      }
    });

    return () => {
      client.end();
    });
  }, [enableMQTT]);

  // Supabase Integration
  useEffect(() => {
    if (!enableSupabase) return;

    const loadAgentsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("coordination_agents" as any)
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          logger.error("Error loading agents from Supabase:", error);
          return;
        }

        if (data) {
          data.forEach((agentData: any) => {
            coordinationEngine.registerAgent({
              id: agentData.id,
              name: agentData.name,
              type: agentData.type as AgentType,
              state: agentData.state as AgentState,
              position: agentData.position,
              battery: agentData.battery,
              lastUpdate: agentData.last_update || new Date().toISOString(),
              metadata: agentData.metadata || {}
            });
          });
        }
      } catch (error) {
        logger.error("Error in loadAgentsFromSupabase:", error);
      }
    });

    loadAgentsFromSupabase();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("coordination-agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coordination_agents"
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const agentData = payload.new;
            coordinationEngine.updateAgent(agentData.id, {
              name: agentData.name,
              type: agentData.type,
              state: agentData.state,
              position: agentData.position,
              battery: agentData.battery,
              lastUpdate: agentData.last_update || new Date().toISOString(),
              metadata: agentData.metadata || {}
            });
          } else if (payload.eventType === "DELETE") {
            coordinationEngine.removeAgent(payload.old.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    });
  }, [enableSupabase]);

  // Auto-execution interval
  useEffect(() => {
    if (!autoExecute) return;

    intervalRef.current = setInterval(() => {
      executeCoordination();
    }, executionInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    });
  }, [autoExecute, executionInterval]);

  // Register agent
  const registerAgent = useCallback(async (agent: Omit<Agent, "lastUpdate">) => {
    const fullAgent: Agent = {
      ...agent,
      lastUpdate: new Date().toISOString()
    });

    coordinationEngine.registerAgent(fullAgent);

    // Persist to Supabase if enabled
    if (enableSupabase) {
      try {
        const { error } = await supabase
          .from("coordination_agents" as any)
          .upsert({
            id: fullAgent.id,
            name: fullAgent.name,
            type: fullAgent.type,
            state: fullAgent.state,
            position: fullAgent.position,
            battery: fullAgent.battery,
            last_update: fullAgent.lastUpdate,
            metadata: fullAgent.metadata || {}
          });

        if (error) {
          logger.error("Error saving agent to Supabase:", error);
        }
      } catch (error) {
        logger.error("Error in registerAgent Supabase:", error);
      }
    }

    // Publish to MQTT if enabled
    if (enableMQTT) {
      publishEvent("nautilus/coordination/agents", {
        action: "register",
        agent: fullAgent
      });
    }

    toast({
      title: "Agent Registered",
      description: `${fullAgent.name} has been registered successfully`
    });
  }, [enableSupabase, enableMQTT, toast]);

  // Update agent
  const updateAgent = useCallback(async (agentId: string, updates: Partial<Agent>) => {
    coordinationEngine.updateAgent(agentId, updates);

    // Persist to Supabase if enabled
    if (enableSupabase) {
      try {
        const { error } = await supabase
          .from("coordination_agents" as any)
          .update({
            ...updates,
            last_update: new Date().toISOString()
          })
          .eq("id", agentId);

        if (error) {
          logger.error("Error updating agent in Supabase:", error);
        }
      } catch (error) {
        logger.error("Error in updateAgent Supabase:", error);
      }
    }

    // Publish to MQTT if enabled
    if (enableMQTT) {
      publishEvent("nautilus/coordination/agents", {
        action: "update",
        agentId,
        updates
      });
    }
  }, [enableSupabase, enableMQTT]);

  // Remove agent
  const removeAgent = useCallback(async (agentId: string) => {
    coordinationEngine.removeAgent(agentId);

    // Remove from Supabase if enabled
    if (enableSupabase) {
      try {
        const { error } = await supabase
          .from("coordination_agents" as any)
          .delete()
          .eq("id", agentId);

        if (error) {
          logger.error("Error removing agent from Supabase:", error);
        }
      } catch (error) {
        logger.error("Error in removeAgent Supabase:", error);
      }
    }

    // Publish to MQTT if enabled
    if (enableMQTT) {
      publishEvent("nautilus/coordination/agents", {
        action: "remove",
        agentId
      });
    }

    toast({
      title: "Agent Removed",
      description: `Agent ${agentId} has been removed`
    });
  }, [enableSupabase, enableMQTT, toast]);

  // Execute coordination cycle
  const executeCoordination = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const newActions = coordinationEngine.executeCoordinationCycle();
      setActions(newActions);
      setLastExecution(new Date());

      // Log to Supabase if enabled
      if (enableSupabase && newActions.length > 0) {
        try {
          await supabase.from("coordination_logs" as any).insert(
            newActions.map(action => ({
              agent_id: action.agentId,
              action: action.action,
              params: action.params,
              reason: action.reason,
              timestamp: new Date().toISOString()
            }))
          );
        } catch (error) {
          logger.error("Error logging actions to Supabase:", error);
        }
      }

      // Publish to MQTT if enabled
      if (enableMQTT && newActions.length > 0) {
        publishEvent("nautilus/coordination/actions", {
          actions: newActions,
          timestamp: new Date().toISOString()
        });
      }

      if (newActions.length > 0) {
        toast({
          title: "Coordination Executed",
          description: `${newActions.length} action(s) generated`
        });
      }
    } catch (error) {
      logger.error("Error executing coordination:", error);
      toast({
        title: "Execution Error",
        description: "Failed to execute coordination cycle",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, enableSupabase, enableMQTT, toast]);

  // Get AI recommendation
  const getAIRecommendation = useCallback(async (agentId: string): Promise<AIRecommendation | null> => {
    try {
      const recommendation = await coordinationEngine.simulateAIRecommendation(agentId);
      
      toast({
        title: "AI Recommendation",
        description: `${recommendation.recommendation} (${(recommendation.confidence * 100).toFixed(0)}% confidence)`
      });

      return recommendation;
    } catch (error) {
      logger.error("Error getting AI recommendation:", error);
      toast({
        title: "AI Error",
        description: "Failed to get AI recommendation",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Add custom rule
  const addRule = useCallback((rule: CoordinationRule) => {
    coordinationEngine.addRule(rule);
    setRules(coordinationEngine.getRules());
  }, []);

  // Remove rule
  const removeRule = useCallback((ruleId: string) => {
    coordinationEngine.removeRule(ruleId);
    setRules(coordinationEngine.getRules());
  }, []);

  // Toggle rule
  const toggleRule = useCallback((ruleId: string, enabled: boolean) => {
    coordinationEngine.setRuleEnabled(ruleId, enabled);
    setRules(coordinationEngine.getRules());
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    coordinationEngine.clear();
    setActions([]);
    setLastExecution(null);
  }, []);

  return {
    agents,
    actions,
    rules,
    isExecuting,
    lastExecution,
    registerAgent,
    updateAgent,
    removeAgent,
    executeCoordination,
    getAIRecommendation,
    addRule,
    removeRule,
    toggleRule,
    clearAll
  };
}
