/**
 * PATCH 269 - Satellite Events Service
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface SatelliteEvent {
  id?: string;
  satelliteId: string;
  noradId: number;
  eventType: "position_update" | "orbit_change" | "signal_loss" | "signal_restore" | "anomaly";
  eventData: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: string;
}

export class SatelliteEventsService {
  
  async logEvent(event: SatelliteEvent): Promise<SatelliteEvent | null> {
    try {
      const { data, error } = await (supabase.from as Function)("satellite_events")
        .insert({
          satellite_id: event.satelliteId,
          norad_id: event.noradId,
          event_type: event.eventType,
          event_data: event.eventData,
          latitude: event.latitude,
          longitude: event.longitude,
          altitude: event.altitude
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToEvent(data);
    } catch (error) {
      logger.error("Error logging satellite event:", error);
      return null;
    }
  }

  async getEvents(satelliteId?: string, limit: number = 100): Promise<SatelliteEvent[]> {
    try {
      let query = supabase
        .from("satellite_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (satelliteId) {
        query = query.eq("satellite_id", satelliteId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapToEvent);
    } catch (error) {
      logger.error("Error fetching satellite events:", error);
      return [];
    }
  }

  async getEventsByNoradId(noradId: number, limit: number = 50): Promise<SatelliteEvent[]> {
    try {
      const { data, error } = await supabase
        .from("satellite_events")
        .select("*")
        .eq("norad_id", noradId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(this.mapToEvent);
    } catch (error) {
      logger.error("Error fetching events by NORAD ID:", error);
      return [];
    }
  }

  async getEventsByType(eventType: string, limit: number = 100): Promise<SatelliteEvent[]> {
    try {
      const { data, error } = await supabase
        .from("satellite_events")
        .select("*")
        .eq("event_type", eventType)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(this.mapToEvent);
    } catch (error) {
      logger.error("Error fetching events by type:", error);
      return [];
    }
  }

  private mapToEvent(data: Record<string, unknown>): SatelliteEvent {
    return {
      id: String(data.id),
      satelliteId: String(data.satellite_id),
      noradId: Number(data.norad_id),
      eventType: String(data.event_type) as SatelliteEvent["eventType"],
      eventData: (data.event_data as Record<string, unknown>) || {},
      latitude: data.latitude != null ? Number(data.latitude) : undefined,
      longitude: data.longitude != null ? Number(data.longitude) : undefined,
      altitude: data.altitude != null ? Number(data.altitude) : undefined,
      timestamp: data.timestamp ? String(data.timestamp) : undefined
    };
  }
}

export const satelliteEventsService = new SatelliteEventsService();
