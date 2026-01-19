import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');
    const longitude = url.searchParams.get('longitude');
    const latitude = url.searchParams.get('latitude');
    const type = url.searchParams.get('type') || 'forward'; // forward or reverse

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      return errorResponse('Mapbox token not configured', 500);
    }

    let geocodingUrl: string;

    if (type === 'reverse' && longitude && latitude) {
      geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`;
    } else if (query) {
      geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=place,address,poi`;
    } else {
      return errorResponse('Query or coordinates are required', 400);
    }

    const response = await fetch(geocodingUrl);

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'mapbox-geocoding', 'Mapbox API error', { error: errorText });
      return errorResponse('Geocoding service error', 500);
    }

    const data = await response.json();

    const results = data.features.map((feature: { 
      place_name: string; 
      center: [number, number]; 
      place_type: string[];
      context?: Array<{ id: string; text: string }>;
    }) => ({
      place_name: feature.place_name,
      coordinates: {
        longitude: feature.center[0],
        latitude: feature.center[1]
      },
      type: feature.place_type[0],
      context: feature.context
    }));

    log('info', 'mapbox-geocoding', 'Geocoding completed', { resultsCount: results.length });
    return jsonResponse({ success: true, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'mapbox-geocoding', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
