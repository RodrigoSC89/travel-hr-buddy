/**
 * PATCH 540 - Mission Engine Pipeline
 * Configurable mission pipeline with multi-agent coordination
 */

import { logger } from "@/lib/logger";
import { coordinationEngine, Agent } from "@/lib/coordination/logic";
import { droneCommandService, DroneCommand } from "@/lib/drone/command-service";

export type MissionStepType = "scan" | "collect" | "transmit" | "move" | "wait" | "coordinate" | "custom";
export type MissionStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";
export type MissionStatus = "planning" | "active" | "paused" | "completed" | "failed" | "cancelled";

export interface MissionStep {
  id: string;
  name: string;
  type: MissionStepType;
  description?: string;
  status: MissionStepStatus;
  params?: Record<string, any>;
  dependencies?: string[]; // Step IDs that must complete first
  retryCount?: number;
  maxRetries?: number;
  timeout?: number; // milliseconds
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: MissionStatus;
  steps: MissionStep[];
  currentStepIndex: number;
  startTime?: string;
  endTime?: string;
  progress: number; // 0-100
  agents?: string[]; // Agent IDs involved
  metadata?: Record<string, any>;
  aiSuggestions?: AIStrategyRecommendation[];
}

export interface AIStrategyRecommendation {
  stepId: string;
  suggestion: string;
  reasoning: string;
  confidence: number;
  timestamp: string;
}

export interface MissionExecutionResult {
  success: boolean;
  completedSteps: string[];
  failedSteps: string[];
  message: string;
  duration?: number;
}

/**
 * Mission Pipeline
 * Manages multi-step mission execution with agent coordination
 */
export class MissionPipeline {
  private missions: Map<string, Mission> = new Map();
  private listeners: Set<(missions: Mission[]) => void> = new Set();
  private executionIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new mission
   */
  createMission(mission: Omit<Mission, "status" | "currentStepIndex" | "progress">): Mission {
    const fullMission: Mission = {
      ...mission,
      status: "planning",
      currentStepIndex: 0,
      progress: 0,
      steps: mission.steps.map(step => ({
        ...step,
        status: "pending",
        retryCount: 0
      }))
    });

    this.missions.set(fullMission.id, fullMission);
    this.notifyListeners();
    logger.info(`Mission created: ${fullMission.name} (${fullMission.id})`);

