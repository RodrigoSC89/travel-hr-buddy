/**
 * PATCH 396 - Mission Control Service
 * Integrated mission management with Fleet, Crew, and Weather modules
 */

import { supabase } from "@/integrations/supabase/client";
import { missionLoggingService } from "./mission-logging";
import { missionSyncService } from "./mission-sync-service";

export interface Mission {
  id?: string;
  code: string;
  name: string;
  type: "inspection" | "maintenance" | "emergency" | "training" | "transport" | "surveillance" | "other";
  status: "pending" | "planned" | "active" | "paused" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
  assignedVesselId?: string;
  assignedCrew?: Array<{ userId: string; role: string; name: string }>;
  startTime?: string;
  endTime?: string;
  estimatedDuration?: string;
  weatherStatus?: string;
  weatherAlerts?: any[];
  fleetStatus?: string;
  completionPercentage?: number;
  objectives?: any[];
  risks?: any[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class MissionService {
  
  /**
   * Create new mission with integrations
   */
  async createMission(missionData: Mission): Promise<Mission | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check fleet status if vessel is assigned
      let fleetStatus = "not_assigned";
      if (missionData.assignedVesselId) {
        fleetStatus = await this.checkFleetStatus(missionData.assignedVesselId);
      }

      // Check weather conditions if location is provided
      let weatherStatus = "unknown";
      let weatherAlerts: any[] = [];
      if (missionData.locationLat && missionData.locationLng) {
        const weatherData = await this.checkWeatherConditions(
          missionData.locationLat,
          missionData.locationLng
        );
        weatherStatus = weatherData.status;
        weatherAlerts = weatherData.alerts;
      }

      const { data, error } = await supabase
        .from("missions")
        .insert({
          code: missionData.code,
          name: missionData.name,
          type: missionData.type,
          status: missionData.status || "pending",
          priority: missionData.priority,
          description: missionData.description,
          location_lat: missionData.locationLat,
          location_lng: missionData.locationLng,
          location_name: missionData.locationName,
          assigned_vessel_id: missionData.assignedVesselId,
          assigned_crew: missionData.assignedCrew || [],
          start_time: missionData.startTime,
          end_time: missionData.endTime,
          estimated_duration: missionData.estimatedDuration,
          weather_status: weatherStatus,
          weather_alerts: weatherAlerts,
          fleet_status: fleetStatus,
          completion_percentage: 0,
          objectives: missionData.objectives || [],
          risks: missionData.risks || [],
          metadata: missionData.metadata || {},
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      const mission = this.mapToMission(data);

      // Log mission creation
      await missionLoggingService.logEvent(
        mission.id!,
        "mission_created",
        "info",
        `Mission "${mission.name}" created`,
        {
          missionCode: mission.code,
          priority: mission.priority,
          type: mission.type,
          fleetStatus,
          weatherStatus,
        }
      );

      // Broadcast to other clients via WebSocket
      await missionSyncService.broadcastStatusUpdate(
        mission.id!,
        "status_change",
        { status: mission.status, action: "created" }
      );

      return mission;
    } catch (error) {
      console.error("Error creating mission:", error);
      return null;
    }
  }

  /**
   * Update mission status
   */
  async updateMissionStatus(
    missionId: string,
    status: Mission["status"],
    notes?: string
  ): Promise<Mission | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: any = {
        status,
        updated_by: user?.id,
      };

      // If completing, calculate actual duration
      if (status === "completed") {
        const { data: missionData } = await supabase
          .from("missions")
          .select("start_time, end_time")
          .eq("id", missionId)
          .single();

        if (missionData?.start_time) {
          const endTime = missionData.end_time || new Date().toISOString();
          updateData.end_time = endTime;
          updateData.completion_percentage = 100;
        }
      }

      const { data, error } = await supabase
        .from("missions")
        .update(updateData)
        .eq("id", missionId)
        .select()
        .single();

      if (error) throw error;

      const mission = this.mapToMission(data);

      // Log status change
      await missionLoggingService.logEvent(
        missionId,
        "status_changed",
        "info",
        `Mission status changed to ${status}`,
        { previousStatus: data.status, newStatus: status, notes }
      );

      // Broadcast update
      await missionSyncService.broadcastStatusUpdate(
        missionId,
        "status_change",
        { status, notes }
      );

      return mission;
    } catch (error) {
      console.error("Error updating mission status:", error);
      return null;
    }
  }

