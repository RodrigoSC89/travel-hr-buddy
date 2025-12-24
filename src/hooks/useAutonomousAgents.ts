/**
 * 🤖 useAutonomousAgents Hook
 * Hook React para gerenciar agentes autônomos de IA
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAgentOrchestrator } from "@/ai/agents";
import type { AgentType, AgentContext, AgentDecision, AgentAction } from "@/ai/agents/types";
import { logger } from "@/lib/logger";

interface AgentState {
  isRunning: boolean;
  lastRun: Date | null;
  decisions: AgentDecision[];
  actions: AgentAction[];
  errors: string[];
}

interface UseAutonomousAgentsOptions {
  autoRun?: boolean;
  autoRunInterval?: number; // in milliseconds
  agentTypes?: AgentType[];
  onDecision?: (decision: AgentDecision) => void;
  onAction?: (action: AgentAction) => void;
}

export function useAutonomousAgents(options: UseAutonomousAgentsOptions = {}) {
  const {
    autoRun = false,
    autoRunInterval = 60000, // 1 minute
    agentTypes = ["risk", "esg", "audit"],
    onDecision,
    onAction,
  } = options;

  const queryClient = useQueryClient();
  const orchestrator = getAgentOrchestrator();
  const intervalRef = useRef<NodeJS.Timeout>();

  const [agentStates, setAgentStates] = useState<Map<AgentType, AgentState>>(
    new Map(agentTypes.map(type => [type, {
      isRunning: false,
      lastRun: null,
      decisions: [],
      actions: [],
      errors: [],
    }]))
  );

  const updateAgentState = useCallback((type: AgentType, update: Partial<AgentState>) => {
    setAgentStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(type) || {
        isRunning: false,
        lastRun: null,
        decisions: [],
        actions: [],
        errors: [],
      };
      newMap.set(type, { ...current, ...update });
      return newMap;
    });
  }, []);

  // Run a single agent
  const runAgentMutation = useMutation({
    mutationFn: async ({ type, context }: { type: AgentType; context: AgentContext }) => {
      updateAgentState(type, { isRunning: true, errors: [] });
      
      const decisions = await orchestrator.runAgent(type, context);
      
      // Notify for each decision
      decisions.forEach(decision => {
        onDecision?.(decision);
        if (decision.impact === "critical" || decision.impact === "high") {
          toast.warning(`🤖 ${type.toUpperCase()}: ${decision.action}`, {
            description: decision.reasoning,
            duration: 8000,
          });
        }
      });

      return { type, decisions };
    },
    onSuccess: ({ type, decisions }) => {
      updateAgentState(type, {
        isRunning: false,
        lastRun: new Date(),
        decisions,
      });
      logger.info(`[useAutonomousAgents] Agent ${type} completed`, { decisionsCount: decisions.length });
    },
    onError: (error, { type }) => {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      updateAgentState(type, {
        isRunning: false,
        errors: [errorMsg],
      });
      logger.error(`[useAutonomousAgents] Agent ${type} failed`, { error });
    },
  });

  // Run all agents
  const runAllAgentsMutation = useMutation({
    mutationFn: async (context: AgentContext) => {
      agentTypes.forEach(type => updateAgentState(type, { isRunning: true, errors: [] }));
      
      const results = await orchestrator.runAllAgents(context);
      
      // Process all decisions
      results.forEach((decisions, type) => {
        decisions.forEach(decision => {
          onDecision?.(decision);
        });
      });

      return results;
    },
    onSuccess: (results) => {
      results.forEach((decisions, type) => {
        updateAgentState(type, {
          isRunning: false,
          lastRun: new Date(),
          decisions,
        });
      });

      const totalDecisions = Array.from(results.values()).reduce((sum, d) => sum + d.length, 0);
      if (totalDecisions > 0) {
        toast.success(`🤖 Agentes IA: ${totalDecisions} decisões geradas`);
      }
    },
    onError: (error) => {
      agentTypes.forEach(type => {
        updateAgentState(type, {
          isRunning: false,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        });
      });
    },
  });

  // Execute a specific decision
  const executeDecisionMutation = useMutation({
    mutationFn: async ({ type, decision }: { type: AgentType; decision: AgentDecision }) => {
      const action = await orchestrator.executeDecision(type, decision);
      onAction?.(action);
      return { type, action };
    },
    onSuccess: ({ type, action }) => {
      updateAgentState(type, {
        actions: [...(agentStates.get(type)?.actions || []), action],
      });

      if (action.status === "completed") {
        toast.success(`✅ Ação executada: ${action.type}`);
      } else if (action.status === "failed") {
        toast.error(`❌ Falha na ação: ${action.error}`);
      }
    },
  });

  // Auto-run effect
  useEffect(() => {
    if (autoRun) {
      const context: AgentContext = {
        timestamp: new Date(),
        source: "auto_scheduler",
      };

      // Initial run
      runAllAgentsMutation.mutate(context);

      // Schedule periodic runs
      intervalRef.current = setInterval(() => {
        const ctx: AgentContext = {
          timestamp: new Date(),
          source: "auto_scheduler",
        };
        runAllAgentsMutation.mutate(ctx);
      }, autoRunInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRun, autoRunInterval]);

  // Public API
  const runAgent = useCallback((type: AgentType, context?: Partial<AgentContext>) => {
    const fullContext: AgentContext = {
      timestamp: new Date(),
      source: "manual",
      ...context,
    };
    return runAgentMutation.mutateAsync({ type, context: fullContext });
  }, [runAgentMutation]);

  const runAllAgents = useCallback((context?: Partial<AgentContext>) => {
    const fullContext: AgentContext = {
      timestamp: new Date(),
      source: "manual",
      ...context,
    };
    return runAllAgentsMutation.mutateAsync(fullContext);
  }, [runAllAgentsMutation]);

  const executeDecision = useCallback((type: AgentType, decision: AgentDecision) => {
    return executeDecisionMutation.mutateAsync({ type, decision });
  }, [executeDecisionMutation]);

  const getAgentState = useCallback((type: AgentType) => {
    return agentStates.get(type);
  }, [agentStates]);

  const getAllDecisions = useCallback(() => {
    return Array.from(agentStates.entries()).flatMap(([type, state]) => 
      state.decisions.map(d => ({ ...d, agentType: type }))
    );
  }, [agentStates]);

  const getPendingApprovals = useCallback(() => {
    return getAllDecisions().filter(d => d.requiresApproval && !d.autoExecute);
  }, [getAllDecisions]);

  return {
    // State
    agentStates,
    isAnyRunning: Array.from(agentStates.values()).some(s => s.isRunning),
    
    // Actions
    runAgent,
    runAllAgents,
    executeDecision,
    
    // Getters
    getAgentState,
    getAllDecisions,
    getPendingApprovals,
    
    // Loading states
    isRunningAgent: runAgentMutation.isPending,
    isRunningAll: runAllAgentsMutation.isPending,
    isExecuting: executeDecisionMutation.isPending,
  };
}
