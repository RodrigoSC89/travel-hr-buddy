/**
 * useRouteWeatherFuel Hook - Fetch weather and fuel data from edge function
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity?: number;
  pressure?: number;
  windSpeed: number;
  windDirection?: number;
  condition: string;
  description?: string;
  visibility?: number;
  waveHeight?: number;
  seaTemperature?: number;
  maritimeCondition: 'safe' | 'caution' | 'warning' | 'danger';
}

interface FuelPrice {
  port: string;
  country: string;
  lat: number;
  lon: number;
  hfo: number;
  lsfo: number;
  mgo: number;
  currency: string;
  lastUpdated: string;
}

interface HazardZone {
  name: string;
  lat: number;
  lon: number;
  risk: 'piracy' | 'weather';
  severity: string;
  active: boolean;
}

interface RouteDataResponse {
  success: boolean;
  weather: WeatherData[];
  fuelPrices: FuelPrice[];
  bestBunkerPort: FuelPrice;
  hazards: HazardZone[];
  source: 'openweathermap' | 'simulated';
  timestamp: string;
}

interface UseRouteWeatherFuelReturn {
  weather: WeatherData[];
  fuelPrices: FuelPrice[];
  bestBunkerPort: FuelPrice | null;
  hazards: HazardZone[];
  loading: boolean;
  error: string | null;
  source: string;
  fetchRouteData: (waypoints?: { lat: number; lon: number; name: string }[]) => Promise<void>;
}

export function useRouteWeatherFuel(): UseRouteWeatherFuelReturn {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [bestBunkerPort, setBestBunkerPort] = useState<FuelPrice | null>(null);
  const [hazards, setHazards] = useState<HazardZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  const fetchRouteData = useCallback(async (waypoints?: { lat: number; lon: number; name: string }[]) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('weather-fuel-api', {
        body: waypoints ? { waypoints } : undefined,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      const response = data as RouteDataResponse;

      if (!response.success) {
        throw new Error('Failed to fetch route data');
      }

      setWeather(response.weather);
      setFuelPrices(response.fuelPrices);
      setBestBunkerPort(response.bestBunkerPort);
      setHazards(response.hazards);
      setSource(response.source);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch route data';
      setError(errorMessage);
      console.error('[useRouteWeatherFuel] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weather,
    fuelPrices,
    bestBunkerPort,
    hazards,
    loading,
    error,
    source,
    fetchRouteData,
  };
}
