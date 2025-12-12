
/**
 * PATCH 170.0: Multi-Mission Coordination Engine
 * AI-driven coordination for multi-vessel missions
 * 
 * Supports:
 * - SAR (Search and Rescue) operations
 * - Emergency evacuations
 * - Coordinated logistics
 * - Resource sharing between vessels
 * - AI-driven decision making for optimal vessel deployment
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { MissionEngine, Mission, MissionType, MissionPriority } from "@/lib/mission-engine";
import { DistributedAIEngine } from "@/lib/distributed-ai-engine";
import { IntervesselSync } from "@/lib/intervessel-sync";

export interface CoordinationPlan {
  mission_id: string;
  vessels: VesselAssignment[];
  timeline: TimelineEvent[];
  communication_protocol: string;
  fallback_plans: FallbackPlan[];
  success_criteria: string[];
  risk_assessment: RiskAssessment;
  ai_confidence: number;
  created_at: string;
}

export interface VesselAssignment {
  vessel_id: string;
  vessel_name?: string;
  role: "primary" | "support" | "backup" | "observer";
  responsibilities: string[];
  required_capabilities: string[];
  estimated_arrival?: string;
  status: "assigned" | "en-route" | "on-scene" | "completed" | "withdrawn";
}

export interface TimelineEvent {
  event_id: string;
  timestamp: string;
  vessel_id?: string;
  event_type: "departure" | "arrival" | "coordination" | "action" | "checkpoint";
  description: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
}

export interface FallbackPlan {
  trigger_condition: string;
  actions: string[];
  alternative_vessels?: string[];
}

export interface RiskAssessment {
  overall_risk: "low" | "medium" | "high" | "critical";
  factors: {
    weather: number;
    distance: number;
    complexity: number;
    resource_availability: number;
  };
  mitigation_strategies: string[];
}

export interface CoordinationUpdate {
  update_type: "status" | "position" | "resource" | "emergency";
  vessel_id: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Multi-Mission Coordination Engine
 * Orchestrates complex multi-vessel operations with AI assistance
 */
export class MultiMissionEngine {
  /**
   * Create a coordinated multi-vessel mission
   */
  static async createCoordinatedMission(
    missionData: {
      name: string;
      mission_type: MissionType;
      priority: MissionPriority;
      description?: string;
      required_capabilities?: string[];
      target_location?: { lat: number; lng: number };
      estimated_duration?: string;
    }
  ): Promise<{ mission: Mission; plan: CoordinationPlan } | null> {
    try {
      logger.info("Creating coordinated mission:", missionData);

      // Step 1: Create the mission
      const mission = await MissionEngine.createMission({
        name: missionData.name,
        mission_type: missionData.mission_type,
        priority: missionData.priority,
        description: missionData.description,
        start_time: new Date().toISOString()
      });

      if (!mission) {
        logger.error("Failed to create mission");
        return null;
      }

      // Step 2: Use AI to suggest optimal vessel assignments
      const suggestions = await MissionEngine.suggestVesselAssignment(
        missionData.mission_type,
        missionData.priority
      );

      // Step 3: Create coordination plan using AI
      const plan = await this.createCoordinationPlan(
        mission,
        suggestions.map(s => s.vessel),
        missionData
      );

      // Step 4: Assign vessels to mission
      for (const suggestion of suggestions.slice(0, 3)) { // Limit to top 3 vessels
        await MissionEngine.assignVesselToMission(
          mission.id,
          suggestion.vessel.id,
          suggestion.role
        );
      }

      // Step 5: Store coordination plan
      await this.saveCoordinationPlan(mission.id, plan);

      // Step 6: Notify all assigned vessels
      await this.notifyVessels(mission.id, plan);

      logger.info("Coordinated mission created successfully:", mission.id);

      return { mission, plan };
    } catch (error) {
      logger.error("Error creating coordinated mission:", error);
      return null;
    }
  }

