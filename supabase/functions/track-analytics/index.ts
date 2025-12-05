/**
 * Analytics Tracking Edge Function
 * PATCH 833: Server-side analytics tracking
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  properties?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  timestamp?: string;
}

interface BatchAnalyticsRequest {
  events: AnalyticsEvent[];
  metadata?: {
    session_id?: string;
    device_type?: string;
    browser?: string;
    os?: string;
    country_code?: string;
    city?: string;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';

    const body: BatchAnalyticsRequest = await req.json();
    const { events, metadata } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Events array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size
    const limitedEvents = events.slice(0, 100);

    // Prepare events for insertion
    const eventsToInsert = limitedEvents.map((event) => ({
      event_name: event.event_name,
      event_category: event.event_category || 'general',
      properties: event.properties || {},
      user_id: event.user_id || null,
      session_id: event.session_id || metadata?.session_id || null,
      page_url: event.page_url || null,
      referrer: event.referrer || null,
      user_agent: event.user_agent || userAgent,
      ip_address: clientIP,
      device_type: metadata?.device_type || detectDeviceType(userAgent),
      browser: metadata?.browser || detectBrowser(userAgent),
      os: metadata?.os || detectOS(userAgent),
      country_code: metadata?.country_code || null,
      city: metadata?.city || null,
      timestamp: event.timestamp || new Date().toISOString(),
    }));

    // Insert events
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert)
      .select('id');

    if (error) {
      console.error('[Analytics] Insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track events', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Analytics] Tracked ${eventsToInsert.length} events`);

    return new Response(
      JSON.stringify({
        success: true,
        tracked: eventsToInsert.length,
        ids: data?.map((d: { id: string }) => d.id) || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[Analytics] Error:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function detectDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/edge/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  return 'Unknown';
}

function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}
