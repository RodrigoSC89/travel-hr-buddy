/**
 * External Integrations Index
 * Exports all external API integration services
 */

// Weather APIs
export * from "./marine-traffic.service";
export * from "./telemedicine.service";

// Re-export weather services from weather folder
export { getWeatherData, getWeatherForecast } from "../weather/unified-weather.service";