  /**
   * Create AI-driven coordination plan
   */
  private static async createCoordinationPlan(
    mission: Mission,
    vessels: any[],
    missionData: any
  ): Promise<CoordinationPlan> {
    // Use AI to generate optimal coordination plan
    const aiPrompt = `Create a detailed coordination plan for a ${mission.mission_type} mission with the following details:
    
Mission: ${mission.name}
Priority: ${mission.priority}
Description: ${mission.description || "No description provided"}
Available Vessels: ${vessels.map(v => `${v.name} (${v.vessel_type})`).join(", ")}

Generate a comprehensive coordination plan including:
1. Vessel assignments with specific roles
2. Timeline of key events
3. Communication protocols
4. Fallback plans
5. Risk assessment

Format the response as structured data.`;

    let aiResponse;
    try {
      // Use distributed AI for the primary vessel
      if (vessels.length > 0) {
        aiResponse = await DistributedAIEngine.runInference(vessels[0].id, {
          prompt: aiPrompt,
          decision_type: "mission_coordination"
        });
      }
    } catch (error) {
      logger.warn("AI coordination failed, using rule-based fallback:", error);
    }

    // Create coordination plan (with or without AI assistance)
    const plan: CoordinationPlan = {
      mission_id: mission.id,
      vessels: vessels.map((vessel, index) => ({
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        role: index === 0 ? "primary" : "support",
        responsibilities: this.getVesselResponsibilities(mission.mission_type, index === 0 ? "primary" : "support"),
        required_capabilities: missionData.required_capabilities || [],
        status: "assigned"
      })),
      timeline: this.generateTimeline(mission, vessels),
      communication_protocol: "MQTT + HTTP fallback on channel fleet-mission-" + mission.id,
      fallback_plans: this.generateFallbackPlans(mission),
      success_criteria: this.getSuccessCriteria(mission.mission_type),
      risk_assessment: this.assessRisk(mission, vessels, missionData),
      ai_confidence: aiResponse?.confidence || 0.7,
      created_at: new Date().toISOString()
    });