  /**
   * Assign crew to mission
   */
  async assignCrew(
    missionId: string,
    crewMembers: Array<{ userId: string; role: string; name: string }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("missions")
        .update({ assigned_crew: crewMembers })
        .eq("id", missionId);

      if (error) throw error;

      // Log crew assignment
      await missionLoggingService.logEvent(
        missionId,
        "crew_assigned",
        "info",
        `${crewMembers.length} crew member(s) assigned`,
        { crewMembers }
      );

      // Broadcast update
      await missionSyncService.broadcastStatusUpdate(
        missionId,
        "assignment",
        { crewMembers }
      );

      return true;
    } catch (error) {
      console.error("Error assigning crew:", error);
      return false;
    }
  }

  /**
   * Get missions with filters
   */
  async getMissions(filters?: {
    status?: Mission["status"];
    priority?: Mission["priority"];
    vesselId?: string;
    limit?: number;
  }): Promise<Mission[]> {
    try {
      let query = supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.vesselId) {
        query = query.eq("assigned_vessel_id", filters.vesselId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapToMission);
    } catch (error) {
      console.error("Error fetching missions:", error);
      return [];
    }
  }

  /**
   * Get single mission by ID
   */
  async getMission(missionId: string): Promise<Mission | null> {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("id", missionId)
        .single();

      if (error) throw error;

      return this.mapToMission(data);
    } catch (error) {
      console.error("Error fetching mission:", error);
      return null;
    }
  }

  /**
   * Check fleet status for vessel
   */
  private async checkFleetStatus(vesselId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from("vessels")
        .select("status")
        .eq("id", vesselId)
        .single();

      return data?.status || "unknown";
    } catch (error) {
      console.error("Error checking fleet status:", error);
      return "unknown";
    }
  }

  /**
   * Check weather conditions at location
   */
  private async checkWeatherConditions(
    lat: number,
    lng: number
  ): Promise<{ status: string; alerts: any[] }> {
    try {
      // Integration with weather module
      // This would call the actual weather service
      // For now, returning mock data
      return {
        status: "favorable",
        alerts: [],
      };
    } catch (error) {
      console.error("Error checking weather:", error);
      return { status: "unknown", alerts: [] };
    }
  }

  /**
   * Update mission telemetry
   */
  async updateTelemetry(
    missionId: string,
    telemetryData: Record<string, any>
  ): Promise<void> {
    try {
      await missionLoggingService.logEvent(
        missionId,
        "telemetry_update",
        "info",
        "Telemetry data updated",
        telemetryData
      );

      // Broadcast telemetry update
      await missionSyncService.broadcastStatusUpdate(
        missionId,
        "telemetry",
        telemetryData
      );
    } catch (error) {
      console.error("Error updating telemetry:", error);
    }
  }

  /**
   * Map database record to Mission interface
   */
  private mapToMission(data: any): Mission {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      status: data.status,
      priority: data.priority,
      description: data.description,
      locationLat: data.location_lat,
      locationLng: data.location_lng,
      locationName: data.location_name,
      assignedVesselId: data.assigned_vessel_id,
      assignedCrew: data.assigned_crew,
      startTime: data.start_time,
      endTime: data.end_time,
      estimatedDuration: data.estimated_duration,
      weatherStatus: data.weather_status,
      weatherAlerts: data.weather_alerts,
      fleetStatus: data.fleet_status,
      completionPercentage: data.completion_percentage,
      objectives: data.objectives,
      risks: data.risks,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const missionService = new MissionService();
