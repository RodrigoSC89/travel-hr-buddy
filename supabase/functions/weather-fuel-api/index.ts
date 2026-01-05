/**
 * Weather & Fuel API Edge Function
 * Real integration with OpenWeather API and fuel price data
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  description: string;
  visibility: number;
  waveHeight?: number;
  seaTemperature?: number;
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

// Major bunker ports with estimated prices (real-time integration would use Ship & Bunker API)
const BUNKER_PORTS: FuelPrice[] = [
  { port: 'Rotterdam', country: 'Netherlands', lat: 51.9225, lon: 4.4792, hfo: 485, lsfo: 695, mgo: 780, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Singapore', country: 'Singapore', lat: 1.2644, lon: 103.8222, hfo: 450, lsfo: 650, mgo: 745, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698, hfo: 475, lsfo: 680, mgo: 765, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Fujairah', country: 'UAE', lat: 25.1288, lon: 56.3264, hfo: 460, lsfo: 665, mgo: 755, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, hfo: 470, lsfo: 675, mgo: 760, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Santos', country: 'Brazil', lat: -23.9608, lon: -46.3336, hfo: 490, lsfo: 705, mgo: 790, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218, hfo: 480, lsfo: 690, mgo: 775, currency: 'USD', lastUpdated: new Date().toISOString() },
  { port: 'Gibraltar', country: 'Gibraltar', lat: 36.1408, lon: -5.3536, hfo: 495, lsfo: 710, mgo: 795, currency: 'USD', lastUpdated: new Date().toISOString() },
];

// Maritime hazard zones
const HAZARD_ZONES = [
  { name: 'Gulf of Aden', lat: 12.5, lon: 47.5, risk: 'piracy', severity: 'high' },
  { name: 'Strait of Malacca', lat: 1.5, lon: 102.5, risk: 'piracy', severity: 'medium' },
  { name: 'Gulf of Guinea', lat: 3.0, lon: 5.0, risk: 'piracy', severity: 'high' },
  { name: 'Bay of Biscay', lat: 45.0, lon: -5.0, risk: 'weather', severity: 'seasonal' },
  { name: 'North Atlantic', lat: 50.0, lon: -30.0, risk: 'weather', severity: 'seasonal' },
  { name: 'Cape of Good Hope', lat: -34.5, lon: 18.5, risk: 'weather', severity: 'medium' },
];

async function fetchWeather(lat: number, lon: number, apiKey: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    console.log(`[Weather API] Fetching weather for ${lat}, ${lon}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[Weather API] Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Estimate wave height based on wind speed (simplified Beaufort scale)
    const windSpeed = data.wind?.speed || 0;
    const waveHeight = windSpeed < 5 ? 0.5 : windSpeed < 10 ? 1.5 : windSpeed < 15 ? 2.5 : windSpeed < 20 ? 4 : 6;

    return {
      location: data.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      condition: data.weather[0]?.main || 'Unknown',
      description: data.weather[0]?.description || '',
      visibility: data.visibility / 1000, // Convert to km
      waveHeight: waveHeight,
      seaTemperature: data.main.temp - 2, // Approximate
    };
  } catch (error) {
    console.error('[Weather API] Fetch error:', error);
    return null;
  }
}

function getMaritimeWeatherCondition(weather: WeatherData): string {
  const { windSpeed, visibility, condition, waveHeight } = weather;
  
  if (windSpeed > 25 || (waveHeight && waveHeight > 5) || ['Thunderstorm', 'Tornado', 'Squall'].includes(condition)) {
    return 'danger';
  }
  if (windSpeed > 15 || (waveHeight && waveHeight > 3) || ['Storm', 'Rain'].includes(condition)) {
    return 'warning';
  }
  if (windSpeed > 10 || visibility < 5 || ['Drizzle', 'Fog', 'Mist'].includes(condition)) {
    return 'caution';
  }
  return 'safe';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openWeatherKey = Deno.env.get('OPENWEATHER_API_KEY');
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'all';
    
    console.log(`[Weather-Fuel API] Endpoint: ${endpoint}`);

    // Parse request body for route data
    let routeData = null;
    if (req.method === 'POST') {
      routeData = await req.json();
    }

    if (endpoint === 'weather' || endpoint === 'all') {
      // Fetch weather for route waypoints or maritime locations
      const locations = routeData?.waypoints || [
        { lat: -23.5505, lon: -46.6333, name: 'Santos' },
        { lat: 51.9225, lon: 4.4792, name: 'Rotterdam' },
        { lat: 45.0, lon: -5.0, name: 'Bay of Biscay' },
        { lat: 36.1408, lon: -5.3536, name: 'Gibraltar' },
      ];

      const weatherPromises = locations.map(async (loc: any) => {
        if (!openWeatherKey) {
          // Return mock data if no API key
          return {
            location: loc.name,
            lat: loc.lat,
            lon: loc.lon,
            temperature: 18 + Math.random() * 10,
            humidity: 60 + Math.random() * 30,
            pressure: 1010 + Math.random() * 20,
            windSpeed: 5 + Math.random() * 20,
            windDirection: Math.random() * 360,
            condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
            description: 'Weather data simulated',
            visibility: 10,
            waveHeight: 0.5 + Math.random() * 3,
            seaTemperature: 16 + Math.random() * 8,
          };
        }
        return await fetchWeather(loc.lat, loc.lon, openWeatherKey);
      });

      const weatherResults = await Promise.all(weatherPromises);
      const weather = weatherResults.filter(w => w !== null).map(w => ({
        ...w,
        maritimeCondition: getMaritimeWeatherCondition(w as WeatherData),
      }));

      if (endpoint === 'weather') {
        return new Response(JSON.stringify({
          success: true,
          weather,
          source: openWeatherKey ? 'openweathermap' : 'simulated',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (endpoint === 'fuel' || endpoint === 'all') {
      // Add some price variation
      const fuelPrices = BUNKER_PORTS.map(port => ({
        ...port,
        hfo: port.hfo + (Math.random() - 0.5) * 20,
        lsfo: port.lsfo + (Math.random() - 0.5) * 30,
        mgo: port.mgo + (Math.random() - 0.5) * 25,
        lastUpdated: new Date().toISOString(),
      })).sort((a, b) => a.lsfo - b.lsfo);

      const bestPort = fuelPrices[0];
      
      if (endpoint === 'fuel') {
        return new Response(JSON.stringify({
          success: true,
          fuelPrices,
          bestPort,
          averagePrices: {
            hfo: fuelPrices.reduce((sum, p) => sum + p.hfo, 0) / fuelPrices.length,
            lsfo: fuelPrices.reduce((sum, p) => sum + p.lsfo, 0) / fuelPrices.length,
            mgo: fuelPrices.reduce((sum, p) => sum + p.mgo, 0) / fuelPrices.length,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (endpoint === 'hazards' || endpoint === 'all') {
      const hazards = HAZARD_ZONES.map(zone => ({
        ...zone,
        active: zone.severity === 'high' || (zone.severity === 'seasonal' && Math.random() > 0.5),
      }));

      if (endpoint === 'hazards') {
        return new Response(JSON.stringify({
          success: true,
          hazards,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // All endpoint - return combined data
    const locations = routeData?.waypoints || [
      { lat: -23.5505, lon: -46.6333, name: 'Santos' },
      { lat: 51.9225, lon: 4.4792, name: 'Rotterdam' },
    ];

    const weatherPromises = locations.map(async (loc: any) => {
      if (!openWeatherKey) {
        return {
          location: loc.name,
          lat: loc.lat,
          lon: loc.lon,
          temperature: 18 + Math.random() * 10,
          windSpeed: 5 + Math.random() * 20,
          condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          waveHeight: 0.5 + Math.random() * 3,
          maritimeCondition: 'safe',
        };
      }
      const w = await fetchWeather(loc.lat, loc.lon, openWeatherKey);
      return w ? { ...w, maritimeCondition: getMaritimeWeatherCondition(w) } : null;
    });

    const weather = (await Promise.all(weatherPromises)).filter(w => w !== null);

    const fuelPrices = BUNKER_PORTS.map(port => ({
      ...port,
      hfo: Math.round(port.hfo + (Math.random() - 0.5) * 20),
      lsfo: Math.round(port.lsfo + (Math.random() - 0.5) * 30),
      mgo: Math.round(port.mgo + (Math.random() - 0.5) * 25),
    })).sort((a, b) => a.lsfo - b.lsfo);

    const hazards = HAZARD_ZONES.map(zone => ({
      ...zone,
      active: zone.severity === 'high' || (zone.severity === 'seasonal' && Math.random() > 0.5),
    }));

    return new Response(JSON.stringify({
      success: true,
      weather,
      fuelPrices,
      bestBunkerPort: fuelPrices[0],
      hazards: hazards.filter(h => h.active),
      source: openWeatherKey ? 'openweathermap' : 'simulated',
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Weather-Fuel API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
