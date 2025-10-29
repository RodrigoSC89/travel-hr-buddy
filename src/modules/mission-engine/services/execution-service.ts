/**
 * PATCH 477: Mission Execution Engine
 * Handles step-by-step mission execution with real-time progress tracking
 */

// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface ExecutedMission {
  id: string;
  mission_name: string;
  mission_type: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "aborted";
  progress_percentage: number;
  vessel_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_minutes: number | null;
  actual_duration_minutes: number | null;
  result_summary: string | null;
  metadata: any;
  created_at: string;
  created_by: string | null;
}

export interface MissionStep {
  id: string;
  mission_id: string;
  step_number: number;
  step_name: string;
  step_description: string | null;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  result_data: any;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

export interface MissionDefinition {
  name: string;
  type: string;
  vessel_id?: string;
  estimated_duration_minutes?: number;
  steps: {
    name: string;
    description?: string;
    executor: (step: MissionStep) => Promise<any>;
  }[];
}

export type MissionProgressCallback = (
  mission: ExecutedMission,
  currentStep: MissionStep | null,
  allSteps: MissionStep[]
) => void;

class MissionExecutionService {
  /**
   * Create a new mission execution
   */
  async createMission(definition: MissionDefinition): Promise<ExecutedMission | null> {
    const { data, error } = await supabase
      .from("executed_missions")
      .insert({
        mission_name: definition.name,
        mission_type: definition.type,
        vessel_id: definition.vessel_id || null,
        estimated_duration_minutes: definition.estimated_duration_minutes || null,
        status: "pending",
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating mission:", error);
      return null;
    }

    // Create mission steps
    const steps = definition.steps.map((step, index) => ({
      mission_id: data.id,
      step_number: index + 1,
      step_name: step.name,
      step_description: step.description || null,
      status: "pending" as const,
    }));

    const { error: stepsError } = await supabase
      .from("mission_steps")
      .insert(steps);

    if (stepsError) {
      console.error("Error creating mission steps:", stepsError);
      return null;
    }

    return data;
  }

  /**
   * Execute a mission step-by-step
   */
  async executeMission(
    missionId: string,
    definition: MissionDefinition,
    onProgress?: MissionProgressCallback
  ): Promise<boolean> {
    try {
      // Update mission to in_progress
      await this.updateMissionStatus(missionId, "in_progress");
      await this.updateMissionField(missionId, { started_at: new Date().toISOString() });

      const startTime = Date.now();

      // Get all steps
      const steps = await this.getMissionSteps(missionId);
      if (!steps || steps.length === 0) {
        throw new Error("No steps found for mission");
      }

      // Execute each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const executor = definition.steps[i]?.executor;

        if (!executor) {
          console.warn(`No executor found for step ${step.step_number}`);
          continue;
        }

        // Update step to in_progress
        await this.updateStepStatus(step.id, "in_progress");
        await this.updateStepField(step.id, { started_at: new Date().toISOString() });

        const stepStartTime = Date.now();

        try {
          // Execute the step
          const result = await executor(step);

          const duration = Math.round((Date.now() - stepStartTime) / 1000);

          // Mark step as completed
          await this.updateStepStatus(step.id, "completed");
          await this.updateStepField(step.id, {
            completed_at: new Date().toISOString(),
            duration_seconds: duration,
            result_data: result || {},
          });

          // Update mission progress
          const progress = Math.round(((i + 1) / steps.length) * 100);
          await this.updateMissionField(missionId, { progress_percentage: progress });

          // Reload step and mission for callback
          const updatedStep = await this.getStep(step.id);
          const updatedMission = await this.getMission(missionId);
          const allSteps = await this.getMissionSteps(missionId);

          if (onProgress && updatedMission && updatedStep && allSteps) {
            onProgress(updatedMission, updatedStep, allSteps);
          }
        } catch (stepError) {
          console.error(`Error executing step ${step.step_number}:`, stepError);

          // Mark step as failed
          await this.updateStepStatus(step.id, "failed");
          await this.updateStepField(step.id, {
            completed_at: new Date().toISOString(),
            error_message: stepError instanceof Error ? stepError.message : "Unknown error",
          });

          // Mark mission as failed
          await this.updateMissionStatus(missionId, "failed");
          await this.updateMissionField(missionId, {
            completed_at: new Date().toISOString(),
            result_summary: `Failed at step ${step.step_number}: ${step.step_name}`,
          });

          return false;
        }
      }

      // Calculate actual duration
      const actualDuration = Math.round((Date.now() - startTime) / 60000);

      // Mark mission as completed
      await this.updateMissionStatus(missionId, "completed");
      await this.updateMissionField(missionId, {
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actualDuration,
        progress_percentage: 100,
        result_summary: "Mission completed successfully",
      });

      return true;
    } catch (error) {
      console.error("Error executing mission:", error);
      await this.updateMissionStatus(missionId, "failed");
      await this.updateMissionField(missionId, {
        completed_at: new Date().toISOString(),
        result_summary: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Get mission by ID
   */
  async getMission(missionId: string): Promise<ExecutedMission | null> {
    const { data, error } = await supabase
      .from("executed_missions")
      .select("*")
      .eq("id", missionId)
      .single();

    if (error) {
      console.error("Error fetching mission:", error);
      return null;
    }

    return data;
  }

  /**
   * Get mission steps
   */
  async getMissionSteps(missionId: string): Promise<MissionStep[]> {
    const { data, error } = await supabase
      .from("mission_steps")
      .select("*")
      .eq("mission_id", missionId)
      .order("step_number", { ascending: true });

    if (error) {
      console.error("Error fetching mission steps:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get single step
   */
  async getStep(stepId: string): Promise<MissionStep | null> {
    const { data, error } = await supabase
      .from("mission_steps")
      .select("*")
      .eq("id", stepId)
      .single();

    if (error) {
      console.error("Error fetching step:", error);
      return null;
    }

    return data;
  }

  /**
   * Get all missions
   */
  async getAllMissions(limit: number = 50): Promise<ExecutedMission[]> {
    const { data, error } = await supabase
      .from("executed_missions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching missions:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Update mission status
   */
  private async updateMissionStatus(
    missionId: string,
    status: ExecutedMission["status"]
  ): Promise<void> {
    await supabase
      .from("executed_missions")
      .update({ status })
      .eq("id", missionId);
  }

  /**
   * Update mission fields
   */
  private async updateMissionField(missionId: string, fields: Partial<ExecutedMission>): Promise<void> {
    await supabase
      .from("executed_missions")
      .update(fields)
      .eq("id", missionId);
  }

  /**
   * Update step status
   */
  private async updateStepStatus(
    stepId: string,
    status: MissionStep["status"]
  ): Promise<void> {
    await supabase
      .from("mission_steps")
      .update({ status })
      .eq("id", stepId);
  }

  /**
   * Update step fields
   */
  private async updateStepField(stepId: string, fields: Partial<MissionStep>): Promise<void> {
    await supabase
      .from("mission_steps")
      .update(fields)
      .eq("id", stepId);
  }

  /**
   * Abort mission
   */
  async abortMission(missionId: string): Promise<void> {
    await this.updateMissionStatus(missionId, "aborted");
    await this.updateMissionField(missionId, {
      completed_at: new Date().toISOString(),
      result_summary: "Mission aborted by user",
    });
  }
}

export const missionExecutionService = new MissionExecutionService();
