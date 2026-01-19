import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const { origin, destination, waypoints, profile } = await req.json();

    if (!origin || !destination) {
      return errorResponse('Origin and destination coordinates are required', 400);
    }

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      return errorResponse('Mapbox token not configured', 500);
    }

    // Build coordinates string
    let coordinates = `${origin.longitude},${origin.latitude}`;
    
    if (waypoints && Array.isArray(waypoints)) {
      for (const wp of waypoints) {
        coordinates += `;${wp.longitude},${wp.latitude}`;
      }
    }
    
    coordinates += `;${destination.longitude},${destination.latitude}`;

    const routeProfile = profile || 'driving';
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${routeProfile}/${coordinates}?access_token=${mapboxToken}&geometries=geojson&overview=full&steps=true`;

    const response = await fetch(directionsUrl);

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'mapbox-directions', 'Mapbox API error', { error: errorText });
      return errorResponse('Directions service error', 500);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return errorResponse('No route found', 404);
    }

    const route = data.routes[0];
    const result = {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry,
      legs: route.legs.map((leg: { 
        distance: number; 
        duration: number; 
        summary: string;
        steps: Array<{ 
          distance: number; 
          duration: number; 
          instruction: string; 
          name: string 
        }>;
      }) => ({
        distance: leg.distance,
        duration: leg.duration,
        summary: leg.summary,
        steps: leg.steps.map(step => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.instruction,
          name: step.name
        }))
      }))
    };

    log('info', 'mapbox-directions', 'Directions calculated', { 
      distance: result.distance, 
      duration: result.duration 
    });
    return jsonResponse({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'mapbox-directions', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
