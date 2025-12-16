/**
 * PATCH 211.1 - Mission Simulation Core (Simulação Autônoma)
 * 
 * Simulation engine to model operational missions with AI-predicted outcomes 
 * and failure injection capabilities.
 * Fixed: Duplicate .from() calls and robust error handling
 */

import { logger } from "@/lib/logger";
import { learningCore } from "./learning-core";
import { supabase } from "@/integrations/supabase/client";

export interface Vessel {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  status: "operational" | "maintenance" | "offline";
  crew_count: number;
}

export interface WeatherCondition {
  location: {
    latitude: number;
    longitude: number;
  };
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  sea_state: string;
  timestamp: Date;
  risk_level: "safe" | "caution" | "warning" | "danger";
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  experience_years: number;
  certifications: string[];
  status: "available" | "on_duty" | "unavailable";
}

export interface PayloadItem {
  id: string;
  type: string;
  weight: number;
  volume: number;
  hazard_level: "none" | "low" | "medium" | "high";
  special_requirements: string[];
}

export interface RiskFactor {
  id: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface FailureInjection {
  system_crash: boolean;
  comms_loss: boolean;
  crew_delay: boolean;
  weather_deterioration: boolean;
  equipment_failure: boolean;
}

export interface SimulationBlueprint {
  id?: string;
  name: string;
  description: string;
  vessels: Vessel[];
  weather: WeatherCondition[];
  crew: CrewMember[];
  payload: PayloadItem[];
  riskFactors: RiskFactor[];
  failureInjections?: FailureInjection;
  duration_hours: number;
}

export interface SimulationOutcome {
  success: boolean;
  completion_percentage: number;
  incidents: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: Date;
    description: string;
    resolution: string;
  }>;
  performance_metrics: {
    efficiency: number;
    safety_score: number;
    time_deviation: number;
    cost_impact: number;
  };
  lessons_learned: string[];
  ai_recommendations: string[];
}

export interface PredictedOutcome {
  success_probability: number;
  estimated_duration_hours: number;
  risk_score: number;
  confidence: number;
  critical_factors: string[];
  recommendations: string[];
}

class MissionSimulationCore {
  private simulations: Map<string, SimulationBlueprint> = new Map();
  private isRunning = false;
  private tableAvailable: boolean | null = null;

  constructor() {
    logger.info("[MissionSimulationCore] Initialized");
  }

  /**
   * Check if simulated_missions table exists
   */
  private async checkTableExists(): Promise<boolean> {
    if (this.tableAvailable !== null) {
      return this.tableAvailable;
    }

    try {
      const { error } = await supabase
        .from("simulated_missions" as any)
        .select("id")
        .limit(1);

      this.tableAvailable = !error || !error.message?.includes("does not exist");
      return this.tableAvailable;
    } catch {
      this.tableAvailable = false;
      return false;
    }
  }

