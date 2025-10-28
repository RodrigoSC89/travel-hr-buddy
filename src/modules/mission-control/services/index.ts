/**
 * PATCH 163.0 - Autonomous Mission Engine
 * Executes missions based on rules and conditions
 */

import { logger } from "@/lib/logger";

export interface MissionStep {
  id: string;
  name: string;
  action: () => Promise<void> | void;
  condition?: () => boolean | Promise<boolean>;
  timeout?: number; // in milliseconds
  retryOnFail?: boolean;
  maxRetries?: number;
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  steps: MissionStep[];
  status: "pending" | "running" | "completed" | "failed" | "paused";
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  currentStep?: number;
  logs: MissionLog[];
}

export interface MissionLog {
  timestamp: number;
  level: "info" | "warning" | "error" | "success";
  message: string;
  stepId?: string;
  data?: any;
}

export interface MissionCondition {
  id: string;
  name: string;
  check: () => boolean | Promise<boolean>;
  interval?: number; // Check interval in milliseconds
  onTrigger: () => Promise<void> | void;
}

class MissionEngine {
  private missions: Map<string, Mission> = new Map();
  private conditions: Map<string, MissionCondition> = new Map();
  private conditionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private executionPromises: Map<string, Promise<void>> = new Map();

  /**
   * Define a new mission
   */
  defineMission(mission: Omit<Mission, "status" | "createdAt" | "logs">): string {
    const newMission: Mission = {
      ...mission,
      status: "pending",
      createdAt: Date.now(),
      logs: []
    };

    this.missions.set(mission.id, newMission);
    this.autolog(mission.id, "info", `Mission "${mission.name}" defined`);
    
    return mission.id;
  }

  /**
   * Execute a mission
   */
  async executeMission(missionId: string): Promise<void> {
    const mission = this.missions.get(missionId);
    
    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    if (mission.status === "running") {
      throw new Error(`Mission ${missionId} is already running`);
    }

    // Check if already executing
    if (this.executionPromises.has(missionId)) {
      return this.executionPromises.get(missionId);
    }

    const executionPromise = this._executeMissionSteps(mission);
    this.executionPromises.set(missionId, executionPromise);

    try {
      await executionPromise;
    } finally {
      this.executionPromises.delete(missionId);
    }
  }

  /**
   * Internal mission execution with step handling
   */
  private async _executeMissionSteps(mission: Mission): Promise<void> {
    mission.status = "running";
    mission.startedAt = Date.now();
    mission.currentStep = 0;

    this.autolog(mission.id, "info", `Starting mission "${mission.name}"`);

    try {
      for (let i = 0; i < mission.steps.length; i++) {
        const step = mission.steps[i];
        mission.currentStep = i;

        this.autolog(mission.id, "info", `Executing step: ${step.name}`, step.id);

        // Check step condition if exists
        if (step.condition) {
          const conditionMet = await step.condition();
          if (!conditionMet) {
            this.autolog(mission.id, "warning", `Step "${step.name}" condition not met, skipping`, step.id);
            continue;
          }
        }

        // Execute step with retry logic
        await this._executeStep(mission, step);
      }

      mission.status = "completed";
      mission.completedAt = Date.now();
      this.autolog(mission.id, "success", `Mission "${mission.name}" completed successfully`);
    } catch (error) {
      mission.status = "failed";
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.autolog(mission.id, "error", `Mission "${mission.name}" failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async _executeStep(mission: Mission, step: MissionStep): Promise<void> {
    const maxRetries = step.retryOnFail ? (step.maxRetries || 3) : 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Execute with timeout if specified
        if (step.timeout) {
          await this._executeWithTimeout(step.action, step.timeout);
        } else {
          await step.action();
        }

        this.autolog(mission.id, "success", `Step "${step.name}" completed`, step.id);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        
        if (attempt < maxRetries - 1) {
          this.autolog(
            mission.id,
            "warning",
            `Step "${step.name}" failed (attempt ${attempt + 1}/${maxRetries}), retrying...`,
            step.id,
            { error: lastError.message }
          );
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    throw new Error(`Step "${step.name}" failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Execute action with timeout
   */
  private async _executeWithTimeout(action: () => Promise<void> | void, timeout: number): Promise<void> {
    return Promise.race([
      action(),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error("Step timeout exceeded")), timeout)
      )
    ]);
  }

  /**
   * Register a reactive condition
   */
  executeWhen(condition: MissionCondition): void {
    this.conditions.set(condition.id, condition);

    // Set up interval checking if specified
    const interval = condition.interval || 60000; // Default 1 minute
    
    const intervalId = setInterval(async () => {
      try {
        const shouldTrigger = await condition.check();
        
        if (shouldTrigger) {
          logger.info(`Condition "${condition.name}" triggered`);
          await condition.onTrigger();
        }
      } catch (error) {
        logger.error(`Error checking condition "${condition.name}":`, error);
      }
    }, interval);

    this.conditionIntervals.set(condition.id, intervalId);
  }

  /**
   * Remove a condition
   */
  removeCondition(conditionId: string): void {
    const intervalId = this.conditionIntervals.get(conditionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.conditionIntervals.delete(conditionId);
    }
    this.conditions.delete(conditionId);
  }

  /**
   * Auto-log action with timestamp
   */
  autolog(
    missionId: string,
    level: "info" | "warning" | "error" | "success",
    message: string,
    stepId?: string,
    data?: any
  ): void {
    const mission = this.missions.get(missionId);
    if (!mission) return;

    const logEntry: MissionLog = {
      timestamp: Date.now(),
      level,
      message,
      stepId,
      data
    };

    mission.logs.push(logEntry);

    // Also log to console
    const logMethod = level === "error" ? logger.error : 
      level === "warning" ? logger.warn : 
        logger.info;
    
    logMethod(`[Mission ${mission.name}] ${message}`, data);
  }

  /**
   * Get mission status
   */
  getMission(missionId: string): Mission | undefined {
    return this.missions.get(missionId);
  }

  /**
   * Get all missions
   */
  getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  /**
   * Get mission logs
   */
  getMissionLogs(missionId: string): MissionLog[] {
    const mission = this.missions.get(missionId);
    return mission?.logs || [];
  }

  /**
   * Pause a running mission
   */
  pauseMission(missionId: string): void {
    const mission = this.missions.get(missionId);
    if (mission && mission.status === "running") {
      mission.status = "paused";
      this.autolog(missionId, "info", "Mission paused");
    }
  }

  /**
   * Resume a paused mission
   */
  async resumeMission(missionId: string): Promise<void> {
    const mission = this.missions.get(missionId);
    if (mission && mission.status === "paused") {
      this.autolog(missionId, "info", "Mission resumed");
      await this.executeMission(missionId);
    }
  }

  /**
   * Cancel a mission
   */
  cancelMission(missionId: string): void {
    const mission = this.missions.get(missionId);
    if (mission) {
      mission.status = "failed";
      this.autolog(missionId, "warning", "Mission cancelled");
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear all condition intervals
    this.conditionIntervals.forEach(intervalId => clearInterval(intervalId));
    this.conditionIntervals.clear();
    this.conditions.clear();
    this.missions.clear();
    this.executionPromises.clear();
  }
}

export const missionEngine = new MissionEngine();