    return plan;
  }

  /**
   * Get vessel responsibilities based on mission type and role
   */
  private static getVesselResponsibilities(missionType: MissionType, role: string): string[] {
    const responsibilities: Record<MissionType, Record<string, string[]>> = {
      sar: {
        primary: ["Lead search operations", "Coordinate with other vessels", "Maintain communications", "Report findings"],
        support: ["Search assigned sector", "Monitor communications", "Provide backup support", "Assist with rescue"]
      },
      evacuation: {
        primary: ["Lead evacuation operations", "Coordinate logistics", "Manage evacuees", "Report status"],
        support: ["Provide transport capacity", "Medical support", "Security", "Communications relay"]
      },
      transport: {
        primary: ["Lead convoy", "Navigation", "Cargo management", "Schedule coordination"],
        support: ["Follow primary vessel", "Backup navigation", "Additional cargo capacity"]
      },
      patrol: {
        primary: ["Lead patrol route", "Surveillance", "Reporting", "Coordinate responses"],
        support: ["Follow patrol pattern", "Secondary surveillance", "Backup communications"]
      },
      training: {
        primary: ["Lead training exercises", "Instruction", "Safety oversight", "Performance evaluation"],
        support: ["Participate in drills", "Follow instructions", "Provide feedback"]
      },
      emergency: {
        primary: ["Lead emergency response", "Coordinate resources", "Make critical decisions", "Report to command"],
        support: ["Provide requested assistance", "Follow emergency protocols", "Backup communications"]
      },
      custom: {
        primary: ["Lead mission operations", "Coordinate activities", "Monitor progress"],
        support: ["Assist primary vessel", "Follow mission plan", "Provide support"]
      }
    });

    return responsibilities[missionType]?.[role] || responsibilities.custom[role];
  }

  /**
   * Generate mission timeline
   */
  private static generateTimeline(mission: Mission, vessels: any[]): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];
    const startTime = new Date(mission.start_time || new Date());

    // Departure events
    vessels.forEach((vessel, index) => {
      timeline.push({
        event_id: crypto.randomUUID(),
        timestamp: new Date(startTime.getTime() + index * 300000).toISOString(), // Stagger by 5 minutes
        vessel_id: vessel.id,
        event_type: "departure",
        description: `${vessel.name} departs for mission`,
        status: "pending"
      });
    });

    // Coordination checkpoint
    timeline.push({
      event_id: crypto.randomUUID(),
      timestamp: new Date(startTime.getTime() + 3600000).toISOString(), // 1 hour
      event_type: "coordination",
      description: "All vessels coordinate and confirm readiness",
      status: "pending"
    });

    // Action event
    timeline.push({
      event_id: crypto.randomUUID(),
      timestamp: new Date(startTime.getTime() + 7200000).toISOString(), // 2 hours
      event_type: "action",
      description: "Begin primary mission objectives",
      status: "pending"
    });

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Generate fallback plans
   */
  private static generateFallbackPlans(mission: Mission): FallbackPlan[] {
    return [
      {
        trigger_condition: "Primary vessel unable to continue",
        actions: [
          "Promote support vessel to primary role",
          "Request additional backup vessel",
          "Update coordination plan",
          "Notify all vessels of role changes"
        ]
      },
      {
        trigger_condition: "Weather conditions deteriorate",
        actions: [
          "All vessels move to safe location",
          "Suspend operations temporarily",
          "Reassess mission feasibility",
          "Update estimated completion time"
        ]
      },
      {
        trigger_condition: "Loss of communications",
        actions: [
          "Switch to backup communication channel",
          "Use pre-defined procedures",
          "Maintain last known positions",
          "Attempt reconnection every 15 minutes"
        ]
      }
    ];
  }

  /**
   * Get success criteria for mission type
   */
  private static getSuccessCriteria(missionType: MissionType): string[] {
    const criteria: Record<MissionType, string[]> = {
      sar: [
        "All search sectors covered",
        "Target located or search area exhausted",
        "Rescue completed if target found",
        "All vessels return safely"
      ],
      evacuation: [
        "All personnel evacuated safely",
        "Medical needs addressed",
        "Transport to safe location completed",
        "No casualties during operation"
      ],
      transport: [
        "Cargo delivered to destination",
        "No damage to cargo",
        "On-time delivery",
        "All vessels accounted for"
      ],
      patrol: [
        "Patrol route completed",
        "All checkpoints visited",
        "No security incidents",
        "Reports submitted"
      ],
      training: [
        "Training objectives met",
        "All exercises completed",
        "Performance meets standards",
        "Safety protocols followed"
      ],
      emergency: [
        "Emergency situation resolved",
        "All personnel safe",
        "Damage minimized",
        "Proper protocols followed"
      ],
      custom: [
        "Mission objectives achieved",
        "All vessels complete assignments",
        "No major incidents",
        "Documentation complete"
      ]
    });

    return criteria[missionType] || criteria.custom;
  }

  /**
   * Assess mission risk
   */
  private static assessRisk(mission: Mission, vessels: any[], missionData: any): RiskAssessment {
    // Simple risk scoring (can be enhanced with real data)
    const weatherRisk = 0.3; // Would come from weather API
    const distanceRisk = 0.2; // Based on vessel positions
    const complexityRisk = mission.priority === "critical" ? 0.8 : mission.priority === "high" ? 0.6 : 0.3;
    const resourceRisk = vessels.length < 2 ? 0.7 : 0.3;

    const avgRisk = (weatherRisk + distanceRisk + complexityRisk + resourceRisk) / 4;

    let overallRisk: RiskAssessment["overall_risk"];
    if (avgRisk > 0.7) overallRisk = "critical";
    else if (avgRisk > 0.5) overallRisk = "high";
    else if (avgRisk > 0.3) overallRisk = "medium";
    else overallRisk = "low";

    return {
      overall_risk: overallRisk,
      factors: {
        weather: weatherRisk,
        distance: distanceRisk,
        complexity: complexityRisk,
        resource_availability: resourceRisk
      },
      mitigation_strategies: [
        "Monitor weather conditions continuously",
        "Maintain regular communication intervals",
        "Have backup vessels on standby",
        "Follow established protocols strictly"
      ]
    });
  }

  /**
   * Save coordination plan to database
   */
  private static async saveCoordinationPlan(missionId: string, plan: CoordinationPlan): Promise<void> {
    try {
      const { error } = await supabase
        .from("mission_coordination_plans")
        .insert({
          mission_id: missionId,
          plan_data: plan,
          ai_confidence: plan.ai_confidence,
          created_at: plan.created_at
        });

      if (error) {
        logger.error("Error saving coordination plan:", error);
      }
    } catch (error) {
      logger.error("Error in saveCoordinationPlan:", error);
    }
  }

  /**
   * Notify all assigned vessels about the mission
   */
  private static async notifyVessels(missionId: string, plan: CoordinationPlan): Promise<void> {
    try {
      for (const vessel of plan.vessels) {
        await IntervesselSync.sendAlert({
          alert_type: "custom",
          severity: "info",
          title: "New Mission Assignment",
          message: `You have been assigned to mission with role: ${vessel.role}`,
          metadata: {
            mission_id: missionId,
            role: vessel.role,
            responsibilities: vessel.responsibilities
          }
        });
      }

      logger.info(`Notifications sent to ${plan.vessels.length} vessels for mission ${missionId}`);
    } catch (error) {
      logger.error("Error notifying vessels:", error);
    }
  }

  /**
   * Get coordination plan for a mission
   */
  static async getCoordinationPlan(missionId: string): Promise<CoordinationPlan | null> {
    try {
      const { data, error } = await supabase
        .from("mission_coordination_plans")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        logger.error("Error fetching coordination plan:", error);
        return null;
      }

      return data?.plan_data as CoordinationPlan;
    } catch (error) {
      logger.error("Error in getCoordinationPlan:", error);
      return null;
    }
  }

  /**
   * Update mission coordination status
   */
  static async updateCoordinationStatus(
    missionId: string,
    vesselId: string,
    update: CoordinationUpdate
  ): Promise<boolean> {
    try {
      // Log the update
      await MissionEngine.logMissionEvent(missionId, {
        log_type: "coordination",
        message: `Coordination update from vessel: ${update.update_type}`,
        vessel_id: vesselId,
        metadata: update.data
      });

      // Broadcast update to other vessels in mission
      const vessels = await MissionEngine.getMissionVessels(missionId);
      for (const vessel of vessels) {
        if (vessel.id !== vesselId) {
          await IntervesselSync.sendAlert({
            alert_type: "custom",
            severity: "info",
            title: "Mission Coordination Update",
            message: `Update from ${vessel.name}: ${update.update_type}`,
            metadata: {
              mission_id: missionId,
              source_vessel: vesselId,
              update_type: update.update_type,
              data: update.data
            }
          });
        }
      }

      return true;
    } catch (error) {
      logger.error("Error updating coordination status:", error);
      return false;
    }
  }

  /**
   * Execute SAR (Search and Rescue) operation
   */
  static async executeSAROperation(params: {
    target_location: { lat: number; lng: number };
    search_radius_km: number;
    priority: MissionPriority;
  }): Promise<{ mission: Mission; plan: CoordinationPlan } | null> {
    return await this.createCoordinatedMission({
      name: `SAR Operation - ${new Date().toISOString()}`,
      mission_type: "sar",
      priority: params.priority,
      description: `Search and rescue operation at coordinates ${params.target_location.lat}, ${params.target_location.lng}`,
      target_location: params.target_location,
      required_capabilities: ["rescue_equipment", "medical_support", "communications"]
    });
  }

  /**
   * Execute emergency evacuation
   */
  static async executeEvacuation(params: {
    location: { lat: number; lng: number };
    personnel_count: number;
    medical_needs: boolean;
  }): Promise<{ mission: Mission; plan: CoordinationPlan } | null> {
    return await this.createCoordinatedMission({
      name: `Emergency Evacuation - ${new Date().toISOString()}`,
      mission_type: "evacuation",
      priority: "critical",
      description: `Emergency evacuation of ${params.personnel_count} personnel${params.medical_needs ? " with medical needs" : ""}`,
      target_location: params.location,
      required_capabilities: params.medical_needs 
        ? ["transport_capacity", "medical_support", "communications"]
        : ["transport_capacity", "communications"]
    });
  }
}
