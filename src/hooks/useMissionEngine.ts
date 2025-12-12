/**
 * PATCH 540 - useMissionEngine Hook
 * React hook for mission execution and management
 */

import { useEffect, useState, useCallback } from "react";
import { 
  missionPipeline, 
  Mission, 
  MissionStep,
  MissionStatus,
  MissionExecutionResult,
  AIStrategyRecommendation
} from "@/lib/mission/pipeline";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

export interface UseMissionEngineOptions {
  enableSupabase?: boolean;
}

export function useMissionEngine(options: UseMissionEngineOptions = {}) {
  const { enableSupabase = false } = options;
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  // Subscribe to mission updates
  useEffect(() => {
    const unsubscribe = missionPipeline.subscribe((updatedMissions) => {
      setMissions(updatedMissions);
    });

    // Initial load
    setMissions(missionPipeline.getMissions());

    return unsubscribe;
  }, []);

  // Load missions from Supabase
  useEffect(() => {
    if (!enableSupabase) return;

    const loadMissionsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("missions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          logger.error("Error loading missions from Supabase:", error);
          return;
        }

        if (data) {
          data.forEach((missionData: any) => {
            missionPipeline.createMission({
              id: missionData.id,
              name: missionData.name,
              description: missionData.description,
              steps: missionData.steps || [],
              agents: missionData.agents,
              metadata: missionData.metadata
            });
          });
        }
      } catch (error) {
        logger.error("Error in loadMissionsFromSupabase:", error);
      }
    };

    loadMissionsFromSupabase();
  }, [enableSupabase]);

  // Create mission
  const createMission = useCallback(async (missionData: Omit<Mission, "status" | "currentStepIndex" | "progress">) => {
    const mission = missionPipeline.createMission(missionData);

    // Persist to Supabase if enabled
    if (enableSupabase) {
      try {
        const { error } = await supabase
          .from("missions")
          .insert({
            id: mission.id,
            name: mission.name,
            description: mission.description,
            mission_type: "custom",
            status: mission.status,
            coordination_data: {
              steps: mission.steps,
              agents: mission.agents,
              metadata: mission.metadata
            }
          } as any);

        if (error) {
          logger.error("Error saving mission to Supabase:", error);
        }
      } catch (error) {
        logger.error("Error in createMission Supabase:", error);
      }
    }

    toast({
      title: "Mission Created",
      description: `${mission.name} has been created`
    });

    return mission;
  }, [enableSupabase, toast]);

  // Execute mission
  const executeMission = useCallback(async (missionId: string): Promise<MissionExecutionResult> => {
    if (isExecuting) {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        message: "Another mission is already executing"
      };
    }

    setIsExecuting(true);
    try {
      const result = await missionPipeline.executeMission(missionId);

      // Update in Supabase if enabled
      if (enableSupabase) {
        try {
          const mission = missionPipeline.getMission(missionId);
          if (mission) {
            await supabase
              .from("missions")
              .update({
                status: mission.status,
                coordination_data: {
                  steps: mission.steps,
                  progress: mission.progress,
                  currentStepIndex: mission.currentStepIndex
                },
                updated_at: new Date().toISOString()
              })
              .eq("id", missionId);
          }
        } catch (error) {
          logger.error("Error updating mission in Supabase:", error);
        }
      }

      // Show notification
      if (result.success) {
        toast({
          title: "Mission Completed",
          description: result.message
        });
      } else {
        toast({
          title: "Mission Failed",
          description: result.message,
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      logger.error("Error executing mission:", error);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        message: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, enableSupabase, toast]);

  // Pause mission
  const pauseMission = useCallback((missionId: string) => {
    missionPipeline.pauseMission(missionId);
    toast({
      title: "Mission Paused",
      description: `Mission ${missionId} has been paused`
    });
  }, [toast]);

  // Cancel mission
  const cancelMission = useCallback((missionId: string) => {
    missionPipeline.cancelMission(missionId);
    toast({
      title: "Mission Cancelled",
      description: `Mission ${missionId} has been cancelled`
    });
  }, [toast]);

  // Restart step
  const restartStep = useCallback((missionId: string, stepId: string) => {
    missionPipeline.restartStep(missionId, stepId);
    toast({
      title: "Step Restarted",
      description: `Step ${stepId} has been reset`
    });
  }, [toast]);

  // Get AI recommendation
  const getAIRecommendation = useCallback(async (
    missionId: string, 
    stepId: string
  ): Promise<AIStrategyRecommendation | null> => {
    try {
      const recommendation = await missionPipeline.getAIStrategyRecommendation(missionId, stepId);
      
      toast({
        title: "AI Recommendation",
        description: `${recommendation.suggestion} (${(recommendation.confidence * 100).toFixed(0)}% confidence)`
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

  // Delete mission
  const deleteMission = useCallback(async (missionId: string) => {
    missionPipeline.deleteMission(missionId);

    // Delete from Supabase if enabled
    if (enableSupabase) {
      try {
        await supabase
          .from("missions")
          .delete()
          .eq("id", missionId);
      } catch (error) {
        logger.error("Error deleting mission from Supabase:", error);
      }
    }

    if (selectedMission === missionId) {
      setSelectedMission(null);
    }

    toast({
      title: "Mission Deleted",
      description: `Mission ${missionId} has been deleted`
    });
  }, [enableSupabase, selectedMission, toast]);

  // Get mission by ID
  const getMission = useCallback((missionId: string): Mission | undefined => {
    return missions.find(m => m.id === missionId);
  }, [missions]);

  // Get missions by status
  const getMissionsByStatus = useCallback((status: MissionStatus): Mission[] => {
    return missions.filter(m => m.status === status);
  }, [missions]);

  // Clear all missions
  const clearAll = useCallback(() => {
    missionPipeline.clearAll();
    setSelectedMission(null);
  }, []);

  return {
    missions,
    selectedMission,
    setSelectedMission,
    isExecuting,
    createMission,
    executeMission,
    pauseMission,
    cancelMission,
    restartStep,
    getAIRecommendation,
    deleteMission,
    getMission,
    getMissionsByStatus,
    clearAll
  };
}
