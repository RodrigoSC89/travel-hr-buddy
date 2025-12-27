import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORMGLASS_API_KEY = Deno.env.get('STORMGLASS_API_KEY');
const STORMGLASS_BASE_URL = 'https://api.stormglass.io/v2';

interface StormGlassRequest {
  action: 'weather' | 'tide' | 'astronomy' | 'bio';
  lat: number;
  lng: number;
  start?: string;
  end?: string;
  params?: string[];
}

interface WeatherResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  source: 'stormglass';
  timestamp: string;
}

/**
 * StormGlass Weather API Integration
 * Provides marine weather, tides, waves, and oceanographic data
 * Used as fallback for OpenWeatherMap and Windy
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!STORMGLASS_API_KEY) {
      console.error('[StormGlass] API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'StormGlass API key not configured',
          source: 'stormglass',
          timestamp: new Date().toISOString(),
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, lat, lng, start, end, params }: StormGlassRequest = await req.json();
    
    console.log(`[StormGlass] ${action} request for lat=${lat}, lng=${lng}`);

    let endpoint = '';
    let queryParams = new URLSearchParams();
    queryParams.append('lat', lat.toString());
    queryParams.append('lng', lng.toString());

    switch (action) {
      case 'weather':
        endpoint = '/weather/point';
        // Default marine weather parameters
        const weatherParams = params || [
          'airTemperature',
          'pressure',
          'humidity',
          'windSpeed',
          'windDirection',
          'windGust',
          'visibility',
          'cloudCover',
          'precipitation',
          'waveHeight',
          'wavePeriod',
          'waveDirection',
          'waterTemperature',
          'currentSpeed',
          'currentDirection',
          'seaLevel'
        ];
        queryParams.append('params', weatherParams.join(','));
        break;

      case 'tide':
        endpoint = '/tide/extremes/point';
        if (start) queryParams.append('start', start);
        if (end) queryParams.append('end', end);
        break;

      case 'astronomy':
        endpoint = '/astronomy/point';
        if (start) queryParams.append('start', start);
        if (end) queryParams.append('end', end);
        break;

      case 'bio':
        endpoint = '/bio/point';
        const bioParams = params || [
          'soilMoisture',
          'soilTemperature',
          'phytoplankton',
          'chlorophyll',
          'ironConcentration',
          'nitrateConcentration',
          'phosphateConcentration',
          'silicateConcentration',
          'dissolvedOxygen',
          'salinity'
        ];
        queryParams.append('params', bioParams.join(','));
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const url = `${STORMGLASS_BASE_URL}${endpoint}?${queryParams.toString()}`;
    console.log(`[StormGlass] Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': STORMGLASS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[StormGlass] API error: ${response.status} - ${errorText}`);
      
      // Handle rate limiting
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'StormGlass API quota exceeded',
            source: 'stormglass',
            timestamp: new Date().toISOString(),
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`StormGlass API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[StormGlass] Success - received ${data.hours?.length || 0} data points`);

    // Transform data to a more usable format
    const transformedData = transformStormGlassData(data, action);

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        raw: data,
        source: 'stormglass',
        timestamp: new Date().toISOString(),
      } as WeatherResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[StormGlass] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'stormglass',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Transform StormGlass data to a standardized format
 */
function transformStormGlassData(data: any, action: string): any {
  if (action === 'weather' && data.hours?.length > 0) {
    // Get current hour data (first entry)
    const current = data.hours[0];
    
    return {
      current: {
        time: current.time,
        airTemperature: getSourceValue(current.airTemperature),
        pressure: getSourceValue(current.pressure),
        humidity: getSourceValue(current.humidity),
        windSpeed: getSourceValue(current.windSpeed),
        windSpeedKnots: (getSourceValue(current.windSpeed) ?? 0) * 1.94384, // m/s to knots
        windDirection: getSourceValue(current.windDirection),
        windGust: getSourceValue(current.windGust),
        visibility: getSourceValue(current.visibility),
        cloudCover: getSourceValue(current.cloudCover),
        precipitation: getSourceValue(current.precipitation),
        waveHeight: getSourceValue(current.waveHeight),
        wavePeriod: getSourceValue(current.wavePeriod),
        waveDirection: getSourceValue(current.waveDirection),
        waterTemperature: getSourceValue(current.waterTemperature),
        currentSpeed: getSourceValue(current.currentSpeed),
        currentDirection: getSourceValue(current.currentDirection),
        seaLevel: getSourceValue(current.seaLevel),
      },
      forecast: data.hours.slice(1, 25).map((hour: any) => ({
        time: hour.time,
        airTemperature: getSourceValue(hour.airTemperature),
        windSpeed: getSourceValue(hour.windSpeed),
        windDirection: getSourceValue(hour.windDirection),
        waveHeight: getSourceValue(hour.waveHeight),
        precipitation: getSourceValue(hour.precipitation),
      })),
      meta: data.meta,
    };
  }

  if (action === 'tide') {
    return {
      extremes: data.data?.map((point: any) => ({
        time: point.time,
        type: point.type, // 'high' or 'low'
        height: point.height,
      })) || [],
      meta: data.meta,
    };
  }

  if (action === 'astronomy') {
    return {
      data: data.data?.map((point: any) => ({
        time: point.time,
        sunrise: point.sunrise?.time,
        sunset: point.sunset?.time,
        moonrise: point.moonrise?.time,
        moonset: point.moonset?.time,
        moonPhase: point.moonPhase?.current?.text,
        civilTwilight: {
          start: point.civilTwilight?.start,
          end: point.civilTwilight?.end,
        },
      })) || [],
      meta: data.meta,
    };
  }

  return data;
}

/**
 * Extract value from StormGlass source object (uses first available source)
 */
function getSourceValue(sourceObj: Record<string, number> | undefined | null): number | null {
  if (!sourceObj || typeof sourceObj !== 'object') return null;
  
  // Priority sources for marine data
  const prioritySources = ['noaa', 'sg', 'meto', 'dwd', 'smhi', 'icon'];
  
  for (const source of prioritySources) {
    if (sourceObj[source] !== undefined && sourceObj[source] !== null) {
      return sourceObj[source];
    }
  }
  
  // Return first available value
  const values = Object.values(sourceObj).filter((v): v is number => v !== null && v !== undefined);
  return values.length > 0 ? values[0] : null;
}