  /**
   * Create a new simulation blueprint
   */
  async createSimulation(blueprint: SimulationBlueprint): Promise<string> {
    try {
      logger.info("[MissionSimulationCore] Creating new simulation", {
        name: blueprint.name,
      });

      // Validate blueprint
      this.validateBlueprint(blueprint);

      // Generate predictions using AI
      const predictions = await this.generatePredictions(blueprint);

      // Check if table exists
      const tableExists = await this.checkTableExists();
      
      if (!tableExists) {
        // Use in-memory storage
        const simulationId = crypto.randomUUID();
        blueprint.id = simulationId;
        this.simulations.set(simulationId, { ...blueprint, predictions } as any);
        logger.info("[MissionSimulationCore] Simulation created in memory", { id: simulationId });
        return simulationId;
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from("simulated_missions" as any)
        .insert({
          name: blueprint.name,
          description: blueprint.description,
          vessels: blueprint.vessels,
          weather: blueprint.weather,
          crew: blueprint.crew,
          payload: blueprint.payload,
          risk_factors: blueprint.riskFactors,
          failure_injections: blueprint.failureInjections || {},
          predictions: predictions,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      const simulationId = (data as any).id;
      blueprint.id = simulationId;
      this.simulations.set(simulationId, blueprint);

      logger.info("[MissionSimulationCore] Simulation created", {
        id: simulationId,
      });

      return simulationId;
    } catch (error) {
      logger.error("[MissionSimulationCore] Failed to create simulation", {
        error,
      });
      throw error;
    }
  }

  /**
   * Run a simulation
   */
  async runSimulation(simulationId: string): Promise<SimulationOutcome> {
    try {
      logger.info("[MissionSimulationCore] Running simulation", {
        id: simulationId,
      });

      const blueprint = this.simulations.get(simulationId);
      if (!blueprint) {
        throw new Error(`Simulation ${simulationId} not found`);
      }

      const tableExists = await this.checkTableExists();

      if (tableExists) {
        // Update status to running
        await supabase
          .from("simulated_missions" as any)
          .update({ status: "running" })
          .eq("id", simulationId);
      }

      this.isRunning = true;

      // Run simulation phases
      const outcome = await this.executeSimulation(blueprint);

      if (tableExists) {
        // Update status and save outcome
        await supabase
          .from("simulated_missions" as any)
          .update({
            status: outcome.success ? "completed" : "failed",
            outcome: outcome,
          })
          .eq("id", simulationId);
      }

      this.isRunning = false;

      // Track decision with learning core
      try {
        await learningCore.trackDecision(
          "mission-simulation",
          "simulation_completed",
          { simulationId, blueprint },
          { outcome },
          outcome.success ? 0.9 : 0.5
        );
      } catch {
        // Learning core tracking is optional
      }

      logger.info("[MissionSimulationCore] Simulation completed", {
        id: simulationId,
        success: outcome.success,
      });

      return outcome;
    } catch (error) {
      logger.error("[MissionSimulationCore] Simulation failed", { error });
      
      const tableExists = await this.checkTableExists();
      if (tableExists) {
        await supabase
          .from("simulated_missions" as any)
          .update({ status: "failed" })
          .eq("id", simulationId);
      }

      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Validate simulation blueprint
   */
  private validateBlueprint(blueprint: SimulationBlueprint): void {
    if (!blueprint.name) {
      throw new Error("Simulation name is required");
    }

    if (!blueprint.vessels || blueprint.vessels.length === 0) {
      throw new Error("At least one vessel is required");
    }

    if (!blueprint.crew || blueprint.crew.length === 0) {
      throw new Error("At least one crew member is required");
    }

    if (blueprint.duration_hours <= 0) {
      throw new Error("Duration must be greater than 0");
    }
  }

  /**
   * Generate AI predictions for the simulation
   */
  private async generatePredictions(
    blueprint: SimulationBlueprint
  ): Promise<PredictedOutcome> {
    logger.info("[MissionSimulationCore] Generating predictions");

    // Calculate base risk score from risk factors
    const riskScore = blueprint.riskFactors.reduce(
      (sum, factor) => sum + (factor.probability * factor.impact),
      0
    ) / Math.max(blueprint.riskFactors.length, 1);

    // Calculate success probability based on various factors
    let successProbability = 0.85;

    // Adjust for weather conditions
    const dangerousWeather = blueprint.weather.filter(
      (w) => w.risk_level === "danger" || w.risk_level === "warning"
    );
    successProbability -= dangerousWeather.length * 0.1;

    // Adjust for failure injections
    if (blueprint.failureInjections) {
      const injectionCount = Object.values(blueprint.failureInjections).filter(
        Boolean
      ).length;
      successProbability -= injectionCount * 0.15;
    }

    // Adjust for crew experience
    const avgExperience =
      blueprint.crew.reduce((sum, c) => sum + c.experience_years, 0) /
      blueprint.crew.length;
    if (avgExperience < 2) successProbability -= 0.1;
    if (avgExperience > 5) successProbability += 0.05;

    // Adjust for payload hazards
    const highHazardPayload = blueprint.payload.filter(
      (p) => p.hazard_level === "high" || p.hazard_level === "medium"
    );
    successProbability -= highHazardPayload.length * 0.05;

    // Clamp between 0 and 1
    successProbability = Math.max(0, Math.min(1, successProbability));

    // Estimate duration based on conditions
    let estimatedDuration = blueprint.duration_hours;
    if (dangerousWeather.length > 0) {
      estimatedDuration *= 1.2;
    }
    if (blueprint.failureInjections?.crew_delay) {
      estimatedDuration *= 1.15;
    }

    // Generate critical factors
    const criticalFactors: string[] = [];
    if (riskScore > 5) criticalFactors.push("High risk factors detected");
    if (dangerousWeather.length > 0)
      criticalFactors.push("Adverse weather conditions");
    if (avgExperience < 2) criticalFactors.push("Inexperienced crew");
    if (highHazardPayload.length > 0)
      criticalFactors.push("Hazardous payload");

    // Generate recommendations
    const recommendations: string[] = [];
    if (dangerousWeather.length > 0)
      recommendations.push("Consider delaying mission until weather improves");
    if (avgExperience < 2)
      recommendations.push("Add experienced crew members");
    if (highHazardPayload.length > 0)
      recommendations.push("Review safety protocols for hazardous materials");
    if (riskScore > 7)
      recommendations.push("Implement additional risk mitigation measures");

    return {
      success_probability: successProbability,
      estimated_duration_hours: estimatedDuration,
      risk_score: riskScore,
      confidence: 0.75,
      critical_factors: criticalFactors,
      recommendations: recommendations,
    };
  }

  /**
   * Execute the simulation
   */
  private async executeSimulation(
    blueprint: SimulationBlueprint
  ): Promise<SimulationOutcome> {
    logger.info("[MissionSimulationCore] Executing simulation phases");

    const incidents: SimulationOutcome["incidents"] = [];
    let completionPercentage = 0;
    let success = true;

    // Phase 1: Initialization (0-20%)
    completionPercentage = 20;
    if (blueprint.failureInjections?.crew_delay) {
      incidents.push({
        type: "crew_delay",
        severity: "medium",
        timestamp: new Date(),
        description: "Crew members delayed during initialization",
        resolution: "Proceeded with available crew",
      });
    }

    // Phase 2: Execution (20-70%)
    completionPercentage = 50;
    if (blueprint.failureInjections?.system_crash) {
      incidents.push({
        type: "system_crash",
        severity: "high",
        timestamp: new Date(),
        description: "Critical system crashed during execution",
        resolution: "System restarted, minor data loss",
      });
      success = false;
    }

    if (blueprint.failureInjections?.comms_loss) {
      incidents.push({
        type: "comms_loss",
        severity: "critical",
        timestamp: new Date(),
        description: "Lost communication with command center",
        resolution: "Switched to backup communication system",
      });
    }

    // Check weather conditions
    const dangerousWeather = blueprint.weather.filter(
      (w) => w.risk_level === "danger"
    );
    if (dangerousWeather.length > 0) {
      incidents.push({
        type: "weather_event",
        severity: "high",
        timestamp: new Date(),
        description: "Encountered dangerous weather conditions",
        resolution: "Adjusted route and reduced speed",
      });
    }

    completionPercentage = 70;

    // Phase 3: Completion (70-100%)
    if (blueprint.failureInjections?.equipment_failure) {
      incidents.push({
        type: "equipment_failure",
        severity: "medium",
        timestamp: new Date(),
        description: "Non-critical equipment failure",
        resolution: "Continued with redundant systems",
      });
    }

    completionPercentage = success ? 100 : 85;

    // Calculate performance metrics
    const efficiency = success ? 0.85 - (incidents.length * 0.05) : 0.6;
    const safetyScore = 10 - (incidents.reduce((sum, i) => {
      const severityScore = {
        low: 0.5,
        medium: 1.5,
        high: 3,
        critical: 5,
      };
      return sum + severityScore[i.severity];
    }, 0));

    const timeDeviation = incidents.length > 0 ? 15 + (incidents.length * 5) : 0;
    const costImpact = incidents.reduce((sum, i) => {
      const costs = { low: 1000, medium: 5000, high: 15000, critical: 50000 };
      return sum + costs[i.severity];
    }, 0);

    // Generate lessons learned
    const lessonsLearned: string[] = [];
    if (incidents.some((i) => i.type === "system_crash")) {
      lessonsLearned.push("Implement redundant systems to prevent critical failures");
    }
    if (incidents.some((i) => i.type === "comms_loss")) {
      lessonsLearned.push("Ensure backup communication systems are always available");
    }
    if (incidents.some((i) => i.type === "weather_event")) {
      lessonsLearned.push("Improve weather monitoring and route planning");
    }

    // Generate AI recommendations
    const aiRecommendations: string[] = [
      "Consider implementing automated failure detection",
      "Enhance crew training for emergency scenarios",
      "Review and update risk assessment procedures",
    ];

    return {
      success,
      completion_percentage: completionPercentage,
      incidents,
      performance_metrics: {
        efficiency: Math.max(0, Math.min(1, efficiency)),
        safety_score: Math.max(0, Math.min(10, safetyScore)),
        time_deviation: timeDeviation,
        cost_impact: costImpact,
      },
      lessons_learned: lessonsLearned,
      ai_recommendations: aiRecommendations,
    };
  }

  /**
   * Get simulation by ID
   */
  async getSimulation(simulationId: string): Promise<SimulationBlueprint | null> {
    try {
      // Check in-memory first
      const inMemory = this.simulations.get(simulationId);
      if (inMemory) return inMemory;

      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return null;
      }

      const { data, error } = await supabase
        .from("simulated_missions" as any)
        .select("*")
        .eq("id", simulationId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const d = data as any;
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        vessels: d.vessels,
        weather: d.weather,
        crew: d.crew,
        payload: d.payload,
        riskFactors: d.risk_factors,
        failureInjections: d.failure_injections,
        duration_hours: 24,
      };
    } catch (error) {
      logger.warn("[MissionSimulationCore] Failed to get simulation", { error });
      return null;
    }
  }

  /**
   * List all simulations - with graceful fallback
   */
  async listSimulations(): Promise<any[]> {
    try {
      const tableExists = await this.checkTableExists();
      
      if (!tableExists) {
        // Return in-memory simulations or mock data
        const inMemory = Array.from(this.simulations.values());
        if (inMemory.length > 0) return inMemory;
        return this.getMockSimulations();
      }

      const { data, error } = await supabase
        .from("simulated_missions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logger.warn("[MissionSimulationCore] Query failed, using mock data");
        return this.getMockSimulations();
      }

      return data || this.getMockSimulations();
    } catch (error) {
      logger.warn("[MissionSimulationCore] Simulations unavailable, using mock", { error });
      return this.getMockSimulations();
    }
  }

  /**
   * Get mock simulations for demonstration
   */
  private getMockSimulations(): any[] {
    return [
      {
        id: "mock-sim-1",
        name: "Emergency Evacuation Drill",
        description: "Simulated emergency evacuation procedure",
        status: "completed",
        predictions: { success_probability: 0.92, risk_score: 2.5 },
        outcome: { success: true, completion_percentage: 100 },
        created_at: new Date().toISOString(),
      },
      {
        id: "mock-sim-2",
        name: "Storm Navigation Test",
        description: "Route planning during adverse weather",
        status: "pending",
        predictions: { success_probability: 0.78, risk_score: 5.2 },
        created_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Delete simulation
   */
  async deleteSimulation(simulationId: string): Promise<void> {
    try {
      // Remove from in-memory
      this.simulations.delete(simulationId);

      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        logger.info("[MissionSimulationCore] Simulation deleted from memory", { id: simulationId });
        return;
      }

      const { error } = await supabase
        .from("simulated_missions" as any)
        .delete()
        .eq("id", simulationId);

      if (error) throw error;

      logger.info("[MissionSimulationCore] Simulation deleted", {
        id: simulationId,
      });
    } catch (error) {
      logger.warn("[MissionSimulationCore] Failed to delete simulation", { error });
    }
  }
}

export const missionSimulationCore = new MissionSimulationCore();
