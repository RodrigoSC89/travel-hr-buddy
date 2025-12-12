/**
 * PATCH 608: Deep Link Builder for Travel Services
 * Builds deep links for travel services without public APIs
 */

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: "economy" | "premium" | "business" | "first";
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  rooms?: number;
}

/**
 * Build Google Flights deep link
 */
export function buildGoogleFlightsLink(params: FlightSearchParams): string {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
    infants = 0,
  } = params;

  const baseUrl = "https://www.google.com/travel/flights";
  const passengers = adults + children + infants;
  
  // Format: /flights?q=Flights%20from%20GRU%20to%20MRS%20on%202025-03-10
  const searchQuery = returnDate
    ? `Flights from ${origin} to ${destination} on ${departureDate} returning ${returnDate}`
    : `Flights from ${origin} to ${destination} on ${departureDate}`;

  const url = new URL(baseUrl);
  url.searchParams.append("q", searchQuery);
  url.searchParams.append("hl", "pt-BR");
  
  return url.toString();
}

/**
 * Build LATAM Airlines deep link
 */
export function buildLatamLink(params: FlightSearchParams): string {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
    cabinClass = "economy",
  } = params;

  const baseUrl = "https://www.latamairlines.com/br/pt/ofertas-voos";
  const cabinMap = {
    economy: "Economy",
    premium: "Premium_Economy",
    business: "Business",
    first: "First",
  };

  const url = new URL(baseUrl);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("outboundDate", departureDate);
  if (returnDate) {
    url.searchParams.append("inboundDate", returnDate);
  }
  url.searchParams.append("adults", adults.toString());
  url.searchParams.append("children", children.toString());
  url.searchParams.append("cabin", cabinMap[cabinClass]);
  url.searchParams.append("utm_source", "travel-hr-buddy");
  url.searchParams.append("utm_medium", "deeplink");

  return url.toString();
}

/**
 * Build GOL Airlines deep link
 */
export function buildGolLink(params: FlightSearchParams): string {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
  } = params;

  const baseUrl = "https://www.voegol.com.br/pt/compre";
  const url = new URL(baseUrl);
  
  url.searchParams.append("originCode", origin);
  url.searchParams.append("destinationCode", destination);
  url.searchParams.append("departureDate", departureDate);
  if (returnDate) {
    url.searchParams.append("returningDate", returnDate);
  }
  url.searchParams.append("adults", adults.toString());
  url.searchParams.append("children", children.toString());
  url.searchParams.append("utm_source", "travel-hr-buddy");
  url.searchParams.append("utm_medium", "deeplink");

  return url.toString();
}

/**
 * Build AZUL Airlines deep link
 */
export function buildAzulLink(params: FlightSearchParams): string {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
  } = params;

  const baseUrl = "https://www.voeazul.com.br/br/pt/home";
  const url = new URL(baseUrl);
  
  url.searchParams.append("from", origin);
  url.searchParams.append("to", destination);
  url.searchParams.append("departure", departureDate);
  if (returnDate) {
    url.searchParams.append("return", returnDate);
  }
  url.searchParams.append("adults", adults.toString());
  url.searchParams.append("children", children.toString());
  url.searchParams.append("utm_source", "travel-hr-buddy");
  url.searchParams.append("utm_medium", "deeplink");

  return url.toString();
}

/**
 * Build MaxMilhas deep link
 */
export function buildMaxMilhasLink(params: FlightSearchParams): string {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
  } = params;

  const baseUrl = "https://www.maxmilhas.com.br/passagens-aereas";
  const url = new URL(baseUrl);
  
  url.searchParams.append("origem", origin);
  url.searchParams.append("destino", destination);
  url.searchParams.append("ida", departureDate);
  if (returnDate) {
    url.searchParams.append("volta", returnDate);
  }
  url.searchParams.append("passageiros", adults.toString());
  url.searchParams.append("utm_source", "travel-hr-buddy");
  url.searchParams.append("utm_medium", "deeplink");

  return url.toString();
}

/**
 * Build Airbnb deep link
 */
export function buildAirbnbLink(params: HotelSearchParams): string {
  const {
    destination,
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
  } = params;

  const baseUrl = "https://www.airbnb.com.br/s";
  const url = new URL(`${baseUrl}/${encodeURIComponent(destination)}/homes`);
  
  url.searchParams.append("checkin", checkIn);
  url.searchParams.append("checkout", checkOut);
  url.searchParams.append("adults", adults.toString());
  url.searchParams.append("children", children.toString());

  return url.toString();
}

/**
 * Build TripAdvisor deep link
 */
export function buildTripAdvisorLink(params: HotelSearchParams): string {
  const {
    destination,
    checkIn,
    checkOut,
    adults = 2,
  } = params;

  const baseUrl = "https://www.tripadvisor.com.br/Hotels";
  const url = new URL(baseUrl);
  
  url.searchParams.append("q", destination);
  url.searchParams.append("checkin", checkIn);
  url.searchParams.append("checkout", checkOut);
  url.searchParams.append("adults", adults.toString());

  return url.toString();
}

/**
 * Generate all available deep links for a flight search
 */
export function generateAllFlightLinks(params: FlightSearchParams) {
  return {
    googleFlights: buildGoogleFlightsLink(params),
    latam: buildLatamLink(params),
    gol: buildGolLink(params),
    azul: buildAzulLink(params),
    maxmilhas: buildMaxMilhasLink(params),
  };
}

/**
 * Generate all available deep links for a hotel search
 */
export function generateAllHotelLinks(params: HotelSearchParams) {
  return {
    airbnb: buildAirbnbLink(params),
    tripadvisor: buildTripAdvisorLink(params),
  };
}
