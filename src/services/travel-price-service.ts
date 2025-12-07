import { supabase } from "@/integrations/supabase/client";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: string;
}

export interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  roomQuantity?: number;
  ratings?: string[];
}

export interface FlightResult {
  id: string;
  price: {
    total: number;
    currency: string;
    perAdult: number;
  };
  outbound: {
    departure: { airport: string; time: string };
    arrival: { airport: string; time: string };
    duration: string;
    stops: number;
    carrier: string;
    flightNumber: string;
  };
  inbound?: {
    departure: { airport: string; time: string };
    arrival: { airport: string; time: string };
    duration: string;
    stops: number;
    carrier: string;
    flightNumber: string;
  };
  airlines: string[];
  bookingClass: string;
  seatsAvailable: number;
  source: string;
  lastUpdated: string;
}

export interface HotelResult {
  id: string;
  name: string;
  chainCode?: string;
  cityCode: string;
  rating: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: any;
  };
  price: {
    total: number;
    currency: string;
    perNight: number;
  };
  room: {
    type: string;
    description: string;
    beds: number;
    bedType: string;
  };
  checkIn: string;
  checkOut: string;
  source: string;
  lastUpdated: string;
}

export interface PricePrediction {
  trend: "rising" | "falling" | "stable";
  confidence: number;
  recommendation: string;
  bestTimeToBuy: string;
  expectedSavings: number;
  factors?: string[];
}

export interface PopularRoute {
  origin: string;
  destination: string;
  name: string;
  lowestPrice: number | null;
  currency: string;
  departureDate: string;
}

export interface HotelDestination {
  cityCode: string;
  name: string;
  country: string;
  avgPricePerNight: number;
  currency: string;
  sampleDates: {
    checkIn: string;
    checkOut: string;
  };
}

class TravelPriceService {
  private async invoke<T>(action: string, params: Record<string, any> = {}): Promise<T> {
    const { data, error } = await supabase.functions.invoke("travel-price-monitor", {
      body: { action, ...params },
    });

    if (error) {
      console.error("[TravelPriceService] Error:", error);
      throw new Error(error.message || "Failed to fetch travel data");
    }

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data.data;
  }

  /**
   * Search for flights using Amadeus API
   */
  async searchFlights(params: FlightSearchParams): Promise<{ flights: FlightResult[]; dictionaries?: any }> {
    return this.invoke("search_flights", params);
  }

  /**
   * Search for hotels using Amadeus API
   */
  async searchHotels(params: HotelSearchParams): Promise<{ hotels: HotelResult[]; message?: string }> {
    return this.invoke("search_hotels", params);
  }

  /**
   * Get AI-powered price prediction
   */
  async getPrediction(productData: any, productType: "flight" | "hotel"): Promise<PricePrediction> {
    return this.invoke("get_prediction", { productData, productType });
  }

  /**
   * Check price alert against current prices
   */
  async checkPriceAlert(params: {
    alertId?: string;
    targetPrice: number;
    origin?: string;
    destination?: string;
    departureDate?: string;
    cityCode?: string;
    checkInDate?: string;
    checkOutDate?: string;
    type: "flight" | "hotel";
  }): Promise<{
    alertId: string;
    currentPrice: number;
    targetPrice: number;
    triggered: boolean;
    productData: any;
    checkedAt: string;
  }> {
    return this.invoke("check_price_alert", params);
  }

  /**
   * Get popular flight routes with current prices
   */
  async getPopularRoutes(): Promise<PopularRoute[]> {
    return this.invoke("get_popular_routes");
  }

  /**
   * Get popular hotel destinations with sample prices
   */
  async getHotelDestinations(): Promise<HotelDestination[]> {
    return this.invoke("get_hotel_destinations");
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === "object") {
            return JSON.stringify(value).replace(/,/g, ";");
          }
          return String(value || "").replace(/,/g, ";");
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export data to PDF format using jsPDF
   */
  async exportToPDF(data: any[], title: string, filename: string): Promise<void> {
    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const body = data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === "object") {
            return JSON.stringify(value);
          }
          return String(value || "");
        })
      );

      autoTableModule.default(doc, {
        startY: 40,
        head: [headers],
        body: body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`);
  }
}

export const travelPriceService = new TravelPriceService();

// Airport codes reference
export const AIRPORT_CODES: Record<string, string> = {
  GRU: "São Paulo - Guarulhos",
  CGH: "São Paulo - Congonhas",
  GIG: "Rio de Janeiro - Galeão",
  SDU: "Rio de Janeiro - Santos Dumont",
  BSB: "Brasília",
  SSA: "Salvador",
  REC: "Recife",
  FOR: "Fortaleza",
  POA: "Porto Alegre",
  CWB: "Curitiba",
  BEL: "Belém",
  MAO: "Manaus",
  FLN: "Florianópolis",
  VCP: "Campinas - Viracopos",
  CNF: "Belo Horizonte - Confins",
  NAT: "Natal",
  MCZ: "Maceió",
  AJU: "Aracaju",
  JPA: "João Pessoa",
  THE: "Teresina",
  SLZ: "São Luís",
  BPS: "Porto Seguro",
  VIX: "Vitória",
  CGB: "Cuiabá",
  GYN: "Goiânia",
  // International
  EZE: "Buenos Aires - Ezeiza",
  SCL: "Santiago - Chile",
  LIM: "Lima - Peru",
  BOG: "Bogotá - Colômbia",
  MIA: "Miami - EUA",
  JFK: "Nova York - JFK",
  LAX: "Los Angeles",
  ORD: "Chicago - O'Hare",
  CDG: "Paris - Charles de Gaulle",
  LHR: "Londres - Heathrow",
  FCO: "Roma - Fiumicino",
  MAD: "Madrid",
  LIS: "Lisboa",
  FRA: "Frankfurt",
  AMS: "Amsterdam",
  DXB: "Dubai",
  DOH: "Doha - Qatar",
};

// Airline codes reference
export const AIRLINE_CODES: Record<string, string> = {
  G3: "Gol Linhas Aéreas",
  LA: "LATAM Airlines",
  AD: "Azul Linhas Aéreas",
  AV: "Avianca",
  AA: "American Airlines",
  UA: "United Airlines",
  DL: "Delta Airlines",
  EK: "Emirates",
  QR: "Qatar Airways",
  AF: "Air France",
  KL: "KLM",
  TP: "TAP Air Portugal",
  IB: "Iberia",
  LH: "Lufthansa",
  BA: "British Airways",
  AZ: "ITA Airways",
  TK: "Turkish Airlines",
};
