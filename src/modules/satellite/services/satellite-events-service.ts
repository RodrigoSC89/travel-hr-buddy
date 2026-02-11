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
  eventData: Record<string, any>;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: string;
}

export class SatelliteEventsService {
  
  async logEvent(event: SatelliteEvent): Promise<SatelliteEvent | null> {
    try {
      const { data, error } = await supabase
        .from("satellite_events")
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic Supabase row shape
  private mapToEvent(data: Record<string, any>): SatelliteEvent {
    return {
      id: data.id,
      satelliteId: data.satellite_id,
      noradId: data.norad_id,
      eventType: data.event_type,
      eventData: data.event_data || {},
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      timestamp: data.timestamp
    };
  }
}

export const satelliteEventsService = new SatelliteEventsService();
