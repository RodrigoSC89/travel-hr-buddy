/**
 * Voyage Planner Data - Ports and initial data
 * Components should use hooks for persisted voyage data
 */

import type { Port, VoyageRoute, WeatherCondition } from "../types";

export const DEMO_PORTS: Port[] = [
  { id: "1", name: "Santos", country: "Brasil", code: "BRSSZ", lat: -23.95, lng: -46.3, type: "origin" },
  { id: "2", name: "Rio de Janeiro", country: "Brasil", code: "BRRIO", lat: -22.9, lng: -43.2, type: "origin" },
  { id: "3", name: "Rotterdam", country: "Holanda", code: "NLRTM", lat: 51.9, lng: 4.5, type: "destination" },
  { id: "4", name: "Hamburgo", country: "Alemanha", code: "DEHAM", lat: 53.5, lng: 9.99, type: "destination" },
  { id: "5", name: "Antuérpia", country: "Bélgica", code: "BEANR", lat: 51.2, lng: 4.4, type: "destination" },
  { id: "6", name: "Singapura", country: "Singapura", code: "SGSIN", lat: 1.3, lng: 103.8, type: "destination" },
  { id: "7", name: "Shanghai", country: "China", code: "CNSHA", lat: 31.2, lng: 121.5, type: "destination" },
  { id: "8", name: "Houston", country: "EUA", code: "USHOU", lat: 29.8, lng: -95.3, type: "destination" },
  { id: "9", name: "Las Palmas", country: "Espanha", code: "ESLPA", lat: 28.1, lng: -15.4, type: "waypoint" },
  { id: "10", name: "Durban", country: "África do Sul", code: "ZADUR", lat: -29.9, lng: 31.0, type: "destination" },
];

// Empty arrays - voyages should be fetched from Supabase
export const DEMO_VOYAGES: VoyageRoute[] = [];

export const DEMO_WEATHER: WeatherCondition[] = [
  { location: "Atlântico Norte", condition: "Parcialmente nublado", windSpeed: 15, waveHeight: 2.5, visibility: "Boa", risk: "low" },
  { location: "Golfo do México", condition: "Tempestade tropical", windSpeed: 35, waveHeight: 5.2, visibility: "Ruim", risk: "high" },
  { location: "Oceano Índico", condition: "Céu limpo", windSpeed: 10, waveHeight: 1.8, visibility: "Excelente", risk: "low" },
  { location: "Mar do Norte", condition: "Neblina", windSpeed: 20, waveHeight: 3.0, visibility: "Moderada", risk: "medium" },
];
