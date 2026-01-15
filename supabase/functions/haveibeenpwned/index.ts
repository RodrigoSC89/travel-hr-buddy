import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HIBP_API_KEY = Deno.env.get('HIBP_API_KEY');
const HIBP_BASE_URL = 'https://haveibeenpwned.com/api/v3';

interface HIBPRequest {
  action: 'breach-account' | 'breaches' | 'breach' | 'paste-account' | 'password';
  email?: string;
  password?: string;
  domain?: string;
  breachName?: string;
  truncate?: boolean;
}

/**
 * HaveIBeenPwned API Integration
 * Provides breach detection, password checking, and credential leak monitoring
 * Critical for user security and compliance
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: HIBPRequest = await req.json();
    console.log(`[HIBP] ${request.action} request`);

    // Password check uses a different API (Pwned Passwords) that doesn't require API key
    if (request.action === 'password') {
      return await checkPassword(request.password);
    }

    // Other endpoints require API key
    if (!HIBP_API_KEY) {
      console.error('[HIBP] API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'HIBP API key not configured',
          source: 'haveibeenpwned',
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let url = '';
    const headers: HeadersInit = {
      'hibp-api-key': HIBP_API_KEY,
      'User-Agent': 'NautiOne-SecurityMonitor',
    };

    switch (request.action) {
      case 'breach-account':
        // Check if email has been in any breaches
        if (!request.email) throw new Error('Email required for breach check');
        const encodedEmail = encodeURIComponent(request.email);
        url = `${HIBP_BASE_URL}/breachedaccount/${encodedEmail}?truncateResponse=${request.truncate ?? true}`;
        break;

      case 'breaches':
        // Get all breaches (optionally filtered by domain)
        url = `${HIBP_BASE_URL}/breaches`;
        if (request.domain) {
          url += `?domain=${encodeURIComponent(request.domain)}`;
        }
        break;

      case 'breach':
        // Get details of a specific breach
        if (!request.breachName) throw new Error('Breach name required');
        url = `${HIBP_BASE_URL}/breach/${encodeURIComponent(request.breachName)}`;
        break;

      case 'paste-account':
        // Check if email has been in any pastes
        if (!request.email) throw new Error('Email required for paste check');
        url = `${HIBP_BASE_URL}/pasteaccount/${encodeURIComponent(request.email)}`;
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    console.log(`[HIBP] Fetching: ${request.action}`);
    const response = await fetch(url, { headers });

    // Handle 404 - account not found in breaches (this is good!)
    if (response.status === 404) {
      console.log(`[HIBP] No breaches found for ${request.action}`);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            found: false,
            breaches: [],
            message: 'No breaches found',
          },
          source: 'haveibeenpwned',
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HIBP] API error: ${response.status} - ${errorText}`);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'HIBP API authentication failed',
            source: 'haveibeenpwned',
            timestamp: new Date().toISOString(),
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'HIBP API rate limit exceeded',
            source: 'haveibeenpwned',
            timestamp: new Date().toISOString(),
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`HIBP API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[HIBP] Success - action: ${request.action}`);

    const transformedData = transformHIBPData(data, request.action);

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        raw: data,
        source: 'haveibeenpwned',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[HIBP] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'haveibeenpwned',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Check if password has been compromised using k-Anonymity API
 * This is free and doesn't require API key
 */
async function checkPassword(password?: string): Promise<Response> {
  if (!password) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Password required for check',
        source: 'haveibeenpwned',
        timestamp: new Date().toISOString(),
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Hash the password with SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Use k-Anonymity: send only first 5 chars of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'NautilusOne-SecurityMonitor' },
    });

    if (!response.ok) {
      throw new Error(`Password API error: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Search for our suffix in the returned hashes
    let count = 0;
    for (const line of lines) {
      const [hashSuffix, occurrences] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        count = parseInt(occurrences.trim(), 10);
        break;
      }
    }

    console.log(`[HIBP] Password check - found ${count} occurrences`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          compromised: count > 0,
          occurrences: count,
          severity: count === 0 ? 'safe' : count < 100 ? 'moderate' : count < 10000 ? 'high' : 'critical',
          recommendation: count === 0 
            ? 'Password not found in known breaches'
            : `Password found in ${count} data breaches. Change immediately!`,
        },
        source: 'haveibeenpwned',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[HIBP] Password check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'haveibeenpwned',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

function transformHIBPData(data: unknown, action: string): unknown {
  if (!data) return { found: false, breaches: [] };

  switch (action) {
    case 'breach-account':
    case 'paste-account':
      const breaches = Array.isArray(data) ? data : [data];
      return {
        found: true,
        count: breaches.length,
        breaches: breaches.map((breach: Record<string, unknown>) => ({
          name: breach.Name,
          title: breach.Title,
          domain: breach.Domain,
          breachDate: breach.BreachDate,
          addedDate: breach.AddedDate,
          pwnCount: breach.PwnCount,
          description: breach.Description,
          dataClasses: breach.DataClasses,
          isVerified: breach.IsVerified,
          isSensitive: breach.IsSensitive,
          isRetired: breach.IsRetired,
          isSpamList: breach.IsSpamList,
        })),
        severity: calculateBreachSeverity(breaches),
      };

    case 'breaches':
    case 'breach':
      return Array.isArray(data) 
        ? data.map((b: Record<string, unknown>) => transformBreach(b))
        : transformBreach(data as Record<string, unknown>);

    default:
      return data;
  }
}

function transformBreach(breach: Record<string, unknown>): Record<string, unknown> {
  return {
    name: breach.Name,
    title: breach.Title,
    domain: breach.Domain,
    breachDate: breach.BreachDate,
    addedDate: breach.AddedDate,
    modifiedDate: breach.ModifiedDate,
    pwnCount: breach.PwnCount,
    description: breach.Description,
    logoPath: breach.LogoPath,
    dataClasses: breach.DataClasses,
    isVerified: breach.IsVerified,
    isFabricated: breach.IsFabricated,
    isSensitive: breach.IsSensitive,
    isRetired: breach.IsRetired,
    isSpamList: breach.IsSpamList,
    isMalware: breach.IsMalware,
    isSubscriptionFree: breach.IsSubscriptionFree,
  };
}

function calculateBreachSeverity(breaches: Record<string, unknown>[]): string {
  if (breaches.length === 0) return 'none';
  
  const hasPasswords = breaches.some(b => 
    (b.DataClasses as string[] || []).some((dc: string) => 
      dc.toLowerCase().includes('password')
    )
  );
  
  const hasSensitive = breaches.some(b => b.IsSensitive);
  const hasRecent = breaches.some(b => {
    const date = new Date(b.BreachDate as string);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date > oneYearAgo;
  });

  if (hasPasswords && hasRecent) return 'critical';
  if (hasPasswords || hasSensitive) return 'high';
  if (breaches.length > 3) return 'moderate';
  return 'low';
}
