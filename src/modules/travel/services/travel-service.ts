/**
 * PATCH 267 - Travel Management Service
 */

import { supabase } from "@/integrations/supabase/client";

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
  metadata?: Record<string, any>;
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
  details?: Record<string, any>;
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
      console.error("Error creating itinerary:", error);
      throw error;
    }
  }

  async updateItinerary(id: string, itinerary: Partial<TravelItinerary>): Promise<TravelItinerary> {
    try {
      const updateData: any = {};
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
      console.error("Error updating itinerary:", error);
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
      console.error("Error deleting itinerary:", error);
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
      console.error("Error fetching itineraries:", error);
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
      console.error("Error creating price alert:", error);
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
      console.error("Error fetching price alerts:", error);
      return [];
    }
  }

  private async logEvent(itineraryId: string, eventType: string, eventData: any): Promise<void> {
    try {
      await supabase
        .from("travel_logs")
        .insert({
          itinerary_id: itineraryId,
          event_type: eventType,
          event_data: eventData
        });
    } catch (error) {
      console.error("Error logging travel event:", error);
    }
  }

  private mapToItinerary(data: any): TravelItinerary {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      tripName: data.trip_name,
      origin: data.origin,
      destination: data.destination,
      departureDate: data.departure_date,
      returnDate: data.return_date,
      segments: data.segments || [],
      totalCost: data.total_cost,
      status: data.status,
      bookingReference: data.booking_reference,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapToPriceAlert(data: any): PriceAlert {
    return {
      id: data.id,
      userId: data.user_id,
      route: data.route,
      targetPrice: data.target_price,
      currentPrice: data.current_price,
      alertTriggered: data.alert_triggered,
      lastCheckedAt: data.last_checked_at,
      createdAt: data.created_at
    };
  }
}

export const travelService = new TravelService();
