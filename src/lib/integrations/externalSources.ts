/**
 * PATCH 626 - External Data Integrator
 * Integração com Fontes Externas de Dados Reais
 * 
 * Integra APIs de viagem, meteorologia, portos e fiscalização
 * para enriquecer módulos operacionais e analíticos.
 */

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  class?: "economy" | "premium_economy" | "business" | "first";
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  price: number;
  currency: string;
  bookingUrl: string;
  stops: number;
  source: "skyscanner" | "google_flights" | "latam" | "gol" | "azul" | "maxmilhas";
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms?: number;
  adults?: number;
  children?: number;
}

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: number;
  currency: string;
  amenities: string[];
  photos: string[];
  bookingUrl: string;
  source: "booking" | "hoteis_com" | "airbnb";
}

export interface METARData {
  station: string;
  observationTime: string;
  temperature: number;
  dewPoint: number;
  windDirection: number;
  windSpeed: number;
  visibility: number;
  clouds: string[];
  weather: string[];
  pressure: number;
  rawMETAR: string;
}

export interface PortStateData {
  imo: string;
  vesselName: string;
  flag: string;
  inspections: Array<{
    date: string;
    port: string;
    authority: string;
    deficiencies: number;
    detentions: number;
  }>;
  riskProfile: "low" | "medium" | "high" | "critical";
  lastUpdate: string;
  source: "imo" | "equasis" | "paris_mou" | "tokyo_mou";
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category: "inspection" | "weather" | "policy" | "incident" | "regulation";
  relevance: number;
}

/**
 * Cliente para APIs de Viagem
 */
export class TravelAPIClient {
  private static readonly API_TIMEOUT = 10000; // 10 seconds
  private static readonly CACHE_DURATION = 300000; // 5 minutes
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Busca voos em múltiplas APIs
   */
  static async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    const cacheKey = `flights_${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const results: FlightResult[] = [];

    try {
      // Skyscanner (mock implementation)
      const skyscannerResults = await this.searchSkyscanner(params);
      results.push(...skyscannerResults);
    } catch (error) {
      console.error("Skyscanner API error:", error);
    }

    try {
      // Google Flights (mock implementation)
      const googleResults = await this.searchGoogleFlights(params);
      results.push(...googleResults);
    } catch (error) {
      console.error("Google Flights API error:", error);
    }

    try {
      // Brazilian airlines
      const brazilianResults = await this.searchBrazilianAirlines(params);
      results.push(...brazilianResults);
    } catch (error) {
      console.error("Brazilian airlines API error:", error);
    }

    // Sort by price
    results.sort((a, b) => a.price - b.price);

    this.saveToCache(cacheKey, results);
    return results;
  }

  /**
   * Busca hotéis em múltiplas APIs
   */
  static async searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
    const cacheKey = `hotels_${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const results: HotelResult[] = [];

    try {
      // Booking.com (mock implementation)
      const bookingResults = await this.searchBooking(params);
      results.push(...bookingResults);
    } catch (error) {
      console.error("Booking.com API error:", error);
    }

    try {
      // Hoteis.com (mock implementation)
      const hoteisResults = await this.searchHoteisCom(params);
      results.push(...hoteisResults);
    } catch (error) {
      console.error("Hoteis.com API error:", error);
    }

    try {
      // Airbnb (mock implementation)
      const airbnbResults = await this.searchAirbnb(params);
      results.push(...airbnbResults);
    } catch (error) {
      console.error("Airbnb API error:", error);
    }

    // Sort by rating and price
    results.sort((a, b) => b.rating - a.rating || a.price - b.price);

    this.saveToCache(cacheKey, results);
    return results;
  }

