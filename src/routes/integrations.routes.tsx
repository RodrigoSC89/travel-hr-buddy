/**
 * Integrations & APIs Routes
 * External API integrations and documentation
 */
import { Route } from "react-router-dom";
import {
  IntegrationsCenter,
  DocumentationHub,
  APIMonitor,
  APICenter,
  ExternalAPIsPage,
  WeatherMaritime,
  PortAPI,
  FlightTracker,
  EarthquakeMonitor,
  NOAAWeather,
  OpenSkyFlights,
} from "./lazy-imports";

export const integrationsRoutes = (
  <>
    <Route path="integracoes" element={<IntegrationsCenter />} />
    <Route path="integracoes/api-monitor" element={<APIMonitor />} />
    <Route path="integracoes/api-center" element={<APICenter />} />
    <Route path="docs" element={<DocumentationHub />} />
    <Route path="external-apis" element={<ExternalAPIsPage />} />
    <Route path="weather-maritime" element={<WeatherMaritime />} />
    <Route path="port-api" element={<PortAPI />} />
    <Route path="flight-tracker" element={<FlightTracker />} />
    <Route path="earthquake-monitor" element={<EarthquakeMonitor />} />
    <Route path="noaa-weather" element={<NOAAWeather />} />
    <Route path="opensky-flights" element={<OpenSkyFlights />} />
  </>
);
