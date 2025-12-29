import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHODAN_API_KEY = Deno.env.get('SHODAN_API_KEY');
const SHODAN_BASE_URL = 'https://api.shodan.io';

interface ShodanRequest {
  action: 'host' | 'search' | 'scan' | 'dns' | 'exploits';
  ip?: string;
  query?: string;
  hostname?: string;
  ips?: string[];
}

/**
 * Shodan Security API Integration
 * Provides network device scanning, vulnerability detection, and security monitoring
 * Critical for maritime IoT and vessel network security
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SHODAN_API_KEY) {
      console.error('[Shodan] API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Shodan API key not configured',
          source: 'shodan',
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: ShodanRequest = await req.json();
    console.log(`[Shodan] ${request.action} request`);

    let url = '';
    let options: RequestInit = { method: 'GET' };

    switch (request.action) {
      case 'host':
        // Get information about a specific IP
        if (!request.ip) throw new Error('IP address required for host lookup');
        url = `${SHODAN_BASE_URL}/shodan/host/${request.ip}?key=${SHODAN_API_KEY}`;
        break;

      case 'search':
        // Search Shodan for devices matching query
        if (!request.query) throw new Error('Query required for search');
        const searchQuery = encodeURIComponent(request.query);
        url = `${SHODAN_BASE_URL}/shodan/host/search?key=${SHODAN_API_KEY}&query=${searchQuery}`;
        break;

      case 'scan':
        // Initiate a scan of IPs (requires paid plan)
        if (!request.ips || request.ips.length === 0) throw new Error('IPs required for scan');
        url = `${SHODAN_BASE_URL}/shodan/scan?key=${SHODAN_API_KEY}`;
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `ips=${request.ips.join(',')}`,
        };
        break;

      case 'dns':
        // DNS lookup
        if (!request.hostname) throw new Error('Hostname required for DNS lookup');
        url = `${SHODAN_BASE_URL}/dns/resolve?key=${SHODAN_API_KEY}&hostnames=${request.hostname}`;
        break;

      case 'exploits':
        // Search for known exploits
        if (!request.query) throw new Error('Query required for exploit search');
        const exploitQuery = encodeURIComponent(request.query);
        url = `${SHODAN_BASE_URL}/shodan/exploits/search?key=${SHODAN_API_KEY}&query=${exploitQuery}`;
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    console.log(`[Shodan] Fetching: ${request.action}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Shodan] API error: ${response.status} - ${errorText}`);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Shodan API authentication failed',
            source: 'shodan',
            timestamp: new Date().toISOString(),
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Shodan API requires paid plan for this operation',
            source: 'shodan',
            timestamp: new Date().toISOString(),
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Shodan API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Shodan] Success - action: ${request.action}`);

    const transformedData = transformShodanData(data, request.action);

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        raw: data,
        source: 'shodan',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Shodan] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'shodan',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function transformShodanData(data: Record<string, unknown>, action: string): unknown {
  switch (action) {
    case 'host':
      return {
        ip: data.ip_str,
        hostnames: data.hostnames || [],
        city: data.city,
        country: data.country_name,
        isp: data.isp,
        org: data.org,
        os: data.os,
        ports: data.ports || [],
        vulns: data.vulns || [],
        lastUpdate: data.last_update,
        services: Array.isArray(data.data) ? (data.data as Record<string, unknown>[]).map((service) => ({
          port: service.port,
          protocol: service.transport,
          product: service.product,
          version: service.version,
          banner: service.data ? String(service.data).substring(0, 200) : null,
        })) : [],
        riskScore: calculateRiskScore(data),
      };

    case 'search':
      return {
        total: data.total,
        matches: Array.isArray(data.matches) ? (data.matches as Record<string, unknown>[]).map((match) => ({
          ip: match.ip_str,
          port: match.port,
          org: match.org,
          country: match.location ? (match.location as Record<string, unknown>).country_name : null,
          product: match.product,
          vulns: match.vulns || [],
        })) : [],
      };

    case 'exploits':
      return {
        total: data.total,
        exploits: Array.isArray(data.matches) ? (data.matches as Record<string, unknown>[]).map((exploit) => ({
          id: exploit._id,
          description: exploit.description,
          cve: exploit.cve || [],
          source: exploit.source,
          type: exploit.type,
        })) : [],
      };

    default:
      return data;
  }
}

function calculateRiskScore(hostData: Record<string, unknown>): number {
  let score = 0;

  // Vulnerabilities (high weight)
  const vulns = hostData.vulns as string[] | undefined;
  if (vulns && vulns.length > 0) {
    score += Math.min(vulns.length * 15, 50);
  }

  // Open ports (medium weight)
  const ports = hostData.ports as number[] | undefined;
  if (ports) {
    const riskyPorts = [21, 22, 23, 25, 110, 143, 445, 3389, 5900];
    const openRiskyPorts = ports.filter(p => riskyPorts.includes(p));
    score += openRiskyPorts.length * 5;
  }

  // Services without authentication
  const data = hostData.data as Record<string, unknown>[] | undefined;
  if (data) {
    data.forEach((service) => {
      if (service.product === 'Anonymous FTP' || 
          String(service.data || '').toLowerCase().includes('anonymous')) {
        score += 10;
      }
    });
  }

  return Math.min(score, 100);
}
