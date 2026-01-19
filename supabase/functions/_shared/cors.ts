/**
 * CORS Headers - Shared utility for all Edge Functions
 * @module _shared/cors
 */

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight OPTIONS request
 */
export function handleCORS(): Response {
  return new Response('ok', { headers: corsHeaders });
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create error response with CORS headers
 */
export function errorResponse(message: string, status = 400, code = 'ERROR'): Response {
  return new Response(
    JSON.stringify({ error: message, code, timestamp: new Date().toISOString() }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
