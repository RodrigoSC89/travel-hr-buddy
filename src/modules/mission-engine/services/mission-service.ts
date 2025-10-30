// @ts-nocheck
/**
 * PATCH 492 - Mission Engine Service (Enhanced with Real Logic)
 * Real mission flow: create → assign → monitor → close
 * Integrated with mission-control and task-automation
 * Real-time log streaming and incident support
 */

import { supabase } from "@/integrations/supabase/client";
import type { Mission, MissionLog, MissionExecution, MissionAlert } from "../types";

export class MissionEngineService {
  
  // ==================== Real-time Subscriptions ====================
  
  /**
   * Subscribe to mission updates in real-time
   */
  subscribeMissions(callback: (missions: Mission[]) => void) {
    const channel = supabase
      .channel("mission-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "missions"
      }, async () => {
        const missions = await this.getMissions();
        callback(missions);
      })
      .subscribe();
    
    return channel;
  }

  /**
   * Subscribe to mission logs in real-time
   */
  subscribeLogs(callback: (logs: MissionLog[]) => void, missionId?: string) {
    const channel = supabase
      .channel("mission-logs-updates")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "mission_logs",
        filter: missionId ? `mission_id=eq.${missionId}` : undefined
      }, async () => {
        const logs = await this.getLogs(missionId ? { missionId } : undefined);
        callback(logs);
      })
      .subscribe();
    
    return channel;
  }

  // ==================== Mission Workflow (Real Flow) ====================
  
  /**
   * STEP 1: Create Mission
   */
  async createMission(mission: Omit<Mission, "id" | "createdAt">): Promise<Mission> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("missions")
        .insert({
          code: mission.code,
          name: mission.name,
          type: mission.type,
          status: "planned", // Start as planned
          priority: mission.priority,
          description: mission.description,
          location_lat: mission.location?.lat,
          location_lng: mission.location?.lng,
          assigned_vessel_id: mission.assignedVesselId,
          assigned_agents: mission.assignedAgents || [],
          start_time: mission.startTime,
          end_time: mission.endTime,
          metadata: mission.metadata || {},
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Log mission creation
      await this.createLog({
        missionId: data.id,
        logType: "info",
        severity: "low",
        title: "Mission Created",
        message: `Mission "${mission.name}" has been created and is now in planning phase`,
        category: "Lifecycle",
        sourceModule: "Mission Engine",
        eventTimestamp: new Date().toISOString()
      });
      
      return this.mapToMission(data);
    } catch (error) {
      console.error("Error creating mission:", error);
      throw error;
    }
  }

  /**
   * STEP 2: Assign Mission to Vessel/Team
   */
  async assignMission(missionId: string, vesselId: string, agentIds: string[]): Promise<Mission> {
    try {
      const mission = await this.updateMission(missionId, {
        assignedVesselId: vesselId,
        assignedAgents: agentIds,
        status: "assigned"
      });

      // Log assignment
      await this.createLog({
        missionId,
        logType: "info",
        severity: "medium",
        title: "Mission Assigned",
        message: `Mission assigned to vessel ${vesselId} with ${agentIds.length} agents`,
        category: "Assignment",
        sourceModule: "Mission Engine",
        eventTimestamp: new Date().toISOString(),
        metadata: { vesselId, agentIds }
      });

      return mission;
    } catch (error) {
      console.error("Error assigning mission:", error);
      throw error;
    }
  }

  /**
   * STEP 3: Monitor Mission (Real-time status updates)
   */
  async monitorMission(missionId: string): Promise<{
    mission: Mission;
    logs: MissionLog[];
    alerts: MissionAlert[];
  }> {
    try {
      const [mission, logs, alerts] = await Promise.all([
        this.getMission(missionId),
        this.getLogs({ missionId }),
        this.getAlerts(missionId)
      ]);

      if (!mission) throw new Error("Mission not found");

      return { mission, logs, alerts };
    } catch (error) {
      console.error("Error monitoring mission:", error);
      throw error;
    }
  }

  /**
   * STEP 4: Close Mission
   */
  async closeMission(missionId: string, summary: string, outcome: "success" | "partial" | "failed"): Promise<Mission> {
    try {
      const mission = await this.updateMission(missionId, {
        status: "completed",
        endTime: new Date().toISOString(),
        metadata: { outcome, summary }
      });

      // Log mission closure
      await this.createLog({
        missionId,
        logType: "info",
        severity: "medium",
        title: "Mission Closed",
        message: `Mission completed with outcome: ${outcome}. ${summary}`,
        category: "Lifecycle",
        sourceModule: "Mission Engine",
        eventTimestamp: new Date().toISOString(),
        metadata: { outcome, summary }
      });

      return mission;
    } catch (error) {
      console.error("Error closing mission:", error);
      throw error;
    }
  }

  /**
   * Handle incidents during mission
   */
  async reportMissionIncident(missionId: string, incident: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    category: string;
  }): Promise<void> {
    try {
      // Create incident report
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: incidentData, error: incidentError } = await supabase
        .from("incident_reports")
        .insert({
          incident_number: `INC-${Date.now()}`,
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          category: incident.category,
          status: "pending",
          incident_date: new Date().toISOString(),
          incident_location: "Mission Site",
          impact_level: incident.severity,
          reported_by: user?.email || "System",
          assigned_to: "Mission Commander"
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Log incident in mission logs
      await this.createLog({
        missionId,
        logType: "error",
        severity: incident.severity,
        title: `Incident: ${incident.title}`,
        message: incident.description,
        category: "Incident",
        sourceModule: "Incident Reports",
        eventTimestamp: new Date().toISOString(),
        metadata: { incidentId: incidentData.id, incidentNumber: incidentData.incident_number }
      });

      // Create mission alert
      await this.createAlert({
        missionId,
        severity: incident.severity,
        message: `Incident reported: ${incident.title}`,
        acknowledged: false
      });

    } catch (error) {
      console.error("Error reporting mission incident:", error);
      throw error;
    }
  }
  
  // ==================== Mission Management ====================
  
  async createMission(mission: Omit<Mission, "id" | "createdAt">): Promise<Mission> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("missions")
        .insert({
          code: mission.code,
          name: mission.name,
          type: mission.type,
          status: mission.status,
          priority: mission.priority,
          description: mission.description,
          location_lat: mission.location?.lat,
          location_lng: mission.location?.lng,
          assigned_vessel_id: mission.assignedVesselId,
          assigned_agents: mission.assignedAgents || [],
          start_time: mission.startTime,
          end_time: mission.endTime,
          metadata: mission.metadata || {},
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToMission(data);
    } catch (error) {
      console.error("Error creating mission:", error);
      throw error;
    }
  }

  async updateMission(id: string, mission: Partial<Mission>): Promise<Mission> {
    try {
      const updateData: any = {};
      if (mission.name) updateData.name = mission.name;
      if (mission.type) updateData.type = mission.type;
      if (mission.status) updateData.status = mission.status;
      if (mission.priority) updateData.priority = mission.priority;
      if (mission.description !== undefined) updateData.description = mission.description;
      if (mission.location) {
        updateData.location_lat = mission.location.lat;
        updateData.location_lng = mission.location.lng;
      }
      if (mission.assignedVesselId !== undefined) updateData.assigned_vessel_id = mission.assignedVesselId;
      if (mission.assignedAgents) updateData.assigned_agents = mission.assignedAgents;
      if (mission.startTime) updateData.start_time = mission.startTime;
      if (mission.endTime !== undefined) updateData.end_time = mission.endTime;
      if (mission.metadata) updateData.metadata = mission.metadata;

      const { data, error } = await supabase
        .from("missions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToMission(data);
    } catch (error) {
      console.error("Error updating mission:", error);
      throw error;
    }
  }

  async deleteMission(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("missions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting mission:", error);
      throw error;
    }
  }

  async getMissions(filters?: { 
    status?: string; 
    type?: string;
    priority?: string;
    dateFrom?: string; 
    dateTo?: string;
  }): Promise<Mission[]> {
    try {
      let query = supabase
        .from("missions")
        .select("*")
        .order("start_time", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.priority) query = query.eq("priority", filters.priority);
      if (filters?.dateFrom) query = query.gte("start_time", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("start_time", filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToMission);
    } catch (error) {
      console.error("Error fetching missions:", error);
      return [];
    }
  }

  async getMission(id: string): Promise<Mission | null> {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.mapToMission(data) : null;
    } catch (error) {
      console.error("Error fetching mission:", error);
      return null;
    }
  }

  // ==================== Mission Logs ====================

  async createLog(log: Omit<MissionLog, "id" | "createdAt">): Promise<MissionLog> {
    try {
      const { data, error } = await supabase
        .from("mission_logs")
        .insert({
          mission_id: log.missionId,
          log_type: log.logType,
          severity: log.severity,
          title: log.title,
          message: log.message,
          category: log.category,
          source_module: log.sourceModule,
          event_timestamp: log.eventTimestamp,
          metadata: log.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToLog(data);
    } catch (error) {
      console.error("Error creating mission log:", error);
      throw error;
    }
  }

  async getLogs(filters?: {
    missionId?: string;
    logType?: string;
    severity?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MissionLog[]> {
    try {
      let query = supabase
        .from("mission_logs")
        .select("*")
        .order("event_timestamp", { ascending: false });

      if (filters?.missionId) query = query.eq("mission_id", filters.missionId);
      if (filters?.logType) query = query.eq("log_type", filters.logType);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.dateFrom) query = query.gte("event_timestamp", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("event_timestamp", filters.dateTo);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToLog);
    } catch (error) {
      console.error("Error fetching mission logs:", error);
      return [];
    }
  }

  // ==================== Mission Execution ====================

  async startMissionExecution(missionId: string, simulationMode: boolean = false): Promise<MissionExecution> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error("Mission not found");

    const execution: MissionExecution = {
      id: crypto.randomUUID(),
      missionId,
      phase: "deployment",
      steps: this.generateExecutionSteps(mission),
      currentStepIndex: 0,
      startedAt: new Date().toISOString(),
      simulationMode
    };

    await this.createLog({
      missionId,
      logType: "info",
      severity: "medium",
      title: "Mission Execution Started",
      message: `Mission ${mission.name} execution initiated in ${simulationMode ? "simulation" : "live"} mode`,
      category: "Execution",
      sourceModule: "Mission Engine",
      eventTimestamp: new Date().toISOString()
    });

    return execution;
  }

  private generateExecutionSteps(mission: Mission): any[] {
    return [
      {
        id: "1",
        name: "Pre-flight Check",
        description: "Verify all systems and personnel",
        status: "pending"
      },
      {
        id: "2",
        name: "Deploy Assets",
        description: "Deploy vessels and agents",
        status: "pending"
      },
      {
        id: "3",
        name: "Execute Mission",
        description: "Perform mission objectives",
        status: "pending"
      },
      {
        id: "4",
        name: "Monitor Progress",
        description: "Track mission execution",
        status: "pending"
      },
      {
        id: "5",
        name: "Mission Debrief",
        description: "Review and document results",
        status: "pending"
      }
    ];
  }

  // ==================== Alerts ====================

  async getAlerts(missionId: string): Promise<MissionAlert[]> {
    try {
      const { data, error } = await supabase
        .from("mission_alerts")
        .select("*")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapToAlert);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  async createAlert(alert: Omit<MissionAlert, "id" | "createdAt">): Promise<MissionAlert> {
    try {
      const { data, error } = await supabase
        .from("mission_alerts")
        .insert({
          mission_id: alert.missionId,
          severity: alert.severity,
          message: alert.message,
          acknowledged: alert.acknowledged
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToAlert(data);
    } catch (error) {
      console.error("Error creating alert:", error);
      throw error;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("mission_alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id
        })
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      throw error;
    }
  }

  // ==================== Mappers ====================

  private mapToMission(data: any): Mission {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      status: data.status,
      priority: data.priority,
      description: data.description,
      location: data.location_lat && data.location_lng ? {
        lat: data.location_lat,
        lng: data.location_lng,
        name: data.location_name
      } : undefined,
      assignedVesselId: data.assigned_vessel_id,
      assignedAgents: data.assigned_agents || [],
      startTime: data.start_time,
      endTime: data.end_time,
      metadata: data.metadata || {},
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapToLog(data: any): MissionLog {
    return {
      id: data.id,
      missionId: data.mission_id,
      logType: data.log_type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      category: data.category,
      sourceModule: data.source_module,
      eventTimestamp: data.event_timestamp,
      metadata: data.metadata || {},
      createdAt: data.created_at
    };
  }

  private mapToAlert(data: any): MissionAlert {
    return {
      id: data.id,
      missionId: data.mission_id,
      severity: data.severity,
      message: data.message,
      acknowledged: data.acknowledged,
      acknowledgedAt: data.acknowledged_at,
      acknowledgedBy: data.acknowledged_by,
      createdAt: data.created_at
    };
  }
}

export const missionEngineService = new MissionEngineService();
