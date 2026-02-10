/**
 * Travel Booking Service - Enterprise Travel Management
 * Serviço centralizado para reservas de viagens corporativas
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type {
  TravelRequest,
  FlightSegment,
  HotelSegment,
  CarRentalSegment,
  TransferSegment,
  CabinClass,
  BookingStatus
} from "../types/travel-types";

// ========================================
// FLIGHT SEARCH & BOOKING
// ========================================

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  cabinClass: CabinClass;
  tripType: 'oneway' | 'roundtrip' | 'multicity';
  flexibleDates?: boolean;
  maxStops?: number;
  preferredAirlines?: string[];
  maxPrice?: number;
}

export interface FlightSearchResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    terminal?: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    terminal?: string;
    time: string;
    date: string;
  };
  duration: number; // minutes
  stops: number;
  layovers?: {
    airport: string;
    city: string;
    duration: number;
  }[];
  cabinClass: CabinClass;
  price: {
    base: number;
    taxes: number;
    total: number;
    currency: string;
  };
  seatsAvailable: number;
  baggage: {
    cabin: string;
    checked: string;
  };
  fareRules: {
    refundable: boolean;
    changeable: boolean;
    changesFee?: number;
  };
  amenities: string[];
  carbonOffset: number; // kg CO2
  isNegotiatedRate?: boolean;
  isLowestFare?: boolean;
  isPolicyCompliant?: boolean;
}

export interface HotelSearchParams {
  city: string;
  coordinates?: { lat: number; lng: number };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  starRating?: number[];
  maxPrice?: number;
  amenities?: string[];
  preferredChains?: string[];
}

export interface HotelSearchResult {
  id: string;
  name: string;
  chain?: string;
  starRating: number;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  distance?: number; // km from search point
  price: {
    perNight: number;
    total: number;
    currency: string;
  };
  roomType: string;
  bedType: string;
  mealPlan: string;
  amenities: string[];
  photos: string[];
  rating: {
    score: number;
    count: number;
    highlights: string[];
  };
  cancellation: {
    policy: 'free' | 'partial' | 'non_refundable';
    deadline?: string;
  };
  isNegotiatedRate?: boolean;
  isPolicyCompliant?: boolean;
}

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: Date;
  pickupTime: string;
  dropoffDate: Date;
  dropoffTime: string;
  category?: string[];
  transmission?: 'automatic' | 'manual';
}

export interface CarSearchResult {
  id: string;
  provider: string;
  category: string;
  vehicleModel: string;
  transmission: string;
  fuelType: string;
  passengers: number;
  bags: number;
  price: {
    perDay: number;
    total: number;
    currency: string;
  };
  mileage: 'unlimited' | 'limited';
  mileageLimit?: number;
  insurance: {
    included: boolean;
    type: string[];
  };
  features: string[];
  pickupLocation: string;
  dropoffLocation: string;
  isPolicyCompliant?: boolean;
}

class TravelBookingService {
  
  // ========================================
  // FLIGHT OPERATIONS
  // ========================================
  
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult[]> {
    try {
      logger.info("Searching flights", { params });
      
      // In production, this would call a GDS API (Amadeus, Sabre, Travelport)
      // Fallback: simulated GDS API response (no backend table for flight search)
      
      const fallbackResults: FlightSearchResult[] = [
        {
          id: "FL001",
          airline: "LATAM Airlines",
          airlineCode: "LA",
          flightNumber: "LA3421",
          departure: {
            airport: params.origin,
            city: this.getAirportCity(params.origin),
            time: "06:30",
            date: params.departureDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: params.destination,
            city: this.getAirportCity(params.destination),
            time: "07:15",
            date: params.departureDate.toISOString().split('T')[0]
          },
          duration: 45,
          stops: 0,
          cabinClass: params.cabinClass,
          price: { base: 750, taxes: 142, total: 892, currency: "BRL" },
          seatsAvailable: 12,
          baggage: { cabin: "1x10kg", checked: "1x23kg" },
          fareRules: { refundable: true, changeable: true, changesFee: 150 },
          amenities: ["wifi", "meal", "entertainment"],
          carbonOffset: 45,
          isNegotiatedRate: true,
          isLowestFare: false,
          isPolicyCompliant: true
        },
        {
          id: "FL002",
          airline: "Gol Linhas Aéreas",
          airlineCode: "G3",
          flightNumber: "G31045",
          departure: {
            airport: params.origin,
            city: this.getAirportCity(params.origin),
            time: "08:15",
            date: params.departureDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: params.destination,
            city: this.getAirportCity(params.destination),
            time: "09:00",
            date: params.departureDate.toISOString().split('T')[0]
          },
          duration: 45,
          stops: 0,
          cabinClass: params.cabinClass,
          price: { base: 680, taxes: 135, total: 815, currency: "BRL" },
          seatsAvailable: 8,
          baggage: { cabin: "1x10kg", checked: "1x23kg" },
          fareRules: { refundable: false, changeable: true, changesFee: 200 },
          amenities: ["wifi"],
          carbonOffset: 48,
          isNegotiatedRate: false,
          isLowestFare: true,
          isPolicyCompliant: true
        },
        {
          id: "FL003",
          airline: "Azul Linhas Aéreas",
          airlineCode: "AD",
          flightNumber: "AD4521",
          departure: {
            airport: params.origin,
            city: this.getAirportCity(params.origin),
            time: "10:30",
            date: params.departureDate.toISOString().split('T')[0]
          },
          arrival: {
            airport: params.destination,
            city: this.getAirportCity(params.destination),
            time: "11:20",
            date: params.departureDate.toISOString().split('T')[0]
          },
          duration: 50,
          stops: 0,
          cabinClass: params.cabinClass,
          price: { base: 920, taxes: 165, total: 1085, currency: "BRL" },
          seatsAvailable: 4,
          baggage: { cabin: "1x10kg", checked: "2x23kg" },
          fareRules: { refundable: true, changeable: true },
          amenities: ["wifi", "meal", "entertainment", "power"],
          carbonOffset: 52,
          isNegotiatedRate: true,
          isLowestFare: false,
          isPolicyCompliant: true
        }
      ];
      
      // Apply filters
      let results = fallbackResults;
      
      if (params.maxStops !== undefined) {
        results = results.filter(f => f.stops <= params.maxStops!);
      }
      
      if (params.maxPrice) {
        results = results.filter(f => f.price.total <= params.maxPrice!);
      }
      
      if (params.preferredAirlines?.length) {
        results = results.sort((a, b) => {
          const aPreferred = params.preferredAirlines!.includes(a.airlineCode) ? -1 : 1;
          const bPreferred = params.preferredAirlines!.includes(b.airlineCode) ? -1 : 1;
          return aPreferred - bPreferred;
        });
      }
      
      return results;
    } catch (error) {
      logger.error("Error searching flights", error);
      throw error;
    }
  }
  
  async bookFlight(flightId: string, passengers: { name: string; document: string }[]): Promise<string> {
    try {
      logger.info("Booking flight", { flightId, passengers: passengers.length });
      
      // Generate booking reference
      const bookingRef = `TRV${Date.now().toString(36).toUpperCase()}`;
      
      // In production, this would create the actual booking via GDS API
      // and store the booking in the database
      
      return bookingRef;
    } catch (error) {
      logger.error("Error booking flight", error);
      throw error;
    }
  }
  
  // ========================================
  // HOTEL OPERATIONS
  // ========================================
  
  async searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    try {
      logger.info("Searching hotels", { params });
      
      const nights = Math.ceil(
        (params.checkOut.getTime() - params.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const fallbackResults: HotelSearchResult[] = [
        {
          id: "HT001",
          name: "Macaé Business Hotel",
          chain: "Atlantica Hotels",
          starRating: 4,
          address: "Av. Atlântica, 1250",
          city: params.city,
          coordinates: { lat: -22.3847, lng: -41.7833 },
          distance: 0.5,
          price: { perNight: 320, total: 320 * nights, currency: "BRL" },
          roomType: "Superior Duplo",
          bedType: "Queen",
          mealPlan: "breakfast",
          amenities: ["wifi", "parking", "gym", "pool", "restaurant", "ac"],
          photos: [],
          rating: { score: 8.7, count: 1245, highlights: ["Localização", "Café da manhã"] },
          cancellation: { policy: "free", deadline: "24h antes" },
          isNegotiatedRate: true,
          isPolicyCompliant: true
        },
        {
          id: "HT002",
          name: "Offshore Plaza Hotel",
          chain: "Accor",
          starRating: 5,
          address: "Rua das Palmeiras, 450",
          city: params.city,
          coordinates: { lat: -22.3820, lng: -41.7810 },
          distance: 1.2,
          price: { perNight: 485, total: 485 * nights, currency: "BRL" },
          roomType: "Executivo",
          bedType: "King",
          mealPlan: "breakfast",
          amenities: ["wifi", "parking", "gym", "pool", "spa", "restaurant", "ac", "minibar"],
          photos: [],
          rating: { score: 9.2, count: 856, highlights: ["Serviço", "Conforto", "Limpeza"] },
          cancellation: { policy: "free", deadline: "48h antes" },
          isNegotiatedRate: true,
          isPolicyCompliant: false // Over price limit
        },
        {
          id: "HT003",
          name: "Hotel Beira Mar",
          starRating: 3,
          address: "Av. Beira Mar, 780",
          city: params.city,
          coordinates: { lat: -22.3900, lng: -41.7850 },
          distance: 2.0,
          price: { perNight: 185, total: 185 * nights, currency: "BRL" },
          roomType: "Standard Duplo",
          bedType: "Twin",
          mealPlan: "breakfast",
          amenities: ["wifi", "parking", "restaurant", "ac"],
          photos: [],
          rating: { score: 7.8, count: 2134, highlights: ["Preço", "Localização"] },
          cancellation: { policy: "partial" },
          isNegotiatedRate: false,
          isPolicyCompliant: true
        }
      ];
      
      // Apply filters
      let results = fallbackResults;
      
      if (params.starRating?.length) {
        results = results.filter(h => params.starRating!.includes(h.starRating));
      }
      
      if (params.maxPrice) {
        results = results.filter(h => h.price.perNight <= params.maxPrice!);
      }
      
      if (params.preferredChains?.length) {
        results = results.sort((a, b) => {
          const aPreferred = a.chain && params.preferredChains!.includes(a.chain) ? -1 : 1;
          const bPreferred = b.chain && params.preferredChains!.includes(b.chain) ? -1 : 1;
          return aPreferred - bPreferred;
        });
      }
      
      return results;
    } catch (error) {
      logger.error("Error searching hotels", error);
      throw error;
    }
  }
  
  async bookHotel(hotelId: string, guestDetails: { name: string; email: string }): Promise<string> {
    try {
      logger.info("Booking hotel", { hotelId, guest: guestDetails.name });
      
      const bookingRef = `HTL${Date.now().toString(36).toUpperCase()}`;
      
      return bookingRef;
    } catch (error) {
      logger.error("Error booking hotel", error);
      throw error;
    }
  }
  
  // ========================================
  // CAR RENTAL OPERATIONS
  // ========================================
  
  async searchCars(params: CarSearchParams): Promise<CarSearchResult[]> {
    try {
      logger.info("Searching car rentals", { params });
      
      const days = Math.ceil(
        (params.dropoffDate.getTime() - params.pickupDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const fallbackResults: CarSearchResult[] = [
        {
          id: "CAR001",
          provider: "Localiza",
          category: "Standard",
          vehicleModel: "VW Virtus",
          transmission: "automatic",
          fuelType: "flex",
          passengers: 5,
          bags: 2,
          price: { perDay: 145, total: 145 * days, currency: "BRL" },
          mileage: "unlimited",
          insurance: { included: true, type: ["CDW", "TPL"] },
          features: ["ac", "bluetooth"],
          pickupLocation: params.pickupLocation,
          dropoffLocation: params.dropoffLocation || params.pickupLocation,
          isPolicyCompliant: true
        },
        {
          id: "CAR002",
          provider: "Movida",
          category: "SUV",
          vehicleModel: "Jeep Renegade",
          transmission: "automatic",
          fuelType: "flex",
          passengers: 5,
          bags: 3,
          price: { perDay: 220, total: 220 * days, currency: "BRL" },
          mileage: "unlimited",
          insurance: { included: true, type: ["CDW", "TPL", "PAI"] },
          features: ["ac", "bluetooth", "gps", "4x4"],
          pickupLocation: params.pickupLocation,
          dropoffLocation: params.dropoffLocation || params.pickupLocation,
          isPolicyCompliant: true
        }
      ];
      
      return fallbackResults;
    } catch (error) {
      logger.error("Error searching cars", error);
      throw error;
    }
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private getAirportCity(code: string): string {
    const airports: Record<string, string> = {
      'GIG': 'Rio de Janeiro',
      'GRU': 'São Paulo',
      'MCE': 'Macaé',
      'VCP': 'Campinas',
      'SDU': 'Rio de Janeiro',
      'SSA': 'Salvador',
      'VIX': 'Vitória',
      'BSB': 'Brasília'
    };
    return airports[code] || code;
  }
  
  // ========================================
  // TRAVEL REQUEST OPERATIONS
  // ========================================
  
  async createTravelRequest(request: Partial<TravelRequest>): Promise<TravelRequest> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");
      
      const requestNumber = `TRQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // For now, return a mock created request
      // In production, this would insert into the database
      const createdRequest: TravelRequest = {
        id: crypto.randomUUID(),
        requestNumber,
        organizationId: request.organizationId || '',
        status: 'draft',
        purpose: request.purpose || '',
        tripType: request.tripType || 'administrative',
        priority: request.priority || 'medium',
        traveler: request.traveler || {
          id: userData.user.id,
          name: '',
          email: userData.user.email || '',
          phone: '',
          department: '',
          position: '',
          employeeId: ''
        },
        requester: request.requester || {
          id: userData.user.id,
          name: '',
          department: ''
        },
        segments: request.segments || [],
        estimatedCost: request.estimatedCost || 0,
        currency: 'BRL',
        policyCompliance: request.policyCompliance || {
          status: 'compliant',
          violations: []
        },
        approvalChain: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      logger.info("Created travel request", { requestNumber });
      
      return createdRequest;
    } catch (error) {
      logger.error("Error creating travel request", error);
      throw error;
    }
  }
  
  async submitForApproval(requestId: string): Promise<void> {
    try {
      logger.info("Submitting travel request for approval", { requestId });
      
      // In production, this would:
      // 1. Validate the request
      // 2. Check policy compliance
      // 3. Determine approval chain
      // 4. Update status and notify approvers
      
    } catch (error) {
      logger.error("Error submitting for approval", error);
      throw error;
    }
  }
  
  async approveTravelRequest(requestId: string, approverId: string, decision: 'approve' | 'reject', comments?: string): Promise<void> {
    try {
      logger.info("Processing approval decision", { requestId, decision });
      
      // In production, this would:
      // 1. Validate approver permissions
      // 2. Record the decision
      // 3. Move to next approver or finalize
      // 4. Notify relevant parties
      
    } catch (error) {
      logger.error("Error processing approval", error);
      throw error;
    }
  }
}

export const travelBookingService = new TravelBookingService();
export default travelBookingService;
