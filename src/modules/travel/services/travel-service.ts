/**
 * PATCH 267 - Travel Management Service
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface TravelItinerary {
  id?: string;
  userId?: string;
  organizationId?: string;
  tripName: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  segments: TravelSegment[];
  totalCost?: number;
  status: "draft" | "confirmed" | "in-progress" | "completed" | "cancelled";
  bookingReference?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TravelSegment {
  type: "flight" | "hotel" | "transport" | "activity";
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  cost?: number;
  bookingReference?: string;
  details?: Record<string, unknown>;
}

export interface PriceAlert {
  id?: string;
  userId?: string;
  route: string;
  targetPrice: number;
  currentPrice?: number;
  alertTriggered?: boolean;
  lastCheckedAt?: string;
  createdAt?: string;
}

export class TravelService {
  
  async createItinerary(itinerary: TravelItinerary): Promise<TravelItinerary> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("travel_itineraries")
        .insert({
          organization_id: itinerary.organizationId,
          trip_name: itinerary.tripName,
          origin: itinerary.origin,
          destination: itinerary.destination,
          departure_date: itinerary.departureDate,
          return_date: itinerary.returnDate,
          segments: itinerary.segments,
          total_cost: itinerary.totalCost,
          status: itinerary.status,
          booking_reference: itinerary.bookingReference,
          metadata: itinerary.metadata || {}
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Log the creation event
      await this.logEvent(data.id, "itinerary_created", { itinerary: data });

      return this.mapToItinerary(data);
    } catch (error) {
      logger.error("Error creating itinerary:", error);
      throw error;
    }
  }

  async updateItinerary(id: string, itinerary: Partial<TravelItinerary>): Promise<TravelItinerary> {
    try {
      const updateData: Record<string, unknown> = {};
      if (itinerary.tripName) updateData.trip_name = itinerary.tripName;
      if (itinerary.origin) updateData.origin = itinerary.origin;
      if (itinerary.destination) updateData.destination = itinerary.destination;
      if (itinerary.departureDate) updateData.departure_date = itinerary.departureDate;
      if (itinerary.returnDate !== undefined) updateData.return_date = itinerary.returnDate;
      if (itinerary.segments) updateData.segments = itinerary.segments;
      if (itinerary.totalCost !== undefined) updateData.total_cost = itinerary.totalCost;
      if (itinerary.status) updateData.status = itinerary.status;
      if (itinerary.bookingReference !== undefined) updateData.booking_reference = itinerary.bookingReference;
      if (itinerary.metadata) updateData.metadata = itinerary.metadata;

      const { data, error } = await supabase
        .from("travel_itineraries")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await this.logEvent(id, "itinerary_updated", { changes: updateData });

      return this.mapToItinerary(data);
    } catch (error) {
      logger.error("Error updating itinerary:", error);
      throw error;
    }
  }

  async deleteItinerary(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("travel_itineraries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting itinerary:", error);
      throw error;
    }
  }

  async getItineraries(): Promise<TravelItinerary[]> {
    try {
      const { data, error } = await supabase
        .from("travel_itineraries")
        .select("*")
        .order("departure_date", { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapToItinerary);
    } catch (error) {
      logger.error("Error fetching itineraries:", error);
      return [];
    }
  }

  async createPriceAlert(alert: PriceAlert): Promise<PriceAlert> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("travel_price_alerts")
        .insert({
          route: alert.route,
          target_price: alert.targetPrice,
          current_price: alert.currentPrice,
          alert_type: "price_drop",
          is_active: true
        } as any)
        .select()
        .single();

      if (error) throw error;
      return this.mapToPriceAlert(data);
    } catch (error) {
      logger.error("Error creating price alert:", error);
      throw error;
    }
  }

  async getPriceAlerts(): Promise<PriceAlert[]> {
    try {
      const { data, error } = await supabase
        .from("travel_price_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapToPriceAlert);
    } catch (error) {
      logger.error("Error fetching price alerts:", error);
      return [];
    }
  }

  private async logEvent(itineraryId: string, eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
      await supabase
        .from("travel_logs")
        .insert({
          itinerary_id: itineraryId,
          event_type: eventType,
          event_data: eventData as unknown as import("@/integrations/supabase/types").Json
        });
    } catch (error) {
      logger.error("Error logging travel event:", error);
    }
  }

  private mapToItinerary(data: Record<string, unknown>): TravelItinerary {
    return {
      id: String(data.id || ""),
      userId: data.user_id ? String(data.user_id) : undefined,
      organizationId: data.organization_id ? String(data.organization_id) : undefined,
      tripName: String(data.trip_name || ""),
      origin: String(data.origin || ""),
      destination: String(data.destination || ""),
      departureDate: String(data.departure_date || ""),
      returnDate: data.return_date ? String(data.return_date) : undefined,
      segments: (data.segments as TravelSegment[]) || [],
      totalCost: data.total_cost != null ? Number(data.total_cost) : undefined,
      status: String(data.status || "draft") as TravelItinerary["status"],
      bookingReference: data.booking_reference ? String(data.booking_reference) : undefined,
      metadata: (data.metadata as Record<string, unknown>) || {},
      createdAt: data.created_at ? String(data.created_at) : undefined,
      updatedAt: data.updated_at ? String(data.updated_at) : undefined
    };
  }

  private mapToPriceAlert(data: Record<string, unknown>): PriceAlert {
    return {
      id: String(data.id),
      userId: data.user_id as string | undefined,
      route: String(data.route),
      targetPrice: Number(data.target_price),
      currentPrice: data.current_price as number | undefined,
      alertTriggered: data.alert_triggered as boolean | undefined,
      lastCheckedAt: data.last_checked_at as string | undefined,
      createdAt: data.created_at as string | undefined
    };
  }
}

export const travelService = new TravelService();
