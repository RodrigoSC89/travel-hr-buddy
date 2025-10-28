// @ts-nocheck
/**
 * PATCH 427 - Drone Commander Service
 */

import { supabase } from "@/integrations/supabase/client";
import type { DroneStatus, DroneFlight, DroneTask, DroneCommand } from "../types";

export class DroneCommanderService {
  
  // ==================== Drone Management ====================
  
  async getDrones(): Promise<DroneStatus[]> {
    try {
      const { data, error } = await supabase
        .from("drones")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data || []).map(this.mapToDrone);
    } catch (error) {
      console.error("Error fetching drones:", error);
      return [];
    }
  }

  async getDrone(id: string): Promise<DroneStatus | null> {
    try {
      const { data, error } = await supabase
        .from("drones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.mapToDrone(data) : null;
    } catch (error) {
      console.error("Error fetching drone:", error);
      return null;
    }
  }

  async updateDroneStatus(id: string, status: Partial<DroneStatus>): Promise<void> {
    try {
      const updateData: any = {};
      if (status.status) updateData.status = status.status;
      if (status.position) {
        updateData.latitude = status.position.latitude;
        updateData.longitude = status.position.longitude;
        updateData.altitude = status.position.altitude;
        updateData.heading = status.position.heading;
      }
      if (status.battery !== undefined) updateData.battery = status.battery;
      if (status.signal !== undefined) updateData.signal = status.signal;
      if (status.speed !== undefined) updateData.speed = status.speed;
      updateData.last_update = new Date().toISOString();

      const { error } = await supabase
        .from("drones")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating drone status:", error);
      throw error;
    }
  }

  // ==================== Flight Management ====================

  async createFlight(flight: Omit<DroneFlight, "id" | "createdAt">): Promise<DroneFlight> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("drone_flights")
        .insert({
          drone_id: flight.droneId,
          name: flight.name,
          status: flight.status,
          scheduled_start: flight.scheduledStart,
          scheduled_end: flight.scheduledEnd,
          actual_start: flight.actualStart,
          actual_end: flight.actualEnd,
          waypoints: flight.waypoints,
          trajectory: flight.trajectory || [],
          metadata: flight.metadata || {},
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToFlight(data);
    } catch (error) {
      console.error("Error creating flight:", error);
      throw error;
    }
  }

  async getFlights(filters?: { droneId?: string; status?: string }): Promise<DroneFlight[]> {
    try {
      let query = supabase
        .from("drone_flights")
        .select("*")
        .order("scheduled_start", { ascending: false });

      if (filters?.droneId) query = query.eq("drone_id", filters.droneId);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToFlight);
    } catch (error) {
      console.error("Error fetching flights:", error);
      return [];
    }
  }

  async updateFlight(id: string, flight: Partial<DroneFlight>): Promise<void> {
    try {
      const updateData: any = {};
      if (flight.status) updateData.status = flight.status;
      if (flight.actualStart) updateData.actual_start = flight.actualStart;
      if (flight.actualEnd) updateData.actual_end = flight.actualEnd;
      if (flight.trajectory) updateData.trajectory = flight.trajectory;

      const { error } = await supabase
        .from("drone_flights")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating flight:", error);
      throw error;
    }
  }

  // ==================== Task Management ====================

  async createTask(task: Omit<DroneTask, "id">): Promise<DroneTask> {
    try {
      const { data, error } = await supabase
        .from("drone_tasks")
        .insert({
          drone_id: task.droneId,
          flight_id: task.flightId,
          type: task.type,
          priority: task.priority,
          status: task.status,
          assigned_at: task.assignedAt,
          completed_at: task.completedAt,
          result: task.result,
          metadata: task.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToTask(data);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async getTasks(filters?: { droneId?: string; status?: string }): Promise<DroneTask[]> {
    try {
      let query = supabase
        .from("drone_tasks")
        .select("*")
        .order("assigned_at", { ascending: false });

      if (filters?.droneId) query = query.eq("drone_id", filters.droneId);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToTask);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  // ==================== Command Management ====================

  async sendCommand(droneId: string, commandType: string, parameters?: any): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("drone_commands")
        .insert({
          drone_id: droneId,
          type: commandType,
          timestamp: new Date().toISOString(),
          parameters: parameters || {},
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate command execution (in real system this would be handled by drone controller)
      setTimeout(async () => {
        await supabase
          .from("drone_commands")
          .update({ status: "completed" })
          .eq("id", data.id);
      }, 2000);
    } catch (error) {
      console.error("Error sending command:", error);
      throw error;
    }
  }

  // ==================== Mappers ====================

  private mapToDrone(data: any): DroneStatus {
    return {
      id: data.id,
      name: data.name,
      status: data.status,
      position: {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        heading: data.heading
      },
      battery: data.battery,
      signal: data.signal,
      speed: data.speed,
      altitude: data.altitude,
      connectedSince: data.connected_since,
      lastUpdate: data.last_update,
      activeFlightId: data.active_flight_id,
      metadata: data.metadata || {}
    };
  }

  private mapToFlight(data: any): DroneFlight {
    return {
      id: data.id,
      droneId: data.drone_id,
      name: data.name,
      status: data.status,
      scheduledStart: data.scheduled_start,
      scheduledEnd: data.scheduled_end,
      actualStart: data.actual_start,
      actualEnd: data.actual_end,
      waypoints: data.waypoints || [],
      trajectory: data.trajectory || [],
      metadata: data.metadata || {},
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  private mapToTask(data: any): DroneTask {
    return {
      id: data.id,
      droneId: data.drone_id,
      flightId: data.flight_id,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assignedAt: data.assigned_at,
      completedAt: data.completed_at,
      result: data.result,
      metadata: data.metadata || {}
    };
  }

  // ==================== Fleet Logs (PATCH 451) ====================

  async logFleetEvent(event: {
    droneId: string;
    eventType: string;
    severity: "info" | "warning" | "error" | "critical";
    message: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from("drone_fleet_logs")
        .insert({
          drone_id: event.droneId,
          event_type: event.eventType,
          severity: event.severity,
          message: event.message,
          timestamp: new Date().toISOString(),
          metadata: event.metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging fleet event:", error);
      throw error;
    }
  }

  async getFleetLogs(filters?: {
    droneId?: string;
    severity?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from("drone_fleet_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters?.droneId) query = query.eq("drone_id", filters.droneId);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching fleet logs:", error);
      return [];
    }
  }
}

export const droneCommanderService = new DroneCommanderService();
