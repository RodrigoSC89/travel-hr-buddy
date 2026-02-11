/**
 * Travel Command Integrations Service
 * Integrações com GDS, provedores de reservas, cartões corporativos e sistemas externos
 */

import { logger } from "@/lib/logger";

// ========================================
// GDS INTEGRATION (Global Distribution Systems)
// ========================================

export interface GDSConfig {
  provider: "amadeus" | "sabre" | "travelport";
  apiKey: string;
  apiSecret: string;
  environment: "test" | "production";
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
  directOnly?: boolean;
  maxPrice?: number;
}

export interface FlightOffer {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: {
    amount: number;
    currency: string;
  };
  cabinClass: string;
  seatsAvailable: number;
  refundable: boolean;
  changeable: boolean;
  baggage: {
    cabin: string;
    checked: string;
  };
}

export class GDSIntegrationService {
  private config: GDSConfig | null = null;

  configure(config: GDSConfig): void {
    this.config = config;
    logger.info(`GDS configured: ${config.provider}`);
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    if (!this.config) {
      logger.warn("GDS not configured, returning mock data");
      return this.getMockFlights(params);
    }

    try {
      // This would integrate with actual GDS APIs
      // For now, return mock data
      return this.getMockFlights(params);
    } catch (error) {
      logger.error("GDS flight search error:", error);
      return [];
    }
  }

  private getMockFlights(params: FlightSearchParams): FlightOffer[] {
    const airlines = ["LATAM", "Gol", "Azul", "American", "United"];
    const offers: FlightOffer[] = [];
    const basePrices = [850, 1020, 1180, 1340, 1500];

    for (let i = 0; i < 5; i++) {
      const airline = airlines[i % airlines.length];
      const basePrice = basePrices[i];
      
      offers.push({
        id: `FL-${Date.now()}-${i}`,
        airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
        origin: params.origin,
        destination: params.destination,
        departureTime: `${8 + i * 2}:00`,
        arrivalTime: `${10 + i * 2}:30`,
        duration: "2h 30m",
        stops: i % 3 === 0 ? 0 : 1,
        price: {
          amount: basePrice,
          currency: "BRL"
        },
        cabinClass: params.cabinClass || "economy",
        seatsAvailable: 5 + (i * 4),
        refundable: i % 2 === 0,
        changeable: true,
        baggage: {
          cabin: "1 mala 10kg",
          checked: "1 mala 23kg"
        }
      });
    }

    return offers.sort((a, b) => a.price.amount - b.price.amount);
  }

  async bookFlight(offerId: string, passengers: Record<string, unknown>[]): Promise<{ confirmationNumber: string; status: string }> {
    // This would integrate with actual GDS booking APIs
    const confirmationNumber = `BK${Date.now().toString().slice(-8)}`;
    logger.info(`Flight booked: ${confirmationNumber}`);
    return { confirmationNumber, status: "confirmed" };
  }
}

// ========================================
// HOTEL PROVIDER INTEGRATION
// ========================================

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  starRating?: number[];
  maxPrice?: number;
  amenities?: string[];
}

export interface HotelOffer {
  id: string;
  name: string;
  chain?: string;
  address: string;
  coordinates: { lat: number; lng: number };
  starRating: number;
  guestRating: number;
  reviewCount: number;
  price: {
    amount: number;
    currency: string;
    perNight: number;
  };
  roomType: string;
  amenities: string[];
  images: string[];
  cancellationPolicy: string;
  breakfast: boolean;
  wifi: boolean;
  parking: boolean;
}

export class HotelProviderService {
  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    // This would integrate with hotel APIs (Booking.com, Expedia, etc.)
    return this.getMockHotels(params);
  }

  private getMockHotels(params: HotelSearchParams): HotelOffer[] {
    const hotels = [
      { name: "Business Hotel", chain: "Atlantica", stars: 4 },
      { name: "Executive Suites", chain: "Accor", stars: 5 },
      { name: "Central Plaza", chain: "IHG", stars: 4 },
      { name: "Harbor View", chain: null, stars: 3 },
      { name: "Airport Inn", chain: "Marriott", stars: 4 }
    ];
    const perNightPrices = [220, 380, 260, 180, 310];

    return hotels.map((hotel, i) => ({
      id: `HTL-${Date.now()}-${i}`,
      name: `${params.location} ${hotel.name}`,
      chain: hotel.chain || undefined,
      address: `Av. Principal, ${100 + i * 50} - ${params.location}`,
      coordinates: { lat: -22.9 + i * 0.01, lng: -43.2 + i * 0.01 },
      starRating: hotel.stars,
      guestRating: 8.2 + i * 0.3,
      reviewCount: 150 + i * 100,
      price: {
        amount: perNightPrices[i] * (params.rooms || 1),
        currency: "BRL",
        perNight: perNightPrices[i]
      },
      roomType: i % 2 === 0 ? "Quarto Standard" : "Quarto Superior",
      amenities: ["WiFi", "AC", "TV", "Frigobar", i % 2 === 0 ? "Café da Manhã" : "Academia"],
      images: [],
      cancellationPolicy: i % 3 === 0 ? "Não Reembolsável" : "Cancelamento Grátis até 24h",
      breakfast: i % 2 === 0,
      wifi: true,
      parking: i % 2 === 0
    }));
  }

  async bookHotel(offerId: string, guestInfo: Record<string, unknown>): Promise<{ confirmationNumber: string; status: string }> {
    const confirmationNumber = `HT${Date.now().toString().slice(-8)}`;
    logger.info(`Hotel booked: ${confirmationNumber}`);
    return { confirmationNumber, status: "confirmed" };
  }
}