  // Mock implementations (replace with real API calls)
  private static async searchSkyscanner(
    params: FlightSearchParams
  ): Promise<FlightResult[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "sky-001",
        airline: "TAM",
        flightNumber: "JJ3050",
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T08:00:00`,
          terminal: "T2",
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T10:30:00`,
          terminal: "T1",
        },
        duration: "2h 30m",
        price: 450.0,
        currency: "BRL",
        bookingUrl: "https://skyscanner.com/booking/sky-001",
        stops: 0,
        source: "skyscanner",
      },
    ];
  }

  private static async searchGoogleFlights(
    params: FlightSearchParams
  ): Promise<FlightResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "gf-001",
        airline: "GOL",
        flightNumber: "G31234",
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T09:15:00`,
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T11:45:00`,
        },
        duration: "2h 30m",
        price: 420.0,
        currency: "BRL",
        bookingUrl: "https://google.com/flights/booking/gf-001",
        stops: 0,
        source: "google_flights",
      },
    ];
  }

  private static async searchBrazilianAirlines(
    params: FlightSearchParams
  ): Promise<FlightResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "latam-001",
        airline: "LATAM",
        flightNumber: "LA3456",
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T10:00:00`,
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T12:30:00`,
        },
        duration: "2h 30m",
        price: 480.0,
        currency: "BRL",
        bookingUrl: "https://latam.com/booking/latam-001",
        stops: 0,
        source: "latam",
      },
      {
        id: "azul-001",
        airline: "AZUL",
        flightNumber: "AD4567",
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T07:30:00`,
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T10:00:00`,
        },
        duration: "2h 30m",
        price: 390.0,
        currency: "BRL",
        bookingUrl: "https://voeazul.com.br/booking/azul-001",
        stops: 0,
        source: "azul",
      },
    ];
  }

  private static async searchBooking(
    params: HotelSearchParams
  ): Promise<HotelResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "book-001",
        name: "Hotel Example",
        address: `${params.destination}, Brazil`,
        rating: 4.5,
        price: 250.0,
        currency: "BRL",
        amenities: ["WiFi", "Pool", "Breakfast", "Gym"],
        photos: [],
        bookingUrl: "https://booking.com/hotel/book-001",
        source: "booking",
      },
    ];
  }

  private static async searchHoteisCom(
    params: HotelSearchParams
  ): Promise<HotelResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "hoteis-001",
        name: "Hotel Atlântico",
        address: `${params.destination}, Brazil`,
        rating: 4.2,
        price: 230.0,
        currency: "BRL",
        amenities: ["WiFi", "Breakfast", "Parking"],
        photos: [],
        bookingUrl: "https://hoteis.com/hotel/hoteis-001",
        source: "hoteis_com",
      },
    ];
  }

  private static async searchAirbnb(
    params: HotelSearchParams
  ): Promise<HotelResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        id: "airbnb-001",
        name: "Cozy Apartment with Sea View",
        address: `${params.destination}, Brazil`,
        rating: 4.8,
        price: 180.0,
        currency: "BRL",
        amenities: ["WiFi", "Kitchen", "Beach Access"],
        photos: [],
        bookingUrl: "https://airbnb.com/rooms/airbnb-001",
        source: "airbnb",
      },
    ];
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private static saveToCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

/**
 * Parser de dados METAR
 */
export class METARParser {
  /**
   * Busca e parseia dados METAR
   */
  static async getMETAR(station: string): Promise<METARData | null> {
    try {
      // Mock implementation - replace with real METAR API
      const rawMETAR = await this.fetchRawMETAR(station);
      return this.parseMETAR(rawMETAR, station);
    } catch (error) {
      console.error("Error fetching METAR:", error);
      return null;
    }
  }

  private static async fetchRawMETAR(station: string): Promise<string> {
    // Simulate API call to METAR service
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Example METAR
    return `${station} 031200Z 27015KT 9999 FEW030 BKN100 22/18 Q1015 NOSIG`;
  }

  static parseMETAR(rawMETAR: string, station: string): METARData {
    const parts = rawMETAR.split(" ");

    // Parse time (e.g., "031200Z" = day 03, time 12:00 UTC)
    const timeMatch = parts[1]?.match(/(\d{2})(\d{2})(\d{2})Z/);
    const day = timeMatch ? parseInt(timeMatch[1]) : 0;
    const hour = timeMatch ? parseInt(timeMatch[2]) : 0;
    const minute = timeMatch ? parseInt(timeMatch[3]) : 0;

    const now = new Date();
    const observationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      day,
      hour,
      minute
    ).toISOString();

    // Parse wind (e.g., "27015KT" = 270°, 15 knots)
    const windMatch = parts[2]?.match(/(\d{3})(\d{2,3})KT/);
    const windDirection = windMatch ? parseInt(windMatch[1]) : 0;
    const windSpeed = windMatch ? parseInt(windMatch[2]) : 0;

    // Parse visibility (e.g., "9999" = 10km+)
    const visibility = parseInt(parts[3] || "0");

    // Parse temperature and dew point (e.g., "22/18" = 22°C temp, 18°C dew point)
    const tempMatch = rawMETAR.match(/(\d{2})\/(\d{2})/);
    const temperature = tempMatch ? parseInt(tempMatch[1]) : 0;
    const dewPoint = tempMatch ? parseInt(tempMatch[2]) : 0;

    // Parse pressure (e.g., "Q1015" = 1015 hPa)
    const pressureMatch = rawMETAR.match(/Q(\d{4})/);
    const pressure = pressureMatch ? parseInt(pressureMatch[1]) : 0;

    // Parse clouds
    const clouds: string[] = [];
    const cloudPattern = /(FEW|SCT|BKN|OVC)(\d{3})/g;
    let cloudMatch;
    while ((cloudMatch = cloudPattern.exec(rawMETAR)) !== null) {
      clouds.push(`${cloudMatch[1]} at ${parseInt(cloudMatch[2]) * 100}ft`);
    }

    return {
      station,
      observationTime,
      temperature,
      dewPoint,
      windDirection,
      windSpeed,
      visibility,
      clouds,
      weather: [],
      pressure,
      rawMETAR,
    };
  }
}

/**
 * Cliente para bases de dados de Port State Control
 */
