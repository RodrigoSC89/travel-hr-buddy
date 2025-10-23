// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nautilus-token',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get authentication token
    const nautilusToken = req.headers.get('x-nautilus-token');
    const authHeader = req.headers.get('authorization');
    
    if (!nautilusToken && !authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = user.id;
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/api-gateway', '');
    const method = req.method;

    console.log(`[API Gateway] ${method} ${path} - User: ${userId || 'service'}`);

    // Route to appropriate handler
    let response;
    switch (path) {
      case '/weather':
        response = await handleWeatherAPI(url.searchParams);
        break;
      case '/satellite':
        response = await handleSatelliteAPI(url.searchParams);
        break;
      case '/ais':
        response = await handleAISAPI(url.searchParams);
        break;
      case '/logistics':
        response = await handleLogisticsAPI(await req.json());
        break;
      case '/status':
        response = { status: 'online', endpoints: ['weather', 'satellite', 'ais', 'logistics'] };
        break;
      default:
        response = { error: 'Endpoint not found', available: ['weather', 'satellite', 'ais', 'logistics', 'status'] };
    }

    // Log request to external_logs
    await logExternalRequest(supabase, {
      user_id: userId,
      endpoint: path,
      method,
      status: response.error ? 'error' : 'success',
      response_time: 0, // Could be calculated
      metadata: { query: Object.fromEntries(url.searchParams) }
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: response.error ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API Gateway] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Weather API Handler (Mock)
 */
async function handleWeatherAPI(params: URLSearchParams) {
  const location = params.get('location') || 'Santos, Brazil';
  
  console.log(`[Weather API] Fetching weather for: ${location}`);
  
  // Mock weather data
  return {
    location,
    timestamp: new Date().toISOString(),
    temperature: Math.round(20 + Math.random() * 15),
    humidity: Math.round(60 + Math.random() * 30),
    wind_speed: Math.round(5 + Math.random() * 15),
    conditions: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
    pressure: Math.round(1010 + Math.random() * 20),
    visibility: Math.round(8 + Math.random() * 7),
    forecast: [
      { day: 'Tomorrow', temp: 24, conditions: 'Sunny' },
      { day: 'Day after', temp: 22, conditions: 'Cloudy' }
    ]
  };
}

/**
 * Satellite API Handler (Mock)
 */
async function handleSatelliteAPI(params: URLSearchParams) {
  const vesselId = params.get('vessel_id') || 'unknown';
  
  console.log(`[Satellite API] Tracking vessel: ${vesselId}`);
  
  // Mock satellite data
  return {
    vessel_id: vesselId,
    timestamp: new Date().toISOString(),
    position: {
      latitude: -23.96 + (Math.random() - 0.5) * 0.1,
      longitude: -46.33 + (Math.random() - 0.5) * 0.1,
      accuracy: '±10m'
    },
    speed: Math.round(8 + Math.random() * 7),
    heading: Math.round(Math.random() * 360),
    satellite_signal: 'Strong',
    coverage: 'Full',
    next_pass: new Date(Date.now() + 3600000).toISOString()
  };
}

/**
 * AIS (Automatic Identification System) Handler (Mock)
 */
async function handleAISAPI(params: URLSearchParams) {
  const area = params.get('area') || 'Santos Port';
  
  console.log(`[AIS API] Fetching vessels in area: ${area}`);
  
  // Mock AIS data
  return {
    area,
    timestamp: new Date().toISOString(),
    vessels_detected: Math.floor(5 + Math.random() * 15),
    vessels: [
      {
        mmsi: '123456789',
        name: 'MV EXAMPLE',
        type: 'Cargo',
        position: { lat: -23.96, lon: -46.33 },
        speed: 12,
        heading: 180,
        status: 'Under way using engine'
      },
      {
        mmsi: '987654321',
        name: 'PSV NAUTILUS',
        type: 'Platform Supply Vessel',
        position: { lat: -23.97, lon: -46.32 },
        speed: 8,
        heading: 90,
        status: 'Engaged in DP operations'
      }
    ],
    warnings: [],
    traffic_density: 'Moderate'
  };
}

/**
 * Logistics API Handler (Mock)
 */
async function handleLogisticsAPI(body: any) {
  const { operation, data } = body || {};
  
  console.log(`[Logistics API] Operation: ${operation}`);
  
  switch (operation) {
    case 'track_cargo':
      return {
        cargo_id: data?.cargo_id || 'unknown',
        status: 'In Transit',
        location: 'Santos Port',
        estimated_arrival: new Date(Date.now() + 86400000).toISOString(),
        customs_cleared: false
      };
    
    case 'port_schedule':
      return {
        port: data?.port || 'Santos',
        berths_available: 3,
        next_available: new Date(Date.now() + 7200000).toISOString(),
        current_vessels: 12,
        capacity: 15
      };
    
    default:
      return { error: 'Unknown logistics operation' };
  }
}

/**
 * Log external request to Supabase
 */
async function logExternalRequest(supabase: any, logData: any) {
  try {
    // Create a simple log entry (table might not exist yet)
    await supabase.from('ai_insights').insert({
      user_id: logData.user_id || '00000000-0000-0000-0000-000000000000',
      title: `API Gateway: ${logData.endpoint}`,
      description: `External API call to ${logData.endpoint}`,
      category: 'external_api',
      priority: 'low',
      confidence: 1.0,
      metadata: {
        ...logData.metadata,
        method: logData.method,
        status: logData.status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API Gateway] Failed to log request:', error);
    // Don't fail the main request if logging fails
  }
}