// ========================================
// CORPORATE CARD INTEGRATION
// ========================================

export interface CardTransaction {
  id: string;
  cardLast4: string;
  merchantName: string;
  merchantCategory: string;
  amount: number;
  currency: string;
  date: string;
  status: "pending" | "posted" | "declined";
  expenseCategory?: string;
}

export class CorporateCardService {
  async getTransactions(cardId: string, period: { start: Date; end: Date }): Promise<CardTransaction[]> {
    // This would integrate with Visa, Mastercard, Amex, Brex APIs
    return this.getMockTransactions();
  }

  private getMockTransactions(): CardTransaction[] {
    const merchants = [
      { name: "LATAM Airlines", category: "Airlines" },
      { name: "Hotel Atlantica", category: "Lodging" },
      { name: "Uber", category: "Transportation" },
      { name: "Restaurante Executivo", category: "Restaurants" },
      { name: "Posto Shell", category: "Fuel" }
    ];
    const amounts = [850, 420, 65, 180, 250];

    return merchants.map((merchant, i) => ({
      id: `TXN-${Date.now()}-${i}`,
      cardLast4: "4242",
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      amount: amounts[i],
      currency: "BRL",
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      status: "posted" as const,
      expenseCategory: merchant.category.toLowerCase()
    }));
  }

  async matchTransactionToReceipt(transactionId: string, receiptId: string): Promise<boolean> {
    logger.info(`Matched transaction ${transactionId} to receipt ${receiptId}`);
    return true;
  }
}

// ========================================
// ACCOUNTING INTEGRATION
// ========================================

export interface AccountingEntry {
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  reference: string;
  department?: string;
  project?: string;
}

export class AccountingIntegrationService {
  async exportToAccounting(
    entries: AccountingEntry[],
    system: "quickbooks" | "xero" | "netsuite" | "sap"
  ): Promise<{ success: boolean; batchId: string }> {
    // This would integrate with accounting APIs
    const batchId = `BATCH-${Date.now()}`;
    logger.info(`Exported ${entries.length} entries to ${system}: ${batchId}`);
    return { success: true, batchId };
  }

  mapExpenseToAccount(category: string): { debit: string; credit: string } {
    const mapping: Record<string, { debit: string; credit: string }> = {
      airfare: { debit: "6110 - Passagens Aéreas", credit: "1000 - Caixa" },
      hotel: { debit: "6120 - Hospedagem", credit: "1000 - Caixa" },
      meals: { debit: "6130 - Refeições", credit: "1000 - Caixa" },
      transport: { debit: "6140 - Transporte", credit: "1000 - Caixa" },
      fuel: { debit: "6150 - Combustível", credit: "1000 - Caixa" },
      other: { debit: "6190 - Outras Despesas", credit: "1000 - Caixa" }
    };

    return mapping[category] || mapping.other;
  }
}

// ========================================
// CALENDAR INTEGRATION
// ========================================

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // minutes before
}

export class CalendarIntegrationService {
  async addToCalendar(
    event: CalendarEvent,
    provider: "google" | "outlook" | "apple"
  ): Promise<{ eventId: string; calendarLink: string }> {
    // This would integrate with calendar APIs
    const eventId = `EVT-${Date.now()}`;
    const calendarLink = provider === "google" 
      ? `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(event.title)}`
      : `https://outlook.office.com/calendar/event`;
    
    logger.info(`Calendar event created: ${eventId}`);
    return { eventId, calendarLink };
  }

  generateICS(event: CalendarEvent): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.startTime}
DTEND:${event.endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
  }
}

// ========================================
// COMMUNICATION INTEGRATION
// ========================================

export class CommunicationService {
  async sendNotification(
    channel: "email" | "sms" | "slack" | "teams" | "whatsapp",
    recipient: string,
    message: { subject?: string; body: string }
  ): Promise<boolean> {
    // This would integrate with communication APIs
    logger.info(`Notification sent via ${channel} to ${recipient}`);
    return true;
  }

  async sendTravelAlert(
    travelers: string[],
    alert: { type: string; title: string; message: string; severity: string }
  ): Promise<number> {
    let sent = 0;
    for (const traveler of travelers) {
      await this.sendNotification("email", traveler, { 
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        body: alert.message 
      });
      sent++;
    }
    return sent;
  }
}

// ========================================
// EXPORTS
// ========================================

export const gdsService = new GDSIntegrationService();
export const hotelService = new HotelProviderService();
export const corporateCardService = new CorporateCardService();
export const accountingService = new AccountingIntegrationService();
export const calendarService = new CalendarIntegrationService();
export const communicationService = new CommunicationService();