export class PortStateClient {
  /**
   * Consulta dados de inspeção na base IMO/Equasis
   */
  static async getVesselInspections(imo: string): Promise<PortStateData | null> {
    try {
      // Mock implementation - replace with real API
      const data = await this.fetchIMOData(imo);
      return data;
    } catch (error) {
      console.error("Error fetching port state data:", error);
      return null;
    }
  }

  private static async fetchIMOData(imo: string): Promise<PortStateData> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      imo,
      vesselName: "MV Example",
      flag: "Brazil",
      inspections: [
        {
          date: "2025-10-15",
          port: "Santos",
          authority: "Brazil Maritime Authority",
          deficiencies: 2,
          detentions: 0,
        },
        {
          date: "2025-08-20",
          port: "Rotterdam",
          authority: "Port of Rotterdam",
          deficiencies: 1,
          detentions: 0,
        },
      ],
      riskProfile: "low",
      lastUpdate: new Date().toISOString(),
      source: "imo",
    };
  }

  /**
   * Calcula perfil de risco baseado em histórico
   */
  static calculateRiskProfile(
    inspections: PortStateData["inspections"]
  ): PortStateData["riskProfile"] {
    if (inspections.length === 0) return "medium";

    const recentInspections = inspections.slice(0, 5);
    const avgDeficiencies =
      recentInspections.reduce((sum, i) => sum + i.deficiencies, 0) /
      recentInspections.length;
    const hasDetentions = recentInspections.some((i) => i.detentions > 0);

    if (hasDetentions || avgDeficiencies > 5) return "critical";
    if (avgDeficiencies > 3) return "high";
    if (avgDeficiencies > 1) return "medium";
    return "low";
  }
}

/**
 * Web scraping para notícias relevantes (com fallback)
 */
export class NewsScrapingService {
  /**
   * Busca notícias relevantes
   */
  static async searchNews(
    query: string,
    categories?: NewsItem["category"][]
  ): Promise<NewsItem[]> {
    try {
      // Mock implementation - replace with real scraping/API
      return await this.mockNewsSearch(query, categories);
    } catch (error) {
      console.error("Error searching news:", error);
      return [];
    }
  }

  private static async mockNewsSearch(
    query: string,
    categories?: NewsItem["category"][]
  ): Promise<NewsItem[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    const allNews: NewsItem[] = [
      {
        id: "news-001",
        title: "New Port State Control regulations announced",
        summary: "IMO announces updated PSC guidelines for 2025",
        url: "https://example.com/news/psc-regulations",
        publishedAt: "2025-11-01T10:00:00Z",
        source: "Maritime News",
        category: "regulation",
        relevance: 0.95,
      },
      {
        id: "news-002",
        title: "Storm warning for Atlantic routes",
        summary: "Severe weather expected in North Atlantic shipping lanes",
        url: "https://example.com/news/storm-warning",
        publishedAt: "2025-11-02T08:00:00Z",
        source: "Weather Maritime",
        category: "weather",
        relevance: 0.88,
      },
      {
        id: "news-003",
        title: "Port of Santos increases inspection frequency",
        summary: "Brazilian authorities announce enhanced PSC inspections",
        url: "https://example.com/news/santos-inspections",
        publishedAt: "2025-11-03T12:00:00Z",
        source: "Port News Brazil",
        category: "inspection",
        relevance: 0.92,
      },
    ];

    // Filter by category if specified
    let filtered = allNews;
    if (categories && categories.length > 0) {
      filtered = allNews.filter((news) => categories.includes(news.category));
    }

    // Filter by query
    if (query) {
      filtered = filtered.filter(
        (news) =>
          news.title.toLowerCase().includes(query.toLowerCase()) ||
          news.summary.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.relevance - a.relevance);
  }
}

/**
 * Interface integrada para todas as fontes externas
 */
export class ExternalDataIntegrator {
  /**
   * Busca dados completos para planejamento de viagem
   */
  static async getTravelData(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
  }): Promise<{
    flights: FlightResult[];
    hotels: HotelResult[];
    weather: METARData | null;
  }> {
    const [flights, hotels, weather] = await Promise.all([
      TravelAPIClient.searchFlights(params),
      TravelAPIClient.searchHotels({
        destination: params.destination,
        checkIn: params.departureDate,
        checkOut: params.returnDate || params.departureDate,
      }),
      METARParser.getMETAR(params.destination),
    ]);

    return { flights, hotels, weather };
  }

  /**
   * Busca dados completos para compliance marítimo
   */
  static async getComplianceData(imo: string): Promise<{
    portState: PortStateData | null;
    news: NewsItem[];
  }> {
    const [portState, news] = await Promise.all([
      PortStateClient.getVesselInspections(imo),
      NewsScrapingService.searchNews("port state control", ["inspection", "regulation"]),
    ]);

    return { portState, news };
  }

  /**
   * Busca dados meteorológicos para navegação
   */
  static async getNavigationWeather(stations: string[]): Promise<METARData[]> {
    const weatherData = await Promise.all(
      stations.map((station) => METARParser.getMETAR(station))
    );

    return weatherData.filter((data): data is METARData => data !== null);
  }
}

export default ExternalDataIntegrator;