    return fullMission;
  }

  /**
   * Get mission by ID
   */
  getMission(missionId: string): Mission | undefined {
    return this.missions.get(missionId);
  }

  /**
   * Get all missions
   */
  getMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  /**
   * Update mission status
   */
  updateMissionStatus(missionId: string, status: MissionStatus): void {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    mission.status = status;
    
    if (status === "active" && !mission.startTime) {
      mission.startTime = new Date().toISOString();
    } else if ((status === "completed" || status === "failed" || status === "cancelled") && !mission.endTime) {
      mission.endTime = new Date().toISOString();
    }

    this.missions.set(missionId, mission);
    this.notifyListeners();
  }

  /**
   * Execute mission
   */
  async executeMission(missionId: string): Promise<MissionExecutionResult> {
    const mission = this.missions.get(missionId);
    if (!mission) {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        message: "Mission not found"
      });
    }

    if (mission.status === "active") {
      return {
        success: false,
        completedSteps: [],
        failedSteps: [],
        message: "Mission is already running"
      });
    }

    this.updateMissionStatus(missionId, "active");
    const startTime = Date.now();
    const completedSteps: string[] = [];
    const failedSteps: string[] = [];

    try {
      for (let i = 0; i < mission.steps.length; i++) {
        const step = mission.steps[i];
        
        // Check dependencies
        if (step.dependencies && step.dependencies.length > 0) {
          const dependenciesMet = step.dependencies.every(depId => 
            completedSteps.includes(depId)
          );
          
          if (!dependenciesMet) {
            step.status = "skipped";
            logger.warn(`Step ${step.id} skipped - dependencies not met`);
            continue;
          }
        }

        // Execute step
        mission.currentStepIndex = i;
        step.status = "running";
        this.missions.set(missionId, mission);
        this.notifyListeners();

        const stepResult = await this.executeStep(mission, step);

        if (stepResult.success) {
          step.status = "completed";
          completedSteps.push(step.id);
          step.onSuccess?.(stepResult.result);
        } else {
          // Retry logic
          if (step.maxRetries && (step.retryCount || 0) < step.maxRetries) {
            step.retryCount = (step.retryCount || 0) + 1;
            logger.info(`Retrying step ${step.id} (attempt ${step.retryCount})`);
            i--; // Retry same step
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
            continue;
          }

          step.status = "failed";
          failedSteps.push(step.id);
          step.onFailure?.(stepResult.error);
          logger.error(`Step ${step.id} failed:`, stepResult.error);

          // Check if we should continue or abort
          if (step.params?.critical !== false) {
            break; // Stop execution on critical failure
          }
        }

        // Update progress
        mission.progress = Math.round(((i + 1) / mission.steps.length) * 100);
        this.missions.set(missionId, mission);
        this.notifyListeners();
      }

      const duration = Date.now() - startTime;
      const allCompleted = failedSteps.length === 0 && 
        mission.steps.filter(s => s.status !== "skipped").every(s => s.status === "completed");

      this.updateMissionStatus(missionId, allCompleted ? "completed" : "failed");

      return {
        success: allCompleted,
        completedSteps,
        failedSteps,
        message: allCompleted 
          ? "Mission completed successfully" 
          : `Mission failed with ${failedSteps.length} failed step(s)`,
        duration
      });
    } catch (error) {
      logger.error("Error executing mission:", error);
      this.updateMissionStatus(missionId, "failed");
      return {
        success: false,
        completedSteps,
        failedSteps,
        message: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    mission: Mission, 
    step: MissionStep
  ): Promise<{ success: boolean; result?: any; error?: any }> {
    try {
      // Simulate step execution based on type
      await new Promise(resolve => setTimeout(resolve, step.timeout || 1000));

      switch (step.type) {
      case "scan":
        return await this.executeScanStep(mission, step);
        
      case "collect":
        return await this.executeCollectStep(mission, step);
        
      case "transmit":
        return await this.executeTransmitStep(mission, step);
        
      case "move":
        return await this.executeMoveStep(mission, step);
        
      case "coordinate":
        return await this.executeCoordinateStep(mission, step);
        
      case "wait":
        return await this.executeWaitStep(mission, step);
        
      default:
        return { success: true, result: "Step completed" };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Execute scan step
   */
  private async executeScanStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing scan step: ${step.name}`);
    
    // Coordinate with agents if specified
    if (mission.agents && mission.agents.length > 0) {
      const actions = coordinationEngine.executeCoordinationCycle();
      logger.info("Coordination actions during scan:", actions);
    }

    return { 
      success: true, 
      result: { scanned: true, data: "Sample scan data" } 
    });
  }

  /**
   * Execute collect step
   */
  private async executeCollectStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing collect step: ${step.name}`);
    return { 
      success: true, 
      result: { collected: true, samples: 5 } 
    });
  }

  /**
   * Execute transmit step
   */
  private async executeTransmitStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing transmit step: ${step.name}`);
    return { 
      success: true, 
      result: { transmitted: true, bandwidth: "10Mbps" } 
    });
  }

  /**
   * Execute move step
   */
  private async executeMoveStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing move step: ${step.name}`);
    
    // Send move commands to drones if applicable
    if (step.params?.droneId && step.params?.target) {
      await droneCommandService.sendCommand(
        step.params.droneId,
        "move" as DroneCommand,
        { target: step.params.target }
      );
    }

    return { 
      success: true, 
      result: { moved: true, position: step.params?.target } 
    });
  }

  /**
   * Execute coordinate step
   */
  private async executeCoordinateStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing coordinate step: ${step.name}`);
    
    // Execute coordination cycle
    const actions = coordinationEngine.executeCoordinationCycle();
    
    return { 
      success: true, 
      result: { coordinated: true, actions: actions.length } 
    });
  }

  /**
   * Execute wait step
   */
  private async executeWaitStep(mission: Mission, step: MissionStep) {
    logger.info(`Executing wait step: ${step.name}`);
    const duration = step.params?.duration || 1000;
    await new Promise(resolve => setTimeout(resolve, duration));
    return { success: true, result: { waited: duration } };
  }

  /**
   * Pause mission
   */
  pauseMission(missionId: string): void {
    this.updateMissionStatus(missionId, "paused");
  }

  /**
   * Cancel mission
   */
  cancelMission(missionId: string): void {
    this.updateMissionStatus(missionId, "cancelled");
    
    // Clear execution interval if exists
    const interval = this.executionIntervals.get(missionId);
    if (interval) {
      clearInterval(interval);
      this.executionIntervals.delete(missionId);
    }
  }

  /**
   * Restart failed step
   */
  restartStep(missionId: string, stepId: string): void {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    const step = mission.steps.find(s => s.id === stepId);
    if (step) {
      step.status = "pending";
      step.retryCount = 0;
      this.missions.set(missionId, mission);
      this.notifyListeners();
    }
  }

  /**
   * Get AI strategy recommendation (simulated)
   */
  async getAIStrategyRecommendation(missionId: string, stepId: string): Promise<AIStrategyRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mission = this.missions.get(missionId);
    const step = mission?.steps.find(s => s.id === stepId);

    let suggestion = "Continue as planned";
    let reasoning = "Mission parameters are optimal";
    let confidence = 0.85;

    if (step?.status === "failed") {
      suggestion = "Retry with modified parameters";
      reasoning = "Previous failure suggests parameter adjustment needed";
      confidence = 0.75;
    } else if (step?.type === "coordinate") {
      suggestion = "Increase coordination frequency";
      reasoning = "Multiple agents require tighter coordination";
      confidence = 0.9;
    }

    const recommendation: AIStrategyRecommendation = {
      stepId,
      suggestion,
      reasoning,
      confidence,
      timestamp: new Date().toISOString()
    });

    // Add to mission
    if (mission) {
      if (!mission.aiSuggestions) {
        mission.aiSuggestions = [];
      }
      mission.aiSuggestions.push(recommendation);
      this.missions.set(missionId, mission);
      this.notifyListeners();
    }

    return recommendation;
  }

  /**
   * Subscribe to mission updates
   */
  subscribe(listener: (missions: Mission[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const missions = this.getMissions();
    this.listeners.forEach(listener => {
      try {
        listener(missions);
      } catch (error) {
        logger.error("Error in listener:", error);
      }
    });
  }

  /**
   * Delete mission
   */
  deleteMission(missionId: string): void {
    this.cancelMission(missionId);
    this.missions.delete(missionId);
    this.notifyListeners();
  }

  /**
   * Clear all missions
   */
  clearAll(): void {
    this.missions.clear();
    this.executionIntervals.forEach(interval => clearInterval(interval));
    this.executionIntervals.clear();
    this.notifyListeners();
  }
}

// Singleton instance
export const missionPipeline = new MissionPipeline();
