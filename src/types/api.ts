/**
 * API and Service Type Definitions
 * 
 * Types for API responses, service integrations, and external services
 */

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * API health status
 */
export type ApiHealthStatus = "healthy" | "degraded" | "down" | "unknown";

/**
 * API service status
 */
export interface ApiServiceStatus {
  name: string;
  status: ApiHealthStatus;
  lastChecked: string;
  responseTime?: number;
  error?: string;
}

/**
 * External API credentials
 */
export interface ApiCredentials {
  apiKey?: string;
  apiSecret?: string;
  token?: string;
  endpoint?: string;
}

/**
 * Travel API types
 */
export type TravelApiType = "flight" | "hotel" | "car" | "package";

/**
 * Flight search result
 */
export interface FlightSearchResult {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  airline: string;
  duration: number;
  stops: number;
}

/**
 * Hotel search result
 */
export interface HotelSearchResult {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  amenities?: string[];
}

/**
 * Weather data
 */
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast?: string;
  icon?: string;
}

/**
 * Map coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location data
 */
export interface LocationData {
  coordinates: Coordinates;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Document OCR result
 */
export interface OcrResult {
  text: string;
  confidence: number;
  language?: string;
  metadata?: Record<string, unknown>;
}

/**
 * AI/ML prediction result
 */
export interface PredictionResult<T = unknown> {
  prediction: T;
  confidence: number;
  model?: string;
  timestamp: string;
}

/**
 * Price prediction specific type
 */
export interface PricePrediction {
  current_avg_price: number;
  predicted_price: number;
  price_trend: "rising" | "falling" | "stable";
  confidence_score: number;
  best_booking_window_start: string;
  best_booking_window_end: string;
  recommendation: string;
  demand_level: string;
}
